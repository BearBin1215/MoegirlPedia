/**
 * 将文本复制到剪贴板
 * 
 * 使用`navigator.clipboard.writeText`，对于不支持的浏览器使用`document.execCommand('copy')`。
 */
export declare const copyText: (text?: string) => Promise<void>;

/**
 * 获取剪贴板内容并返回
 */
export declare const pasteText: () => Promise<string>;
