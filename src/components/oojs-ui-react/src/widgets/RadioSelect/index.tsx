import React, {
  useState,
  forwardRef,
  type MouseEventHandler,
} from 'react';
import clsx from 'clsx';
import RadioOption, { type RadioOptionProps } from '../RadioOption';
import { generateWidgetClassName, type ChangeHandler } from '../../utils';
import type { WidgetProps } from '../Widget';

export interface RadioSelectProps extends WidgetProps {
  options: RadioOptionProps[];

  name?: string;

  /** 当前选中值（受控，传入即受控模式） */
  value?: string | number;

  /** 非受控初始选中值 */
  defaultValue?: string | number;

  onChange?: ChangeHandler<string | number | undefined, HTMLInputElement>;
}

const RadioSelect = forwardRef<HTMLDivElement, RadioSelectProps>(({
  options,
  className,
  disabled,
  name,
  value,
  defaultValue,
  onChange,
  ...rest
}, ref) => {
  const isControlled = value !== undefined;
  const [innerValue, setInnerValue] = useState<string | number | undefined>(defaultValue);
  const currentValue = isControlled ? value : innerValue;
  const [pressed, setPressed] = useState(false);

  const classes = clsx(
    className,
    generateWidgetClassName({ disabled }, 'select', 'radioSelect'),
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
      role='radiogroup'
      tabIndex={disabled ? -1 : 0}
      onMouseUp={handleUnpress}
      onMouseDown={handlePress}
      onMouseLeave={handleUnpress}
      ref={ref}
    >
      {options.map((option) => {
        const handleChange: ChangeHandler<boolean, HTMLInputElement> = (checked, event) => {
          option.onChange?.(checked, event);
          onChange?.(option.value, event);
          if (!isControlled) {
            setInnerValue(option.value);
          }
        };
        return (
          <RadioOption
            {...option}
            disabled={option.disabled === void 0 ? disabled : option.disabled}
            selected={currentValue === option.value}
            key={option.value}
            name={name}
            onChange={handleChange}
          />
        );
      })}
    </div>
  );
});

RadioSelect.displayName = 'RadioSelect';

export default RadioSelect;
