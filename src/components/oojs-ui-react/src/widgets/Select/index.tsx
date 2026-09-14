import React, {
  useRef,
  useEffect,
  useLayoutEffect,
  useCallback,
  useMemo,
  forwardRef,
  type KeyboardEvent as ReactKeyboardEvent,
  type MouseEventHandler,
} from 'react';
import clsx from 'clsx';
import { MenuOption, type MenuOptionProps } from '../MenuOption';
import { MenuSectionOption, type MenuSectionOptionProps } from '../MenuSectionOption';
import { OutlineOption } from '../OutlineOption';
import {
  findRelativeSelectableItem,
  getSelectableValues,
  getWidgetClassName,
  mergeAriaLabelledBy,
  resolveTabIndex,
  type ChangeHandler,
} from '../../utils';
import { useCleanId, useControlledValue, useFieldLabelActivate, useMergedRefs, useOptionDrag, useOptionRegistry } from '../../hooks';
import type { WidgetProps } from '../Widget';

/**
 * 选择集选项。带`value`的为可选项，不带的为分组标题（MenuSectionOption）；
 * `value`同时作为选中态匹配依据与列表key
 */
export type SelectOptionProps =
  | MenuOptionProps
  | (MenuSectionOptionProps & { value?: undefined });

/** 字符前缀跳转的缓冲时长（ms），对齐原版SelectWidget.onDocumentKeyPress的1500 */
const KEY_PRESS_BUFFER_MS = 1500;

/** Home/End/PageUp/PageDown的按键量（页步长），对齐原版findRelativeSelectableItem的±1与±10 */
const NAVIGATION_STEPS = { home: 1, end: -1, pageUp: -10, pageDown: 10 } as const;

export interface SelectProps extends Omit<WidgetProps<HTMLDivElement>, 'children'> {
  /** 选中选项回调函数（值优先）。对齐原版select事件：仅值发生变化时触发 */
  onChange?: ChangeHandler<string | number>;

