import React, { type ReactNode } from 'react';
import clsx from 'clsx';
import { IconBase, type IconBaseProps } from '../Icon/Base';
import { IndicatorBase, type IndicatorBaseProps } from '../Indicator/Base';
import { LabelBase } from '../Label/Base';
import type { IconElement, IndicatorElement } from '../../Element';

export interface ButtonSlotsProps extends IconElement, IndicatorElement {
  /**
   * 图标/指示器共用的变体类（`oo-ui-image-*`，两者同一规则着色）。
   * 生产者：按钮系的`getButtonIconClasses`、选项系的`getOptionIconClasses`
   */
  variantClasses?: string;

  /** 图标span附加属性（对齐原版$icon上的配置能力），className与变体类合并 */
  iconProps?: Omit<IconBaseProps, 'icon'>;

  /** 标签内容 */
  label?: ReactNode;

  /** 标签可视（视觉隐藏但保留可访问名称，裁剪类落在label元素上） */
  labelInvisible?: boolean;

  /** 指示器span附加属性（对齐原版$indicator上的配置能力），className与变体类合并 */
  indicatorProps?: Omit<IndicatorBaseProps, 'indicator'>;

  /** 渲染在图标/标签/指示器之后的附加内容（Button锚点内的附加位，如file input覆盖层） */
  trailing?: ReactNode;
}

/**
 * 按钮系内容槽位：图标→标签→指示器的固定顺序（对齐原版ButtonElement的$icon/$label/$indicator
 * 排布，无图标/指示器时照常输出noIcon/noIndicator空占位）。Button/ButtonOption/ButtonInput/
 * DecoratedOption/ComboBoxInput下拉按钮共用，收敛各自手写的三元结构
 */
export function ButtonSlots({
  icon,
  iconProps,
  variantClasses,
  label,
  labelInvisible,
  indicator,
  indicatorProps,
  trailing,
}: ButtonSlotsProps) {
  return (
    <>
      <IconBase
        icon={icon}
        {...iconProps}
        className={clsx(variantClasses, iconProps?.className)}
      />
      <LabelBase invisible={labelInvisible}>{label}</LabelBase>
      <IndicatorBase
        indicator={indicator}
        {...indicatorProps}
        className={clsx(variantClasses, indicatorProps?.className)}
      />
      {trailing}
    </>
  );
}
