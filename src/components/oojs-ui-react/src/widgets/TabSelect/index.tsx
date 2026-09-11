import React, {
  forwardRef,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type FocusEvent,
} from 'react';
import clsx from 'clsx';
import TabOption, { type TabOptionProps } from '../TabOption';
import { generateWidgetClassName, type ChangeHandler } from '../../utils';
import { useControlledValue, useOptionDrag, useOptionRegistry } from '../../hooks';
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
  const { value: currentValue, commit } = useControlledValue<string | number>({ value, defaultValue }, onChange);
  const { itemRefs, registerItem, findItemFromNode } = useOptionRegistry<string | number>();
  const [focused, setFocused] = useState(false);
  const optionsRef = useRef(options);
  // document级keydown监听仅在focus时绑定，需经ref读取最新值状态（避免闭包过期）
  const valueRef = useRef(currentValue);
  const disabledRef = useRef(disabled);
  const commitRef = useRef(commit);
  optionsRef.current = options;
  valueRef.current = currentValue;
  disabledRef.current = disabled;
  commitRef.current = commit;

  const isValueSelectable = (optionValue: string | number) => {
    const option = optionsRef.current.find((o) => o.value === optionValue);
    return !!option && !option.disabled;
  };

  const { pressed, pressedValue, handleMouseDown, handleUnpress } = useOptionDrag<string | number>({
    disabled,
    isValueSelectable,
    findItemFromNode,
    onCommit: (optionValue) => {
      if (!disabled) {
        commit(optionValue);
      }
    },
  });

  const classes = clsx(
    className,
    generateWidgetClassName({ disabled }, 'select', 'tabSelect'),
    pressed ? 'oo-ui-selectWidget-pressed' : 'oo-ui-selectWidget-unpressed',
    framed ? 'oo-ui-tabSelectWidget-framed' : 'oo-ui-tabSelectWidget-frameless',
  );

  // 选中项变化时滚动到可见区（对齐原版TabOptionWidget.scrollIntoViewOnSelect=true）：
  // 页签集横向溢出时使新选中项进入视野；itemRefs读取最新元素，无需列入依赖
  useLayoutEffect(() => {
    if (currentValue !== undefined) {
      itemRefs.current.get(currentValue)?.scrollIntoView({ block: 'nearest', inline: 'nearest' });
    }
  }, [currentValue]);

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
          // Enter重申当前选中项（无选中项不响应）
          if (currentIndex !== -1) {
            next = selectable[currentIndex];
            handled = true;
          }
          break;
        case 'ArrowUp':
        case 'ArrowLeft':
          // 无选中项时自末项起步，否则环绕前移
          next = currentIndex === -1
            ? selectable[selectable.length - 1]
            : selectable[(currentIndex - 1 + selectable.length) % selectable.length];
          handled = true;
          break;
        case 'ArrowDown':
        case 'ArrowRight':
          // 无选中项时自首项起步，否则环绕后移
          next = currentIndex === -1
            ? selectable[0]
            : selectable[(currentIndex + 1) % selectable.length];
          handled = true;
          break;
        default:
          break;
      }
      if (next) {
        commitRef.current(next.value);
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

  return (
    <div
      {...rest}
      className={classes}
      aria-disabled={disabled || undefined}
      role='tablist'
      tabIndex={tabIndex ?? (disabled ? -1 : 0)}
      onFocus={(e: FocusEvent<HTMLDivElement>) => {
        setFocused(true);
        rest.onFocus?.(e);
      }}
      onBlur={(e: FocusEvent<HTMLDivElement>) => {
        setFocused(false);
        rest.onBlur?.(e);
      }}
      onMouseDown={handleMouseDown}
      onMouseUp={handleUnpress}
      onMouseLeave={handleUnpress}
      ref={ref}
    >
      {options.map((option) => (
        <TabOption
          {...option}
          key={option.value}
          ref={registerItem(option.value)}
          selected={currentValue === option.value}
          pressed={pressedValue === option.value}
        >
          {option.children}
        </TabOption>
      ))}
    </div>
  );
});

TabSelect.displayName = 'TabSelect';

export default TabSelect;
