### 清除缓存小工具

简化版的清除缓存小工具，去掉了时间显示和清除进程显示。同时对moeskin进行了样式适配，在窄屏和宽屏都会正常显示。

#### 使用方式

在[common.js](https://zh.moegirl.org.cn/Special:MyPage/common.js)中加入

```JavaScript
mw.loader.load('https://cdn.jsdelivr.net/gh/BearBin1215/MoegirlPedia@master/purgecache.js');
```

### 更换背景图片

#### 萌皮
在[common.css](https://zh.moegirl.org.cn/Special:MyPage/common.css)中加入

```CSS
@import url('//cdn.jsdelivr.net/gh/BearBin1215/MoegirlPedia@master/moeskin-bg.css');

:root {
	--custom-bg: url(您的自定义背景图片链接);
}
```

#### vector
在[vector.js](https://zh.moegirl.org.cn/Special:MyPage/vector.js)或[common.js](https://zh.moegirl.org.cn/Special:MyPage/common.js)中加入

```JavaScript
$('body.skin-vector').append('<div class="vector-custom-bg"></div>')
```

在[common.css](https://zh.moegirl.org.cn/Special:MyPage/common.css)中加入

```CSS
@import url('//cdn.jsdelivr.net/gh/BearBin1215/MoegirlPedia@master/vector-bg.css');

:root {
    --vector-custom-bg: url(您的自定义背景图片链接);
}
```

### 其他

* vector萌皮化：`https://cdn.jsdelivr.net/gh/BearBin1215/MoegirlPedia@master/moevector.css`

