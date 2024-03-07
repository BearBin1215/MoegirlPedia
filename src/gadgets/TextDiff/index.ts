import domtoimage from 'dom-to-image';
import { pageSource, compare } from '@/utils/api';
import './index.less';

$(() => (async () => {
  if (mw.config.get('wgPageName') !== 'Special:TextDiff') {
    if ('TextDiff' in window) {
      await mw.loader.using('mediawiki.util');
      mw.util.addPortletLink('p-tb', '/Special:TextDiff', '文本差异比较', 't-textdiff');
    }
    return;
  }
  await mw.loader.using(['mediawiki.api', 'oojs-ui', 'mediawiki.notification']);

  // 获取比较差异
  const textCompare = async (fromtext: string, totext: string) => {
    try {
      const res = await compare(fromtext, totext);
      return res;
    } catch (error) {
      mw.notify(`获取差异失败：${error}`, { type: 'warn' });
    }
  };

  // 获取页面源代码
  const getSource = async (title: string) => {
    try {
      return await pageSource(title);
    } catch (error) {
      mw.notify(`获取源代码失败：${error}`, { type: 'warn' });
    }
    mw.notify('获取源代码完毕');
  };

  $('#mw-notification-area').appendTo('body'); // 使提醒在窗口上层
  mw.config.set('wgCanonicalSpecialPageName', 'TextDiff');
  document.title = '差异比较 - 萌娘百科_万物皆可萌的百科全书';
  $(document.head).append(`<link rel="stylesheet" href="${mw.config.get('wgLoadScript')}?debug=false&modules=mediawiki.diff.styles&only=styles" />`);
  $('.mw-invalidspecialpage').removeClass('mw-invalidspecialpage');
  $('#firstHeading').html('差异比较<div>By BearBin</div>');
  $('#contentSub').remove();

  const fromTextBox = new OO.ui.MultilineTextInputWidget({
    rows: 10,
    maxRows: 10,
    autosize: true,
  });

  const fromPageBox = new OO.ui.TextInputWidget({
    labelPosition: 'before',
    label: '从页面',
  });

  const fromPageButton = new OO.ui.ButtonWidget({
    label: '获取源代码',
    flags: [
      'progressive',
    ],
    id: 'from-page-button',
  });

  const $getOriginSource = $('<div class="get-source-from-page"></div>').append(
    fromPageBox.$element,
    fromPageButton.$element,
  );

  const toPageBox = new OO.ui.TextInputWidget({
    labelPosition: 'before',
    label: '从页面',
  });

  const toPageButton = new OO.ui.ButtonWidget({
    label: '获取源代码',
    flags: [
      'progressive',
    ],
    id: 'from-page-button',
  });

  const $getTargetSource = $('<div class="get-source-from-page"></div>').append(
    toPageBox.$element,
    toPageButton.$element,
  );

  const toTextBox = new OO.ui.MultilineTextInputWidget({
    rows: 10,
    maxRows: 10,
    autosize: true,
  });

  const submitButton = new OO.ui.ButtonWidget({
    label: '比较',
    flags: [
      'primary',
      'progressive',
    ],
    icon: 'check',
    id: 'submit-button',
  });

  const saveButton = new OO.ui.ButtonWidget({
    label: '保存图片',
    icon: 'download',
    id: 'save-button',
  });

  const copyButton = new OO.ui.ButtonWidget({
    label: '复制到剪贴板',
    id: 'copy-button',
  });

  const $result = $('<div id="diff-result"></div>');

  const $resultAction = $('<div id="result-action"></div>').append(
    saveButton.$element,
    copyButton.$element,
  ).hide();

  $('#mw-content-text').empty().append(
    '<h3>旧版本</h3>',
    fromTextBox.$element,
    $getOriginSource,
    '<h3>新版本</h3>',
    toTextBox.$element,
    $getTargetSource,
    submitButton.$element,
    '<h3>差异</h3>',
    $result,
    $resultAction,
  );

  // 保存图片
  const saveImage = () => {
    domtoimage.toJpeg($result.get(0)!, { bgcolor: '#fff' }).then((dataUrl) => {
      const link = document.createElement('a');
      link.download = 'image.jpg';
      link.href = dataUrl;
      link.click();
    });
  };

  // 复制图片至剪贴板
  const copyImage = () => {
    domtoimage.toBlob($result.get(0)!, { bgcolor: '#fff' }).then((blob) => {
      navigator.clipboard.write([new ClipboardItem({ 'image/png': blob! })]).then(() => {
        mw.notify('复制成功');
      }, (error) => {
        mw.notify(`复制失败：${error}`, { type: 'warn' });
      });
    });
  };

  // 通过页面获取源代码按钮
  fromPageButton.on('click', async () => {
    const source = await getSource(fromPageBox.getValue());
    if (source) {
      fromTextBox.setValue(source);
    }
  });

  toPageButton.on('click', async () => {
    const source = await getSource(toPageBox.getValue());
    if (source) {
      toTextBox.setValue(source);
    }
  });

  submitButton.on('click', async () => {
    submitButton.setDisabled(true);
    try {
      const result = await textCompare(fromTextBox.getValue(), toTextBox.getValue());
      if (result) {
        $result.html(result);
        $resultAction.show();
      }
    } catch (error) {
      mw.notify(`比较出错：${error}`, { type: 'warn' });
    }
    submitButton.setDisabled(false);
  });

  saveButton.on('click', () => {
    saveImage();
  });

  copyButton.on('click', () => {
    copyImage();
  });
})());
