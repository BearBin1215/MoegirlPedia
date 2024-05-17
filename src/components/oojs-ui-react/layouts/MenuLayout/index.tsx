import React, { forwardRef } from 'react';
import classNames from 'classnames';
import Layout from '../Layout';
import type { ReactElement } from 'react';
import type { LayoutProps } from '../Layout';
import type { SelectProps } from '../../widgets/Select';
import type { ElementRef } from '../../types/ref';

export interface MenuLayoutProps extends LayoutProps {
  expanded?: boolean;
  /** 菜单元素 */
  menu?: ReactElement<SelectProps>;
  /** 是否显示菜单 */
  showMenu?: boolean;
  /** 菜单位置 */
  menuPosition?: 'top' | 'after' | 'bottom' | 'before';
}

const MenuLayout = forwardRef<ElementRef<HTMLDivElement>, MenuLayoutProps>(({
  className,
  children,
  menu,
  expanded = true,
  showMenu = true,
  menuPosition = 'before',
  ...rest
}, ref) => {
  const classes = classNames(
    className,
    'oo-ui-menuLayout',
    expanded && 'oo-ui-menuLayout-expanded',
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
      {['button', 'after'].includes(menuPosition) ? elements.reverse() : elements}
    </Layout>
  );
});

MenuLayout.displayName = 'MenuLayout';

export default MenuLayout;
