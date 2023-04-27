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
var _addText = '{{Documentation|content=<p>本小工具用于在提案和权限变更版快速提醒用户参与投票。</p><p>使用方式：在[[Special:MyPage/common.js|个人js页]]添加如下代码</p><pre class="prettyprint lang-javascript" style="margin-top:0">mw.loader.load("/index.php?title=User:BearBin/js/voteRemind.js&action=raw&ctype=text/javascript");</pre><p>如果您不想收到提醒，请前往[[User:BearBin/js/voteRemind.js/Noremind]]取消订阅。</p><p>如果您有好的建议，欢迎前往[[User_talk:BearBin|我的讨论页]]，或在GitHub上[https://github.com/BearBin1215/MoegirlPedia/issues 提交issue]。</p>}}';
"use strict";
$(function () { return (function () { return __awaiter(void 0, void 0, void 0, function () {
    var api_1, $body_1, PAGENAME_1, isProposal_1, isBot_1, GadgetTitle, ReminderWindow, windowManager_1, reminderDialog_1;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4, mw.loader.using(["mediawiki.api", "mediawiki.util", "mediawiki.notification", "oojs-ui-core", "ext.gadget.site-lib"])];
            case 1:
                _a.sent();
                if (document.getElementsByClassName("votebox")[0] && (mw.config.get("wgTitle").startsWith("提案/讨论中提案/") || mw.config.get("wgTitle") === "讨论版/权限变更")) {
                    api_1 = new mw.Api;
                    $body_1 = $("body");
                    PAGENAME_1 = mw.config.get("wgPageName");
                    isProposal_1 = mw.config.get("wgTitle").startsWith("提案/讨论中提案/");
                    isBot_1 = mw.config.get("wgUserGroups").includes("flood");
                    GadgetTitle = wgULS("一键发送投票提醒", "一鍵發送投票提醒");
                    ReminderWindow = (function (_super) {
                        __extends(ReminderWindow, _super);
                        function ReminderWindow(config) {
                            var _this = _super.call(this, config) || this;
                            _this.failList = [];
                            return _this;
                        }
                        ReminderWindow.prototype.initialize = function () {
                            var e_1, _a;
                            _super.prototype.initialize.call(this);
                            this.panelLayout = new OO.ui.PanelLayout({
                                scrollable: false,
                                expanded: false,
                                padded: true
                            });
                            this.proposalTitleBox = new OO.ui.TextInputWidget({
                                value: PAGENAME_1.substring(PAGENAME_1.lastIndexOf("/") + 1, PAGENAME_1.length),
                                validate: "non-empty"
                            });
                            var proposalTitleField = new OO.ui.FieldLayout(this.proposalTitleBox, {
                                label: wgULS("提案标题", "提案標題"),
                                align: "top"
                            });
                            this.headlines = [];
                            try {
                                for (var _b = __values($(".votebox").parent(".discussionContainer").children("h2").children(".mw-headline")), _c = _b.next(); !_c.done; _c = _b.next()) {
                                    var item = _c.value;
                                    this.headlines.push(item.id);
                                }
                            }
                            catch (e_1_1) { e_1 = { error: e_1_1 }; }
                            finally {
                                try {
                                    if (_c && !_c.done && (_a = _b["return"])) _a.call(_b);
                                }
                                finally { if (e_1) throw e_1.error; }
                            }
                            this.sectionTitleDropdown = new OO.ui.DropdownInputWidget({
                                options: __spreadArray([], __read(this.headlines.map(function (v) { return ({
                                    data: v,
                                    label: v.replaceAll("_", " ")
                                }); })), false)
                            });
                            var sectionTitleFiled = new OO.ui.FieldLayout(this.sectionTitleDropdown, {
                                label: wgULS("人事案标题", "人事案標題"),
                                align: top
                            });
                            this.Papp = new OO.ui.RadioOptionWidget({ data: "p", label: "管理员、巡查姬", selected: true });
                            this.Sapp = new OO.ui.RadioOptionWidget({ data: "s", label: "管理员" });
                            this.Iapp = new OO.ui.RadioOptionWidget({ data: "i", label: "管理员、界面管理员" });
                            this.groupsRadioSelect = new OO.ui.RadioSelectWidget({
                                items: [
                                    this.Papp,
                                    this.Sapp,
                                    this.Iapp,
                                ]
                            });
                            var groupsFiled = new OO.ui.FieldLayout(this.groupsRadioSelect, {
                                label: wgULS("要提醒的用户组", "要提醒的用戶組"),
                                align: top
                            });
                            if (isProposal_1) {
                                this.panelLayout.$element.append(proposalTitleField.$element);
                            }
                            else {
                                this.panelLayout.$element.append(sectionTitleFiled.$element, groupsFiled.$element);
                            }
                            this.$body.append(this.panelLayout.$element);
                        };
                        Object.defineProperty(ReminderWindow.prototype, "proposalTitle", {
                            get: function () {
                                return this.proposalTitleBox.getValue();
                            },
                            enumerable: false,
                            configurable: true
                        });
                        Object.defineProperty(ReminderWindow.prototype, "sectionTitle", {
                            get: function () {
                                return this.sectionTitleDropdown.getValue();
                            },
                            enumerable: false,
                            configurable: true
                        });
                        Object.defineProperty(ReminderWindow.prototype, "groupSelected", {
                            get: function () {
                                var _a, _b;
                                return (_b = (_a = this.groupsRadioSelect.findSelectedItem()) === null || _a === void 0 ? void 0 : _a.getData) === null || _b === void 0 ? void 0 : _b.call(_a);
                            },
                            enumerable: false,
                            configurable: true
                        });
                        ReminderWindow.prototype.getUserGroup = function () {
                            return __awaiter(this, void 0, void 0, function () {
                                var userGroup, userList, groupsToVote;
                                return __generator(this, function (_a) {
                                    switch (_a.label) {
                                        case 0: return [4, api_1.post({
                                                action: "query",
                                                titles: "Module:UserGroup/data",
                                                prop: "revisions",
                                                rvprop: "content",
                                                rvlimit: 1
                                            })];
                                        case 1:
                                            userGroup = _a.sent();
                                            userList = JSON.parse(Object.values(userGroup.query.pages)[0].revisions[0]["*"]);
                                            if (isProposal_1) {
                                                groupsToVote = __spreadArray(__spreadArray([], __read(userList.sysop), false), __read(userList.patroller), false);
                                            }
                                            else {
                                                switch (this.groupSelected) {
                                                    case "p":
                                                        groupsToVote = __spreadArray(__spreadArray([], __read(userList.sysop), false), __read(userList.patroller), false);
                                                        break;
                                                    case "s":
                                                        groupsToVote = userList.sysop;
                                                        break;
                                                    case "i":
                                                        groupsToVote = Array.from(new Set(__spreadArray(__spreadArray([], __read(userList.sysop), false), __read(userList["interface-admin"]), false)));
                                                }
                                            }
                                            return [2, groupsToVote];
                                    }
                                });
                            });
                        };
                        Object.defineProperty(ReminderWindow.prototype, "userVoted", {
                            get: function () {
                                var e_2, _a;
                                var userVotedList = [];
                                var hrefList = [];
                                if (isProposal_1) {
                                    $(".votebox ~ ol a[href^='/User'], .votebox ~ ol a[href^='/index.php?title=User']").each(function () {
                                        hrefList.push(this.href);
                                    });
                                }
                                else {
                                    $("#".concat(this.sectionTitle)).parents(".discussionContainer").find(".votebox ~ ol a[href^='/User'], .votebox ~ ol a[href^='/index.php?title=User']").each(function () {
                                        hrefList.push(this.href);
                                    });
                                }
                                try {
                                    for (var hrefList_1 = __values(hrefList), hrefList_1_1 = hrefList_1.next(); !hrefList_1_1.done; hrefList_1_1 = hrefList_1.next()) {
                                        var item = hrefList_1_1.value;
                                        userVotedList.push(decodeURI(item.replace(/.*User(_talk)?:([^&]*).*/g, "$2")));
                                    }
                                }
                                catch (e_2_1) { e_2 = { error: e_2_1 }; }
                                finally {
                                    try {
                                        if (hrefList_1_1 && !hrefList_1_1.done && (_a = hrefList_1["return"])) _a.call(hrefList_1);
                                    }
                                    finally { if (e_2) throw e_2.error; }
                                }
                                return userVotedList;
                            },
                            enumerable: false,
                            configurable: true
                        });
                        ReminderWindow.prototype.getUserToRemind = function () {
                            return __awaiter(this, void 0, void 0, function () {
                                var userToRemind, Noremind, userNoremind, userExcluded;
                                return __generator(this, function (_a) {
                                    switch (_a.label) {
                                        case 0: return [4, this.getUserGroup().then(function (result) {
                                                userToRemind = result;
                                            })];
                                        case 1:
                                            _a.sent();
                                            return [4, api_1.post({
                                                    action: "query",
                                                    titles: "User:BearBin/js/voteRemind.js/Noremind",
                                                    prop: "revisions",
                                                    rvprop: "content",
                                                    rvlimit: 1
                                                })];
                                        case 2:
                                            Noremind = _a.sent();
                                            userNoremind = Object.values(Noremind.query.pages)[0].revisions[0]["*"].split(/\n\* */);
                                            userExcluded = new Set(__spreadArray(__spreadArray([], __read(this.userVoted), false), __read(userNoremind), false));
                                            console.log(userToRemind.filter(function (x) { return !userExcluded.has(x); }));
                                            return [2, userToRemind.filter(function (x) { return !userExcluded.has(x); })];
                                    }
                                });
                            });
                        };
                        Object.defineProperty(ReminderWindow.prototype, "link", {
                            get: function () {
                                if (isProposal_1) {
                                    return "[[\u840C\u5A18\u767E\u79D1_talk:\u63D0\u6848/\u8BA8\u8BBA\u4E2D\u63D0\u6848/".concat(this.proposalTitle, "|").concat(this.proposalTitle.replaceAll("_", " "), "]]");
                                }
                                return "[[\u840C\u5A18\u767E\u79D1_talk:\u8BA8\u8BBA\u7248/\u6743\u9650\u53D8\u66F4#".concat(this.sectionTitle, "|").concat(this.sectionTitle.replaceAll("_", " "), "]]");
                            },
                            enumerable: false,
                            configurable: true
                        });
                        ReminderWindow.prototype.remind = function (username) {
                            return __awaiter(this, void 0, void 0, function () {
                                var send;
                                return __generator(this, function (_a) {
                                    switch (_a.label) {
                                        case 0: return [4, api_1.postWithToken("csrf", {
                                                format: "json",
                                                action: "edit",
                                                section: "new",
                                                watchlist: "nochange",
                                                tags: "Automation tool",
                                                bot: isBot_1,
                                                title: "User_talk:".concat(username),
                                                sectiontitle: "投票提醒",
                                                text: "<i style=\"font-size:small\">\u672C\u901A\u77E5\u4F7F\u7528\u4E00\u952E\u63D0\u9192\u5C0F\u5DE5\u5177\u53D1\u51FA\uFF0C\u5982\u51FA\u73B0\u9519\u8BEF\uFF0C\u8BF7\u8054\u7CFB[[User_talk:BearBin|BearBin]]\u3002\u82E5\u4E0D\u5E0C\u671B\u63A5\u5230\u6B64\u63D0\u9192\uFF0C\u8BF7\u5728[[User:BearBin/js/voteRemind.js/Noremind|\u8FD9\u4E2A\u9875\u9762]]\u8BB0\u5F55\u60A8\u7684\u7528\u6237\u540D\u3002</i><br/>\u60A8\u597D\uFF0C".concat(isProposal_1 ? "提案" : "人事案", "\u3010").concat(this.link, "\u3011\u5DF2\u7ECF\u5F00\u59CB\u6295\u7968\u3002\u60A8\u5C1A\u672A\u6295\u7968\uFF0C\u8BF7\u53CA\u65F6\u53C2\u4E0E\u55B5\uFF5E\u2014\u2014~~~~")
                                            }).done(function () {
                                                mw.notify(wgULS("\u5411".concat(username, "\u53D1\u9001\u6295\u7968\u63D0\u9192\u6210\u529F\u3002"), "\u5411".concat(username, "\u767C\u9001\u6295\u7968\u63D0\u9192\u6210\u529F\u3002")));
                                            })];
                                        case 1:
                                            send = _a.sent();
                                            if (send.error) {
                                                this.failList.push(username);
                                                mw.notify(wgULS("\u5411".concat(username, "\u53D1\u9001\u6295\u7968\u63D0\u9192\u5931\u8D25\uFF1A").concat(send.error.code, "\u3002"), "\u5411".concat(username, "\u767C\u9001\u6295\u7968\u63D0\u9192\u5931\u6557\uFF1A").concat(send.error.code, "\u3002")), { type: "error" });
                                            }
                                            return [2];
                                    }
                                });
                            });
                        };
                        ReminderWindow.prototype.getActionProcess = function (action) {
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
                                                this.failList = [];
                                                return [4, this.getUserToRemind().then(function (result) { return __awaiter(_this, void 0, void 0, function () {
                                                        var result_1, result_1_1, user, e_3_1;
                                                        var e_3, _a;
                                                        return __generator(this, function (_b) {
                                                            switch (_b.label) {
                                                                case 0:
                                                                    _b.trys.push([0, 5, 6, 7]);
                                                                    result_1 = __values(result), result_1_1 = result_1.next();
                                                                    _b.label = 1;
                                                                case 1:
                                                                    if (!!result_1_1.done) return [3, 4];
                                                                    user = result_1_1.value;
                                                                    return [4, this.remind(user)];
                                                                case 2:
                                                                    _b.sent();
                                                                    _b.label = 3;
                                                                case 3:
                                                                    result_1_1 = result_1.next();
                                                                    return [3, 1];
                                                                case 4: return [3, 7];
                                                                case 5:
                                                                    e_3_1 = _b.sent();
                                                                    e_3 = { error: e_3_1 };
                                                                    return [3, 7];
                                                                case 6:
                                                                    try {
                                                                        if (result_1_1 && !result_1_1.done && (_a = result_1["return"])) _a.call(result_1);
                                                                    }
                                                                    finally { if (e_3) throw e_3.error; }
                                                                    return [7];
                                                                case 7: return [2];
                                                            }
                                                        });
                                                    }); })];
                                            case 1:
                                                _a.sent();
                                                if (this.failList.length > 0) {
                                                    oouiDialog.alert(this.failList.join("、"), {
                                                        title: wgULS("向以下用户发送提醒失败", "向以下使用者發送提醒失敗"),
                                                        size: "small"
                                                    });
                                                }
                                                this.close({ action: action });
                                                return [2];
                                        }
                                    });
                                }); })()).promise(), this);
                            }
                            return _super.prototype.getActionProcess.call(this, action);
                        };
                        ReminderWindow.static = __assign(__assign({}, _super.static), { tagName: "div", name: "lr-reminder", title: GadgetTitle, actions: [
                                {
                                    action: "cancel",
                                    label: "取消",
                                    flags: ["safe", "close", "destructive"]
                                },
                                {
                                    action: "submit",
                                    label: wgULS("发送", "發送"),
                                    flags: ["primary", "progressive"]
                                },
                            ] });
                        return ReminderWindow;
                    }(OO.ui.ProcessDialog));
                    windowManager_1 = new OO.ui.WindowManager();
                    $body_1.append(windowManager_1.$element);
                    reminderDialog_1 = new ReminderWindow({
                        size: "medium",
                        id: "bearbin-vote-remind"
                    });
                    windowManager_1.addWindows([reminderDialog_1]);
                    $(mw.util.addPortletLink("p-cactions", "#", "投票提醒", "ca-vote-remind", GadgetTitle, "r")).on("click", function (e) {
                        e.preventDefault();
                        windowManager_1.openWindow(reminderDialog_1);
                        $body_1.css("overflow", "auto");
                    });
                }
                return [2];
        }
    });
}); })(); });
