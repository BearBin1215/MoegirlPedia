import React, {
  useState,
  useRef,
  useEffect,
  forwardRef,
  type KeyboardEvent as ReactKeyboardEvent,
  type MouseEventHandler,
} from 'react';
import clsx from 'clsx';
import MenuOption, { type MenuOptionProps } from '../MenuOption';
import MenuSectionOption, { type MenuSectionOptionProps } from '../MenuSectionOption';
import OutlineOption from '../OutlineOption';
import { generateWidgetClassName, type ChangeHandler } from '../../utils';
import type { WidgetProps } from '../Widget';

/**
 * 选择集选项。带`value`的为可选项，不带的为分组标题（MenuSectionOption）；
 * `value`同时作为选中态匹配依据与列表key
 */
export type SelectOptionProps =
  | MenuOptionProps
  | (MenuSectionOptionProps & { value?: undefined });

type SelectableOption = MenuOptionProps & { value: string | number };

const isSelectable = (option: SelectOptionProps): option is SelectableOption =>
  'value' in option && option.value !== undefined && !option.disabled;

export interface SelectProps extends Omit<WidgetProps<HTMLDivElement>, 'children'> {
  /** 选中选项回调函数（值优先） */
  onChange?: ChangeHandler<string | number>;

  /** 当前选中值（受控，传入即受控模式） */
  value?: string | number;

  /** 非受控初始选中值 */
  defaultValue?: string | number;

  /** 是否渲染OutlineOption */
  outline?: boolean;

  /** 选项集 */
  options: SelectOptionProps[];

  /** 键盘导航高亮值（受控，传入即由上层如Dropdown管理；独立使用时组件内部维护） */
  highlightedValue?: string | number;

  /** 是否处理Home/End/PageUp/PageDown导航键。对齐原版static.handleNavigationKeys：基础SelectWidget为false，MenuSelectWidget为true */
  handleNavigationKeys?: boolean;

  /** 键盘导航到端点后是否环绕，对齐原版static.listWrapsAround */
  listWrapsAround?: boolean;
}

/**
 * @description 选择组件，根据传入的子组件生成`MenuOption`或其他子组件。
 * 键盘行为对齐原版SelectWidget：聚焦后↑↓←→环绕移动高亮（无高亮时回退选中项）、
 * Enter选中、Home/End/PageUp/PageDown可选、字符前缀跳转（1500ms缓冲）、Escape/Tab清除高亮
 */
