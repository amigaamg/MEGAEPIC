"use strict";
// AMEXAN Theme Context - Backward-compatible re-export
// Constitutional Principle: Theme is never CSS. Theme is data.
// Single source of truth lives in ./theme-engine (React context) backed by @/lib/design/theme-engine (data).
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = exports.useTheme = exports.ThemeProvider = void 0;
var theme_engine_1 = require("./theme-engine");
Object.defineProperty(exports, "ThemeProvider", { enumerable: true, get: function () { return theme_engine_1.ThemeProvider; } });
Object.defineProperty(exports, "useTheme", { enumerable: true, get: function () { return theme_engine_1.useTheme; } });
var theme_engine_2 = require("./theme-engine");
Object.defineProperty(exports, "default", { enumerable: true, get: function () { return theme_engine_2.default; } });
