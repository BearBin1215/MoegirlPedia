import type { ApiResponse } from './core';

/**
 * 移动报错
 */
export interface ApiMoveError {
  message: string;

  params: string[];

  code: string;

  type: string;
}

export interface ApiMoveSubpageInfo {
  /** 被重命名的子页面标题 */
  from: string;

  /** 重命名后的子页面标题 */
  to?: string;

  errors: ApiMoveError[];
}

export interface ApiMoveResult extends ApiMoveInfo {
  /** 被重命名的页面标题 */
  from: string;

  /** 重命名的目标标题 */
  to: string;

  /** 移动原因（摘要） */
  reason?: string;

  /** 是否保留重定向 */
  redirectcreated?: '';

  /** 是否覆盖重定向 */
  moveoverredirect?: '';

  /** 被移动的讨论页标题 */
  talkfrom?: string;

  /** 移动后讨论页标题 */
  talkto?: string;

  /** 被移动的子页面 */
  subpages?: ApiMoveSubpageInfo[];

  /** 被移动的子页面的讨论页 */
  'subpages-talk'?: ApiMoveSubpageInfo[];
}

export interface ApiMoveResponse extends ApiResponse {
  /** 移动结果 */
  move?: ApiMoveResult;
}
