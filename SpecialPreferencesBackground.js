// ==UserScript==
// @name         参数设置页背景
// @namespace    http://tampermonkey.net/
// @version      1.1
// @description  在“参数设置”页面添加背景图片
// @author       BearBin
// @match        *.moegirl.org.cn/Special:%E5%8F%82%E6%95%B0%E8%AE%BE%E7%BD%AE
// @icon         https://www.google.com/s2/favicons?sz=64&domain=moegirl.org.cn
// @grant        none
// @require      https://code.jquery.com/jquery-3.6.3.min.js
// ==/UserScript==

var vectorBody = document.getElementsByClassName('skin-vector')[0];
var vectorBgDiv = document.createElement('div');
vectorBgDiv.classList.add('special-preferences-bg');
vectorBody.appendChild(vectorBgDiv);