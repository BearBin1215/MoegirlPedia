## 清除缓存小工具

简化版的清除缓存小工具，去掉了时间显示和清除进程显示。同时对moeskin进行了样式适配，在窄屏和宽屏都会正常显示。

- 使用：在[common.js](https://zh.moegirl.org.cn/Special:MyPage/common.js)中加入

```JavaScript
mw.loader.load('https://cdn.jsdelivr.net/gh/BearBin1215/MoegirlPedia@master/gadgets/purgecache.js');
```

## 一键提醒投票

用于提醒维护人员参与提案和人事案投票。

- 使用：在[common.js](https://zh.moegirl.org.cn/Special:MyPage/common.js)中加入

```JavaScript
mw.loader.load('https://cdn.jsdelivr.net/gh/BearBin1215/MoegirlPedia@master/gadgets/voteRemind.js');
```