import React, {
  useState,
  forwardRef,
  useEffect,
  useRef,
  type FocusEvent,
  type MouseEventHandler,
} from 'react';
import clsx from 'clsx';
import TabOption, { type TabOptionProps } from '../TabOption';
import { type ChangeHandler } from '../../utils';
import type { WidgetProps } from '../Widget';

export type TabSelectOptionProps = TabOptionProps;

export interface TabSelectProps extends Omit<WidgetProps<HTMLDivElement>, 'onSelect'> {
  /** 是否有边框 */
  framed?: boolean;

  /** 当前选中值（受控，传入即受控模式） */
  value?: string | number;

  /** 非受控初始选中值 */
  defaultValue?: string | number;

  /** 选项集 */
  options: TabSelectOptionProps[];

  /** 选中选项回调函数（值优先） */
  onChange?: ChangeHandler<string | number>;
}

/** 选项卡选择组件，对齐原版`TabSelectWidget`（role=tablist，聚焦后←→环绕选择） */
const TabSelect = forwardRef<HTMLDivElement, TabSelectProps>(({
  className,
  framed = true,
  value,
  defaultValue,
  options,
  onChange,
  disabled,
  tabIndex,
  ...rest
}, ref) => {
  const isControlled = value !== undefined;
  const [innerValue, setInnerValue] = useState<string | number | undefined>(defaultValue);
  const currentValue = isControlled ? value : innerValue;
  const [pressed, setPressed] = useState(false);
  const [focused, setFocused] = useState(false);
  const optionsRef = useRef(options);
  const valueRef = useRef(currentValue);
  const disabledRef = useRef(disabled);
  const onChangeRef = useRef(onChange);
  optionsRef.current = options;
  valueRef.current = currentValue;
  disabledRef.current = disabled;
  onChangeRef.current = onChange;

  const classes = clsx(
    className,
    'oo-ui-selectWidget',
    pressed ? 'oo-ui-selectWidget-pressed' : 'oo-ui-selectWidget-unpressed',
    'oo-ui-tabSelectWidget',
    framed ? 'oo-ui-tabSelectWidget-framed' : 'oo-ui-tabSelectWidget-frameless',
  );

  const choose = (option: TabSelectOptionProps) => {
    if (!disabled && !option.disabled) {
      onChangeRef.current?.(option.value);
      if (!isControlled) {
        setInnerValue(option.value);
      }
    }
  };

  // 对齐原版：聚焦后绑定document级keydown，失焦解绑；←→/↑↓环绕选择，Enter确认
  useEffect(() => {
    if (!focused) {
      return undefined;
    }
    const handleDocumentKeyDown = (e: KeyboardEvent) => {
      if (disabledRef.current) {
        return;
      }
      const selectable = optionsRef.current.filter((option) => !option.disabled);
      if (!selectable.length) {
        return;
      }
      const currentIndex = selectable.findIndex((option) => option.value === valueRef.current);
      let next: TabSelectOptionProps | undefined;
      let handled = false;
      switch (e.key) {
        case 'Enter':
          if (currentIndex !== -1) {
            next = selectable[currentIndex];
            handled = true;
          }
          break;
        case 'ArrowUp':
        case 'ArrowLeft':
          next = currentIndex === -1
            ? selectable[selectable.length - 1]
            : selectable[(currentIndex - 1 + selectable.length) % selectable.length];
          handled = true;
          break;
        case 'ArrowDown':
        case 'ArrowRight':
          next = currentIndex === -1
            ? selectable[0]
            : selectable[(currentIndex + 1) % selectable.length];
          handled = true;
          break;
        default:
          break;
      }
      if (next) {
        onChangeRef.current?.(next.value);
      }
      if (handled) {
        e.preventDefault();
        e.stopPropagation();
      }
    };
    document.addEventListener('keydown', handleDocumentKeyDown, true);
    return () => {
      document.removeEventListener('keydown', handleDocumentKeyDown, true);
    };
  }, [focused]);

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
      role='tablist'
      tabIndex={tabIndex ?? 0}
      onFocus={(e: FocusEvent<HTMLDivElement>) => {
        setFocused(true);
        rest.onFocus?.(e);
      }}
      onBlur={(e: FocusEvent<HTMLDivElement>) => {
        setFocused(false);
        rest.onBlur?.(e);
      }}
      onMouseDown={handlePress}
      onMouseUp={handleUnpress}
      onMouseLeave={handleUnpress}
      ref={ref}
    >
      {options.map((option) => (
        <TabOption
          {...option}
          key={option.value}
          selected={currentValue === option.value}
          onClick={(e) => {
            option.onClick?.(e);
            choose(option);
          }}
        >
          {option.children}
        </TabOption>
      ))}
    </div>
  );
});

TabSelect.displayName = 'TabSelect';

export default TabSelect;
