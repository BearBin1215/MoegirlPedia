import React, {
  useState,
  useRef,
  forwardRef,
  useImperativeHandle,
  useEffect,
  useMemo,
  useCallback,
} from 'react';
import classNames from 'classnames';
import Select from '../Select';
import IconBase from '../Icon/Base';
import IndicatorBase from '../Indicator/Base';
import LabelBase from '../Label/Base';
import { processArray, processClassNames } from '../utils/tool';
import type { WidgetProps } from '../types/props';
import type { AccessKeyElement, IconElement, LabelElement } from '../types/mixin';
import type { ChangeHandler } from '../types/utils';
import type { OptionData } from '../Option';
import type { OptionElement } from '../Select';

export interface DropdownProps extends
  WidgetProps<HTMLDivElement>,
  AccessKeyElement,
  IconElement,
  LabelElement {

  defaultValue?: any;

  children?: OptionElement | OptionElement[];

  onChange?: ChangeHandler<any>;
}

const Dropdown = forwardRef<HTMLDivElement, DropdownProps>(({
  className,
  children,
  defaultValue,
  disabled,
  icon,
  label,
  onChange,
  ...rest
}, externalRef) => {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState(defaultValue);
  const internalRef = useRef<HTMLDivElement>(null);

  function getNonNullRef(): HTMLDivElement {
    const node = internalRef.current;
    if (!node) {
      throw new Error('Component not yet mounted.');
    }
    return node;
  }

  useImperativeHandle(externalRef, () => getNonNullRef(), [internalRef.current]);

  const options = useMemo(() => processArray(children), [children, value]);

  const classes = classNames(
    className,
    processClassNames({
      disabled,
      icon,
      label,
      indicator: 'down',
    }, 'dropdown'),
    open && 'oo-ui-dropdownWidget-open',
  );

  const selectClasses = classNames(
    'oo-ui-clippableElement-clippable',
    'oo-ui-floatableElement-floatable',
    'oo-ui-menuSelectWidget',
    !open && 'oo-ui-element-hidden',
  );

  const handleClickLabel = () => setOpen(!open);

  /** 选择后回调 */
  const handleSelect = (option: OptionData) => {
    if (typeof onChange === 'function') {
      onChange({
        value: option.data,
        oldValue: value,
      });
    }
    setValue(option.data);
    setOpen(false);
  };

  /** 点击页面其他地方时关闭下拉菜单 */
  const handleClickOutside = useCallback((event: MouseEvent) => {
    if (internalRef.current && !internalRef.current.contains(event.target as Node)) {
      setOpen(false);
    }
  }, []);

  /** 如果有选中的则显示已选，没选则显示label */
  const displayLabel = useMemo(() => {
    return options.find((option) => {
      return 'data' in option.props && option.props.data === value;
    })?.props.children || label;
  }, [value, label]);

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div
      {...rest}
      className={classes}
      ref={internalRef}
    >
      <span
        tabIndex={disabled ? -1 : 0}
        aria-disabled={!!disabled}
        className='oo-ui-dropdownWidget-handle'
        role='combobox'
        aria-autocomplete='list'
        aria-expanded={open}
        onClick={handleClickLabel}
      >
        <IconBase icon={icon} />
        <LabelBase role='textbox' aria-readonly>{displayLabel}</LabelBase>
        <IndicatorBase indicator='down' />
      </span>
      <Select className={selectClasses} onSelect={handleSelect} value={value}>
        {children}
      </Select>
    </div>
  );
});

Dropdown.displayName = 'Dropdown';

export default Dropdown;
