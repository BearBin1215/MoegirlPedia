import React, { forwardRef } from 'react';
import clsx from 'clsx';
import { clamp } from 'es-toolkit';
import { generateWidgetClassName } from '../../utils';
import type { WidgetProps } from '../Widget';

export interface ProgressBarProps extends WidgetProps<HTMLDivElement> {

  /**
   * 进度百分比（0-100）；`false`为不定进度（显示滚动条纹）
   * @default false
   */
  progress?: number | false;
}

/**
 * 进度条，对齐原版OO.ui.ProgressBarWidget
 */
export const ProgressBar = forwardRef<HTMLDivElement, ProgressBarProps>(({
  className,
  disabled,
  progress = false,
  ...rest
}, ref) => {
  // 数值进度钳制到0-100（超出范围的width/aria-valuenow无意义）；
  // 非有限值（NaN）按不定进度处理，避免输出非法的width:NaN%/aria-valuenow="NaN"
  const bounded = progress === false || !Number.isFinite(progress)
    ? false
    : clamp(progress, 0, 100);
  const classes = clsx(
    className,
    generateWidgetClassName({ disabled }),
    'oo-ui-progressBarWidget',
    bounded === false && 'oo-ui-progressBarWidget-indeterminate',
  );

  return (
    <div
      {...rest}
      className={classes}
      role='progressbar'
      aria-disabled={disabled || undefined}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={bounded === false ? undefined : bounded}
      ref={ref}
    >
      <div
        className='oo-ui-progressBarWidget-bar'
        style={bounded === false ? undefined : { width: `${bounded}%` }}
      />
    </div>
  );
});

ProgressBar.displayName = 'ProgressBar';

