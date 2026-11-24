/** 站点变量、Codex 1.14 浅色兜底、深色兜底；null 表示小工具专用配色。 */
const colors: Record<string, readonly [string | null, string, string]> = {
  'color-base': ['color-base', '#202122', '#eaecf0'],
  'color-subtle': ['color-subtle', '#54595d', '#a2a9b1'],
  'color-progressive': ['color-progressive', '#36c', '#88a3e8'],
  'color-success': ['color-success', '#177860', '#2cb491'],
  // Codex 的 warning 仅用于图标；日志文字继续使用已检查对比度的配色。
  'color-warning': [null, '#886000', '#f0c75e'],
  'color-error': ['color-error', '#d73333', '#fd7865'],
  'color-purple': [null, '#7050a0', '#c0a0f0'],
  'color-brown': [null, '#805030', '#d6a580'],
  'background-base': ['background-color-base', '#fff', '#101418'],
  'background-subtle': ['background-color-neutral-subtle', '#f8f9fa', '#202122'],
  'background-neutral': ['background-color-neutral', '#eaecf0', '#27292d'],
  'background-hover': ['background-color-interactive-subtle--hover', '#dadde3', '#404244'],
  'background-active': ['background-color-interactive-subtle--active', '#c8ccd1', '#54595d'],
  'background-success': ['background-color-success-subtle', '#dff2eb', '#153d31'],
  'background-warning': ['background-color-warning-subtle', '#fdf2d5', '#453217'],
  'background-error': ['background-color-error-subtle', '#ffe9e5', '#612419'],
  'border-base': ['border-color-base', '#a2a9b1', '#72777d'],
  'border-subtle': ['border-color-subtle', '#c8ccd1', '#54595d'],
  'border-success': ['border-color-success', '#196551', '#2cb491'],
  'border-warning': ['border-color-warning', '#987027', '#fecc44'],
  'border-error': ['border-color-error', '#9f3526', '#fc493b'],
  shadow: [null, '0 2px 6px rgb(0 0 0 / 20%)', '0 2px 6px rgb(0 0 0 / 55%)'],
};

/** 从共用颜色表生成某一主题的变量声明，避免重复维护别名与兜底值。 */
const declarations = (dark: boolean): string => Object.entries(colors).map(([name, [token, light, night]]) => {
  const fallback = dark ? night : light;
  return `--bb-${name}:${token ? `var(--${token},${fallback})` : fallback};`;
}).join('');

// 工具可分别加载，公共颜色只需注入一次；变量定义在 html 上，弹窗也能继承。
if (!document.getElementById('bearbintools-theme-style')) {
  const dark = declarations(true);
  const styles = `html{${declarations(false)}}
html.skin-theme-clientpref-night,html[color-mode="dark"],html.dark{${dark}}
@media screen and (prefers-color-scheme:dark){html.skin-theme-clientpref-os{${dark}}}`;
  const style = mw.loader.addStyleTag(styles);
  style.id = 'bearbintools-theme-style';
}
