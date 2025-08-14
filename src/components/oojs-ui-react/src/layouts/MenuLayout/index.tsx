import React, {
  forwardRef,
  type ReactNode,
  type Key,
} from 'react';
import clsx from 'clsx';
import Layout, { type LayoutProps } from '../Layout';

export type MenuLayoutOptions = LayoutProps & {
  key: Key;
};

export interface MenuLayoutProps extends Omit<LayoutProps, 'onSelect'> {
  /** 是否铺满父元素 */
  expanded?: boolean;
  /** 是否显示菜单 */
  showMenu?: boolean;
  /** 菜单位置 */
  menuPosition?: 'top' | 'after' | 'bottom' | 'before';
  /** 当前选中页签 */
  activeKey?: any;
  /** 选择列表 */
  menu: ReactNode;
}

const MenuLayout = forwardRef<HTMLDivElement, MenuLayoutProps>(({
  className,
  children,
  expanded = true,
  showMenu = true,
  menuPosition = 'before',
  menu,
  ...rest
}, ref) => {
  const classes = clsx(
    className,
    'oo-ui-menuLayout',
    expanded ? 'oo-ui-menuLayout-expanded' : 'oo-ui-menuLayout-static',
    showMenu ? 'oo-ui-menuLayout-showMenu' : 'oo-ui-menuLayout-hideMenu',
    `oo-ui-menuLayout-${menuPosition}`,
  );

  const elements = [
    <div
      key='menu'
      className='oo-ui-menuLayout-menu'
      aria-hidden={!showMenu}
    >
      {menu}
    </div>,
    <div
      key='content'
      className='oo-ui-menuLayout-content'
    >
      {children}
    </div>,
  ];

  return (
    <Layout
      {...rest}
      className={classes}
      ref={ref}
    >
      {['buttom', 'after'].includes(menuPosition) ? elements.reverse() : elements}
    </Layout>
  );
});

MenuLayout.displayName = 'MenuLayout';

export default MenuLayout;
