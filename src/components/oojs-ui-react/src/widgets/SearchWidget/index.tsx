import React, {
  forwardRef,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
  type KeyboardEvent,
} from 'react';
import clsx from 'clsx';
import { SearchInput, type SearchInputProps } from '../SearchInput';
import { Select, type SelectOptionProps } from '../Select';
import { getWidgetClassName } from '../../mixins';
import {
  findRelativeSelectableItem,
  getSelectableValues,
  type ChangeHandler,
} from '../../utils';
import { useControlledValue, useMergedRefs } from '../../hooks';
import type { WidgetProps } from '../Widget';

/** results的缺省空数组（模块级常量，避免每渲染新建字面量） */
const NO_RESULTS: SelectOptionProps[] = [];

export interface SearchWidgetProps
  // results与HTML原生的results属性（<input type=search>用）同名，须先剔除再声明结果集
  extends Omit<WidgetProps<HTMLDivElement>, 'children' | 'onChange' | 'results'> {

  /**
   * 结果选项集。原版`results`是一个由调用方按查询重填的SelectWidget——
   * 本组件同样只负责监听查询变化（`onQueryChange`），重填属调用方职责
   */
  results?: SelectOptionProps[];

  /** 查询值（受控） */
  value?: string;

  /** 非受控初始查询值 */
  defaultValue?: string;

  /** 查询变化回调（对齐原版query的change事件；调用方据此重新填充`results`） */
  onQueryChange?: ChangeHandler<string>;

  /** 选定结果回调（Enter选定高亮结果、或鼠标点击结果时触发） */
  onChoose?: ChangeHandler<string | number>;

  /** 查询输入框占位符 */
  placeholder?: string;

  /**
   * 查询输入框props覆盖（对应原版`config.input`注入自定义输入控件的能力，
   * 此处收敛为SearchInput可定制的维度；value/defaultValue/onChange由本组件接管）。
   * 本prop展开为SearchInput的**组件props**；要写到原生input上的属性经`inputProps.inputProps`
   * （即TextInput的输入元素透传通道）给入，其中事件处理器串联在组件逻辑之后、
   * 不会接管值管线
   */
  inputProps?: Partial<Omit<SearchInputProps, 'value' | 'defaultValue' | 'onChange'>>;
}

/**
 * 搜索组件，对齐原版OO.ui.SearchWidget：查询输入框 + 始终可见的结果列表
 * （与浮层式查找菜单相对）。本组件不实现检索——查询变化仅回调`onQueryChange`，
 * 结果由调用方填入`results`（对齐原版"onQueryChange清空results、由子类重填"的分工）。
 * 键盘：焦点留在查询框，↑↓在结果间移动高亮（端点环绕，对齐原版listWrapsAround=true）、
 * Enter选定高亮结果（对齐原版onQueryEnter→chooseItem）
 */
export const SearchWidget = forwardRef<HTMLDivElement, SearchWidgetProps>(({
  className,
  disabled,
  results = NO_RESULTS,
  value,
  defaultValue,
  onQueryChange,
  onChoose,
  placeholder,
  inputProps,
  ...rest
}, ref) => {
  const { value: currentQuery, commit } = useControlledValue<string, ChangeEvent<HTMLInputElement>>(
    { value, defaultValue: defaultValue ?? '' },
    onQueryChange,
  );
  /** 结果高亮：受控给Select。焦点在查询框，故由本组件充当键盘驱动方 */
  const [highlightedValue, setHighlightedValue] = useState<string | number | undefined>(undefined);
  /** 查询框input元素：结果列表的焦点归属元素（activedescendant落点），兼顾调用方传入的inputRef */
  const inputRef = useRef<HTMLInputElement>(null);
  const mergedInputRef = useMergedRefs(inputProps?.inputRef, inputRef);
  const selectableValues = useMemo(() => getSelectableValues(results), [results]);

  // 结果集或查询变化即清除高亮（对齐原版onQueryChange清空results后高亮随之消失）
  useEffect(() => {
    setHighlightedValue(undefined);
  }, [results, currentQuery]);

  /**
   * 查询区键盘：↑↓移动结果高亮、Enter选定高亮结果。挂在查询区容器上——
   * SearchInput的props经TextInput落到其根元素而非input，键盘事件自input冒泡至此处理
   */
  const handleQueryKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (disabled) {
      return;
    }
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault();
      const next = findRelativeSelectableItem(
        selectableValues,
        highlightedValue,
        event.key === 'ArrowDown' ? 1 : -1,
      );
      if (next !== undefined) {
        setHighlightedValue(next);
      }
      return;
    }
    if (event.key === 'Enter' && highlightedValue !== undefined) {
      onChoose?.(highlightedValue);
    }
  };

  return (
    <div
      {...rest}
      className={clsx(className, getWidgetClassName({ disabled }), 'oo-ui-searchWidget')}
      aria-disabled={disabled || undefined}
      ref={ref}
    >
      {/* 原版DOM顺序为results在前、query在后（两者均绝对定位，视觉由主题CSS接管） */}
      <div className='oo-ui-searchWidget-results'>
        <Select
          options={results}
          highlightedValue={highlightedValue}
          onHighlightedChange={setHighlightedValue}
          onChoose={onChoose}
          disabled={disabled}
          // 列表不作独立Tab停靠点、activedescendant归属查询框（对齐原版：SelectWidget根无
          // tabindex，且SearchWidget构造期results.setFocusOwner(query.$input)）
          tabIndex={-1}
          focusOwnerRef={inputRef}
        />
      </div>
      <div className='oo-ui-searchWidget-query' onKeyDown={handleQueryKeyDown}>
        <SearchInput
          {...inputProps}
          inputRef={mergedInputRef}
          value={currentQuery}
          onChange={commit}
          placeholder={placeholder}
          disabled={disabled}
        />
      </div>
    </div>
  );
});

SearchWidget.displayName = 'SearchWidget';