  /**
   * 选定选项回调（值优先）。对齐原版choose事件：每一次选定（点击/拖拽/Enter）都触发，
   * 含重复选定当前项。菜单类容器用它收起菜单——原版由MenuSelectWidget的hideOnChoose
   * 承担，本工程的显隐由调用方持有，故需该无条件通道
   */
  onChoose?: ChangeHandler<string | number>;

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
  onChoose,
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
  'aria-labelledby': ariaLabelledBy,
  ...rest
}, ref) => {
  const { value: currentValue, commitIfChanged } = useControlledValue<string | number>({ value, defaultValue }, onChange);
  // 高亮半受控：传入highlightedValue即由上层管理（如Dropdown的键盘导航与hover高亮），
  // 独立使用时内部维护。undefined也是合法写入值（Escape/Tab清除高亮）
  const { value: currentHighlighted, commit: setHighlighted } = useControlledValue<string | number | undefined>(
    { value: highlightedValue },
    onHighlightedChange,
  );
  // 选项DOM索引的注册值：全部带value的选项（禁用项也注册——命中后由可选性过滤），
  // 与下方registerItem的调用集合同源，供索引淘汰已移除选项
  const optionValues = useMemo(() => {
    const values: (string | number)[] = [];
    for (const option of options) {
      if (option.value !== undefined) {
        values.push(option.value);
      }
    }
    return values;
  }, [options]);
  // 选项DOM双向索引（值→元素供前缀匹配/滚动，元素→值供拖拽定位），供拖拽与滚动共用
  const { itemRefs, registerItem, findItemFromNode } = useOptionRegistry<string | number>(optionValues);
  const keyPressBufferRef = useRef<{ buffer: string; timer: number }>({ buffer: '', timer: 0 });
  const rootRef = useRef<HTMLDivElement>(null);
  const setRootRef = useMergedRefs(ref, rootRef);
  // 可选值序列（有value且未禁用）：键盘导航、悬停高亮与拖拽的共用目标集合。
  // 另建Set供O(1)命中——拖拽mousemove逐帧调用isValueSelectable
  const selectableValues = useMemo(() => getSelectableValues(options), [options]);
  const selectableValueSet = useMemo(() => new Set(selectableValues), [selectableValues]);
  // FieldLayout标签联动（通道B）：点击标签聚焦容器（对齐原版TabIndexedElement.simulateLabelClick
  // 基线focus()，禁用时不聚焦）
  const fieldLabelId = useFieldLabelActivate(() => {
    if (!disabled) {
      rootRef.current?.focus();
    }
  });

  /** 值是否可选（在可选值集合内） */
  const isValueSelectable = (optionValue: string | number) => selectableValueSet.has(optionValue);

  /**
   * 选定选项：先按值变化提交（对齐原版`chooseItem`先`selectItem`），再无条件的派发onChoose
   * （对齐其后的`emit('choose')`——菜单据此收起）。重复选中同一项只收起菜单、不派发选中事件
   */
  const commitSelection = (optionValue: string | number) => {
    commitIfChanged(optionValue);
    onChoose?.(optionValue);
  };

  const { pressed, pressedValue, handleMouseDown, handleUnpress } = useOptionDrag<string | number>({
    disabled,
    isValueSelectable,
    findItemFromNode,
    onCommit: commitSelection,
  });

  const classes = clsx(
    className,
    getWidgetClassName({ disabled }, 'select'),
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

  // 经useCallback稳定（内部读ref）：供高亮滚动的layout effect以稳定依赖引用
  const scrollItemIntoView = useCallback((optionValue: string | number) => {
    itemRefs.current.get(optionValue)?.scrollIntoView({ block: 'nearest' });
  }, [itemRefs]);

  // 高亮项变化时滚动到可见区（对齐原版键盘导航的滚动行为）。统一在此处理而非仅在
  // handleKeyDown里调用：受控高亮（上层如ComboBoxInput经MenuSelect传入，键盘事件
  // 不冒泡经过本组件）时仅靠handleKeyDown会漏掉滚动
  useLayoutEffect(() => {
    if (currentHighlighted !== undefined) {
      scrollItemIntoView(currentHighlighted);
    }
  }, [currentHighlighted, scrollItemIntoView]);

  /** 对齐原版findRelativeSelectableItem：从start（不含）按offset取可选值，支持环绕与过滤 */
  const findRelative = (
    start: string | number | undefined,
    offset: number,
    filter?: (optionValue: string | number) => boolean,
    wrap = listWrapsAround,
  ): string | number | undefined =>
    findRelativeSelectableItem(selectableValues, start, offset, filter, wrap);

  /** 键盘导航，对齐原版SelectWidget.onDocumentKeyDown与onDocumentKeyPress */
  const handleKeyDown = (e: ReactKeyboardEvent<HTMLDivElement>) => {
    onKeyDown?.(e);
    if (disabled) {
      return;
    }
    if (!selectableValues.length) {
      return;
    }
    // 对齐原版：导航目标为高亮项，无高亮（或高亮项已不在可选集）时回退选中项
    const current = currentHighlighted !== undefined && selectableValueSet.has(currentHighlighted)
      ? currentHighlighted
      : selectableValueSet.has(currentValue) ? currentValue : undefined;
    let next: string | number | undefined;
    let handled = false;

    switch (e.key) {
      case 'Enter':
        if (current !== undefined) {
          // 对齐原版chooseItem→selectItem：命中已选中项时无变化、不派发选中事件
          commitSelection(current);
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
            NAVIGATION_STEPS[
              e.key === 'Home' ? 'home' : e.key === 'End' ? 'end' : e.key === 'PageUp' ? 'pageUp' : 'pageDown'
            ],
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
          b.timer = window.setTimeout(clearKeyPressBuffer, KEY_PRESS_BUFFER_MS);
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

  const optionIdBase = useCleanId();
  /**
   * 选项元素id（对齐原版OptionWidget.getElementId）：调用方未显式给id时按数组下标生成
   * （useCleanId已去除`:`），供aria-activedescendant指向高亮项；下标口径与highlightedIndex一致
   */
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
      aria-labelledby={mergeAriaLabelledBy(fieldLabelId, ariaLabelledBy)}
      tabIndex={resolveTabIndex(tabIndex, disabled)}
      onKeyDown={handleKeyDown}
      onMouseUp={handleUnpress}
      onMouseDown={handleMouseDown}
      onMouseOver={handleMouseOver}
      onMouseLeave={handleMouseLeave}
      ref={setRootRef}
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

