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
$(function () { return (function () { return __awaiter(void 0, void 0, void 0, function () {
    var title_1, $body_1, section, DoSEWindow, windowManager_1, DoSEDialog_1;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4, mw.loader.using(["mediawiki.api", "mediawiki.util", "mediawiki.notification", "oojs-ui"])];
            case 1:
                _a.sent();
                if (mw.config.get("wgAction") === "edit") {
                    title_1 = mw.config.get("wgPageName");
                    $body_1 = $("body");
                    section = location.href.replace(/.*&section=(\d+).*/g, "$1");
                    if (isNaN(section)) {
                        section = "";
                    }
                    DoSEWindow = (function (_super) {
                        __extends(DoSEWindow, _super);
                        function DoSEWindow(config) {
                            return _super.call(this, config) || this;
                        }
                        DoSEWindow.prototype.initialize = function () {
                            _super.prototype.initialize.call(this);
                            this.panelLayout = new OO.ui.PanelLayout({
                                scrollable: false,
                                expanded: false,
                                padded: true
                            });
                            this.panelLayout.$element.append($('<p style="text-align:center;font-size:1.2em">确认要狂暴鸿儒萌百娘吗？</p>'));
                            this.$body.append(this.panelLayout.$element);
                        };
                        DoSEWindow.prototype.getActionProcess = function (action) {
                            var _this = this;
                            if (action === "cancel") {
                                return new OO.ui.Process(function () {
                                    _this.close({ action: action });
                                }, this);
                            }
                            else if (action === "submit") {
                                var text_1 = $("#wpTextbox1").val();
                                var summary_1 = $("#wpSummary").val();
                                var attempts_1 = 1;
                                return new OO.ui.Process($.when((function () { return __awaiter(_this, void 0, void 0, function () {
                                    var e_1;
                                    return __generator(this, function (_a) {
                                        switch (_a.label) {
                                            case 0:
                                                _a.trys.push([0, 2, , 3]);
                                                return [4, new mw.Api().postWithToken("csrf", {
                                                        format: "json",
                                                        action: "edit",
                                                        minor: true,
                                                        summary: summary_1,
                                                        title: title_1,
                                                        text: text_1
                                                    })
                                                        .done(function () {
                                                        oouiDialog.alert("\u53D1\u9001\u6210\u529F\uFF01\u5408\u8BA1\u5C1D\u8BD5".concat(attempts_1, "\u6B21\u3002"));
                                                    })
                                                        .fail(function () {
                                                        attempts_1++;
                                                    })];
                                            case 1:
                                                _a.sent();
                                                this.close({ action: action });
                                                return [3, 3];
                                            case 2:
                                                e_1 = _a.sent();
                                                console.error("OOUI error:", e_1);
                                                throw new OO.ui.Error(e_1);
                                            case 3: return [2];
                                        }
                                    });
                                }); })()).promise(), this);
                            }
                            return _super.prototype.getActionProcess.call(this, action);
                        };
                        DoSEWindow.static = __assign(__assign({}, _super.static), { tagName: "div", name: "lr-masssned", title: "确认编辑", actions: [
                                {
                                    action: "cancel",
                                    label: "取消",
                                    flags: ["safe", "close", "destructive"]
                                },
                                {
                                    action: "submit",
                                    label: "编辑",
                                    flags: ["primary", "progressive"]
                                },
                            ] });
                        return DoSEWindow;
                    }(OO.ui.ProcessDialog));
                    windowManager_1 = new OO.ui.WindowManager();
                    $body_1.append(windowManager_1.$element);
                    DoSEDialog_1 = new DoSEWindow({
                        size: "small"
                    });
                    windowManager_1.addWindows([DoSEDialog_1]);
                    $(mw.util.addPortletLink("p-cactions", "#", "狂暴鸿儒", "mass-send", "狂暴鸿儒", "r")).on("click", function (e) {
                        e.preventDefault();
                        windowManager_1.openWindow(DoSEDialog_1);
                        $body_1.css("overflow", "auto");
                    });
                }
                return [2];
        }
    });
}); })(); });
