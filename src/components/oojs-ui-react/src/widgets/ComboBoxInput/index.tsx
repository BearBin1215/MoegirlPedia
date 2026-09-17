import React, {
  useMemo,
  useRef,
  useState,
  forwardRef,
  type KeyboardEvent as ReactKeyboardEvent,
  type Ref,
} from 'react';
import clsx from 'clsx';
import { IconBase } from '../Icon/Base';
import { IndicatorBase } from '../Indicator/Base';
import { LabelBase } from '../Label/Base';
import { ButtonSlots } from '../Button/slots';
import {
  buttonElementClasses,
  flaggedElementClasses,
  getWidgetClassName,
  hasLabel,
  indicatorElementClasses,
  mergeInvalidFlag,
  resolveTabIndex,
  toFlagArray,
} from '../../mixins';
import {
  getSelectableValues,
  type ChangeHandler,
} from '../../utils';
import { useCleanId, useControlledValue, useMergedRefs, useMenuPopup } from '../../hooks';
import { useMessage } from '../../config';
import { useInputProps, type UserInputProps } from '../Input/props';
import { resolveValidate, type TextInputValidate } from '../TextInput';
import type { AccessKeyedElement, FlaggedElement, IconElement, IndicatorElement, LabelElement } from '../../Element';
import type { LabelPosition } from '../Label';
import type { WidgetProps } from '../Widget';
import type { DropdownOptionProps } from '../Dropdown';
import { MenuSelect } from '../MenuSelect';

/**
 * 备选项输入框属性。原版`ComboBoxInputWidget`继承`TextInputWidget`，故本组件与TextInput
 * 共用同一套输入能力（标签/图标/指示器/软校验/字段id），经useInputProps共享派生；
 * 输入框本身可自由编辑，选定只写入文本而非限定取值
 */
