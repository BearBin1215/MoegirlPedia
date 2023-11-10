(()=>{"use strict";function t(e){return t="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(t){return typeof t}:function(t){return t&&"function"==typeof Symbol&&t.constructor===Symbol&&t!==Symbol.prototype?"symbol":typeof t},t(e)}function e(){/*! regenerator-runtime -- Copyright (c) 2014-present, Facebook, Inc. -- license (MIT): https://github.com/facebook/regenerator/blob/main/LICENSE */e=function(){return n};var r,n={},o=Object.prototype,i=o.hasOwnProperty,a=Object.defineProperty||function(t,e,r){t[e]=r.value},c="function"==typeof Symbol?Symbol:{},u=c.iterator||"@@iterator",l=c.asyncIterator||"@@asyncIterator",s=c.toStringTag||"@@toStringTag";function f(t,e,r){return Object.defineProperty(t,e,{value:r,enumerable:!0,configurable:!0,writable:!0}),t[e]}try{f({},"")}catch(r){f=function(t,e,r){return t[e]=r}}function h(t,e,r,n){var o=e&&e.prototype instanceof w?e:w,i=Object.create(o.prototype),c=new I(n||[]);return a(i,"_invoke",{value:O(t,r,c)}),i}function p(t,e,r){try{return{type:"normal",arg:t.call(e,r)}}catch(t){return{type:"throw",arg:t}}}n.wrap=h;var d="suspendedStart",m="suspendedYield",y="executing",v="completed",g={};function w(){}function b(){}function x(){}var k={};f(k,u,(function(){return this}));var E=Object.getPrototypeOf,L=E&&E(E(N([])));L&&L!==o&&i.call(L,u)&&(k=L);var $=x.prototype=w.prototype=Object.create(k);function A(t){["next","throw","return"].forEach((function(e){f(t,e,(function(t){return this._invoke(e,t)}))}))}function j(e,r){function n(o,a,c,u){var l=p(e[o],e,a);if("throw"!==l.type){var s=l.arg,f=s.value;return f&&"object"==t(f)&&i.call(f,"__await")?r.resolve(f.__await).then((function(t){n("next",t,c,u)}),(function(t){n("throw",t,c,u)})):r.resolve(f).then((function(t){s.value=t,c(s)}),(function(t){return n("throw",t,c,u)}))}u(l.arg)}var o;a(this,"_invoke",{value:function(t,e){function i(){return new r((function(r,o){n(t,e,r,o)}))}return o=o?o.then(i,i):i()}})}function O(t,e,n){var o=d;return function(i,a){if(o===y)throw new Error("Generator is already running");if(o===v){if("throw"===i)throw a;return{value:r,done:!0}}for(n.method=i,n.arg=a;;){var c=n.delegate;if(c){var u=_(c,n);if(u){if(u===g)continue;return u}}if("next"===n.method)n.sent=n._sent=n.arg;else if("throw"===n.method){if(o===d)throw o=v,n.arg;n.dispatchException(n.arg)}else"return"===n.method&&n.abrupt("return",n.arg);o=y;var l=p(t,e,n);if("normal"===l.type){if(o=n.done?v:m,l.arg===g)continue;return{value:l.arg,done:n.done}}"throw"===l.type&&(o=v,n.method="throw",n.arg=l.arg)}}}function _(t,e){var n=e.method,o=t.iterator[n];if(o===r)return e.delegate=null,"throw"===n&&t.iterator.return&&(e.method="return",e.arg=r,_(t,e),"throw"===e.method)||"return"!==n&&(e.method="throw",e.arg=new TypeError("The iterator does not provide a '"+n+"' method")),g;var i=p(o,t.iterator,e.arg);if("throw"===i.type)return e.method="throw",e.arg=i.arg,e.delegate=null,g;var a=i.arg;return a?a.done?(e[t.resultName]=a.value,e.next=t.nextLoc,"return"!==e.method&&(e.method="next",e.arg=r),e.delegate=null,g):a:(e.method="throw",e.arg=new TypeError("iterator result is not an object"),e.delegate=null,g)}function S(t){var e={tryLoc:t[0]};1 in t&&(e.catchLoc=t[1]),2 in t&&(e.finallyLoc=t[2],e.afterLoc=t[3]),this.tryEntries.push(e)}function T(t){var e=t.completion||{};e.type="normal",delete e.arg,t.completion=e}function I(t){this.tryEntries=[{tryLoc:"root"}],t.forEach(S,this),this.reset(!0)}function N(e){if(e||""===e){var n=e[u];if(n)return n.call(e);if("function"==typeof e.next)return e;if(!isNaN(e.length)){var o=-1,a=function t(){for(;++o<e.length;)if(i.call(e,o))return t.value=e[o],t.done=!1,t;return t.value=r,t.done=!0,t};return a.next=a}}throw new TypeError(t(e)+" is not iterable")}return b.prototype=x,a($,"constructor",{value:x,configurable:!0}),a(x,"constructor",{value:b,configurable:!0}),b.displayName=f(x,s,"GeneratorFunction"),n.isGeneratorFunction=function(t){var e="function"==typeof t&&t.constructor;return!!e&&(e===b||"GeneratorFunction"===(e.displayName||e.name))},n.mark=function(t){return Object.setPrototypeOf?Object.setPrototypeOf(t,x):(t.__proto__=x,f(t,s,"GeneratorFunction")),t.prototype=Object.create($),t},n.awrap=function(t){return{__await:t}},A(j.prototype),f(j.prototype,l,(function(){return this})),n.AsyncIterator=j,n.async=function(t,e,r,o,i){void 0===i&&(i=Promise);var a=new j(h(t,e,r,o),i);return n.isGeneratorFunction(e)?a:a.next().then((function(t){return t.done?t.value:a.next()}))},A($),f($,s,"Generator"),f($,u,(function(){return this})),f($,"toString",(function(){return"[object Generator]"})),n.keys=function(t){var e=Object(t),r=[];for(var n in e)r.push(n);return r.reverse(),function t(){for(;r.length;){var n=r.pop();if(n in e)return t.value=n,t.done=!1,t}return t.done=!0,t}},n.values=N,I.prototype={constructor:I,reset:function(t){if(this.prev=0,this.next=0,this.sent=this._sent=r,this.done=!1,this.delegate=null,this.method="next",this.arg=r,this.tryEntries.forEach(T),!t)for(var e in this)"t"===e.charAt(0)&&i.call(this,e)&&!isNaN(+e.slice(1))&&(this[e]=r)},stop:function(){this.done=!0;var t=this.tryEntries[0].completion;if("throw"===t.type)throw t.arg;return this.rval},dispatchException:function(t){if(this.done)throw t;var e=this;function n(n,o){return c.type="throw",c.arg=t,e.next=n,o&&(e.method="next",e.arg=r),!!o}for(var o=this.tryEntries.length-1;o>=0;--o){var a=this.tryEntries[o],c=a.completion;if("root"===a.tryLoc)return n("end");if(a.tryLoc<=this.prev){var u=i.call(a,"catchLoc"),l=i.call(a,"finallyLoc");if(u&&l){if(this.prev<a.catchLoc)return n(a.catchLoc,!0);if(this.prev<a.finallyLoc)return n(a.finallyLoc)}else if(u){if(this.prev<a.catchLoc)return n(a.catchLoc,!0)}else{if(!l)throw new Error("try statement without catch or finally");if(this.prev<a.finallyLoc)return n(a.finallyLoc)}}}},abrupt:function(t,e){for(var r=this.tryEntries.length-1;r>=0;--r){var n=this.tryEntries[r];if(n.tryLoc<=this.prev&&i.call(n,"finallyLoc")&&this.prev<n.finallyLoc){var o=n;break}}o&&("break"===t||"continue"===t)&&o.tryLoc<=e&&e<=o.finallyLoc&&(o=null);var a=o?o.completion:{};return a.type=t,a.arg=e,o?(this.method="next",this.next=o.finallyLoc,g):this.complete(a)},complete:function(t,e){if("throw"===t.type)throw t.arg;return"break"===t.type||"continue"===t.type?this.next=t.arg:"return"===t.type?(this.rval=this.arg=t.arg,this.method="return",this.next="end"):"normal"===t.type&&e&&(this.next=e),g},finish:function(t){for(var e=this.tryEntries.length-1;e>=0;--e){var r=this.tryEntries[e];if(r.finallyLoc===t)return this.complete(r.completion,r.afterLoc),T(r),g}},catch:function(t){for(var e=this.tryEntries.length-1;e>=0;--e){var r=this.tryEntries[e];if(r.tryLoc===t){var n=r.completion;if("throw"===n.type){var o=n.arg;T(r)}return o}}throw new Error("illegal catch attempt")},delegateYield:function(t,e,n){return this.delegate={iterator:N(t),resultName:e,nextLoc:n},"next"===this.method&&(this.arg=r),g}},n}function r(t){return function(t){if(Array.isArray(t))return i(t)}(t)||function(t){if("undefined"!=typeof Symbol&&null!=t[Symbol.iterator]||null!=t["@@iterator"])return Array.from(t)}(t)||o(t)||function(){throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.")}()}function n(t,e){var r="undefined"!=typeof Symbol&&t[Symbol.iterator]||t["@@iterator"];if(!r){if(Array.isArray(t)||(r=o(t))||e&&t&&"number"==typeof t.length){r&&(t=r);var n=0,i=function(){};return{s:i,n:function(){return n>=t.length?{done:!0}:{done:!1,value:t[n++]}},e:function(t){throw t},f:i}}throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.")}var a,c=!0,u=!1;return{s:function(){r=r.call(t)},n:function(){var t=r.next();return c=t.done,t},e:function(t){u=!0,a=t},f:function(){try{c||null==r.return||r.return()}finally{if(u)throw a}}}}function o(t,e){if(t){if("string"==typeof t)return i(t,e);var r=Object.prototype.toString.call(t).slice(8,-1);return"Object"===r&&t.constructor&&(r=t.constructor.name),"Map"===r||"Set"===r?Array.from(t):"Arguments"===r||/^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(r)?i(t,e):void 0}}function i(t,e){(null==e||e>t.length)&&(e=t.length);for(var r=0,n=new Array(e);r<e;r++)n[r]=t[r];return n}function a(t,e,r,n,o,i,a){try{var c=t[i](a),u=c.value}catch(t){return void r(t)}c.done?e(u):Promise.resolve(u).then(n,o)}function c(t){return function(){var e=this,r=arguments;return new Promise((function(n,o){var i=t.apply(e,r);function c(t){a(i,n,o,c,u,"next",t)}function u(t){a(i,n,o,c,u,"throw",t)}c(void 0)}))}}$((function(){return c(e().mark((function t(){var o,i,a,u,l,s,f,h,p,d,m,y;return e().wrap((function(t){for(;;)switch(t.prev=t.next){case 0:if(6!==mw.config.get("wgNamespaceNumber")){t.next=25;break}return t.next=3,mw.loader.using(["mediawiki.api","mediawiki.ForeignApi","mediawiki.notification","oojs-ui"]);case 3:o=new mw.Api,i=new mw.ForeignApi("https://mobile.moegirl.org.cn/api.php",{anonymous:!0}),a=mw.config.get("wgTitle"),u=mw.config.get("wgPageName"),l=[],mw.config.get("wgIsRedirect")?$(".redirectMsg").after('<hr/><div id="funl-note">请注意：对过短的文件名使用本工具可能会出现误判，建议手动检查。</div>'):$("#filelinks").after('<div id="funl-note">请注意：对过短的文件名使用本工具可能会出现误判，建议手动检查。</div>'),s=new OO.ui.ButtonWidget({label:"查询非链入使用",flags:"progressive",icon:"search",id:"search-submit-button"}),$("#funl-note").after(s.$element),f=new OO.ui.ButtonWidget({label:"标记非链入使用",flags:"progressive",icon:"tag",id:"add-mark-button"}),s.$element.after(f.$element),h=new OO.ui.ButtonWidget({label:"移除非链入标记",flags:"progressive",icon:"tag",id:"remove-mark-button"}),f.$element.after(h.$element),f.$element.hide(),h.$element.hide(),h.$element.after('<div id="search-result" style="margin:.6em 0"><div id="result-overview"></div><ul id="result-list"></ul></div><hr/>'),p=function(){var t,e=[],r=n($(".mw-gu-onwiki-zh_moegirl_org_cn").find("a"));try{for(r.s();!(t=r.n()).done;){var o=t.value;e.push(o.text)}}catch(t){r.e(t)}finally{r.f()}return e},d=function(){var t=c(e().mark((function t(){var o,c,u,l,s,f,h,d;return e().wrap((function(t){for(;;)switch(t.prev=t.next){case 0:return t.next=2,i.get({action:"query",list:"search",srnamespace:"0|4|10|12|14|274|828",srwhat:"text",srsearch:'insource:"'.concat(a.replaceAll('"'," "),'"')});case 2:return o=t.sent,t.next=5,i.get({action:"query",list:"search",srnamespace:"0|4|10|12|14|274|828",srwhat:"text",srsearch:'insource:"'.concat(encodeURI(a).replaceAll('"'," ").replaceAll("%20"," "),'"')});case 5:if(c=t.sent,u=[],[].concat(r(c.query.search),r(o.query.search)).forEach((function(t){var e=t.snippet.replaceAll("_"," ").replaceAll('<span class="searchmatch">',"").replaceAll("</span>","");(e.includes(a.replaceAll("_"," "))||e.includes(encodeURI(a.replaceAll("_"," ")))||e.includes(encodeURI(a.replaceAll("_"," ")).replaceAll("%20"," ")))&&u.push(t.title)})),l=new Set(r(p())),0!==(s=u.filter((function(t){return!l.has(t)}))).length){t.next=13;break}return $("#result-overview").text("zh站没有查找到非链入使用此文件的页面。"),t.abrupt("return",[]);case 13:$("#result-overview").text("文件在以下页面以非内链形式使用："),s=r(new Set(s)),f=n(s);try{for(f.s();!(h=f.n()).done;)d=h.value,$("#result-list").append('<li><a href="https://zh.moegirl.org.cn/'.concat(d,'">zhmoe:').concat(d,"</a></li>"))}catch(t){f.e(t)}finally{f.f()}return $("#search-submit-button a").removeClass("oo-ui-pendingElement-pending"),t.abrupt("return",s);case 19:case"end":return t.stop()}}),t)})));return function(){return t.apply(this,arguments)}}(),m=function(){var t=c(e().mark((function t(){var r;return e().wrap((function(t){for(;;)switch(t.prev=t.next){case 0:return mw.notify("正在标记……"),$("#add-mark-button a").addClass("oo-ui-pendingElement-pending"),r="[[zhmoe:".concat(l.join("]]、[[zhmoe:"),"]]"),t.prev=3,t.next=6,o.postWithToken("csrf",{format:"json",action:"edit",watchlist:"nochange",tags:"Automation tool",minor:!0,title:u,appendtext:"{{非链入使用|".concat(r,"}}"),summary:"标记非链入使用的文件"}).done((function(){mw.notify("标记成功！将在2秒后刷新……"),$("#add-mark-button a").removeClass("oo-ui-pendingElement-pending"),setTimeout((function(){window.location.reload()}),2e3)}));case 6:t.next=11;break;case 8:t.prev=8,t.t0=t.catch(3),mw.notify("标记失败：".concat(t.t0),"error");case 11:case"end":return t.stop()}}),t,null,[[3,8]])})));return function(){return t.apply(this,arguments)}}(),y=function(){var t=c(e().mark((function t(){var r,n;return e().wrap((function(t){for(;;)switch(t.prev=t.next){case 0:return mw.notify("正在移除标记……"),$("#remove-mark-button a").addClass("oo-ui-pendingElement-pending"),t.prev=2,t.next=5,o.get({action:"parse",format:"json",page:u,prop:"wikitext"});case 5:return r=(r=t.sent).parse.wikitext["*"],n=r.replace(/\{\{非链入使用\|[^{}]*\}\}/g,""),t.next=10,o.postWithToken("csrf",{format:"json",action:"edit",watchlist:"nochange",tags:"Automation tool",minor:!0,nocreate:!0,title:u,text:n,summary:"移除非链入使用标记"}).done((function(){mw.notify("移除成功！将在2秒后刷新……"),$("#remove-mark-button a").removeClass("oo-ui-pendingElement-pending"),setTimeout((function(){window.location.reload()}),2e3)}));case 10:t.next=15;break;case 12:t.prev=12,t.t0=t.catch(2),mw.notify("移除失败：".concat(t.t0),"error");case 15:case"end":return t.stop()}}),t,null,[[2,12]])})));return function(){return t.apply(this,arguments)}}(),s.on("click",c(e().mark((function t(){return e().wrap((function(t){for(;;)switch(t.prev=t.next){case 0:return mw.notify("正在查询……"),$("#search-submit-button a").addClass("oo-ui-pendingElement-pending"),t.next=4,d();case 4:(l=t.sent).length>0&&0===$(".used-not-linked").length?f.$element.show():0===l.length&&$(".used-not-linked").length>0&&h.$element.show(),mw.notify("查询完毕"),$("#search-submit-button a").removeClass("oo-ui-pendingElement-pending");case 8:case"end":return t.stop()}}),t)})))),f.on("click",(function(){m()})),h.on("click",(function(){y()}));case 25:case"end":return t.stop()}}),t)})))()}))})();