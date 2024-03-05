import type { PageProps, Cmtype } from '../utils';

/**
 * 通过`list=xxx`请求得到的数据
 */

export interface Categorymembers extends PageProps {
  /**
   * 添加用于分类中排序的关键字（十六进制字符串）
   */
  sortkey?: string;

  /**
   * 添加用于分类中排序的关键字前缀（关键字的人类可读部分）
   */
  sortkeyprefix?: string;

  /**
   * 添加页面被分类的类型
   */
  type: Cmtype;

  /**
   * 页面被包括时的时间戳
   */
  timestamp?: string;
}
