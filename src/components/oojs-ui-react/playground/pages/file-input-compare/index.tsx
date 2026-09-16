import React, { useState } from 'react';
import { SelectFileInputWidget } from 'oojs-ui-react';
import { createRowAppender, useOriginalWidgets } from '../../components/original';
import { CompareColumns, CompareLayout } from '../../components/CompareLayout';

type SelectFileUi = {
  SelectFileInputWidget: new (config?: Record<string, unknown>) => {
    $element: unknown;
    setValue: (files: File[]) => void;
  };
};

/** 1x1透明PNG：用于“已选文件”“缩略图”两条路径的真图片（缩略图须能真正解码） */
const PNG_1PX = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=';

/** 构造一个可解码的图片File（缩略图路径要求文件内容真为图片） */
function makeImageFile(fileName = 'logo.png'): File {
  const binary = atob(PNG_1PX);
  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }
  return new File([bytes], fileName, { type: 'image/png' });
}

/**
 * 原版侧各行配置（React侧逐条对应），第三项为true时须在构造后补一次`setValue`：
 * 原版构造期传`value`会被丢弃——彼时`$input`尚未置`type=file`，`setValue`写回`input.files`
 * 无效，而构造末尾又用`$input.files`覆盖了`currentFiles`。React侧`value`/`defaultValue`
 * 直接生效（修掉该缺陷，见docs/TODO.md「增强」）。
 */
const ORIGINAL_ROWS: [string, Record<string, unknown>, boolean?][] = [
  ['默认（信息框+选择按钮）', {}],
  ['多选（multiple）', { multiple: true }],
  ['限定类型（accept: image/*）', { accept: ['image/*'] }],
  ['已选文件（信息框显示文件名）', {}, true],
  ['必填（required）', { required: true }],
  ['禁用', { disabled: true }],
  ['拖放区·单选（空态）', { showDropTarget: true }],
  ['拖放区·多选（空态）', { showDropTarget: true, multiple: true }],
  ['拖放区·单选·已选图片（缩略图）', { showDropTarget: true }, true],
  ['拖放区·限定类型（accept: image/*）', { showDropTarget: true, accept: ['image/*'] }],
  ['仅按钮', { buttonOnly: true }],
];

/** 原版侧：同一组配置逐行登记 */
function OriginalSelectFiles() {
  const { containerRef } = useOriginalWidgets((oo, container, register) => {
    const ui = oo.ui as unknown as SelectFileUi;
    const row = createRowAppender(container, register);
    ORIGINAL_ROWS.forEach(([name, config, setValueAfterConstruct]) => {
      const widget = row(ui.SelectFileInputWidget, name, config);
      if (setValueAfterConstruct) {
        widget.setValue([makeImageFile()]);
      }
    });
  });

  return (
    <div>
      <div ref={containerRef} />
    </div>
  );
}

/** React侧：与原版逐行同配置 */
function ReactSelectFiles({ addLog }: { addLog: (msg: string) => void }) {
  const [initialFile] = useState(() => makeImageFile());

  return (
    <div>
      <div>
        默认（信息框+选择按钮）
        <SelectFileInputWidget onChange={(files) => addLog(`default=${files.length}`)} />
      </div>
      <div>
        多选（multiple）
        <SelectFileInputWidget multiple onChange={(files) => addLog(`multiple=${files.length}`)} />
      </div>
      <div>
        限定类型（accept: image/*）
        <SelectFileInputWidget accept={['image/*']} onChange={(files) => addLog(`accept=${files.length}`)} />
      </div>
      <div>
        已选文件（信息框显示文件名）
        <SelectFileInputWidget defaultValue={[initialFile]} />
      </div>
      <div>
        必填（required）
        <SelectFileInputWidget required />
      </div>
      <div>
        禁用
        <SelectFileInputWidget disabled />
      </div>
      <div>
        拖放区·单选（空态）
        <SelectFileInputWidget showDropTarget onChange={(files) => addLog(`dropTarget=${files.length}`)} />
      </div>
      <div>
        拖放区·多选（空态）
        <SelectFileInputWidget multiple showDropTarget onChange={(files) => addLog(`dropTargetMultiple=${files.length}`)} />
      </div>
      <div>
        拖放区·单选·已选图片（缩略图）
        <SelectFileInputWidget showDropTarget defaultValue={[initialFile]} />
      </div>
      <div>
        拖放区·限定类型（accept: image/*）
        <SelectFileInputWidget
          accept={['image/*']}
          showDropTarget
          onChange={(files) => addLog(`dropTargetAccept=${files.length}`)}
        />
      </div>
      <div>
        仅按钮
        <SelectFileInputWidget buttonOnly onChange={(files) => addLog(`buttonOnly=${files.length}`)} />
      </div>
    </div>
  );
}

function FileInputComparePage() {
  const [log, setLog] = useState<string[]>([]);

  const addLog = (message: string) => setLog((prev) => [...prev.slice(-9), message]);

  return (
    <CompareLayout
      title='SelectFileInputWidget 对照'
      description={(
        <>
          对照点：信息框（type=search、input的tabindex=-1、清除指示器tabindex=0）、选择按钮
          （文件input覆盖在锚点上、tab停靠点是按钮）、ActionFieldLayout的排布、多选与accept过滤、
          拖放区的类切换（canDrop/cantDrop）与缩略图加载、buttonOnly的根元素替换。
        </>
      )}
    >
      <CompareColumns original={<OriginalSelectFiles />}>
        <ReactSelectFiles addLog={addLog} />
      </CompareColumns>

      <h2>事件日志（React侧）</h2>
      <ul>
        {log.map((message, index) => <li key={index}>{message}</li>)}
      </ul>
    </CompareLayout>
  );
}

FileInputComparePage.displayName = 'FileInputComparePage';

export default FileInputComparePage;
