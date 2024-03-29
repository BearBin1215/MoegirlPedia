/**
 * 将字符串分割并过滤空行
 * @param content 要分割的字符串
 * @returns 页面列表
 */
const splitList = (content: string): string[] => content.split('\n').filter((s) => s && s.trim());

export { splitList };
