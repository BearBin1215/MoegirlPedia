# BearBin的萌娘百科工具代码

本GitHub库主要存放[BearBin](https://zh.moegirl.org.cn/User:BearBin)所写的一些小工具。

## 清除缓存小工具

改自[MedaiWiki:Gadget-purgecahce.js](https://github.com/MoegirlPediaInterfaceAdmins/MoegirlPediaInterfaceCodes/blob/master/src/gadgets/Purgecache/MediaWiki%3AGadget-Purgecache.js)。

- 简化版的清除缓存小工具，去掉了时间显示和清除进程显示。同时对moeskin进行了样式适配，在窄屏和宽屏都会正常显示。

使用：在[common.js](https://zh.moegirl.org.cn/Special:MyPage/common.js)中加入

```JavaScript
mw.loader.load('https://cdn.jsdelivr.net/gh/BearBin1215/MoegirlPedia@master/gadgets/purgecache.js');
```

## 一键提醒投票

- 用于提醒相关用户组内的用户参与提案和人事案投票。
- 若用户拥有[机器用户](https://zh.moegirl.org.cn/萌娘百科:机器用户)，使用此工具发送的消息都会被标记为机器人编辑，不会在最近更改出现。

使用：在[common.js](https://zh.moegirl.org.cn/Special:MyPage/common.js)中加入

```JavaScript
mw.loader.load('https://cdn.jsdelivr.net/gh/BearBin1215/MoegirlPedia@master/gadgets/voteRemind.js');
```

## 批量发送讨论页提醒

- 可用于发星章等用途。
- 若用户拥有[机器用户](https://zh.moegirl.org.cn/萌娘百科:机器用户)，使用此工具发送的消息都会被标记为机器人编辑，不会在最近更改出现。

使用：在[common.js](https://zh.moegirl.org.cn/Special:MyPage/common.js)中加入

```JavaScript
mw.loader.load('https://cdn.jsdelivr.net/gh/BearBin1215/MoegirlPedia@master/gadgets/MassSend.js');
```