# AGENTS.md

本包为 [OOUI](https://www.mediawiki.org/wiki/OOUI) 的 React 实现，主要用于 MediaWiki 站点，可以省去写入 CSS。

开发过程中可能会要求对其原版，完整指引见 [docs/comparison-guide.md](./docs/comparison-guide.md)。

## 全局协作约定

- 接口规范、最佳实践等方面尚未完全敲定，开发过程中可能存在较多原有实现和React最佳实践冲突的地方，遇到时提出方案让用户选择
- 此部分代码目前仅实际用于父工程 MoegirlPedia 工程，没有实际发布 npm，暂不用考虑发布相关内容
- 本工程现阶段依附于父工程MoegirlPedia仓库，eslint等规则以父工程为准
- 修改存量组件时，如果父工程MoegirlPedia有使用修改到的组件，应指出并告知用户

## 项目结构

```
oojs-ui-react/
├─ src/                      # 组件库源码（发布物）
│  ├─ widgets/               #   控件（Button/Dropdown/NumberInput…）
│  ├─ layouts/               #   布局（PanelLayout/BookletLayout…）
│  ├─ dialogs/               #   弹窗（Dialog/MessageDialog/WindowManager）
│  ├─ Element.ts             #   基础元素类型（仅类型，无渲染组件）
│  ├─ utils.ts               #   共享工具（类名生成/ChangeHandler等）
│  └─ index.ts               #   导出面
├─ playground/              # 本地演示工程（Vite + react-router + antd，pnpm dev，端口8090）
│  ├─ components/ooui.ts    #   原版oojs-ui加载器与主题切换（对照页基础设施）
│  ├─ components/original.ts   #   原版控件容器hook与行输出器（对照页共享）
│  ├─ components/CompareLayout.tsx # 对照页骨架与左右对照区块（对照页共享）
│  ├─ pages/                #   对照页，命名 xxx-compare/
│  └─ routes.ts             #   对照页注册表（侧栏分组与懒加载路由）
└─ docs/                     # 开发文档
   ├─ components.md          #   组件使用示例与API
   ├─ comparison-guide.md    #   完整对照开发方法论
   ├─ browser-testing.md     #   本地浏览器自动化测试流程（agent-browser）
   └─ TODO.md                #   未实现/未对齐行为清单
```

## 核心约定

- **公共导出面（`src/index.ts`）只含消费者直接使用的组件与类型**：对齐原版类层级的中间件（`Widget`、各种`Option`、`MenuSelect` 等）不从 index.ts 导出，仅供组件内部经相对路径引用；目录结构按原版类层级组织（便于对照开发）。`Select`/`TabSelect`/`OutlineSelect` 有独立使用场景，保留导出。`utils` 仅导出类型，`generateWidgetClassName` 为内部函数。新增组件时先判断它是消费者 API 还是内部实现，“对齐原版”针对的是行为契约（交互/a11y/类名），而非导出面镜像。
- **复杂组件开发必须与本地原版 `oojs-ui` 做行为对照**（源码比对 + 对照页实测），流程、加载机制、踩坑经验、验收清单详见 [docs/comparison-guide.md](./docs/comparison-guide.md)。
- 改动过程中，若有新的通用规则，应当记入docs/comparison-guide.md。
- playground只保留对照页（不做单组件示例页），对照页放 `playground/pages/xxx-compare/` 并在 `playground/routes.ts` 注册；原版库通过 `playground/components/ooui.ts` 的 `ensureOOUI()` 加载（不要自行打包引入原版库，勿把原版 dist 文件拷入仓库）。原版侧控件统一经 `playground/components/original.ts` 的 `useOriginalWidgets` 创建，两侧内容置于 `CompareColumns` 区块内。
- 本组件库使用场景往往对于产物体积较为敏感，对于实现成本高、价值过低的功能和用户确认后可以先不实现。
- 未对齐的行为须记入 `docs/TODO.md`，按性质分为**舍弃**（有意不做）、**增强**（有意多做，原版没有的能力）与**暂不实现**（原版有但当前未实现）三部分记录。

## 代码规范

- 除非用户要求，否则不遵循最小修改原则，能达成局部最优、减少技术债就积极重构，避免同一部分反复打补丁。
- 允许破坏性重构：重命名、移动、拆分、合并、删除旧代码、修改接口、更新所有调用点。
- 每个函数都应有对应的jsdoc注释；复杂逻辑需要描述逻辑，优先放在具体语句附近而非函数顶部，顶部只放功能概述。
- 会反复多次使用的变量，通用组件、Store 接口的每个属性都应有对应的jsdoc注释。
- 代码修改后，不要注释说明这里曾经是什么样，只说明最新代码（除非要提醒开发者不要使用废弃方案）。
- 修复问题不要修一段注释一段，结合前后文综合考虑注释。

## 设计规则

因原版oojs-ui和常见React组件库的设计哲学、命名习惯有较大出入，本工程遵循如下规则：

- **在复刻原版组件时，如果有和React最佳实践冲突的地方，不要直接实现，告知用户确认**。
- 原版通过多个set控制组件状态，以`setDisabled`为例，本工程使用React标准的`disabled`属性控制状态。
- 原版ooui使用`classes`参数传入字符串数组，本工程采用React标准的`className`属性。
- 原版组件的元素插槽使用`$<slot>`命名，如`$head`，本工程实现时不带`$`前缀。
- 多层组件场景，原版ooui将子组件作为父组件的参数传入，如`DropdownWidget`组件将多个`MenuOptionWidget`实例作为参数传入；本工程采取React标准常见的通过props传入声明式props数组方案。

## 代码审查和修复

- 修复代码审查到的问题后，除非仅修改注释等不实际产生影响的内容，若工具支持内置浏览器测试，应当测试无误。
- 审查注释时需要检查是否有无意义注释，例如一开始选择A方案、后来改用B方案，可能残留“不使用A方案是因为XXXX”此类冗余。
- 需要审查变量、接口、参数命名是否对齐原版或符合React最佳实践。
- 修改涉及存量组件时，应检查父工程MoegirlPedia是否有使用修改到的组件。
- 全量代码审查时，应当额外检查是否有实现理念不一致的代码，包括但不限于受控和非受控行为不一致、参数命名混乱、不同组件的代码文件划分原则不同等。
