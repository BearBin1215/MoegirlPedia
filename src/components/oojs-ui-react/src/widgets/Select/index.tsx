import React, {
  useState,
  forwardRef,
  type MouseEventHandler,
} from 'react';
import clsx from 'clsx';
import MenuOption, { type MenuOptionProps } from '../MenuOption';
import MenuSectionOption, { type MenuSectionOptionProps } from '../MenuSectionOption';
import OutlineOption from '../OutlineOption';
import { generateWidgetClassName } from '../../utils';
import type { WidgetProps } from '../Widget';
import type { OptionProps, OptionData } from '../Option';

/**
 * 选择集选项。带`value`的为可选项，不带的为分组标题（MenuSectionOption）；
 * `value`同时作为选中态匹配依据与列表key
 */
export type SelectOptionProps =
  | MenuOptionProps
  | (MenuSectionOptionProps & { value?: undefined });

export interface SelectProps extends Omit<WidgetProps<HTMLDivElement>, 'onSelect' | 'children'> {
  /** 选中选项回调函数 */
  onSelect?: (option: OptionData) => void;

  /** 当前选中值（受控，传入即受控模式） */
  value?: string | number;

  /** 非受控初始选中值 */
  defaultValue?: string | number;

  /** 是否渲染OutlineOption */
  outline?: boolean;

  /** 选项集 */
  options: SelectOptionProps[];

  /** 键盘导航当前高亮的选项value（由Dropdown等上层组件管理） */
  highlightedValue?: string | number;
}

/**
 * @description 选择组件，根据传入的子组件生成`MenuOption`或其他子组件
 */
const Select = forwardRef<HTMLDivElement, SelectProps>(({
  className,
  disabled,
  onSelect,
  value,
  defaultValue,
  outline,
  options,
  highlightedValue,
  ...rest
}, ref) => {
  const isControlled = value !== undefined;
  const [innerValue, setInnerValue] = useState<string | number | undefined>(defaultValue);
  const currentValue = isControlled ? value : innerValue;
  const [pressed, setPressed] = useState(false);

  const classes = clsx(
    className,
    generateWidgetClassName({ disabled }, 'select'),
    pressed ? 'oo-ui-selectWidget-pressed' : 'oo-ui-selectWidget-unpressed',
  );

  const handlePress: MouseEventHandler<HTMLDivElement> = () => {
    setPressed(true);
  };

  const handleUnpress: MouseEventHandler<HTMLDivElement> = () => {
    setPressed(false);
  };

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
      ref={ref}
    >
      {options.map((option, i) => {
        if (!('value' in option) || option.value === undefined) {
          return (
            <MenuSectionOption
              {...option}
              key={i}
            />
          );
        }
        const handleClick: MouseEventHandler<HTMLDivElement> = (e) => {
          if (option.onClick) {
            option.onClick(e);
          }
          if (onSelect && !option.disabled) {
            onSelect(option);
            if (!isControlled) {
              setInnerValue(option.value);
            }
          }
        };
        const selected = currentValue === option.value;
        const isHighlighted = highlightedValue === option.value;
        return outline ? (
          <OutlineOption
            {...option}
            key={option.value}
            onClick={handleClick}
            selected={selected}
            highlighted={isHighlighted}
          >
            {option.children}
          </OutlineOption>
        ) : (
          <MenuOption
            {...option}
            key={option.value}
            onClick={handleClick}
            selected={selected}
            highlighted={isHighlighted}
          >
            {option.children}
          </MenuOption>
        );
      })}
    </div>
  );
});

Select.displayName = 'Select';

export default Select;
