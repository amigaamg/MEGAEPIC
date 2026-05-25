"use client";
import { useState, useEffect, useCallback } from "react";
import Link from "next/link";

type Theme = "forest" | "midnight" | "ivory" | "slate";

const THEMES: Record<Theme, { label: string; icon: string }> = {
  forest: { label: "Forest", icon: "🌿" },
  midnight: { label: "Midnight", icon: "🌙" },
  ivory: { label: "Ivory", icon: "🕊" },
  slate: { label: "Slate", icon: "◇" },
};

const CSS = (theme: Theme) => {
  const palettes: Record<Theme, string> = {
    forest: `
      --cream:#F8F6F2; --cream2:#F0EDE6;
      --green:#0F766E; --green2:#0B5E58; --green-soft:#E8F2F1;
      --amber:#C8791A; --amber-soft:#FDF3E3; --amber-mid:#F0BC6E;
      --text:#0F172A; --text2:#475569; --text3:#94A3B8;
      --border:rgba(15,23,42,.06); --border2:rgba(15,23,42,.1);
      --white:#FFFFFF; --bg:#F8F6F2; --bg2:#F0EDE6;
      --accent:#0F766E; --accent2:#0B5E58; --accent3:#14A89D;
      --glow:rgba(15,118,110,.18); --glow2:rgba(15,118,110,.1);
      --tag-bg:#E8F2F1; --tag-bd:rgba(15,118,110,.18);
    `,
    midnight: `
      --cream:#F8FAFC; --cream2:#E2E8F0;
      --green:#1E293B; --green2:#334155; --green3:#3B82F6;
      --green-soft:#1E293B; --green-mid:#334155;
      --amber:#38BDF8; --amber-soft:#0F172A; --amber-mid:#7DD3FC;
      --text:#F1F5F9; --text2:#94A3B8; --text3:#64748B;
      --border:rgba(255,255,255,.08); --border2:rgba(255,255,255,.14);
      --white:#1E293B; --bg:#0F172A; --bg2:#1E293B;
      --accent:#3B82F6; --accent2:#2563EB; --accent3:#60A5FA;
      --glow:rgba(59,130,246,.35); --glow2:rgba(59,130,246,.15);
      --tag-bg:rgba(59,130,246,.12); --tag-bd:rgba(59,130,246,.25);
    `,
    ivory: `
      --cream:#FFFDF7; --cream2:#F5F0E8;
      --green:#1A3C34; --green2:#2D5A4E; --green3:#E07A5F;
      --green-soft:#F0EDE6; --green-mid:#D4CFC4;
      --amber:#E07A5F; --amber-soft:#FDF0EB; --amber-mid:#F0A88E;
      --text:#1A1A2E; --text2:#5C5C6E; --text3:#9C9CAE;
      --border:rgba(26,60,52,.08); --border2:rgba(26,60,52,.14);
      --white:#FFFFFF; --bg:#FFFDF7; --bg2:#F5F0E8;
      --accent:#E07A5F; --accent2:#C96A50; --accent3:#F0A88E;
      --glow:rgba(224,122,95,.22); --glow2:rgba(224,122,95,.12);
      --tag-bg:#FDF0EB; --tag-bd:#F0A88E;
    `,
    slate: `
      --cream:#F1F5F9; --cream2:#E2E8F0;
      --green:#1E293B; --green2:#334155; --green3:#6366F1;
      --green-soft:#1E293B; --green-mid:#334155;
      --amber:#6366F1; --amber-soft:#EEF2FF; --amber-mid:#A5B4FC;
      --text:#0F172A; --text2:#475569; --text3:#94A3B8;
      --border:rgba(30,41,59,.08); --border2:rgba(30,41,59,.14);
      --white:#FFFFFF; --bg:#F1F5F9; --bg2:#E2E8F0;
      --accent:#6366F1; --accent2:#4F46E5; --accent3:#818CF8;
      --glow:rgba(99,102,241,.22); --glow2:rgba(99,102,241,.12);
      --tag-bg:#EEF2FF; --tag-bd:#A5B4FC;
    `,
  };
  return `
    @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,300;0,9..144,500;0,9..144,700;1,9..144,300;1,9..144,500;1,9..144,700&family=Plus+Jakarta+Sans:wght@300;400;500;600&display=swap');

    :root { ${palettes[theme]} }

    *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
    html{scroll-behavior:smooth}
    body{
      font-family:'Plus Jakarta Sans',sans-serif;
      background:var(--bg);color:var(--text);
      overflow-x:hidden;line-height:1.6;
      transition:background .5s,color .5s;
    }
    body::before{
      content:'';position:fixed;inset:0;z-index:0;pointer-events:none;
      background-image:radial-gradient(circle,rgba(0,0,0,.04) 1px,transparent 1px);
      background-size:32px 32px;
    }
    #cursor{
      position:fixed;width:12px;height:12px;border-radius:50%;
      background:var(--accent3);pointer-events:none;z-index:9999;
      transform:translate(-50%,-50%);
      transition:transform .15s,width .2s,height .2s,background .2s;
      mix-blend-mode:multiply;
    }
    #cursor.big{width:32px;height:32px;background:var(--amber);opacity:.5}

    .page{position:relative;z-index:1}

    nav{
      position:fixed;top:0;left:0;right:0;z-index:500;
      padding:0 5%;height:76px;
      display:flex;align-items:center;justify-content:space-between;
      transition:background .4s,border-color .4s,box-shadow .4s;
      border-bottom:1px solid transparent;
    }
    nav.scrolled{
      background:rgba(from var(--bg) r g b / .94);
      border-color:var(--border);
      backdrop-filter:blur(16px);-webkit-backdrop-filter:blur(16px);
      box-shadow:0 4px 32px rgba(0,0,0,.06);
    }
    .nav-logo{
      font-family:'Fraunces',serif;font-size:1.625rem;font-weight:700;
      letter-spacing:.06em;color:var(--accent);text-decoration:none;
      display:flex;align-items:center;gap:.5rem;
    }
    .logo-dot{width:8px;height:8px;border-radius:50%;background:var(--amber);flex-shrink:0;animation:throb 2.4s ease-in-out infinite}
    @keyframes throb{0%,100%{transform:scale(1);opacity:1}50%{transform:scale(1.5);opacity:.6}}
    .nav-links{display:flex;align-items:center;gap:2rem}
    .nav-a{font-size:.875rem;font-weight:500;color:var(--text2);text-decoration:none;letter-spacing:.01em;transition:color .2s}
    .nav-a:hover{color:var(--accent)}
    .nav-cta{
      padding:.65rem 1.5rem;border-radius:100px;
      background:var(--accent);color:var(--cream);
      font-size:.875rem;font-weight:600;text-decoration:none;letter-spacing:.01em;
      transition:all .25s;display:flex;align-items:center;gap:.4rem;
    }
    .nav-cta:hover{background:var(--accent2);transform:translateY(-1px);box-shadow:0 8px 24px var(--glow)}
    .hamburger{display:none;flex-direction:column;gap:5px;cursor:pointer;padding:4px;background:none;border:none}
    .hamburger span{width:22px;height:2px;background:var(--accent);border-radius:2px;display:block;transition:.3s}

    .mobile-menu{
      display:none;position:fixed;top:76px;left:0;right:0;z-index:499;
      background:var(--bg);backdrop-filter:blur(16px);
      padding:2rem 5%;border-bottom:1px solid var(--border);
      flex-direction:column;gap:1.5rem;
    }
    .mobile-menu.open{display:flex}
    .mobile-menu .nav-a{font-size:1rem;color:var(--text)}
    .mobile-menu .nav-cta{width:fit-content}

    .theme-btn{
      width:32px;height:32px;border-radius:50%;border:2px solid var(--border2);
      cursor:pointer;transition:all .25s;display:flex;align-items:center;justify-content:center;
      font-size:.75rem;background:var(--bg2);
    }
    .theme-btn:hover{transform:scale(1.15);border-color:var(--accent3)}
    .theme-btn.active{border-color:var(--accent);box-shadow:0 0 12px var(--glow2)}
    .theme-panel{
      position:absolute;top:calc(100% + 8px);right:0;z-index:100;
      background:var(--white);border:1px solid var(--border);
      border-radius:16px;padding:1rem;box-shadow:0 16px 48px rgba(0,0,0,.15);
      display:flex;gap:.5rem;
    }

    .hero{
      min-height:100vh;padding:120px 5% 80px;
      display:grid;grid-template-columns:1fr 1fr;gap:4rem;align-items:center;
      max-width:1320px;margin:0 auto;
    }
    .hero-eyebrow{
      display:inline-flex;align-items:center;gap:.6rem;
      padding:.45rem 1rem;border-radius:100px;
      background:var(--tag-bg);border:1px solid var(--tag-bd);
      font-size:.75rem;font-weight:600;letter-spacing:.12em;text-transform:uppercase;color:var(--accent3);
      margin-bottom:1.75rem;
      opacity:0;animation:riseUp .6s .1s ease forwards;
    }
    .eyebrow-pip{width:6px;height:6px;border-radius:50%;background:var(--accent3);animation:throb 2s infinite}
    .hero-h1{
      font-family:'Fraunces',serif;
      font-size:clamp(2.75rem,5.5vw,4.75rem);
      line-height:1.04;font-weight:700;letter-spacing:-.02em;
      color:var(--accent);margin-bottom:1.5rem;
      opacity:0;animation:riseUp .7s .2s ease forwards;
    }
    .hero-h1 em{font-style:italic;font-weight:300;color:var(--amber)}
    .hero-p{
      font-size:1.0625rem;font-weight:300;color:var(--text2);
      max-width:520px;line-height:1.85;margin-bottom:2.5rem;
      opacity:0;animation:riseUp .7s .3s ease forwards;
    }
    .hero-actions{display:flex;gap:1rem;flex-wrap:wrap;opacity:0;animation:riseUp .7s .4s ease forwards}
    .btn-g{
      display:inline-flex;align-items:center;gap:.5rem;
      padding:.9rem 2rem;border-radius:100px;
      background:var(--accent);color:var(--cream);
      font-size:.9375rem;font-weight:600;text-decoration:none;
      transition:all .25s;border:none;cursor:pointer;
    }
    .btn-g:hover{background:var(--accent2);transform:translateY(-2px);box-shadow:0 12px 36px var(--glow)}
    .btn-o{
      display:inline-flex;align-items:center;gap:.5rem;
      padding:.875rem 1.875rem;border-radius:100px;
      background:transparent;border:1.5px solid var(--border2);
      color:var(--text);font-size:.9375rem;font-weight:500;text-decoration:none;
      transition:all .25s;cursor:pointer;
    }
    .btn-o:hover{background:var(--tag-bg);border-color:var(--tag-bd);transform:translateY(-2px)}
    .arrow{display:inline-block;transition:transform .2s}
    .btn-g:hover .arrow,.btn-o:hover .arrow{transform:translateX(4px)}
    .hero-note{
      margin-top:1.5rem;font-size:.8125rem;color:var(--text3);
      display:flex;align-items:center;gap:1rem;flex-wrap:wrap;
      opacity:0;animation:riseUp .6s .5s ease forwards;
    }
    .hero-note-item{display:flex;align-items:center;gap:.35rem}
    .check{color:var(--accent3);font-size:.75rem}

    .hero-visual{
      display:flex;flex-direction:column;gap:1.25rem;
      opacity:0;animation:slideLeft .9s .5s cubic-bezier(.22,.68,0,1.2) forwards;
    }
    @keyframes slideLeft{from{opacity:0;transform:translateX(48px)}to{opacity:1;transform:translateX(0)}}
    @keyframes riseUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}

    .app-card{
      background:var(--white);border:1px solid var(--border);
      border-radius:24px;padding:1.5rem;
      box-shadow:0 1px 3px rgba(0,0,0,.04);
      transition:transform .3s,box-shadow .3s;
    }
    .app-card:hover{transform:translateY(-2px);box-shadow:0 8px 24px rgba(0,0,0,.06)}
    .card-topline{display:flex;justify-content:space-between;align-items:center;margin-bottom:.75rem}
    .card-tag{
      display:flex;align-items:center;gap:.4rem;
      font-size:.75rem;font-weight:600;letter-spacing:.08em;text-transform:uppercase;
      color:var(--accent3);background:var(--tag-bg);
      padding:.3rem .75rem;border-radius:100px;border:1px solid var(--tag-bd);
    }
    .live-pip{width:5px;height:5px;border-radius:50%;background:var(--accent3);animation:throb 1.6s infinite}
    .card-timestamp{font-size:.75rem;color:var(--text3)}

    .patient-carousel{
      display:flex;gap:.75rem;overflow-x:auto;padding-bottom:.5rem;margin-bottom:.75rem;
      scrollbar-width:thin;scrollbar-color:var(--border) transparent;
    }
    .patient-carousel::-webkit-scrollbar{height:4px}
    .patient-carousel::-webkit-scrollbar-thumb{background:var(--border);border-radius:4px}
    .patient-tab{
      flex-shrink:0;padding:.5rem 1rem;border-radius:100px;
      border:1px solid var(--border);background:var(--bg2);
      font-size:.75rem;font-weight:500;color:var(--text2);
      cursor:pointer;transition:all .2s;white-space:nowrap;
    }
    .patient-tab.active,.patient-tab:hover{background:var(--accent);color:var(--cream);border-color:var(--accent)}
    .patient-tab .emoji{margin-right:.35rem}

    .view-tabs{
      display:flex;gap:0;margin-bottom:1rem;
      background:var(--bg);border-radius:12px;padding:3px;
      border:1px solid var(--border);
    }
    .view-tab{
      flex:1;padding:.4rem .75rem;border-radius:10px;border:none;
      font-size:.6875rem;font-weight:600;letter-spacing:.02em;
      cursor:pointer;transition:all .25s;
      background:transparent;color:var(--text2);
      display:flex;align-items:center;justify-content:center;gap:.35rem;
      white-space:nowrap;
    }
    .view-tab.active{background:var(--white);color:var(--accent);box-shadow:0 2px 8px rgba(0,0,0,.06)}
    .view-tab:hover:not(.active){color:var(--text)}

    .view-content{position:relative;min-height:340px}
    .view-pane{
      position:absolute;inset:0;
      transition:opacity .3s ease,transform .3s ease;
      opacity:0;transform:translateY(8px);pointer-events:none;
      display:flex;flex-direction:column;overflow-y:auto;
      scrollbar-width:thin;scrollbar-color:var(--border) transparent;
    }
    .view-pane::-webkit-scrollbar{width:4px}
    .view-pane::-webkit-scrollbar-thumb{background:var(--border);border-radius:4px}
    .view-pane.active{opacity:1;transform:translateY(0);pointer-events:auto}

    .clin-overview{display:grid;grid-template-columns:1fr 1fr;gap:.75rem;margin-bottom:.75rem}
    .clin-stat{
      background:var(--tag-bg);border:1px solid var(--tag-bd);border-radius:10px;
      padding:.7rem .85rem;overflow:hidden;
    }
    .clin-stat .lbl{font-size:.5625rem;letter-spacing:.08em;text-transform:uppercase;color:var(--text3);margin-bottom:.25rem;white-space:nowrap}
    .clin-stat .val{font-size:.8125rem;font-weight:600;color:var(--text);line-height:1.35;word-break:break-word}
    .clin-stat .val small{font-weight:400;color:var(--text2);font-size:.6875rem}

    .diff-chip{
      display:inline-flex;align-items:center;gap:.35rem;
      background:var(--tag-bg);border:1px solid var(--tag-bd);
      border-radius:100px;padding:.2rem .65rem;
      font-size:.6875rem;font-weight:600;color:var(--accent);
    }
    .diff-chip .pct{color:var(--text3);font-weight:400}

    .hpi-callout{
      padding:.7rem .85rem;background:var(--bg);border-radius:10px;
      margin-bottom:.75rem;border-left:3px solid var(--accent3);
    }
    .hpi-callout-lbl{
      font-size:.5625rem;font-weight:700;letter-spacing:.08em;
      text-transform:uppercase;color:var(--text3);margin-bottom:.3rem;
    }
    .hpi-callout-q{
      font-size:.75rem;line-height:1.65;color:var(--text);
      word-break:break-word;
    }
    .diff-row{display:flex;gap:.4rem;flex-wrap:wrap;margin-bottom:.75rem}

    .vitals-carousel{
      display:flex;gap:.75rem;overflow-x:auto;
      padding-bottom:.5rem;margin-bottom:.75rem;
      scrollbar-width:thin;scrollbar-color:var(--border) transparent;
    }
    .vitals-carousel::-webkit-scrollbar{height:3px}
    .vitals-carousel::-webkit-scrollbar-thumb{background:var(--border);border-radius:4px}

    .vital-chip{
      flex-shrink:0;background:var(--cream);border:1px solid var(--border);
      border-radius:14px;padding:.9rem 1.1rem;min-width:130px;
    }
    .vital-chip .vital-name{font-size:.625rem;letter-spacing:.1em;text-transform:uppercase;color:var(--text3);margin-bottom:.3rem}
    .vital-chip .vital-reading{font-family:'Fraunces',serif;font-size:1.5rem;font-weight:500;color:var(--accent);line-height:1}
    .vital-chip .vital-unit{font-size:.7rem;color:var(--text3);font-family:'Plus Jakarta Sans',sans-serif;margin-left:.15rem}
    .vital-chip .vital-status{font-size:.625rem;margin-top:.2rem;color:var(--accent3);font-weight:500}

    .chart-label{font-size:.6875rem;letter-spacing:.1em;text-transform:uppercase;color:var(--text3);margin-bottom:.6rem}
    .chart-bars{display:flex;align-items:flex-end;gap:.25rem;height:48px}
    .bar{
      flex:1;border-radius:4px 4px 0 0;
      background:var(--tag-bg);border-top:2px solid var(--tag-bd);
      transition:height .4s ease;
    }
    .bar.hi{background:linear-gradient(to top,var(--tag-bg),var(--tag-bd));border-top-color:var(--accent3)}
    .bar.peak{background:linear-gradient(to top,var(--accent3),var(--accent2));border-top-color:var(--accent)}

    .card-divider{height:1px;background:var(--border);margin:.75rem 0}
    .card-footer-row{display:flex;align-items:center;justify-content:space-between}
    .doc-pill{display:flex;align-items:center;gap:.625rem;min-width:0}
    .doc-init{
      width:36px;height:36px;border-radius:50%;flex-shrink:0;
      background:linear-gradient(135deg,var(--accent2),var(--accent3));
      display:flex;align-items:center;justify-content:center;
      font-size:.75rem;font-weight:700;color:#fff;
    }
    .doc-pill-txt{min-width:0;overflow:hidden}
    .doc-nm{font-size:.8125rem;font-weight:600;color:var(--text);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
    .doc-sp{font-size:.6875rem;color:var(--text3);margin-top:.1rem;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
    .appt-tag{
      font-size:.75rem;font-weight:600;color:var(--amber);
      background:var(--amber-soft);padding:.35rem .75rem;border-radius:100px;
      border:1px solid color-mix(in srgb, var(--amber) 20%, transparent);
    }

    .mini-row{display:grid;grid-template-columns:1fr 1fr;gap:1rem}
    .mini-c{
      background:var(--white);border:1px solid var(--border);border-radius:18px;padding:1.25rem;
      box-shadow:0 4px 20px var(--glow2);transition:all .3s;cursor:default;
    }
    .mini-c:hover{transform:translateY(-3px);box-shadow:0 12px 32px var(--glow2)}
    .mini-ico{font-size:1.25rem;margin-bottom:.625rem}
    .mini-title{font-size:.8125rem;font-weight:600;color:var(--text);margin-bottom:.2rem}
    .mini-sub{font-size:.6875rem;color:var(--text3)}
    .mini-val{font-family:'Fraunces',serif;font-size:1.375rem;font-weight:500;color:var(--accent3);margin-top:.4rem}

    .marquee-wrap{
      border-top:1px solid var(--border);border-bottom:1px solid var(--border);
      background:var(--white);padding:.875rem 0;overflow:hidden;
    }
    .marquee-track{
      display:flex;gap:2rem;width:max-content;
      animation:scroll 28s linear infinite;
    }
    .marquee-track:hover{animation-play-state:paused}
    @keyframes scroll{from{transform:translateX(0)}to{transform:translateX(-50%)}}
    .marquee-item{
      display:flex;align-items:center;gap:.5rem;
      font-size:.8125rem;font-weight:500;color:var(--text2);white-space:nowrap;
      padding:.35rem 1rem;border-radius:100px;
      border:1px solid var(--border);background:var(--cream);
    }
    .marquee-item .dot{color:var(--accent3);font-size:.9rem}

    .features{padding:8rem 5%;max-width:1320px;margin:0 auto}
    .section-eyebrow{
      display:inline-flex;align-items:center;gap:.5rem;
      font-size:.75rem;font-weight:600;letter-spacing:.12em;text-transform:uppercase;
      color:var(--amber);background:var(--amber-soft);
      padding:.4rem 1rem;border-radius:100px;
      border:1px solid color-mix(in srgb, var(--amber) 20%, transparent);
      margin-bottom:1.25rem;
    }
    .section-h2{
      font-family:'Fraunces',serif;
      font-size:clamp(2rem,4vw,3.25rem);
      font-weight:700;line-height:1.1;letter-spacing:-.02em;
      color:var(--accent);max-width:640px;margin-bottom:1rem;
    }
    .section-h2 em{font-style:italic;font-weight:300;color:var(--amber)}
    .section-sub{font-size:1.0625rem;font-weight:300;color:var(--text2);max-width:520px;line-height:1.8;margin-bottom:4.5rem}

    .feat-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:1.5rem}
    .feat-card{
      background:var(--white);border:1px solid var(--border);
      border-radius:24px;padding:2.25rem;
      transition:all .35s cubic-bezier(.22,.68,0,1.2);
      position:relative;overflow:hidden;cursor:default;
    }
    .feat-card::before{
      content:'';position:absolute;inset:0;
      background:linear-gradient(145deg,var(--tag-bg),transparent 60%);
      opacity:0;transition:opacity .35s;
    }
    .feat-card:hover{transform:translateY(-8px);border-color:var(--tag-bd);box-shadow:0 24px 60px var(--glow2)}
    .feat-card:hover::before{opacity:1}
    .feat-card.accent{
      background:var(--accent);border-color:var(--accent);color:var(--cream);
    }
    .feat-card.accent .feat-p{color:rgba(255,255,255,.6)}
    .feat-card.accent:hover{transform:translateY(-8px);box-shadow:0 24px 60px var(--glow)}
    .feat-card.accent::before{display:none}
    .feat-n{
      font-family:'Fraunces',serif;font-size:2.75rem;font-weight:300;
      color:var(--green-mid);line-height:1;margin-bottom:1.25rem;
      transition:color .3s;
    }
    .feat-card:hover .feat-n{color:var(--accent)}
    .feat-card.accent .feat-n{color:rgba(255,255,255,.2)}
    .feat-ico{font-size:1.75rem;margin-bottom:1rem}
    .feat-title{font-size:1.0625rem;font-weight:600;color:var(--text);margin-bottom:.625rem;line-height:1.3}
    .feat-card.accent .feat-title{color:rgba(255,255,255,.95)}
    .feat-p{font-size:.875rem;color:var(--text2);line-height:1.75}

    .proof{background:var(--accent);padding:5rem 5%;transition:background .5s}
    .proof-inner{max-width:1320px;margin:0 auto;display:grid;grid-template-columns:1fr 1fr;gap:4rem;align-items:center}
    .proof-h{
      font-family:'Fraunces',serif;
      font-size:clamp(1.75rem,3.5vw,2.75rem);font-weight:500;line-height:1.25;
      color:var(--cream);font-style:italic;
    }
    .proof-h strong{font-weight:700;font-style:normal}
    .proof-stats{display:grid;grid-template-columns:1fr 1fr;gap:2rem}
    .stat-box{border-left:2px solid rgba(255,255,255,.15);padding-left:1.25rem}
    .stat-num{
      font-family:'Fraunces',serif;font-size:2.5rem;font-weight:700;line-height:1;
      color:var(--amber-mid);
    }
    .stat-label{font-size:.875rem;color:rgba(255,255,255,.55);margin-top:.3rem;font-weight:300}

    .how{padding:8rem 5%;max-width:1320px;margin:0 auto}
    .steps{display:grid;grid-template-columns:repeat(4,1fr);gap:2rem;margin-top:4.5rem;position:relative}
    .steps::before{
      content:'';position:absolute;top:28px;left:calc(12.5% + 14px);right:calc(12.5% + 14px);
      height:1px;
      background:repeating-linear-gradient(90deg,var(--tag-bd) 0,var(--tag-bd) 6px,transparent 6px,transparent 14px);
    }
    .step{text-align:center;padding:0 .5rem}
    .step-num{
      width:56px;height:56px;border-radius:50%;margin:0 auto 1.5rem;
      background:var(--white);border:1.5px solid var(--tag-bd);
      display:flex;align-items:center;justify-content:center;
      font-family:'Fraunces',serif;font-size:1.25rem;font-weight:700;color:var(--accent);
      position:relative;z-index:1;transition:all .3s;
    }
    .step:hover .step-num{background:var(--accent);color:var(--cream);border-color:var(--accent);box-shadow:0 8px 24px var(--glow)}
    .step-title{font-size:.9375rem;font-weight:600;color:var(--text);margin-bottom:.5rem}
    .step-p{font-size:.8125rem;color:var(--text2);line-height:1.7}

    .testi-bg{
      padding:8rem 5%;background:var(--bg2);
      position:relative;transition:background .5s;
      overflow:hidden;
    }
    .testi-bg::before{
      content:'';position:absolute;top:-120px;right:-120px;
      width:360px;height:360px;border-radius:50%;
      background:radial-gradient(circle,var(--tag-bg),transparent 70%);
      pointer-events:none;opacity:.5;
    }
    .testi-inner{max-width:1320px;margin:0 auto;position:relative;z-index:1}
    .testi-scroll-hint{
      margin-top:1.25rem;text-align:center;font-size:.6875rem;color:var(--text3);font-weight:400;
      display:flex;align-items:center;justify-content:center;gap:.4rem;opacity:0;
      animation:scrollHint 2s .8s ease forwards;
    }
    .testi-scroll-hint .hint-arrow{display:inline-block;animation:hintBounce 1.4s ease infinite}
    @keyframes scrollHint{to{opacity:.7}}
    @keyframes hintBounce{0%,100%{transform:translateX(0)}50%{transform:translateX(6px)}}
    .testi-grid{
      display:flex;gap:1.5rem;margin-top:3rem;
      overflow-x:auto;scroll-snap-type:x mandatory;
      -webkit-overflow-scrolling:touch;padding:1rem .5rem 1.5rem .5rem;
      margin-left:-.5rem;margin-right:-.5rem;
    }
    .testi-grid::-webkit-scrollbar{height:5px}
    .testi-grid::-webkit-scrollbar-thumb{background:var(--border);border-radius:4px;background:var(--green-mid)}
    .testi-grid::-webkit-scrollbar-track{background:transparent}
    .testi-card{
      flex:0 0 400px;scroll-snap-align:start;
      background:var(--white);border:1px solid var(--border);
      border-radius:24px;padding:2rem 2rem 1.75rem;
      transition:all .4s cubic-bezier(.22,.68,0,1.2);
      position:relative;
    }
    .testi-card::before{
      content:'';position:absolute;top:0;left:0;right:0;height:3px;
      background:linear-gradient(90deg,var(--accent),var(--amber-mid),transparent);
      border-radius:24px 24px 0 0;opacity:0;transition:opacity .4s;
    }
    .testi-card:hover{
      transform:translateY(-8px);border-color:var(--tag-bd);
      box-shadow:0 20px 60px var(--glow2);
    }
    .testi-card:hover::before{opacity:1}
    .testi-card.featured{
      background:linear-gradient(145deg,var(--white),var(--tag-bg));
      border-color:var(--tag-bd);
    }
    .testi-card.featured::before{opacity:1}
    .testi-card.featured:hover{box-shadow:0 24px 64px var(--glow2);transform:translateY(-8px)}
    .stars{
      color:var(--amber);font-size:.75rem;letter-spacing:.18em;
      margin-bottom:1rem;display:flex;gap:1px;
    }
    .stars .star{display:inline-block;transition:transform .2s}
    .testi-card:hover .star{transform:scale(1.15);animation:starPulse .3s ease forwards}
    .testi-card:hover .star:nth-child(2){animation-delay:.04s}
    .testi-card:hover .star:nth-child(3){animation-delay:.08s}
    .testi-card:hover .star:nth-child(4){animation-delay:.12s}
    .testi-card:hover .star:nth-child(5){animation-delay:.16s}
    @keyframes starPulse{0%{transform:scale(1.15)}50%{transform:scale(1.3)}100%{transform:scale(1.15)}}
    .testi-q{
      font-family:'Fraunces',serif;font-size:1.0625rem;font-weight:400;font-style:italic;
      color:var(--text);line-height:1.7;margin-bottom:1.5rem;
      position:relative;padding-left:.25rem;
    }
    .testi-q strong{font-style:normal;font-weight:700;color:var(--accent)}
    .testi-person{display:flex;align-items:center;gap:.75rem;padding-top:.75rem;border-top:1px solid var(--border)}
    .person-av{
      width:42px;height:42px;border-radius:50%;flex-shrink:0;
      display:flex;align-items:center;justify-content:center;
      font-size:.75rem;font-weight:700;color:#fff;
      position:relative;
    }
    .person-av::after{
      content:'';position:absolute;inset:-2px;border-radius:50%;
      border:2px solid transparent;transition:border-color .3s;
    }
    .testi-card:hover .person-av::after{border-color:var(--amber-mid)}
    .av-1{background:linear-gradient(135deg,var(--accent2),var(--accent3))}
    .av-2{background:linear-gradient(135deg,var(--amber),color-mix(in srgb, var(--amber) 70%, #fff))}
    .person-name{font-size:.8125rem;font-weight:600;color:var(--text)}
    .person-role{font-size:.6875rem;color:var(--text3);margin-top:.1rem}

    .cta-section{padding:7rem 5%}
    .cta-inner{
      max-width:1000px;margin:0 auto;text-align:center;
      background:var(--accent);border-radius:32px;
      padding:6rem 5rem;position:relative;overflow:hidden;
      transition:background .5s;
    }
    .cta-inner::before{
      content:'';position:absolute;top:-40%;right:-10%;
      width:500px;height:500px;border-radius:50%;
      background:radial-gradient(circle,rgba(255,255,255,.05),transparent 70%);
      pointer-events:none;
    }
    .cta-inner::after{
      content:'';position:absolute;bottom:-30%;left:-5%;
      width:300px;height:300px;border-radius:50%;
      background:radial-gradient(circle,rgba(var(--amber) / .12),transparent 70%);
      pointer-events:none;
    }
    .cta-eyebrow{
      display:inline-flex;align-items:center;gap:.5rem;
      font-size:.75rem;font-weight:600;letter-spacing:.12em;text-transform:uppercase;
      color:var(--amber-mid);opacity:.85;margin-bottom:1.5rem;
    }
    .cta-h{
      font-family:'Fraunces',serif;
      font-size:clamp(2rem,4vw,3.5rem);font-weight:700;line-height:1.08;letter-spacing:-.02em;
      color:var(--cream);margin-bottom:1.25rem;position:relative;z-index:1;
    }
    .cta-h em{font-style:italic;font-weight:300;color:var(--amber-mid)}
    .cta-sub{font-size:1.0625rem;font-weight:300;color:rgba(255,255,255,.65);max-width:480px;margin:0 auto 2.5rem;line-height:1.8;position:relative;z-index:1}
    .cta-btns{display:flex;gap:1rem;justify-content:center;flex-wrap:wrap;position:relative;z-index:1;margin-bottom:1.75rem}
    .btn-cream{
      display:inline-flex;align-items:center;gap:.5rem;
      padding:.9375rem 2.25rem;border-radius:100px;
      background:var(--cream);color:var(--accent);
      font-size:.9375rem;font-weight:700;text-decoration:none;
      transition:all .25s;cursor:pointer;
    }
    .btn-cream:hover{transform:translateY(-2px);box-shadow:0 12px 32px rgba(0,0,0,.18)}
    .btn-ghost-cta{
      display:inline-flex;align-items:center;gap:.5rem;
      padding:.875rem 2rem;border-radius:100px;
      background:transparent;border:1.5px solid rgba(255,255,255,.22);
      color:rgba(255,255,255,.85);font-size:.9375rem;font-weight:500;
      text-decoration:none;transition:all .25s;cursor:pointer;
    }
    .btn-ghost-cta:hover{background:rgba(255,255,255,.08);border-color:rgba(255,255,255,.35);transform:translateY(-2px)}
    .cta-fine{font-size:.8125rem;color:rgba(255,255,255,.4);position:relative;z-index:1}
    .cta-fine span{color:var(--amber-mid);opacity:.8}

    footer{
      background:var(--accent);border-top:1px solid rgba(255,255,255,.06);
      padding:4rem 5% 2.5rem;
    }
    .footer-grid{
      max-width:1320px;margin:0 auto;
      display:grid;grid-template-columns:2fr 1fr 1fr 1fr;gap:3rem;
    }
    .footer-brand{}
    .footer-logo{
      font-family:'Fraunces',serif;font-size:1.375rem;font-weight:700;
      letter-spacing:.06em;color:var(--cream);margin-bottom:.75rem;
      display:flex;align-items:center;gap:.4rem;
    }
    .footer-desc{font-size:.8125rem;color:rgba(255,255,255,.45);line-height:1.7;max-width:320px;margin-bottom:1.5rem}
    .footer-social{display:flex;gap:.75rem}
    .footer-social a{
      width:36px;height:36px;border-radius:50%;background:rgba(255,255,255,.08);
      display:flex;align-items:center;justify-content:center;
      font-size:.875rem;color:rgba(255,255,255,.5);text-decoration:none;
      transition:all .2s;
    }
    .footer-social a:hover{background:rgba(255,255,255,.15);color:var(--cream)}
    .footer-col-title{font-size:.8125rem;font-weight:600;color:var(--cream);margin-bottom:1rem;letter-spacing:.05em}
    .footer-col-links{display:flex;flex-direction:column;gap:.6rem}
    .footer-col-links a{
      font-size:.75rem;color:rgba(255,255,255,.45);text-decoration:none;transition:color .2s;
    }
    .footer-col-links a:hover{color:rgba(255,255,255,.8)}
    .footer-bottom{
      max-width:1320px;margin:2.5rem auto 0;padding-top:1.5rem;
      border-top:1px solid rgba(255,255,255,.06);
      display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:1rem;
    }
    .footer-bottom-links{display:flex;gap:1.5rem}
    .footer-bottom-links a{font-size:.6875rem;color:rgba(255,255,255,.35);text-decoration:none;transition:color .2s}
    .footer-bottom-links a:hover{color:rgba(255,255,255,.6)}
    .footer-copy{font-size:.6875rem;color:rgba(255,255,255,.3)}
    .footer-tagline{font-size:.75rem;color:var(--amber-mid);opacity:.7;font-style:italic;margin-top:.5rem}
    .footer-theme-btn{
      width:28px;height:28px;border-radius:50%;border:1px solid rgba(255,255,255,.15);
      cursor:pointer;transition:all .2s;display:flex;align-items:center;justify-content:center;
      font-size:.675rem;background:rgba(255,255,255,.08);color:rgba(255,255,255,.5);
      padding:0;line-height:1;
    }
    .footer-theme-btn:hover{background:rgba(255,255,255,.15);color:var(--cream)}
    .footer-theme-btn.active{border-color:var(--amber-mid);background:rgba(255,255,255,.12);color:var(--amber-mid)}

    .reveal{opacity:0;transform:translateY(28px);transition:opacity .65s ease,transform .65s ease}
    .reveal.in{opacity:1;transform:translateY(0)}
    .d1{transition-delay:.1s}.d2{transition-delay:.2s}.d3{transition-delay:.3s}
    .d4{transition-delay:.4s}.d5{transition-delay:.5s}.d6{transition-delay:.6s}

    @media(max-width:1024px){
      .hero{grid-template-columns:1fr;gap:3rem;padding-top:100px}
      .hero-visual{display:none}
      .feat-grid{grid-template-columns:1fr 1fr}
      .steps{grid-template-columns:1fr 1fr;gap:2.5rem}
      .steps::before{display:none}
      .proof-inner{grid-template-columns:1fr}
      .testi-grid{flex-wrap:nowrap}
      .testi-card{flex:0 0 360px}
      .cta-inner{padding:4rem 3rem}
      .nav-links{display:none}
      .hamburger{display:flex}
      .footer-grid{grid-template-columns:1fr 1fr;gap:2rem}
    }
    @media(max-width:640px){
      .hero{padding:90px 5% 60px}
      .hero-h1{font-size:2.375rem}
      .hero-p{font-size:.9375rem}
      .hero-actions{flex-direction:column}
      .hero-actions .btn-g,.hero-actions .btn-o{width:100%;justify-content:center}
      .hero-note{justify-content:center;font-size:.75rem;gap:.5rem}
      .feat-grid{grid-template-columns:1fr}
      .steps{grid-template-columns:1fr}
      .testi-grid{flex-wrap:nowrap;gap:1rem;padding:1rem 0 1.5rem;margin-left:0;margin-right:0;scroll-snap-type:x mandatory}
      .testi-card{flex:0 0 82vw;padding:1.5rem}
      .testi-q{font-size:.9375rem}
      .cta-inner{padding:3rem 1.5rem;border-radius:20px}
      .cta-h{font-size:1.75rem}
      .cta-sub{font-size:.9375rem}
      .cta-btns{flex-direction:column}
      .cta-btns .btn-cream,.cta-btns .btn-ghost-cta{width:100%;justify-content:center}
      .cta-fine{font-size:.6875rem}
      .section-h2{font-size:1.875rem}
      .section-sub{font-size:.9375rem;max-width:100%}
      .features,.how,.testi-bg{padding:4rem 5%}
      .proof{padding:3.5rem 5%}
      .proof-stats{grid-template-columns:1fr 1fr;gap:1rem}
      .stat-box{padding-left:.75rem}
      .stat-num{font-size:1.75rem}
      .stat-label{font-size:.75rem}
      .step{padding:0}
      .footer-grid{grid-template-columns:1fr;gap:2rem}
      .footer-bottom{flex-direction:column;text-align:center}
      .footer-bottom-links{flex-wrap:wrap;justify-content:center;gap:.75rem}
      .mini-row{grid-template-columns:1fr 1fr}
      .reveal{transform:translateY(20px)}
      .stars{font-size:.6875rem}
      .vital-chip{min-width:110px;padding:.75rem}
      .vital-chip .vital-reading{font-size:1.25rem}
      .patient-tab{font-size:.6875rem;padding:.4rem .75rem}
    }
  `;
};

