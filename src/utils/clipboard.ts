/** 复制文本到剪贴板 */
const copyText = async (text = ''): Promise<void> => {
  if (typeof navigator.clipboard?.writeText === 'function') {
    await navigator.clipboard.writeText(text);
  } else {
    const input = document.createElement('input');
    input.style.position = 'fixed';
    input.style.top = '-10000px';
    input.style.zIndex = '-999';
    input.style.opacity = '0';
    document.body.appendChild(input);
    input.value = text;
    input.focus();
    input.select();
    document.execCommand('copy');
    // 创建一个临时元素接收焦点，以供回收input
    const dummyElement = document.createElement('div');
    dummyElement.tabIndex = -1;
    document.body.appendChild(dummyElement);
    dummyElement.focus();
    dummyElement.remove();
    input.remove();
  }
};

/** 从剪贴板读取文本 */
const pasteText = async (): Promise<string> => {
  if (navigator.clipboard?.readText) {
    return await navigator.clipboard.readText();
  }
  return new Promise((resolve) => {
    const pasteArea = document.createElement('textarea');
    document.body.appendChild(pasteArea);
    pasteArea.style.position = 'absolute';
    pasteArea.style.top = '0';
    pasteArea.style.zIndex = '-999';
    pasteArea.focus();
    setTimeout(() => {
      const text = pasteArea.value;
      // 创建一个临时元素接收焦点，以供回收pasteArea
      const dummyElement = document.createElement('div');
      dummyElement.tabIndex = -1;
      document.body.appendChild(dummyElement);
      dummyElement.focus();
      dummyElement.remove();
      pasteArea.remove();
      resolve(text);
    }, 0);
  });
};

export {
  copyText,
  pasteText,
};
