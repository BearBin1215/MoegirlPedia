import React, {
  forwardRef,
  type ReactNode,
  type Key,
} from 'react';
import classNames from 'classnames';
import MenuLayout, { type MenuLayoutProps } from '../MenuLayout';
import PanelLayout from '../PanelLayout';
import Select from '../../widgets/Select';
import type { PageLayoutProps } from '../PageLayout';

interface TabPanelLayoutProps extends PageLayoutProps {
  /** 菜单选项显示内容 */
  label: ReactNode;
  /** 唯一标识，用于控制显示 */
  key: Key;
}

export interface IndexLayoutProps extends Omit<MenuLayoutProps, 'menu' | 'menuPosition' | 'expanded'> {
  /** 页签集 */
  options: TabPanelLayoutProps[];
  /** 是否有边框 */
  framed?: boolean;
}

const IndexLayout = forwardRef<HTMLDivElement, IndexLayoutProps>(({
  className,
  framed,
  ...rest
}, ref) => {
  const classes = classNames(
    className,
    'oo-ui-indexLayout',
  );
  return (
    <MenuLayout
      {...rest}
      className={classes}
      menuPosition='top'
      expanded={false}
      menu={
        <PanelLayout className='oo-ui-indexLayout-tabPanel'>

        </PanelLayout>
      }
      ref={ref}
    >
      123
    </MenuLayout>
  );
});

IndexLayout.displayName = 'IndexLayout';

export default IndexLayout;
