import React from 'react';
import classNames from 'classnames';
import IconBase from '../Icon/Base';
import IndicatorBase from '../Indicator/Base';
import LabelBase from '../Label/Base';
import { processClassNames } from '../../utils/tool';
import type { FunctionComponent } from 'react';
import type { WidgetProps } from '../../types/props';
import type { IconElement, IndicatorElement } from '../../types/mixin';

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
    processClassNames({
      disabled,
      label: children,
      icon,
      indicator,
    }, 'option', 'decoratedOption', 'menuSectionOption'),
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
