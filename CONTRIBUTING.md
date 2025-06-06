# 参与完善

非常欢迎各路萌百人参与本项目的完善。如果您不懂代码，可以[提出建议](https://github.com/BearBin1215/MoegirlPedia/issues)。如果您希望亲自参与完善，可以提出[Pull request](https://github.com/BearBin1215/MoegirlPedia/pulls)。

## 开发准备

项目使用[pnpm](https://pnpm.io/)管理依赖，因此需在安装（node<18）或启用（node>=18）pnpm：

```shell
# node < 18
npm i -g pnpm

# node >= 18
corepack enable pnpm
```

然后安装依赖

```shell
pnpm i
```

- 小工具源代码位于[src/gadgets/](/src/gadgets/)目录，使用js、[ts](https://www.typescriptlang.org/)和[vue3](https://vuejs.org/)编写都可以，项目会通过webpack处理依赖并打包为单一的可执行js文件。对于需要引用样式表的工具，使用[less](https://github.com/less/less.js)编写样式表，通过`import`语句在js或ts文件中调用。
  - 使用React和Vue编写的简单实例分别参考[Example-React](/src/gadgets/Example-React)和[Example-Vue](/src/gadgets/Example-Vue)。
  - 项目使用[preact](https://preactjs.com/)的兼容层取代react以减小打包体积、优化性能，在实际编写中请自行查阅文档查看区别。
  - 如非技术限制，建议使用react而非vue编写，在使用preact后打包体积为22KB+，而使用vue编写后打包体积为58KB+，已经接近了萌娘百科提交超时界限。
    > - dist/gadgets/Example-React.min.js: 22.736KB (23282字节)
    > - dist/gadgets/Example-Vue.min.js: 63.229KB (64746字节)
  - 由于首先考虑支持react，本项目**不支持使用jsx编写vue**。如有需要，请使用[渲染函数](https://cn.vuejs.org/guide/extras/render-function.html)。
- 样式表有3种导入方式：
  - 使用`import './foo.less'`，样式表经过webpack的处理会在代码运行时自动加载到`<head>`中。
  - 使用`import styles from 'foo.module.less';`，样式表将作为[CSS Modules](https://github.com/css-modules/css-modules)导入。
  - 使用`import styles from './foo.less' assert { type: 'string' }`，该情况下会将样式表内容作为字符串导入，less则会在编译后作为字符串导入。
- 小代码于[src/oddments/](/src/oddments/)目录，并设定了专门的eslint规则使其仅适用es5语法。

## 开发流程

- 使用指令进入开发模式：
  ```shell
  pnpm start
  ```
  开发模式下，所有gadgets都会自动打包输出至[dist/dev/](/dist/dev/)目录，文件发生变动会实时更新（<kbd>Ctrl</kbd>+<kbd>S</kbd>后自动打包）。调试时打开萌百，从对应的实时输出js文件复制到控制台直接运行。
- 开发完毕，打包：
  ```shell
  pnpm build <gadget names>
  ```
  `<gadget names>`为小工具名，可输入多个，例如`pnpm build MassEdit BulkMove`会打包[src/gadgets/MassEdit](/src/gadgets/MassEdit/)和[src/gadgets/BulkMove](/src/gadgets/BulkMove/)，直接执行`pnpm build`则打包全部小工具。
  输出文件位于[dist](/dist/)目录下。
  ~~打包完毕并提交后，Github Action会自动读取dist下发生变动的文件，并将其提交到萌百。~~

## 文件结构

```
主要文件
│  .eslintrc.js  # eslint配置
│  .stylelintrc.js  #stylelint配置
│  package.json  # nodejs配置
│  tsconfig.json  # typescript配置
│  pnpm-lock.yaml  # lockfile
|
├─.github
│  └─workflows  # GitHub Actions配置
│          GadgetSynchronize.yml  # 自动同步dist至萌百
|
├─build  # 打包配置
|      pack.js  # 打包脚本
│      webpack.common.js  # webpack通用配置
│      webpack.dev.js  # 开发配置
|      webpack.prod.js  # 生产配置
|
├─dist  # 打包/编译输出
│  ├─gadgets
│  │      BatchSend.min.js
│  │      ...
│  |
│  └─oddments
│         CommentLink.js
│         ...
|
├─scripts  # CI脚本
|
└─src  # 源代码
    ├─components  # 用到的一些组件
    │  ├─Snake
    |  |
    |  └─Loger
    |
    ├─gadgets  # 工具源代码
    │  ├─BatchSend
    │  │      index.ts  # 脚本代码
    │  │      index.less  # 样式表（不一定有）
    │  |
    │  ├─BulkMove
    │  |
    │  ├─Excel2Wiki
    │  |
    │  └─...
    |
    └─oddments  # 小代码
            CommentLink.js
            EditFromOld.js
            ...
```
