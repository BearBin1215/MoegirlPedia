"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __values = (this && this.__values) || function(o) {
    var s = typeof Symbol === "function" && Symbol.iterator, m = s && o[s], i = 0;
    if (m) return m.call(o);
    if (o && typeof o.length === "number") return {
        next: function () {
            if (o && i >= o.length) o = void 0;
            return { value: o && o[i++], done: !o };
        }
    };
    throw new TypeError(s ? "Object is not iterable." : "Symbol.iterator is not defined.");
};
var __read = (this && this.__read) || function (o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    }
    catch (error) { e = { error: error }; }
    finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        }
        finally { if (e) throw e.error; }
    }
    return ar;
};
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
var _addText = '{{Documentation|content=本小工具用于快速清理嵌入/链入到某个页面的所有页面。\n\n使用方式：在[[Special:MyPage/common.js|个人js页]]添加如下代码\n<pre class="prettyprint lang-javascript" style="margin-top:0">mw.loader.load("/index.php?title=User:BearBin/js/OneKeyPurge.js&action=raw&ctype=text/javascript");</pre>\n如果您有好的建议，欢迎前往[[User_talk:BearBin|我的讨论页]]，或在GitHub上[https://github.com/BearBin1215/MoegirlPedia/issues 提交issue]。\n*作者：[[User:BearBin|BearBin]]、[[User:鬼影233|鬼影233]]}}';
"use strict";
$(function () { return (function () { return __awaiter(void 0, void 0, void 0, function () {
    var api_1, PAGENAME_1, $body_1, UserRights, Noratelimit_1, DEWindow, windowManager_1, DEDialog_1;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                if (!(mw.config.get("wgNamespaceNumber") !== -1)) return [3, 3];
                return [4, mw.loader.using(["mediawiki.api", "mediawiki.user", "mediawiki.notification", "oojs-ui"])];
            case 1:
                _a.sent();
                api_1 = new mw.Api();
                PAGENAME_1 = mw.config.get("wgPageName");
                $body_1 = $("body");
                return [4, mw.user.getRights()];
            case 2:
                UserRights = _a.sent();
                Noratelimit_1 = UserRights.includes("noratelimit");
                DEWindow = (function (_super) {
                    __extends(DEWindow, _super);
                    function DEWindow(config) {
                        var _this = _super.call(this, config) || this;
                        _this.failList = [];
                        _this.changeList = [];
                        _this.state = 0;
                        return _this;
                    }
                    DEWindow.prototype.initialize = function () {
                        _super.prototype.initialize.call(this);
                        this.panelLayout = new OO.ui.PanelLayout({
                            scrollable: false,
                            expanded: false,
                            padded: true,
                            id: "one-key-purge"
                        });
                        this.typeSelectInput = new OO.ui.CheckboxMultiselectInputWidget({
                            options: [
                                { data: "link", label: "链接" },
                                { data: "include", label: "嵌入" },
                            ]
                        });
                        var typeFiled = new OO.ui.FieldLayout(this.typeSelectInput, {
                            label: "页面类型"
                        });
                        var purgeOption = new OO.ui.RadioOptionWidget({ data: "purge", label: "清除缓存（Purge）" });
                        var nullEditOption = new OO.ui.RadioOptionWidget({ data: "nulledit", label: "零编辑（Null Edit）" });
                        this.optionRadioSelect = new OO.ui.RadioSelectWidget({
                            items: [
                                purgeOption,
                                nullEditOption,
                            ]
                        });
                        this.optionRadioSelect.selectItem(purgeOption);
                        var optionFiled = new OO.ui.FieldLayout(this.optionRadioSelect, {
                            label: "操作类型"
                        });
                        var noteText = Noratelimit_1 ?
                            "<b>警告</b>：在被大量嵌入/链入的页面此工具将会向服务器发送<b>大量请求</b>，请慎重使用！"
                            :
                                "<b>提醒</b>：您未持有<code>noratelimit</code>权限，清除缓存和零编辑的速率将被分别限制为<u>30次/min</u>和<u>10次/min</u>，请耐心等待。";
                        this.panelLayout.$element.append($("<div style=\"margin-bottom:.8em;font-size:1.143em;line-height:1.3\">".concat(noteText, "</div>")), typeFiled.$element, optionFiled.$element, $('<div style="margin:.8em 0 .5em;font-size:1.3em;text-align:center;text-decoration:underline">已完成<span id="okp-done">0</span>/<span id="okp-all">0</span>个页面</div>'), $('<div id="okp-progress" style="display:flex;flex-wrap:wrap;justify-content:center;max-height:10.5em;overflow-y:auto;"></div>'));
                        this.$body.append(this.panelLayout.$element);
                        $("#one-key-purge .oo-ui-fieldLayout-header").css("font-weight", "bold").css("width", "20%").css("min-width", "6em");
                        $("#one-key-purge .oo-ui-multiselectWidget-group, #one-key-purge .oo-ui-radioSelectWidget").css("display", "flex").css("flex-wrap", "wrap");
                        $("#one-key-purge .oo-ui-multiselectWidget-group>label, #one-key-purge .oo-ui-radioSelectWidget>label").css("flex", "1 0 11em").css("padding", "4px 0");
                    };
                    DEWindow.prototype.waitInterval = function (time) {
                        return new Promise(function (resolve) { return setTimeout(resolve, time); });
                    };
                    DEWindow.prototype.getIncludeList = function () {
                        return __awaiter(this, void 0, void 0, function () {
                            var ticontinue, pageList, includeList, _a, _b, item;
                            var e_1, _c;
                            return __generator(this, function (_d) {
                                switch (_d.label) {
                                    case 0:
                                        ticontinue = 1;
                                        pageList = [];
                                        _d.label = 1;
                                    case 1:
                                        if (!ticontinue) return [3, 3];
                                        return [4, api_1.get({
                                                action: "query",
                                                prop: "transcludedin",
                                                titles: PAGENAME_1,
                                                tilimit: "max",
                                                ticontinue: ticontinue
                                            })];
                                    case 2:
                                        includeList = _d.sent();
                                        if (Object.values(includeList.query.pages)[0].transcludedin) {
                                            try {
                                                for (_a = (e_1 = void 0, __values(Object.values(includeList.query.pages)[0].transcludedin)), _b = _a.next(); !_b.done; _b = _a.next()) {
                                                    item = _b.value;
                                                    console.log("\u67E5\u627E\u5230\u5D4C\u5165\u3010".concat(PAGENAME_1, "\u3011\u7684\u9875\u9762\uFF1A").concat(item.title));
                                                    pageList.push(item.title);
                                                }
                                            }
                                            catch (e_1_1) { e_1 = { error: e_1_1 }; }
                                            finally {
                                                try {
                                                    if (_b && !_b.done && (_c = _a["return"])) _c.call(_a);
                                                }
                                                finally { if (e_1) throw e_1.error; }
                                            }
                                        }
                                        ticontinue = includeList["continue"] ? includeList["continue"].ticontinue : false;
                                        return [3, 1];
                                    case 3:
                                        if (pageList.length > 0) {
                                            mw.notify("\u83B7\u53D6\u5D4C\u5165\u3010".concat(PAGENAME_1, "\u3011\u7684\u9875\u9762\u5217\u8868\u6210\u529F\u3002"));
                                        }
                                        else {
                                            mw.notify("\u6CA1\u6709\u9875\u9762\u5D4C\u5165\u4E86\u3010".concat(PAGENAME_1, "\u3011\u3002"));
                                        }
                                        return [2, pageList];
                                }
                            });
                        });
                    };
                    DEWindow.prototype.getLinkList = function () {
                        return __awaiter(this, void 0, void 0, function () {
                            var lhcontinue, pageList, linkList, _a, _b, item;
                            var e_2, _c;
                            return __generator(this, function (_d) {
                                switch (_d.label) {
                                    case 0:
                                        lhcontinue = 1;
                                        pageList = [];
                                        _d.label = 1;
                                    case 1:
                                        if (!lhcontinue) return [3, 3];
                                        return [4, api_1.get({
                                                action: "query",
                                                prop: "linkshere",
                                                titles: PAGENAME_1,
                                                lhlimit: "max",
                                                lhcontinue: lhcontinue
                                            })];
                                    case 2:
                                        linkList = _d.sent();
                                        if (Object.values(linkList.query.pages)[0].linkshere) {
                                            try {
                                                for (_a = (e_2 = void 0, __values(Object.values(linkList.query.pages)[0].linkshere)), _b = _a.next(); !_b.done; _b = _a.next()) {
                                                    item = _b.value;
                                                    console.log("\u67E5\u627E\u5230\u94FE\u63A5\u5230\u3010".concat(PAGENAME_1, "\u3011\u7684\u9875\u9762\uFF1A").concat(item.title));
                                                    pageList.push(item.title);
                                                }
                                            }
                                            catch (e_2_1) { e_2 = { error: e_2_1 }; }
                                            finally {
                                                try {
                                                    if (_b && !_b.done && (_c = _a["return"])) _c.call(_a);
                                                }
                                                finally { if (e_2) throw e_2.error; }
                                            }
                                        }
                                        lhcontinue = linkList["continue"] ? linkList["continue"].lhcontinue : false;
                                        return [3, 1];
                                    case 3:
                                        if (pageList.length > 0) {
                                            mw.notify("\u83B7\u53D6\u94FE\u63A5\u5230\u3010".concat(PAGENAME_1, "\u3011\u7684\u9875\u9762\u5217\u8868\u6210\u529F\u3002"));
                                        }
                                        else {
                                            mw.notify("\u6CA1\u6709\u9875\u9762\u94FE\u63A5\u5230\u3010".concat(PAGENAME_1, "\u3011\u3002"));
                                        }
                                        return [2, pageList];
                                }
                            });
                        });
                    };
                    DEWindow.prototype.getList = function () {
                        return __awaiter(this, void 0, void 0, function () {
                            var PageList;
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0:
                                        PageList = [];
                                        if (!this.typeSelectInput.getValue().includes("link")) return [3, 2];
                                        return [4, this.getLinkList().then(function (result) {
                                                PageList.push.apply(PageList, __spreadArray([], __read(result), false));
                                            })];
                                    case 1:
                                        _a.sent();
                                        _a.label = 2;
                                    case 2:
                                        if (!this.typeSelectInput.getValue().includes("include")) return [3, 4];
                                        return [4, this.getIncludeList().then(function (result) {
                                                PageList.push.apply(PageList, __spreadArray([], __read(result), false));
                                            })];
                                    case 3:
                                        _a.sent();
                                        _a.label = 4;
                                    case 4:
                                        PageList = __spreadArray([], __read(new Set(PageList)), false);
                                        $("#okp-all").text(PageList.length);
                                        return [2, PageList];
                                }
                            });
                        });
                    };
                    Object.defineProperty(DEWindow.prototype, "optionType", {
                        get: function () {
                            var _a;
                            return (_a = this.optionRadioSelect.findSelectedItem()) === null || _a === void 0 ? void 0 : _a.getData();
                        },
                        enumerable: false,
                        configurable: true
                    });
                    DEWindow.prototype.progressChange = function (title, result, err) {
                        if (err === void 0) { err = ""; }
                        var optionText = this.optionType === "nulledit" ? "零编辑" : "清除缓存";
                        switch (result.toLowerCase()) {
                            case "success":
                                this.state++;
                                mw.notify("\u9875\u9762\u3010".concat(title, "\u3011").concat(optionText, "\u6210\u529F\u3002"), { type: "success" });
                                $("#okp-done").text(this.state);
                                document.getElementById("okp-progress-".concat(title)).style.backgroundColor = "#D5FDF4";
                                document.getElementById("okp-progress-".concat(title)).style.borderColor = "#14866D";
                                break;
                            case "warn":
                                this.state++;
                                this.changeList.push(title);
                                $("#okp-done").text(this.state);
                                document.getElementById("okp-progress-".concat(title)).style.backgroundColor = "#FEE7E6";
                                document.getElementById("okp-progress-".concat(title)).style.borderColor = "#D33";
                                break;
                            case "fail":
                                this.failList.push(title);
                                mw.notify("\u9875\u9762\u3010".concat(title, "\u3011").concat(optionText, "\u5931\u8D25").concat(err ? "\uFF1A".concat(err) : "", "\u3002"), { type: "warn" });
                                document.getElementById("okp-progress-".concat(title)).style.backgroundColor = "#FEF6E7";
                                document.getElementById("okp-progress-".concat(title)).style.borderColor = "#EDAB00";
                                break;
                        }
                    };
                    DEWindow.prototype.nullEdit = function (title) {
                        return __awaiter(this, void 0, void 0, function () {
                            var e_3;
                            var _this = this;
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0:
                                        _a.trys.push([0, 2, , 3]);
                                        return [4, api_1.postWithToken("csrf", {
                                                format: "json",
                                                action: "edit",
                                                appendtext: "",
                                                watchlist: "nochange",
                                                nocreate: true,
                                                title: title
                                            }).done(function (data) {
                                                document.getElementById("okp-progress-".concat(title)).scrollIntoView();
                                                if (data.edit.result === "Success") {
                                                    $("#okp-done").text(_this.state);
                                                    if (data.edit.nochange === "") {
                                                        _this.progressChange(title, "success");
                                                    }
                                                    else {
                                                        _this.progressChange(title, "warn");
                                                    }
                                                }
                                                else {
                                                    _this.progressChange(title, "fail");
                                                }
                                            })];
                                    case 1:
                                        _a.sent();
                                        return [3, 3];
                                    case 2:
                                        e_3 = _a.sent();
                                        this.progressChange(title, "fail", e_3);
                                        return [3, 3];
                                    case 3: return [2];
                                }
                            });
                        });
                    };
                    DEWindow.prototype.purge = function (title) {
                        return __awaiter(this, void 0, void 0, function () {
                            var e_4;
                            var _this = this;
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0:
                                        _a.trys.push([0, 2, , 3]);
                                        return [4, api_1.post({
                                                format: "json",
                                                action: "purge",
                                                titles: title,
                                                forcelinkupdate: true
                                            }).done(function () {
                                                _this.progressChange(title, "success");
                                            })];
                                    case 1:
                                        _a.sent();
                                        return [3, 3];
                                    case 2:
                                        e_4 = _a.sent();
                                        this.progressChange(title, "fail", e_4);
                                        return [3, 3];
                                    case 3: return [2];
                                }
                            });
                        });
                    };
                    DEWindow.prototype.getActionProcess = function (action) {
                        var _this = this;
                        if (action === "cancel") {
                            return new OO.ui.Process(function () {
                                _this.close({ action: action });
                            }, this);
                        }
                        else if (action === "submit") {
                            return new OO.ui.Process($.when((function () { return __awaiter(_this, void 0, void 0, function () {
                                var _this = this;
                                return __generator(this, function (_a) {
                                    switch (_a.label) {
                                        case 0:
                                            if (this.typeSelectInput.getValue().length === 0) {
                                                mw.notify("请选择页面类型。");
                                            }
                                            this.failList = [];
                                            this.changeList = [];
                                            this.state = 0;
                                            $("#okp-done").text(0);
                                            return [4, this.getList().then(function (result) { return __awaiter(_this, void 0, void 0, function () {
                                                    var progressInner, result_1, result_1_1, item, _progressInner, result_2, result_2_1, item, e_5_1, result_3, result_3_1, item, e_6_1;
                                                    var e_7, _a, e_5, _b, e_6, _c;
                                                    return __generator(this, function (_d) {
                                                        switch (_d.label) {
                                                            case 0:
                                                                console.log(result);
                                                                if (result.length > 0) {
                                                                    mw.notify("\u5171".concat(result.length, "\u4E2A\u9875\u9762\uFF0C\u5F00\u59CB\u6267\u884C").concat(this.optionType === "nulledit" ? "零编辑" : "清除缓存", "\u2026\u2026"));
                                                                }
                                                                document.getElementById("okp-progress").innerHTML = "";
                                                                progressInner = document.createElement("div");
                                                                progressInner.style.width = "1em";
                                                                progressInner.style.aspectRatio = 1;
                                                                progressInner.style.backgroundColor = "#EAECF0";
                                                                progressInner.style.border = "1px solid";
                                                                progressInner.style.borderColor = "#A2A9B1";
                                                                progressInner.style.margin = ".2em";
                                                                try {
                                                                    for (result_1 = __values(result), result_1_1 = result_1.next(); !result_1_1.done; result_1_1 = result_1.next()) {
                                                                        item = result_1_1.value;
                                                                        _progressInner = progressInner.cloneNode();
                                                                        _progressInner.id = "okp-progress-".concat(item);
                                                                        _progressInner.title = item;
                                                                        document.getElementById("okp-progress").appendChild(_progressInner);
                                                                    }
                                                                }
                                                                catch (e_7_1) { e_7 = { error: e_7_1 }; }
                                                                finally {
                                                                    try {
                                                                        if (result_1_1 && !result_1_1.done && (_a = result_1["return"])) _a.call(result_1);
                                                                    }
                                                                    finally { if (e_7) throw e_7.error; }
                                                                }
                                                                this.updateSize();
                                                                if (!(this.optionType === "nulledit")) return [3, 10];
                                                                _d.label = 1;
                                                            case 1:
                                                                _d.trys.push([1, 7, 8, 9]);
                                                                result_2 = __values(result), result_2_1 = result_2.next();
                                                                _d.label = 2;
                                                            case 2:
                                                                if (!!result_2_1.done) return [3, 6];
                                                                item = result_2_1.value;
                                                                return [4, this.nullEdit(item)];
                                                            case 3:
                                                                _d.sent();
                                                                if (!!Noratelimit_1) return [3, 5];
                                                                return [4, this.waitInterval(6000)];
                                                            case 4:
                                                                _d.sent();
                                                                _d.label = 5;
                                                            case 5:
                                                                result_2_1 = result_2.next();
                                                                return [3, 2];
                                                            case 6: return [3, 9];
                                                            case 7:
                                                                e_5_1 = _d.sent();
                                                                e_5 = { error: e_5_1 };
                                                                return [3, 9];
                                                            case 8:
                                                                try {
                                                                    if (result_2_1 && !result_2_1.done && (_b = result_2["return"])) _b.call(result_2);
                                                                }
                                                                finally { if (e_5) throw e_5.error; }
                                                                return [7];
                                                            case 9: return [3, 18];
                                                            case 10:
                                                                _d.trys.push([10, 16, 17, 18]);
                                                                result_3 = __values(result), result_3_1 = result_3.next();
                                                                _d.label = 11;
                                                            case 11:
                                                                if (!!result_3_1.done) return [3, 15];
                                                                item = result_3_1.value;
                                                                return [4, this.purge(item)];
                                                            case 12:
                                                                _d.sent();
                                                                if (!!Noratelimit_1) return [3, 14];
                                                                return [4, this.waitInterval(2000)];
                                                            case 13:
                                                                _d.sent();
                                                                _d.label = 14;
                                                            case 14:
                                                                result_3_1 = result_3.next();
                                                                return [3, 11];
                                                            case 15: return [3, 18];
                                                            case 16:
                                                                e_6_1 = _d.sent();
                                                                e_6 = { error: e_6_1 };
                                                                return [3, 18];
                                                            case 17:
                                                                try {
                                                                    if (result_3_1 && !result_3_1.done && (_c = result_3["return"])) _c.call(result_3);
                                                                }
                                                                finally { if (e_6) throw e_6.error; }
                                                                return [7];
                                                            case 18: return [2];
                                                        }
                                                    });
                                                }); }).then(function () {
                                                    if (_this.failList.length > 0) {
                                                        oouiDialog.alert("".concat(_this.failList.join("、"), "\u3002<br>\u53EF\u80FD\u9875\u9762\u53D7\u5230\u4FDD\u62A4\uFF0C\u6216\u7F16\u8F91\u88AB\u8FC7\u6EE4\u5668\u62E6\u622A\uFF0C\u8BF7\u624B\u52A8\u68C0\u67E5\u3002"), {
                                                            title: "以下页面零编辑失败",
                                                            size: "medium"
                                                        });
                                                    }
                                                    if (_this.changeList.length > 0) {
                                                        oouiDialog.alert("".concat(_this.changeList.join("、"), "\u3002<br>\u88AB\u610F\u5916\u66F4\u6539\uFF0C\u8BF7\u624B\u52A8\u64A4\u56DE\u6216\u56DE\u9000"), {
                                                            title: "以下页面被意外更改",
                                                            size: "medium"
                                                        });
                                                    }
                                                })];
                                        case 1:
                                            _a.sent();
                                            return [2];
                                    }
                                });
                            }); })()).promise(), this);
                        }
                        return _super.prototype.getActionProcess.call(this, action);
                    };
                    DEWindow.static = __assign(__assign({}, _super.static), { tagName: "div", name: "one-key-purge", title: "批量清除页面缓存", actions: [
                            {
                                action: "cancel",
                                label: "取消",
                                flags: ["safe", "close", "destructive"]
                            },
                            {
                                action: "submit",
                                label: "执行",
                                flags: ["primary", "progressive"]
                            },
                        ] });
                    return DEWindow;
                }(OO.ui.ProcessDialog));
                windowManager_1 = new OO.ui.WindowManager({
                    id: "one-key-purge"
                });
                $body_1.append(windowManager_1.$element);
                DEDialog_1 = new DEWindow({
                    size: "large"
                });
                windowManager_1.addWindows([DEDialog_1]);
                $(mw.util.addPortletLink("p-cactions", "#", "批量清除缓存", "ca-purge")).on("click", function () {
                    windowManager_1.openWindow(DEDialog_1);
                    $body_1.css("overflow", "auto");
                });
                _a.label = 3;
            case 3: return [2];
        }
    });
}); })(); });
