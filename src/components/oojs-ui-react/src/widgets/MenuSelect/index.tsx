import React, {
  useRef,
  forwardRef,
} from 'react';
import { createPortal } from 'react-dom';
import clsx from 'clsx';
import Select, { type SelectProps } from '../Select';
import { useAnchoredPanelLayout, useCleanId, useMergedRefs } from '../../hooks';

export interface MenuSelectProps extends SelectProps {
  open?: boolean;

  /**
   * 浮动定位的锚定容器。菜单portal在body上、
   * 无法回退到DOM父节点，故定位依赖此参数（Dropdown等调用方须显式传入）
   */
  container?: React.RefObject<HTMLElement | null> | HTMLElement | null;
}

/**
 * 对齐原版MenuSelectWidget（DropdownWidget的菜单面板；原版中亦被LookupElement/ComboBoxInputWidget等复用）。
 * 键盘导航开关对齐原版static：handleNavigationKeys=true、listWrapsAround=false。
 * 浮动行为对齐原版FloatableElement/ClippableElement：portal至body后定位在锚定容器正下方、
 * 宽度取容器宽度，视口下方空间不足时钳制高度改为内部滚动（下拉菜单不翻转），容器滚出视口时隐藏
 */
const MenuSelect = forwardRef<HTMLDivElement, MenuSelectProps>(({
  className,
  open = false,
  container,
  id: idProp,
  // 取值对齐原版static（见组件注释），须显式下发以覆盖Select自身的缺省false/true
  handleNavigationKeys = true,
  listWrapsAround = false,
  ...rest
}, ref) => {
  const menuRef = useRef<HTMLDivElement | null>(null);
  const mergedRef = useMergedRefs(menuRef, ref);
  // 面板id供调用方建立aria-owns/aria-controls关联
  const menuId = idProp ?? `oo-ui-menuSelectWidget-${useCleanId()}`;

  const layout = useAnchoredPanelLayout({
    open,
    anchor: container,
    panelRef: menuRef,
    matchAnchorWidth: true,
    hideWhenOutOfView: true,
  });

  const classes = clsx(
    className,
    'oo-ui-clippableElement-clippable',
    'oo-ui-floatableElement-floatable',
    'oo-ui-menuSelectWidget',
    !open && 'oo-ui-element-hidden',
  );

  return createPortal(
    <Select
      {...rest}
      id={menuId}
      ref={mergedRef}
      handleNavigationKeys={handleNavigationKeys}
      listWrapsAround={listWrapsAround}
      className={clsx(classes, layout?.outOfView && 'oo-ui-element-hidden')}
      style={{
        position: 'absolute',
        top: layout?.top ?? -9999,
        left: layout?.left ?? -9999,
        width: layout?.width,
        maxHeight: layout?.maxHeight,
        overflowY: layout?.maxHeight !== undefined ? 'auto' : undefined,
      }}
    />,
    document.body,
  );
});

MenuSelect.displayName = 'MenuSelect';

export default MenuSelect;
