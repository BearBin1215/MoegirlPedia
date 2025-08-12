import React, { createContext, ReactNode, useContext } from 'react';

/** 语言列表 */
export const languages = {
  'zh-cn': '简体中文',
  en: 'English',
};

/** 可选语言 */
export type Languages = keyof typeof languages;

/** 多语言上下文 */
export const LanguageContext = createContext<{ language: Languages }>({
  language: 'zh-cn',
});

/** 多语言组件，根据所选语言显示内容 */
export const IntlComponent: React.FC<{ intlInputs: Partial<Record<Languages, ReactNode>> }> = ({ intlInputs }) => {
  const { language } = useContext(LanguageContext);
  return intlInputs[language] || intlInputs['zh-cn'] || intlInputs.en;
};

/** 组件封装为函数，便于使用 */
const intl = (intlInputs: Partial<Record<Languages, ReactNode>>) => (
  <IntlComponent intlInputs={intlInputs} />
);

export default intl;
