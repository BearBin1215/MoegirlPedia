import type { ComponentType } from 'react';
import type { Languages } from '../components/intl';

export type RouterItem = {
  key: string;
  title: Record<Languages, string>;
  Component: () => Promise<{ 'default': ComponentType }>;
} | {
  key: string;
  title: Record<Languages, string>;
  section: true;
};

const router: RouterItem[] = [
  {
    key: 'Overview',
    title: {
      'zh-cn': '介绍',
      en: 'Overview',
    },
    Component: () => import('../pages/top-pages/home'),
  },
  {
    key: 'Start',
    title: {
      'zh-cn': '使用',
      en: 'Start',
    },
    Component: () => import('../pages/top-pages/start'),
  },

  {
    key: 'Widgets',
    title: {
      'zh-cn': 'Widgets 组件',
      en: 'Widgets',
    },
    section: true,
  },
  {
    key: 'Icon/Indicator',
    title: {
      'zh-cn': 'Icon/Indicator 图标',
      en: 'Icon/Indicator',
    },
    Component: () => import('../pages/icon'),
  },
  {
    key: 'Button',
    title: {
      'zh-cn': 'Button 按钮',
      en: 'Button',
    },
    Component: () => import('../pages/button'),
  },
  {
    key: 'TextInput',
    title: {
      'zh-cn': 'TextInput 文本输入',
      en: 'TextInput',
    },
    Component: () => import('../pages/text-input'),
  },
  {
    key: 'MultilineInput',
    title: {
      'zh-cn': 'MultilineInput 多行文本输入',
      en: 'MultilineInput',
    },
    Component: () => import('../pages/multiline-input'),
  },
  {
    key: 'NumberInput',
    title: {
      'zh-cn': 'NumberInput 数字输入',
      en: 'NumberInput',
    },
    Component: () => import('../pages/number-input'),
  },
  {
    key: 'Dropdown',
    title: {
      'zh-cn': 'Dropdown 下拉选择',
      en: 'Dropdown',
    },
    Component: () => import('../pages/dropdown'),
  },
  {
    key: 'Radio',
    title: {
      'zh-cn': 'Radio 单选框',
      en: 'Radio',
    },
    Component: () => import('../pages/radio'),
  },
  {
    key: 'CheckboxInput',
    title: {
      'zh-cn': 'CheckboxInput 复选框',
      en: 'CheckboxInput',
    },
    Component: () => import('../pages/checkbox-input'),
  },


  {
    key: 'Layouts',
    title: {
      'zh-cn': 'Layouts 布局',
      en: 'Layouts',
    },
    section: true,
  },
  {
    key: 'IndexCompare',
    title: {
      'zh-cn': 'IndexLayout 原版对照',
      en: 'IndexLayout vs OOUI',
    },
    Component: () => import('../pages/index-compare'),
  },

  {
    key: 'Dialogs',
    title: {
      'zh-cn': 'Dialogs 弹窗',
      en: 'Dialogs',
    },
    section: true,
  },
  {
    key: 'Dialog',
    title: {
      'zh-cn': 'Dialog 弹窗',
      en: 'Dialog',
    },
    Component: () => import('../pages/dialog'),
  },
  {
    key: 'DialogCompare',
    title: {
      'zh-cn': 'Dialog 原版对照',
      en: 'Dialog vs OOUI',
    },
    Component: () => import('../pages/dialog-compare'),
  },
  {
    key: 'MultilineCompare',
    title: {
      'zh-cn': 'Multiline 原版对照',
      en: 'Multiline vs OOUI',
    },
    Component: () => import('../pages/multiline-compare'),
  },
  {
    key: 'NumberCompare',
    title: {
      'zh-cn': 'Number 原版对照',
      en: 'Number vs OOUI',
    },
    Component: () => import('../pages/number-compare'),
  },
  {
    key: 'DropdownCompare',
    title: {
      'zh-cn': 'Dropdown 原版对照',
      en: 'Dropdown vs OOUI',
    },
    Component: () => import('../pages/dropdown-compare'),
  },
  {
    key: 'ButtonCheckboxCompare',
    title: {
      'zh-cn': 'Button/Checkbox 原版对照',
      en: 'Button/Checkbox vs OOUI',
    },
    Component: () => import('../pages/button-checkbox-compare'),
  },
];

export default router;
