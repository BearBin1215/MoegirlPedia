/**
 * 复制文本到剪贴板
 */
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
    document.body.removeChild(input);
  }
};

/**
 * 从剪贴板读取文本
 */
const pasteText = async (): Promise<string> => {
  if (navigator.clipboard?.readText) {
    return await navigator.clipboard.readText();
  }
  const pasteArea = document.createElement('textarea');
  document.body.appendChild(pasteArea);
  pasteArea.style.position = 'absolute';
  pasteArea.style.top = '0';
  pasteArea.style.zIndex = '-999';
  pasteArea.focus();

  return new Promise((resolve) => {
    setTimeout(() => {
      const text = pasteArea.value;
      document.body.removeChild(pasteArea);
      resolve(text);
    }, 0);
  });
};

export {
  copyText,
  pasteText,
};
