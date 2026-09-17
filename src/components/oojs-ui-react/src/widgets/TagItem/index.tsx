import React, {
  forwardRef,
  type KeyboardEvent,
  type MouseEvent,
  type ReactNode,
} from 'react';
import clsx from 'clsx';
import { LabelBase } from '../Label/Base';
import { Button } from '../Button';
import {
  flaggedElementClasses,
  getWidgetClassName,
  resolveTabIndex,
} from '../../mixins';
import { getElementDir } from '../../utils';
import { useMessage } from '../../config';
import type { WidgetProps } from '../Widget';

export interface TagItemProps extends Omit<WidgetProps<HTMLDivElement>, 'onChange' | 'children'> {
  /** 标签显示内容 */
  label?: ReactNode;

  /** 固定标签：不可移除、不可编辑（不渲染关闭按钮） */
  fixed?: boolean;

  /**
   * 标签是否合法
   * @default true
   */
  valid?: boolean;

  /** 项在标签组内的下标，写入`data-index`供组级dragover命中（对齐原版`setIndex`） */
  index?: number;

  /**
   * 拖拽视觉阶段：`clone`为原生拖影定格帧（保持不透明）、`placeholder`为原地半透明占位
   * （对齐原版`DraggableElement`的`-clone`/`-placeholder`类切换）
   */
  dragPhase?: 'clone' | 'placeholder';

  /** 移除回调（点击关闭按钮或按Backspace/Delete时触发） */
  onRemove?: () => void;

  /** 选中回调（点击标签或按Enter时触发） */
  onSelect?: () => void;

  /** 方向键导航回调；方向已按元素有效文本方向解析（LTR下←为backwards、→为forwards，RTL相反） */
  onNavigate?: (direction: 'backwards' | 'forwards') => void;
}

/**
 * 标签项，对齐原版OO.ui.TagItemWidget：标签区内单个标签的渲染与交互
 * （点击标签选中、关闭按钮/Backspace/Delete移除、Enter选中、←→在标签间导航）。
 * 组件自身不持有数据，移除/选中/导航均经回调交TagMultiselect族处理
 */
export const TagItem = forwardRef<HTMLDivElement, TagItemProps>(({
  className,
  disabled,
  label,
  fixed,
  valid = true,
  index,
  dragPhase,
  draggable,
  tabIndex,
  onRemove,
  onSelect,
  onNavigate,
  onClick,
  onKeyDown,
  onMouseDown,
  ...rest
}, ref) => {
  const removeLabel = useMessage('ooui-item-remove');
  // draggable的DOM类型为Booleanish（含字符串），统一归一化后再决定撤下拖拽类
  const isDraggable = draggable === true || draggable === 'true';

  const classes = clsx(
    className,
    getWidgetClassName({ disabled, label }, 'tagItem'),
    fixed && 'oo-ui-tagItemWidget-fixed',
    flaggedElementClasses(valid ? undefined : 'invalid'),
    // 拖拽类对齐原版DraggableElement：handle即元素自身（原版TagItemWidget未传$handle），
    // 置为不可拖时由-undraggable撤下grab光标
    'oo-ui-draggableElement',
    'oo-ui-draggableElement-handle',
    !isDraggable && 'oo-ui-draggableElement-undraggable',
    dragPhase === 'clone' && 'oo-ui-draggableElement-clone',
    dragPhase === 'placeholder' && 'oo-ui-draggableElement-placeholder',
  );

  /** 选中：禁用时不响应（对齐原版TagItemWidget.select的守卫） */
  const select = () => {
    if (!disabled) {
      onSelect?.();
    }
  };

  /** 移除：禁用或固定标签不响应（对齐原版TagItemWidget.remove的守卫） */
  const remove = () => {
    if (!disabled && !fixed) {
      onRemove?.();
    }
  };

  const handleClick = (event: MouseEvent<HTMLDivElement>) => {
    onClick?.(event);
    select();
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    onKeyDown?.(event);
    if (disabled) {
      return;
    }
    switch (event.key) {
      case 'Backspace':
      case 'Delete':
        if (!fixed) {
          event.preventDefault();
          event.stopPropagation();
          remove();
        }
        break;
      case 'Enter':
        event.preventDefault();
        event.stopPropagation();
        select();
        break;
      case 'ArrowLeft':
      case 'ArrowRight': {
        // 方向按元素有效方向解析：LTR下←向后、→向前，RTL相反（对齐原版按getDir的映射）
        const isRtl = getElementDir(event.currentTarget) === 'rtl';
        const backwards = (event.key === 'ArrowLeft') !== isRtl;
        event.preventDefault();
        event.stopPropagation();
        onNavigate?.(backwards ? 'backwards' : 'forwards');
        break;
      }
    }
  };

  /**
   * mousedown恒阻止冒泡（对齐原版TagItemWidget对$element的mousedown监听）：
   * 标签位于TagMultiselect的handle可点击区内，handle靠mousedown聚焦输入框，
   * 标签上的mousedown不应触发该行为
   */
  const handleMouseDown = (event: MouseEvent<HTMLDivElement>) => {
    onMouseDown?.(event);
    event.stopPropagation();
  };

  return (
    <div
      {...rest}
      className={classes}
      draggable={draggable}
      data-index={index}
      aria-disabled={disabled || undefined}
      tabIndex={resolveTabIndex(tabIndex, disabled)}
      ref={ref}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      onMouseDown={handleMouseDown}
    >
      <LabelBase>{label}</LabelBase>
      {!fixed && (
        <Button
          framed={false}
          icon='close'
          tabIndex={-1}
          title={removeLabel}
          disabled={disabled}
          onClick={remove}
        />
      )}
    </div>
  );
});

TagItem.displayName = 'TagItem';
