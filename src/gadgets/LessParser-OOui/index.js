import './index.less';
import { render } from 'less';
import { copyText } from '../../utils/clipboard';

await mw.loader.using('oojs-ui');

class LessParser extends OO.ui.Dialog {
    static static = {
        ...super.static,
        name: 'LessParser',
        size: 'large',
    };

    initialize() {
        super.initialize();

        // 标题和关闭按钮
        const $closeButton = $('<button class="close-button">×</button>').on('click', () => this.close());
        const $inputArea = $('<textarea name="less-input" />');
        const $outputArea = $('<textarea name="less-output" />');

        const fileReader = new FileReader();
        fileReader.addEventListener('loadend', () => {
            $inputArea.val(fileReader.result);
        });

        const $upload = $('<input type="file" accept=".less" hidden />').on('change', ({ target: { files: [file] } }) => {
            fileReader.readAsText(file);
        });
        const uploadButton = new OO.ui.ButtonWidget({
            label: '上传',
            flags: ['progressive'],
        }).on('click', () => $upload.trigger('click'));
        const parseButton = new OO.ui.ButtonWidget({
            label: '解析',
            flags: ['primary', 'progressive'],
        }).on('click', () => {
            render($inputArea.val(), (err, output) => {
                $outputArea.val(err ? err.message : output.css);
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
            $('<div class="modal-body"></div>').append(
                $inputArea,
                $('<div class="button-area"></div>').append(
                    $upload,
                    uploadButton.$element,
                    parseButton.$element,
                    clearButton.$element,
                    copyButton.$element,
                ),
                $outputArea,
            ),
        ).attr('id', 'less-parser');
    }
}

const windowManager = new OO.ui.WindowManager();
$(document.body).append(windowManager.$element);
const parserDialog = new LessParser();
windowManager.addWindows([parserDialog]);

mw.loader.using('mediawiki.util').then(() => {
    mw.util.addPortletLink('p-tb', 'javascript:void(0)', 'Less解析器', 't-lessparser')
        .addEventListener('click', () => {
            windowManager.openWindow(parserDialog);
        });
});