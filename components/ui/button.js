"use strict";
// AMEXAN Universal Button Component
// Constitutional Principle: Every component has variants, sizes, states, and accessibility
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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Button = void 0;
var react_1 = require("react");
var colors_1 = require("@/lib/design/tokens/colors");
var typography_1 = require("@/lib/design/tokens/typography");
var spacing_1 = require("@/lib/design/tokens/spacing");
var index_1 = require("@/lib/design/tokens/index");
exports.Button = react_1.default.forwardRef(function (_a, ref) {
    var _b = _a.variant, variant = _b === void 0 ? 'primary' : _b, _c = _a.size, size = _c === void 0 ? 'md' : _c, _d = _a.loading, loading = _d === void 0 ? false : _d, leftIcon = _a.leftIcon, rightIcon = _a.rightIcon, _e = _a.fullWidth, fullWidth = _e === void 0 ? false : _e, disabled = _a.disabled, onClick = _a.onClick, _f = _a.className, className = _f === void 0 ? '' : _f, children = _a.children, props = __rest(_a, ["variant", "size", "loading", "leftIcon", "rightIcon", "fullWidth", "disabled", "onClick", "className", "children"]);
    var baseStyles = {
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontWeight: typography_1.typographyTokens.label.fontWeight,
        transition: 'all 150ms ease-out',
        border: '1px solid transparent',
        cursor: disabled ? 'default-cursor' : 'pointer',
        opacity: disabled ? 0.5 : 1,
        width: fullWidth ? '100%' : 'auto',
    };
    var variantStyles = {
        primary: {
            backgroundColor: colors_1.colorTokens.primary.DEFAULT,
            color: colors_1.colorTokens.primary.contrast,
            borderColor: colors_1.colorTokens.primary.DEFAULT,
            '&:hover': {
                backgroundColor: colors_1.colorTokens.primary.hover,
                borderColor: colors_1.colorTokens.primary.hover,
            },
        },
        secondary: {
            backgroundColor: colors_1.colorTokens.secondary.DEFAULT,
            color: colors_1.colorTokens.secondary.text,
            borderColor: colors_1.colorTokens.secondary.DEFAULT,
            '&:hover': {
                backgroundColor: colors_1.colorTokens.secondary.hover,
                borderColor: colors_1.colorTokens.secondary.border,
            },
        },
        outline: {
            backgroundColor: 'transparent',
            color: colors_1.colorTokens.primary.DEFAULT,
            borderColor: colors_1.colorTokens.primary.DEFAULT,
            '&:hover': {
                backgroundColor: colors_1.colorTokens.primary.surface,
            },
        },
        ghost: {
            backgroundColor: 'transparent',
            color: colors_1.colorTokens.neutral[700],
            borderColor: 'transparent',
            '&:hover': {
                backgroundColor: colors_1.colorTokens.neutral[100],
            },
        },
        danger: {
            backgroundColor: colors_1.colorTokens.danger.DEFAULT,
            color: colors_1.colorTokens.danger.contrast,
            borderColor: colors_1.colorTokens.danger.DEFAULT,
            '&:hover': {
                backgroundColor: colors_1.colorTokens.danger.hover,
                borderColor: colors_1.colorTokens.danger.hover,
            },
        },
        success: {
            backgroundColor: colors_1.colorTokens.success.DEFAULT,
            color: colors_1.colorTokens.success.contrast,
            borderColor: colors_1.colorTokens.success.DEFAULT,
            '&:hover': {
                backgroundColor: colors_1.colorTokens.success.hover,
                borderColor: colors_1.colorTokens.success.hover,
            },
        },
    };
    var sizeStyles = {
        xs: {
            padding: "".concat(spacing_1.spacingTokens[1], " ").concat(spacing_1.spacingTokens[2]),
            fontSize: typography_1.typographyTokens.caption.fontSize,
            lineHeight: typography_1.typographyTokens.caption.lineHeight,
            borderRadius: index_1.radiusTokens.small,
        },
        sm: {
            padding: "".concat(spacing_1.spacingTokens[2], " ").concat(spacing_1.spacingTokens[3]),
            fontSize: typography_1.typographyTokens.bodySmall.fontSize,
            lineHeight: typography_1.typographyTokens.bodySmall.lineHeight,
            borderRadius: index_1.radiusTokens.medium,
        },
        md: {
            padding: "".concat(spacing_1.spacingTokens[3], " ").concat(spacing_1.spacingTokens[4]),
            fontSize: typography_1.typographyTokens.body.fontSize,
            lineHeight: typography_1.typographyTokens.body.lineHeight,
            borderRadius: index_1.radiusTokens.medium,
        },
        lg: {
            padding: "".concat(spacing_1.spacingTokens[4], " ").concat(spacing_1.spacingTokens[6]),
            fontSize: typography_1.typographyTokens.bodyLarge.fontSize,
            lineHeight: typography_1.typographyTokens.bodyLarge.lineHeight,
            borderRadius: index_1.radiusTokens.large,
        },
        xl: {
            padding: "".concat(spacing_1.spacingTokens[5], " ").concat(spacing_1.spacingTokens[7]),
            fontSize: typography_1.typographyTokens.h4.fontSize,
            lineHeight: typography_1.typographyTokens.h4.lineHeight,
            borderRadius: index_1.radiusTokens.large,
        },
    };
    var combinedStyles = __assign(__assign(__assign({}, baseStyles), variantStyles[variant]), sizeStyles[size]);
    var handleClick = function (e) {
        if (disabled || loading)
            return;
        onClick === null || onClick === void 0 ? void 0 : onClick(e);
    };
    return (<button ref={ref} style={combinedStyles} disabled={disabled || loading} onClick={handleClick} className={"amexan-button ".concat(variant, " ").concat(size, " ").concat(className)} aria-busy={loading} {...props}>
        {loading ? (<span className="amexan-button__loading">
            <svg className="amexan-button__spinner" viewBox="0 0 24 24" width="16" height="16">
              <circle cx="12" cy="12" r="10" fill="none" strokeWidth="2"></circle>
            </svg>
          </span>) : null}
        {leftIcon && !loading && <span className="amexan-button__left-icon">{leftIcon}</span>}
        <span className="amexan-button__content">{children}</span>
        {rightIcon && !loading && <span className="amexan-button__right-icon">{rightIcon}</span>}
      </button>);
});
exports.Button.displayName = 'Button';
exports.default = exports.Button;
