/**
 * 复制文本到剪贴板
 * @param {string} text
 * @returns {Promise<void>}
 */
const copyText = async (text = '') => {
    if (typeof navigator.clipboard?.writeText === 'function') {
        await navigator.clipboard.writeText(text);
    } else {
        const input = document.createElement('input');
        input.style.position = 'fixed';
        input.style.top = '-10000px';
        input.style.zIndex = '-999';
        input.style.opacity = 0;
        document.body.appendChild(input);
        input.value = text;
        input.focus();
        input.select();
        document.execCommand('copy');
        document.body.removeChild(input);
    }
};

/**
 * 从剪贴板读取文本
 * @returns {Promise<string>}
 */
const pasteText = () => new Promise((resolve, reject) => {
    if (typeof navigator.clipboard?.readText === 'function') {
        navigator.clipboard.readText()
            .then((text) => resolve(text))
            .catch((err) => reject(err));
    } else {
        const pasteArea = document.createElement('textarea');
        document.body.appendChild(pasteArea);
        pasteArea.style.position = 'absolute';
        pasteArea.style.top = 0;
        pasteArea.style.zIndex = -999;
        pasteArea.focus();
        const text = pasteArea.value;
        document.body.removeChild(pasteArea);
        resolve(text);
    }
});

export {
    copyText,
    pasteText,
};