import React, { useMemo, forwardRef } from 'react';
import classNames from 'classnames';
import PanelLayout from '../PanelLayout';
import PageLayout from '../PageLayout';
import type { ReactElement } from 'react';
import type { PageLayoutProps } from '../PageLayout';
import type { PanelLayoutProps } from '../PanelLayout';
import type { ElementRef } from '../../types/ref';

export type LayoutElement = ReactElement<PageLayoutProps>;

export interface StackLayoutProps extends PanelLayoutProps {
  /** 是否全显示。优先级高于activeKey设置的显示 */
  continuous?: boolean;
  /** 显示的子组件key */
  activeKey?: string | number;
  children?: LayoutElement | LayoutElement[];
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

  const layouts = useMemo(() => React.Children.toArray(children) as LayoutElement[], [children]);

  return (
    <PanelLayout
      {...rest}
      expanded={expanded}
      scrollable={scrollable}
      className={classes}
      ref={ref}
    >
      {continuous ? children : layouts.map((layout) => {
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