const SPECIALTIES = [
  "Paediatric Pulmonology", "Paediatric Cardiology", "Paediatric Infectious Disease",
  "Paediatric Emergency Medicine", "Paediatric Gastroenterology", "Paediatric Neurology",
  "Paediatric Endocrinology", "Neonatology", "Paediatric Intensive Care",
  "Paediatric Respiratory Medicine", "General Paediatrics", "Paediatric Allergy & Immunology",
];

const FEATURES = [
  { n: "01", ico: "📖", title: "Your Lifetime Health Story", desc: "Every visit, every prescription, every result, every clinical note — secured forever. Your complete narrative follows you across every doctor, every clinic, every year. Never repeat your history again.", accent: true },
  { n: "02", ico: "🧠", title: "Consultant-Level Clinical Reasoning", desc: "Complete a structured history once. Instantly receive a formatted HPI, ranked differentials with evidence, and WHO-aligned management plans. Built for the clinician who demands rigour without shortcuts." },
  { n: "03", ico: "🪪", title: "Health ID — Your Identity in Care", desc: "A universal medical identity recognized by partner clinics, labs, and pharmacies. Emergency-ready — your critical information available in seconds, wherever you are, whatever happens." },
  { n: "04", ico: "💊", title: "Chronic Conditions, Quietly Controlled", desc: "Diabetes, hypertension, asthma, and beyond. Patients get personalized management plans, tracking, and reminders. Clinicians get protocol-aligned guidance, safety checks, and treatment monitoring." },
  { n: "05", ico: "🎯", title: "Decisions You Can See", desc: "Every differential scored with its evidence trail. Clinicians see the 'why' behind every diagnosis. Patients see what's being considered. No black boxes — just transparent, rigorous clinical thinking." },
  { n: "06", ico: "💬", title: "Connected Care, From Anywhere", desc: "Find the right specialist, book in seconds, consult via video, voice, or messaging. Patients get access without waiting. Clinicians get integrated records. Healthcare that fits your life — not the other way around." },
];

