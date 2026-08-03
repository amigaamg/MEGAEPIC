"use client";
"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = Hero;
var link_1 = require("next/link");
var theme_engine_1 = require("../../lib/amexan/presentation/engine/theme-engine");
var typography_1 = require("@/lib/design/tokens/typography");
var spacing_1 = require("@/lib/design/tokens/spacing");
var index_1 = require("@/lib/design/tokens/index");
var STATS = [
    { value: '2,500', label: 'Clinicians' },
    { value: '500', label: 'Hospitals' },
    { value: '200M', label: 'Patients Served' },
    { value: '150', label: 'Countries' },
];
function Hero() {
    var theme = (0, theme_engine_1.useTheme)().theme;
    return (<div style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: "linear-gradient(135deg, ".concat(theme.colors.primary.DEFAULT, ", ").concat(theme.colors.neutral[900], ")"),
            color: theme.colors.primary.contrast,
            overflow: 'hidden',
            padding: "".concat(spacing_1.spacingTokens[8], " ").concat(spacing_1.spacingTokens[4]),
        }}>
      <div style={{ position: 'relative', zIndex: 10, maxWidth: 1200, margin: '0 auto', textAlign: 'center' }}>
        <h1 style={__assign(__assign({}, typography_1.typographyTokens.display), { color: '#FFFFFF', marginBottom: spacing_1.spacingTokens[4] })}>
          The Clinical Intelligence Platform for{' '}
          <span style={{
            background: "linear-gradient(90deg, ".concat(theme.colors.accent.DEFAULT, ", ").concat(theme.colors.primary.hover, ")"),
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
        }}>
            Modern Healthcare
          </span>
        </h1>

        <p style={__assign(__assign({}, typography_1.typographyTokens.bodyLarge), { color: 'rgba(255,255,255,0.8)', maxWidth: 720, margin: '0 auto', marginBottom: spacing_1.spacingTokens[6], lineHeight: 1.7 })}>
          One intelligent ecosystem connecting clinicians, patients, hospitals, researchers, educators and
          healthcare organizations through evidence-based clinical intelligence.
        </p>

        <div style={{
            display: 'flex',
            gap: spacing_1.spacingTokens[4],
            justifyContent: 'center',
            flexWrap: 'wrap',
            marginBottom: spacing_1.spacingTokens[8],
        }}>
          <link_1.default href="/register" style={{
            padding: "".concat(spacing_1.spacingTokens[3], " ").concat(spacing_1.spacingTokens[6]),
            background: theme.colors.primary.contrast,
            color: theme.colors.primary.DEFAULT,
            fontWeight: 600,
            borderRadius: index_1.radiusTokens.medium,
            textDecoration: 'none',
        }}>
            Start Free Trial
          </link_1.default>
          <link_1.default href="/demo" style={{
            padding: "".concat(spacing_1.spacingTokens[3], " ").concat(spacing_1.spacingTokens[6]),
            background: 'rgba(255,255,255,0.1)',
            color: '#FFFFFF',
            fontWeight: 600,
            borderRadius: index_1.radiusTokens.medium,
            border: "1px solid rgba(255,255,255,0.3)",
            textDecoration: 'none',
        }}>
            Book Demo
          </link_1.default>
        </div>

        <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
            gap: spacing_1.spacingTokens[4],
            maxWidth: 800,
            margin: '0 auto',
        }}>
          {STATS.map(function (s) { return (<div key={s.label} style={{
                background: 'rgba(255,255,255,0.08)',
                backdropFilter: 'blur(8px)',
                borderRadius: index_1.radiusTokens.large,
                padding: spacing_1.spacingTokens[5],
                border: '1px solid rgba(255,255,255,0.15)',
            }}>
              <div style={{ fontSize: 28, fontWeight: 700, color: '#FFFFFF' }}>{s.value}</div>
              <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.7)' }}>{s.label}</div>
            </div>); })}
        </div>
      </div>
    </div>);
}
