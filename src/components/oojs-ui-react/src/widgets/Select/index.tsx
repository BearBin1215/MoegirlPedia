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
import { useControlledValue } from '../../hooks';
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
  const { value: currentValue, commit } = useControlledValue<string | number>({ value, defaultValue }, onChange);
  // 高亮半受控：传入highlightedValue即由上层管理（如Dropdown的键盘导航），独立使用时内部维护
  // （undefined也是合法写入值：Escape/Tab清除高亮）
  const { value: currentHighlighted, commit: setHighlighted } = useControlledValue<string | number | undefined>({ value: highlightedValue });
  const [pressed, setPressed] = useState(false);
  // 拖拽选择态：mousedown起点的可选项，拖动跨项时更新，mouseup时选中（对齐原版selecting）
  const selectingRef = useRef<string | number | null>(null);
  // 拖拽过程中被按压的选项值，驱动选项的pressed类（对齐原版pressItem）
  const [pressedValue, setPressedValue] = useState<string | number>();
  // 卸载时中止未完成的拖拽监听
  const cleanupDragRef = useRef<(() => void) | null>(null);
  const itemRefs = useRef(new Map<string | number, HTMLDivElement>());
  // DOM元素→选项值的反向索引，供拖拽时从事件target定位选项（对齐原版findTargetItem）
  const itemEls = useRef(new Map<Element, string | number>());
  const keyPressBufferRef = useRef<{ buffer: string; timer: number }>({ buffer: '', timer: 0 });

  const classes = clsx(
    className,
    generateWidgetClassName({ disabled }, 'select'),
    pressed ? 'oo-ui-selectWidget-pressed' : 'oo-ui-selectWidget-unpressed',
  );

  const handleUnpress: MouseEventHandler<HTMLDivElement> = () => {
    setPressed(false);
  };

  /** 从事件target沿祖先链定位选项值（对齐原版findTargetItem的closest('.oo-ui-optionWidget')） */
  const findItemFromNode = (node: EventTarget | null): string | number | null => {
    let el = node instanceof Element ? node : null;
    while (el) {
      const optionValue = itemEls.current.get(el);
      if (optionValue !== undefined) {
        return optionValue;
      }
      el = el.parentElement;
    }
    return null;
  };

  const isValueSelectable = (optionValue: string | number) =>
    options.some((option) => option.value === optionValue && isSelectable(option));

  /**
   * 拖拽选择，对齐原版SelectWidget.onMouseDown/onDocumentMouseMove/onDocumentMouseUp：
   * 左键在可选项上按下进入拖拽态，拖动跨项时按压项随之移动，mouseup时选中目标项
   * （拖拽未落在选项上时，mouseup落在的可选项也参与选择）
   */
  const handleMouseDown: MouseEventHandler<HTMLDivElement> = (e) => {
    // 原版onMouseDown恒返回false：阻止拖动过程中选中文本
    e.preventDefault();
    setPressed(true);
    if (disabled || e.button !== 0) {
      return;
    }
    // 重置上一次拖拽的残留状态（原版selecting同样存在丢失mouseup后的残留缺陷，此处有意改良）
    selectingRef.current = null;
    setPressedValue(undefined);
    const start = findItemFromNode(e.target);
    if (start !== null && isValueSelectable(start)) {
      selectingRef.current = start;
      setPressedValue(start);
    }
    const onMove = (ev: MouseEvent) => {
      const optionValue = findItemFromNode(ev.target);
      if (optionValue !== null && optionValue !== selectingRef.current && isValueSelectable(optionValue)) {
        selectingRef.current = optionValue;
        setPressedValue(optionValue);
      }
    };
    const onUp = (ev: MouseEvent) => {
      cleanupDragRef.current?.();
      setPressed(false);
      setPressedValue(undefined);
      let optionValue = selectingRef.current;
      selectingRef.current = null;
      if (optionValue === null) {
        const target = findItemFromNode(ev.target);
        optionValue = target !== null && isValueSelectable(target) ? target : null;
      }
      if (optionValue !== null) {
        commit(optionValue);
      }
    };
    // 拖拽被系统中断（如触屏滚动接管）时仅清理，不提交选择
    const onPointercancel = () => {
      cleanupDragRef.current?.();
      setPressed(false);
      setPressedValue(undefined);
      selectingRef.current = null;
    };
    const cleanupDrag = () => {
      document.removeEventListener('mousemove', onMove, true);
      document.removeEventListener('mouseup', onUp, true);
      document.removeEventListener('pointercancel', onPointercancel, true);
      cleanupDragRef.current = null;
    };
    cleanupDragRef.current = cleanupDrag;
    document.addEventListener('mousemove', onMove, true);
    document.addEventListener('mouseup', onUp, true);
    document.addEventListener('pointercancel', onPointercancel, true);
  };

  useEffect(() => () => cleanupDragRef.current?.(), []);

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
          commit(current);
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
      onMouseDown={handleMouseDown}
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
        const selected = currentValue === option.value;
        const isHighlighted = currentHighlighted === option.value;
        const itemRef = (el: HTMLDivElement | null) => {
          if (el) {
            itemRefs.current.set(option.value, el);
            itemEls.current.set(el, option.value);
          } else {
            const registered = itemRefs.current.get(option.value);
            if (registered) {
              itemEls.current.delete(registered);
            }
            itemRefs.current.delete(option.value);
          }
        };
        return outline ? (
          <OutlineOption
            {...option}
            key={option.value}
            ref={itemRef}
            selected={selected}
            pressed={pressedValue === option.value}
            highlighted={isHighlighted}
          >
            {option.children}
          </OutlineOption>
        ) : (
          <MenuOption
            {...option}
            key={option.value}
            ref={itemRef}
            selected={selected}
            pressed={pressedValue === option.value}
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
