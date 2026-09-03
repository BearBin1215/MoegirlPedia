import React, {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
  type ElementType,
  type HTMLAttributes,
  type ReactNode,
} from 'react';
import clsx from 'clsx';
import LogLine from './LogLine';
import LogerFilter from './LogerFilter';
import useLogerDetails from './useLogerDetails';
import {
  DEFAULT_LOGER_TYPES,
  UNKNOWN_TYPE_COLOR,
  type LogerCounts,
  type LogerDetail,
  type LogerRef,
  type LogerType,
} from './types';
import './index.css';

/** 距底部小于该值（px）即视为“已贴底”，此时新日志才会自动跟随滚动 */
const STICK_TO_BOTTOM_THRESHOLD = 24;

/** 默认单屏最多渲染的日志条数 */
const DEFAULT_MAX_RENDER_COUNT = 500;

export interface LogerProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children' | 'title'> {
  /**
   * 日志类型定义，缺省为 success/warn/error 三档
   *
   * 只有登记在此处的类型才会出现在筛选栏并参与计数。
   */
  types?: LogerType[];

  /** 受控日志列表，传入即进入受控模式，此时需由外部持有并更新该数组 */
  details?: LogerDetail[];

  /** 非受控模式下的初始日志 */
  defaultDetails?: LogerDetail[];

  /** 标题，传 false 则不渲染标题行 */
  title?: ReactNode | false;

  /** 标题所用的标签或组件，默认 h3 */
  headlineAs?: ElementType;

  /** 是否显示清空按钮，受控模式下需配合 onClear 使用 */
  clearable?: boolean;

  /** 单屏最多渲染的日志条数，超出时仅渲染末尾条目；传 Infinity 关闭该限制 */
  maxRenderCount?: number;

  /** 追加日志后是否自动滚动到底部（仅在用户已贴底时生效），默认 true */
  autoScroll?: boolean;

  /** 被隐藏的类型发生变化时触发 */
  onFilterChange?: (hiddenTypes: string[]) => void;

  /** 点击清空时触发；受控模式下需在此回调中清空 details */
  onClear?: () => void;
}

/**
 * 日志面板（React 版）
 *
 * 提供两种用法：
 * 1. 受控：传入 `details`，组件只负责渲染；
 * 2. 非受控：不传 `details`，通过 ref 调用 `record` / `recordMany` / `clear`。
 *
 * 相对命令式 append 的原生版，此处所有派生数据（类型计数、筛选结果、渲染窗口）
 * 均按依赖缓存，单条日志追加不会触发全量重算；行组件经 memo 化，重复渲染时
 * 仅新增的一行会真正进入 DOM diff。
 */
