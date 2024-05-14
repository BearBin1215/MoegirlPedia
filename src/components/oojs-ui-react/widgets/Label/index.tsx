import React, { useRef, forwardRef, useImperativeHandle } from 'react';
import classNames from 'classnames';
import LabelBase from './Base';
import { processClassNames } from '../../utils/tool';
import type { WidgetProps } from '../../types/props';
import type { ElementRef } from '../../types/ref';

export type LabelProps = WidgetProps<HTMLSpanElement>;

const Label = forwardRef<ElementRef<HTMLSpanElement>, LabelProps>(({
  className,
  children,
  disabled,
  ...rest
}, ref) => {
  const ElementRef = useRef<HTMLSpanElement>(null);
  const classes = classNames(
    className,
    processClassNames({ disabled, label: children }, 'label'),
    'oo-ui-labelElement',
  );

  useImperativeHandle(ref, () => ({
    element: ElementRef.current,
  }));

  return (
    <LabelBase
      {...rest}
      className={classes}
      aria-disabled={!!disabled}
      ref={ElementRef}
    >
      {children}
    </LabelBase>
  );
});

Label.displayName = 'Label';

export default Label;
