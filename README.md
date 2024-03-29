# BearBin的萌娘百科工具

本GitHub库主要存放[BearBin](https://zh.moegirl.org.cn/User:BearBin)所写的一些小工具。

- [工具介绍](#工具介绍)
  - [一键更新页面缓存](#一键更新页面缓存)
  - [共享站查询文件非链入使用](#共享站查询文件非链入使用)
  - [批量编辑](#批量编辑)
  - [歌词样式开关](#歌词样式开关)
  - [批量发送讨论页提醒](#批量发送讨论页提醒)
  - [批量移动页面](#批量移动页面)
  - [Excel表格生成wikitext](#excel表格生成wikitext)
  - [Wikiplus快速摘要](#wikiplus快速摘要)
  - [新条目分类统计](#新条目分类统计)
  - [一键提醒投票](#一键提醒投票)
- [文件结构](#文件结构)
- [参与完善](#参与完善)
  - [指令](#指令)

## 工具介绍

如果在大陆地区无法正常加载，请将链接内的`cdn`更换为`fastly`，或直接引用萌百站内的用户页js（下方使用方式中的注释行）。

### 一键更新页面缓存

- 用于快速刷新链接至/嵌入了某个页面的所有页面。
- 在高链入/嵌入量页面使用将会向服务器发送大量请求，请慎重使用！~~被源初提着服务器账单找上门概不负责。~~
- 贡献者：[鬼影233](https://zh.moegirl.org.cn/User:鬼影233)

使用：在[common.js](https://zh.moegirl.org.cn/Special:MyPage/common.js)中加入

```JavaScript
mw.loader.load("https://cdn.jsdelivr.net/gh/BearBin1215/MoegirlPedia@master/dist/gadgets/OneKeyPurge.min.js");
// 或 mw.loader.load("/index.php?title=User:BearBin/js/OneKeyPurge.js&action=raw&ctype=text/javascript");
```

### 共享站查询文件非链入使用

- 一键查询共享站的非链入使用，避免文件被误判为无使用。

使用：在[共享站的common.js](https://commons.moegirl.org.cn/Special:MyPage/common.js)中加入

```JavaScript
mw.loader.load("https://cdn.jsdelivr.net/gh/BearBin1215/MoegirlPedia@master/dist/gadgets/FileUsedNotLinked.min.js");
// 或 mw.loader.load("https://mzh.moegirl.org.cn/index.php?title=User:BearBin/js/FileUsedNotLinked.js&action=raw&ctype=text/javascript");
```

### 批量编辑

- 将[Special:MassEdit](https://zh.moegirl.org.cn/Special:MassEdit)页面改为批量编辑页面，可以输入页面列表或分类列表，按照指定的规则对页面进行批量替换。

使用：在[common.js](https://zh.moegirl.org.cn/Special:MyPage/common.js)中加入

```JavaScript
mw.loader.load("https://cdn.jsdelivr.net/gh/BearBin1215/MoegirlPedia@master/dist/gadgets/MassEdit.min.js");
// 或 mw.loader.load("https://mzh.moegirl.org.cn/index.php?title=User:BearBin/js/MassEdit.js&action=raw&ctype=text/javascript");
```

### 歌词样式开关

- 用于在嵌入了{{[LyricsKai](https://zh.moegirl.org.cn/Template:LyricsKai)}}或其衍生模板的页面添加一个按钮，可以自由清除或恢复歌词的样式。

![歌词样式开关演示](/img/LyricStyleToggle.gif)

使用：在[common.js](https://zh.moegirl.org.cn/Special:MyPage/common.js)中加入

```JavaScript
mw.loader.load("https://cdn.jsdelivr.net/gh/BearBin1215/MoegirlPedia@master/dist/gadgets/LyricStyleToggle.min.js");
// 或 mw.loader.load("/index.php?title=User:BearBin/js/LyricStyleToggle.js&action=raw&ctype=text/javascript");
```

### 批量发送讨论页提醒

- 可用于发星章等用途。
- 若用户拥有[机器用户](https://zh.moegirl.org.cn/萌娘百科:机器用户)，使用此工具发送的消息都会被标记为机器人编辑，不会在最近更改出现。

使用：在[common.js](https://zh.moegirl.org.cn/Special:MyPage/common.js)中加入

```JavaScript
mw.loader.load("https://cdn.jsdelivr.net/gh/BearBin1215/MoegirlPedia@master/dist/gadgets/BatchSend.min.js");
// 或 mw.loader.load("/index.php?title=User:BearBin/js/BatchSend.js&action=raw&ctype=text/javascript");
```

### 批量移动页面

- 用以一次性移动大量页面，共享站理论上也能用。
- 可通过复制粘贴一次输入多个页面。

使用：在[common.js](https://zh.moegirl.org.cn/Special:MyPage/common.js)中加入

```JavaScript
mw.loader.load("https://cdn.jsdelivr.net/gh/BearBin1215/MoegirlPedia@master/dist/gadgets/BulkMove.min.js");
// 或 mw.loader.load("/index.php?title=User:BearBin/js/BulkMove.js&action=raw&ctype=text/javascript");
```

### Excel表格生成wikitext

- 可以直接从excel复制表格，生成对应的wikitable，并可以直接复制到剪贴板。
- 按钮添加在编辑工具栏的插入表格按钮右侧：![Excel表格生成wikitext按钮](/img/Excel2Wiki-button.jpg)。
- 不支持老旧浏览器（如IE）。

![Excel表格生成wikitext演示](/img/Excel2Wiki.gif)

使用：在[common.js](https://zh.moegirl.org.cn/Special:MyPage/common.js)中加入

```JavaScript
mw.loader.load("https://cdn.jsdelivr.net/gh/BearBin1215/MoegirlPedia@master/dist/gadgets/Excel2Wiki.min.js");
// 或 mw.loader.load("/index.php?title=User:BearBin/js/Excel2Wiki.js&action=raw&ctype=text/javascript");
```

### Wikiplus快速摘要

- 为[Wikiplus小工具](https://github.com/Wikiplus/Wikiplus)提供快速填充摘要的按钮。
- 编辑章节时支持在章节锚点后添加。

![Wikiplus快速摘要演示](/img/WikiplusSummary.gif)

```JavaScript
mw.loader.load("https://cdn.jsdelivr.net/gh/BearBin1215/MoegirlPedia@master/dist/gadgets/WikiplusSummary.min.js");
// 或 mw.loader.load("/index.php?title=User:BearBin/js/WikiplusSummary.js&action=raw&ctype=text/javascript");
```

### 新条目分类统计

- 在[Special:最新页面](https://zh.moegirl.org.cn/Special:最新页面)中添加面板，查询过去的新条目中属于某分类或其子分类的数量。
- 受服务器设置所限，最多统计过去90天的新条目。

使用：在[common.js](https://zh.moegirl.org.cn/Special:MyPage/common.js)中加入

```JavaScript
mw.loader.load("https://cdn.jsdelivr.net/gh/BearBin1215/MoegirlPedia@master/dist/gadgets/NewpagesCat.min.js");
// 或 mw.loader.load("/index.php?title=User:BearBin/js/NewpagesCat.js&action=raw&ctype=text/javascript");
```

### 一键提醒投票

- 用于提醒相关用户组内的用户参与提案和人事案投票。
- 若用户拥有[机器用户](https://zh.moegirl.org.cn/萌娘百科:机器用户)，使用此工具发送的消息都会被标记为机器人编辑，不会在最近更改出现。

使用：在[common.js](https://zh.moegirl.org.cn/Special:MyPage/common.js)中加入

```JavaScript
mw.loader.load("https://cdn.jsdelivr.net/gh/BearBin1215/MoegirlPedia@master/dist/gadgets/VoteRemind.min.js");
// 或 mw.loader.load("/index.php?title=User:BearBin/js/voteRemind.js&action=raw&ctype=text/javascript");
```

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

## 参与完善

非常欢迎各路萌百人参与本项目的完善。如果您不懂代码，可以[提出建议](https://github.com/BearBin1215/MoegirlPedia/issues)。如果您希望亲自参与完善，可以提出[Pull request](https://github.com/BearBin1215/MoegirlPedia/pulls)。

项目使用[pnpm](https://pnpm.io/)管理依赖，因此需在安装（node<18）或启用（node>=18）后通过`pnpm`指令安装依赖。

- 小工具源代码位于[src/gadgets/](/src/gadgets/)目录，使用js和ts编写都可以。通过webpack处理依赖。对于需要引用样式表的工具，使用[less](https://github.com/less/less.js)编写样式表，通过`import`语句在js或ts文件中调用。
- 样式表有两种导入方式：
  1. 使用`import './foo.less'`，这种情况下样式表经过webpack的处理会自动加载到`<head>`中。
  2. 使用`import styles from './foo.less' assert { type: 'string' }`，该情况下会将css文件的内容作为字符串导入，less则会在编译后作为字符串导入。
- 小代码于[src/oddments/](/src/oddments/)目录，并设定了专门的eslint规则使其仅适用es5语法。

### 指令

- 开发
  ```shell
  pnpm start
  ```
  开发模式下，所有gadgets都会自动打包输出至[dist/dev/](/dist/dev/)目录，文件发生变动会实时更新（<kbd>Ctrl</kbd>+<kbd>S</kbd>后自动打包）。
- 打包
  ```shell
  pnpm build <gadget names>
  ```
  `<gadget names>`为小工具名，可输入多个，例如`yarn build MassEdit BulkMove`会打包[src/gadgets/MassEdit](/src/gadgets/MassEdit/)和[src/gadgets/BulkMove](/src/gadgets/BulkMove/)，直接执行`yarn build`则打包全部小工具。
  输出文件位于[dist](/dist/)目录下。
