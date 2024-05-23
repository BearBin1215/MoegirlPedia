import React, { forwardRef, Children } from 'react';
import classNames from 'classnames';
import PanelLayout from '../PanelLayout';
import PageLayout from '../PageLayout';
import type { ReactElement } from 'react';
import type { PageLayoutProps } from '../PageLayout';
import type { PanelLayoutProps } from '../PanelLayout';
import type { ElementRef } from '../../../types/ref';

export type PageLayoutElement = ReactElement<PageLayoutProps>;

export interface StackLayoutProps extends PanelLayoutProps {
  /** 是否全显示。优先级高于activeKey设置的显示 */
  continuous?: boolean;
  /** 显示的子组件key */
  activeKey?: string | number | boolean;
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
      {continuous ? children : Children.map(children, (layout) => {
        if (!layout) {
          return layout;
        }
        // 去掉label参数
        const { label: _, ...pageProps } = layout.props;
        return <PageLayout key={layout.key} {...pageProps} hidden={layout.key !== activeKey} />;
      })}
    </PanelLayout>
  );
});

StackLayout.displayName = 'StackLayout';

export default StackLayout;
