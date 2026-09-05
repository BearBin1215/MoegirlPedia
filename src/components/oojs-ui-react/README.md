<p align="center">
  <a href="https://react.dev" target="_blank" rel="noopener noreferrer"><img src="https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react&logoColor=black" alt="React" /></a>
  <a href="https://www.typescriptlang.org" target="_blank" rel="noopener noreferrer"><img src="https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" /></a>
</p>

[oojs-ui](https://github.com/wikimedia/oojs-ui)部分组件的React实现，施工中。

基本上都支持常见标准属性，如`id`、`className`、`ref`、`onClick`等。

主要用于生成oojs-ui的元素，api、使用逻辑可能有很大出入。

## 文档

- [组件使用示例与API](./docs/components.md)
- [对照开发方法论](./docs/comparison-guide.md)
- [未实现/未对齐行为清单](./TODO.md)

## 开发

```bash
pnpm dev        # 启动本地测试工程（端口8090，含各组件示例与原版对照页）
pnpm typecheck  # TypeScript类型检查
pnpm lint       # ESLint检查（复用父工程MoegirlPedia的eslint配置）
```
