import React, {
  forwardRef,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
} from 'react';
import clsx from 'clsx';
import { Button, type ButtonProps } from '../Button';
import { MenuSelect, type MenuSelectProps } from '../MenuSelect';
import type { SelectOptionProps } from '../Select';
import { getSelectableValues, type ChangeHandler } from '../../utils';
import { useCleanId, useControlledValue, useMenuPopup, useMergedRefs } from '../../hooks';

export interface ButtonMenuSelectWidgetProps extends Omit<ButtonProps, 'onClick'> {

  /** 菜单选项集 */
  options: SelectOptionProps[];

  /** 菜单打开态（受控，传入即受控模式） */
  open?: boolean;

  /** 非受控初始打开态 */
  defaultOpen?: boolean;

  /** 菜单开合回调 */
  onOpenChange?: (open: boolean) => void;

  /** 点击回调（在切换菜单开合前触发） */
  onClick?: ButtonProps['onClick'];

  /**
   * 选定选项回调（对齐原版`choose`事件）。菜单是**命令菜单**：每次选定都回调，
   * 选定后菜单收起（对齐原版MenuSelectWidget的hideOnChoose）
   */
  onChoose?: ChangeHandler<string | number>;

  /**
   * 选定后是否清除菜单选中态（缺省true，对齐原版`clearOnSelect`）：
   * 置true时菜单为纯命令菜单，选过的项不留选中态；置false时保留最后选定项
   */
  clearOnSelect?: boolean;

  /** 菜单与按钮的间距（px，对齐原版`menu.spacing`缺省4） */
  menuSpacing?: number;

  /** 菜单属性覆盖（`open`/`container`/`options`/`onChoose`/`id`/`spacing`/`clearOnChoose`由本组件接管） */
  menuProps?: Omit<MenuSelectProps, 'open' | 'container' | 'options' | 'onChoose' | 'id' | 'spacing' | 'clearOnChoose'>;
}

/**
 * 按钮式菜单选择，对齐原版OO.ui.ButtonMenuSelectWidget：按钮（真Button，Tab停靠点）触发菜单，
 * 菜单经MenuSelect浮动于按钮下方（间距4px）。菜单为命令菜单——`clearOnSelect`缺省清除选中态，
 * 选定即回调`onChoose`并收起。
 *
 * 焦点与aria：焦点始终在按钮上，菜单不是Tab停靠点（MenuSelect缺省`tabIndex=-1`）；
 * 菜单id与按钮锚点互相关联——锚点上写`aria-haspopup`/`aria-expanded`/`aria-owns`，
 * 高亮项的`aria-activedescendant`也落在锚点上（对齐原版`setFocusOwner(widget.$tabIndexed)`，
 * 即本工程`Select`的`focusOwnerRef`通道）。菜单打开期间按钮呈`oo-ui-buttonElement-pressed`
 * （对齐原版onMenuToggle）。
 */