const Select = forwardRef<HTMLDivElement, SelectProps>(({
  className,
  disabled,
  onChange,
  value,
  defaultValue,
  outline,
  options,
  highlightedValue,
  handleNavigationKeys = false,
  listWrapsAround = true,
  tabIndex,
  onKeyDown,
  ...rest
}, ref) => {
  const isControlled = value !== undefined;
  const [innerValue, setInnerValue] = useState<string | number | undefined>(defaultValue);
  const currentValue = isControlled ? value : innerValue;
  // 高亮半受控：传入highlightedValue即由上层管理（如Dropdown的键盘导航），独立使用时内部维护
  const isHighlightedControlled = highlightedValue !== undefined;
  const [innerHighlighted, setInnerHighlighted] = useState<string | number | undefined>();
  const currentHighlighted = isHighlightedControlled ? highlightedValue : innerHighlighted;
  const [pressed, setPressed] = useState(false);
  const itemRefs = useRef(new Map<string | number, HTMLDivElement>());
  const keyPressBufferRef = useRef<{ buffer: string; timer: number }>({ buffer: '', timer: 0 });

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

  const setHighlighted = (optionValue: string | number | undefined) => {
    if (!isHighlightedControlled) {
      setInnerHighlighted(optionValue);
    }
  };

  const choose = (optionValue: string | number) => {
    onChange?.(optionValue);
    if (!isControlled) {
      setInnerValue(optionValue);
    }
  };

  const clearKeyPressBuffer = () => {
    clearTimeout(keyPressBufferRef.current.timer);
    keyPressBufferRef.current = { buffer: '', timer: 0 };
  };

  useEffect(() => () => clearTimeout(keyPressBufferRef.current.timer), []);

  /** 选项label前缀匹配，对齐原版getItemMatcher（忽略大小写，空缓冲匹配一切） */
  const matchesBuffer = (optionValue: string | number, buffer: string) =>
    (itemRefs.current.get(optionValue)?.textContent ?? '')
      .trim()
      .toLowerCase()
      .startsWith(buffer.trim().toLowerCase());

  const scrollItemIntoView = (optionValue: string | number) => {
    itemRefs.current.get(optionValue)?.scrollIntoView({ block: 'nearest' });
  };

  /** 对齐原版findRelativeSelectableItem：从start（不含）按offset取可选值，支持环绕与过滤 */
  const findRelative = (
    start: string | number | undefined,
    offset: number,
    filter?: (optionValue: string | number) => boolean,
    wrap = listWrapsAround,
  ): string | number | undefined => {
    const selectable = options.filter(isSelectable);
    if (!selectable.length) {
      return undefined;
    }
    const step = offset > 0 ? 1 : -1;
    const startIndex = start === undefined
      ? -1
      : selectable.findIndex((o) => o.value === start);
    if (startIndex === -1) {
      const candidate = offset > 0 ? selectable[0] : selectable[selectable.length - 1];
      return candidate && (!filter || filter(candidate.value)) ? candidate.value : undefined;
    }
    let index = startIndex;
    const maxSteps = wrap ? selectable.length : Math.abs(offset);
    for (let i = 0; i < maxSteps; i++) {
      let nextIndex = index + step;
      if (nextIndex < 0 || nextIndex >= selectable.length) {
        if (!wrap) {
          return undefined;
        }
        nextIndex = (nextIndex + selectable.length) % selectable.length;
      }
      index = nextIndex;
      const candidate = selectable[index];
      if (!filter || filter(candidate.value)) {
        return candidate.value;
      }
      if (wrap && index === startIndex) {
        return undefined;
      }
    }
    return undefined;
  };

  /** 键盘导航，对齐原版SelectWidget.onDocumentKeyDown与onDocumentKeyPress */
  const handleKeyDown = (e: ReactKeyboardEvent<HTMLDivElement>) => {
    onKeyDown?.(e);
    if (disabled) {
      return;
    }
    const selectable = options.filter(isSelectable);
    if (!selectable.length) {
      return;
    }
    // 对齐原版：导航目标为高亮项，无高亮时回退选中项
    const current = currentHighlighted !== undefined && selectable.some((o) => o.value === currentHighlighted)
      ? currentHighlighted
      : selectable.find((o) => o.value === currentValue)?.value;
    let next: string | number | undefined;
    let handled = false;

    switch (e.key) {
      case 'Enter':
        if (current !== undefined) {
          choose(current);
          handled = true;
        }
        break;
      case 'ArrowUp':
      case 'ArrowLeft':
      case 'ArrowDown':
      case 'ArrowRight':
        clearKeyPressBuffer();
        next = findRelative(current, e.key === 'ArrowUp' || e.key === 'ArrowLeft' ? -1 : 1);
        handled = true;
        break;
      case 'Home':
      case 'End':
      case 'PageUp':
      case 'PageDown':
        if (handleNavigationKeys) {
          clearKeyPressBuffer();
          // Home/PageUp从头或向前，End/PageDown从尾或向后（对齐原版findRelativeSelectableItem(null,±1)与±10）
          next = findRelative(
            e.key === 'PageUp' || e.key === 'PageDown' ? current : undefined,
            e.key === 'Home' ? 1 : e.key === 'End' ? -1 : e.key === 'PageUp' ? -10 : 10,
          );
          handled = true;
        }
        break;
      case 'Escape':
      case 'Tab':
        // 对齐原版：清除高亮但不阻止默认行为（不阻止tab移出/失焦）
        setHighlighted(undefined);
        handled = false;
        break;
      case 'Backspace': {
        const b = keyPressBufferRef.current;
        if (b.buffer) {
          b.buffer = b.buffer.slice(0, -1);
          handled = true;
        }
        break;
      }
      default: {
        if (e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) {
          const b = keyPressBufferRef.current;
          clearTimeout(b.timer);
          b.timer = window.setTimeout(clearKeyPressBuffer, 1500);
          // 对齐原版onDocumentKeyPress：连打同字符在同名前缀项间循环，否则累计缓冲
          let item = current;
          if (b.buffer === e.key && item !== undefined) {
            item = findRelative(item, 1);
          }
          const buffer = b.buffer === e.key ? b.buffer : b.buffer + e.key;
          b.buffer = buffer;
          if (item === undefined || !matchesBuffer(item, buffer)) {
            item = findRelative(item, 1, (optionValue) => matchesBuffer(optionValue, buffer));
          }
          if (item !== undefined) {
            next = item;
          }
          handled = true;
        }
        break;
      }
    }

    if (next !== undefined) {
      setHighlighted(next);
      scrollItemIntoView(next);
    }
    if (handled) {
      e.preventDefault();
      e.stopPropagation();
    }
  };

  return (
    <div
      {...rest}
      className={classes}
      aria-disabled={!!disabled}
      role='listbox'
      aria-multiselectable={false}
      tabIndex={tabIndex ?? (disabled ? -1 : 0)}
      onKeyDown={handleKeyDown}
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
          if (onChange && !option.disabled) {
            onChange(option.value);
            if (!isControlled) {
              setInnerValue(option.value);
            }
          }
        };
        const selected = currentValue === option.value;
        const isHighlighted = currentHighlighted === option.value;
        const itemRef = (el: HTMLDivElement | null) => {
          if (el) {
            itemRefs.current.set(option.value, el);
          } else {
            itemRefs.current.delete(option.value);
          }
        };
        return outline ? (
          <OutlineOption
            {...option}
            key={option.value}
            ref={itemRef}
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
            ref={itemRef}
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
