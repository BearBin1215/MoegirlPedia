import React, {
  useRef,
  useEffect,
  useLayoutEffect,
  forwardRef,
  type KeyboardEvent as ReactKeyboardEvent,
  type MouseEventHandler,
} from 'react';
import clsx from 'clsx';
import { MenuOption, type MenuOptionProps } from '../MenuOption';
import { MenuSectionOption, type MenuSectionOptionProps } from '../MenuSectionOption';
import { OutlineOption } from '../OutlineOption';
import { generateWidgetClassName, type ChangeHandler } from '../../utils';
import { useCleanId, useControlledValue, useOptionDrag, useOptionRegistry } from '../../hooks';
import type { WidgetProps } from '../Widget';

/**
 * 选择集选项。带`value`的为可选项，不带的为分组标题（MenuSectionOption）；
 * `value`同时作为选中态匹配依据与列表key
 */
export type SelectOptionProps =
  | MenuOptionProps
  | (MenuSectionOptionProps & { value?: undefined });

type SelectableOption = MenuOptionProps & { value: string | number };

/** 可选项判定（带value且未禁用）；键盘导航与选中目标集合共用（Select/Dropdown/ComboBoxInput一致） */
export const isSelectableOption = (option: SelectOptionProps): option is SelectableOption =>
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

  /** 高亮变化回调；传入highlightedValue时须经此回写父级，使鼠标悬停高亮与键盘高亮统一（Dropdown等读此值作键盘选择目标） */
  onHighlightedChange?: ChangeHandler<string | number | undefined>;

  /** 是否处理Home/End/PageUp/PageDown导航键。对齐原版static.handleNavigationKeys：基础SelectWidget为false，MenuSelectWidget为true */
  handleNavigationKeys?: boolean;

  /** 键盘导航到端点后是否环绕，对齐原版static.listWrapsAround */
  listWrapsAround?: boolean;
}

/**
 * 选择组件，根据传入的子组件生成`MenuOption`或其他子组件。
 * 键盘行为对齐原版SelectWidget：聚焦后↑↓←→环绕移动高亮（无高亮时回退选中项）、
 * Enter选中、Home/End/PageUp/PageDown可选、字符前缀跳转（1500ms缓冲）、Escape/Tab清除高亮
 */
