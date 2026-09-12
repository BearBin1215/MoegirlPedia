import React, {
  useEffect,
  useRef,
  forwardRef,
  type ReactNode,
} from 'react';
import clsx from 'clsx';
import { omit } from 'es-toolkit';
import { MenuLayout, type MenuLayoutProps } from '../MenuLayout';
import { PanelLayout } from '../PanelLayout';
import { TabPanelLayout, type TabPanelLayoutProps } from '../TabPanelLayout';
import { TabSelect } from '../../widgets/TabSelect';
import { type ChangeHandler } from '../../utils';
import { useIsMobile } from '../../config';
import { useAutoFocusPanel, useCleanId, useLayoutSelection } from '../../hooks';

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

/** 页签布局组件，对齐原版`IndexLayout`，菜单固定在顶部 */
export const IndexLayout = forwardRef<HTMLDivElement, IndexLayoutProps>(({
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
  // 未指定时自动选中第一个可选页签（受控回写/非受控提交，见useLayoutSelection）
  const { effectiveValue, select } = useLayoutSelection<string | number>({ value, defaultValue, onChange, options });
  // id片段经useCleanId剥离`:`，可安全用于CSS选择器与aria关联
  const idBase = useCleanId();
  const stackRef = useRef<HTMLDivElement>(null);
  // 移动端形态开关（全局配置）：autoFocus的抑制条件
  const isMobile = useIsMobile();

  const classes = clsx(
    className,
    'oo-ui-indexLayout',
  );

  const activate = (key: string | number) => {
    if (key !== effectiveValue) {
      select(key);
    }
  };

  // 对齐原版autoFocus：切换面板后聚焦新面板内第一个可聚焦元素（初始渲染不聚焦；
  // 移动端形态抑制聚焦，对齐原版onStackLayoutSet的!isMobile条件）
  useAutoFocusPanel({
    activeValue: effectiveValue,
    enabled: autoFocus && !isMobile,
    rootRef: stackRef,
    activeSelector: '.oo-ui-tabPanelLayout-active',
    skipInitialFocus: true,
  });

  // 对齐原版openMatchedPanels：浏览器查找命中隐藏面板时自动切换到对应页签
  useEffect(() => {
    if (!openMatchedPanels || continuous) {
      return undefined;
    }
    const stack = stackRef.current;
    if (!stack) {
      return undefined;
    }
    // beforematch在浏览器页内查找（Ctrl+F）命中hidden="until-found"元素时派发：
    // 按命中面板id反查页签并激活，使查找结果所在面板可见
    const handleBeforeMatch = (e: Event) => {
      const index = options.findIndex(
        (_, i) => `${idBase}-panel-${i}` === (e.target as HTMLElement).id,
      );
      if (index !== -1) {
        const matched = options[index].value;
        if (matched !== effectiveValue) {
          select(matched);
        }
      }
    };
    stack.addEventListener('beforematch', handleBeforeMatch);
    return () => {
      stack.removeEventListener('beforematch', handleBeforeMatch);
    };
  }, [openMatchedPanels, continuous, options, idBase, effectiveValue, select]);

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
              // 对齐原版：页签仅承接label/disabled与元素级属性（原版经tabItemConfig），
              // 面板属性（active/scrollable/padded/framed/expanded等）不透入页签，
              // 否则经TabOption的...rest落成div未知属性触发React开发期告警
              ...omit(option, ['active', 'hidden', 'scrollable', 'padded', 'framed', 'expanded', 'label']),
              value: option.value,
              disabled: option.disabled,
              children: option.label,
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

