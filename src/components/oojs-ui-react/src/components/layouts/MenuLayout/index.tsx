import React, {
  forwardRef,
  type Key,
} from 'react';
import classNames from 'classnames';
import Layout, { type LayoutProps } from '../Layout';
import PanelLayout from '../PanelLayout';
import OutlineSelect from '../../widgets/OutlineSelect';
import type { OptionData } from '../../widgets/Option';

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
  /** 页签集 */
  options: MenuLayoutOptions[];
  /** 选中选项回调函数 */
  onSelect?: (option: OptionData) => void;
  /** 当前选中页签 */
  activeKey?: any;
}

const MenuLayout = forwardRef<HTMLDivElement, MenuLayoutProps>(({
  activeKey,
  className,
  children,
  expanded = true,
  showMenu = true,
  menuPosition = 'before',
  options,
  onSelect,
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
      <PanelLayout
        className='oo-ui-bookletLayout-outlinePanel'
        scrollable
        expanded
      >
        <OutlineSelect
          value={activeKey}
          onSelect={onSelect}
          options={options}
        />
      </PanelLayout>
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
