import React, { forwardRef } from 'react';
import clsx from 'clsx';
import { Select, type SelectProps } from '../Select';

export type OutlineSelectProps = Omit<SelectProps, 'outline'>;

/** 大纲样式选择组件，对齐原版OO.ui.OutlineSelectWidget：委托Select输出outline类，经其渲染OutlineOption */
export const OutlineSelect = forwardRef<HTMLDivElement, OutlineSelectProps>(({
  className,
  ...rest
}, ref) => {
  const classes = clsx(
    className,
    'oo-ui-outlineSelectWidget',
  );

  return (
    <Select
      ref={ref}
      className={classes}
      {...rest}
      // outline置于spread之后：OutlineSelect恒为大纲样式，调用方不可覆盖
      outline
    />
  );
});

OutlineSelect.displayName = 'OutlineSelect';

