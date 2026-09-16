import React, {
  useMemo,
  useRef,
  useState,
  forwardRef,
  type KeyboardEvent as ReactKeyboardEvent,
} from 'react';
import clsx from 'clsx';
import { IconBase } from '../Icon/Base';
import { IndicatorBase } from '../Indicator/Base';
import { ButtonSlots } from '../Button/slots';
import {
  getSelectableValues,
  getWidgetClassName,
  resolveTabIndex,
  type ChangeHandler,
} from '../../utils';
import { useCleanId, useControlledValue, useFieldInputId, useMenuPopup } from '../../hooks';
import { useMessage } from '../../config';
import type { AccessKeyedElement, Indicators } from '../../Element';
import type { WidgetProps } from '../Widget';
import type { DropdownOptionProps } from '../Dropdown';
import { MenuSelect } from '../MenuSelect';

export interface ComboBoxInputProps extends
  Omit<WidgetProps<HTMLDivElement>, 'children' | 'id'>,
  AccessKeyedElement {

  /** 选项集（输入时下拉展示；选定后写入输入框，输入框文本本身可自由编辑） */
  options: DropdownOptionProps[];

  /** 输入框值（受控，传入即受控模式） */
  value?: string;

  /** 非受控初始值，缺省`''` */
  defaultValue?: string;

  onChange?: ChangeHandler<string>;

  /** input元素name属性 */
  name?: string;

  /** 输入提示 */
  placeholder?: string;

  /** 是否必填 */
  required?: boolean;

  /** 是否只读（只读时下拉按钮与菜单同步禁用） */
  readOnly?: boolean;

  /** 组件图标 */
  icon?: string;

  /** 组件指示器 */
  indicator?: Indicators;
}

/**
 * 备选项输入框，对齐原版OO.ui.ComboBoxInputWidget：可自由输入的文本框 + 下拉选项菜单，
 * 输入即展开菜单并按值精确匹配选中项，↑↓移动高亮、Enter选定高亮项并收起菜单、
 * 下拉按钮切换菜单。不像原生combobox那样强制输入内容必须是选项之一
 */
