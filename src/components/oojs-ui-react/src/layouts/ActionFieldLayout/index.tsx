import React, { forwardRef, type ReactNode } from 'react';
import clsx from 'clsx';
import { FieldLayout } from '../FieldLayout';
import type { FieldLayoutProps } from '../FieldLayout';

export interface ActionFieldLayoutProps extends FieldLayoutProps {

  /** 输入字段旁的按钮控件（通常为Button或ButtonInput） */
  button?: ReactNode;

  /**
   * 字段控件是否为span根元素的内联控件（如CheckboxInput/ButtonInput），决定输入区包装元素
   * 为span还是div。原版根据字段控件根元素tagName自动判断，React无法探测子组件元素类型，改为显式声明
   */
  fieldInline?: boolean;
}

/** 带操作按钮的字段布局，对齐原版OO.ui.ActionFieldLayout（FieldLayout + 输入区旁附加按钮）。
 * 原版为FieldLayout的子类，此处同样以组合方式复用FieldLayout的排布逻辑 */
export const ActionFieldLayout = forwardRef<HTMLDivElement, ActionFieldLayoutProps>(({
  align = 'left',
  button,
  children,
  className,
  fieldInline = false,
  ...rest
}, ref) => {
  const InputWrapper = fieldInline ? 'span' : 'div';

  return (
    <FieldLayout
      {...rest}
      align={align}
      className={clsx(className, 'oo-ui-actionFieldLayout')}
      ref={ref}
    >
      <InputWrapper className='oo-ui-actionFieldLayout-input'>{children}</InputWrapper>
      <span className='oo-ui-actionFieldLayout-button'>{button}</span>
    </FieldLayout>
  );
});

ActionFieldLayout.displayName = 'ActionFieldLayout';