export const Select = forwardRef<HTMLDivElement, SelectProps>(({
  className,
  disabled,
  onChange,
  value,
  defaultValue,
  outline,
  options,
  highlightedValue,
  onHighlightedChange,
  handleNavigationKeys = false,
  listWrapsAround = true,
  tabIndex,
  onKeyDown,
  onMouseLeave,
  ...rest
}, ref) => {
  const { value: currentValue, commit } = useControlledValue<string | number>({ value, defaultValue }, onChange);
  // 高亮半受控：传入highlightedValue即由上层管理（如Dropdown的键盘导航与hover高亮），
  // 独立使用时内部维护。undefined也是合法写入值（Escape/Tab清除高亮）
  const { value: currentHighlighted, commit: setHighlighted } = useControlledValue<string | number | undefined>(
    { value: highlightedValue },
    onHighlightedChange,
  );
  // 选项DOM双向索引（值→元素供前缀匹配/滚动，元素→值供拖拽定位），供拖拽与滚动共用
  const { itemRefs, registerItem, findItemFromNode } = useOptionRegistry<string | number>();
  const keyPressBufferRef = useRef<{ buffer: string; timer: number }>({ buffer: '', timer: 0 });

  /** 从事件target沿祖先链定位选项值（对齐原版findTargetItem的closest('.oo-ui-optionWidget')） */
  const isValueSelectable = (optionValue: string | number) =>
    options.some((option) => option.value === optionValue && isSelectableOption(option));

  const { pressed, pressedValue, handleMouseDown, handleUnpress } = useOptionDrag<string | number>({
    disabled,
    isValueSelectable,
    findItemFromNode,
    onCommit: commit,
  });

  const classes = clsx(
    className,
    generateWidgetClassName({ disabled }, 'select'),
    pressed ? 'oo-ui-selectWidget-pressed' : 'oo-ui-selectWidget-unpressed',
  );

  /**
   * 鼠标悬停高亮，对齐原版SelectWidget.onMouseOver/onMouseLeave：
   * 悬停可高亮项即高亮、离开清除；悬停高亮与键盘高亮共用同一状态，
   * 非受控时改内部state，受控时经onHighlightedChange回写（Dropdown/ComboBoxInput依赖）
   */
  const handleMouseOver: MouseEventHandler<HTMLDivElement> = (e) => {
    if (disabled) {
      return;
    }
    const optionValue = findItemFromNode(e.target);
    setHighlighted(optionValue !== null && isValueSelectable(optionValue) ? optionValue : undefined);
  };

  const handleMouseLeave: MouseEventHandler<HTMLDivElement> = (e) => {
    handleUnpress();
    if (!disabled) {
      setHighlighted(undefined);
    }
    onMouseLeave?.(e);
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

  // 高亮项变化时滚动到可见区（对齐原版键盘导航的滚动行为）。统一在此处理而非仅在
  // handleKeyDown里调用：受控高亮（上层如ComboBoxInput经MenuSelect传入，键盘事件
  // 不冒泡经过本组件）时仅靠handleKeyDown会漏掉滚动。
  // scrollItemIntoView经itemRefs读取最新元素，无过期闭包，无需列入依赖
  useLayoutEffect(() => {
    if (currentHighlighted !== undefined) {
      scrollItemIntoView(currentHighlighted);
    }
  }, [currentHighlighted]);

  /** 对齐原版findRelativeSelectableItem：从start（不含）按offset取可选值，支持环绕与过滤 */
  const findRelative = (
    start: string | number | undefined,
    offset: number,
    filter?: (optionValue: string | number) => boolean,
    wrap = listWrapsAround,
  ): string | number | undefined => {
    const selectable = options.filter(isSelectableOption);
    if (!selectable.length) {
      return undefined;
    }
    const step = offset > 0 ? 1 : -1;
    const startIndex = start === undefined
      ? -1
      : selectable.findIndex((o) => o.value === start);
    if (startIndex === -1) {
      // start不在可选集内：正向自首项、反向自末项起步，不满足filter则视为无目标
      const candidate = offset > 0 ? selectable[0] : selectable[selectable.length - 1];
      return candidate && (!filter || filter(candidate.value)) ? candidate.value : undefined;
    }
    let index = startIndex;
    // 环绕时上限一整圈保证可终止，否则最多走|offset|步
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
        // 绕回起点仍未命中filter：可选集内无满足条件的项
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
    const selectable = options.filter(isSelectableOption);
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
      // 滚动由高亮变化的layout effect统一处理（含受控高亮路径）
      setHighlighted(next);
    }
    if (handled) {
      e.preventDefault();
      e.stopPropagation();
    }
  };

  // 选项元素id（对齐原版OptionWidget.getElementId）：调用方未显式给id时按数组下标生成
  // （useCleanId去`:`），供aria-activedescendant指向高亮项；下标口径与highlightedIndex一致
  const optionIdBase = useCleanId();
  const optionElementId = (index: number) => options[index]?.id ?? `${optionIdBase}-${index}`;
  const highlightedIndex = currentHighlighted === undefined
    ? -1
    : options.findIndex((option) => option.value === currentHighlighted);

  return (
    <div
      {...rest}
      className={classes}
      aria-disabled={disabled || undefined}
      role='listbox'
      aria-multiselectable={false}
      // 高亮项关联：对齐原版SelectWidget.highlightItem将高亮项id写入$focusOwner（本工程为listbox根）
      // 的aria-activedescendant；无高亮时不输出
      aria-activedescendant={highlightedIndex >= 0 ? optionElementId(highlightedIndex) : undefined}
      tabIndex={tabIndex ?? (disabled ? -1 : 0)}
      onKeyDown={handleKeyDown}
      onMouseUp={handleUnpress}
      onMouseDown={handleMouseDown}
      onMouseOver={handleMouseOver}
      onMouseLeave={handleMouseLeave}
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
        const itemRef = registerItem(option.value);
        return outline ? (
          <OutlineOption
            {...option}
            id={optionElementId(i)}
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
            id={optionElementId(i)}
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

