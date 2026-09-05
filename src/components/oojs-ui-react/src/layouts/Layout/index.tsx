import React, { forwardRef, useEffect, useRef } from 'react';
import clsx from 'clsx';
import { mergeRefs } from '../../utils';
import type { ElementProps } from '../../Element';

export interface LayoutProps extends Omit<ElementProps, 'hidden'> {
  /**
   * 是否隐藏。对齐原版：`true`渲染`hidden`属性并附加`oo-ui-element-hidden`；
   * `'until-found'`仅渲染`hidden="until-found"`（可被浏览器查找定位后触发beforematch）
   */
  hidden?: boolean | 'until-found';
}

/** @description 布局组件基础 */
const Layout = forwardRef<HTMLDivElement, LayoutProps>(({
  className,
  children,
  hidden,
  ...rest
}, ref) => {
  const innerRef = useRef<HTMLDivElement | null>(null);
  const classes = clsx(
    className,
    'oo-ui-layout',
    hidden === true && 'oo-ui-element-hidden',
  );

  // React 18将hidden归入BOOLEAN属性：任何真值（含'until-found'字符串）都被写成hidden=""，
  // 故until-found需在commit后手动写入才能生效（React 19起hidden类型已支持'until-found'，届时可移除）
  useEffect(() => {
    if (hidden === 'until-found' && innerRef.current) {
      innerRef.current.setAttribute('hidden', 'until-found');
    }
  }, [hidden]);

  return (
    <div
      {...rest}
      className={classes}
      // 保留原始值（而非归一化为布尔）传入：React需感知true↔'until-found'切换才会重写DOM属性；
      // 断言仅为绕过React 18类型定义（hidden仅声明为boolean）
      hidden={(hidden || undefined) as boolean | undefined}
      aria-hidden={hidden ? 'true' : undefined}
      ref={mergeRefs(innerRef, ref)}
    >
      {children}
    </div>
  );
});

Layout.displayName = 'Layout';

export default Layout;
