/**
 * @description 将页面内容导出为可在其他站点导入的XML文件
 */

import { toXML } from 'jstoxml';
import { categoryMembers } from '@/utils/api';
import { splitList } from '@/utils/string';
import waitInterval from '@/utils/wait';
import { formatNS14 } from '@/utils/formatNS';
import { downloadStringAsFile } from '@/utils/file';
import Loger from "@/components/Loger";
import generateBaseinfo from './baseinfo';
import type { ApiParams, Revisions, ApiQueryResponse } from '@/@types/api';
import type { XmlElement } from 'jstoxml';
import './index.less';

interface Page {
  title?: string;
  ns?: string | number;
  id?: string | number;
  revisions: Revisions[];
}

const interval = 4000;

$(() => (async () => {
  if (!['Special:ExportXML', 'Special:Export', 'Special:导出页面'].includes(mw.config.get('wgPageName'))) {
    return;
  }
  await mw.loader.using(['mediawiki.api', 'oojs-ui', 'moment']);
  const api = new mw.Api();
  const loger = new Loger([
    {
      name: 'success',
      icon: '✓',
      color: '#333',
      text: '成功',
    },
    {
      name: 'error',
      icon: '✕',
      color: '#eb3941',
      text: '出错',
    },
  ], 'exportxml-log');

  /**
   * 在Special:ExportXML构建页面
   */
  mw.config.set('wgCanonicalSpecialPageName', 'ExportXML');
  document.title = '导出页面 - 萌娘百科_万物皆可萌的百科全书';
  $(document.body).addClass('bearbingadget-exportxml');
  $('.mw-invalidspecialpage').removeClass('mw-invalidspecialpage');
  $('#firstHeading').html('导出页面<div>By <a href="/User:BearBin">BearBin</a></div>');
  $('#contentSub').remove();

  /** 分类输入框 */
  const categoriesInput = new OO.ui.MultilineTextInputWidget({ rows: 5 });
  /** 页面列表输入框 */
  const pagesInput = new OO.ui.MultilineTextInputWidget({ rows: 10 });
  /** 导出执行按钮 */
  const submitButton = new OO.ui.ButtonWidget({
    label: '导出',
    flags: ['primary', 'progressive'],
    id: 'exportxml-exportbutton',
  });
  /** 是否导出历史 */
  const onlyCurrent = new OO.ui.CheckboxInputWidget({ selected: true });

  $('#mw-content-text').empty().append(
    $('<p />').append(
      '本页面用于',
      $('<a href="https://www.mediawiki.org/wiki/Help:Export/zh">导出</a>'),
      '特定页面的文本和编辑历史，导出的XML可用于在其他站点通过',
      $('<a href="/Special:Import">导入功能</a>'),
      '重新导入。',
    ),
    $('<p />').append(
      '由于萌娘百科未开放导出功能，本工具仅对其进行',
      '<b>尽可能地</b>',
      '复现，实际用时远高于MediaWiki提供的标准导出功能，且没有递归导出所使用模板的功能（理论上能做，但暂时不考虑）。',
    ),
    '<p>为了避免WAF，部分导出步骤已被刻意放缓，每两个页面需要等待约5s，在导出时请耐心等待，并请尽量避免额外的访问（如边导出边浏览或编辑）</p>',
    '<p>在下方的分类列表或页面列表输入，一行一个。对于每个分类，会获取其各自的分类和文件，不含子分类。</p>',
    '<h3>指定分类内的页面</h3>',
    categoriesInput.$element,
    '<h3>手动输入页面</h3>',
    pagesInput.$element,
    (new OO.ui.FieldLayout(
      onlyCurrent, { label: '仅包含当前修订，而不是完整历史', align: 'inline' },
    )).$element,
    submitButton.$element,
    '<h3>日志</h3>',
    loger.element,
  );

  /** 根据输入获取完整页面列表 */
  const getFullList = async () => {
    const pageList = splitList(pagesInput.getValue());
    for (const category of splitList(categoriesInput.getValue())) {
      const pagesInCat = await categoryMembers(formatNS14(category), ['page', 'file']);
      loger.record(`分类${category}下获取到${pagesInCat.length}个页面。`);
      pageList.push(...pagesInCat);
    }
    return pageList;
  };

  /** 获取一个页面的历史 */
  const getPageHistory = async (title: string, getCurrentOnly: boolean) => {
    let rvcontinue: string | undefined;
    const pageData: Page = {
      revisions: [],
    };
    do {
      const apiParams: ApiParams = {
        action: 'query',
        prop: 'revisions',
        titles: title,
        rvprop: ['content', 'ids', 'flags', 'timestamp', 'user', 'userid', 'size', 'sha1', 'contentmodel', 'comment', 'tags'],
        rvlimit: getCurrentOnly ? 1 : 'max',
        rvdir: getCurrentOnly ? 'older' : 'newer',
      };
      if (rvcontinue) {
        apiParams.rvcontinue = rvcontinue;
        await waitInterval(interval);
      }
      const response = await api.get(apiParams) as ApiQueryResponse;
      rvcontinue = response.continue?.rvcontinue;
      const [responsePageData] = Object.values(response.query.pages);
      pageData.id = responsePageData.pageid;
      pageData.ns = responsePageData.ns;
      pageData.title = responsePageData.title;
      if (responsePageData.revisions) {
        pageData.revisions.push(...responsePageData.revisions);
      }
    } while (!getCurrentOnly && rvcontinue);
    return pageData;
  };

  /** 将获取到的修订版本信息转换为XML所需格式 */
  const formatRevision = (rev: Revisions, origin?: string | number): XmlElement => ({
    revision: [
      { id: rev.revid },
      { parentid: rev.parentid },
      { timestamp: rev.timestamp },
      ...('contributorhidden' in rev ? [{
        contributor: {
          username: rev.user,
          id: rev.userid,
        },
      }] : [{
        _name: 'contributor',
        _attrs: {
          deleted: 'deleted',
        },
      }]),
      ...('minor' in rev ? [{ minor: rev.minor }] : []),
      ...('bot' in rev ? [{ bot: rev.bot }] : []),
      ...('sha1hidden' in rev ? [{ sha1hidden: rev.sha1hidden }] : []),
      ...('texthidden' in rev ? [{ texthidden: rev.texthidden }] : []),
      ...('commenthidden' in rev ? [{
        commenthidden: rev.commenthidden,
      }, {
        _name: 'comment',
        _attrs: { deleted: 'deleted' },
      }] : [{
        comment: rev.comment,
      }]),
      { origin },
      { model: rev.contentmodel },
      { format: rev.contentformat },
      {
        _name: 'text',
        _attrs: {
          bytes: rev.size,
          sha1: rev.sha1,
          'xml:space': 'preserve',
          deleted: 'deleted',
        },
        _content: rev['*'],
      },
    ],
  });

  submitButton.on('click', async () => {
    submitButton.setDisabled(true);
    const pageList = await getFullList();
    if (!pageList.length) {
      submitButton.setDisabled(false);
      return;
    }
    let exportData: XmlElement;
    /** 是否仅导出当前版本 */
    const getCurrentOnly = onlyCurrent.isSelected();
    const baseinfoRecord = loger.record('正在读取站点基本信息……');
    try {
      exportData = await generateBaseinfo();
      baseinfoRecord.remove();
      loger.record(`正在读取站点基本信息……成功。`);
    } catch (err) {
      baseinfoRecord.remove();
      loger.record(`读取站点基本信息失败：${err}`, 'error');
      submitButton.setDisabled(false);
      return;
    }
    for (const page of pageList) {
      await waitInterval(interval);
      try {
        loger.record(`正在读取页面${page}历史……`);
        const { title, ns, id, revisions } = await getPageHistory(page, getCurrentOnly);
        if (id) {
          (exportData._content as XmlElement[]).push({
            page: [
              { title },
              { ns },
              { id },
              ...revisions.map((revision) => formatRevision(revision, id)),
            ],
          });
        } else {
          loger.record(`页面${page}不存在。`, 'error');
        }
      } catch (err) {
        loger.record(`读取页面${page}历史失败：${err}，已跳过。`, 'error');
      }
    }
    loger.record('数据获取完毕，正在保存。');
    downloadStringAsFile(
      `${mw.config.get('wgSiteName')}-${moment().format('YYYYMMDDHHmmss')}.xml`,
      toXML(exportData, { indent: '  ' }),
    );
    submitButton.setDisabled(false);
  });
})());
