/** 页面标题规范化（首字母大写、下划线转空格），用于标题匹配 */
const normalizeTitle = (title: string) => (title.charAt(0).toUpperCase() + title.slice(1)).replace(/_/g, ' ');

/**
 * 从R-18作品声优索引模板源代码中解析引退声优（引退者以skewX斜体样式标记）
 * @param source 模板源代码
 * @returns 引退声优的条目标题集合
 */
const parseRetiredCVs = (source: string) => {
  const retiredCVs = new Set<string>();
  const spanPattern = /<span[^>]*transform:\s*skewX\(-10deg\)[^>]*>([\s\S]*?)<\/span>/g;
  for (const [, content] of source.matchAll(spanPattern)) {
    for (const [, target] of content.matchAll(/\[\[([^\]|#]+)/g)) {
      retiredCVs.add(normalizeTitle(target.trim()));
    }
  }
  return retiredCVs;
};

export { normalizeTitle, parseRetiredCVs };
