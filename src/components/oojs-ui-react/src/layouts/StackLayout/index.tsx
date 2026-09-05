import React, { forwardRef } from 'react';
import clsx from 'clsx';
import PanelLayout, { type PanelLayoutProps } from '../PanelLayout';
import PageLayout, { type PageLayoutProps } from '../PageLayout';

interface PageOptionProps extends PageLayoutProps {
  /** 页签值，同时作为激活匹配依据与列表key */
  value: string | number;
}

export interface StackLayoutProps extends PanelLayoutProps {
  /** 是否全显示。优先级高于activeValue设置的显示 */
  continuous?: boolean;
  /** 当前激活的子组件value */
  activeValue?: string | number;
  /** 页签集 */
  options: PageOptionProps[];
  /** 页面内获得焦点时触发（React onFocus冒泡），携带页面value */
  onPageFocus?: (value: string | number, event: React.FocusEvent<HTMLDivElement>) => void;
}

const StackLayout = forwardRef<HTMLDivElement, StackLayoutProps>(({
  activeValue,
  className,
  expanded = true,
  scrollable = true,
  continuous,
  options,
  onPageFocus,
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
          hidden={!continuous && option.value !== activeValue}
          active={option.value === activeValue}
          onFocus={(event) => onPageFocus?.(option.value, event)}
          key={option.value}
        />
      ))}
    </PanelLayout>
  );
});

StackLayout.displayName = 'StackLayout';

export default StackLayout;
