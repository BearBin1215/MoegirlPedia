import React, {
  useState,
  useRef,
  forwardRef,
  useImperativeHandle,
  type Key,
  type MouseEventHandler,
} from 'react';
import classNames from 'classnames';
import MenuOption from '../MenuOption';
import MenuSectionOption, { type MenuSectionOptionProps } from '../MenuSectionOption';
import OutlineOption from '../OutlineOption';
import { processClassNames } from '../../../utils/tool';
import type { WidgetProps, OptionProps } from '../../../types/props';
import type { OptionData } from '../Option';
import type { ElementRef } from '../../../types/ref';

export type SelectOptionProps = (OptionProps | MenuSectionOptionProps) & {
  key: Key;
};

export interface SelectProps extends Omit<WidgetProps<HTMLDivElement>, 'onSelect' | 'children'> {
  /** 选中选项回调函数 */
  onSelect?: (option: OptionData) => void;

  /** 当前值 */
  value?: any;

  /** 是否渲染OutlineOption */
  outline?: boolean;

  /** 选项集 */
  options: SelectOptionProps[];
}

/**
 * @description 选择组件，根据传入的子组件生成`MenuOption`或其他子组件
 * @todo 不再使用ReactElement的方式限制子元素，改用props传入选项参数
 */
const Select = forwardRef<ElementRef<HTMLDivElement>, SelectProps>(({
  className,
  disabled,
  onSelect,
  value,
  outline,
  options,
  ...rest
}, ref) => {
  const [pressed, setPressed] = useState(false);
  const elementRef = useRef<HTMLDivElement>(null);

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
        if (!('data' in option)) {
          return (
            <MenuSectionOption
              {...option}
              key={option.key}
            />
          );
        }
        const handleClick: MouseEventHandler<HTMLDivElement> = (e) => {
          if (option.onClick) {
            option.onClick(e);
          }
          if (onSelect && !option.disabled) {
            onSelect(option as OptionData);
          }
        };
        return outline ? (
          <OutlineOption
            {...option}
            key={option.key}
            onClick={handleClick}
            selected={value === option.data}
          >
            {option.children}
          </OutlineOption>
        ) : (
          <MenuOption
            {...option}
            key={option.key}
            onClick={handleClick}
            selected={value === option.data}
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
