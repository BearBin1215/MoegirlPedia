import React, {
  useState,
  useRef,
  useLayoutEffect,
  forwardRef,
} from 'react';
import { createPortal } from 'react-dom';
import clsx from 'clsx';
import Select, { type SelectProps } from '../Select';
import { mergeRefs, resolveElement } from '../../utils';

/** 视口四周留白，对齐原版OO.ui.getViewportSpacing的缺省值 */
const VIEWPORT_SPACING = 5;

export interface MenuSelectProps extends SelectProps {
  open?: boolean;

  /**
   * 浮动定位的锚定容器（对齐原版$floatableContainer）。菜单portal在body上、
   * 无法回退到DOM父节点，故定位依赖此参数（Dropdown等调用方须显式传入）
   */
  container?: React.RefObject<HTMLElement | null> | HTMLElement | null;
}

interface MenuLayout {
  top: number;
  left: number;
  width: number;
  outOfView: boolean;
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
  ...rest
}, ref) => {
  const menuRef = useRef<HTMLDivElement | null>(null);
  const [layout, setLayout] = useState<MenuLayout | null>(null);

  const classes = clsx(
    className,
    'oo-ui-clippableElement-clippable',
    'oo-ui-floatableElement-floatable',
    'oo-ui-menuSelectWidget',
    !open && 'oo-ui-element-hidden',
  );

  // 定位与裁剪（对齐原版position()在toggle与滚动/缩放时重算的时机）
  useLayoutEffect(() => {
    if (!open) {
      setLayout(null);
      return;
    }
    const menu = menuRef.current;
    if (!menu) {
      return;
    }
    const compute = (): MenuLayout | null => {
      const el = menuRef.current;
      if (!el) {
        return null;
      }
      // 清除上一轮裁剪，测量自然尺寸（避免以裁剪后的rect为基准逐轮收缩）
      el.style.maxHeight = '';
      el.style.overflowY = '';
      // 菜单已portal至body，无法像原版toggle()那样回退到$element.parent()（此处只会得到body），
      // 故锚定容器必须由调用方显式传入；缺省时不定位
      const containerEl = resolveElement(container);
      if (!containerEl) {
        return null;
      }
      const cr = containerEl.getBoundingClientRect();
      const scrollX = window.scrollX;
      const scrollY = window.scrollY;
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      // hideWhenOutOfView（原版FloatableElement.isElementInViewport，简化为视口判定）
      const outOfView = cr.bottom < 0 || cr.top > vh || cr.right < 0 || cr.left > vw;
      if (!outOfView) {
        // ClippableElement.clip简化版：视口下方空间不足时钳高内部滚动
        // （原版锚定$floatableClosestScrollable并计入四周留白，此处锚定视口）
        const available = vh - cr.bottom - VIEWPORT_SPACING;
        if (el.offsetHeight > available) {
          el.style.maxHeight = `${Math.max(0, available)}px`;
          el.style.overflowY = 'auto';
        }
      }
      return {
        top: cr.bottom + scrollY,
        left: cr.left + scrollX,
        width: cr.width,
        outOfView,
      };
    };

    setLayout(compute());
    const recompute = () => setLayout(compute());
    window.addEventListener('resize', recompute);
    document.addEventListener('scroll', recompute, true);
    return () => {
      window.removeEventListener('resize', recompute);
      document.removeEventListener('scroll', recompute, true);
      // 卸载/关闭时还原裁剪，避免下次测量取到被钳制的尺寸
      if (menu) {
        menu.style.maxHeight = '';
        menu.style.overflowY = '';
      }
    };
    // layout经setLayout触发本effect重算
  }, [open, container]);

  return createPortal(
    <Select
      {...rest}
      ref={mergeRefs(menuRef, ref)}
      className={clsx(classes, layout?.outOfView && 'oo-ui-element-hidden')}
      style={{
        position: 'absolute',
        top: layout?.top ?? -9999,
        left: layout?.left ?? -9999,
        width: layout?.width,
      }}
    />,
    document.body,
  );
});

MenuSelect.displayName = 'MenuSelect';

export default MenuSelect;
