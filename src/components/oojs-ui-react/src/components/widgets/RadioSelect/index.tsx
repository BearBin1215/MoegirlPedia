import React, {
  useState,
  forwardRef,
  type MouseEventHandler,
} from 'react';
import classNames from 'classnames';
import RadioOption, { type RadioOptionProps } from '../RadioOption';
import { processClassNames } from '../../../utils/tool';
import type { WidgetProps } from '../Widget';
import type { ChangeHandler } from '../../../types/utils';

export interface RadioSelectProps extends WidgetProps {
  options: RadioOptionProps[];

  /** 默认要勾选的选项 */
  defaultValue?: string | number;

  name?: string;

  onChange?: ChangeHandler<string | number | undefined, HTMLInputElement>;
}

const RadioSelect = forwardRef<HTMLDivElement, RadioSelectProps>(({
  options,
  className,
  defaultValue,
  disabled,
  name,
  onChange,
  ...rest
}, ref) => {
  const [value, setValue] = useState(defaultValue);
  const [pressed, setPressed] = useState(false);

  const classes = classNames(
    className,
    processClassNames({ disabled }, 'select', 'radioSelect'),
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
