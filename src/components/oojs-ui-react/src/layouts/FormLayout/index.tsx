import React, { forwardRef } from 'react';
import clsx from 'clsx';
import type { ElementProps } from '../../Element';

export interface FormLayoutProps extends ElementProps<HTMLFormElement> {
  /** HTML form `method`属性 */
  method?: string;

  /** HTML form `action`属性。原版会执行isSafeUrl净化，本工程省略 */
  action?: string;

  /** HTML form `enctype`属性 */
  enctype?: string;

  /** 表单提交回调。原版在事件监听器返回false时阻止默认提交，React按惯例由回调内调用`event.preventDefault()` */
  onSubmit?: React.FormEventHandler<HTMLFormElement>;
}

/**
 * 表单布局，对齐原版OO.ui.FormLayout：`<form>`元素包裹字段集，配合InputWidget家族
 * （TextInput/ButtonInput/DropdownInput等）实现浏览器原生表单提交。
 */
const FormLayout = forwardRef<HTMLFormElement, FormLayoutProps>(({
  className,
  children,
  method,
  action,
  enctype,
  ...rest
}, ref) => (
  <form
    {...rest}
    method={method}
    action={action}
    encType={enctype}
    className={clsx(className, 'oo-ui-layout', 'oo-ui-formLayout')}
    ref={ref}
  >
    {children}
  </form>
));

FormLayout.displayName = 'FormLayout';

export default FormLayout;
