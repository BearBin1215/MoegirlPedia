import React, {
  useEffect,
  useRef,
  forwardRef,
  type ReactNode,
} from 'react';
import clsx from 'clsx';
import MenuLayout, { type MenuLayoutProps } from '../MenuLayout';
import PanelLayout from '../PanelLayout';
import OutlineSelect from '../../widgets/OutlineSelect';
import Button from '../../widgets/Button';
import StackLayout from '../StackLayout';
import type { PageLayoutProps } from '../PageLayout';
import type { ChangeHandler } from '../../utils';
import { useControlledValue } from '../../hooks';

interface BookletLayoutOptionProps extends PageLayoutProps {
  /** 菜单选项显示内容 */
  label: ReactNode;

  /** 页签值，同时作为激活匹配依据与列表key */
  value: string | number;

  /** 是否可被上/下移动（对齐原版OutlineOptionWidget的movable配置，editable模式下控制按钮可用性） */
  movable?: boolean;

  /** 是否可被移除（对齐原版removable配置） */
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

  /** 是否显示大纲。对齐原版`outlined`配置，默认`false`（纯堆叠模式） */
  outlined?: boolean;

  /** 是否连续显示所有页面，切页时滚动至目标页。对齐原版`continuous`配置 */
  continuous?: boolean;

  /**
   * 切页后自动聚焦页面内第一个可聚焦元素（焦点已在该页内时不重复聚焦）。
   * 对齐原版`autoFocus`配置，默认`true`
   */
  autoFocus?: boolean;

  /**
   * 是否在大纲底部显示操作控件（上移/下移/移除，对齐原版`editable`配置与OutlineControlsWidget）。
   * 操作结果经onMoveOption/onRemoveOption回调交由调用方更新options
   */
  editable?: boolean;

  /** editable模式下点击上移/下移时触发，direction为-1（上移）或1（下移） */
  onMoveOption?: (value: string | number, direction: -1 | 1) => void;

  /** editable模式下点击移除时触发 */
  onRemoveOption?: (value: string | number) => void;

  /**
   * editable模式下大纲控件左侧的额外按钮区（对齐原版OutlineControlsWidget经addItems放入items分组的用法，
   * 如“添加”按钮），按钮的点击行为由调用方自行处理
   */
  outlineControlsExtra?: ReactNode;
}

const BookletLayout = forwardRef<HTMLDivElement, BookletLayoutProps>(({
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
  const { value: activeValue, commit } = useControlledValue<string | number>({ value, defaultValue }, onChange);
  const stackRef = useRef<HTMLDivElement>(null);
  const isFirstEffectRun = useRef(true);
  // 上一轮options，用于激活页签失效（如被移除）时定位其在旧列表中的位置以选中相邻项
  const prevOptionsRef = useRef(options);

  const classes = clsx(
    className,
    'oo-ui-bookletLayout',
  );

  // editable相关标记仅用于控件按钮禁用计算（见下方selectedOption等），
  // 大纲选项与页面均不透传（避免落成DOM属性）
  const menuOptions = options.map((option) => ({
    ...option,
    children: option.label,
    hidden: undefined,
    movable: undefined,
    removable: undefined,
  }));
  const pageOptions = options.map(({ movable: _movable, removable: _removable, ...pageRest }) => pageRest);

  // 对齐原版OutlineControlsWidget.onOutlineChange的按钮禁用规则
  const selectedOption = options.find((o) => o.value === activeValue);
  const movableSelected = !!selectedOption?.movable;
  const removableSelected = !!selectedOption?.removable;
  const movableValues = options.filter((o) => o.movable);
  const selectedIsFirstMovable = movableValues[0]?.value === activeValue;
  const selectedIsLastMovable = movableValues[movableValues.length - 1]?.value === activeValue;

  const handleSelect = (selectedValue: string | number) => {
    if (selectedValue !== activeValue) {
      commit(selectedValue);
    }
  };

  // 激活页签失效（被移除）时，经handleSelect提议相邻页签：非受控直接生效，受控由父组件决定是否采纳
  // （对齐原版移除页后自动选中相邻页的行为，同时不覆盖受控value）
  useEffect(() => {
    const prevOptions = prevOptionsRef.current;
    prevOptionsRef.current = options;
    if (activeValue === undefined || options.some((o) => o.value === activeValue)) {
      return;
    }
    const oldIndex = prevOptions.findIndex((o) => o.value === activeValue);
    const fallback = options[oldIndex] ?? options[oldIndex - 1] ?? options[0];
    if (fallback) {
      handleSelect(fallback.value);
    }
    // handleSelect按props捕获当前activeValue，无需加入依赖
  }, [options, activeValue]);

  // 对齐原版onStackLayoutSet：continuous时滚动至激活页；autoFocus时聚焦页内第一个可聚焦元素
  useEffect(() => {
    if (activeValue === undefined) {
      return;
    }
    const stack = stackRef.current;
    const activePage = stack?.querySelector<HTMLElement>('.oo-ui-pageLayout-active');
    if (!activePage) {
      return;
    }
    const isContinuous = !!continuous;
    if (isContinuous && !isFirstEffectRun.current) {
      activePage.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    isFirstEffectRun.current = false;
    if (autoFocus && !activePage.contains(document.activeElement)) {
      const focusable = activePage.querySelector<HTMLElement>(
        'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
      );
      focusable?.focus();
    }
  }, [activeValue, autoFocus, continuous]);

  // 对齐原版onStackLayoutFocus：焦点进入某页时切换激活页（continuous模式下的滚动联动）
  const handleFocus = (focusedValue: string | number) => {
    handleSelect(focusedValue);
  };

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
                <Button
                  framed={false}
                  icon='upTriangle'
                  title='上移'
                  disabled={!movableSelected || selectedIsFirstMovable}
                  onClick={() => activeValue !== undefined && onMoveOption?.(activeValue, -1)}
                />
                <Button
                  framed={false}
                  icon='downTriangle'
                  title='下移'
                  disabled={!movableSelected || selectedIsLastMovable}
                  onClick={() => activeValue !== undefined && onMoveOption?.(activeValue, 1)}
                />
                <Button
                  framed={false}
                  icon='trash'
                  title='移除'
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
        activeValue={activeValue}
        options={pageOptions}
        continuous={continuous}
        onPageFocus={continuous ? (focusedValue) => handleFocus(focusedValue) : undefined}
        ref={stackRef}
      />
    </MenuLayout>
  );
});

BookletLayout.displayName = 'BookletLayout';

export default BookletLayout;
