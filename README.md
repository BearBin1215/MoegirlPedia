# BearBin的萌娘百科工具代码

本GitHub库主要存放[BearBin](https://zh.moegirl.org.cn/User:BearBin)所写的一些小工具。

如果在大陆地区无法正常加载，请将链接内的`cdn`更换为`fastly`，或直接引用萌百站内的用户页js。

## 一键提醒投票

- 用于提醒相关用户组内的用户参与提案和人事案投票。
- 若用户拥有[机器用户](https://zh.moegirl.org.cn/萌娘百科:机器用户)，使用此工具发送的消息都会被标记为机器人编辑，不会在最近更改出现。

使用：在[common.js](https://zh.moegirl.org.cn/Special:MyPage/common.js)中加入

```JavaScript
mw.loader.load("https://cdn.jsdelivr.net/gh/BearBin1215/MoegirlPedia@master/gadgets/voteRemind.min.js");
// 或 mw.loader.load("/index.php?title=User:BearBin/js/voteRemind.js&action=raw&ctype=text/javascript");
```

## 一键更新页面缓存

- 用于快速刷新链接至/嵌入了某个页面的所有页面。
- **在高链入/嵌入量页面使用将会向服务器发送大量请求，请慎重使用！**
- ~~被源初提着服务器账单找上门概不负责。~~
- 贡献者：[鬼影233](https://zh.moegirl.org.cn/User:鬼影233)

使用：在[common.js](https://zh.moegirl.org.cn/Special:MyPage/common.js)中加入

```JavaScript
mw.loader.load("https://cdn.jsdelivr.net/gh/BearBin1215/MoegirlPedia@master/gadgets/OneKeyPurge.min.js");
// 或 mw.loader.load("/index.php?title=User:BearBin/js/OneKeyPurge.js&action=raw&ctype=text/javascript");
```

## 清除缓存小工具

改自[MedaiWiki:Gadget-purgecahce.js](https://github.com/MoegirlPediaInterfaceAdmins/MoegirlPediaInterfaceCodes/blob/master/src/gadgets/Purgecache/MediaWiki%3AGadget-Purgecache.js)。

- 简化版的清除缓存小工具，去掉了时间显示和清除进程显示。同时对moeskin进行了样式适配，在窄屏和宽屏都会正常显示。

使用：在[common.js](https://zh.moegirl.org.cn/Special:MyPage/common.js)中加入

```JavaScript
mw.loader.load("https://cdn.jsdelivr.net/gh/BearBin1215/MoegirlPedia@master/gadgets/purgecache.min.js");
// 或 mw.loader.load("/index.php?title=User:BearBin/js/purgecache.js&action=raw&ctype=text/javascript");
```

## 批量发送讨论页提醒

- 可用于发星章等用途。
- 若用户拥有[机器用户](https://zh.moegirl.org.cn/萌娘百科:机器用户)，使用此工具发送的消息都会被标记为机器人编辑，不会在最近更改出现。

使用：在[common.js](https://zh.moegirl.org.cn/Special:MyPage/common.js)中加入

```JavaScript
mw.loader.load("https://cdn.jsdelivr.net/gh/BearBin1215/MoegirlPedia@master/gadgets/MassSend.min.js");
// 或 mw.loader.load("/index.php?title=User:BearBin/js/MassSend.js&action=raw&ctype=text/javascript");
```