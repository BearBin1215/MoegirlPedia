import React, { forwardRef, type ReactNode } from 'react';
import clsx from 'clsx';
import { omit } from 'es-toolkit';
import { buttonElementClasses, getButtonIconClasses, getWidgetClassName, optionWidgetClasses, resolveTitle } from '../../mixins';
import type { IconElement, IndicatorElement } from '../../Element';
import type { OptionProps } from '../Option';
import { ButtonSlots } from '../Button/slots';

export interface ButtonOptionProps extends OptionProps, IconElement, IndicatorElement {
  /** 是否为鼠标按压中的选项（由ButtonSelect拖拽逻辑驱动） */
  pressed?: boolean;

  /** 是否生成边框（对齐原版ButtonElement的framed配置，缺省带边框） */
  framed?: boolean;

  /** 选项集复用时随对象透入的标签，仅供组件吞掉以避免落成DOM属性（渲染用children） */
  label?: ReactNode;
}

/**
 * 按钮式选项，对齐原版OO.ui.ButtonOptionWidget：根为`role=option`的容器，内部`<a>`承载
 * 图标/标签/指示器（原版ButtonElement的$button结构），选中态同时输出`oo-ui-optionWidget-selected`
 * 与`oo-ui-buttonElement-active`（原版setSelected连带setActive），供ButtonSelect渲染。
 *
 * 该选项不可高亮（原版static.highlightable=false），故不复用DecoratedOption——
 * 元素要落在内层按钮里而非容器内
 */
export const ButtonOption = forwardRef<HTMLDivElement, ButtonOptionProps>(({
  accessKey,
  children,
  className,
  disabled,
  framed,
  icon,
  indicator,
  pressed,
  selected,
  title,
  ...rest
}, ref) => {
  const isFramed = framed !== false;
  // 图标/指示器变体：带边框的按钮在激活（选中）或禁用时整体反色，无边框禁用时保持原色
  // （对齐wikimediaui主题getElementClasses的按钮分支，与Button共用同一规则）。
  // 末位的flags给空数组：本工程选项族不开放flags（原版选项经OptionWidget混入的
  // FlaggedElement可再取progressive/destructive等变体），见docs/TODO.md舍弃节
  const iconClasses = getButtonIconClasses({ framed: isFramed, active: selected, disabled, flags: [] });
  const classes = clsx(
    className,
    getWidgetClassName({ disabled, label: children, icon, indicator }, 'option', 'buttonOption'),
    // 原版ButtonOptionWidget.setSelected连带setActive：选中即按钮激活态（主题按激活态给底色与反色文字）
    buttonElementClasses({ framed: isFramed, active: selected, disabled, pressed }),
    // 原版ButtonOptionWidget.static.highlightable=false（按钮选项无高亮态）
    optionWidgetClasses({ selected, pressed, highlightable: false }),
  );

  return (
    <div
      {...omit(rest, ['value', 'highlighted', 'label'])}
      className={classes}
      // accessKey落在根元素：对齐原版OptionWidget的$accessKeyed（$element；根可编程聚焦，
      // 快捷键可达）。title不在此——见下方锚点
      accessKey={accessKey}
      aria-disabled={disabled || undefined}
      tabIndex={-1}
      role='option'
      aria-selected={!!selected}
      ref={ref}
    >
      {/* role=button：对齐原版setButtonElement对A元素补role；
          title落锚点：原版ButtonOptionWidget构造末尾setTitledElement($button)把
          OptionWidget构造期的$titled（$element）重定向到$button */}
      <a
        className='oo-ui-buttonElement-button'
        role='button'
        title={resolveTitle({ title, accessKey })}
      >
        <ButtonSlots
          icon={icon}
          variantClasses={iconClasses}
          label={children}
          indicator={indicator}
        />
      </a>
    </div>
  );
});

ButtonOption.displayName = 'ButtonOption';
