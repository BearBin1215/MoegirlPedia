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
    key: 'Dialogs',
    title: {
      'zh-cn': 'Dialogs 弹窗',
      en: 'Dialogs',
    },
    section: true,
  },
];

export default router;
