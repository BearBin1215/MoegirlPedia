import type { ComponentType } from 'react';

export interface RouterItem {
  title: string;
  Component: () => Promise<{ 'default': ComponentType }>;
}

const router: RouterItem[] = [
  {
    title: 'Home',
    Component: () => import('../pages/home'),
  },
  {
    title: 'Button',
    Component: () => import('../pages/button'),
  },
  {
    title: 'Layout',
    Component: () => import('../pages/layout'),
  },
];

export default router;
