import React, {
  useEffect,
  useRef,
  useId,
  forwardRef,
  type ReactNode,
} from 'react';
import clsx from 'clsx';
import MenuLayout, { type MenuLayoutProps } from '../MenuLayout';
import PanelLayout from '../PanelLayout';
import TabPanelLayout, { type TabPanelLayoutProps } from '../TabPanelLayout';
import TabSelect from '../../widgets/TabSelect';
import type { ChangeHandler } from '../../utils';
import { useControlledValue } from '../../hooks';

export interface IndexLayoutTabProps extends TabPanelLayoutProps {
  /** 页签显示内容 */
  label: ReactNode;

  /** 页签值，同时作为激活匹配依据与列表key */
  value: string | number;

  /** 页签是否禁用，禁用页签对应的面板将以hidden完全隐藏 */
  disabled?: boolean;
}

export interface IndexLayoutProps extends Omit<MenuLayoutProps, 'menu' | 'menuPosition' | 'children' | 'onChange'> {
  /** 页签集 */
  options: IndexLayoutTabProps[];

  /** 页签是否有边框 */
  framed?: boolean;

  /** 是否显示全部面板 */
  continuous?: boolean;

  /** 切换面板后是否自动聚焦面板内第一个可聚焦元素 */
  autoFocus?: boolean;

  /** 是否以hidden="until-found"隐藏面板并支持浏览器查找定位后自动切换页签 */
  openMatchedPanels?: boolean;

  /** 当前激活页签（受控，传入即受控模式） */
  value?: string | number;

  /** 非受控初始激活页签 */
  defaultValue?: string | number;

  /** 页签变化钩子 */
  onChange?: ChangeHandler<string | number>;
}

/** @description 页签布局组件，对齐原版`IndexLayout`，菜单固定在顶部 */
const IndexLayout = forwardRef<HTMLDivElement, IndexLayoutProps>(({
  className,
  options,
  framed = true,
  continuous = false,
  autoFocus = true,
  openMatchedPanels = true,
  value,
  defaultValue,
  onChange,
  expanded = true,
  ...rest
}, ref) => {
  // 未指定时对齐原版自动选中第一个可选页签
  const { value: innerActive, commit } = useControlledValue<string | number>({ value, defaultValue }, onChange);
  const effectiveValue = innerActive ?? options[0]?.value;
  const idBase = useId();
  const stackRef = useRef<HTMLDivElement>(null);
  const mountedRef = useRef(false);

  const classes = clsx(
    className,
    'oo-ui-indexLayout',
  );

  const activate = (key: string | number) => {
    if (key !== effectiveValue) {
      commit(key);
    }
  };

  // 对齐原版autoFocus：切换面板后聚焦新面板内第一个可聚焦元素（初始渲染不聚焦）
  useEffect(() => {
    if (!mountedRef.current) {
      mountedRef.current = true;
      return;
    }
    if (!autoFocus || continuous) {
      return;
    }
    const stack = stackRef.current;
    const activePanel = stack?.querySelector<HTMLElement>('.oo-ui-tabPanelLayout-active');
    if (!activePanel) {
      return;
    }
    const { activeElement } = activePanel.ownerDocument;
    if (activeElement && activePanel.contains(activeElement)) {
      return;
    }
    const focusable = activePanel.querySelector<HTMLElement>(
      'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
    );
    focusable?.focus();
  }, [effectiveValue, autoFocus, continuous]);

  // 对齐原版openMatchedPanels：浏览器查找命中隐藏面板时自动切换到对应页签
  useEffect(() => {
    if (!openMatchedPanels || continuous) {
      return undefined;
    }
    const stack = stackRef.current;
    if (!stack) {
      return undefined;
    }
    const handleBeforeMatch = (e: Event) => {
      const index = options.findIndex(
        (_, i) => `${idBase}-panel-${i}` === (e.target as HTMLElement).id,
      );
      if (index !== -1) {
        activate(options[index].value);
      }
    };
    stack.addEventListener('beforematch', handleBeforeMatch);
    return () => {
      stack.removeEventListener('beforematch', handleBeforeMatch);
    };
  }, [openMatchedPanels, continuous, options, idBase, effectiveValue, onChange]);

  return (
    <MenuLayout
      {...rest}
      expanded={expanded}
      className={classes}
      menuPosition='top'
      menu={
        <PanelLayout className='oo-ui-indexLayout-tabPanel' expanded={expanded}>
          <TabSelect
            framed={framed}
            value={effectiveValue}
            onChange={activate}
            options={options.map((option, i) => ({
              ...option,
              children: option.label,
              hidden: undefined,
              id: `${idBase}-tab-${i}`,
              'aria-controls': `${idBase}-panel-${i}`,
            }))}
          />
        </PanelLayout>
      }
      ref={ref}
    >
      <PanelLayout
        ref={stackRef}
        className='oo-ui-stackLayout oo-ui-indexLayout-stackLayout'
        expanded={expanded}
        scrollable={continuous}
      >
        {options.map((option, i) => (
          <TabPanelLayout
            {...option}
            key={option.value}
            id={`${idBase}-panel-${i}`}
            aria-labelledby={`${idBase}-tab-${i}`}
            active={option.value === effectiveValue}
            hidden={
              !continuous && option.value !== effectiveValue
                ? (openMatchedPanels && !option.disabled ? 'until-found' : true)
                : undefined
            }
          />
        ))}
      </PanelLayout>
    </MenuLayout>
  );
});

IndexLayout.displayName = 'IndexLayout';

export default IndexLayout;
