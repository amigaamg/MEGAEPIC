"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = Footer;
// AMEXAN Universal Footer Component
var react_1 = require("react");
var colors_1 = require("@/lib/design/tokens/colors");
var spacing_1 = require("@/lib/design/tokens/spacing");
var index_1 = require("@/lib/design/tokens/index");
var config_1 = require("./config");
var lucide_react_1 = require("lucide-react");
function Footer(_a) {
    var year = _a.year;
    return (<footer style={{
            background: colors_1.colorTokens.neutral[900],
            color: colors_1.colorTokens.neutral[400],
            paddingTop: spacing_1.spacingTokens[8],
            paddingBottom: spacing_1.spacingTokens[8],
        }}>
      <div style={{
            maxWidth: '1200px',
            margin: '0 auto',
            padding: "0 ".concat(spacing_1.spacingTokens[4]),
        }}>
        {/* Main Grid */}
        <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: spacing_1.spacingTokens[8],
            marginBottom: spacing_1.spacingTokens[8],
        }}>
          {/* Brand Column */}
          <div>
            <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: spacing_1.spacingTokens[3],
            marginBottom: spacing_1.spacingTokens[4]
        }}>
              <div style={{
            width: 32,
            height: 32,
            borderRadius: index_1.radiusTokens.small,
            background: colors_1.colorTokens.primary.DEFAULT,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: colors_1.colorTokens.primary.contrast,
            fontWeight: 700,
            fontSize: 16,
        }}>
                AM
              </div>
              <div>
                <div style={{
            fontSize: 18,
            fontWeight: 700,
            color: colors_1.colorTokens.neutral[50]
        }}>
                  AMEXAN
                </div>
                <div style={{
            fontSize: 11,
            color: colors_1.colorTokens.neutral[500]
        }}>
                  Clinical Operating System
                </div>
              </div>
            </div>
            <p style={{
            fontSize: 13,
            lineHeight: 1.6,
            color: colors_1.colorTokens.neutral[400],
            marginBottom: spacing_1.spacingTokens[4],
        }}>
              The International Clinical Operating System.
              Connecting every patient, clinician, facility, and healthcare service through one intelligent platform.
            </p>
            <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: spacing_1.spacingTokens[3],
            fontSize: 13,
            color: colors_1.colorTokens.neutral[400]
        }}>
              <lucide_react_1.MapPin size={14}/>
              <span>Kenya • Global</span>
            </div>
          </div>

          {/* Footer Columns */}
          {config_1.FOOTER_COLUMNS.map(function (column) { return (<div key={column.title}>
              <h3 style={{
                fontSize: 14,
                fontWeight: 600,
                color: colors_1.colorTokens.neutral[200],
                marginBottom: spacing_1.spacingTokens[3],
            }}>
                {column.title}
              </h3>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                {column.links.map(function (link) { return (<li key={link}>
                    <a href="#" style={{
                    display: 'block',
                    padding: "".concat(spacing_1.spacingTokens[1], " 0"),
                    fontSize: 13,
                    color: colors_1.colorTokens.neutral[400],
                    textDecoration: 'none',
                    transition: 'color 150ms ease',
                }} onMouseEnter={function (e) {
                    e.currentTarget.style.color = colors_1.colorTokens.neutral[200];
                }} onMouseLeave={function (e) {
                    e.currentTarget.style.color = colors_1.colorTokens.neutral[400];
                }}>
                      {link}
                    </a>
                  </li>); })}
              </ul>
            </div>); })}
        </div>

        {/* Trust Logos */}
        <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: "".concat(spacing_1.spacingTokens[2], " ").concat(spacing_1.spacingTokens[3]),
            marginBottom: spacing_1.spacingTokens[6],
        }}>
          {config_1.TRUST_LOGOS.map(function (logo) { return (<span key={logo} style={{
                fontSize: 11,
                fontWeight: 500,
                padding: "".concat(spacing_1.spacingTokens[1], " ").concat(spacing_1.spacingTokens[3]),
                borderRadius: index_1.radiusTokens.pill,
                background: colors_1.colorTokens.neutral[800],
                color: colors_1.colorTokens.neutral[500],
                border: "1px solid ".concat(colors_1.colorTokens.neutral[700]),
            }}>
              {logo}
            </span>); })}
        </div>

        {/* Contact Info */}
        <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: spacing_1.spacingTokens[4],
            fontSize: 13,
            color: colors_1.colorTokens.neutral[400],
            flexWrap: 'wrap',
            paddingTop: spacing_1.spacingTokens[4],
            borderTop: "1px solid ".concat(colors_1.colorTokens.neutral[800]),
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: spacing_1.spacingTokens[2] }}>
            <lucide_react_1.Mail size={14}/>
            <span>contact@amexan.health</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: spacing_1.spacingTokens[2] }}>
            <lucide_react_1.Globe size={14}/>
            <span>amexan.health</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: spacing_1.spacingTokens[2] }}>
            <lucide_react_1.Phone size={14}/>
            <span>+254 20 000 0000</span>
          </div>
          <div style={{ marginLeft: 'auto', fontSize: 12, color: colors_1.colorTokens.neutral[600] }}>
            © {year} AMEXAN. All rights reserved.
          </div>
        </div>
      </div>
    </footer>);
}
