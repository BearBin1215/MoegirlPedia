import React, {
  useState,
  useRef,
  useEffect,
  useCallback,
  type FunctionComponent,
  type ChangeEvent,
} from 'react';
import { createPortal } from 'react-dom';
import { createRoot } from 'react-dom/client';
import { render } from 'less';
import { copyText } from '@/utils/clipboard';
import { Button } from 'oojs-ui-react';
import './index.less';

const ParserModal: FunctionComponent = () => {
  const [isOpen, setOpen] = useState(true); // 显示状态
  const uploadRef = useRef<HTMLInputElement>(null); // 上传框（隐藏）
  const inputRef = useRef<HTMLTextAreaElement>(null); // 输入框
  const outputRef = useRef<HTMLTextAreaElement>(null); // 输出框
  const fileReader = new FileReader();

  // 初始化fileReader和事件监听
  useEffect(() => {
    const onReaderLoadend = () => {
      inputRef.current!.value = fileReader.result as string;
    };
    fileReader.addEventListener('loadend', onReaderLoadend);
    return () => {
      fileReader.removeEventListener('loadend', onReaderLoadend);
    };
  }, []);

  /** 关闭弹窗 */
  const closeModal = () => setOpen(false);

  /** 点击上传 */
  const upload = () => uploadRef.current!.click();

  /** 上传完毕读取内容 */
  const onUpload = useCallback(({ target: { files } }: ChangeEvent<HTMLInputElement>) => {
    if (files?.length) {
      fileReader.readAsText(files[0]);
    }
  }, []);

  /** 执行解析 */
  const parseLess = () => {
    render(inputRef.current!.value, (err, output) => {
      outputRef.current!.value = err ? err.message : output!.css;
    });
  };

  /** 清空输入输出 */
  const clear = () => {
    uploadRef.current!.value = '';
    inputRef.current!.value = '';
    outputRef.current!.value = '';
  };

  const copy = () => copyText(outputRef.current!.value);

  /** 渲染 */
  if (isOpen) {
    return createPortal(
      <div id='less-parser'>
        <button
          onClick={closeModal}
          className='close-button'
        >
          ×
        </button>
        <header className='modal-header'>
          Less解析器
        </header>
        <div className='modal-body'>
          <textarea name='less-input' ref={inputRef} />
          <div className='button-area'>
            <input
              type="file"
              ref={uploadRef}
              onChange={onUpload}
              accept='.less'
              hidden
            />
            <Button onClick={upload}>上传</Button>
            <Button onClick={parseLess} flags={['primary', 'progressive']}>解析</Button>
            <Button onClick={clear} flags='destructive'>清空</Button>
            <Button onClick={copy}>复制</Button>
          </div>
          <textarea name='css-output' ref={outputRef} readOnly />
        </div>
      </div>,
      document.body,
    );
  }
  return null;
};

/** 添加入口 */
mw.loader.using('mediawiki.util').then(() => {
  mw.util.addPortletLink('p-tb', 'javascript:void(0)', 'Less解析器', 't-lessparser')!.addEventListener('click', () => {
    if (!document.getElementById('less-parser')) {
      createRoot(document.createDocumentFragment()).render(<ParserModal />);
    }
  });
});
