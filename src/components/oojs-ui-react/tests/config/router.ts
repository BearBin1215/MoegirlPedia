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
    Component: () => import('../pages/home'),
  },

  {
    title: 'Widgets 组件',
    section: true,
  },
  {
    title: 'Button 按钮',
    Component: () => import('../pages/button'),
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
    title: 'Layout',
    Component: () => import('../pages/layout'),
  },


  {
    title: 'Layout 布局',
    section: true,
  },


  {
    title: 'Dialog 弹窗',
    section: true,
  },
];

export default router;
