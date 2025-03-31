import React, {
  useState,
  forwardRef,
  type MouseEventHandler,
  type ReactElement,
} from 'react';
import classNames from 'classnames';
import RadioOption, { type RadioOptionProps } from '../RadioOption';
import { processArray, processClassNames } from '../../../utils/tool';
import type { WidgetProps } from '../Widget';
import type { ChangeHandler } from '../../../types/utils';

type OptionElement = ReactElement<RadioOptionProps>;

export interface RadioSelectProps extends WidgetProps {
  children: OptionElement | OptionElement[];

  /** 默认要勾选的选项 */
  defaultValue?: string | number;

  name?: string;

  onChange?: ChangeHandler<string | number | undefined, HTMLInputElement>;
}

const RadioSelect = forwardRef<HTMLDivElement, RadioSelectProps>(({
  children,
  className,
  defaultValue,
  disabled,
  name,
  onChange,
  ...rest
}, ref) => {
  const [value, setValue] = useState(defaultValue);
  const [pressed, setPressed] = useState(false);

  const options = processArray(children);

  const classes = classNames(
    className,
    processClassNames({ disabled }, 'select', 'radioSelect'),
    pressed ? 'oo-ui-selectWidget-pressed' : 'oo-ui-selectWidget-depressed',
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
          const newValue = option.props.data;
          if (typeof option.props.onChange === 'function') {
            option.props.onChange(changeEvent);
          }
          if (typeof onChange === 'function') {
            onChange({
              oldValue: value,
              value: newValue,
              event: changeEvent?.event,
            });
          }
          setValue(option.props.data);
        };
        return (
          <RadioOption
            {...option.props}
            disabled={option.props.disabled === void 0 ? disabled : option.props.disabled}
            selected={value === option.props.data}
            key={option.key}
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
