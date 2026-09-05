import React, { forwardRef } from 'react';
import clsx from 'clsx';
import { hasLabel } from '../../utils';
import LabelBase from '../../widgets/Label/Base';
import IconBase from '../../widgets/Icon/Base';
import Label from '../../widgets/Label';
import PopupButton from '../../widgets/PopupButton';
import type { WidgetProps } from '../../widgets/Widget';
import type { IconElement } from '../../widgets/Icon';
import type { LabelElement } from '../../widgets/Label';

export interface FieldsetLayoutProps extends
  WidgetProps<HTMLFieldSetElement>,
  LabelElement,
  IconElement {

  /** 帮助文本（对齐原版help配置） */
  help?: React.ReactNode;

  /**
   * 帮助文本是否内联显示。对齐原版：`true`时以`oo-ui-inline-help`标签显示在字段集头部之后；
   * `false`时渲染为帮助图标，点击弹出说明
   */
  helpInline?: boolean;
}

/** @description 字段集布局，对齐原版OO.ui.FieldsetLayout（fieldset元素 + legend头部 + group分组） */
const FieldsetLayout = forwardRef<HTMLFieldSetElement, FieldsetLayoutProps>(({
  children,
  className,
  label,
  icon,
  help,
  helpInline = false,
  ...rest
}, ref) => {
  const classes = clsx(
    className,
    hasLabel(label) && 'oo-ui-labelElement',
    icon && 'oo-ui-iconElement',
    'oo-ui-fieldsetLayout',
  );

  return (
    <fieldset
      {...rest}
      className={classes}
      ref={ref}
    >
      <legend className='oo-ui-fieldsetLayout-header'>
        {/* 对齐原版IconElement混入：legend内为纯icon span，不带IconWidget的widget类，避免行内布局错位 */}
        <IconBase icon={icon} />
        <LabelBase>{label}</LabelBase>
        {help && !helpInline && (
          <PopupButton
            className='oo-ui-fieldsetLayout-help'
            framed={false}
            icon='info'
            aria-label='帮助'
            padded
            popupContent={help}
          />
        )}
      </legend>
      {help && helpInline && <Label className='oo-ui-inline-help'>{help}</Label>}
      <div className='oo-ui-fieldsetLayout-group'>
        {children}
      </div>
    </fieldset>
  );
});

FieldsetLayout.displayName = 'FieldsetLayout';

export default FieldsetLayout;
