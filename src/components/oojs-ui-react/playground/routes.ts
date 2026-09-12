import { lazy, type ComponentType, type LazyExoticComponent } from 'react';

/** 对照页侧栏分组，按src目录的组件族划分 */
export const routeGroups = ['Widgets', 'Layouts', 'Dialogs', 'Toolbars'] as const;

export type RouteGroup = (typeof routeGroups)[number];

/** 对照页注册项：path即pages下目录名 */
export type CompareRoute = {
  /** URL路径与pages目录名一致 */
  path: string;
  /** 侧栏显示的组件名 */
  title: string;
  /** 所属分组 */
  group: RouteGroup;
  /** 懒加载的页面组件 */
  Component: LazyExoticComponent<ComponentType>;
};

/** 对照页注册表：新对照页在此登记（页面文件放pages/xxx-compare/） */
export const compareRoutes: CompareRoute[] = [
  // #region Widgets
  {
    path: 'button-checkbox-compare',
    title: 'Button / CheckboxInput',
    group: 'Widgets',
    Component: lazy(() => import('./pages/button-checkbox-compare')),
  },
  {
    path: 'combobox-compare',
    title: 'ComboBoxInput',
    group: 'Widgets',
    Component: lazy(() => import('./pages/combobox-compare')),
  },
  {
    path: 'dropdown-compare',
    title: 'Dropdown',
    group: 'Widgets',
    Component: lazy(() => import('./pages/dropdown-compare')),
  },
  {
    path: 'message-compare',
    title: 'Message',
    group: 'Widgets',
    Component: lazy(() => import('./pages/message-compare')),
  },
  {
    path: 'multiline-compare',
    title: 'MultilineTextInput',
    group: 'Widgets',
    Component: lazy(() => import('./pages/multiline-compare')),
  },
  {
    path: 'number-compare',
    title: 'NumberInput',
    group: 'Widgets',
    Component: lazy(() => import('./pages/number-compare')),
  },
  {
    path: 'popup-compare',
    title: 'Popup',
    group: 'Widgets',
    Component: lazy(() => import('./pages/popup-compare')),
  },
  // #endregion

  // #region Layouts
  {
    path: 'fieldset-compare',
    title: 'FieldsetLayout',
    group: 'Layouts',
    Component: lazy(() => import('./pages/fieldset-compare')),
  },
  {
    path: 'form-compare',
    title: 'Form / Inputs',
    group: 'Layouts',
    Component: lazy(() => import('./pages/form-compare')),
  },
  {
    path: 'index-compare',
    title: 'IndexLayout',
    group: 'Layouts',
    Component: lazy(() => import('./pages/index-compare')),
  },
  // #endregion

  // #region Dialogs
  {
    path: 'dialog-compare',
    title: 'Dialog',
    group: 'Dialogs',
    Component: lazy(() => import('./pages/dialog-compare')),
  },
  {
    path: 'prompt-compare',
    title: 'Prompt',
    group: 'Dialogs',
    Component: lazy(() => import('./pages/prompt-compare')),
  },
  {
    path: 'process-dialog-compare',
    title: 'ProcessDialog',
    group: 'Dialogs',
    Component: lazy(() => import('./pages/process-dialog-compare')),
  },
  // #endregion

  // #region Toolbars
  {
    path: 'toolbar-compare',
    title: 'Toolbar',
    group: 'Toolbars',
    Component: lazy(() => import('./pages/toolbar-compare')),
  },
  // #endregion
];

/** 首个对照页路径，未匹配路由统一重定向到此处 */
export const firstRoutePath = `/${compareRoutes[0].path}`;