const STEPS = [
  { n: "1", title: "Join the Platform", desc: "Sign up in 2 minutes — patient or clinician. Either way, you get a Health ID, a secure record, and access to everything AMEXAN offers. One account, two journeys." },
  { n: "2", title: "Build Your Health Story", desc: "Patients add conditions, medications, preferences — or import from existing records. Clinicians start a structured history with guided SOCRATES workup and tri-state controls." },
  { n: "3", title: "Reason & Manage", desc: "Clinicians receive consultant-level HPI, ranked differentials with evidence, and WHO-aligned management plans. Patients get personalized chronic condition tools and a clear care plan." },
  { n: "4", title: "Live Your Health", desc: "Follow-up, monitoring, chronic disease tracking. Every visit adds to your lifelong record. Every clinician you see stays informed. Healthcare that evolves with you — because it's for life." },
];

const TESTIMONIALS = [
  { initials: "AN", name: "Amara Nwosu", role: "Patient · Type 2 Diabetes · Lagos", quote: "Managing my diabetes used to feel like a second job. AMEXAN turned it into something I <strong>barely have to think about.</strong> My A1C is the best it's been in a decade." },
  { initials: "GM", name: "Dr. Grace Mwangi", role: "Paediatric Registrar · Nairobi, Kenya", quote: "The HPI generation alone <strong>saves me 15 minutes per admission.</strong> And the differential panel caught an epiglottitis I was about to miss — the drooling red flag fired before I'd finished the history." },
  { initials: "KO", name: "Kwame Osei", role: "Patient · Accra, Ghana", quote: "My elderly mother had a health scare while I was abroad. Her <strong>Health ID gave the ER everything they needed in seconds.</strong> That single feature is priceless." },
  { initials: "SO", name: "Dr. Samuel Ochieng", role: "Emergency Paediatrician · Lagos, Nigeria", quote: "We piloted this in our paediatric A&E. The structured workup <strong>reduced documentation gaps by 73%.</strong> The juniors stopped copying notes and started taking real histories." },
  { initials: "FH", name: "Dr. Fatima Hassan", role: "Paediatric Consultant · Cairo, Egypt", quote: "I've been a consultant for 18 years. This is the first platform that <strong>serves both my patients and my clinical reasoning</strong> — seamless records on one side, consultant-level support on the other." },
];



