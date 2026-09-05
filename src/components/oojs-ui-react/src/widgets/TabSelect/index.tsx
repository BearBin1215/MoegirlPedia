import React, {
  useState,
  forwardRef,
  useEffect,
  useRef,
  type FocusEvent,
  type MouseEventHandler,
} from 'react';
import clsx from 'clsx';
import TabOption, { type TabOptionProps } from '../TabOption';
import { type ChangeHandler } from '../../utils';
import { useControlledValue } from '../../hooks';
import type { WidgetProps } from '../Widget';

export type TabSelectOptionProps = TabOptionProps;

export interface TabSelectProps extends Omit<WidgetProps<HTMLDivElement>, 'onSelect'> {
  /** 是否有边框 */
  framed?: boolean;

  /** 当前选中值（受控，传入即受控模式） */
  value?: string | number;

  /** 非受控初始选中值 */
  defaultValue?: string | number;

  /** 选项集 */
  options: TabSelectOptionProps[];

  /** 选中选项回调函数（值优先） */
  onChange?: ChangeHandler<string | number>;
}

/** 选项卡选择组件，对齐原版`TabSelectWidget`（role=tablist，聚焦后←→环绕选择） */
const TabSelect = forwardRef<HTMLDivElement, TabSelectProps>(({
  className,
  framed = true,
  value,
  defaultValue,
  options,
  onChange,
  disabled,
  tabIndex,
  ...rest
}, ref) => {
  const { value: currentValue, commit } = useControlledValue<string | number>({ value, defaultValue }, onChange);
  const [pressed, setPressed] = useState(false);
  const [focused, setFocused] = useState(false);
  // DOM元素↔选项值索引，供拖拽时从事件target定位选项（对齐原版findTargetItem）
  const itemRefs = useRef(new Map<string | number, HTMLDivElement>());
  const itemEls = useRef(new Map<Element, string | number>());
  // 拖拽选择态：mousedown起点的可选项，拖动跨项时更新，mouseup时选中（对齐原版selecting）
  const selectingRef = useRef<string | number | null>(null);
  // 拖拽过程中被按压的选项值，驱动TabOption的pressed类（对齐原版pressItem）
  const [pressedValue, setPressedValue] = useState<string | number>();
  // 卸载时中止未完成的拖拽监听
  const cleanupDragRef = useRef<(() => void) | null>(null);
  const optionsRef = useRef(options);
  // document级keydown监听仅在focus时绑定，需经ref读取最新值状态（避免闭包过期）
  const valueRef = useRef(currentValue);
  const disabledRef = useRef(disabled);
  const commitRef = useRef(commit);
  optionsRef.current = options;
  valueRef.current = currentValue;
  disabledRef.current = disabled;
  commitRef.current = commit;

  const classes = clsx(
    className,
    'oo-ui-selectWidget',
    pressed ? 'oo-ui-selectWidget-pressed' : 'oo-ui-selectWidget-unpressed',
    'oo-ui-tabSelectWidget',
    framed ? 'oo-ui-tabSelectWidget-framed' : 'oo-ui-tabSelectWidget-frameless',
  );

  const chooseValue = (optionValue: string | number) => {
    if (!disabled) {
      commit(optionValue);
    }
  };

  // 对齐原版：聚焦后绑定document级keydown，失焦解绑；←→/↑↓环绕选择，Enter确认
  useEffect(() => {
    if (!focused) {
      return undefined;
    }
    const handleDocumentKeyDown = (e: KeyboardEvent) => {
      if (disabledRef.current) {
        return;
      }
      const selectable = optionsRef.current.filter((option) => !option.disabled);
      if (!selectable.length) {
        return;
      }
      const currentIndex = selectable.findIndex((option) => option.value === valueRef.current);
      let next: TabSelectOptionProps | undefined;
      let handled = false;
      switch (e.key) {
        case 'Enter':
          if (currentIndex !== -1) {
            next = selectable[currentIndex];
            handled = true;
          }
          break;
        case 'ArrowUp':
        case 'ArrowLeft':
          next = currentIndex === -1
            ? selectable[selectable.length - 1]
            : selectable[(currentIndex - 1 + selectable.length) % selectable.length];
          handled = true;
          break;
        case 'ArrowDown':
        case 'ArrowRight':
          next = currentIndex === -1
            ? selectable[0]
            : selectable[(currentIndex + 1) % selectable.length];
          handled = true;
          break;
        default:
          break;
      }
      if (next) {
        commitRef.current(next.value);
      }
      if (handled) {
        e.preventDefault();
        e.stopPropagation();
      }
    };
    document.addEventListener('keydown', handleDocumentKeyDown, true);
    return () => {
      document.removeEventListener('keydown', handleDocumentKeyDown, true);
    };
  }, [focused]);

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

  /**
   * 拖拽选择，对齐原版SelectWidget.onMouseDown/onDocumentMouseMove/onDocumentMouseUp
   * （TabSelectWidget继承SelectWidget）：左键按下进入拖拽态，拖动跨项时按压项随之移动，
   * mouseup时选中目标项；不可高亮（static.highlightable=false），仅按压态跟手
   */
  const handleMouseDown: MouseEventHandler<HTMLDivElement> = (e) => {
    // 原版onMouseDown恒返回false：阻止拖动过程中选中文本并保持焦点在tablist上
    e.preventDefault();
    setPressed(true);
    if (disabled || e.button !== 0) {
      return;
    }
    const isValueSelectable = (optionValue: string | number) => {
      const option = optionsRef.current.find((o) => o.value === optionValue);
      return !!option && !option.disabled;
    };
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
        chooseValue(optionValue);
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

  const handleUnpress: MouseEventHandler<HTMLDivElement> = () => {
    setPressed(false);
  };

  return (
    <div
      {...rest}
      className={classes}
      aria-disabled={!!disabled}
      role='tablist'
      tabIndex={tabIndex ?? 0}
      onFocus={(e: FocusEvent<HTMLDivElement>) => {
        setFocused(true);
        rest.onFocus?.(e);
      }}
      onBlur={(e: FocusEvent<HTMLDivElement>) => {
        setFocused(false);
        rest.onBlur?.(e);
      }}
      onMouseDown={handleMouseDown}
      onMouseUp={handleUnpress}
      onMouseLeave={handleUnpress}
      ref={ref}
    >
      {options.map((option) => (
        <TabOption
          {...option}
          key={option.value}
          ref={(el) => {
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
          }}
          selected={currentValue === option.value}
          pressed={pressedValue === option.value}
          onClick={(e) => {
            option.onClick?.(e);
          }}
        >
          {option.children}
        </TabOption>
      ))}
    </div>
  );
});

TabSelect.displayName = 'TabSelect';

export default TabSelect;
