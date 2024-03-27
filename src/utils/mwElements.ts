import createElement from "./dom";

/** MediaWiki默认标题编辑按钮区域 */
export const editSection = '<span class="mw-editsection"></span>';

export const bracketStart = '<span class="mw-editsection-bracket">[</span>';

export const bracketEnd = '<span class="mw-editsection-bracket">]</span>';

export const divider = '<span class="mw-editsection-divider"> | </span>';

/** 创建一个编辑区元素 */
export default function createEditSection(...buttons: (Element | string)[]) {
  const children: (Element | string)[] = [createElement(bracketStart)];
  buttons.forEach((button, index) => {
    children.push(button);
    if (index < buttons.length - 1) {
      children.push(createElement(divider));
    }
  });
  children.push(createElement(bracketEnd));

  const section = createElement(editSection) as HTMLSpanElement;
  section.append(...children);
  return section;
}
