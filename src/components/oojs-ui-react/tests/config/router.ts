import type { ComponentType } from 'react';

export type RouterItem = {
  title: string;
  Component: () => Promise<{ 'default': ComponentType }>;
} | {
  title: string;
  section: true;
};

const router: RouterItem[] = [
  {
    title: 'Home 导航',
    Component: () => import('../pages/top-pages/home'),
  },
  {
    title: 'Start 使用',
    Component: () => import('../pages/top-pages/start'),
  },

  {
    title: 'Widgets 组件',
    section: true,
  },
  {
    title: 'Icon/Indicator 图标',
    Component: () => import('../pages/icon'),
  },
  {
    title: 'Button 按钮',
    Component: () => import('../pages/button'),
  },
  {
    title: 'TextInput 文本输入',
    Component: () => import('../pages/text-input'),
  },
  {
    title: 'MultilineInput 文本域',
    Component: () => import('../pages/multiline-input'),
  },
  {
    title: 'NumberInput 数字输入',
    Component: () => import('../pages/number-input'),
  },
  {
    title: 'Dropdown 下拉选择框',
    Component: () => import('../pages/dropdown'),
  },
  {
    title: 'Radio 单选框',
    Component: () => import('../pages/radio'),
  },
  {
    title: 'CheckboxInput 勾选框',
    Component: () => import('../pages/checkbox-input'),
  },


  {
    title: 'Layouts 布局',
    section: true,
  },


  {
    title: 'Dialogs 弹窗',
    section: true,
  },
];

export default router;
