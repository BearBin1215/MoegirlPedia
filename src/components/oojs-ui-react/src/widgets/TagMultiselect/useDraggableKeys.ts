import {
  useEffect,
  useRef,
  useState,
  type DragEvent,
} from 'react';
import { useLatestRef } from '../../hooks';

/** 拖拽视觉阶段：clone为原生拖影定格帧、placeholder为原地半透明占位 */
export type DragPhase = 'clone' | 'placeholder';

/**
 * 有序key列表的拖拽重排状态机（对齐原版`mixin.DraggableElement`/`mixin.DraggableGroupElement`的预览换位语义）。
 * 与具体数据类型无关：只吃「当前顺序的key序列」与「哪些key不可动」的判定，吐预览顺序与事件回调，
 * 由调用方把预览顺序映射成数据渲染、并在拖拽结束时提交新顺序。
 *
 * 两处与原版不同的实现方式（行为一致）：
 * - 预览换位走state由React渲染体现，不像原版那样直接搬DOM节点（手改的DOM会被React下次渲染抹掉）；
 * - 拖拽态另存ref同步读取：`dragover`/`drop`可能在同一任务内紧随`dragstart`触发（React尚未回流），
 *   处理器读渲染期闭包会拿到旧值而使整段拖拽静默失效。
 */
export function useDraggableKeys({
  keys,
  enabled,
  isBarrier,
}: {
  /** 当前顺序的key序列 */
  keys: string[];
  /** 是否允许拖拽；false时dragstart被阻止 */
  enabled: boolean;
  /**
   * 该key是否为「屏障项」：屏障项自身不可移动，且非屏障项不得被拖到屏障项之前
   * （TagMultiselect的固定标签即此；不传则任意位置可落）
   */
  isBarrier?: (key: string) => boolean;
}): {
  /** 拖拽中的key；null为非拖拽态 */
  draggingKey: string | null;
  /** 拖拽视觉阶段 */
  dragPhase: DragPhase;
  /** 拖拽预览顺序；null时按调用方的实际顺序渲染 */
  previewKeys: string[] | null;
  /** 拖拽开始（供源元素的onDragStart转调） */
  startDrag: (key: string, event: DragEvent<HTMLElement>) => void;
  /** 拖拽经过（供拖拽组根的onDragOver转调）：按命中项下标更新预览顺序 */
  handleDragOver: (event: DragEvent<HTMLElement>) => void;
  /** 拖拽结束/放下：返回最终key顺序（无拖拽进行中时为null）并清空拖拽态 */
  endDrag: () => string[] | null;
} {
  const [draggingKey, setDraggingKey] = useState<string | null>(null);
  const [dragPhase, setDragPhase] = useState<DragPhase>('clone');
  const [previewKeys, setPreviewKeys] = useState<string[] | null>(null);
  // 处理器同步读取的最新值：列表、开关与拖拽态都经ref读取，避免渲染期闭包过期
  const configRef = useLatestRef({ keys, enabled, isBarrier });
  const draggingKeyRef = useRef<string | null>(null);
  const previewKeysRef = useRef<string[] | null>(null);
  /** 拖影定格转占位的定时器，卸载与拖拽结束时清理 */
  const phaseTimerRef = useRef<number | null>(null);

  useEffect(() => () => {
    if (phaseTimerRef.current !== null) {
      window.clearTimeout(phaseTimerRef.current);
    }
  }, []);

  /** 写入拖拽态（ref同步供处理器读取，state驱动渲染） */
  const applyState = (key: string | null, nextKeys: string[] | null) => {
    draggingKeyRef.current = key;
    previewKeysRef.current = nextKeys;
    setDraggingKey(key);
    setPreviewKeys(nextKeys);
  };

  const clearPhaseTimer = () => {
    if (phaseTimerRef.current !== null) {
      window.clearTimeout(phaseTimerRef.current);
      phaseTimerRef.current = null;
    }
  };

  const startDrag = (key: string, event: DragEvent<HTMLElement>) => {
    const { enabled: canDrag, keys: currentKeys } = configRef.current;
    if (!canDrag) {
      event.preventDefault();
      return;
    }
    const transfer = event.dataTransfer;
    if (transfer) {
      transfer.effectAllowed = 'move';
      transfer.dropEffect = 'none';
      try {
        // Firefox须写入dataTransfer数据才认可该元素可拖（原版同款兜底）
        transfer.setData('application-x/OOUI-draggable', String(currentKeys.indexOf(key)));
        if (!transfer.getData('text')) {
          transfer.setData('text', ' ');
        }
      } catch {
        // 个别浏览器限制自定义类型写入，忽略即可
      }
    }
    applyState(key, currentKeys.slice());
    setDragPhase('clone');
    clearPhaseTimer();
    // 原生拖影在dragstart当帧定格：下一帧再切占位态，避免拖影也被半透明化（对齐原版setTimeout）
    phaseTimerRef.current = window.setTimeout(() => setDragPhase('placeholder'), 0);
  };

  const handleDragOver = (event: DragEvent<HTMLElement>) => {
    const dragging = draggingKeyRef.current;
    const currentKeys = previewKeysRef.current;
    if (!dragging || !currentKeys) {
      return;
    }
    // 恒preventDefault：允许drop并阻止默认行为（原版onDragOver同款）
    event.preventDefault();
    const itemEl = (event.target as HTMLElement | null)?.closest<HTMLElement>('.oo-ui-draggableElement');
    const overIndex = itemEl?.dataset.index === undefined ? NaN : Number(itemEl.dataset.index);
    const dragPosition = currentKeys.indexOf(dragging);
    if (!Number.isInteger(overIndex) || dragPosition === -1 || overIndex === dragPosition) {
      return;
    }
    // 移动语义：先把拖拽项摘出，再插回命中项所在下标（等价原版的`.eq(targetIndex-1).after()`）
    const withoutDrag = currentKeys.filter((key) => key !== dragging);
    // 屏障项顺序不受拖拽影响：非屏障项不得被放到屏障项之前
    const barrier = configRef.current.isBarrier;
    let minIndex = 0;
    if (barrier) {
      withoutDrag.forEach((key, index) => {
        if (barrier(key)) {
          minIndex = index + 1;
        }
      });
    }
    withoutDrag.splice(Math.min(Math.max(overIndex, minIndex), withoutDrag.length), 0, dragging);
    applyState(dragging, withoutDrag);
  };

  const endDrag = (): string[] | null => {
    const finalKeys = previewKeysRef.current;
    clearPhaseTimer();
    applyState(null, null);
    return finalKeys;
  };

  return { draggingKey, dragPhase, previewKeys, startDrag, handleDragOver, endDrag };
}
