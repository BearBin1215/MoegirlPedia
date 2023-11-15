import React, { useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import { createRoot } from 'react-dom/client';
import { render } from 'less';
import { copyText } from '../../utils/clipboard';
import { Button } from '../../components';
import './index.less';

const ParserModal = () => {
    const [isOpen, setOpen] = useState(true); // 显示状态
    const uploadRef = useRef(null); // 上传框（隐藏）
    const inputRef = useRef(null); // 输入框
    const outputRef = useRef(null); // 输出框
    const fileReader = new FileReader();
    fileReader.addEventListener("loadend", () => {
        inputRef.current.value = fileReader.result;
    });

    /**
     * 关闭弹窗
     */
    const closeModal = () => setOpen(false);

    /**
     * 点击上传
     */
    const upload = () => {
        uploadRef.current.click();
    };

    /**
     * 上传完毕读取内容
     * @param {React.ChangeEvent} param0 
     */
    const onUpload = ({ target: { files: [file] } }) => {
        fileReader.readAsText(file);
    };

    /**
     * 执行解析
     */
    const parseLess = () => {
        render(inputRef.current.value, (err, output) => {
            outputRef.current.value = err ? err.message : output.css;
        });
    };

    /**
     * 清空输入输出
     */
    const clear = () => {
        uploadRef.current.value = '';
        inputRef.current.value = '';
        outputRef.current.value = '';
    };

    /**
     * 渲染
     */
    if (isOpen) {
        return (
            <>
                {createPortal(
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
                                <Button onClick={parseLess} type='primary'>解析</Button>
                                <Button onClick={clear} type='danger'>清空</Button>
                                <Button onClick={() => copyText(outputRef.current.value)}>复制</Button>
                            </div>
                            <textarea name='css-output' ref={outputRef} readOnly />
                        </div>
                    </div>,
                    document.body,
                )}
            </>
        );
    }
    return null;
};

/**
 * 添加入口
 */
mw.loader.using("mediawiki.util").then(() => {
    mw.util.addPortletLink("p-tb", "javascript:void(0)", "Less解析器", "t-lessparser").addEventListener("click", () => {
        if (!document.getElementById('less-parser')) {
            createRoot(document.createElement('div')).render(<ParserModal />);
        }
    });
});