import { createContext, useContext } from 'react';

/**
 * 按钮组禁用态下发通道（原版`ButtonGroupWidget`未覆写`setDisabled`，只给组根切类、组内按钮仍enabled，
 * 本工程按「组禁用即各项禁用」的口径把组禁用态下发到组内按钮）：
 * 组内按钮经此继承组禁用态，其自身disabled与组禁用取或。
 * 取代了早先对children做cloneElement注入的写法——cloneElement依赖`child.type === Button`
 * 严格相等，会静默漏掉ToggleButton等组合形态、包一层的Button与memo后的Button。
 * 内部实现，不进入公共导出面
 */
const ButtonGroupDisabledContext = createContext<boolean | undefined>(undefined);

/** 按钮组向组内按钮下发禁用态（仅供ButtonGroup使用） */
export const ButtonGroupDisabledProvider = ButtonGroupDisabledContext.Provider;

/** 读取所在按钮组的禁用态；不在按钮组内时返回undefined */
export function useButtonGroupDisabled(): boolean | undefined {
  return useContext(ButtonGroupDisabledContext);
}
