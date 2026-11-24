/** 读取页面实际使用的主题，兼容萌皮、Vector 手动选择和跟随系统。 */
export const isDarkTheme = (): boolean => {
  const root = document.documentElement;
  return root.getAttribute('color-mode') === 'dark'
    || root.classList.contains('dark')
    || root.classList.contains('skin-theme-clientpref-night')
    || (root.classList.contains('skin-theme-clientpref-os')
      && window.matchMedia('(prefers-color-scheme: dark)').matches);
};

/** 订阅页面主题及系统偏好的变化；返回的函数移除全部监听。 */
export const subscribeTheme = (onChange: () => void): (() => void) => {
  const observer = new MutationObserver(onChange);
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['class', 'color-mode'],
  });
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)');
  prefersDark.addEventListener('change', onChange);
  return () => {
    observer.disconnect();
    prefersDark.removeEventListener('change', onChange);
  };
};