const Loger = forwardRef<LogerRef, LogerProps>(({
  types = DEFAULT_LOGER_TYPES,
  details: detailsProp,
  defaultDetails,
  title = '日志',
  headlineAs: Headline = 'h3',
  clearable = true,
  maxRenderCount = DEFAULT_MAX_RENDER_COUNT,
  autoScroll = true,
  className,
  onFilterChange,
  onClear,
  ...rest
}, ref) => {
  const linesRef = useRef<HTMLUListElement>(null);
  const stickToBottom = useRef(true);
  const [hiddenTypes, setHiddenTypes] = useState<string[]>([]);

  // 镜像一份，使切换筛选的回调可以脱离 state 依赖保持引用稳定
  const hiddenTypesRef = useRef<string[]>(hiddenTypes);

  const {
    details: rawDetails,
    controlled,
    record,
    recordMany,
    clear,
  } = useLogerDetails({
    details: detailsProp,
    defaultDetails,
  });

  /** 补齐缺省 id，使行组件的 key 稳定 */
  const details = useMemo(
    () => rawDetails.map((detail, index) => ({ ...detail, id: detail.id ?? index })),
    [rawDetails],
  );

  const typeMap = useMemo(
    () => new Map(types.map((type) => [type.name, type])),
    [types],
  );

  /** 各类型条数，单次遍历得出，避免每个筛选按钮各自遍历一遍列表 */
  const counts = useMemo<LogerCounts>(() => {
    const result: LogerCounts = {};
    for (const { name } of types) {
      result[name] = 0;
    }
    for (const { type } of details) {
      // 用 hasOwn 而非 in，避免 type 为 toString 等原型属性时误判为已登记
      if (type !== undefined && Object.hasOwn(result, type)) {
        result[type]++;
      }
    }
    return result;
  }, [details, types]);

  const visibleDetails = useMemo(() => {
    if (hiddenTypes.length === 0) {
      return details;
    }
    const hidden = new Set(hiddenTypes);
    return details.filter(({ type }) => type === undefined || !hidden.has(type));
  }, [details, hiddenTypes]);

  /** 超出上限时只渲染末尾条目，避免长任务下 DOM 节点无限增长 */
  const [renderedDetails, omittedCount] = useMemo(() => {
    if (visibleDetails.length <= maxRenderCount) {
      return [visibleDetails, 0] as const;
    }
    return [
      visibleDetails.slice(visibleDetails.length - maxRenderCount),
      visibleDetails.length - maxRenderCount,
    ] as const;
  }, [visibleDetails, maxRenderCount]);

  const scrollToBottom = useCallback(() => {
    const lines = linesRef.current;
    if (lines) {
      lines.scrollTop = lines.scrollHeight;
    }
  }, []);

  // 仅在日志条数变化时跟随，切换筛选不打断用户当前位置
  useEffect(() => {
    if (autoScroll && stickToBottom.current) {
      scrollToBottom();
    }
  }, [details.length, autoScroll, scrollToBottom]);

  const handleScroll = useCallback(() => {
    const lines = linesRef.current;
    if (!lines) {
      return;
    }
    stickToBottom.current = lines.scrollHeight - lines.scrollTop - lines.clientHeight <= STICK_TO_BOTTOM_THRESHOLD;
  }, []);

  const handleToggleType = useCallback((name: string) => {
    const prev = hiddenTypesRef.current;
    const next = prev.includes(name)
      ? prev.filter((item) => item !== name)
      : [...prev, name];
    hiddenTypesRef.current = next;
    setHiddenTypes(next);
    onFilterChange?.(next);
  }, [onFilterChange]);

  const showClear = clearable && (!controlled || onClear !== undefined);
  const showHeadline = title !== false && (title !== undefined || showClear);

  const handleClear = useCallback(() => {
    if (!controlled) {
      clear();
    }
    onClear?.();
  }, [controlled, clear, onClear]);

  useImperativeHandle(ref, () => ({
    record,
    recordMany,
    clear,
    scrollToBottom,
    get element() {
      return linesRef.current;
    },
  }), [record, recordMany, clear, scrollToBottom]);

  const headlineNode = showHeadline
    ? (
      <Headline className='loger-headline'>
        {title}
        {showClear
          ? (
            <a
              className='loger-clear'
              role='button'
              tabIndex={0}
              onClick={handleClear}
              onKeyDown={(event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                  event.preventDefault();
                  handleClear();
                }
              }}
            >
              [清空]
            </a>
          )
          : null}
      </Headline>
    )
    : null;

  const filterNode = types.length > 0
    ? (
      <LogerFilter
        types={types}
        counts={counts}
        hiddenTypes={hiddenTypes}
        onToggle={handleToggleType}
      />
    )
    : null;

  const omittedNode = omittedCount > 0
    ? <li className='loger-record loger-record-omitted'>{`……以上省略较早的 ${omittedCount} 条日志`}</li>
    : null;

  return (
    <div
      className={clsx('bearbintools-loger', className)}
      {...rest}
    >
      {headlineNode}
      <div className='loger-body'>
        {filterNode}
        <ul
          className='loger-lines'
          ref={linesRef}
          onScroll={handleScroll}
        >
          {omittedNode}
          {renderedDetails.map(({ id, type, time, text }) => (
            <LogLine
              key={id}
              className={clsx('loger-record', type !== undefined && `loger-${type}`)}
              color={type === undefined ? UNKNOWN_TYPE_COLOR : typeMap.get(type)?.color ?? UNKNOWN_TYPE_COLOR}
              time={time}
              text={text}
            />
          ))}
        </ul>
      </div>
    </div>
  );
});

Loger.displayName = 'Loger';

export default Loger;
