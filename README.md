# BearBin的萌娘百科工具

本GitHub库主要存放[BearBin](https://zh.moegirl.org.cn/User:BearBin)所写的一些小工具。

- [工具介绍](#工具介绍)
  - [一键更新页面缓存](#一键更新页面缓存)
  - [批量编辑](#批量编辑)
  - [高级搜索](#高级搜索)
  - [页面导出](#页面导出)
  - [共享站查询文件非链入使用](#共享站查询文件非链入使用)
  - [侧边栏优化](#侧边栏优化)
  - [歌词样式开关](#歌词样式开关)
  - [批量发送讨论页提醒](#批量发送讨论页提醒)
  - [批量移动页面](#批量移动页面)
  - [Excel表格生成wikitext](#excel表格生成wikitext)
  - [Wikiplus快速摘要](#wikiplus快速摘要)
  - [新条目分类统计](#新条目分类统计)
  - [一键提醒投票](#一键提醒投票)

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

### 批量编辑

- 将[Special:MassEdit](https://zh.moegirl.org.cn/Special:MassEdit)页面改为批量编辑页面，可以输入页面列表或分类列表，按照指定的规则对页面进行批量替换。

使用：在[common.js](https://zh.moegirl.org.cn/Special:MyPage/common.js)中加入

```JavaScript
mw.loader.load("https://cdn.jsdelivr.net/gh/BearBin1215/MoegirlPedia@master/dist/gadgets/MassEdit.min.js");
// 或 mw.loader.load("https://mzh.moegirl.org.cn/index.php?title=User:BearBin/js/MassEdit.js&action=raw&ctype=text/javascript");
```

### 高级搜索

- 在[搜索页面](https://zh.moegirl.org.cn/Special:Search)提供高级搜索按钮，可以在面板中可视化地选择要使用的搜索代码。

![高级搜索演示](/img/AdvancedSearch.gif)

使用：在[common.js](https://zh.moegirl.org.cn/Special:MyPage/common.js)中加入

```JavaScript
mw.loader.load("https://cdn.jsdelivr.net/gh/BearBin1215/MoegirlPedia@master/dist/gadgets/AdvancedSearch.min.js");
```


### 页面导出

- 从萌娘百科导出指定的页面，将页面及其历史导出为可以在其他MediaWiki站点直接导入的XML文件。在个人js页添加后，前往[Special:ExportXML](https://zh.moegirl.org.cn/Special:ExportXML)或[Special:Export](https://zh.moegirl.org.cn/Special:Export)执行导出操作。
- 支持从分类获取页面。
- 目前支持导出历史，暂不支持递归导出模板。
- 由于缺少测试，导出的历史有被删除版本时可能和标准导出功能有一点偏差，欢迎反馈。

使用：在[common.js](https://zh.moegirl.org.cn/Special:MyPage/common.js)中加入

```JavaScript
mw.loader.load("https://cdn.jsdelivr.net/gh/BearBin1215/MoegirlPedia@master/dist/gadgets/ExportXML.min.js");
// 或 mw.loader.load("https://mzh.moegirl.org.cn/index.php?title=User:BearBin/js/ExportXML.js&action=raw&ctype=text/javascript");
```

### 共享站查询文件非链入使用

- 一键查询共享站的非链入使用，避免文件被误判为无使用。

使用：在[共享站的common.js](https://commons.moegirl.org.cn/Special:MyPage/common.js)中加入

```JavaScript
mw.loader.load("https://cdn.jsdelivr.net/gh/BearBin1215/MoegirlPedia@master/dist/gadgets/FileUsedNotLinked.min.js");
// 或 mw.loader.load("https://mzh.moegirl.org.cn/index.php?title=User:BearBin/js/FileUsedNotLinked.js&action=raw&ctype=text/javascript");
```

### 侧边栏优化

- 给vector和moeskin的侧边栏区域各自加一个折叠按钮，折叠对应的内容。

![侧边栏优化演示](/img/SidebarEnhance.gif)

使用：在[common.js](https://zh.moegirl.org.cn/Special:MyPage/common.js)中加入

```JavaScript
mw.loader.load("https://cdn.jsdelivr.net/gh/BearBin1215/MoegirlPedia@master/dist/gadgets/SidebarEnhance.min.js");
// 或 mw.loader.load("/index.php?title=User:BearBin/js/SidebarEnhance.js&action=raw&ctype=text/javascript");
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
