import React, {
  useRef,
  forwardRef,
  type ReactNode,
} from 'react';
import clsx from 'clsx';
import { omit } from 'es-toolkit';
import { MenuLayout, type MenuLayoutProps } from '../MenuLayout';
import { PanelLayout } from '../PanelLayout';
import { OutlineSelect } from '../../widgets/OutlineSelect';
import { Button } from '../../widgets/Button';
import { StackLayout } from '../StackLayout';
import type { PageLayoutProps } from '../PageLayout';
import { type ChangeHandler } from '../../utils';
import { useAutoFocusPanel, useLayoutSelection } from '../../hooks';
import { useIsMobile, useMessage } from '../../config';

interface BookletLayoutOptionProps extends PageLayoutProps {
  /** 菜单选项显示内容 */
  label: ReactNode;

  /** 页签值，同时作为激活匹配依据与列表key */
  value: string | number;

  /** 是否可被上/下移动（editable模式下控制按钮可用性） */
  movable?: boolean;

  /** 是否可被移除 */
  removable?: boolean;
}

export interface BookletLayoutProps extends Omit<MenuLayoutProps, 'menu' | 'children' | 'onChange'> {
  /** 当前激活页签（受控，传入即受控模式） */
  value?: string | number;

  /** 非受控初始激活页签 */
  defaultValue?: string | number;

  /** 页签集 */
  options: BookletLayoutOptionProps[];

  /** 页签变化钩子 */
  onChange?: ChangeHandler<string | number>;

  /** 是否显示大纲，默认`false`（纯堆叠模式） */
  outlined?: boolean;

  /** 是否连续显示所有页面，切页时滚动至目标页 */
  continuous?: boolean;

  /**
   * 切页后自动聚焦页面内第一个可聚焦元素（焦点已在该页内时不重复聚焦），
   * 默认`true`
   */
  autoFocus?: boolean;

  /**
   * 是否在大纲底部显示操作控件（上移/下移/移除）。
   * 操作结果经onMoveOption/onRemoveOption回调交由调用方更新options
   */
  editable?: boolean;

  /** editable模式下点击上移/下移时触发，direction为-1（上移）或1（下移） */
  onMoveOption?: (value: string | number, direction: -1 | 1) => void;

  /** editable模式下点击移除时触发 */
  onRemoveOption?: (value: string | number) => void;

  /**
   * editable模式下大纲控件左侧的额外按钮区（如“添加”按钮），
   * 按钮的点击行为由调用方自行处理
   */
  outlineControlsExtra?: ReactNode;
}

export const BookletLayout = forwardRef<HTMLDivElement, BookletLayoutProps>(({
  className,
  options,
  value,
  defaultValue,
  onChange,
  outlined = false,
  showMenu,
  continuous,
  autoFocus = true,
  editable = false,
  onMoveOption,
  onRemoveOption,
  outlineControlsExtra,
  ...rest
}, ref) => {
  // 激活页选择：失效（被移除）时按邻近回退，受控回写/非受控提交（见useLayoutSelection）。
  // 原版不补选（其removePages注释明确「选哪页属业务逻辑」），此为增强行为，见docs/TODO.md
  const { effectiveValue: activeValue, select } = useLayoutSelection<string | number>({
    value,
    defaultValue,
    onChange,
    options,
  });
  const stackRef = useRef<HTMLDivElement>(null);

  const classes = clsx(
    className,
    'oo-ui-bookletLayout',
  );

  // editable相关标记（movable/removable）与页面专属属性仅用于按钮禁用计算与StackLayout渲染，
  // 大纲选项不透传（避免落成DOM属性）；label转为children供LabelBase渲染
  const menuOptions = options.map((option) => ({
    ...omit(option, ['active', 'hidden', 'scrollable', 'padded', 'framed', 'expanded', 'movable', 'removable', 'label']),
    children: option.label,
  }));
  const pageOptions = options.map((option) => omit(option, ['movable', 'removable']));

  // 对齐原版OutlineControlsWidget.onOutlineChange的按钮禁用规则
  const selectedOption = options.find((o) => o.value === activeValue);
  const movableSelected = !!selectedOption?.movable;
  const removableSelected = !!selectedOption?.removable;
  const movableValues = options.filter((o) => o.movable);
  const selectedIsFirstMovable = movableValues[0]?.value === activeValue;
  const selectedIsLastMovable = movableValues[movableValues.length - 1]?.value === activeValue;
  // 大纲控制按钮的缺省标题（对齐原版ooui-outline-control-*消息）
  const moveUpTitle = useMessage('ooui-outline-control-move-up');
  const moveDownTitle = useMessage('ooui-outline-control-move-down');
  const removeTitle = useMessage('ooui-outline-control-remove');
  // 移动端形态开关（全局配置）：autoFocus的抑制条件
  const isMobile = useIsMobile();

  const handleSelect = (selectedValue: string | number) => {
    if (selectedValue !== activeValue) {
      select(selectedValue);
    }
  };

  // 对齐原版onStackLayoutSet：continuous时滚动至激活页（首次不滚动）；autoFocus时
  // 聚焦页内第一个可聚焦元素（焦点已在该页内时useAutoFocusPanel自动跳过；
  // 移动端形态抑制聚焦，对齐原版的!isMobile条件）
  useAutoFocusPanel({
    activeValue,
    enabled: autoFocus && !isMobile,
    rootRef: stackRef,
    activeSelector: '.oo-ui-pageLayout-active',
    recomputeKey: continuous,
    onBeforeFocus: (activePage, isFirst) => {
      if (continuous && !isFirst) {
        activePage.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    },
  });

  return (
    <MenuLayout
      {...rest}
      className={classes}
      ref={ref}
      showMenu={showMenu ?? outlined}
      menu={outlined ? (
        <PanelLayout
          className={clsx('oo-ui-bookletLayout-outlinePanel', editable && 'oo-ui-bookletLayout-outlinePanel-editable')}
          scrollable
          expanded
        >
          <OutlineSelect
            value={activeValue}
            onChange={handleSelect}
            options={menuOptions}
          />
          {editable && (
            <div className='oo-ui-outlineControlsWidget'>
              <div className='oo-ui-outlineControlsWidget-items'>
                {outlineControlsExtra}
              </div>
              <div className='oo-ui-outlineControlsWidget-movers'>
                {/* 缺省标题经useMessage读取（对齐原版ooui-outline-control-*消息） */}
                <Button
                  framed={false}
                  icon='upTriangle'
                  title={moveUpTitle}
                  disabled={!movableSelected || selectedIsFirstMovable}
                  onClick={() => activeValue !== undefined && onMoveOption?.(activeValue, -1)}
                />
                <Button
                  framed={false}
                  icon='downTriangle'
                  title={moveDownTitle}
                  disabled={!movableSelected || selectedIsLastMovable}
                  onClick={() => activeValue !== undefined && onMoveOption?.(activeValue, 1)}
                />
                <Button
                  framed={false}
                  icon='trash'
                  title={removeTitle}
                  disabled={!removableSelected}
                  onClick={() => activeValue !== undefined && onRemoveOption?.(activeValue)}
                />
              </div>
            </div>
          )}
        </PanelLayout>
      ) : undefined}
    >
      <StackLayout
        className='oo-ui-bookletLayout-stackLayout'
        value={activeValue}
        options={pageOptions}
        continuous={continuous}
        onPageFocus={continuous ? (focusedValue) => handleSelect(focusedValue) : undefined}
        ref={stackRef}
      />
    </MenuLayout>
  );
});

BookletLayout.displayName = 'BookletLayout';

