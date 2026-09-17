import React, { forwardRef, type ReactNode } from 'react';
import clsx from 'clsx';
import { IconBase } from '../../widgets/Icon/Base';
import { IndicatorBase } from '../../widgets/Indicator/Base';
import type { Indicators } from '../../Element';
import { LabelBase } from '../../widgets/Label/Base';
import { getWidgetClassName } from '../../mixins';
import type { WidgetProps } from '../../widgets/Widget';

export interface LabelToolGroupProps extends Omit<WidgetProps<HTMLDivElement>, 'children'> {

  /** 把手标签 */
  label?: ReactNode;

  /** 把手图标 */
  icon?: string;

  /** 把手指示器 */
  indicator?: Indicators;

  /**
   * 把手tooltip。写在根元素上——原版TitledElement的`$titled`缺省即`$element`，
   * LabelToolGroup未覆写落点
   */
  title?: string;

  /**
   * 工具组位置：`before`按声明顺序排在工具栏左侧，`after`排到右侧的`oo-ui-toolbar-after`容器。
   * 对齐原版ToolGroup的`align`配置
   * @default 'before'
   */
  align?: 'before' | 'after';
}

/**
 * 标签工具组，对齐原版OO.ui.LabelToolGroup：在工具栏内展示一段静态文本（可带图标与指示器），
 * 不可交互、也不能容纳工具——原版`populate`为空实现且移除了`.oo-ui-toolGroup-tools`容器，
 * 结构上只保留一个`.oo-ui-toolGroup-handle`（与PopupToolGroup共用样式）
 */
export const LabelToolGroup = forwardRef<HTMLDivElement, LabelToolGroupProps>(({
  className,
  disabled,
  label,
  icon,
  indicator,
  title,
  // align由Toolbar读取后决定挂载位置，本体不渲染，解构掉避免落成DOM属性
  align: _align,
  ...rest
}, ref) => {
  const classes = clsx(
    className,
    getWidgetClassName({ disabled, icon, indicator, label }),
    'oo-ui-toolGroup',
    'oo-ui-labelToolGroup',
  );

  return (
    <div
      {...rest}
      className={classes}
      title={title}
      aria-disabled={disabled || undefined}
      ref={ref}
    >
      <span className='oo-ui-toolGroup-handle oo-ui-labelToolGroup-handle'>
        <IconBase icon={icon} />
        <LabelBase>{label}</LabelBase>
        <IndicatorBase indicator={indicator} />
      </span>
    </div>
  );
});

LabelToolGroup.displayName = 'LabelToolGroup';
