/**
 * 根据html字符串创建节点
 * @param html HTML字符串
 * @returns 节点
 */
const createElement = (html: string) => {
  const template = document.createElement('template');
  template.innerHTML = html.trim();
  return template.content.children[0] as HTMLElement;
};

export default createElement;
