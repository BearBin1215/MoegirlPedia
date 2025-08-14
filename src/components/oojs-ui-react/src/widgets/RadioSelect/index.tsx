import React, {
  useState,
  forwardRef,
  type MouseEventHandler,
} from 'react';
import clsx from 'clsx';
import RadioOption, { type RadioOptionProps } from '../RadioOption';
import { generateWidgetClassName } from '../../utils';
import type { WidgetProps } from '../Widget';
import type { ChangeHandler } from '../../mixins';

export interface RadioSelectProps extends WidgetProps {
  options: RadioOptionProps[];

  name?: string;

  onChange?: ChangeHandler<string | number | undefined, HTMLInputElement>;
}

const RadioSelect = forwardRef<HTMLDivElement, RadioSelectProps>(({
  options,
  className,
  disabled,
  name,
  onChange,
  ...rest
}, ref) => {
  const [value, setValue] = useState<string | number | undefined>();
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
        const handleChange: ChangeHandler<boolean, HTMLInputElement> = (changeEvent) => {
          const newValue = option.data;
          if (typeof option.onChange === 'function') {
            option.onChange(changeEvent);
          }
          if (typeof onChange === 'function') {
            onChange({
              oldValue: value,
              value: newValue,
              event: changeEvent?.event,
            });
          }
          setValue(option.data);
        };
        return (
          <RadioOption
            {...option}
            disabled={option.disabled === void 0 ? disabled : option.disabled}
            selected={value === option.data}
            key={option.data}
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
