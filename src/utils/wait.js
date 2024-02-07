/**
 * 同步延时
 * @param {number} time 等待时间
 * @returns {Promise<void>}
 */
const waitInterval = (time) => {
  return new Promise((resolve) => setTimeout(resolve, time));
};

export default waitInterval;
