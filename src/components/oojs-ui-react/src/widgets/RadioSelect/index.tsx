import React, {
  useState,
  forwardRef,
  type ChangeEvent,
  type FocusEvent,
  type KeyboardEvent as ReactKeyboardEvent,
  type MouseEventHandler,
} from 'react';
import clsx from 'clsx';
import { RadioOption, type RadioOptionProps } from '../RadioOption';
import { generateWidgetClassName, type ChangeHandler } from '../../utils';
import { useControlledValue } from '../../hooks';
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

/**
 * 单选组，对齐原版OO.ui.RadioSelectWidget：整组以radiogroup聚焦，↑↓←→在非禁用项间
 * 环绕移动并直接改选、Enter重申当前项，聚焦且无选中项时自动选中首个非禁用项（细节见各处理器）
 */
export const RadioSelect = forwardRef<HTMLDivElement, RadioSelectProps>(({
  options,
  className,
  disabled,
  name,
  value,
  defaultValue,
  onChange,
  onKeyDown,
  onFocus,
  ...rest
}, ref) => {
  const { value: currentValue, commit } = useControlledValue<string | number, ChangeEvent<HTMLInputElement>>(
    { value, defaultValue },
    onChange,
  );
  const [pressed, setPressed] = useState(false);

  const classes = clsx(
    className,
    generateWidgetClassName({ disabled }, 'select', 'radioSelect'),
    pressed ? 'oo-ui-selectWidget-pressed' : 'oo-ui-selectWidget-unpressed',
  );

  // 对齐原版SelectWidget.onMouseDown（RadioSelectWidget继承）：仅可用且左键时进入按压态
  const handlePress: MouseEventHandler<HTMLDivElement> = (e) => {
    if (!disabled && e.button === 0) {
      setPressed(true);
    }
  };

  const handleUnpress: MouseEventHandler<HTMLDivElement> = () => {
    setPressed(false);
  };

  /**
   * 键盘改选。不转发option.onChange：那是原生input change事件的透传通道，
   * 键盘改选对应原版chooseItem→setSelected（静默更新input勾选态、不发change），
   * 仅提交组级onChange并同步非受控内部值
   */
  const commitSelection = (optionValue: string | number) => {
    commit(optionValue);
  };

  /**
   * 键盘导航，对齐原版RadioSelectWidget（经SelectWidget.onDocumentKeyDown绑定于focus/blur）：
   * ↑↓←→在非禁用项间移动并直接改选（radio选项无高亮态，等效chooseItem），端点环绕
   * （static.listWrapsAround=true）；Enter重申当前选中项；Home/End/PageUp/PageDown不处理
   * （static.handleNavigationKeys=false）。无选中项时↓从首项、↑从末项起步
   */
  const handleKeyDown = (e: ReactKeyboardEvent<HTMLDivElement>) => {
    onKeyDown?.(e);
    if (disabled) {
      return;
    }
    const selectable = options.filter((option) => !option.disabled);
    if (!selectable.length) {
      return;
    }
    const currentIndex = selectable.findIndex((option) => option.value === currentValue);
    switch (e.key) {
      case 'Enter':
        if (currentIndex !== -1) {
          commitSelection(selectable[currentIndex].value);
          e.preventDefault();
          e.stopPropagation();
        }
        break;
      case 'ArrowUp':
      case 'ArrowLeft':
      case 'ArrowDown':
      case 'ArrowRight': {
        const delta = e.key === 'ArrowUp' || e.key === 'ArrowLeft' ? -1 : 1;
        const next = currentIndex === -1
          ? selectable[delta === 1 ? 0 : selectable.length - 1]
          : selectable[(currentIndex + delta + selectable.length) % selectable.length];
        commitSelection(next.value);
        e.preventDefault();
        e.stopPropagation();
        break;
      }
    }
  };

  /** 对齐原版SelectWidget.onFocus：Tab聚焦组根本身（内层radio/label均tabIndex=-1）且无选中项时，自动选中首个非禁用项 */
  const handleFocus = (e: FocusEvent<HTMLDivElement>) => {
    onFocus?.(e);
    if (disabled || e.target !== e.currentTarget) {
      return;
    }
    if (options.some((option) => option.value === currentValue)) {
      return;
    }
    const first = options.find((option) => !option.disabled);
    if (first) {
      commitSelection(first.value);
    }
  };

  return (
    <div
      {...rest}
      className={classes}
      aria-disabled={disabled || undefined}
      role='radiogroup'
      tabIndex={disabled ? -1 : 0}
      onKeyDown={handleKeyDown}
      onFocus={handleFocus}
      onMouseUp={handleUnpress}
      onMouseDown={handlePress}
      onMouseLeave={handleUnpress}
      ref={ref}
    >
      {options.map((option) => {
        const handleChange: ChangeHandler<boolean, HTMLInputElement> = (checked, event) => {
          option.onChange?.(checked, event);
          commit(option.value, event);
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

