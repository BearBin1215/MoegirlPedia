import './index.less';
import { render } from 'less';
import { copyText } from '@/utils/clipboard';

await mw.loader.using('oojs-ui');

class LessParser extends OO.ui.Dialog {
  $body!: JQuery<HTMLDivElement>;

  static static = {
    ...super.static,
    name: 'LessParser',
  };

  initialize() {
    super.initialize();

    // 标题和关闭按钮
    const $closeButton = $('<button class="close-button">×</button>').on('click', () => this.close());
    const $inputArea = $('<textarea name="less-input" />') as JQuery<HTMLTextAreaElement>;
    const $outputArea = $('<textarea name="less-output" />') as JQuery<HTMLTextAreaElement>;

    const fileReader = new FileReader();
    fileReader.addEventListener('loadend', () => {
      if (typeof fileReader.result === 'string') {
        $inputArea.val(fileReader.result);
      }
    });

    const $upload = ($('<input type="file" accept=".less" hidden />') as JQuery<HTMLInputElement>)
      .on('change', ({ target: { files } }) => {
        if (files?.length) {
          fileReader.readAsText(files[0]);
        }
      });

    const uploadButton = new OO.ui.ButtonWidget({
      label: '上传',
      flags: ['progressive'],
    }).on('click', () => $upload.trigger('click'));
    const parseButton = new OO.ui.ButtonWidget({
      label: '解析',
      flags: ['primary', 'progressive'],
    }).on('click', () => {
      render($inputArea.val()!, (err, output) => {
        $outputArea.val(err ? err.message : output!.css);
      });
    });
    const clearButton = new OO.ui.ButtonWidget({
      label: '清空',
      flags: ['destructive'],
    }).on('click', () => {
      $inputArea.val('');
      $outputArea.val('');
      $upload.val('');
    });
    const copyButton = new OO.ui.ButtonWidget({
      label: '复制',
      flags: [],
    }).on('click', () => copyText($outputArea.val()));

    this.$body.append(
      $closeButton,
      $('<header class="modal-header">Less解析器</header>'),
      $('<div class="modal-body" />').append(
        $inputArea,
        $('<div class="button-area" />').append(
          $upload,
          uploadButton.$element,
          parseButton.$element,
          clearButton.$element,
          copyButton.$element,
        ),
        $outputArea,
      ),
    ).attr('id', 'less-parser');

    return this;
  }
}

const windowManager = new OO.ui.WindowManager();
$(document.body).append(windowManager.$element);
const parserDialog = new LessParser({ size: 'large' });
windowManager.addWindows([parserDialog]);

mw.loader.using('mediawiki.util').then(() => {
  mw.util.addPortletLink('p-tb', 'javascript:void(0)', 'Less解析器', 't-lessparser')!
    .addEventListener('click', () => {
      windowManager.openWindow(parserDialog);
    });
});
