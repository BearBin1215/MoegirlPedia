import Loger from '../../components/Loger';
import './index.less';

$(() => (async () => {
  if (mw.config.get('wgPageName') !== 'Special:BatchSend') {
    await mw.loader.using(['mediawiki.util']);
    mw.util.addPortletLink('p-tb', '/Special:BatchSend', '群发提醒', 't-batchsend');
    return;
  }
  await mw.loader.using(['mediawiki.api', 'oojs-ui', 'mediawiki.user']);
  const api = new mw.Api();
  const loger = new Loger();

  /**
   * 实现sleep效果，使用时需要加上await
   * @param {number} time 等待时间（ms）
   * @returns
   */
  const waitInterval = (time) => new Promise((resolve) => setTimeout(resolve, time));

  /**
   * 解析内容
   * @param {string} sectiontitle 章节标题
   * @param {string} text 正文源代码
   * @returns HTML源代码
   */
  const preview = async (sectiontitle, text) => {
    const parseResult = await api.post({
      action: 'parse',
      uselang: mw.config.get('wgUserLanguage'),
      section: 'new',
      contentmodel: 'wikitext',
      pst: true,
      sectiontitle,
      text,
    });
    return parseResult.parse;
  };

  /**
   * 在目标用户讨论（子）页面新增章节
   *
   * 返回的sendResult对象中，sendResult.edit.result为Success/Failure
   *
   * 为Failure时，Object.keys(sendResult.edit)[0]为原因，sendResult.edit[Object.keys(sendResult.edit)[0]]为详情
   * @param {string} user 目标用户
   * @param {string} sectiontitle 新章节标题
   * @param {string} text 源代码
   * @returns 编辑结果
   */
  const send = async (title, sectiontitle, text, summary = '') => {
    const sendResult = await api.postWithToken('csrf', {
      format: 'json',
      action: 'edit',
      section: 'new',
      watchlist: 'nochange',
      tags: 'Bot',
      bot: true,
      title,
      sectiontitle,
      text,
      summary,
    });
    return sendResult;
  };

  mw.config.set('wgCanonicalSpecialPageName', 'BulkMove');
  document.title = '群发提醒 - 萌娘百科_万物皆可萌的百科全书';
  $('.mw-invalidspecialpage').removeClass('mw-invalidspecialpage');
  $('#firstHeading').html('群发讨论页消息<div>By BearBin</div>');
  $('#contentSub').remove();
  $('#mw-content-text').html([
    '<h3 id="bs-pagelist-headline">页面列表</h3>',
    '<h3 id="bs-headline-headline">标题</h3>',
    '<h3 id="bs-content-headline">正文</h3>',
    '<div id="bs-submit-panel"></div>',
    '<ul class="bearbintools-notelist">',
    '<li>发送间隔单位为秒（s），不包含本身编辑所用的服务器响应时间。</li>',
    '<li>非维护人员请注意<a target="_blank" href="/api.php?action=query&meta=userinfo&uiprop=ratelimits">ratelimit限制</a>和<a href="/萌娘百科:机器用户#其他规范">机器用户方针规定的速率</a>，自行设置间隔或申请机器用户以免撞墙或超速。</li>',
    '<li>摘要留空则会由系统自动生成。</li>',
    '</ul>',
    '<h3 id="bs-preview-headline">预览</h3>',
    '<div id="bs-previewzone"></div>',
    '<div id="bs-previewsummary">编辑摘要：<span class="comment"></span></div>',
  ].join('')).append($(loger.element));
  const pagelistBox = new OO.ui.MultilineTextInputWidget({ // 目标页面列表输入框
    validate: 'non-empty',
    placeholder: '使用换行分隔，一行一个\nUser talk前缀加不加都可以，支持发送至子页面',
    rows: 5,
    autosize: true,
    id: 'bs-pagelist',
  });
  const headlineBox = new OO.ui.TextInputWidget({
    validate: 'non-empty',
    id: 'bs-headline',
  });
  const contentBox = new OO.ui.MultilineTextInputWidget({
    validate: 'non-empty',
    rows: 10,
    autosize: true,
    id: 'bs-content',
  });
  const submitButton = new OO.ui.ButtonWidget({
    label: '提交',
    flags: [
      'primary',
      'progressive',
    ],
    icon: 'check',
    id: 'bs-submit',
  });
  const previewButton = new OO.ui.ButtonWidget({
    label: '预览',
    flags: [
      'primary',
    ],
    id: 'bs-preview',
  });
  const intervalBox = new OO.ui.TextInputWidget({
    placeholder: '发送间隔',
    id: 'bs-interval',
  });
  const summaryBox = new OO.ui.TextInputWidget({
    placeholder: '编辑摘要',
    id: 'bs-summary',
  });
  $('#bs-preview-headline, #bs-previewzone, #bs-previewsummary').hide();
  $('#bs-pagelist-headline').after(pagelistBox.$element);
  $('#bs-headline-headline').after(headlineBox.$element);
  $('#bs-content-headline').after(contentBox.$element);
  $('#bs-submit-panel').append(
    submitButton.$element,
    previewButton.$element,
    intervalBox.$element,
    summaryBox.$element,
  );

  // 监听页面列表、标题、内容栏的change事件，用户关闭页面时发出提醒
  for (const item of [pagelistBox, headlineBox, contentBox]) {
    item.on('change', () => {
      window.onbeforeunload = () => true;
    });
  }

  // 点击预览按钮，根据用户输入的标题和内容生成预览，并展示在预览区域
  previewButton.on('click', async () => {
    previewButton.setDisabled(true); // 禁用预览按钮

    $('#bs-preview-headline, #bs-previewzone, #bs-previewsummary').show();
    $('#bs-previewzone').html('<div class="oo-ui-pendingElement-pending">正在加载预览……</div>');
    const { text, parsedsummary } = await preview(headlineBox.getValue(), contentBox.getValue());
    $('#bs-previewzone').html(text['*']);
    $('#bs-previewsummary .comment').html(`（${parsedsummary['*']}）`);

    previewButton.setDisabled(false); // 恢复预览按钮使用
  });

  // 执行发送
  submitButton.on('click', async () => {
    const confirm = await OO.ui.confirm($('<p>请确认您要发送的内容是否有误。若因输入不当而产生错误，请自行<ruby><rb>承担后果</rb><rp>(</rp><rt>料理后事</rt><rp>)</rp></ruby>。</p>'), {
      title: '提醒',
      size: 'small',
    });
    if (confirm) {
      submitButton.setDisabled(true);
      previewButton.setDisabled(true);
      window.onbeforeunload = () => true;
      $('#mw-content-text input, #mw-content-text textarea').prop('disabled', true);

      const pageList = [...new Set(pagelistBox.getValue().split('\n').filter((s) => s && s.trim()))]; // 页面列表，分割、删空、去重
      const sectiontitle = headlineBox.getValue().trim(); // 章节标题
      const text = contentBox.getValue().trim(); // 文本内容
      const interval = Number(intervalBox.getValue()) * 1000; // 发送间隔
      const summary = summaryBox.getValue(); // 编辑摘要

      // 输入检查
      if (pageList.length === 0) {
        loger.record('请输入要发送的目标页面。', 'warn');
        return;
      } else if (sectiontitle.length === 0) {
        loger.record('请输入章节标题。', 'warn');
        return;
      } else if (text.length === 0) {
        loger.record('请输入内容。', 'warn');
        return;
      }

      for (const item of pageList) {
        const title = item.replace(/^ *(?:User[_ ]talk:|用[户戶][讨討][论論]:|使用者[讨討][论論]:|U:|User:|用[户戶]:)?(.*)$/i, 'User_talk:$1');
        let sendResult;
        try {
          sendResult = await send(title, sectiontitle, text, summary);
          if (sendResult.edit?.result === 'Success') {
            loger.record(`向【<a href="/${title}">${title}</a>】发送成功。`, 'success');
            await waitInterval(interval);
          } else if (sendResult.edit?.result === 'Failure') {
            loger.record(`向【<a href="/${title}" target="_blank">${title}</a>】发送失败：${Object.keys(sendResult.edit)[0]}：${sendResult.edit[Object.keys(sendResult.edit)[0]]}。`, 'error');
          }
        } catch (err) {
          loger.record(`向【<a href="/${title}">${title}</a>】发送失败：${err}。`, 'error');
        }
      }

      loger.record('发送完毕。');
      submitButton.setDisabled(false);
      previewButton.setDisabled(false);
      window.onbeforeunload = () => null;
      $('#mw-content-text input, #mw-content-text textarea').prop('disabled', false);
    }
  });
})());