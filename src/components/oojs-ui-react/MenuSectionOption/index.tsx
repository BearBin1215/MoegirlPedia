import React from 'react';
import classNames from 'classnames';
import IconBase from '../Icon/Base';
import IndicatorBase from '../Indicator/Base';
import LabelBase from '../Label/Base';
import type { FunctionComponent } from 'react';
import type { WidgetProps } from '../props';
import type { IconElement, IndicatorElement } from '../mixin';

export interface MenuSectionOptionProps extends
  WidgetProps<HTMLDivElement>,
  IconElement,
  IndicatorElement { }

const MenuSectionOption: FunctionComponent<MenuSectionOptionProps> = ({
  children,
  className,
  disabled,
  icon,
  indicator,
  ...rest
}) => {
  const classes = classNames(
    className,
    'oo-ui-widget',
    disabled ? 'oo-ui-widget-disabled' : 'oo-ui-widget-enabled',
    children && 'oo-ui-labelElement',
    'oo-ui-optionWidget',
    icon && 'oo-ui-iconElement',
    indicator && 'oo-ui-indicatorElement',
    'oo-ui-decoratedOptionWidget',
    'oo-ui-menuSectionOptionWidget',
  );

  return (
    <div
      {...rest}
      className={classes}
      aria-disabled={!!disabled}
      tabIndex={-1}
    >
      <IconBase icon={icon} />
      <LabelBase>{children}</LabelBase>
      <IndicatorBase indicator={indicator} />
    </div>
  );
};

export default MenuSectionOption;
