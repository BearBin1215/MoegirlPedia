import React, { forwardRef } from 'react';
import clsx from 'clsx';
import { iconElementClasses, labelElementClasses } from '../../mixins';
import { LabelBase } from '../../widgets/Label/Base';
import { IconBase } from '../../widgets/Icon/Base';
import { Label } from '../../widgets/Label';
import { PopupButton } from '../../widgets/PopupButton';
import type { WidgetProps } from '../../widgets/Widget';
import type { IconElement, LabelElement } from '../../Element';
import { useMessage } from '../../config';

export interface FieldsetLayoutProps extends
  WidgetProps<HTMLFieldSetElement>,
  LabelElement,
  IconElement {

  /** 帮助文本 */
  help?: React.ReactNode;

  /**
   * 帮助文本是否内联显示。`true`时以`oo-ui-inline-help`标签显示在字段集头部之后；
   * `false`时渲染为帮助图标，点击弹出说明
   */
  helpInline?: boolean;
}

/** 字段集布局，对齐原版OO.ui.FieldsetLayout（fieldset元素 + legend头部 + group分组） */
export const FieldsetLayout = forwardRef<HTMLFieldSetElement, FieldsetLayoutProps>(({
  children,
  className,
  label,
  invisibleLabel,
  icon,
  help,
  helpInline = false,
  ...rest
}, ref) => {
  // 帮助按钮的无障碍标签（对齐原版ooui-field-help消息）
  const helpAriaLabel = useMessage('ooui-field-help');
  // LabelElement/IconElement mixin贡献（FieldsetLayout是Layout而非Widget，故不走getWidgetClassName）
  const classes = clsx(
    className,
    // 根为原生<fieldset>、不经Layout组件，oo-ui-layout在此补齐（对齐原版继承OO.ui.Layout的根类）
    'oo-ui-layout',
    labelElementClasses({ label, invisibleLabel }),
    iconElementClasses({ icon }),
    'oo-ui-fieldsetLayout',
  );

  return (
    <fieldset
      {...rest}
      className={classes}
      ref={ref}
    >
      <legend className='oo-ui-fieldsetLayout-header'>
        <IconBase icon={icon} />
        <LabelBase invisible={invisibleLabel}>{label}</LabelBase>
        {help && !helpInline && (
          <PopupButton
            className='oo-ui-fieldsetLayout-help'
            framed={false}
            icon='info'
            aria-label={helpAriaLabel}
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

