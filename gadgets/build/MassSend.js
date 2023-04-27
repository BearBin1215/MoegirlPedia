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
$(function () { return (function () { return __awaiter(void 0, void 0, void 0, function () {
    var api, $body, isBot, GadgetTitle, UserRights, Noratelimit, MassSendWindow, windowManager, MassSendDialog;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4, mw.loader.using(["mediawiki.api", "mediawiki.user", "mediawiki.util", "mediawiki.notification", "oojs-ui-core", "ext.gadget.site-lib"])];
            case 1:
                _a.sent();
                api = new mw.Api;
                $body = $("body");
                isBot = mw.config.get("wgUserGroups").includes("flood");
                GadgetTitle = wgULS("批量发送讨论页消息", "批量發送討論頁消息");
                return [4, mw.user.getRights()];
            case 2:
                UserRights = _a.sent();
                Noratelimit = UserRights.includes("noratelimit");
                MassSendWindow = (function (_super) {
                    __extends(MassSendWindow, _super);
                    function MassSendWindow(config) {
                        return _super.call(this, config) || this;
                    }
                    MassSendWindow.prototype.initialize = function () {
                        _super.prototype.initialize.call(this);
                        this.panelLayout = new OO.ui.PanelLayout({
                            scrollable: false,
                            expanded: false,
                            padded: true
                        });
                        this.userListBox = new OO.ui.MultilineTextInputWidget({
                            validate: "non-empty",
                            placeholder: "（使用换行分隔，一行一个）",
                            autosize: true
                        });
                        var userListField = new OO.ui.FieldLayout(this.userListBox, {
                            label: wgULS("用户列表", "使用者列表"),
                            align: "top"
                        });
                        this.checkRegBox = new OO.ui.CheckboxInputWidget({
                            selected: true
                        });
                        var checkRegField = new OO.ui.FieldLayout(this.checkRegBox, {
                            label: wgULS("检查用户是否注册", "檢查使用者是否註冊"),
                            align: "inline"
                        });
                        this.sectionTitleBox = new OO.ui.TextInputWidget({
                            validate: "non-empty",
                            autosize: true
                        });
                        var sectionTitleField = new OO.ui.FieldLayout(this.sectionTitleBox, {
                            label: wgULS("提醒标题", "提醒標題"),
                            align: "top"
                        });
                        this.messageContentBox = new OO.ui.MultilineTextInputWidget({
                            validate: "non-empty",
                            placeholder: wgULS("（不会自动签名！）", "（不會自動簽名！）"),
                            autosize: true
                        });
                        var messageContentField = new OO.ui.FieldLayout(this.messageContentBox, {
                            label: wgULS("要发送的内容", "要发送的內容"),
                            align: "top"
                        });
                        this.panelLayout.$element.append(userListField.$element, checkRegField.$element, sectionTitleField.$element, messageContentField.$element);
                        if (!Noratelimit) {
                            this.panelLayout.$element.prepend('<p style="font-size:1.143em"><b>提醒</b>：您未持有noratelimit权限，发送速率将受到限制，请耐心等待。</p>');
                        }
                        this.$body.append(this.panelLayout.$element);
                    };
                    Object.defineProperty(MassSendWindow.prototype, "userList", {
                        get: function () {
                            var list = this.userListBox.getValue().split("\n");
                            return Array.from(new Set(list));
                        },
                        enumerable: false,
                        configurable: true
                    });
                    Object.defineProperty(MassSendWindow.prototype, "checkReg", {
                        get: function () {
                            return this.checkRegBox.isSelected();
                        },
                        enumerable: false,
                        configurable: true
                    });
                    Object.defineProperty(MassSendWindow.prototype, "sectionTitle", {
                        get: function () {
                            return this.sectionTitleBox.getValue();
                        },
                        enumerable: false,
                        configurable: true
                    });
                    Object.defineProperty(MassSendWindow.prototype, "messageContent", {
                        get: function () {
                            return this.messageContentBox.getValue();
                        },
                        enumerable: false,
                        configurable: true
                    });
                    MassSendWindow.prototype.userReg = function (user) {
                        return __awaiter(this, void 0, void 0, function () {
                            var d;
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0: return [4, api.post({
                                            action: "query",
                                            list: "users",
                                            ususers: user.replaceAll(/\/.*/g, ""),
                                            usprop: "registration"
                                        })];
                                    case 1:
                                        d = _a.sent();
                                        if (d.query.users[0].userid) {
                                            return [2, true];
                                        }
                                        return [2, false];
                                }
                            });
                        });
                    };
                    MassSendWindow.prototype.send = function (user, title, message) {
                        return __awaiter(this, void 0, void 0, function () {
                            var d;
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0: return [4, api.postWithToken("csrf", {
                                            format: "json",
                                            action: "edit",
                                            section: "new",
                                            watchlist: "nochange",
                                            tags: "Automation tool",
                                            bot: isBot,
                                            title: "User_talk:".concat(user),
                                            sectiontitle: title,
                                            text: message
                                        })
                                            .done(function () {
                                            mw.notify(wgULS("\u5411\u7528\u6237".concat(user, "\u53D1\u9001\u6210\u529F\u3002"), "\u5411\u4F7F\u7528\u8005".concat(user, "\u767C\u9001\u6210\u529F\u3002")));
                                        })];
                                    case 1:
                                        d = _a.sent();
                                        if (d.error) {
                                            mw.notify(wgULS("\u5411".concat(user, "\u53D1\u9001\u5931\u8D25\uFF1A").concat(d.error.code, "\u3002"), "\u5411".concat(user, "\u767C\u9001\u5931\u6557\uFF1A").concat(d.error.code, "\u3002")));
                                            return [2, false];
                                        }
                                        return [2, true];
                                }
                            });
                        });
                    };
                    MassSendWindow.prototype.waitInterval = function (time) {
                        return new Promise(function (resolve) { return setTimeout(resolve, time); });
                    };
                    MassSendWindow.prototype.getActionProcess = function (action) {
                        var _this = this;
                        if (action === "cancel") {
                            return new OO.ui.Process(function () {
                                _this.close({ action: action });
                            }, this);
                        }
                        else if (action === "submit") {
                            return new OO.ui.Process($.when((function () { return __awaiter(_this, void 0, void 0, function () {
                                var title, text, errorList_1, _loop_1, this_1, _a, _b, user, e_1_1, err_1;
                                var e_1, _c;
                                var _this = this;
                                return __generator(this, function (_d) {
                                    switch (_d.label) {
                                        case 0:
                                            title = this.sectionTitle;
                                            text = this.messageContent;
                                            if (!title) {
                                                throw new OO.ui.Error(wgULS("请输入提醒标题", "請輸入提醒標題"));
                                            }
                                            else if (!text) {
                                                throw new OO.ui.Error(wgULS("请输入要发送的文本", "請輸入要發送的文本"));
                                            }
                                            _d.label = 1;
                                        case 1:
                                            _d.trys.push([1, 10, , 11]);
                                            errorList_1 = [];
                                            _loop_1 = function (user) {
                                                return __generator(this, function (_e) {
                                                    switch (_e.label) {
                                                        case 0:
                                                            if (!this_1.checkReg) return [3, 2];
                                                            return [4, this_1.userReg(user).then(function (result) { return __awaiter(_this, void 0, void 0, function () {
                                                                    return __generator(this, function (_a) {
                                                                        switch (_a.label) {
                                                                            case 0:
                                                                                if (!result) return [3, 4];
                                                                                return [4, this.send(user, title, text)
                                                                                        .then(function (result) {
                                                                                        if (!result) {
                                                                                            errorList_1.push(user);
                                                                                        }
                                                                                    })];
                                                                            case 1:
                                                                                _a.sent();
                                                                                if (!!Noratelimit) return [3, 3];
                                                                                return [4, this.waitInterval(6000)];
                                                                            case 2:
                                                                                _a.sent();
                                                                                _a.label = 3;
                                                                            case 3: return [3, 5];
                                                                            case 4:
                                                                                mw.notify(wgULS("\u7528\u6237".concat(user.replaceAll(/\/.*/g, ""), "\u672A\u521B\u5EFA\u3002"), "\u4F7F\u7528\u8005".concat(user.replaceAll(/\/.*/g, ""), "\u672A\u5275\u5EFA\u3002")));
                                                                                errorList_1.push(user);
                                                                                _a.label = 5;
                                                                            case 5: return [2];
                                                                        }
                                                                    });
                                                                }); })];
                                                        case 1:
                                                            _e.sent();
                                                            return [3, 4];
                                                        case 2: return [4, this_1.send(user, title, text)
                                                                .then(function (result) {
                                                                if (!result) {
                                                                    errorList_1.push(user);
                                                                }
                                                            })];
                                                        case 3:
                                                            _e.sent();
                                                            _e.label = 4;
                                                        case 4: return [2];
                                                    }
                                                });
                                            };
                                            this_1 = this;
                                            _d.label = 2;
                                        case 2:
                                            _d.trys.push([2, 7, 8, 9]);
                                            _a = __values(this.userList), _b = _a.next();
                                            _d.label = 3;
                                        case 3:
                                            if (!!_b.done) return [3, 6];
                                            user = _b.value;
                                            return [5, _loop_1(user)];
                                        case 4:
                                            _d.sent();
                                            _d.label = 5;
                                        case 5:
                                            _b = _a.next();
                                            return [3, 3];
                                        case 6: return [3, 9];
                                        case 7:
                                            e_1_1 = _d.sent();
                                            e_1 = { error: e_1_1 };
                                            return [3, 9];
                                        case 8:
                                            try {
                                                if (_b && !_b.done && (_c = _a["return"])) _c.call(_a);
                                            }
                                            finally { if (e_1) throw e_1.error; }
                                            return [7];
                                        case 9:
                                            if (errorList_1.length > 0) {
                                                oouiDialog.alert(errorList_1.join("、"), {
                                                    title: wgULS("向以下用户发送失败", "向以下使用者發送失敗"),
                                                    size: "small"
                                                });
                                            }
                                            this.close({ action: action });
                                            return [3, 11];
                                        case 10:
                                            err_1 = _d.sent();
                                            console.error("OOUI error:", err_1);
                                            throw new OO.ui.Error(err_1);
                                        case 11: return [2];
                                    }
                                });
                            }); })()).promise(), this);
                        }
                        return _super.prototype.getActionProcess.call(this, action);
                    };
                    MassSendWindow.static = __assign(__assign({}, _super.static), { tagName: "div", name: "lr-masssned", title: GadgetTitle, actions: [
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
                    return MassSendWindow;
                }(OO.ui.ProcessDialog));
                windowManager = new OO.ui.WindowManager();
                $body.append(windowManager.$element);
                MassSendDialog = new MassSendWindow({
                    size: "large"
                });
                windowManager.addWindows([MassSendDialog]);
                $(mw.util.addPortletLink("p-cactions", "#", "群发提醒", "mass-send", GadgetTitle, "r")).on("click", function (e) {
                    e.preventDefault();
                    windowManager.openWindow(MassSendDialog);
                    $body.css("overflow", "auto");
                });
                return [2];
        }
    });
}); })(); });
