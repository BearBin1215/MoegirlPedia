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
  classes,
  disabled,
  icon,
  indicator,
  ...rest
}) => {
  const className = classNames(
    classes,
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
      className={className}
      aria-disabled={false}
      tabIndex={-1}
    >
      <IconBase icon={icon} />
      <LabelBase>{children}</LabelBase>
      <IndicatorBase indicator={indicator} />
    </div>
  );
};

export default MenuSectionOption;
