// AMEXAN COS — Shared stylesheet (Inter font, sky/white clinical theme)

export const COS_CSS = `
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=Noto+Sans:wght@400;500;600;700&family=Noto+Sans+SC:wght@400;500;700&family=Noto+Sans+JP:wght@400;500;700&family=Noto+Sans+Arabic:wght@400;600;700&family=Noto+Serif+Devanagari:wght@400;600;700&family=Noto+Serif+Ethiopic:wght@400;600;700&display=swap');
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
:root{
  --sky-50:#f0f9ff;--sky-100:#e0f2fe;--sky-200:#bae6fd;--sky-300:#7dd3fc;
  --sky-400:#38bdf8;--sky-500:#0ea5e9;--sky-600:#0284c7;--sky-700:#0369a1;
  --sky-800:#075985;--sky-900:#0c4a6e;
  --white:#ffffff;--f-50:#fafafa;--f-100:#f5f5f5;--f-200:#e5e5e5;
  --f-300:#d4d4d4;--f-400:#a3a3a3;--f-500:#737373;--f-600:#525252;
  --green:#10b981;--green-bg:#d1fae5;--green-text:#065f46;
  --amber:#f59e0b;--amber-bg:#fef3c7;--amber-text:#92400e;
  --red:#ef4444;--red-bg:#fee2e2;--red-text:#991b1b;
  --blue:#3b82f6;--blue-bg:#dbeafe;--blue-text:#1e40af;
  --purple:#8b5cf6;--purple-bg:#ede9fe;--purple-text:#5b21b6;
  --font:'Inter','Noto Sans','Noto Sans SC','Noto Sans JP','Noto Sans Arabic','Noto Serif Devanagari','Noto Serif Ethiopic',sans-serif;
  --r:12px;--r-sm:8px;--r-lg:20px;
  --sh:0 1px 3px rgba(0,0,0,.04);--sh-md:0 4px 16px rgba(0,0,0,.06);--sh-lg:0 12px 40px rgba(0,0,0,.08);
}
body{font-family:'Inter','Noto Sans',sans-serif;background:var(--f-50);color:#0f172a;-webkit-font-smoothing:antialiased}
@keyframes cos-pulse{0%,100%{opacity:1;box-shadow:0 0 0 0 rgba(52,211,153,.4)}50%{opacity:.6;box-shadow:0 0 0 6px rgba(52,211,153,0)}}
@keyframes cos-fade{from{opacity:0}to{opacity:1}}
@keyframes cos-up{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}
@keyframes cos-shimmer{0%{background-position:-200px 0}100%{background-position:200px 0}}

.cos-layout{display:flex;min-height:100vh;background:var(--f-50)}
.cos-sidebar{width:236px;background:var(--white);border-right:1px solid var(--f-200);padding:18px 0;display:flex;flex-direction:column;position:sticky;top:0;height:100vh;flex-shrink:0;z-index:40}
.cos-brand{padding:0 18px 14px;border-bottom:1px solid var(--f-200);margin-bottom:10px;display:flex;align-items:center;gap:8px}
.cos-brand-name{font-size:19px;font-weight:800;color:var(--sky-700);letter-spacing:-.3px}
.cos-brand-badge{background:var(--sky-100);color:var(--sky-600);font-size:9px;padding:2px 6px;border-radius:4px;font-weight:700;text-transform:uppercase;letter-spacing:.3px}
.cos-nav{display:flex;flex-direction:column;gap:1px;padding:0 8px;flex:1;overflow-y:auto}
.cos-nav-section{font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:var(--f-400);padding:12px 10px 4px}
.cos-nav-item{display:flex;align-items:center;gap:10px;padding:9px 12px;border-radius:var(--r-sm);font-size:12px;font-weight:600;color:var(--f-500);cursor:pointer;transition:all .1s;border:none;background:none;text-align:left;width:100%;font-family:'Inter','Noto Sans',sans-serif}
.cos-nav-item:hover{background:var(--sky-50);color:var(--sky-700)}
.cos-nav-item.active{background:var(--sky-100);color:var(--sky-700);font-weight:700}
.cos-nav-item .cos-nav-icon{width:16px;flex-shrink:0;opacity:.7}
.cos-nav-item.active .cos-nav-icon{opacity:1}
.cos-nav-item .cos-badge{margin-left:auto;background:var(--red-bg);color:var(--red-text);font-size:9px;font-weight:700;padding:1px 6px;border-radius:99px;min-width:16px;text-align:center}
.cos-nav-item .cos-badge.green{background:var(--green-bg);color:var(--green-text)}
.cos-nav-item .cos-badge.blue{background:var(--blue-bg);color:var(--blue-text)}
.cos-nav-item .cos-badge.amber{background:var(--amber-bg);color:var(--amber-text)}
.cos-profile{padding:12px 16px;border-top:1px solid var(--f-200);display:flex;align-items:center;gap:10px}
.cos-avatar{width:34px;height:34px;border-radius:10px;background:var(--sky-500);color:var(--white);display:flex;align-items:center;justify-content:center;font-weight:800;font-size:13px;flex-shrink:0}
.cos-profile-info{flex:1;min-width:0}
.cos-profile-name{font-size:12px;font-weight:700;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.cos-profile-role{font-size:10px;color:var(--f-500)}

.cos-main{flex:1;display:flex;flex-direction:column;min-width:0}
.cos-topbar{height:54px;background:var(--white);border-bottom:1px solid var(--f-200);display:flex;align-items:center;justify-content:space-between;padding:0 24px;position:sticky;top:0;z-index:50;gap:12px}
.cos-greeting{font-size:13px;color:var(--f-500);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.cos-greeting strong{color:#0f172a}
.cos-topbar-right{display:flex;align-items:center;gap:10px;flex-shrink:0}
.cos-topbar-btn{width:34px;height:34px;border-radius:9px;border:1.5px solid var(--f-200);background:var(--white);display:flex;align-items:center;justify-content:center;cursor:pointer;position:relative;transition:all .15s}
.cos-topbar-btn:hover{border-color:var(--sky-300);background:var(--sky-50)}
.cos-topbar-btn .cos-notif-dot{position:absolute;top:4px;right:4px;width:8px;height:8px;border-radius:50%;background:var(--red);animation:cos-pulse 1.5s infinite}
.cos-round-badge{display:flex;align-items:center;gap:6px;font-size:11px;font-weight:600;color:var(--green-text);background:var(--green-bg);padding:4px 10px;border-radius:8px}
.cos-round-badge .cos-dot{width:6px;height:6px;border-radius:50%;background:var(--green);animation:cos-pulse 1.5s infinite}
.cos-search{flex:1;max-width:420px;display:flex;align-items:center;gap:8px;border:1.5px solid var(--f-200);border-radius:9px;padding:7px 12px;cursor:pointer;transition:all .15s;background:var(--f-50);margin-left:auto}
.cos-search:hover{border-color:var(--sky-300);background:var(--white)}
.cos-search-placeholder{font-size:12px;color:var(--f-400);flex:1}
.cos-search-kbd{font-size:9px;font-weight:700;color:var(--f-500);background:var(--f-100);padding:2px 6px;border-radius:4px;border:1px solid var(--f-200)}

.cos-content{padding:20px 24px 48px;flex:1;max-width:1440px;width:100%;margin:0 auto;animation:cos-fade .25s}

.cos-ctx-bar{background:var(--white);border-bottom:1px solid var(--f-200);padding:8px 24px;display:flex;align-items:center;gap:10px;flex-wrap:wrap;font-size:11px;color:var(--f-500);position:sticky;top:54px;z-index:40}
.cos-ctx-item{display:flex;align-items:center;gap:6px;white-space:nowrap}
.cos-ctx-sep{width:1px;height:14px;background:var(--f-200)}
.cos-ctx-item strong{color:#0f172a;font-weight:700}
.cos-ctx-pill{font-size:9px;font-weight:700;padding:2px 8px;border-radius:99px}
.cos-ctx-pill.on{background:var(--green-bg);color:var(--green-text)}
.cos-ctx-pill.shift{background:var(--sky-100);color:var(--sky-700)}

.cos-stats-row{display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:10px;margin-bottom:18px}
.cos-stat-card{background:var(--white);border:1px solid var(--f-200);border-radius:var(--r);padding:14px 16px;display:flex;align-items:center;gap:12px;cursor:pointer;transition:all .15s}
.cos-stat-card:hover{border-color:var(--sky-300);box-shadow:var(--sh-md)}
.cos-stat-icon{width:38px;height:38px;border-radius:10px;display:flex;align-items:center;justify-content:center;flex-shrink:0}
.cos-stat-icon.sky{background:var(--sky-50);color:var(--sky-600)}
.cos-stat-icon.green{background:var(--green-bg);color:var(--green-text)}
.cos-stat-icon.amber{background:var(--amber-bg);color:var(--amber-text)}
.cos-stat-icon.red{background:var(--red-bg);color:var(--red-text)}
.cos-stat-num{font-size:24px;font-weight:800;line-height:1}
.cos-stat-label{font-size:10px;color:var(--f-500);margin-top:3px}

.cos-section-title{font-size:15px;font-weight:800;color:var(--sky-800);display:flex;align-items:center;gap:8px;margin-bottom:4px}
.cos-section-sub{font-size:11px;color:var(--f-500);margin-bottom:14px}
.cos-card{background:var(--white);border:1px solid var(--f-200);border-radius:var(--r);padding:16px;margin-bottom:14px}
.cos-card-title{font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.5px;color:var(--f-500);margin-bottom:10px;display:flex;align-items:center;gap:6px}

.cos-grid-2{display:grid;grid-template-columns:1fr 1fr;gap:14px}
@media(max-width:980px){.cos-grid-2{grid-template-columns:1fr}}
.cos-grid-3{display:grid;grid-template-columns:repeat(3,1fr);gap:14px}
@media(max-width:1080px){.cos-grid-3{grid-template-columns:1fr 1fr}}
@media(max-width:720px){.cos-grid-3{grid-template-columns:1fr}}

.cos-btn{display:inline-flex;align-items:center;gap:6px;padding:8px 14px;border-radius:var(--r-sm);font-size:12px;font-weight:600;border:1.5px solid var(--f-200);background:var(--white);cursor:pointer;transition:all .15s;font-family:'Inter','Noto Sans',sans-serif}
.cos-btn:hover{border-color:var(--sky-300);background:var(--sky-50);box-shadow:var(--sh)}
.cos-btn.primary{background:var(--sky-500);color:var(--white);border-color:var(--sky-500)}
.cos-btn.primary:hover{background:var(--sky-600)}
.cos-btn.green{background:var(--green);color:var(--white);border-color:var(--green)}
.cos-btn.green:hover{background:#059669}
.cos-btn.ghost{background:var(--f-50);border-color:var(--f-200)}
.cos-btn.danger{background:var(--red-bg);color:var(--red-text);border-color:var(--red-bg)}
.cos-btn.danger:hover{background:var(--red);color:var(--white)}
.cos-btn:disabled{opacity:.5;cursor:not-allowed}

.cos-pill{display:inline-flex;align-items:center;gap:4px;font-size:9px;font-weight:700;padding:2px 8px;border-radius:99px;text-transform:uppercase;letter-spacing:.3px}
.cos-pill.red{background:var(--red-bg);color:var(--red-text)}
.cos-pill.green{background:var(--green-bg);color:var(--green-text)}
.cos-pill.amber{background:var(--amber-bg);color:var(--amber-text)}
.cos-pill.blue{background:var(--blue-bg);color:var(--blue-text)}
.cos-pill.purple{background:var(--purple-bg);color:var(--purple-text)}
.cos-pill.gray{background:var(--f-100);color:var(--f-500)}

.cos-chip{display:inline-flex;align-items:center;gap:5px;padding:5px 12px;border-radius:6px;font-size:11px;font-weight:600;background:var(--f-100);color:var(--f-500);cursor:pointer;border:1px solid var(--f-200);transition:all .1s;font-family:'Inter','Noto Sans',sans-serif}
.cos-chip:hover{border-color:var(--sky-300);color:var(--sky-600)}
.cos-chip.active{background:var(--sky-500);color:var(--white);border-color:var(--sky-500)}
.cos-chip-row{display:flex;gap:6px;flex-wrap:wrap;margin-bottom:14px}

.cos-empty{background:var(--white);border:1px solid var(--f-200);border-radius:var(--r-lg);padding:44px;text-align:center}
.cos-empty-title{font-size:16px;font-weight:700;color:var(--sky-700);margin:10px 0 4px}
.cos-empty-text{font-size:12px;color:var(--f-500);max-width:420px;margin:0 auto 18px;line-height:1.6}

.cos-modal-overlay{position:fixed;inset:0;background:rgba(15,23,42,.45);z-index:200;display:flex;align-items:center;justify-content:center;animation:cos-fade .2s}
.cos-modal-box{background:var(--white);border-radius:var(--r-lg);padding:24px;max-width:560px;width:92%;box-shadow:var(--sh-lg);max-height:86vh;overflow-y:auto;animation:cos-up .25s}
.cos-modal-box h2{font-size:17px;font-weight:800;color:var(--sky-800);display:flex;align-items:center;gap:8px;margin-bottom:6px}
.cos-modal-box .sub{font-size:11px;color:var(--f-500);margin-bottom:16px}

.cos-field{margin-bottom:12px}
.cos-field label{display:block;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.4px;color:var(--f-500);margin-bottom:5px}
.cos-input,.cos-textarea,.cos-select{width:100%;padding:9px 12px;border:1.5px solid var(--f-200);border-radius:var(--r-sm);font-size:12px;font-family:'Inter','Noto Sans',sans-serif;outline:none;transition:border-color .15s;background:var(--white);color:#0f172a}
.cos-input:focus,.cos-textarea:focus,.cos-select:focus{border-color:var(--sky-400)}
.cos-textarea{min-height:80px;resize:vertical;line-height:1.6}

.cos-toast-wrap{position:fixed;bottom:20px;right:20px;z-index:300;display:flex;flex-direction:column;gap:8px}
.cos-toast{background:#0f172a;color:var(--white);font-size:12px;font-weight:600;padding:11px 16px;border-radius:10px;box-shadow:var(--sh-lg);display:flex;align-items:center;gap:8px;animation:cos-up .25s}
.cos-toast.ok{background:var(--green-text)}
.cos-toast.err{background:var(--red-text)}

.cos-denied-note{display:flex;align-items:center;gap:8px;font-size:11px;color:var(--red-text);background:var(--red-bg);padding:8px 12px;border-radius:var(--r-sm);margin-top:8px}
`;