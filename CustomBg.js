/**
 * 一站式自定义vector和moeskin的背景图片。
 * 添加到个人的common.js使用。
 */

// 在此处自定义两个皮肤共用的背景图片和背景位置（位置的数值可以参考[[Template:背景图片]]）
var globalBgImage = 'https://s2.loli.net/2023/01/30/HyXdc8zlqPuKD6Z.jpg';
var globalBgPos = 'center'

// 在此处自定义vector的背景图片和位置，会覆盖共用设置。
var vectorBgImage = globalBgImage;
var vectorBgPos = globalBgPos;

// 在此处自定义moeskin的背景图片和位置，会覆盖共用设置。
var moeskinBgImage = globalBgImage;
var moeskinBgPos = globalBgPos;

$('body.skin-vector').append('<div class="vector-custom-bg"></div>')

$('head').append('<style></style>')