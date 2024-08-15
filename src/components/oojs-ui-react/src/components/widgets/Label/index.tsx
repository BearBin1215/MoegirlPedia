import React, { useRef, forwardRef, useImperativeHandle } from 'react';
import classNames from 'classnames';
import LabelBase from './Base';
import { processClassNames } from '../../../utils/tool';
import type { WidgetProps } from '../Widget';
import type { ElementRef } from '../../../types/ref';

export type LabelProps = WidgetProps<HTMLSpanElement>;

const Label = forwardRef<ElementRef<HTMLSpanElement>, LabelProps>(({
  className,
  children,
  disabled,
  ...rest
}, ref) => {
  const elementRef = useRef<HTMLSpanElement>(null);
  const classes = classNames(
    className,
    processClassNames({ disabled, label: children }, 'label'),
    'oo-ui-labelElement',
  );

  useImperativeHandle(ref, () => ({
    element: elementRef.current,
  }));

  return (
    <LabelBase
      {...rest}
      className={classes}
      aria-disabled={!!disabled}
      ref={elementRef}
    >
      {children}
    </LabelBase>
  );
});

Label.displayName = 'Label';

export default Label;