export const ButtonMenuSelectWidget = forwardRef<HTMLSpanElement, ButtonMenuSelectWidgetProps>(({
  anchorProps,
  children,
  className,
  clearOnSelect = true,
  defaultOpen = false,
  disabled,
  menuProps,
  menuSpacing = 4,
  onChoose,
  onClick,
  onKeyDown,
  onKeyUp,
  onOpenChange,
  open: openProp,
  options,
  ...buttonRest
}, ref) => {
  const buttonRef = useRef<HTMLSpanElement | null>(null);
  const anchorRef = useRef<HTMLAnchorElement | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const mergedButtonRef = useMergedRefs(buttonRef, ref);
  // 菜单id供锚点的aria-owns关联（对应原版menu.getElementId）
  const menuId = useCleanId();
  const { value: open, commit: setOpen } = useControlledValue<boolean>(
    { value: openProp, defaultValue: defaultOpen },
    onOpenChange,
  );
  const selectableValues = useMemo(() => getSelectableValues(options), [options]);
  const selectableValueSet = useMemo(() => new Set(selectableValues), [selectableValues]);
  // clearOnSelect为false时保留的"粘性"选中值（对齐原版不调selectItem的语义）；
  // clearOnSelect为true时恒空——选中态由菜单的clearOnChoose通道清零
  const [stickyValue, setStickyValue] = useState<string | number | undefined>(undefined);
  // 键盘手势去重标记：keydown消费的Enter/空格已切换过开合/选定，浏览器随后派发的
  // keypress会经Button的键盘激活通道（handleKeyPress→onClick）再次切换——Chrome不因
  // keydown的preventDefault而抑制keypress，且该路径读到的是切换前的过期open。
  // keyup即手势结束，据此复位（Firefox抑制keypress时标记也能复位，不会卡死鼠标点击）
  const keyboardGestureRef = useRef(false);
  // 菜单开合与键盘高亮：端点钳制不环绕（原版MenuSelectWidget static.listWrapsAround=false），
  // 开启时点击外部/Escape关闭（Escape捕获阶段，嵌套于Dialog时不误关弹窗）
  const {
    highlightedValue,
    setHighlightedValue,
    handleNavigationKey,
    consumeNavigationKey,
  } = useMenuPopup<string | number>({
    open,
    onClose: () => setOpen(false),
    values: selectableValues,
    // 菜单portal至body：点击外部关闭须连同按钮与菜单一起排除
    ignore: [buttonRef, menuRef],
  });

  /** 选定选项：先回调命令，再按clearOnSelect决定是否保留选中态，最后收起菜单 */
  const chooseOption = (optionValue: string | number) => {
    onChoose?.(optionValue);
    if (!clearOnSelect) {
      setStickyValue(optionValue);
    }
    setOpen(false);
  };

  /** 按钮键盘：收起时Enter/空格/↑↓展开，展开后↑↓移动高亮、Enter选定、Home/End/PageUp/PageDown翻页 */
  const handleKeyDown = (event: ReactKeyboardEvent<HTMLSpanElement>) => {
    onKeyDown?.(event);
    if (disabled) {
      return;
    }
    switch (event.key) {
      case 'Enter':
      case ' ':
        event.preventDefault();
        if (!open) {
          keyboardGestureRef.current = true;
          setOpen(true);
        } else if (highlightedValue !== undefined && selectableValueSet.has(highlightedValue)) {
          keyboardGestureRef.current = true;
          chooseOption(highlightedValue);
        }
        break;
      case 'ArrowDown':
      case 'ArrowUp':
        // 收起时方向键仅展开（同Dropdown），展开后才移动高亮
        event.preventDefault();
        if (!open) {
          setOpen(true);
        } else {
          handleNavigationKey(event.key);
        }
        break;
      case 'Home':
      case 'End':
      case 'PageUp':
      case 'PageDown':
        // 仅菜单展开时占用按键；±10翻页步长与首末跳转由consumeNavigationKey统一
        consumeNavigationKey(event);
        break;
    }
  };

  return (
    <>
      <Button
        {...buttonRest}
        ref={mergedButtonRef}
        anchorRef={anchorRef}
        disabled={disabled}
        className={clsx(
          className,
          'oo-ui-buttonMenuSelectWidget',
          // 菜单打开期间按钮呈按压态（对齐原版onMenuToggle对根元素的pressed类切换）
          open && 'oo-ui-buttonElement-pressed',
        )}
        anchorProps={{
          ...anchorProps,
          'aria-haspopup': 'true',
          'aria-expanded': open,
          'aria-owns': menuId,
        }}
        onClick={(event) => {
          onClick?.(event);
          // 键盘手势内跳过：keydown已消费的Enter/空格，其keypress激活通道不再重复切换
          if (keyboardGestureRef.current) {
            keyboardGestureRef.current = false;
            return;
          }
          setOpen((prev) => !prev);
        }}
        onKeyDown={handleKeyDown}
        onKeyUp={(event) => {
          keyboardGestureRef.current = false;
          onKeyUp?.(event);
        }}
      >
        {children}
      </Button>
      <MenuSelect
        {...menuProps}
        ref={menuRef}
        id={menuId}
        open={open}
        spacing={menuSpacing}
        container={buttonRef}
        options={options}
        // clearOnSelect时选中态由clearOnChoose清零（菜单内从不出现选中态），stickyValue恒空
        value={stickyValue}
        clearOnChoose={clearOnSelect}
        highlightedValue={highlightedValue}
        onHighlightedChange={setHighlightedValue}
        onChoose={chooseOption}
        // 高亮项的aria-activedescendant落在按钮锚点上（对齐原版setFocusOwner(widget.$tabIndexed)）
        focusOwnerRef={anchorRef}
      />
    </>
  );
});

ButtonMenuSelectWidget.displayName = 'ButtonMenuSelectWidget';
