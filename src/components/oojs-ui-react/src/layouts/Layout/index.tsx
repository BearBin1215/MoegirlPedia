import React, { forwardRef, useEffect, useRef } from 'react';
import clsx from 'clsx';
import { omit } from 'es-toolkit/compat';
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

  // React会把hidden属性值归一化为布尔形式，until-found需手动写入
  useEffect(() => {
    if (hidden === 'until-found' && innerRef.current) {
      innerRef.current.setAttribute('hidden', 'until-found');
    }
  }, [hidden]);

  return (
    <div
      {...omit(rest, 'activeKey')}
      className={classes}
      hidden={(hidden || undefined) as boolean | undefined}
      aria-hidden={hidden ? 'true' : undefined}
      ref={(node) => {
        innerRef.current = node;
        if (typeof ref === 'function') {
          ref(node);
        } else if (ref) {
          (ref as React.MutableRefObject<HTMLDivElement | null>).current = node;
        }
      }}
    >
      {children}
    </div>
  );
});

Layout.displayName = 'Layout';

export default Layout;
