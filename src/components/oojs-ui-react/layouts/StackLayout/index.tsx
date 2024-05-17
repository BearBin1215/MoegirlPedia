import React, { forwardRef } from 'react';
import classNames from 'classnames';
import PanelLayout from '../PanelLayout';
import PageLayout from '../PageLayout';
import type { ReactElement } from 'react';
import type { PageLayoutProps } from '../PageLayout';
import type { PanelLayoutProps } from '../PanelLayout';
import type { ElementRef } from '../../types/ref';

export type PageLayoutElement = ReactElement<PageLayoutProps>;

export interface StackLayoutProps extends PanelLayoutProps {
  /** 是否全显示。优先级高于activeKey设置的显示 */
  continuous?: boolean;
  /** 显示的子组件key */
  activeKey?: string | number;
  children?: PageLayoutElement | PageLayoutElement[];
}

const StackLayout = forwardRef<ElementRef<HTMLDivElement>, StackLayoutProps>(({
  activeKey,
  className,
  children,
  expanded = true,
  scrollable = true,
  continuous,
  ...rest
}, ref) => {
  const classes = classNames(
    className,
    'oo-ui-stackLayout',
    continuous && 'oo-ui-stackLayout-continuous',
  );

  return (
    <PanelLayout
      {...rest}
      expanded={expanded}
      scrollable={scrollable}
      className={classes}
      ref={ref}
    >
      {continuous ? children : React.Children.map(children, (layout) => {
        if (!layout) {
          return layout;
        }
        if (layout.key === activeKey) {
          return layout;
        }
        return <PageLayout key={layout.key} {...layout.props} hidden />;
      })}
    </PanelLayout>
  );
});

StackLayout.displayName = 'StackLayout';

export default StackLayout;
