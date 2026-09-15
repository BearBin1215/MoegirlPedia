import React, {
  forwardRef,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
  type KeyboardEvent,
  type MouseEvent,
  type ReactNode,
} from 'react';
import clsx from 'clsx';
import { IconBase } from '../Icon/Base';
import { IndicatorBase } from '../Indicator/Base';
import { TagItem } from '../TagItem';
import { MenuSelect } from '../MenuSelect';
import {
  flaggedElementClasses,
  getElementDir,
  getSelectableValues,
  getWidgetClassName,
  mergeAriaLabelledBy,
  mergeInvalidFlag,
  resolveTabIndex,
  toFlagArray,
  type ChangeHandler,
  type FlaggedElement,
} from '../../utils';
import { useControlledValue, useFieldLabelFocus, useMenuPopup } from '../../hooks';
import type { WidgetProps } from '../Widget';
import type { IconElement } from '../Icon';
import type { IndicatorElement } from '../Indicator';
import type { SelectOptionProps } from '../Select';
import { useDraggableKeys } from './useDraggableKeys';
import { useInlineInputWidth } from './useInlineInputWidth';

/** 输入框位置：inline标签区末尾、outline标签区下方、none无输入 */
export type TagInputPosition = 'inline' | 'outline' | 'none';

/** 标签菜单选项：值+显示文本（标签与菜单项共用），可用`children`自定义菜单项渲染 */
export interface TagOptionProps {
  /** 选项值（同时作为标签数据） */
  value: string | number;

  /** 显示文本（标签与菜单项），缺省显示value */
  label?: string;

  /** 菜单项自定义渲染内容，缺省用label/value */
  children?: ReactNode;

  /** 菜单项图标 */
  icon?: string;

  /** 选项禁用（禁用项不可添加为标签） */
  disabled?: boolean;

  /** 该选项对应的标签固定（不可移除） */
  fixed?: boolean;
}

export interface TagMultiselectProps extends
  Omit<WidgetProps<HTMLDivElement>, 'children' | 'onChange'>,
  IconElement,
  IndicatorElement,
  FlaggedElement {

  /** 标签值集合（受控，传入即受控模式）；标签文本取自菜单选项的label或值本身 */
  value?: (string | number)[];

  /** 非受控初始值 */
  defaultValue?: (string | number)[];

  /** 标签增删回调 */
  onChange?: ChangeHandler<(string | number)[]>;

  /**
   * 输入框位置
   * @default 'inline'
   */
  inputPosition?: TagInputPosition;

  /**
   * 允许添加任意值（不受`allowedValues`/菜单选项限制）
   * @default false
   */
  allowArbitrary?: boolean;

  /**
   * 允许重复值
   * @default false
   */
  allowDuplicates?: boolean;

  /**
   * 允许拖拽调整标签顺序。关闭时标签不可拖拽，且新增标签按白名单（allowedValues/菜单选项）
   * 的给定顺序插入而非追加（两者均对齐原版allowReordering的语义）
   * @default true
   */
  allowReordering?: boolean;

  /** 合法值白名单（无菜单时的取值约束） */
  allowedValues?: (string | number)[];

  /**
   * 允许展示非法标签：不合法/重复的值仍以标签呈现（输出invalid标志），整体随之标记为非法。
   * 关闭时非法值不予添加（对齐原版addTag的准入）
   * @default false
   */
  allowDisplayInvalidTags?: boolean;

  /** 标签数量上限；达到后输入禁用、不再新增 */
  tagLimit?: number;

  /**
   * 允许点击标签将其移回输入框编辑（对齐原版onTagSelect的编辑语义）
   * @default true
   */
  allowEditTags?: boolean;

  /** 输入框占位符 */
  placeholder?: string;

  /** 输入框name属性 */
  name?: string;

  /**
   * 菜单选项集。传入即启用候选菜单（菜单模式，对应原版OO.ui.MenuTagMultiselectWidget）：
   * 输入即过滤菜单、↑↓移动高亮、Enter选定高亮项、点击切换标签、已添加标签的菜单项呈选中态；
   * 未开启`allowArbitrary`时菜单选项构成标签的合法值域。
   * 内部组合通道——常规使用请走MenuTagMultiselect，勿直接在TagMultiselect上传入
   */
  options?: TagOptionProps[];

  /**
   * 选定菜单项后是否清空输入框的过滤文本（仅菜单模式生效）
   * @default true
   */
  clearInputOnChoose?: boolean;
}

