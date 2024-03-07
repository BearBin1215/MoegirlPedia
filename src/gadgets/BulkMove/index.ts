import Loger from '@/components/Loger';
import waitInterval from '@/utils/wait';
import './index.less';
import type { ApiMoveResponse } from '@/@types/api';

$(() => (async () => {
  if (mw.config.get('wgPageName') !== 'Special:BulkMove') {
    await mw.loader.using(['mediawiki.util']);
    mw.util.addPortletLink('p-tb', '/Special:BulkMove', '批量移动', 't-bulkmove');
    return;
  }
  await mw.loader.using(['mediawiki.api', 'oojs-ui', 'mediawiki.user']);
  const api = new mw.Api();
  const loger = new Loger();
  let rowCount = 0;

  /**
   * 在Special:BulkMove构建页面
   */
  mw.config.set('wgCanonicalSpecialPageName', 'BulkMove');
  document.title = '批量移动 - 萌娘百科_万物皆可萌的百科全书';
  $('.mw-invalidspecialpage').removeClass('mw-invalidspecialpage');
  $('#firstHeading').html('批量移动页面<div>By BearBin</div>');
  $('#contentSub').remove();

  // 页面表格
  const $table = $('<table id="bm-page-list-table">');
  // 表格内的tbody
  const $tableBody = $('<tbody>');
  // 新增行按钮
  const $addRowButton = $('<th><div class="oo-ui-icon-add" id="bm-add-row" title="新增一行"></div></th>');
  // 移动选项
  const moveTalkWidget = new OO.ui.CheckboxInputWidget({
    id: 'bm-movetalk-box',
    selected: true,
  });
  const moveTalkSelect = new OO.ui.FieldLayout(moveTalkWidget, {
    label: '移动关联的讨论页',
    align: 'inline',
  });
  const redirectWidget = new OO.ui.CheckboxInputWidget({ id: 'bm-redirect-box' });
  const noredirectSelect = new OO.ui.FieldLayout(redirectWidget, {
    label: '保留重定向',
    align: 'inline',
  });
  const watchlistWidget = new OO.ui.CheckboxInputWidget({
    id: 'bm-watchlist-box',
  });
  const watchlistSelect = new OO.ui.FieldLayout(watchlistWidget, {
    label: '监视源页面和目标页面',
    align: 'inline',
  });
  const movesubWidget = new OO.ui.CheckboxInputWidget({
    id: 'bm-watchlist-box',
  });
  const movesubSelect = new OO.ui.FieldLayout(movesubWidget, {
    label: '移动子页面',
    align: 'inline',
  });

  // 操作面板
  const submitButton = new OO.ui.ButtonWidget({
    label: '提交',
    flags: [
      'primary',
      'progressive',
    ],
    icon: 'check',
  });
  const intervalBox = new OO.ui.TextInputWidget({
    type: 'number',
    placeholder: '操作间隔',
    id: 'bm-interval',
  });
  const reasonBox = new OO.ui.TextInputWidget({
    placeholder: '附加摘要',
    id: 'bm-reason',
    name: 'wpReason',
  });

  /**
   * 添加表格行
   * @param {number} count 行数
   */
  const addRow = (count = 1) => {
    for (let i = 0; i < count; i++) {
      rowCount++;
      $tableBody.append($('<tr>')
        .append($(`<td><input type="text" data-row-no="${rowCount}" data-col-no="1" name="${rowCount}-1"></td>`))
        .append($(`<td><input type="text" data-row-no="${rowCount}" data-col-no="2" name="${rowCount}-2"></td>`))
        .append($('<td><div class="remove-row oo-ui-icon-subtract" title="删除此行"></div></td>')));
    }
  };

  $('#mw-content-text').empty().append(
    '<h3>页面列表</h3>',
    $table.append(
      $('<thead>').append(
        $('<tr>').append(
          '<th></th>',
          '<th>源页面</th>',
          '<th>目标页面</th>',
          $addRowButton,
        ),
      ),
      $tableBody,
    ),
    $('<ul class="bm-notelist">').append(
      '<li>请输入要移动的页面列表及目标页面，一一对应。</li>',
      '<li>点击右上角“+”添加一行，长按可连续添加。</li>',
      '<li>可直接从Excel复制（部分浏览器可能不支持）。粘贴时浏览器可能会需要获取权限，请注意是否有提醒。</li>',
    ),
    $('<div id="bm-option">').append(
      moveTalkSelect.$element,
      noredirectSelect.$element,
      watchlistSelect.$element,
      movesubSelect.$element,
    ),
    $('<div id="bm-submit-panel">').append(
      submitButton.$element,
      intervalBox.$element,
      reasonBox.$element,
    ),
    $('<ul class="bm-notelist">').append(
      '<li>操作间隔单位为秒（s），不填默认为0。不包含本身移动页面所用的服务器响应时间。</li>',
      '<li>请注意<a target="_blank" href="/萌娘百科:机器用户">机器用户方针</a>所规定的速率和<a target="_blank" href="/api.php?action=query&meta=userinfo&uiprop=ratelimits">ratelimit限制</a>并自行设置间隔，或申请机器用户权限。</li>',
    ),
    $(loger.element),
  );

  // 先加十行
  addRow(10);
  // 根据用户权限判断是否有权不留重定向
  mw.user.getRights().done((result) => {
    if (!result.includes('suppressredirect')) {
      redirectWidget.setSelected(true).setDisabled(true);
    }
  });

  // 点击按钮打开弹窗提示添加行
  $addRowButton.on('click', async () => {
    const addRowBox = new OO.ui.TextInputWidget({
      type: 'number',
      value: 1 as unknown as string,
    });
    const confirm = await OO.ui.confirm(addRowBox.$element, {
      title: '增加行',
    });
    if (confirm) {
      addRow(+addRowBox.getValue());
    }
  });

  // 点击按钮删除行
  $table.on('click', '.remove-row', ({ target }) => {
    rowCount--;
    $(target).closest('tr').remove();
    $tableBody.children('tr').each((i, tr) => {
      $(tr).find('input').attr('data-row-no', i + 1);
    });
  });

  // 从剪贴板粘贴
  $table.on('paste', 'input[type="text"]', (e) => {
    navigator.clipboard.readText().then((text) => {
      if (text.indexOf('\t') > -1 || text.indexOf('\n') > -1 && text.indexOf('\n') !== text.length - 1) {
        e.preventDefault();
        const rows = text.split('\n');
        const $inputs = $table.find('input[data-row-no][data-col-no]');
        for (let i = 0; i < rows.length; i++) {
          const columns = rows[i].split('\t');
          for (let j = 0; j < 2; j++) {
            if (columns[j]?.trim().length > 0) { // 经过split可能产生空字符串，要去掉
              const rowNo = i + Number($(e.target).attr('data-row-no'));
              const colNo = j + Number($(e.target).attr('data-col-no'));
              $inputs.filter(`[data-row-no="${rowNo}"][data-col-no="${colNo}"]`).val(columns[j]);
            }
          }
        }
      }
    });
  });

  // 执行体
  submitButton.on('click', async () => {
    const confirmText = $('<p>请确认您的移动是否有误。若因输入不当而产生错误，请自行<ruby><rb>承担后果</rb><rp>(</rp><rt>料理后事</rt><rp>)</rp></ruby>。</p>');
    const confirm = await OO.ui.confirm(confirmText, {
      title: '提醒',
      size: 'small',
    });
    if (confirm) {
      submitButton.setDisabled(true);
      window.onbeforeunload = () => true;
      $('#mw-content-text input, #mw-content-text textarea').prop('disabled', true);

      const movetalk = moveTalkWidget.isSelected();
      const noredirect = !redirectWidget.isSelected();
      const movesubpages = movesubWidget.isSelected();
      const watchlist = watchlistWidget.isSelected() ? 'watch' : 'unwatch';
      const reason = reasonBox.getValue().length > 0 ? `[[User:BearBin/js#批量移动页面|BulkMove]]：${reasonBox.getValue()}` : '[[User:BearBin/js#批量移动页面|BulkMove]]';
      const interval = Number(intervalBox.getValue()) * 1000;
      const tags = mw.config.get('wgUserGroups').includes('bot') ? 'bot' : 'Automation tool';
      const pageList: { from: string; to: string }[] = [];

      $tableBody.children('tr').each((_, tr) => {
        const from = $(tr).find('input')[0].value;
        const to = $(tr).find('input')[1].value;
        if (from?.length > 0 && to?.length > 0) {
          pageList.push({ from, to });
        }
      });
      if (pageList.length > 0) {
        loger.record(`共${pageList.length}个页面，即将开始移动。`);
      } else {
        loger.record('没有要移动的页面。');
      }
      for (const { from, to } of pageList) {
        try {
          const result = await api.postWithToken('csrf', {
            format: 'json',
            action: 'move',
            from,
            to,
            movetalk,
            noredirect,
            watchlist,
            movesubpages,
            reason,
            tags,
            bot: true,
          }) as ApiMoveResponse;
          if ('move' in result) {
            loger.record(`移动【<a href="/${from}${noredirect ? '' : '?redirect=no'}" class="${noredirect ? '' : 'mw-redirect'}">${from}</a>】→【<a href="/${to}">${to}</a>】成功。`, 'success');
            await waitInterval(interval);
          }
        } catch (e) {
          let errorMessage = '';
          switch (e) {
            case 'missingtitle':
              errorMessage = '源页面不存在';
              break;
            case 'articleexists':
              errorMessage = '目标页面已存在';
              break;
            case 'http':
              errorMessage = '网络连接出错';
              break;
            default:
              errorMessage = e as string;
          }
          loger.record(`移动【<a href="/${from}">${from}</a>】→【<a href="/${to}">${to}</a>】失败：${errorMessage}。`, 'error');
        }
      }
      loger.record('移动完毕。');
      submitButton.setDisabled(false);
      window.onbeforeunload = () => null;
      $('#mw-content-text input, #mw-content-text textarea').prop('disabled', false);
    }
  });
})());
