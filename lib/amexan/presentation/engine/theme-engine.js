"use strict";
// AMEXAN Theme Engine - React Context
// Constitutional Principle: Theme is never CSS. Theme is data.
Object.defineProperty(exports, "__esModule", { value: true });
exports.useTheme = exports.ThemeProvider = void 0;
var react_1 = require("react");
var theme_engine_1 = require("@/lib/design/theme-engine");
var ThemeContext = (0, react_1.createContext)(undefined);
var ThemeProvider = function (_a) {
    var children = _a.children, _b = _a.defaultTheme, defaultTheme = _b === void 0 ? 'clinical' : _b;
    var _c = (0, react_1.useState)((0, theme_engine_1.getTheme)(defaultTheme)), theme = _c[0], setThemeState = _c[1];
    (0, react_1.useEffect)(function () {
        // Check for saved theme preference
        var savedTheme = localStorage.getItem('amexan-theme');
        if (savedTheme && theme_engine_1.themes[savedTheme]) {
            setThemeState((0, theme_engine_1.getTheme)(savedTheme));
        }
        else {
            setThemeState((0, theme_engine_1.getTheme)(defaultTheme));
        }
    }, [defaultTheme]);
    // Apply CSS variables for theme tokens
    (0, react_1.useEffect)(function () {
        if (typeof document !== 'undefined') {
            var root_1 = document.documentElement;
            // Apply color tokens
            Object.entries(theme.colors.primary).forEach(function (_a) {
                var key = _a[0], value = _a[1];
                root_1.style.setProperty("--color-primary".concat(key === 'DEFAULT' ? '' : "-".concat(key.toLowerCase())), value);
            });
            // Apply spacing tokens
            Object.entries(theme.spacing).forEach(function (_a) {
                var key = _a[0], value = _a[1];
                root_1.style.setProperty("--space-".concat(key), "".concat(value, "px"));
            });
            // Apply breakpoint tokens
            Object.entries(theme.breakpoints).forEach(function (_a) {
                var key = _a[0], value = _a[1];
                root_1.style.setProperty("--breakpoint-".concat(key), "".concat(value.min, "px"));
            });
            // Apply theme class
            root_1.setAttribute('data-theme', theme.id);
        }
    }, [theme]);
    var setTheme = function (themeId) {
        var newTheme = (0, theme_engine_1.getTheme)(themeId);
        setThemeState(newTheme);
        localStorage.setItem('amexan-theme', themeId);
    };
    return (<ThemeContext.Provider value={{ theme: theme, setTheme: setTheme, availableThemes: theme_engine_1.themes }}>
      {children}
    </ThemeContext.Provider>);
};
exports.ThemeProvider = ThemeProvider;
var useTheme = function () {
    var context = (0, react_1.useContext)(ThemeContext);
    if (!context) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
};
exports.useTheme = useTheme;
exports.default = exports.ThemeProvider;
