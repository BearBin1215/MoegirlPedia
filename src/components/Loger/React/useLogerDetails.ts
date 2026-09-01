import { useCallback, useRef, useState } from 'react';
import type { LogerDetail } from './types';

export interface UseLogerDetailsOptions {
  /** 受控日志列表，传入即进入受控模式 */
  details?: LogerDetail[];

  /** 非受控模式下的初始日志 */
  defaultDetails?: LogerDetail[];
}

export interface LogerDetailsController {
  /** 当前生效的日志列表 */
  details: LogerDetail[];

  /** 是否为受控模式 */
  controlled: boolean;

  /** 追加一条日志，返回其 id */
  record: (detail: LogerDetail) => string | number;

  /** 批量追加日志，返回新增日志的 id 列表 */
  recordMany: (details: LogerDetail[]) => (string | number)[];

  /** 清空全部日志 */
  clear: () => void;
}

/**
 * 管理日志列表，同时支持受控与非受控两种模式
 *
 * 非受控模式下通过 {@link LogerRef} 暴露的 record/clear 变更数据；
 * 受控模式下由外部持有 details，此处仅做透传。
 */
export default function useLogerDetails({ details, defaultDetails }: UseLogerDetailsOptions): LogerDetailsController {
  const controlled = details !== undefined;
  const [innerDetails, setInnerDetails] = useState<LogerDetail[]>(defaultDetails ?? []);
  const idCounter = useRef(0);

  /** 分配自增 id，保证非受控模式下行组件的 key 稳定 */
  const nextId = useCallback(() => `loger-${++idCounter.current}`, []);

  const record = useCallback((detail: LogerDetail): string | number => {
    const id = detail.id ?? nextId();
    setInnerDetails((prev) => [...prev, { ...detail, id }]);
    return id;
  }, [nextId]);

  const recordMany = useCallback((newDetails: LogerDetail[]): (string | number)[] => {
    if (newDetails.length === 0) {
      return [];
    }
    const appended = newDetails.map((detail) => ({ ...detail, id: detail.id ?? nextId() }));
    setInnerDetails((prev) => [...prev, ...appended]);
    return appended.map(({ id }) => id as string | number);
  }, [nextId]);

  const clear = useCallback(() => setInnerDetails([]), []);

  return {
    details: controlled ? details : innerDetails,
    controlled,
    record,
    recordMany,
    clear,
  };
}
