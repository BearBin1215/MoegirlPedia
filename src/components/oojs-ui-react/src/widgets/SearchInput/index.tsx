import React, {
  forwardRef,
  useRef,
  type ChangeEvent,
  type KeyboardEvent,
  type Ref,
} from 'react';
import { TextInput, type TextInputProps } from '../TextInput';
import { useControlledValue, useMergedRefs } from '../../hooks';
import { useMessage } from '../../config';

/**
 * 搜索输入框属性：复用TextInputProps（含validate软校验）。type恒为'search'不外露；
 * 指示器槽位由清除逻辑完全接管（对齐原版updateSearchIndicator的覆写语义），indicator/
 * indicatorOverride/indicatorProps均不外露
 */
export type SearchInputProps = Omit<
  TextInputProps,
  'type' | 'indicator' | 'indicatorOverride' | 'indicatorProps'
> & {

  /** 获取内部input元素引用（清空回焦等场景使用） */
  inputRef?: Ref<HTMLInputElement>;
};

/**
 * 搜索输入框，对齐原版OO.ui.SearchInputWidget：TextInputWidget子类——input为type='search'
 * （根元素`oo-ui-textInputWidget-type-search`类驱动指示器可点击形态）、缺省search图标；
 * 值非空且可编辑时显示clear清除指示器（role=button + aria-label取ooui-item-remove消息），
 * 点击或在其上按Enter清空并回焦输入框（对齐onIndicatorClick/onIndicatorKeyDown）。
 * 指示器经indicatorOverride完全接管（对齐原版updateSearchIndicator构造后setIndicator
 * 覆写，required缺省回退被抑制）。值状态由本组件持有，内部使TextInput恒为受控，
 * 保证指示器形态随实时值更新
 */
export const SearchInput = forwardRef<HTMLDivElement, SearchInputProps>(({
  icon = 'search',
  value,
  defaultValue,
  onChange,
  disabled,
  readOnly,
  inputRef,
  ...rest
}, ref) => {
  const { value: currentValue, commit } = useControlledValue<string, ChangeEvent<HTMLInputElement>>(
    { value, defaultValue: defaultValue ?? '' },
    onChange,
  );
  const internalInputRef = useRef<HTMLInputElement>(null);
  const setInputRef = useMergedRefs(inputRef, internalInputRef);
  // 清除指示器的可访问名称（对齐原版$indicator的aria-label）
  const removeLabel = useMessage('ooui-item-remove');

  // 对齐原版updateSearchIndicator：非空且可编辑时显示clear指示器，否则null明确无
  const showClear = currentValue !== '' && !disabled && !readOnly;

  /** 清空并回焦输入框（对齐原版onIndicatorClick/onIndicatorKeyDown） */
  const clear = () => {
    commit('');
    internalInputRef.current?.focus();
  };

  /** 清除指示器上的Enter触发清空（对齐原版onIndicatorKeyDown） */
  const handleIndicatorKeyDown = (e: KeyboardEvent<HTMLSpanElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      clear();
    }
  };

  return (
    <TextInput
      {...rest}
      ref={ref}
      type='search'
      icon={icon}
      indicatorOverride={showClear ? 'clear' : null}
      inputRef={setInputRef}
      value={currentValue}
      onChange={commit}
      disabled={disabled}
      readOnly={readOnly}
      // role/tabIndex为原版$indicator的固定属性（初始化即挂，不随指示器显隐）
      indicatorProps={{
        role: 'button',
        tabIndex: -1,
        ...(showClear ? { 'aria-label': removeLabel, onClick: clear, onKeyDown: handleIndicatorKeyDown } : {}),
      }}
    />
  );
});

SearchInput.displayName = 'SearchInput';