export const ComboBoxInput = forwardRef<HTMLDivElement, ComboBoxInputProps>(({
  options,
  className,
  disabled,
  readOnly,
  name,
  placeholder,
  required,
  accessKey,
  icon,
  indicator,
  value,
  defaultValue,
  onChange,
  // tabIndex落在input上（对齐原版ComboBoxInputWidget继承InputWidget的$tabIndexed=$input）
  tabIndex,
  ...rest
}, ref) => {
  // 与其余输入类组件统一受控/非受控语义：非受控时由内部state承接，defaultValue缺省''
  const { value: currentValue, commit, commitIfChanged } = useControlledValue<string>(
    { value, defaultValue: defaultValue ?? '' },
    onChange,
  );
  const [open, setOpen] = useState(false);
  const elementRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  // 菜单面板经MenuSelect portal至body，点击外部关闭时需连同菜单一起排除
  const menuRef = useRef<HTMLDivElement>(null);
  // 菜单id：aria-owns/aria-controls关联portal化的菜单面板
  const menuId = useCleanId();
  // FieldLayout标签联动（通道A）：input认领字段id与label的htmlFor原生关联
  const fieldInputId = useFieldInputId();

  const controlsDisabled = disabled || readOnly;
  // 可选项（有value且未禁用），键盘导航的目标集合
  const selectableValues = useMemo(() => getSelectableValues(options), [options]);
  // 下拉按钮的无障碍标签（对齐原版ooui-combobox-button-label消息）
  const toggleOptionsLabel = useMessage('ooui-combobox-button-label');

  const classes = clsx(
    className,
    getWidgetClassName({ disabled, icon, indicator }, 'input', 'textInput'),
    'oo-ui-textInputWidget-type-text',
    'oo-ui-comboBoxInputWidget',
    options.length === 0 && 'oo-ui-comboBoxInputWidget-empty',
    open && 'oo-ui-comboBoxInputWidget-open',
  );

  // 菜单开合与键盘高亮（端点钳制不环绕、无高亮时↓从首项/↑从末项起步）；
  // 开启时点击外部/Escape关闭（Escape捕获阶段，嵌套于Dialog时不误关弹窗）。
  // 高亮与Select共用（含鼠标悬停），经onHighlightedChange回写；
  // 导航键（↑↓/Home/End/PageUp/PageDown）移动高亮走handleNavigationKey，
  // 菜单展开时占用按键（preventDefault）走consumeNavigationKey
  const {
    highlightedValue,
    setHighlightedValue,
    handleNavigationKey,
    consumeNavigationKey,
  } = useMenuPopup<string | number>({
    open,
    onClose: () => setOpen(false),
    values: selectableValues,
    ignore: [elementRef, menuRef],
  });

  /**
   * 输入框键盘交互：↑↓展开/保持菜单并移动高亮，Home/End/PageUp/PageDown仅在菜单展开时
   * 占用按键（收起时保留输入框原生光标/滚动行为），Enter选定高亮项并收起菜单
   */
  const handleInputKeyDown = (event: ReactKeyboardEvent<HTMLInputElement>) => {
    if (controlsDisabled) {
      return;
    }
    switch (event.key) {
      case 'ArrowDown':
        // 方向键唤起菜单并移动高亮（未展开时自首/末项起步）
        event.preventDefault();
        setOpen(true);
        handleNavigationKey('ArrowDown');
        break;
      case 'ArrowUp':
        event.preventDefault();
        setOpen(true);
        handleNavigationKey('ArrowUp');
        break;
      case 'Home':
      case 'End':
      case 'PageUp':
      case 'PageDown':
        // 仅菜单展开时占用，收起时保留输入框原生光标跳转/原生滚动；翻页步长与首末跳转由consumeNavigationKey统一
        consumeNavigationKey(event);
        break;
      case 'Enter':
        // 选定高亮项后收起菜单；
        // 菜单开启时阻止默认，避免处于FormLayout内时同时提交表单
        if (open) {
          event.preventDefault();
          if (highlightedValue !== undefined) {
            commitIfChanged(String(highlightedValue));
          }
        }
        setOpen(false);
        break;
      case 'Tab':
        // 对齐原版MenuSelectWidget.onDocumentKeyDown：菜单展开时按Tab收起
        // （不阻止默认行为，允许焦点正常移出）
        setOpen(false);
        break;
    }
  };

  /**
   * 输入即展开菜单（对齐原版onEdit的input事件分支）；已有高亮时按原版onInputChange
   * 随输入重定位到精确匹配项（无匹配则清除高亮），避免残留上一轮高亮
   */
  const handleInputChange = (nextValue: string) => {
    commit(nextValue);
    setOpen(true);
    setHighlightedValue((prev) => (
      prev === undefined ? prev : selectableValues.find((optionValue) => optionValue === nextValue)
    ));
  };

  /** 下拉按钮开合菜单并把焦点交还输入框（对齐原版onDropdownButtonClick） */
  const handleDropdownButtonClick = () => {
    if (controlsDisabled) {
      return;
    }
    setOpen((prev) => !prev);
    inputRef.current?.focus();
  };

  /**
   * 选定菜单项：值经String归一化后写入输入框，对齐原版InputWidget.cleanUpValue（强制String），
   * 并收起菜单（对齐原版MenuSelectWidget.hideOnChoose）。注意数值型选项值与原版一致不会
   * 呈现选中态——原版findItemFromData按OO.getHash（JSON.stringify）比较，数字与字符串不等价
   */
  const selectOption = (optionValue: string | number) => {
    commitIfChanged(String(optionValue));
    setOpen(false);
  };

  return (
    <div
      {...rest}
      className={classes}
      aria-disabled={disabled || undefined}
      ref={ref}
    >
      <div ref={elementRef} className='oo-ui-comboBoxInputWidget-field'>
        <input
          ref={inputRef}
          id={fieldInputId}
          type='text'
          name={name}
          accessKey={accessKey}
          placeholder={placeholder}
          required={required}
          aria-required={required}
          disabled={disabled}
          readOnly={readOnly}
          tabIndex={resolveTabIndex(tabIndex, disabled)}
          aria-disabled={disabled || undefined}
          role='combobox'
          aria-autocomplete='list'
          aria-expanded={open}
          aria-owns={menuId}
          // 对齐原版autocomplete:false默认（自定义建议菜单与浏览器原生补全不可叠加）
          autoComplete='off'
          className='oo-ui-inputWidget-input'
          // 归一化后恒为string（非受控缺省''），无需再兜底空串
          value={currentValue}
          onChange={(event) => handleInputChange(event.target.value)}
          onKeyDown={handleInputKeyDown}
        />
        <IconBase icon={icon} />
        <IndicatorBase indicator={indicator} />
        <span
          className={clsx(
            'oo-ui-comboBoxInputWidget-dropdownButton',
            'oo-ui-widget',
            controlsDisabled ? 'oo-ui-widget-disabled' : 'oo-ui-widget-enabled',
            'oo-ui-indicatorElement',
            'oo-ui-buttonElement',
            // 对齐原版默认framed按钮（主题CSS的下拉按钮边框/背景样式依赖该类）
            'oo-ui-buttonElement-framed',
            'oo-ui-buttonWidget',
          )}
        >
          <span
            className='oo-ui-buttonElement-button'
            role='button'
            tabIndex={controlsDisabled ? -1 : 0}
            aria-disabled={controlsDisabled || undefined}
            aria-haspopup='listbox'
            aria-controls={menuId}
            onClick={handleDropdownButtonClick}
          >
            {/* 原版此按钮为真ButtonWidget（label+indicator，icon缺省照常输出noIcon占位） */}
            <ButtonSlots label={toggleOptionsLabel} labelInvisible indicator='down' />
          </span>
        </span>
      </div>
      <MenuSelect
        ref={menuRef}
        id={menuId}
        container={elementRef}
        onChoose={selectOption}
        value={currentValue}
        open={open}
        options={options}
        highlightedValue={highlightedValue}
        onHighlightedChange={setHighlightedValue}
      />
    </div>
  );
});

ComboBoxInput.displayName = 'ComboBoxInput';

