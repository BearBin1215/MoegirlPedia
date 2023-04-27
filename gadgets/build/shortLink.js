"use strict";
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
$(function () {
    var e_1, _a;
    var _b = mw.config.get([
        "wgArticleId",
        "wgCurRevisionId",
        "wgRevisionId",
        "wgDiffOldId",
        "wgDiffNewId",
        "wgServer",
        "wgScriptPath",
        "skin",
    ]), _c = _b.wgArticleId, wgArticleId = _c === void 0 ? -1 : _c, _d = _b.wgCurRevisionId, wgCurRevisionId = _d === void 0 ? -1 : _d, _e = _b.wgRevisionId, wgRevisionId = _e === void 0 ? -1 : _e, _f = _b.wgDiffOldId, wgDiffOldId = _f === void 0 ? -1 : _f, _g = _b.wgDiffNewId, wgDiffNewId = _g === void 0 ? -1 : _g, wgServer = _b.wgServer, wgScriptPath = _b.wgScriptPath, skin = _b.skin;
    if (wgArticleId <= 0) {
        return;
    }
    $("body").css("height", "auto");
    var $slCard;
    switch (skin) {
        case "moeskin":
        default:
            $slCard = $("<div class=\"moe-card\" id=\"p-sl\"><div class=\"mw-parser-output\"><h3 style=\"margin-top: 0px;\">".concat(wgULS("短链接", "短網址"), "</h3></div></div>"));
            $(".moe-siderail-sticky").append($slCard);
            $("#p-sl h3").after('<div style="display:flex"><div style="width:0.25rem;border-radius:99em;background:rgba(0,0,0,0.102);margin-right:1rem"></div><ul id="p-sl-list" style="list-style:none"></ul></div>');
            break;
        case "vector":
            $("#mw-panel").append("<div class=\"portal\" id=\"p-sl\" aria-labelledby=\"p-sl-label\" style=\"position:sticky;top:0;\"><h3 lang=\"zh-CN\" dir=\"ltr\" id=\"p-sl-label\">".concat(wgULS("短链接", "短網址"), "</h3></div>"));
            $("#p-sl h3").after('<div class="body"><ul id="p-sl-list"></ul></div>');
            break;
    }
    var $list = $("#p-sl-list");
    var links = [{
            id: "page",
            href: "curid=".concat(wgArticleId),
            title: wgULS("本页面的短链接（页面ID）", "本頁面的短網址（頁面ID）"),
            text: wgULS("本页短链", "本頁短網址"),
            wikitext: "[[Special:\u91CD\u5B9A\u5411/page/".concat(wgArticleId, "]]")
        }, {
            id: "newrev",
            href: "oldid=".concat(wgCurRevisionId),
            title: wgULS("本页面最新版本的短链接（版本ID）", "本頁面最新修訂的短網址（版本ID）"),
            text: wgULS("最新版本", "最新修訂"),
            wikitext: "[[Special:\u56FA\u5B9A\u94FE\u63A5/".concat(wgCurRevisionId, "]]")
        }];
    if (wgRevisionId > 0) {
        if (wgCurRevisionId !== wgRevisionId) {
            links.push({
                id: "rev",
                href: "oldid=".concat(wgRevisionId),
                title: wgULS("本页面当前版本的短链接（版本ID）", "本頁面當前修訂的短網址（版本ID）"),
                text: wgULS("当前版本", "當前修訂"),
                wikitext: "[[Special:\u56FA\u5B9A\u94FE\u63A5/".concat(wgRevisionId, "]]")
            }, {
                id: "currev",
                href: "diff=".concat(wgRevisionId),
                title: wgULS("本页面当前版本与前一版本的差异的链接（版本ID）", "本頁面當前修訂與前一修訂的短網址（版本ID）"),
                text: wgULS("当前版本差异", "當前修訂差異"),
                wikitext: "[[Special:\u5DEE\u5F02/".concat(wgRevisionId, "]]")
            }, {
                id: "curdiff",
                href: "diff=".concat(wgCurRevisionId, "&oldid=").concat(wgRevisionId),
                title: wgULS("与本页面最新版本的差异的短链接（版本ID）", "與本頁面最新修訂差異的短網址（版本ID）"),
                text: wgULS("与最新版本差异", "與最新修訂差異"),
                wikitext: "[[Special:\u5DEE\u5F02/".concat(wgRevisionId, "/").concat(wgCurRevisionId, "]]")
            });
        }
        else if (wgDiffNewId !== wgCurRevisionId) {
            links.push({
                id: "currev",
                href: "diff=".concat(wgCurRevisionId),
                title: wgULS("本页面最新版本与前一版本的差异的链接（版本ID）", "本頁面最新修訂與前一修訂差異的短網址（版本ID）"),
                text: wgULS("最新版本差异", "與最新修訂差異"),
                wikitext: "[[Special:\u5DEE\u5F02/".concat(wgCurRevisionId, "]]")
            });
        }
    }
    if (wgDiffNewId > 0 && wgDiffOldId > 0) {
        links.push({
            id: "diff",
            href: "diff=".concat(wgDiffNewId, "&oldid=").concat(wgDiffOldId),
            title: wgULS("当前比较的差异的短链接（版本ID）", "當前比較的差異的短網址（版本ID）"),
            text: wgULS("当前比较的差异", "當前比較的差異"),
            wikitext: "[[Special:\u5DEE\u5F02/".concat(wgDiffOldId, "/").concat(wgDiffNewId, "]]")
        });
    }
    var addItem = function (link) {
        var $item = $("<li id=\"sl-".concat(link.id, "\"></li>"));
        $item.append("<a href=\"".concat(wgServer).concat(wgScriptPath, "/_?").concat(link.href, "\">").concat(link.text, "</a>"));
        switch (skin) {
            case "moeskin":
            default:
                $item.append("<div>\uFF08<a data-copy-content=\"".concat(link.wikitext, "\" data-type=\"wikitext\"></a><wbr>\u4E28<a data-copy-content=\"").concat(wgServer).concat(wgScriptPath, "/_?").concat(link.href, "\" data-type=\"").concat(wgULS("短链接", "短網址"), "\"></a>\uFF09</div>"));
                break;
            case "vector":
                $item.append("<div>\uFF08<a data-copy-content=\"".concat(link.wikitext, "\" data-type=\"wikitext\"></a>\uFF09</div>"));
                $item.append("<div>\uFF08<a data-copy-content=\"".concat(wgServer).concat(wgScriptPath, "/_?").concat(link.href, "\" data-type=\"").concat(wgULS("短链接", "短網址"), "\"></a>\uFF09</div>"));
                break;
        }
        $list.append($item);
    };
    var markStatus = function (ele, status) {
        ele.innerText = status ?
            "".concat(ele.dataset.type).concat(wgULS("复制成功", "複製成功"))
            :
                "".concat(wgULS("复制", "複製")).concat(ele.dataset.type);
    };
    try {
        for (var links_1 = __values(links), links_1_1 = links_1.next(); !links_1_1.done; links_1_1 = links_1.next()) {
            var item = links_1_1.value;
            addItem(item);
        }
    }
    catch (e_1_1) { e_1 = { error: e_1_1 }; }
    finally {
        try {
            if (links_1_1 && !links_1_1.done && (_a = links_1["return"])) _a.call(links_1);
        }
        finally { if (e_1) throw e_1.error; }
    }
    $("#p-sl-list a[data-type]").each(function (_, ele) {
        markStatus(ele, false);
    });
    $("#p-sl-list a[data-type]").on("click", function () {
        var _a;
        return __awaiter(this, void 0, void 0, function () {
            var valueNode_1, selection_1, rangeCount_1, range_1;
            var _this = this;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        if (!(typeof ((_a = navigator.clipboard) === null || _a === void 0 ? void 0 : _a.writeText) === "function")) return [3, 2];
                        return [4, navigator.clipboard.writeText(this.dataset.copyContent)];
                    case 1:
                        _b.sent();
                        return [3, 3];
                    case 2:
                        valueNode_1 = $("<pre/>", {
                            css: {
                                position: "absolute",
                                left: "-99999px",
                                "z-index": "-99999",
                                opacity: 0
                            }
                        }).appendTo("body");
                        selection_1 = window.getSelection();
                        rangeCount_1 = selection_1.rangeCount;
                        if (rangeCount_1 > 0) {
                            range_1 = selection_1.getRangeAt(0);
                        }
                        valueNode_1.text(this.dataset.copyContent);
                        selection_1.selectAllChildren(valueNode_1[0]);
                        document.execCommand("copy");
                        window.setTimeout(function () {
                            selection_1.removeAllRanges();
                            if (rangeCount_1 > 0) {
                                selection_1.addRange(range_1);
                            }
                            valueNode_1.empty();
                        }, 7);
                        _b.label = 3;
                    case 3:
                        markStatus(this, true);
                        setTimeout(function () {
                            markStatus(_this, false);
                        }, 3000);
                        return [2];
                }
            });
        });
    });
    if (skin === "vector") {
        $(window).on("resize", function () {
            $("#mw-panel").height($("body").height());
        });
    }
});
