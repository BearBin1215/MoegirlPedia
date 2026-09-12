import React, { forwardRef } from 'react';
import clsx from 'clsx';
import { omit } from 'es-toolkit';
import { PanelLayout, type PanelLayoutProps } from '../PanelLayout';
import { PageLayout, type PageLayoutProps } from '../PageLayout';
import { type ChangeHandler } from '../../utils';
import { useControlledValue } from '../../hooks';

interface PageOptionProps extends PageLayoutProps {
  /** 页签值，同时作为激活匹配依据与列表key */
  value: string | number;
}

export interface StackLayoutProps extends Omit<PanelLayoutProps, 'onChange'> {
  /** 是否全显示。优先级高于value设置的显示 */
  continuous?: boolean;

  /** 当前激活页（受控，传入即受控模式） */
  value?: string | number;

  /** 非受控初始激活页 */
  defaultValue?: string | number;

  /** 激活页变化回调（对齐原版StackLayout的set事件；焦点进入某页时经onPageFocus另行通知） */
  onChange?: ChangeHandler<string | number>;

  /** 页签集 */
  options: PageOptionProps[];

  /**
   * 页面内获得焦点时触发（React onFocus冒泡），携带页面value。
   * 与onChange分离：调用方可据焦点联动（如continuous模式的滚动选页）而无需改激活值
   */
  onPageFocus?: (value: string | number, event: React.FocusEvent<HTMLDivElement>) => void;
}

/**
 * 堆叠布局，对齐原版OO.ui.StackLayout：按options渲染分页，value指定激活页，
 * 受控/非受控语义与IndexLayout/BookletLayout一致
 */
export const StackLayout = forwardRef<HTMLDivElement, StackLayoutProps>(({
  value,
  defaultValue,
  onChange,
  className,
  expanded = true,
  continuous,
  // 连续模式整体滚动，非连续模式由页面自行滚动
  scrollable = !!continuous,
  options,
  onPageFocus,
  ...rest
}, ref) => {
  const { value: activeValue } = useControlledValue<string | number>({ value, defaultValue }, onChange);

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
          {...omit(option, ['value'])}
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

