import React, { useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import { createRoot } from 'react-dom/client';
import { render } from 'less';
import './index.less';

const ParserModal = () => {
    const [isOpen, setOpen] = useState(true);
    const inputRef = useRef(null);
    const outputRef = useRef(null);

    const closeModal = () => setOpen(false);

    const parseLess = () => {
        render(inputRef.current.value, (err, output) => {
            console.log(output);
            outputRef.current.value = err ? err.message : output.css;
        });
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
                                <button onClick={parseLess}>解析</button>
                                <button onClick={parseLess}>清空</button>
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