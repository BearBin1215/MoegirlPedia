import React, {
  forwardRef,
  type Key,
} from 'react';
import clsx from 'clsx';
import PanelLayout, { type PanelLayoutProps } from '../PanelLayout';
import PageLayout, { type PageLayoutProps } from '../PageLayout';

interface PageOptionProps extends PageLayoutProps {
  key: Key;
}

export interface StackLayoutProps extends PanelLayoutProps {
  /** 是否全显示。优先级高于activeKey设置的显示 */
  continuous?: boolean;
  /** 显示的子组件key */
  activeKey?: string | number;
  /** 页签集 */
  options: PageOptionProps[];
}

const StackLayout = forwardRef<HTMLDivElement, StackLayoutProps>(({
  activeKey,
  className,
  expanded = true,
  scrollable = true,
  continuous,
  options,
  ...rest
}, ref) => {
  const classes = clsx(
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
      {options.map((option) => (
        <PageLayout
          {...option}
          hidden={!continuous && option.key !== activeKey}
          key={option.key}
        />
      ))}
    </PanelLayout>
  );
});

StackLayout.displayName = 'StackLayout';

export default StackLayout;
