import React, { useState, useMemo, useRef, forwardRef, useImperativeHandle } from 'react';
import classNames from 'classnames';
import MenuOption from '../MenuOption';
import OutlineOption from '../OutlineOption';
import { processArray, processClassNames } from '../../../utils/tool';
import type { MouseEventHandler, ReactElement } from 'react';
import type { WidgetProps, OptionProps, MenuSectionOptionProps } from '../../../types/props';
import type { OptionData } from '../Option';
import type { ElementRef } from '../../../types/ref';

export type OptionElement = ReactElement<OptionProps | MenuSectionOptionProps>;

export interface SelectProps extends Omit<WidgetProps<HTMLDivElement>, 'onSelect'> {
  /** 选中选项回调函数 */
  onSelect?: (option: OptionData) => void;

  /** 当前值 */
  value?: any;

  /** 由`MenuOption`或`MenuSectionOption`组成的子元素 */
  children?: OptionElement | OptionElement[];

  /** 是否渲染OutlineOption */
  outline?: boolean;
}

/** @description 选择组件，根据传入的子组件生成`MenuOption`或其他子组件 */
const Select = forwardRef<ElementRef<HTMLDivElement>, SelectProps>(({
  children,
  className,
  disabled,
  onSelect,
  value,
  outline,
  ...rest
}, ref) => {
  const [pressed, setPressed] = useState(false);
  const elementRef = useRef<HTMLDivElement>(null);

  const options = useMemo(() => processArray(children), [children, value]);

  const classes = classNames(
    className,
    processClassNames({ disabled }, 'select'),
    pressed ? 'oo-ui-selectWidget-pressed' : 'oo-ui-selectWidget-depressed',
  );

  const handlePress: MouseEventHandler<HTMLDivElement> = () => {
    setPressed(true);
  };

  const handleUnpress: MouseEventHandler<HTMLDivElement> = () => {
    setPressed(false);
  };

  useImperativeHandle(ref, () => ({
    element: elementRef.current,
  }), [value]);

  return (
    <div
      {...rest}
      className={classes}
      aria-disabled={!!disabled}
      role='listbox'
      aria-multiselectable={false}
      onMouseUp={handleUnpress}
      onMouseDown={handlePress}
      onMouseLeave={handleUnpress}
      ref={elementRef}
    >
      {options.map((option) => {
        if (!('data' in option.props)) {
          return option;
        }
        const handleClick: MouseEventHandler<HTMLDivElement> = (e) => {
          if (option.props.onClick) {
            option.props.onClick(e);
          }
          if (onSelect && !option.props.disabled) {
            onSelect(option.props as OptionData);
          }
        };
        return outline ? (
          <OutlineOption
            {...option.props}
            key={option.key}
            onClick={handleClick}
            selected={value === option.props.data}
          >
            {option.props.children}
          </OutlineOption>
        ) : (
          <MenuOption
            {...option.props}
            key={option.key}
            onClick={handleClick}
            selected={value === option.props.data}
          >
            {option.props.children}
          </MenuOption>
        );
      })}
    </div>
  );
});

Select.displayName = 'Select';

export default Select;
