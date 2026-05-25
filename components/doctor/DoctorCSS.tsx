'use client';

export function DoctorCSS() {
  return <style>{`
    @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;0,9..40,800;1,9..40,400&family=DM+Mono:wght@400;500&display=swap');

    *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
    :root{
      --bg:#f0f4f8; --white:#fff; --surface:#fff; --border:#e2e9f3;
      --text:#0d1b2a; --text-2:#4a5568; --muted:#8fa3bd;
      --accent:#0F766E; --accent-2:#0B5E58; --accent-dim:rgba(15,118,110,.09);
      --green:#0F766E; --green-dim:rgba(15,118,110,.09);
      --amber:#f59e0b; --amber-dim:rgba(245,158,11,.09);
      --red:#e53e3e; --red-dim:rgba(229,62,62,.09);
      --indigo:#5a67d8; --indigo-dim:rgba(90,103,216,.09);
      --font:'DM Sans',sans-serif; --mono:'DM Mono',monospace;
      --r:16px; --r-sm:10px;
      --shadow:0 1px 4px rgba(0,0,0,.06); --shadow-md:0 4px 18px rgba(0,0,0,.09); --shadow-lg:0 16px 48px rgba(0,0,0,.14);
    }
    body{background:var(--bg);color:var(--text);font-family:var(--font);-webkit-font-smoothing:antialiased}
    @keyframes spin{to{transform:rotate(360deg)}}
    @keyframes fadeUp{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:none}}
    @keyframes fadeIn{from{opacity:0}to{opacity:1}}
    @keyframes slideUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}
    @keyframes pulse-g{0%,100%{box-shadow:0 0 0 0 rgba(10,170,118,.4)}50%{box-shadow:0 0 0 8px rgba(10,170,118,0)}}
    @keyframes pulse-amber{0%,100%{box-shadow:0 0 0 0 rgba(245,158,11,.4)}50%{box-shadow:0 0 0 8px rgba(245,158,11,0)}}
    @keyframes pulse-red{0%,100%{box-shadow:0 0 0 0 rgba(229,62,62,.4)}50%{box-shadow:0 0 0 8px rgba(229,62,62,0)}}
    @keyframes shimmer{0%{background-position:-200% 0}100%{background-position:200% 0}}
    ::-webkit-scrollbar{width:4px;height:4px}::-webkit-scrollbar-thumb{background:var(--muted);border-radius:99px}::-webkit-scrollbar-track{background:transparent}
    ::selection{background:var(--accent-dim);color:var(--accent)}

    /* ─── PANELS ─── */
    .panel{background:var(--surface);border:1px solid var(--border);border-radius:var(--r);padding:18px 20px;box-shadow:var(--shadow);transition:border-color .18s,box-shadow .18s}
    .panel:hover{border-color:var(--accent);box-shadow:var(--shadow-md)}
    .panel-hd{display:flex;justify-content:space-between;align-items:center;margin-bottom:14px}
    .panel-title{font-size:14px;font-weight:800;display:flex;align-items:center;gap:6px;color:var(--text)}
    .count-badge{background:var(--accent-dim);color:var(--accent);border-radius:99px;font-size:11px;font-weight:700;padding:2px 8px}
    .empty-sm{text-align:center;padding:28px 0;color:var(--muted);font-size:13px}

    /* ─── BUTTONS ─── */
    .btn-sm-accent{background:var(--accent);color:#fff;border:none;border-radius:8px;padding:6px 12px;font-size:12px;font-weight:700;cursor:pointer;font-family:var(--font);transition:all .14s;white-space:nowrap}
    .btn-sm-accent:hover{opacity:.9;box-shadow:0 4px 12px var(--accent-glow, rgba(10,170,118,.3))}
    .btn-cta{background:linear-gradient(135deg,var(--accent),var(--accent-3, var(--accent)));color:#fff;border:none;border-radius:12px;padding:12px;font-size:14px;font-weight:700;cursor:pointer;font-family:var(--font);width:100%;transition:all .14s;box-shadow:0 4px 16px var(--accent-glow, rgba(10,170,118,.28))}
    .btn-cta:hover{box-shadow:0 6px 24px var(--accent-glow, rgba(10,170,118,.4))}
    .btn-cta:disabled{opacity:.5;cursor:not-allowed}
    .btn-secondary{background:transparent;border:1.5px solid var(--border);color:var(--text-2);border-radius:12px;padding:11px;font-size:13px;font-weight:600;cursor:pointer;font-family:var(--font);width:100%;transition:all .14s}
    .btn-secondary:hover{border-color:var(--text);color:var(--text)}
    .btn-action{background:var(--surface);border:1px solid var(--border);border-radius:8px;padding:7px 11px;font-size:12px;font-weight:700;cursor:pointer;font-family:var(--font);transition:all .14s}
    .btn-action:hover{border-color:var(--accent);color:var(--accent)}
    .btn-start{background:linear-gradient(135deg,var(--accent),var(--accent-3, var(--accent)));color:#fff;border:none;border-radius:10px;padding:10px 18px;font-size:13px;font-weight:700;cursor:pointer;font-family:var(--font);transition:all .14s;box-shadow:0 4px 14px var(--accent-glow, rgba(10,170,118,.28))}
    .btn-start:hover{box-shadow:0 6px 20px var(--accent-glow, rgba(10,170,118,.4))}
    .btn-start:disabled{opacity:.5;cursor:not-allowed}
    .btn-end{background:var(--red-dim);color:var(--red);border:1px solid rgba(229,62,62,.25);border-radius:8px;padding:7px 12px;font-size:12px;font-weight:700;cursor:pointer;font-family:var(--font);transition:all .14s}
    .btn-end:hover{background:var(--red);color:#fff}
    .btn-join-live{background:var(--green);color:#000;border:none;border-radius:8px;padding:8px 13px;font-size:12px;font-weight:700;cursor:pointer;font-family:var(--font);transition:all .14s}
    .btn-join-live:hover{opacity:.9}
    .btn-edit{background:var(--bg);border:1px solid var(--border);border-radius:8px;padding:6px 12px;font-size:12px;font-weight:700;cursor:pointer;font-family:var(--font);transition:all .14s}
    .btn-edit:hover{border-color:var(--accent);color:var(--accent)}
    .btn-delete{background:var(--red-dim);border:1px solid rgba(229,62,62,.2);color:var(--red);border-radius:8px;padding:6px 12px;font-size:12px;font-weight:700;cursor:pointer;font-family:var(--font);transition:all .14s}
    .btn-delete:hover{background:var(--red);color:#fff}
    .btn-records{background:transparent;border:1px solid var(--border);color:var(--text-2);border-radius:8px;padding:7px 12px;font-size:12px;font-weight:600;cursor:pointer;font-family:var(--font);transition:all .14s}
    .btn-records:hover{border-color:var(--accent);color:var(--accent)}

    /* ─── STATUS PILLS ─── */
    .status-pill{display:inline-flex;align-items:center;padding:4px 10px;border-radius:99px;font-size:11px;font-weight:700}
    .payment-pill{font-size:11px;font-weight:700;padding:3px 10px;border-radius:99px}
    .risk-chip{font-size:10px;font-weight:700;padding:2px 8px;border-radius:99px;margin-left:8px}
    .info-chip{background:var(--bg);border:1px solid var(--border);border-radius:99px;padding:3px 10px;font-size:12px;font-weight:700}

    /* ─── QUEUE CARDS ─── */
    .queue-card{background:var(--bg);border:1.5px solid var(--border);border-radius:14px;padding:14px 16px;display:flex;justify-content:space-between;align-items:flex-start;gap:14px;flex-wrap:wrap;transition:border-color .18s}
    .queue-card:hover{border-color:var(--accent)}
    .queue-left{display:flex;align-items:flex-start;gap:10px}
    .queue-ava{width:40px;height:40px;border-radius:10px;background:linear-gradient(135deg,var(--indigo),var(--accent-3, #7c3aed));display:flex;align-items:center;justify-content:center;font-weight:800;font-size:16px;color:#fff;flex-shrink:0}
    .queue-name{font-weight:700;font-size:14px;color:var(--text)}
    .queue-specialty{font-size:12px;color:var(--text-2)}
    .queue-date{font-size:11px;color:var(--muted);font-family:var(--mono)}
    .queue-concern{font-size:11px;color:var(--text-2);font-style:italic}
    .queue-right{display:flex;flex-direction:column;align-items:flex-end;gap:8px}

    /* ─── ACTIVE SESSIONS ─── */
    .active-sessions-panel{border-color:rgba(var(--accent),.4);background:rgba(var(--accent),.025)}
    .live-dot-sm{width:8px;height:8px;border-radius:50%;background:var(--green);display:inline-block;animation:pulse-g 1.5s infinite;margin-right:4px}
    .active-session-card{background:rgba(var(--accent),.06);border:1.5px solid rgba(var(--accent),.25);border-radius:14px;padding:14px 16px;display:flex;justify-content:space-between;align-items:center;gap:14px;flex-wrap:wrap;margin-bottom:10px}
    .as-left{display:flex;align-items:center;gap:10px}
    .as-ava{width:42px;height:42px;border-radius:11px;background:linear-gradient(135deg,var(--accent),var(--accent-3, #06b6d4));display:flex;align-items:center;justify-content:center;font-weight:800;font-size:17px;color:#fff;flex-shrink:0}
    .as-name{font-weight:700;font-size:14px;color:var(--text)}
    .as-sub{font-size:12px;color:var(--muted)}
    .as-concern{font-size:11px;color:var(--text-2);font-style:italic;max-width:260px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
    .as-actions{display:flex;gap:7px;flex-wrap:wrap}

    /* ─── PATIENT CARDS ─── */
    .patient-card{background:var(--surface);border:1.5px solid var(--border);border-radius:16px;padding:16px;cursor:pointer;transition:all .18s;display:flex;flex-direction:column;gap:10px}
    .patient-card:hover{border-color:var(--accent);transform:translateY(-2px);box-shadow:var(--shadow-md)}
    .pc-top{display:flex;align-items:center;gap:10px}
    .pc-ava{width:42px;height:42px;border-radius:11px;background:linear-gradient(135deg,var(--indigo),var(--accent-3, #06b6d4));display:flex;align-items:center;justify-content:center;font-weight:800;font-size:17px;color:#fff;flex-shrink:0}
    .pc-name{font-weight:700;font-size:14px;color:var(--text)}
    .pc-email{font-size:11px;color:var(--muted);overflow:hidden;text-overflow:ellipsis;white-space:nowrap;max-width:160px}
    .pc-chips{display:flex;gap:5px;flex-wrap:wrap}
    .pc-chip{font-size:10px;font-weight:700;padding:2px 8px;border-radius:99px;background:var(--bg);color:var(--text-2);border:1px solid var(--border)}
    .pc-chip.blood{background:rgba(229,62,62,.08);color:var(--red);border-color:rgba(229,62,62,.2)}
    .pc-chip.cond{background:var(--accent-dim);color:var(--accent);border-color:rgba(var(--accent),.2)}
    .pc-last{font-size:11px;color:var(--muted)}
    .pc-count{font-size:11px;font-weight:700;color:var(--accent)}

    /* ─── STAT CARDS ─── */
    .stat-card{background:var(--surface);border:1px solid var(--border);border-radius:var(--r);padding:16px 18px;display:flex;align-items:center;gap:12px;box-shadow:var(--shadow);transition:all .18s}
    .stat-card:hover{border-color:var(--accent);box-shadow:var(--shadow-md);transform:translateY(-1px)}
    .stat-icon{font-size:28px;flex-shrink:0}
    .stat-val{font-size:22px;font-weight:900;font-family:var(--mono);color:var(--text)}
    .stat-lbl{font-size:11px;color:var(--muted);font-weight:600;text-transform:uppercase;letter-spacing:.5px}

    /* ─── FILTER CHIPS ─── */
    .filter-chip{padding:6px 14px;border-radius:99px;border:1.5px solid var(--border);background:var(--surface);color:var(--text-2);font-size:12px;font-weight:700;cursor:pointer;font-family:var(--font);transition:all .14s}
    .filter-chip.active{background:var(--accent);border-color:var(--accent);color:#fff}
    .filter-chip:not(.active):hover{border-color:var(--accent);color:var(--accent)}

    /* ─── FORMS ─── */
    .form-grid-2{display:grid;grid-template-columns:1fr 1fr;gap:12px}
    .form-full{grid-column:1/-1}
    .field-col{display:flex;flex-direction:column;gap:5px}
    .field-lbl{font-size:10px;font-weight:800;color:var(--muted);text-transform:uppercase;letter-spacing:.8px}
    .field-inp{background:var(--bg);border:1.5px solid var(--border);border-radius:var(--r-sm);padding:10px 12px;color:var(--text);font-size:14px;font-family:var(--font);outline:none;transition:border-color .14s;width:100%}
    .field-inp:focus{border-color:var(--accent)}
    .field-ta{background:var(--bg);border:1.5px solid var(--border);border-radius:var(--r-sm);padding:10px 12px;color:var(--text);font-size:14px;font-family:var(--font);outline:none;transition:border-color .14s;width:100%;resize:vertical}
    .field-ta:focus{border-color:var(--accent)}
    .search-inp{width:100%;background:var(--bg);border:1.5px solid var(--border);border-radius:var(--r-sm);padding:10px 12px;color:var(--text);font-size:14px;font-family:var(--font);outline:none;transition:border-color .14s}
    .search-inp:focus{border-color:var(--accent)}
    .err-box{background:var(--red-dim);border:1px solid rgba(229,62,62,.3);border-radius:var(--r-sm);padding:8px 12px;font-size:12px;color:var(--red);border-left:3px solid var(--red)}

    /* ─── MODALS ─── */
    .overlay{position:fixed;inset:0;background:rgba(0,0,0,.45);z-index:100;display:flex;align-items:center;justify-content:center;padding:16px;backdrop-filter:blur(6px);animation:fadeIn .18s ease}
    .modal-box{background:var(--surface);border:1px solid var(--border);border-radius:22px;width:100%;max-height:92vh;overflow-y:auto;box-shadow:var(--shadow-lg);animation:slideUp .2s ease}
    .modal-hd{padding:22px 22px 0;display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:18px}
    .modal-ht{font-size:18px;font-weight:800;color:var(--text)}
    .modal-hs{font-size:12px;color:var(--muted);margin-top:3px}
    .modal-close{background:var(--bg);border:none;color:var(--text-2);width:30px;height:30px;border-radius:8px;cursor:pointer;font-size:14px;flex-shrink:0;transition:all .14s}
    .modal-close:hover{background:var(--muted);color:var(--text)}
    .modal-body{padding:0 22px 22px;display:flex;flex-direction:column;gap:14px}

    /* ─── CHAT ─── */
    .chat-shell{display:grid;grid-template-columns:260px 1fr;background:var(--surface);border:1px solid var(--border);border-radius:var(--r);overflow:hidden;min-height:520px;box-shadow:var(--shadow)}
    .chat-sidebar{border-right:1px solid var(--border);overflow-y:auto;display:flex;flex-direction:column;background:var(--surface)}
    .chat-sidebar-hd{padding:16px 16px 12px;border-bottom:1px solid var(--border);font-size:14px;font-weight:800;display:flex;align-items:center;color:var(--text)}
    .chat-patient-btn{display:flex;align-items:center;gap:10px;width:100%;padding:12px 14px;border:none;background:transparent;cursor:pointer;text-align:left;transition:background .12s;border-bottom:1px solid var(--border);font-family:var(--font);color:var(--text)}
    .chat-patient-btn:hover{background:var(--bg)}
    .chat-patient-btn.active{background:var(--accent-dim)}
    .chat-patient-ava{width:36px;height:36px;border-radius:9px;background:linear-gradient(135deg,var(--accent),var(--accent-3, #06b6d4));display:flex;align-items:center;justify-content:center;font-weight:800;font-size:14px;color:#fff;flex-shrink:0}
    .chat-patient-info{display:flex;flex-direction:column;overflow:hidden;flex:1}
    .chat-patient-name{font-size:13px;font-weight:700;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
    .chat-patient-sub{font-size:11px;color:var(--muted);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
    .chat-area{display:flex;flex-direction:column}
    .chat-area-hd{padding:13px 18px;border-bottom:1px solid var(--border);display:flex;align-items:center;gap:10px;background:var(--bg)}
    .chat-empty{flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;color:var(--muted);text-align:center}
    .chat-feed{flex:1;overflow-y:auto;display:flex;flex-direction:column;gap:8px;padding:14px 18px;max-height:400px}
    .msg-bubble-wrap{display:flex}
    .msg-bubble-wrap.mine{justify-content:flex-end}
    .msg-bubble-wrap.theirs{justify-content:flex-start}
    .msg-bubble{max-width:78%;padding:9px 13px;border-radius:13px;font-size:13px;line-height:1.5}
    .msg-mine{background:linear-gradient(135deg,var(--accent),var(--accent-3, #06b6d4));color:#fff;border-bottom-right-radius:4px}
    .msg-theirs{background:var(--bg);color:var(--text);border:1px solid var(--border);border-bottom-left-radius:4px}
    .msg-sender{font-size:9px;font-weight:800;opacity:.7;margin-bottom:3px;text-transform:uppercase;letter-spacing:.5px}
    .chat-input-row{display:flex;gap:8px;padding:12px 16px;border-top:1px solid var(--border)}
    .chat-inp{flex:1;background:var(--bg);border:1.5px solid var(--border);border-radius:var(--r-sm);padding:10px 13px;color:var(--text);font-size:13px;font-family:var(--font);outline:none}
    .chat-inp:focus{border-color:var(--accent)}
    .chat-send{background:var(--accent);border:none;color:#fff;padding:10px 16px;border-radius:var(--r-sm);font-weight:700;cursor:pointer;font-size:16px;transition:all .14s;font-family:var(--font)}
    .chat-send:hover{opacity:.9}

    /* ─── SERVICES ─── */
    .svc-manage-card{background:var(--surface);border:1.5px solid var(--border);border-radius:16px;padding:18px;display:flex;flex-direction:column;gap:10px;transition:all .18s}
    .svc-manage-card:hover{border-color:var(--accent);box-shadow:var(--shadow-md)}
    .svc-paused{opacity:.55}
    .svc-mc-hd{display:flex;justify-content:space-between;align-items:center}
    .svc-mc-title{font-weight:800;font-size:16px;color:var(--text)}
    .avail-toggle{padding:4px 10px;border-radius:99px;font-size:11px;font-weight:700;cursor:pointer;border:none;font-family:var(--font);transition:all .14s}
    .avail-toggle.on{background:var(--green-dim);color:var(--green)}
    .avail-toggle.off{background:var(--red-dim);color:var(--red)}
    .svc-mc-price{font-size:22px;font-weight:900;color:var(--accent);font-family:var(--mono)}
    .svc-mc-meta{display:flex;gap:10px;flex-wrap:wrap;font-size:12px;color:var(--text-2)}
    .svc-tag{background:var(--indigo-dim);color:var(--indigo);border-radius:99px;padding:2px 8px;font-size:11px;font-weight:700}
    .svc-desc-text{font-size:12px;color:var(--muted);line-height:1.6}
    .svc-mc-actions{display:flex;gap:8px;margin-top:4px}

    /* ─── MISC ─── */
    .allergy-box{background:var(--red-dim);border:1px solid rgba(229,62,62,.25);border-radius:10px;padding:9px 12px;font-size:12px;font-weight:700;color:var(--red)}
    .patient-detail-section{display:flex;flex-direction:column;gap:8px}
    .pd-section-title{font-size:13px;font-weight:800;padding-bottom:8px;border-bottom:1px solid var(--border);display:flex;align-items:center;gap:5px;color:var(--text)}
    .vitals-summary-grid{display:grid;gap:8px}
    .vs-card{background:var(--bg);border-radius:12px;padding:12px 8px;display:flex;flex-direction:column;align-items:center;text-align:center;gap:3px;border:1px solid var(--border)}
    .rx-row{display:flex;justify-content:space-between;align-items:center;padding:8px 10px;background:var(--bg);border-radius:8px;gap:8px}
    .rx-name{font-size:13px;font-weight:700;color:var(--text)}
    .rx-detail{font-size:11px;color:var(--muted)}
    .appt-card{background:var(--surface);border:1.5px solid var(--border);border-radius:var(--r);padding:14px 18px;display:flex;justify-content:space-between;align-items:center;gap:14px;transition:border-color .18s}
    .appt-card:hover{border-color:var(--accent)}
    .appt-left{display:flex;align-items:center;gap:10px}
    .appt-icon-box{width:42px;height:42px;border-radius:11px;background:var(--bg);display:flex;align-items:center;justify-content:center;font-size:20px;flex-shrink:0}
    .appt-spec{font-weight:700;font-size:14px;color:var(--text)}
    .appt-dr{font-size:12px;color:var(--text-2)}
    .appt-date{font-size:11px;color:var(--muted);font-family:var(--mono)}
    .appt-right{display:flex;align-items:center;gap:8px;flex-shrink:0}
    .sb-badge{margin-left:auto;background:var(--red);color:#fff;border-radius:99px;font-size:10px;font-weight:700;padding:1px 6px;min-width:18px;text-align:center}

    /* ─── ACCENT BUTTON ─── */
    .btn-accent{background:linear-gradient(135deg,var(--accent),var(--accent-3, #0B5E58));color:#fff;border:none;border-radius:12px;padding:11px 18px;font-size:13px;font-weight:700;cursor:pointer;font-family:var(--font);transition:all .14s;box-shadow:0 4px 14px var(--accent-glow, rgba(10,170,118,.28))}
    .btn-accent:hover{box-shadow:0 6px 20px var(--accent-glow, rgba(10,170,118,.4))}
    .btn-accent:disabled{opacity:.5;cursor:not-allowed}

    /* ─── CREATE PATIENT OPTION ─── */
    .create-option-card{transition:all .18s}
    .create-option-card:hover{border-color:var(--accent)!important;box-shadow:var(--shadow-md);transform:translateY(-1px)}

    /* ─── CLINIC CARDS ─── */
    .clinic-card{transition:all .18s}
    .clinic-card:hover{border-color:var(--accent);box-shadow:var(--shadow-md)}

    /* ─── WARD CHIPS ─── */
    .ward-chip{transition:all .18s}
    .ward-chip:hover{border-color:var(--accent);box-shadow:var(--shadow-sm)}

    /* ─── TOOL CARDS ─── */
    .tool-card{transition:all .18s}
    .tool-card:hover{border-color:var(--accent);box-shadow:var(--shadow-md);transform:translateY(-2px)}

    /* ─── PATHWAY CARDS ─── */
    .pathway-card{transition:all .18s}
    .pathway-card:hover{border-color:var(--accent);box-shadow:var(--shadow-sm)}
    .enrollee-row:last-child{border-bottom:none!important}

    /* ─── TASK & MEMBER CARDS ─── */
    .task-card,.member-card,.inpatient-card{transition:all .18s}
    .task-card:hover,.member-card:hover{border-color:var(--accent)!important;box-shadow:var(--shadow-sm)}
    .inpatient-card:hover{border-color:var(--accent);box-shadow:var(--shadow-sm)}

    /* ─── SKELETON LOADING ─── */
    .skeleton{background:linear-gradient(90deg,var(--bg) 25%,var(--border) 50%,var(--bg) 75%);background-size:200% 100%;animation:shimmer 1.5s infinite;border-radius:8px}

    /* ─── TIMELINE ENGINE ─── */
    .timeline-event{transition:all .18s}
    .timeline-event:hover{background:var(--bg)!important;border-color:var(--accent)!important}
    
    /* ─── NOTE CARDS ─── */
    .note-card{transition:all .18s}
    .note-card:hover{border-color:var(--accent)!important;box-shadow:var(--shadow-sm)}
    
    /* ─── PRESCRIPTION & ORDER CARDS ─── */
    .rx-card,.lab-card,.imaging-card{transition:all .18s}
    .rx-card:hover,.lab-card:hover,.imaging-card:hover{border-color:var(--accent)!important;box-shadow:var(--shadow-sm)}
    
    /* ─── RESPONSIVE ─── */
    @media(max-width:1100px){
      .stats-grid{grid-template-columns:repeat(2,1fr)}
      .vitals-summary-grid{grid-template-columns:repeat(2,1fr)}
    }
    @media(max-width:768px){
      .sidebar{display:none}
      .panel{padding:14px 16px}
      .stats-grid{grid-template-columns:repeat(2,1fr);gap:8px}
      .chat-shell{grid-template-columns:1fr}
      .chat-sidebar{display:none}
      .form-grid-2{grid-template-columns:1fr}
      .queue-card{flex-direction:column}
      .queue-right{width:100%;flex-direction:row;justify-content:space-between}
      .active-session-card{flex-direction:column;align-items:flex-start}
      .as-actions{width:100%;justify-content:flex-start}
    }
  `}</style>;
}
