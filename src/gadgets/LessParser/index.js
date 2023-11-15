import React, { useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import { createRoot } from 'react-dom/client';
import { render } from 'less';
import { copyText } from '../../utils/clipboard';
import './index.less';

const ParserModal = () => {
    const [isOpen, setOpen] = useState(true);
    const uploadRef = useRef(null);
    const inputRef = useRef(null);
    const outputRef = useRef(null);

    const closeModal = () => setOpen(false);

    const upload = () => {
        uploadRef.current.click();
    };

    const onUpload = ({ target: { files: [file] } }) => {
        const fileReader = new FileReader();
        fileReader.addEventListener("loadend", () => {
            inputRef.current.value = fileReader.result;
        });
        fileReader.readAsText(file);
    };

    const parseLess = () => {
        render(inputRef.current.value, (err, output) => {
            outputRef.current.value = err ? err.message : output.css;
        });
    };

    const clear = () => {
        inputRef.current.value = '';
        outputRef.current.value = '';
    };

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
                                <button onClick={upload}>上传</button>
                                <button onClick={parseLess}>解析</button>
                                <button onClick={clear}>清空</button>
                                <button onClick={() => copyText(outputRef.current.value)}>复制</button>
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

mw.loader.using("mediawiki.util").then(() => {
    mw.util.addPortletLink("p-tb", "javascript:void(0)", "Less解析器", "t-lessparser").addEventListener("click", () => {
        createRoot(document.createElement('div')).render(<ParserModal />);
    });
});