export interface ComboBoxInputProps extends
  Omit<WidgetProps<HTMLDivElement>, 'children' | 'id'>,
  AccessKeyedElement,
  IconElement,
  IndicatorElement,
  LabelElement,
  FlaggedElement {

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

  /** 是否必填（required时指示器缺省回退required，与TextInput一致） */
  required?: boolean;

  /** 是否只读（只读时下拉按钮与菜单同步禁用） */
  readOnly?: boolean;

  /** 最大长度 */
  maxLength?: number;

  /**
   * 标签位置
   * @default 'after'
   */
  labelPosition?: LabelPosition;

  /**
   * 合法性校验（软反馈）：与TextInput同款，值不满足时输入框输出`aria-invalid`、
   * 根元素输出invalid标志类，不改写值
   */
  validate?: TextInputValidate;

  /** 获取内部input元素引用（组件ref指向外层div，需要聚焦输入元素等场景使用） */
  inputRef?: Ref<HTMLInputElement>;

  /**
   * 内部input元素的附加属性（组件props的`...rest`落在根元素div上，需写到原生input上时经此通道）。
   * 非事件属性冲突时以本通道为准；onChange/onBlur/onFocus串联在组件自身逻辑之后
   * （值管线与菜单联动不会被截断）；value/defaultValue不在通道类型内
   */
  inputProps?: UserInputProps<HTMLInputElement>;
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
  label,
  invisibleLabel,
  labelPosition = 'after',
  maxLength,
  validate,
  inputRef: inputRefProp,
  inputProps,
  flags,
  value,
  defaultValue,
  onChange,
  // tabIndex/title落在input上（对齐原版ComboBoxInputWidget继承InputWidget的
  // $tabIndexed与$titled均为$input）
  tabIndex,
  // dir对齐原版setDir的落点（$input），不放外层div
  title,
  dir,
  ...rest
}, ref) => {
  // 与其余输入类组件统一受控/非受控语义：非受控时由内部state承接，defaultValue缺省''
  const { value: currentValue, commit, commitIfChanged } = useControlledValue<string>(
    { value, defaultValue: defaultValue ?? '' },
    onChange,
  );
  const [open, setOpen] = useState(false);
  const elementRef = useRef<HTMLDivElement>(null);
  const internalInputRef = useRef<HTMLInputElement>(null);
  const setInputRef = useMergedRefs(inputRefProp, internalInputRef);
  // 菜单面板经MenuSelect portal至body，点击外部关闭时需连同菜单一起排除
  const menuRef = useRef<HTMLDivElement>(null);
  // 菜单id：aria-owns/aria-controls关联portal化的菜单面板
  const menuId = useCleanId();
  // 标签元素引用（原版继承TextInputWidget：input按标签宽度预留内边距）
  const labelRef = useRef<HTMLSpanElement>(null);
  const controlsDisabled = disabled || readOnly;
  // 可选项（有value且未禁用），键盘导航的目标集合
  const selectableValues = useMemo(() => getSelectableValues(options), [options]);
  // 下拉按钮的无障碍标签（对齐原版ooui-combobox-button-label消息）
  const toggleOptionsLabel = useMessage('ooui-combobox-button-label');

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
   * 值管线（挂入useInputProps的onCommitValue，输入即触发）：提交输入文本并展开菜单
   * （对齐原版onEdit的input事件分支）；已有高亮时按原版onInputChange随输入重定位到
   * 精确匹配项（无匹配则清除高亮），避免残留上一轮高亮
   */
  const handleInputChange = (nextValue: string) => {
    commit(nextValue);
    setOpen(true);
    setHighlightedValue((prev) => (
      prev === undefined ? prev : selectableValues.find((optionValue) => optionValue === nextValue)
    ));
  };

  // 输入元素的公共属性派生：原版ComboBoxInputWidget继承TextInputWidget，能力与TextInput同源
  // （title/accessKey/dir同落input，对齐原版继承的$titled/$accessKeyed/$input）
  const {
    inputProps: commonInputProps,
    invalid,
    decorationProps,
    indicator: resolvedIndicator,
    indicatorProps: indicatorSlotProps,
  } = useInputProps<HTMLInputElement, string>({
    inputRef: internalInputRef,
    value: currentValue,
    validate: resolveValidate(validate),
    disabled,
    tabIndex,
    accessKey,
    name,
    readOnly,
    required,
    placeholder,
    maxLength,
    title,
    invisibleLabel,
    dir,
    labelRef,
    label,
    labelPosition,
    indicator,
    // 值管线：提交输入文本并联动菜单展开/高亮重定位（见handleInputChange）
    onCommitValue: handleInputChange,
  });

  const classes = clsx(
    className,
    // indicatorElement类按解析后的指示器判定（明确无指示器时不输出）
    getWidgetClassName({ disabled, icon, indicator: resolvedIndicator ?? undefined, label, invisibleLabel }, 'input', 'textInput'),
    hasLabel(label) && `oo-ui-textInputWidget-labelPosition-${labelPosition}`,
    'oo-ui-textInputWidget-type-text',
    'oo-ui-comboBoxInputWidget',
    options.length === 0 && 'oo-ui-comboBoxInputWidget-empty',
    open && 'oo-ui-comboBoxInputWidget-open',
    flaggedElementClasses(mergeInvalidFlag(toFlagArray(flags), invalid)),
  );

  /** 输入框键盘交互：↑↓展开/保持菜单并移动高亮，Home/End/PageUp/PageDown仅在菜单展开时
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

  /** 下拉按钮开合菜单并把焦点交还输入框（对齐原版onDropdownButtonClick） */
  const handleDropdownButtonClick = () => {
    if (controlsDisabled) {
      return;
    }
    setOpen((prev) => !prev);
    internalInputRef.current?.focus();
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
          ref={setInputRef}
          // 形态专属属性（combobox角色与菜单关联）与调用方的inputProps通道经useInputProps的合并规则并入
          {...commonInputProps({
            type: 'text',
            role: 'combobox',
            'aria-autocomplete': 'list',
            'aria-expanded': open,
            // 展开时声明所拥有的菜单（收起即移除，对齐原版菜单toggle对$focusOwner的attr/removeAttr）
            'aria-owns': open ? menuId : undefined,
            // 对齐原版autocomplete:false默认（自定义建议菜单与浏览器原生补全不可叠加）
            autoComplete: 'off',
            onKeyDown: handleInputKeyDown,
          }, inputProps)}
        />
        <IconBase icon={icon} {...decorationProps} />
        <IndicatorBase {...indicatorSlotProps} />
        <span
          className={clsx(
            'oo-ui-comboBoxInputWidget-dropdownButton',
            // 该span对应原版自动生成的真ButtonWidget（indicator:'down'、默认framed）：
            // Widget/ButtonElement/IndicatorElement的类贡献均走贡献器（禁用态随readOnly）。
            // 指示器此处只输出类——图标/标签/指示器槽位由下方ButtonSlots承担
            getWidgetClassName({ disabled: controlsDisabled }, 'button'),
            buttonElementClasses({ framed: true, disabled: controlsDisabled }),
            indicatorElementClasses({ indicator: 'down' }),
          )}
        >
          <span
            className='oo-ui-buttonElement-button'
            role='button'
            tabIndex={resolveTabIndex(undefined, controlsDisabled)}
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
      {/* 标签是根元素直接子节点（对齐原版positionLabel的$element.append($label)）：
          主题的标签定位规则均为根元素直接子选择器，放进field（display:table）会脱离定位并挤占列宽 */}
      {hasLabel(label) && <LabelBase ref={labelRef} invisible={invisibleLabel}>{label}</LabelBase>}
      <MenuSelect
        ref={menuRef}
        id={menuId}
        container={elementRef}
        // 高亮项的aria-activedescendant落在输入框上（对齐原版setFocusOwner(widget.$tabIndexed)，
        // 此处$tabIndexed为$input）
        focusOwnerRef={internalInputRef}
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

