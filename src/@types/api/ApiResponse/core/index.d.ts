/**
 * API响应的错误或警告信息
 */
export interface ResponseNotification {
  code?: string;

  info?: string;

  '*'?: string;
}

/**
 * API响应基础接口
 */
export interface ApiResponse {
  /**
   * 警告
   */
  warnings?: {
    main: ResponseNotification;

    [key: string]: ResponseNotification;
  };

  /**
   * 错误信息
   */
  error?: ResponseNotification;

  [key: string]: any;
}