export default function Home() {
  const [theme, setTheme] = useState<Theme>("forest");
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [themeOpen, setThemeOpen] = useState(false);
  const [viewMode, setViewMode] = useState<"patient" | "clinician">("patient");

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    localStorage.setItem("amx-theme", theme);
  }, [theme]);

  useEffect(() => {
    const obs = new IntersectionObserver(
      (entries) => entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("in"); obs.unobserve(e.target); } }),
      { threshold: 0.12, rootMargin: "0px 0px -28px 0px" }
    );
    document.querySelectorAll(".reveal").forEach((el) => obs.observe(el));
    return () => obs.disconnect();
  }, [theme]);

  useEffect(() => {
    const cur = document.getElementById("cursor");
    if (!cur) return;
    const move = (e: MouseEvent) => { cur.style.left = e.clientX + "px"; cur.style.top = e.clientY + "px"; };
    document.addEventListener("mousemove", move);
    const els = document.querySelectorAll("a,button,.feat-card,.testi-card,.mini-c,.app-card,.step");
    const enter = () => cur.classList.add("big");
    const leave = () => cur.classList.remove("big");
    els.forEach((el) => { el.addEventListener("mouseenter", enter); el.addEventListener("mouseleave", leave); });
    return () => {
      document.removeEventListener("mousemove", move);
      els.forEach((el) => { el.removeEventListener("mouseenter", enter); el.removeEventListener("mouseleave", leave); });
    };
  }, [theme]);

  const smoothScroll = useCallback((id: string) => (e: React.MouseEvent) => {
    e.preventDefault();
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth" });
    setMenuOpen(false);
  }, []);

  return (
    <>
      <style>{CSS(theme)}</style>
      <div id="cursor" />
      <div className="page">
        {/* NAV */}
        <nav className={scrolled ? "scrolled" : ""}>
          <Link href="/" className="nav-logo"><span className="logo-dot" />AMEXAN</Link>
          <div className="nav-links">
            {[["Features", "features"], ["How It Works", "how"], ["Stories", "stories"]].map(([label, id]) => (
              <a key={id} href={`#${id}`} className="nav-a" onClick={smoothScroll(id)}>{label}</a>
            ))}
            <Link href="/consultation/respiratory" className="nav-a">Try Builder</Link>
            <div style={{ position: "relative" }}>
              <button className="theme-btn" onClick={() => setThemeOpen(!themeOpen)} aria-label="Change theme">
                {THEMES[theme].icon}
              </button>
              {themeOpen && (
                <div className="theme-panel">
                  {(Object.entries(THEMES) as [Theme, typeof THEMES[Theme]][]).map(([key, t]) => (
                    <button key={key} className={`theme-btn${key === theme ? " active" : ""}`} onClick={() => { setTheme(key); setThemeOpen(false); }} title={t.label}>
                      {t.icon}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <Link href="/consultation/respiratory" className="nav-cta">Try HPI Builder <span className="arrow">→</span></Link>
          </div>
          <button className="hamburger" onClick={() => setMenuOpen(!menuOpen)} aria-label="Menu">
            <span style={menuOpen ? { transform: "rotate(45deg) translateY(7px)" } : {}} />
            <span style={menuOpen ? { opacity: 0 } : {}} />
            <span style={menuOpen ? { transform: "rotate(-45deg) translateY(-7px)" } : {}} />
          </button>
        </nav>

        <div className={`mobile-menu${menuOpen ? " open" : ""}`}>
          {[["Features", "features"], ["How It Works", "how"], ["Stories", "stories"]].map(([label, id]) => (
            <a key={id} href={`#${id}`} className="nav-a" onClick={smoothScroll(id)}>{label}</a>
          ))}
          <Link href="/consultation/respiratory" className="nav-a" onClick={() => setMenuOpen(false)}>Try Builder</Link>
          <div style={{ display: "flex", gap: ".5rem" }}>
            {(Object.entries(THEMES) as [Theme, typeof THEMES[Theme]][]).map(([key, t]) => (
              <button key={key} className={`theme-btn${key === theme ? " active" : ""}`} onClick={() => setTheme(key)} title={t.label}>{t.icon}</button>
            ))}
          </div>
          <Link href="/consultation/respiratory" className="nav-cta" style={{ width: "fit-content" }} onClick={() => setMenuOpen(false)}>Try HPI Builder →</Link>
        </div>

        {/* HERO */}
        <section className="hero">
          <div className="hero-left">
            <div className="hero-eyebrow"><span className="eyebrow-pip" /> Intelligence Infrastructure for Lifelong Healthcare</div>
            <h1 className="hero-h1">The Operating System<br />for <em>Lifelong Healthcare.</em></h1>
            <p className="hero-p">Connecting patients, clinicians, and healthcare systems through intelligent clinical infrastructure. A unified platform for chronic condition management, consultant-level clinical reasoning, and lifelong health records.</p>
            <div className="hero-actions">
              <Link href="/consultation/respiratory" className="btn-g">Try the HPI Builder <span className="arrow">→</span></Link>
              <Link href="/register" className="btn-o">Build Your Lifetime Record <span className="arrow">→</span></Link>
            </div>
            <div className="hero-note">
              <span className="hero-note-item"><span className="check">✓</span> For patients: lifelong health story</span>
              <span className="hero-note-item"><span className="check">✓</span> For clinicians: consultant-level reasoning</span>
              <span className="hero-note-item"><span className="check">✓</span> Intelligent clinical infrastructure</span>
            </div>
          </div>
          <div className="hero-visual">
            <div className="app-card" style={{ padding: "1.25rem 1.375rem 1.375rem" }}>
              <div className="view-tabs">
                <button className={`view-tab${viewMode === "patient" ? " active" : ""}`} onClick={() => setViewMode("patient")}>
                  <span>👤</span> Patient · Lifetime Record
                </button>
                <button className={`view-tab${viewMode === "clinician" ? " active" : ""}`} onClick={() => setViewMode("clinician")}>
                  <span>👨‍⚕️</span> Clinician · HPI Builder
                </button>
              </div>
              <div className="view-content">
                {/* ── PATIENT PANE ── */}
                <div className={`view-pane${viewMode === "patient" ? " active" : ""}`}>
                  <div className="card-topline">
                    <div className="card-tag"><span className="live-pip" />Lifetime Health Record</div>
                    <span className="card-timestamp">Acute · Chronic · Connected</span>
                  </div>
                  <div className="patient-carousel">
                    <div className="patient-tab active"><span className="emoji">👤</span> Amara Nwosu</div>
                    <div className="patient-tab"><span className="emoji">🩺</span> Dr. Kamau</div>
                    <div className="patient-tab"><span className="emoji">💊</span> Medications</div>
                    <div className="patient-tab"><span className="emoji">🪪</span> Health ID</div>
                  </div>
                  <div className="vitals-carousel">
                    <div className="vital-chip">
                      <div className="vital-name">Heart Rate</div>
                      <div className="vital-reading">72<span className="vital-unit">bpm</span></div>
                      <div className="vital-status">↗ Normal range</div>
                    </div>
                    <div className="vital-chip">
                      <div className="vital-name">Blood Pressure</div>
                      <div className="vital-reading">118<span className="vital-unit">/76</span></div>
                      <div className="vital-status">✓ Optimal today</div>
                    </div>
                    <div className="vital-chip">
                      <div className="vital-name">A1C</div>
                      <div className="vital-reading">6.8<span className="vital-unit">%</span></div>
                      <div className="vital-status">↘ Trending down</div>
                    </div>
                    <div className="vital-chip">
                      <div className="vital-name">Glucose</div>
                      <div className="vital-reading">126<span className="vital-unit">mg/dL</span></div>
                      <div className="vital-status">⚠ Monitoring</div>
                    </div>
                    <div className="vital-chip">
                      <div className="vital-name">Meds</div>
                      <div className="vital-reading">3<span className="vital-unit">Rx</span></div>
                      <div className="vital-status">✓ On track</div>
                    </div>
                  </div>
                  <div className="chart-label">Weekly Activity</div>
                  <div className="chart-bars" style={{ marginBottom: ".75rem" }}>
                    {[42, 61, 47, 88, 72, 55, 64].map((h, i) => (
                      <div key={i} className={`bar${h >= 80 ? " peak" : h >= 55 ? " hi" : ""}`} style={{ height: `${h}%`, transitionDelay: `${i * 0.05}s` }} />
                    ))}
                  </div>
                  <div className="card-divider" />
                  <div className="card-footer-row">
                    <div className="doc-pill">
                      <div className="doc-init">DK</div>
                      <div className="doc-pill-txt">
                        <div className="doc-nm">Dr. Kamau</div>
                        <div className="doc-sp">Cardiologist · Fri 10AM</div>
                      </div>
                    </div>
                    <div className="appt-tag">📅 2 days away</div>
                  </div>
                </div>

                {/* ── CLINICIAN PANE ── */}
                <div className={`view-pane${viewMode === "clinician" ? " active" : ""}`}>
                  <div className="card-topline">
                    <div className="card-tag"><span className="live-pip" />HPI Builder · Real-time</div>
                    <span className="card-timestamp">Cough · Fever · Fast breathing</span>
                  </div>
                  <div className="clin-overview">
                    <div className="clin-stat">
                      <div className="lbl">HPI Generated</div>
                      <div className="val">2.4s <small>avg</small></div>
                    </div>
                    <div className="clin-stat">
                      <div className="lbl">Differentials</div>
                      <div className="val">3 ranked <small>· 30+ modelled</small></div>
                    </div>
                    <div className="clin-stat">
                      <div className="lbl">Management</div>
                      <div className="val">WHO-aligned <small>· 1° impression</small></div>
                    </div>
                    <div className="clin-stat">
                      <div className="lbl">Tri-state Rigour</div>
                      <div className="val">✓ No fabricated negatives</div>
                    </div>
                  </div>
                  <div className="hpi-callout">
                    <div className="hpi-callout-lbl">HPI Preview</div>
                    <div className="hpi-callout-q">Acute respiratory illness in a previously well 3-year-old male presenting with 48 hours of dry paroxysmal cough, fever, and progressively fast breathing. No inspiratory whoop, post-tussive emesis, stridor, or cyanotic episodes reported. Caregiver notes increased breathing effort with preserved activity and oral intake.</div>
                  </div>
                  <div className="diff-row">
                    <span className="diff-chip">Pneumonia <span className="pct">72%</span></span>
                    <span className="diff-chip">Bronchiolitis <span className="pct">18%</span></span>
                    <span className="diff-chip" style={{ color: "var(--text3)" }}>Asthma <span className="pct">6%</span></span>
                  </div>
                  <div className="card-divider" />
                  <div className="card-footer-row">
                    <div className="doc-pill">
                      <div className="doc-init">GM</div>
                      <div className="doc-pill-txt">
                        <div className="doc-nm">Dr. Grace Mwangi</div>
                        <div className="doc-sp">Paediatric Registrar · Just now</div>
                      </div>
                    </div>
                    <div className="appt-tag">🧠 30+ diseases</div>
                  </div>
                </div>
              </div>
            </div>
            <div className="mini-row">
              <div className="mini-c">
                <div className="mini-ico">👤</div>
                <div className="mini-title">For Patients</div>
                <div className="mini-sub">Lifelong record · Chronic tools · Health ID</div>
                <div className="mini-val">50K+ enrolled</div>
              </div>
              <div className="mini-c">
                <div className="mini-ico">👨‍⚕️</div>
                <div className="mini-title">For Clinicians</div>
                <div className="mini-sub">HPI · Differentials · Management plans</div>
                <div className="mini-val">3,800+ using it</div>
              </div>
            </div>
          </div>
        </section>

        {/* MARQUEE */}
        <div className="marquee-wrap">
          <div className="marquee-track">
            {[...SPECIALTIES, ...SPECIALTIES].map((s, i) => (
              <div key={i} className="marquee-item"><span className="dot">+</span> {s}</div>
            ))}
          </div>
        </div>

        {/* FEATURES */}
        <section className="features" id="features">
          <div className="reveal">
            <div className="section-eyebrow">✦ What AMEXAN Does</div>
            <h2 className="section-h2">Intelligent infrastructure<br />for <em>every stage of health.</em></h2>
            <p className="section-sub">Six capabilities, united by a single purpose: healthcare that spans a lifetime. Patients get a lifelong health partner with chronic tools and a universal Health ID. Clinicians get consultant-level clinical reasoning that turns every structured history into actionable insight.</p>
          </div>
          <div className="feat-grid">
            {FEATURES.map((f, i) => (
              <div key={f.n} className={`feat-card${f.accent ? " accent" : ""} reveal d${i + 1}`}>
                <div className="feat-n">{f.n}</div>
                <div className="feat-ico">{f.ico}</div>
                <div className="feat-title">{f.title}</div>
                <p className="feat-p">{f.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* PROOF */}
        <div className="proof">
          <div className="proof-inner">
            <div className="reveal">
              <p className="proof-h">&ldquo;Medicine used to feel like a maze. AMEXAN gave us <strong>the map — and a guide.</strong>&rdquo;</p>
            </div>
            <div className="proof-stats reveal d2">
              {[["50K+", "Patients & Families Served"], ["3,800+", "Clinicians on the Platform"], ["30+", "Paediatric Diseases Modelled"], ["87%", "Report Better Chronic Control"]].map(([num, label]) => (
                <div key={label} className="stat-box">
                  <div className="stat-num">{num}</div>
                  <div className="stat-label">{label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* HOW IT WORKS */}
        <section className="how" id="how">
          <div className="reveal" style={{ textAlign: "center", maxWidth: 600, margin: "0 auto" }}>
            <div className="section-eyebrow" style={{ margin: "0 auto 1.25rem", display: "inline-flex" }}>✦ Up &amp; Running in Minutes</div>
            <h2 className="section-h2" style={{ margin: "0 auto 1rem", textAlign: "center" }}>Four steps to intelligent<br /><em>healthcare.</em></h2>
            <p className="section-sub" style={{ margin: "0 auto", textAlign: "center" }}>No training. No configuration. No waiting. Just intelligent clinical infrastructure that works from day one — for patients and clinicians alike.</p>
          </div>
          <div className="steps">
            {STEPS.map((s, i) => (
              <div key={s.n} className={`step reveal d${i + 1}`}>
                <div className="step-num">{s.n}</div>
                <div className="step-title">{s.title}</div>
                <p className="step-p">{s.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* TESTIMONIALS */}
        <div className="testi-bg" id="stories">
          <div className="testi-inner">
            <div className="reveal">
              <div className="section-eyebrow">✦ Trusted by Patients & Clinicians</div>
              <h2 className="section-h2">Intelligent infrastructure,<br /><em>proven by real outcomes.</em></h2>
              <p className="section-sub">From patients managing chronic conditions to clinicians transforming their practice — real stories from both sides of the platform.</p>
            </div>
            <div className="testi-scroll-hint">
              <span>←</span> Scroll to see all stories <span className="hint-arrow">→</span>
            </div>
            <div className="testi-grid">
              {TESTIMONIALS.map((t, i) => (
                <div key={t.name} className={`testi-card${i === 0 ? " featured" : ""} reveal d${i + 1}`}>
                  <div className="stars">
                    {[1,2,3,4,5].map(s => <span key={s} className="star">★</span>)}
                  </div>
                  <p className="testi-q" dangerouslySetInnerHTML={{ __html: `&ldquo;${t.quote}&rdquo;` }} />
                  <div className="testi-person">
                    <div className={`person-av ${i % 2 === 0 ? "av-1" : "av-2"}`}>{t.initials}</div>
                    <div>
                      <div className="person-name">{t.name}</div>
                      <div className="person-role">{t.role}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* CTA */}
        <section className="cta-section">
          <div className="cta-inner reveal">
            <div className="cta-eyebrow">✦ Intelligence Infrastructure</div>
            <h2 className="cta-h">One Intelligent System<br />for <em>Lifelong Health.</em></h2>
            <p className="cta-sub">Join thousands of patients and clinicians who chose the platform built for the future of healthcare. No wait times. No lost records. Just intelligent clinical infrastructure — from the first visit to a lifetime of care.</p>
            <div className="cta-btns">
              <Link href="/consultation/respiratory" className="btn-cream">Try the HPI Builder <span className="arrow">→</span></Link>
              <Link href="/register" className="btn-ghost-cta">Start Your Health Story <span className="arrow">→</span></Link>
            </div>
            <div className="cta-fine">Patients: lifelong health story &nbsp;·&nbsp; <span>Clinicians: clinical reasoning engine</span> &nbsp;·&nbsp; Built for a lifetime of care</div>
          </div>
        </section>

        {/* FOOTER */}
        <footer>
          <div className="footer-grid">
            <div className="footer-brand">
              <div className="footer-logo"><span className="logo-dot" />AMEXAN</div>
              <p className="footer-desc">AMEXAN is the intelligent clinical infrastructure connecting patients, clinicians, and healthcare systems around a single shared record. A lifelong health story, chronic condition management, universal Health ID, and consultant-level clinical reasoning. One platform. For everyone. For life.</p>
              <div className="footer-social">
                <a href="#" aria-label="Twitter">𝕏</a>
                <a href="#" aria-label="LinkedIn">in</a>
                <a href="#" aria-label="GitHub">GH</a>
                <a href="#" aria-label="YouTube">▶</a>
              </div>
              <p className="footer-tagline">Lifelong Health Platform · Est. 2024</p>
            </div>
            <div>
              <div className="footer-col-title">Platform</div>
              <div className="footer-col-links">
                <a href="#">For Patients</a>
                <a href="#">For Doctors</a>
                <a href="#">For Clinics</a>
                <a href="#">For Hospitals</a>
                <a href="#">For Pharmacies</a>
              </div>
            </div>
            <div>
              <div className="footer-col-title">Resources</div>
              <div className="footer-col-links">
                <a href="#">Documentation</a>
                <a href="#">API Reference</a>
                <a href="#">Help Center</a>
                <a href="#">Community</a>
                <a href="#">Blog</a>
              </div>
            </div>
            <div>
              <div className="footer-col-title">Company</div>
              <div className="footer-col-links">
                <a href="#">About</a>
                <a href="#">Careers</a>
                <a href="#">Pricing</a>
                <a href="#">Privacy</a>
                <a href="#">Terms of Service</a>
              </div>
            </div>
          </div>
          <div className="footer-bottom">
            <div className="footer-copy">&copy; {new Date().getFullYear()} AMEXAN. All rights reserved.</div>
            <div className="footer-bottom-links">
              <div className="footer-theme-row" style={{ display: "flex", gap: ".35rem", alignItems: "center" }}>
                <span style={{ fontSize: ".6875rem", color: "rgba(255,255,255,.35)", marginRight: ".25rem" }}>Theme</span>
                {(Object.entries(THEMES) as [Theme, typeof THEMES[Theme]][]).map(([key, t]) => (
                  <button key={key} className={`footer-theme-btn${key === theme ? " active" : ""}`} onClick={() => setTheme(key)} title={t.label}>
                    {t.icon}
                  </button>
                ))}
              </div>
              <a href="#">Privacy Policy</a>
              <a href="#">Terms of Service</a>
              <a href="#">Cookie Policy</a>
              <a href="#">Sitemap</a>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}
