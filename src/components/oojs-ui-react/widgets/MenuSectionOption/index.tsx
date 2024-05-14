import React, { useRef, forwardRef, useImperativeHandle } from 'react';
import classNames from 'classnames';
import IconBase from '../Icon/Base';
import IndicatorBase from '../Indicator/Base';
import LabelBase from '../Label/Base';
import { processClassNames } from '../../utils/tool';
import type { WidgetProps } from '../../types/props';
import type { IconElement, IndicatorElement } from '../../types/mixin';
import type { ElementRef } from '../../types/ref';

export interface MenuSectionOptionProps extends
  WidgetProps<HTMLDivElement>,
  IconElement,
  IndicatorElement { }

const MenuSectionOption = forwardRef<ElementRef<HTMLDivElement>, MenuSectionOptionProps>(({
  children,
  className,
  disabled,
  icon,
  indicator,
  ...rest
}, ref) => {
  const elementRef = useRef<HTMLDivElement>(null);

  const classes = classNames(
    className,
    processClassNames({
      disabled,
      label: children,
      icon,
      indicator,
    }, 'option', 'decoratedOption', 'menuSectionOption'),
  );

  useImperativeHandle(ref, () => ({
    element: elementRef.current,
  }));

  return (
    <div
      {...rest}
      className={classes}
      aria-disabled={!!disabled}
      tabIndex={-1}
      ref={elementRef}
    >
      <IconBase icon={icon} />
      <LabelBase>{children}</LabelBase>
      <IndicatorBase indicator={indicator} />
    </div>
  );
});

MenuSectionOption.displayName = 'MenuSectionOption';

export default MenuSectionOption;
