import Loger from '@/components/Loger';
import { categoryMembers, pageSource, compare } from '@/utils/api';
import { splitList } from '@/utils/string';
import './index.less';

$(() => (async () => {
  if (mw.config.get('wgPageName') !== 'Special:MassEdit') {
    await mw.loader.using('mediawiki.util');
    mw.util.addPortletLink('p-tb', '/Special:MassEdit', '批量编辑', 't-massedit');
    return;
  }
  await mw.loader.using(['mediawiki.api', 'oojs-ui']);
  const api = new mw.Api();

  /** 当前状态，等待中、获取源代码中、编辑中 */
  let action: ('waiting' | 'getting' | 'editing') = 'waiting';

  /** 是否被终止 */
  let stopped = false;

  /** 定时器id */
  let timeout: NodeJS.Timeout;

  const loger = new Loger([
    {
      name: 'success',
      icon: '✓',
      color: '#333',
      text: '已完成',
    },
    {
      name: 'nochange',
      icon: '○',
      color: '#888',
      text: '无变化',
    },
    {
      name: 'warn',
      icon: '!',
      color: '#f28500',
      text: '警告',
    },
    {
      name: 'error',
      icon: '✕',
      color: '#eb3941',
      text: '出错',
    },
  ], 'massedit-log', 'h5');
  mw.loader.load('/index.php?title=User:Nzh21/js/QuickDiff.js&action=raw&ctype=text/javascript');
  mw.loader.load(`${mw.config.get('wgLoadScript')}?debug=false&modules=mediawiki.diff.styles&only=styles`, 'text/css');

  /**
   * 在Special:MassEdit构建页面
   */
  mw.config.set('wgCanonicalSpecialPageName', 'MassEdit');
  document.title = '批量编辑 - 萌娘百科_万物皆可萌的百科全书';
  $('.mw-invalidspecialpage').removeClass('mw-invalidspecialpage');
  $('#firstHeading').html('批量编辑页面<div>By <a href="/User:BearBin">BearBin</a></div>');
  $('#contentSub').remove();

  /** “原文字”输入框 */
  const $editFromBox = $('<textarea name="me-edit-from" rows="4"/>') as JQuery<HTMLTextAreaElement>;
  /** “替换为”输入框 */
  const $changeToBox = $('<textarea name="me-change-to" rows="4"/>') as JQuery<HTMLTextAreaElement>;
  /** 页面列表 */
  const $pageListBox = $('<textarea name="me-page-list" rows="12"/>') as JQuery<HTMLTextAreaElement>;
  /** 分类列表 */
  const $categoryListBox = $('<textarea name="me-category-list" rows="12"/>') as JQuery<HTMLTextAreaElement>;

  const regexSelect = new OO.ui.CheckboxInputWidget({
    id: 'me-regex-box',
  });
  const regexField = new OO.ui.FieldLayout(regexSelect, {
    label: '使用正则表达式',
    align: 'inline',
  });
  const regexHelp = new OO.ui.ButtonWidget({
    label: '常用正则',
    icon: 'help',
  });
  const submitButton = new OO.ui.ButtonWidget({
    label: '提交',
    flags: [
      'primary',
      'progressive',
    ],
    icon: 'check',
  });
  const stopButton = new OO.ui.ButtonWidget({
    label: '终止',
    flags: [
      'primary',
      'destructive',
    ],
    icon: 'close',
  });

  const intervalBox = new OO.ui.TextInputWidget({
    type: 'number',
    placeholder: '编辑间隔',
    id: 'me-interval',
  });

  const summaryBox = new OO.ui.TextInputWidget({
    placeholder: '附加摘要',
    id: 'me-summary',
  });

  const previewButton = new OO.ui.ButtonWidget({
    label: '预览',
    icon: 'search',
    disabled: true,
  });
  const previewTitleBox = new OO.ui.TextInputWidget({
    placeholder: '要应用本编辑的页面',
  }).on('change', (value) => {
    if (value?.length) {
      previewButton.setDisabled(false);
    } else {
      previewButton.setDisabled(true);
    }
  });

  /** 重试次数 */
  const retryTimesBox = new OO.ui.TextInputWidget({
    type: 'number',
    placeholder: '0',
    id: 'me-retry-times',
    disabled: true,
  });
  /** 是否重试 */
  const retrySelect = new OO.ui.CheckboxInputWidget();
  const retryField = new OO.ui.FieldLayout(retrySelect.on('change', () => {
    retryTimesBox.setDisabled(!retrySelect.isSelected()); // 点击时切换重试次数输入框的可用性
  }), {
    label: '因网络问题出错时，重试至多',
    align: 'inline',
    id: 'me-use-retry',
  });

  $('#mw-content-text').empty().append(
    '<h5>原文字：</h5>',
    $editFromBox,
    '<h5>替换为：</h5>',
    $changeToBox,
    $('<div id="me-regex"/>').append(
      regexField.$element,
      regexHelp.$element,
    ),
    $('<ul/>').append(
      '<li>正则表达式须使用斜线包裹（如<code>/regex/g</code>），且<code>g</code>为必须，否则无法被js解析。</li>',
      '<li>替换后文本若有换行请直接敲回车，不要用<code>\\n</code>。</li>',
    ),
    $('<div id="me-page-lists"/>').append(
      $('<div/>').append(
        '<h5>页面</h5>',
        $pageListBox,
      ),
      $('<div/>').append(
        '<h5>分类</h5>',
        $categoryListBox,
      ),
    ),
    $('<div id="me-pages-note"/>').append(
      '输入要编辑的页面或分类，',
      '<u>每行一个</u>',
      '；分类栏请带上 分类/Category/Cat 等能被系统识别的分类名字空间前缀。',
    ),
    $('<div id="me-edit-panel" class="me-panel"/>').append(
      submitButton.$element,
      stopButton.$element.hide(), // 默认隐藏停止按钮、显示提交按钮
      intervalBox.$element,
      summaryBox.$element,
    ),
    $('<div id="me-preview-panel" class="me-panel"/>').append(
      previewButton.$element,
      previewTitleBox.$element,
    ),
    $('<div id="me-retry"/>').append(
      retryField.$element,
      retryTimesBox.$element,
      '次',
    ),
    $('<ul/>').append(
      '<li>编辑间隔单位为秒（s），不填默认为20s。不包含本身编辑页面所用的时间。</li>',
      $('<li/>').append(
        '<b>请注意<a target="_blank" href="/萌娘百科:机器用户">机器用户方针</a>所规定速率</b>',
        '和',
        '<a target="_blank" href="/api.php?action=query&meta=userinfo&uiprop=ratelimits">ratelimit限制</a>',
        '并自行设置间隔，或申请机器用户权限。',
      ),
    ),
    loger.element,
    $('<ul/>').append(
      '<li>报错“http”不一定是编辑失败，可能实际已提交但等待成功信息过久而判定超时。</li>',
    ),
  );

  /**
   * 实现sleep效果，使用时需要加上await
   *
   * @param {number} time 等待时间（ms）
   * @returns {Promise<void>}
   */
  const waitInterval = (time: number): Promise<void> => {
    return new Promise((resolve) => timeout = setTimeout(resolve, time));
  };

  /** 设置页面不可交互 */
  const setActionDisabled = () => {
    submitButton.setDisabled(true).$element.hide();
    stopButton.setDisabled(false).$element.show();
    $('#mw-content-text input, #mw-content-text textarea').prop('disabled', true);
    window.onbeforeunload = () => true;
  };

  /** 设置页面可交互 */
  const setActionEnable = () => {
    action = 'waiting';
    clearTimeout(timeout);
    stopButton.setDisabled(true).$element.hide();
    submitButton.setDisabled(false).$element.show();
    $('#mw-content-text input, #mw-content-text textarea').prop('disabled', false);
    window.onbeforeunload = () => null;
  };

  /**
   * 获取分类列表内的页面
   *
   * @param categories 分类列表
   * @returns 分类内的页面
   */
  const getPagesFromCats = async (categories: string[]): Promise<string[]> => {
    const pageList: string[] = [];
    const promises = categories.map(async (category) => {
      // 有api权限的用户通过API获取，无权限用户通过ajax获取
      try {
        const members = await categoryMembers(category);
        if (members.length > 0) {
          loger.record(`获取到【<a href="/${category}" target="_blank">${category}</a>】内的页面${members.length}个。`, 'normal');
          pageList.push(...members);
        } else {
          loger.record(`【${category}】内没有页面。`, 'warn');
        }
      } catch (error) {
        let message = '';
        switch (error) {
          case 'http':
            message = '网络连接出错';
            break;
          default:
            message = error as string;
        }
        loger.record(`获取【${category}】内的页面出错：${message}。`, 'error');
      }
    });
    await Promise.all(promises);
    return pageList;
  };

  /**
   * 根据用户输入获取最终要编辑的页面列表
   *
   * @returns 得到的页面列表
   */
  const getPageList = async (): Promise<string[]> => {
    const pageSet = new Set([
      ...splitList($pageListBox.val() || ''),
      ...await getPagesFromCats(splitList($categoryListBox.val() || '')),
    ]);
    return [...pageSet];
  };

  /**
   * 按照选择情况解析正则表达式或输出原字符串
   * @param editFrom 输入的正则表达式或字符串
   * @param isRegex 是否勾选解析
   * @returns
   */
  const solveRegex = (editFrom: string, isRegex: boolean): string | RegExp | undefined => {
    let output: string | RegExp = editFrom;
    if (isRegex) {
      try {
        const parts = editFrom.match(/^\/(.*)\/([gimsuy]*)$/);
        if (!parts) {
          loger.record('正则表达式格式有误。', 'warn');
          return '';
        }
        const [_, pattern, flags] = parts;
        if (!flags.includes('g')) {
          loger.record('正则表达式必须包含全局匹配(g)修饰符。', 'warn');
          return '';
        }
        output = new RegExp(pattern, flags);
      } catch (err) {
        loger.record(`正则表达式解析失败：${err}`, 'error');
        return;
      }
    }
    return output;
  };

  /**
   * 预览差异
   * @param title 页面标题
   * @param editFrom
   * @param changeTo
   * @returns
   */
  const preview = async (title: string, editFrom: string | RegExp, changeTo?: string): Promise<string | undefined> => {
    previewButton.setDisabled(true);
    loger.record('正在获取预览……');
    try {
      const fromtext = await pageSource(title);
      if (!fromtext) {
        loger.record(`获取${title}当前内容出错。`, 'error');
        return;
      }
      const totext = fromtext.replaceAll(editFrom, changeTo!);
      const diff = await compare(fromtext, totext, true);
      OO.ui.alert($(diff), {
        title: $(`<span>预览<b>【${title}】</b>的更改</span>`),
        size: 'larger',
      });
    } catch (err) {
      loger.record(`预览出错：${err}。`, 'error');
    }
    previewButton.setDisabled(false);
  };

  /**
   * 根据替换规则对指定页面进行编辑
   *
   * @param title 页面标题
   * @param summary 编辑摘要
   * @param editFrom 原文字
   * @param changeTo 替换为
   * @returns 编辑结果，success/nochange/failed
   */
  const editAction = async (title: string, summary: string, editFrom: string | RegExp, changeTo: string): Promise<'nochange' | 'success' | 'failed'> => {
    const retry = retrySelect.isSelected();
    let retreyTimes = 0;
    const maxRetryCount = +retryTimesBox.getValue();
    const pageLink = `<a href="/${title}" target="_blank">${title}</a>`;
    do {
      try {
        action = 'getting';
        const source = await pageSource(title); // 获取源代码并进行替换
        const replacedSource = source!.replaceAll(editFrom, changeTo);
        if (source === replacedSource) {
          loger.record(`【${pageLink}】编辑前后无变化。`, 'nochange');
          return 'nochange';
        }
        if (stopped) {
          return 'failed';
        }
        action = 'editing';
        const editResult = await api.postWithToken('csrf', {
          format: 'json',
          action: 'edit',
          watchlist: 'nochange',
          tags: 'Bot',
          bot: true,
          minor: true,
          nocreate: true,
          title,
          text: replacedSource,
          summary: `[[U:BearBin/js#MassEdit|MassEdit]]：【${editFrom.toString().replace(/\n/g, '↵')}】→【${changeTo.replace(/\n/g, '↵')}】${summary && `：${summary}`}`,
        });
        action = 'waiting';
        if (editResult?.edit?.result === 'Success') {
          loger.record(`【<a href="/_?diff=${editResult.edit.newrevid}" target="_blank">${title}</a>】编辑完成。`, 'success');
          return 'success';
        } else if (editResult?.edit?.abusefilter) {
          loger.record(`【${pageLink}】编辑失败：被滥用过滤器${editResult.edit.abusefilter.id}阻止。过滤器描述：${editResult.edit.abusefilter.description}。`, 'error');
          return 'failed';
        }
        loger.record(`【${pageLink}】编辑失败，请将以下内容告知<a href="/User_talk:BearBin" target="_blank">BearBin</a>：${JSON.stringify(editResult)}`, 'error');
        return 'failed';
      } catch (err) {
        let errorMessage = '';
        switch (err) {
          case 'missingtitle':
            errorMessage = '页面不存在';
            break;
          case 'http':
            retreyTimes++;
            errorMessage = retry && retreyTimes <= maxRetryCount ? `网络连接出错，正在重试（${retreyTimes}/${maxRetryCount}）` : '网络连接出错';
            break;
          case 'protectedpage':
            errorMessage = '页面被保护';
            break;
          default:
            errorMessage = err as string;
        }
        loger.record(`编辑【<a href="/${title}?action=history" target="_blank">${title}</a>】时出现错误：${errorMessage}。`, 'error');
        if (!retry || err !== 'http') {
          return 'failed';
        }
      }
    } while (retreyTimes <= maxRetryCount);
    return 'failed';
  };

  // 点击提交按钮
  submitButton.on('click', async () => {
    // 检查输入
    if (!$editFromBox.val()) {
      loger.record('请输入要替换的原文字。', 'warn');
      return;
    } else if (!$pageListBox.val() && !$categoryListBox.val()) {
      loger.record('请输入要编辑的页面或分类。', 'warn');
      return;
    }
    const confirmText = $('<p>请确认您的编辑内容。若因输入不当而产生错误，请自行<ruby>承担后果<rp>(</rp><rt>料理后事</rt><rp>)</rp></ruby>。</p>');
    const confirm = await OO.ui.confirm(confirmText, {
      title: '提醒',
      size: 'small',
    });
    if (confirm) {
      const additionalSummary = summaryBox.getValue();
      const interval = +(intervalBox.getValue() === '' ? 20 : intervalBox.getValue()) * 1000;
      const editFrom = solveRegex($editFromBox.val()!, regexSelect.isSelected());
      const changeTo = $changeToBox.val()!;
      if (!editFrom) {
        return;
      }
      setActionDisabled();
      await getPageList().then(async (result) => {
        let complete = 0;
        const { length } = result;
        loger.record(`共${length}个页面，即将开始编辑……`, 'normal');
        for (const item of result) {
          const editResult = await editAction(item, additionalSummary, editFrom, changeTo);
          complete++;
          if (stopped) {
            // 被终止
            break;
          }
          if (editResult === 'success' && interval !== 0 && complete < length) {
            await waitInterval(interval);
          }
        }
        if (stopped) {
          stopped = false;
          loger.record('编辑终止。', 'normal');
        } else {
          loger.record('编辑完毕。', 'normal');
        }
        setActionEnable();
      });
      setActionEnable();
    }
  });

  /**
   * 点击终止按钮。
   *
   * 终止逻辑：
   * 1. 若处于等待或读取源代码状态，标记终止以使请求循环在下次请求中打断，同时恢复页面可交互。
   * 2. 若处于等待编辑请求响应状态，标记终止，等待当前请求完毕后恢复页面可交互。
   */
  stopButton.on('click', () => {
    stopButton.setDisabled(true);
    switch (action) {
      case 'waiting':
        // 等待中，无需过多操作直接恢复交互
        stopped = false;
        setActionEnable();
        loger.record('编辑终止。', 'normal');
        break;
      case 'getting':
        // 正在获取源代码，标记被终止并回复交互
        stopped = true;
        setActionEnable();
        break;
      case 'editing':
        // 正在编辑请求中，等待响应
        stopped = true;
        break;
    }
  });

  // 点击预览按钮
  previewButton.on('click', () => {
    const editFrom = $editFromBox.val();
    if (!editFrom) {
      loger.record('请输入要替换的原文字。', 'warn');
      return;
    }
    const solvedEditFrom = solveRegex(editFrom, regexSelect.isSelected());
    if (!solvedEditFrom) {
      return;
    }
    preview(
      previewTitleBox.getValue(),
      solvedEditFrom,
      $changeToBox.val(),
    );
  });

  // 正则帮助
  const regexHelpText = $('<ul id="me-regex-help-list"/>').append(
    `<li><code>${/\[\[(?:Category|Cat|分[类類]):分类名(\|[^[]*)?\]\]/gi.toString()}</code>：匹配分类</li>`,
    `<li><code>${/\{\{(?:Template:|T:|[模样樣]板:)?模板名/gi.toString()}</code>：匹配模板（不含内容）</li>`,
    `<li><code>${/^.*$/gs.toString()}</code>：匹配全文（感谢鬼影）</li>`,
  );
  regexHelp.on('click', () => {
    OO.ui.alert(regexHelpText, {
      title: '常用正则表达式',
      size: 'medium',
    });
  });
})());