/**
 * 标签多选组件，对齐原版OO.ui.TagMultiselectWidget：把输入值以标签（chip）形式呈现，
 * 支持自由输入/白名单校验、重复与数量限制、点击标签回填编辑、Backspace移除末尾标签、
 * ←→在标签间与输入框间导航、非法标签以invalid态呈现、拖拽重排。为空值集合提供受控/非受控双通道。
 * 输入框内的Enter提交为新标签、Escape清空、Backspace（未输入时）移除末尾标签。
 * 传入`options`即进入菜单模式（对应原版OO.ui.MenuTagMultiselectWidget），常规使用请走MenuTagMultiselect
 */
export const TagMultiselect = forwardRef<HTMLDivElement, TagMultiselectProps>(({
  className,
  disabled,
  icon,
  indicator,
  flags,
  value,
  defaultValue,
  onChange,
  inputPosition: inputPositionProp = 'inline',
  allowArbitrary = false,
  allowDuplicates = false,
  allowReordering = true,
  allowedValues,
  allowDisplayInvalidTags = false,
  tagLimit,
  allowEditTags = true,
  placeholder,
  name,
  options,
  clearInputOnChoose = true,
  tabIndex,
  'aria-labelledby': ariaLabelledBy,
  ...rest
}, ref) => {
  const isMenu = options !== undefined;
  // 非法位置回退inline（对齐原版allowedInputPositions白名单）
  const inputPosition: TagInputPosition =
    inputPositionProp === 'outline' || inputPositionProp === 'none' ? inputPositionProp : 'inline';
  const hasInput = inputPosition !== 'none';

  const { value: currentValue, commit } = useControlledValue<(string | number)[]>(
    { value, defaultValue: defaultValue ?? [] },
    onChange,
  );

  /** 输入框内的临时文本（非组件值，仅用于键入/过滤），Enter或失焦时提交为标签 */
  const [inputValue, setInputValue] = useState('');
  /** 输入框聚焦态：聚焦时清除整体非法标记（对齐原版onInputFocus的toggleValid(true)） */
  const [focused, setFocused] = useState(false);
  /** 菜单展开态 */
  const [open, setOpen] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const focusTrapRef = useRef<HTMLSpanElement>(null);
  const groupRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const outlineWrapperRef = useRef<HTMLDivElement>(null);

  /** 聚焦输入框；无输入时聚焦焦点陷阱（对齐原版TabIndexedElement.focus落于$tabIndexed） */
  const focusInput = useCallback(() => {
    if (hasInput) {
      inputRef.current?.focus();
    } else {
      focusTrapRef.current?.focus();
    }
  }, [hasInput]);

  // FieldLayout标签联动（通道B）：TagMultiselect无getInputId，点击标签聚焦输入框
  // （对齐原版simulateLabelClick=TabIndexedElement.focus）
  const {
    setRef,
    rootRef,
    fieldLabelId,
  } = useFieldLabelFocus<HTMLDivElement>({ ref, disabled, activate: () => focusInput() });

  const menuValues = useMemo(
    () => (options ?? []).map((option) => option.value),
    [options],
  );

  /** 合法值序列：白名单与菜单选项值合并并保持给定顺序（对齐原版MenuTagMultiselect的getAllowedValues） */
  const allowedValueList = useMemo(
    () => [...(allowedValues ?? []), ...menuValues],
    [allowedValues, menuValues],
  );

  /** 合法值集合（供O(1)命中） */
  const allowedValueSet = useMemo(
    () => new Set<string | number>(allowedValueList),
    [allowedValueList],
  );

  /** 值→菜单选项（同值取首个），用于标签文本与固定态 */
  const optionByValue = useMemo(() => {
    const map = new Map<string | number, TagOptionProps>();
    for (const option of options ?? []) {
      if (!map.has(option.value)) {
        map.set(option.value, option);
      }
    }
    return map;
  }, [options]);

  /** 标签文本：菜单选项label优先，否则为值本身 */
  const labelTextOf = (tagValue: string | number): string =>
    optionByValue.get(tagValue)?.label ?? String(tagValue);

  /**
   * 标签项（由值集合派生）：重复项（非首次出现）在不允许重复时标记非法；
   * 非白名单值在不允许任意值时标记非法（对齐原版isAllowedData的判定）
   */
  const items = useMemo(() => {
    const counter = new Map<string | number, number>();
    return (currentValue ?? []).map((itemValue) => {
      const occurrence = counter.get(itemValue) ?? 0;
      counter.set(itemValue, occurrence + 1);
      const option = optionByValue.get(itemValue);
      const valid = (!allowDuplicates && occurrence > 0)
        ? false
        : (allowArbitrary || allowedValueSet.has(itemValue));
      return {
        value: itemValue,
        occurrence,
        label: option?.children ?? option?.label ?? String(itemValue),
        fixed: !!option?.fixed,
        valid,
      };
    });
  }, [currentValue, allowDuplicates, allowArbitrary, allowedValueSet, optionByValue]);

  /** 是否未达标签数量上限 */
  const underLimit = !tagLimit || items.length < tagLimit;
  const allItemsValid = items.every((item) => item.valid);
  /**
   * 组件整体合法性：聚焦时视为合法（对齐原版onInputFocus的toggleValid(true)）；
   * 失焦时要求全部标签合法且输入框已清空（对齐原版onInputBlur）
   */
  const widgetInvalid = !(focused || (allItemsValid && (!hasInput || inputValue === '')));

  /** 值是否允许添加（对齐原版isAllowedData，基于给定列表避免批处理中的中间态提交） */
  const isAllowedIn = (list: (string | number)[], data: string | number): boolean => {
    if (!allowDuplicates && list.includes(data)) {
      return false;
    }
    return allowArbitrary || allowedValueSet.has(data);
  };

  /** 构造插入后的值数组：超限、或非法且不展示非法标签时返回null（对齐原版addTag准入） */
  const buildAdded = (list: (string | number)[], data: string | number): (string | number)[] | null => {
    if (tagLimit && list.length >= tagLimit) {
      return null;
    }
    if (!isAllowedIn(list, data) && !allowDisplayInvalidTags) {
      return null;
    }
    // 关闭拖拽重排时，白名单内的值按白名单给定顺序插入而非追加（对齐原版addTag的insertIndex计算）
    let insertIndex = list.length;
    if (!allowReordering) {
      const allowedIndex = allowedValueList.indexOf(data);
      if (allowedIndex !== -1) {
        insertIndex = 0;
        for (let i = 0; i < list.length; i++) {
          const itemAllowedIndex = allowedValueList.indexOf(list[i]);
          if (itemAllowedIndex !== -1 && itemAllowedIndex <= allowedIndex) {
            insertIndex = i + 1;
          } else {
            break;
          }
        }
      }
    }
    const next = list.slice();
    next.splice(insertIndex, 0, data);
    return next;
  };

  /** 追加标签并提交，返回是否添加成功 */
  const addTag = (data: string | number): boolean => {
    const next = buildAdded(currentValue, data);
    if (!next) {
      return false;
    }
    commit(next);
    return true;
  };

  /** 移除指定下标的标签 */
  const removeTagAt = (index: number) => {
    commit(currentValue.filter((_, i) => i !== index));
  };

  /** 移除首个匹配值的标签（对齐原版removeTagByData经findItemFromData取首项） */
  const removeTagByValue = (data: string | number) => {
    const index = currentValue.indexOf(data);
    if (index !== -1) {
      removeTagAt(index);
    }
  };

  /** 聚焦第index个标签元素 */
  const focusTagAt = (index: number) => {
    groupRef.current?.querySelectorAll<HTMLElement>('.oo-ui-tagItemWidget')[index]?.focus();
  };

  /** 菜单选项（按输入文本过滤，对齐原版filterFromInput的标签前缀匹配） */
  const menuSelectOptions: SelectOptionProps[] = useMemo(() => {
    const source = options ?? [];
    const query = inputValue.toLowerCase();
    const filtered = query
      ? source.filter((option) => (option.label ?? String(option.value)).toLowerCase().startsWith(query))
      : source;
    return filtered.map((option) => ({
      value: option.value,
      icon: option.icon,
      disabled: option.disabled,
      children: option.children ?? option.label ?? String(option.value),
    }));
  }, [options, inputValue]);

  const menuSelectableValues = useMemo(
    () => getSelectableValues(menuSelectOptions) as (string | number)[],
    [menuSelectOptions],
  );

  // 菜单开合与键盘高亮（端点钳制不环绕）；开启时点击外部/Escape关闭。非菜单模式open恒false
  const {
    highlightedValue,
    setHighlightedValue,
    handleNavigationKey,
    consumeNavigationKey,
  } = useMenuPopup<string | number>({
    open: isMenu && open,
    onClose: () => setOpen(false),
    values: menuSelectableValues,
    ignore: [rootRef, menuRef],
    // 菜单开启时Escape在捕获层被吞（收不到keydown），清空输入须经附加回调（对齐原版doInputEscape）
    onEscape: () => setInputValue(''),
  });

  // 菜单收起时清除高亮（对齐原版onMenuToggle的highlightItem(null)）
  useEffect(() => {
    if (!open) {
      setHighlightedValue(undefined);
    }
  }, [open, setHighlightedValue]);

  // 过滤时高亮首个匹配项（对齐原版highlightOnFilter：allowArbitrary时不自动高亮）
  useEffect(() => {
    if (isMenu && !allowArbitrary && inputValue) {
      setHighlightedValue(menuSelectableValues[0]);
    }
  }, [isMenu, allowArbitrary, inputValue, menuSelectableValues, setHighlightedValue]);

  // 满额时清空输入并收起菜单（对齐原版onChangeTags的isUnderLimit分支）
  useEffect(() => {
    if (!underLimit) {
      setInputValue('');
      setOpen(false);
    }
  }, [underLimit]);

  // inline输入框宽度自适应（对齐原版updateInputSize）：标签集合、输入值与容器宽度变化时重算
  useInlineInputWidth({
    enabled: inputPosition === 'inline' && !disabled,
    contentRef,
    inputRef,
    placeholder,
    value: inputValue,
    recomputeKey: items,
  });

  // ── 拖拽重排：状态机见useDraggableKeys（对齐原版DraggableElement/DraggableGroupElement）──
  /** 项的稳定key（值+出现次数，重复值亦可区分） */
  const keyOf = (item: { value: string | number; occurrence: number }) => `${item.value}#${item.occurrence}`;

  // 固定标签作为屏障项：自身不可拖拽，且非固定项不得被拖到它之前
  const barrierKeys = useMemo(
    () => new Set(items.filter((item) => item.fixed).map(keyOf)),
    [items],
  );
  const {
    draggingKey,
    dragPhase,
    previewKeys,
    startDrag,
    handleDragOver,
    endDrag,
  } = useDraggableKeys({
    keys: items.map(keyOf),
    enabled: allowReordering && !disabled,
    isBarrier: (key) => barrierKeys.has(key),
  });

  /** 渲染项：拖拽预览期间按预览顺序输出，其余情况按实际顺序 */
  const renderItems = useMemo(() => {
    const entries = items.map((item, realIndex) => ({ item, realIndex, key: keyOf(item) }));
    if (!previewKeys) {
      return entries;
    }
    const byKey = new Map(entries.map((entry) => [entry.key, entry]));
    const ordered = previewKeys
      .map((key) => byKey.get(key))
      .filter((entry): entry is (typeof entries)[number] => entry !== undefined);
    // 预览顺序须覆盖全部项，否则回退实际顺序（拖拽期间项集合变化的兜底）
    return ordered.length === entries.length ? ordered : entries;
  }, [items, previewKeys]);

  /** 拖拽结束/放下：预览顺序映射回值数组，顺序变化时提交 */
  const handleDragEnd = () => {
    const finalKeys = endDrag();
    if (!finalKeys) {
      return;
    }
    const valueByKey = new Map(items.map((item) => [keyOf(item), item.value]));
    const reordered: (string | number)[] = [];
    for (const key of finalKeys) {
      const itemValue = valueByKey.get(key);
      if (itemValue !== undefined) {
        reordered.push(itemValue);
      }
    }
    if (reordered.length === currentValue.length
      && reordered.some((nextValue, index) => nextValue !== currentValue[index])) {
      commit(reordered);
    }
  };

  /**
   * 从输入框解析待添加的标签：菜单模式取高亮菜单项优先于原始输入文本
   * （对齐原版getTagInfoFromInput的`findHighlightedItem() || findItemFromData(val)`）。
   * `useHighlight`为false时忽略高亮，仅提交输入文本
   */
  const getTagInfoFromInput = (useHighlight: boolean): { value: string | number } | null => {
    if (isMenu && useHighlight && highlightedValue !== undefined) {
      return { value: highlightedValue };
    }
    return inputValue ? { value: inputValue } : null;
  };

  /** 提交输入框内容为标签，成功时清空输入框 */
  const addTagFromInput = (useHighlight = true): boolean => {
    const info = getTagInfoFromInput(useHighlight);
    if (!info) {
      return false;
    }
    const next = buildAdded(currentValue, info.value);
    if (!next) {
      return false;
    }
    commit(next);
    setInputValue('');
    return true;
  };

  const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    setInputValue(event.target.value);
    if (isMenu) {
      setOpen(true);
    }
  };

  const handleInputFocus = () => {
    setFocused(true);
    if (isMenu && underLimit) {
      setOpen(true);
    }
  };

  const handleInputBlur = () => {
    setFocused(false);
    // 先收起菜单（收起即清除高亮，对齐原版MenuTagMultiselect.onMenuToggle）再提交，
    // 且提交时忽略高亮——原版失焦提交发生在菜单收起之后，不会把高亮项当作输入内容提交
    setOpen(false);
    setHighlightedValue(undefined);
    addTagFromInput(false);
  };

  /** 光标是否仍位于输入文本内（决定←→是移动光标还是转向标签导航，对齐原版isMovementInsideInput） */
  const isMovementInsideInput = (direction: 'backwards' | 'forwards'): boolean => {
    const input = inputRef.current;
    if (!input) {
      return true;
    }
    const from = input.selectionStart ?? 0;
    const to = input.selectionEnd ?? 0;
    if (direction === 'forwards' && to > inputValue.length - 1) {
      return false;
    }
    if (direction === 'backwards' && from <= 0) {
      return false;
    }
    return true;
  };

  const handleInputKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (disabled) {
      return;
    }
    // 菜单模式下导航键驱动菜单高亮（对齐原版MenuSelectWidget接管输入框按键）
    if (isMenu && (event.key === 'ArrowDown' || event.key === 'ArrowUp')) {
      event.preventDefault();
      setOpen(true);
      handleNavigationKey(event.key);
      return;
    }
    if (isMenu && consumeNavigationKey(event)) {
      return;
    }

    switch (event.key) {
      case 'Enter':
        // 提交高亮菜单项或输入文本为标签
        event.preventDefault();
        addTagFromInput();
        break;
      case 'Backspace': {
        // 仅inline位置、输入为空且有标签时处理（对齐原版doInputBackspace）
        if (inputPosition === 'inline' && inputValue === '' && items.length > 0) {
          const lastIndex = items.length - 1;
          const lastItem = items[lastIndex];
          if (!lastItem.fixed) {
            event.preventDefault();
            removeTagAt(lastIndex);
            // 未按Ctrl/Cmd时把被移除标签的文本回填输入框以便编辑
            if (!event.metaKey && !event.ctrlKey) {
              setInputValue(labelTextOf(lastItem.value));
            }
          }
        }
        break;
      }
      case 'Escape':
        setInputValue('');
        break;
      case 'ArrowLeft':
      case 'ArrowRight': {
        // 方向按元素有效方向解析：LTR下←向后、→向前，RTL相反
        const isRtl = getElementDir(event.currentTarget) === 'rtl';
        const direction = ((event.key === 'ArrowLeft') !== isRtl) ? 'backwards' : 'forwards';
        // 光标已在文本端点时转向标签导航：向后聚焦末尾标签（对齐原版doInputArrow）
        if (!isMovementInsideInput(direction)
          && inputPosition === 'inline'
          && items.length > 0
          && direction === 'backwards') {
          focusTagAt(items.length - 1);
        }
        break;
      }
    }
  };

  /** 点击标签：菜单模式（非任意值）在菜单中高亮对应项，否则移回输入框编辑（对齐原版onTagSelect） */
  const handleTagSelect = (index: number) => {
    const item = items[index];
    if (!item) {
      return;
    }
    if (isMenu && !allowArbitrary) {
      if (hasInput) {
        setInputValue('');
      }
      focusInput();
      if (underLimit) {
        setOpen(true);
        setHighlightedValue(item.value);
      }
      return;
    }
    if (hasInput && allowEditTags && !item.fixed) {
      let next = currentValue;
      if (inputValue) {
        const added = buildAdded(next, inputValue);
        if (added) {
          next = added;
        }
      }
      next = next.filter((_, i) => i !== index);
      commit(next);
      setInputValue(labelTextOf(item.value));
      focusInput();
    }
  };

  /** 标签间←→导航：向前到末项后交还输入框，向后止于首项（对齐原版onTagNavigate） */
  const handleTagNavigate = (index: number, direction: 'backwards' | 'forwards') => {
    if (direction === 'forwards') {
      if (index < items.length - 1) {
        focusTagAt(index + 1);
      } else if (hasInput) {
        focusInput();
      } else {
        focusTagAt(0);
      }
    } else if (index > 0) {
      focusTagAt(index - 1);
    }
  };

  /** 选定菜单项：已有对应标签则移除，否则添加（对齐原版onMenuChoose的切换语义） */
  const handleMenuChoose = (optionValue: string | number) => {
    if (currentValue.includes(optionValue)) {
      removeTagByValue(optionValue);
    } else {
      addTag(optionValue);
    }
    if (hasInput && clearInputOnChoose) {
      setInputValue('');
    }
  };

  /** 点击handle空白处聚焦输入框（对齐原版onMouseDown；点击输入框自身不处理） */
  const handleHandleMouseDown = (event: MouseEvent<HTMLDivElement>) => {
    if (!disabled && (!hasInput || event.target !== inputRef.current) && event.button === 0) {
      event.preventDefault();
      event.stopPropagation();
      focusInput();
    }
  };

  const inputDisabled = disabled || !underLimit;
  const inputTabIndex = resolveTabIndex(tabIndex, disabled);

  const classes = clsx(
    className,
    getWidgetClassName({ disabled, icon, indicator }, 'tagMultiselect'),
    hasInput && (inputPosition === 'outline'
      ? 'oo-ui-tagMultiselectWidget-outlined'
      : 'oo-ui-tagMultiselectWidget-inlined'),
    isMenu && 'oo-ui-menuTagMultiselectWidget',
    // 组级拖拽类对齐原版：组根标记draggableGroupElement，拖拽期间追加dragging
    'oo-ui-draggableGroupElement',
    draggingKey !== null && 'oo-ui-draggableGroupElement-dragging',
    focused && 'oo-ui-tagMultiselectWidget-focus',
    flaggedElementClasses(mergeInvalidFlag(toFlagArray(flags), widgetInvalid)),
  );

  /** 输入框元素：inline时直接置于标签组内，outline时置于标签区下方（位置经渲染位置区分） */
  const inputElement = hasInput ? (
    <input
      ref={inputRef}
      className={clsx(
        'oo-ui-inputWidget-input',
        // 满额时隐藏inline输入框（对齐原版toggleClass('oo-ui-element-hidden')）
        inputPosition === 'inline' && !underLimit && 'oo-ui-element-hidden',
      )}
      type='text'
      name={name}
      value={inputValue}
      placeholder={inputPosition === 'outline' && !underLimit ? '' : placeholder}
      disabled={inputDisabled}
      tabIndex={inputTabIndex}
      aria-disabled={inputDisabled || undefined}
      // aria-labelledby落在$tabIndexed（输入框）上，与原版setLabelledBy落点一致
      aria-labelledby={mergeAriaLabelledBy(fieldLabelId, ariaLabelledBy)}
      autoComplete='off'
      onChange={handleInputChange}
      onKeyDown={handleInputKeyDown}
      onFocus={handleInputFocus}
      onBlur={handleInputBlur}
    />
  ) : null;

  return (
    <div
      {...rest}
      className={classes}
      aria-disabled={disabled || undefined}
      ref={setRef}
      onDragOver={handleDragOver}
    >
      <div
        className='oo-ui-tagMultiselectWidget-handle'
        onMouseDown={handleHandleMouseDown}
      >
        <IndicatorBase indicator={indicator} />
        <IconBase icon={icon} />
        <div className='oo-ui-tagMultiselectWidget-content' ref={contentRef}>
          <div
            className='oo-ui-tagMultiselectWidget-group'
            ref={groupRef}
          >
            {renderItems.map((entry, position) => (
              <TagItem
                key={entry.key}
                label={entry.item.label}
                fixed={entry.item.fixed}
                valid={entry.item.valid}
                disabled={disabled}
                // data-index取预览位置（对齐原版拖拽预览期间的updateIndexes）
                index={position}
                draggable={allowReordering && !disabled && !entry.item.fixed}
                dragPhase={draggingKey === entry.key ? dragPhase : undefined}
                onDragStart={(event) => startDrag(entry.key, event)}
                onDragEnd={handleDragEnd}
                onDrop={handleDragEnd}
                onRemove={() => removeTagAt(entry.realIndex)}
                onSelect={() => handleTagSelect(entry.realIndex)}
                onNavigate={(direction) => handleTagNavigate(entry.realIndex, direction)}
              />
            ))}
            {inputPosition === 'inline' && inputElement}
          </div>
          {!hasInput && (
            <span
              className='oo-ui-tagMultiselectWidget-focusTrap'
              ref={focusTrapRef}
              tabIndex={inputTabIndex}
              aria-disabled={disabled || undefined}
              aria-labelledby={mergeAriaLabelledBy(fieldLabelId, ariaLabelledBy)}
            />
          )}
        </div>
      </div>
      {inputPosition === 'outline' && (
        <div
          ref={outlineWrapperRef}
          className={clsx(
            getWidgetClassName({ disabled }, 'input', 'textInput'),
            'oo-ui-textInputWidget-type-text',
            'oo-ui-tagMultiselectWidget-input',
          )}
        >
          {inputElement}
        </div>
      )}
      {isMenu && (
        <MenuSelect
          ref={menuRef}
          container={inputPosition === 'outline' && hasInput ? outlineWrapperRef : rootRef}
          open={open}
          options={menuSelectOptions}
          selectedValues={currentValue}
          highlightedValue={highlightedValue}
          onHighlightedChange={setHighlightedValue}
          onChoose={handleMenuChoose}
          disabled={disabled}
        />
      )}
    </div>
  );
});

TagMultiselect.displayName = 'TagMultiselect';
