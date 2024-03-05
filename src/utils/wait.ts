/**
 * 同步延时
 * @param time 等待时间
 */
const waitInterval = (time: number): Promise<void> => {
  return new Promise((resolve) => setTimeout(resolve, time));
};

export default waitInterval;
