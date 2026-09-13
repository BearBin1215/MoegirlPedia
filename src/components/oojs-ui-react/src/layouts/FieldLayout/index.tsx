import React, { forwardRef, useMemo, useRef } from 'react';
import clsx from 'clsx';
import { FieldLabelLinkProvider, useCleanId, type FieldLabelLink } from '../../hooks';
import { hasLabel } from '../../utils';
import { Layout } from '../Layout';
import type { WidgetProps } from '../../widgets/Widget';
import type { LabelElement } from '../../widgets/Label';

export interface FieldLayoutProps extends
  WidgetProps<HTMLDivElement>,
  LabelElement {

  /** 标签对齐方向 */
  align?: 'left' | 'right' | 'top' | 'inline';
}

/**
 * 字段布局，对齐原版OO.ui.FieldLayout：label+消息+字段区的排版容器，并承担标签联动——
 * 经Context向字段子树下发双通道（见FieldLabelLink）：输入类字段认领inputId与label的
 * htmlFor原生关联；无原生input的字段注册点击激活回调（原版simulateLabelClick）并经
 * labelId挂aria-labelledby（原版setLabelledBy）
 */
export const FieldLayout = forwardRef<HTMLDivElement, FieldLayoutProps>(({
  align = 'left',
  children,
  className,
  disabled,
  invisibleLabel,
  label,
  ...rest
}, ref) => {
  // 字段id与标签id：即使无字段认领，for指向不存在元素也只是原生空操作（无目标即无默认行为）
  const fieldId = useCleanId();
  const labelId = useCleanId();
  // 通道B注册的激活回调集（输入类字段不注册，label点击走原生for由浏览器处理）
  const activateCallbacksRef = useRef(new Set<() => void>());
  const link = useMemo<FieldLabelLink>(() => ({
    inputId: fieldId,
    labelId,
    registerLabelActivate: (activate) => {
      activateCallbacksRef.current.add(activate);
      return () => activateCallbacksRef.current.delete(activate);
    },
  }), [fieldId, labelId]);

  const classes = clsx(
    className,
    hasLabel(label) && 'oo-ui-labelElement',
    'oo-ui-fieldLayout',
    `oo-ui-fieldLayout-align-${align}`,
    // disabled须从rest剥离，否则泄漏为div的非法DOM属性
    disabled && 'oo-ui-fieldLayout-disabled',
  );

  const child = [
    <span className='oo-ui-fieldLayout-field' key='field'>
      {children}
    </span>,
    <span className='oo-ui-fieldLayout-header' key='header'>
      {/* 原版label为LabelWidget（static.tagName='label'）：带for的原生label元素承载
          联动；invisibleLabel的裁剪类落在label元素上 */}
      <label
        htmlFor={fieldId}
        id={labelId}
        className={clsx('oo-ui-labelElement-label', invisibleLabel && 'oo-ui-labelElement-invisible')}
        onClick={() => activateCallbacksRef.current.forEach((activate) => activate())}
      >
        {label}
      </label>
    </span>,
  ];

  return (
    <Layout
      {...rest}
      className={classes}
      ref={ref}
    >
      <FieldLabelLinkProvider value={link}>
        <div className='oo-ui-fieldLayout-body'>
          {align === 'inline' ? child : [...child].reverse()}
        </div>
      </FieldLabelLinkProvider>
    </Layout>
  );
});

FieldLayout.displayName = 'FieldLayout';
