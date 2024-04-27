import React, { useState, useMemo } from 'react';
import classNames from 'classnames';
import MenuOption from '../MenuOption';
import { processArray, processClassNames } from '../utils/tool';
import type { FunctionComponent, MouseEventHandler, ReactElement } from 'react';
import type { WidgetProps, MenuOptionProps, MenuSectionOptionProps } from '../types/props';
import type { OptionData } from '../Option';

export type OptionElement = ReactElement<MenuOptionProps | MenuSectionOptionProps>;

export interface SelectProps extends Omit<WidgetProps<HTMLDivElement>, 'ref'> {
  /** 选中选项回调函数 */
  onSelect?: (option: OptionData) => void;

  /** 当前值 */
  value?: any;

  /** 由`MenuOption`或`MenuSectionOption`组成的子元素 */
  children?: OptionElement | OptionElement[];
}

const Select: FunctionComponent<SelectProps> = ({
  children,
  className,
  disabled,
  onSelect,
  value,
  ...rest
}) => {
  const [pressed, setPressed] = useState(false);

  const options = useMemo(() => processArray(children), [children, value]);

  const classes = classNames(
    className,
    processClassNames({ disabled }, 'select'),
    pressed ? 'oo-ui-selectWidget-pressed' : 'oo-ui-selectWidget-depressed',
  );

  return (
    <div
      {...rest}
      className={classes}
      aria-disabled={!!disabled}
      tabIndex={-1}
      role='option'
      aria-selected={false}
      onMouseUp={() => setPressed(false)}
      onMouseDown={() => setPressed(true)}
      onMouseLeave={() => setPressed(false)}
    >
      {options.map((option) => {
        if (!('data' in option.props)) {
          return option;
        }
        const handleClick: MouseEventHandler<HTMLDivElement> = () => {
          if (onSelect && !option.props.disabled) {
            onSelect(option.props as OptionData);
          }
        };
        return (
          <MenuOption
            {...option.props}
            key={option.props.data}
            onClick={handleClick}
            selected={value === option.props.data}
          >
            {option.props.children}
          </MenuOption>
        );
      })}
    </div>
  );
};

export default Select;
