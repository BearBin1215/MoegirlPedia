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
    title: 'Radio 单选框',
    Component: () => import('../pages/radio'),
  },
];

export default router;
