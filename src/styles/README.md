# 小工具主题颜色

需要自定义颜色的小工具或共享组件先导入 `@/styles/theme`，再通过 `var(--bb-…)` 使用颜色。各工具仍独立打包，页面同时加载多个工具时只注入一份公共样式。

| 用途 | 变量 |
| --- | --- |
| 正文、次要文字 | `--bb-color-base`、`--bb-color-subtle` |
| 链接与焦点 | `--bb-color-progressive` |
| 状态文字 | `--bb-color-success`、`--bb-color-warning`、`--bb-color-error` |
| 基础、次要、选中背景 | `--bb-background-base`、`--bb-background-subtle`、`--bb-background-neutral` |
| 悬停、按下背景 | `--bb-background-hover`、`--bb-background-active` |
| 状态背景 | `--bb-background-success`、`--bb-background-warning`、`--bb-background-error` |
| 基础、次要边框 | `--bb-border-base`、`--bb-border-subtle` |
| 状态边框 | `--bb-border-success`、`--bb-border-warning`、`--bb-border-error` |
| 浮动面板阴影 | `--bb-shadow` |

`theme.ts` 用颜色表记录站点变量及浅色、深色兜底值，并生成主题规则。

颜色优先继承站点变量，基础、文字、状态和边框的兜底值采用 Codex 1.14 token。警告文字、用户状态的紫色和棕色、浮动面板阴影保留专用值；悬停与按下使用站点状态变量，并以 Codex 灰阶兜底。警告文字单独使用经过对比度检查的配色，因为 Codex 明确将 `--color-warning` 限定用于图标。

深色规则支持 Vector 的 `skin-theme-clientpref-night`、`skin-theme-clientpref-os` 配合系统偏好，以及萌皮的 `color-mode="dark"` 和 `dark` 类。普通 CSS 和内联样式中的变量会自动更新。需要向组件传入布尔值时，可使用 `@/utils/theme` 的 `isDarkTheme` 和 `subscribeTheme`；订阅结束后调用返回的清理函数。

自有单色内联 SVG 使用 `fill="currentColor"`，状态图标使用对应的语义颜色。OOUI、Codex 和其他站点自带控件沿用站点样式，无需在小工具中补主题或反色滤镜。图片导出应使用与导出文字一致的背景。

验证时分别检查萌皮浅色、深色和 Vector 的手动选择、跟随系统切换。Vector 的实际页面使用 `mzh.moegirl.org.cn`，并添加 `useskin=vector-2022` 参数。
