"use client";
import { useState, useCallback } from "react";
import WorkspaceGuard from "@/components/workspace/WorkspaceGuard";

const S = `
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=Noto+Sans:wght@400;500;600;700&display=swap');
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
:root{
  --sky-50:#f0f9ff;--sky-100:#e0f2fe;--sky-200:#bae6fd;--sky-300:#7dd3fc;
  --sky-400:#38bdf8;--sky-500:#0ea5e9;--sky-600:#0284c7;--sky-700:#0369a1;
  --sky-800:#075985;--sky-900:#0c4a6e;
  --white:#ffffff;--f-50:#fafafa;--f-100:#f5f5f5;--f-200:#e5e5e5;
  --f-300:#d4d4d4;--f-400:#a3a3a3;--f-500:#737373;
  --green:#10b981;--green-bg:#d1fae5;--green-text:#065f46;
  --amber:#f59e0b;--amber-bg:#fef3c7;--amber-text:#92400e;
  --red:#ef4444;--red-bg:#fee2e2;--red-text:#991b1b;
  --blue:#3b82f6;--blue-bg:#dbeafe;--blue-text:#1e40af;
  --purple:#8b5cf6;--purple-bg:#ede9fe;--purple-text:#5b21b6;
  --font:'Inter',sans-serif;
  --r:12px;--r-sm:8px;--r-lg:20px;
  --sh:0 1px 3px rgba(0,0,0,.04);--sh-md:0 4px 16px rgba(0,0,0,.06);--sh-lg:0 12px 40px rgba(0,0,0,.08);
}
body{font-family:'Inter','Noto Sans',sans-serif;background:var(--f-50);color:#0f172a;-webkit-font-smoothing:antialiased}
@keyframes pulse-live{0%,100%{opacity:1;box-shadow:0 0 0 0 rgba(52,211,153,.4)}50%{opacity:.6;box-shadow:0 0 0 6px rgba(52,211,153,0)}}
@keyframes slideUp{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}
@keyframes fadeIn{from{opacity:0}to{opacity:1}}
@keyframes checkAnim{0%{transform:scale(0)}50%{transform:scale(1.2)}100%{transform:scale(1)}}
@keyframes shimmer{0%{background-position:-200px 0}100%{background-position:200px 0}}

.cos-layout{display:flex;min-height:100vh}
.cos-sidebar{width:240px;background:var(--white);border-right:1px solid var(--f-200);padding:20px 0;display:flex;flex-direction:column;position:sticky;top:0;height:100vh;flex-shrink:0}
.cos-brand{padding:0 16px 16px;border-bottom:1px solid var(--f-200);margin-bottom:12px;display:flex;align-items:center;gap:8px}
.cos-brand-name{font-size:20px;font-weight:800;color:var(--sky-700);letter-spacing:-.3px}
.cos-brand-badge{background:var(--sky-100);color:var(--sky-600);font-size:9px;padding:2px 6px;border-radius:4px;font-weight:700;text-transform:uppercase;letter-spacing:.3px}
.cos-nav{display:flex;flex-direction:column;gap:1px;padding:0 8px;flex:1}
.cos-nav-section{font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:var(--f-400);padding:12px 10px 4px}
.cos-nav-item{display:flex;align-items:center;gap:10px;padding:9px 12px;border-radius:var(--r-sm);font-size:12px;font-weight:600;color:var(--f-500);cursor:pointer;transition:all .1s;border:none;background:none;text-align:left;width:100%;font-family:'Inter','Noto Sans',sans-serif}
.cos-nav-item:hover{background:var(--sky-50);color:var(--sky-700)}
.cos-nav-item.active{background:var(--sky-100);color:var(--sky-700);font-weight:700}
.cos-nav-item .icon{font-size:14px;width:18px;text-align:center;opacity:.7}
.cos-nav-item.active .icon{opacity:1}
.cos-nav-item .badge{margin-left:auto;background:var(--red-bg);color:var(--red-text);font-size:9px;font-weight:700;padding:1px 5px;border-radius:99px;min-width:16px;text-align:center}
.cos-nav-item .badge.green{background:var(--green-bg);color:var(--green-text)}
.cos-nav-item .badge.blue{background:var(--blue-bg);color:var(--blue-text)}
.cos-profile{padding:12px 16px;border-top:1px solid var(--f-200);display:flex;align-items:center;gap:10px}
.cos-avatar{width:34px;height:34px;border-radius:10px;background:var(--sky-500);color:var(--white);display:flex;align-items:center;justify-content:center;font-weight:800;font-size:13px;flex-shrink:0}
.cos-profile-info{flex:1;min-width:0}
.cos-profile-name{font-size:12px;font-weight:700}
.cos-profile-role{font-size:10px;color:var(--f-500)}

.cos-main{flex:1;display:flex;flex-direction:column;min-width:0}
.cos-topbar{height:52px;background:var(--white);border-bottom:1px solid var(--f-200);display:flex;align-items:center;justify-content:space-between;padding:0 24px;position:sticky;top:0;z-index:50}
.cos-greeting{font-size:13px;color:var(--f-500)}
.cos-greeting strong{color:#0f172a}
.cos-topbar-right{display:flex;align-items:center;gap:10px}
.cos-topbar-btn{width:34px;height:34px;border-radius:9px;border:1.5px solid var(--f-200);background:var(--white);display:flex;align-items:center;justify-content:center;cursor:pointer;font-size:14px;position:relative;transition:all .15s}
.cos-topbar-btn:hover{border-color:var(--sky-300);background:var(--sky-50)}
.cos-topbar-btn .notif-dot{position:absolute;top:4px;right:4px;width:8px;height:8px;border-radius:50%;background:var(--red);animation:pulse-live 1.5s infinite}
.cos-round-badge{display:flex;align-items:center;gap:6px;font-size:11px;font-weight:600;color:var(--green-text);background:var(--green-bg);padding:4px 10px;border-radius:8px}
.cos-round-badge .dot{width:6px;height:6px;border-radius:50%;background:var(--green);animation:pulse-live 1.5s infinite}

.cos-content{padding:20px 24px 40px;flex:1;max-width:1440px;width:100%;margin:0 auto;animation:fadeIn .3s}

.stats-row{display:grid;grid-template-columns:repeat(auto-fit,minmax(140px,1fr));gap:10px;margin-bottom:16px}
.stat-card{background:var(--white);border:1px solid var(--f-200);border-radius:var(--r);padding:14px 16px;display:flex;align-items:center;gap:12px}
.stat-icon{width:36px;height:36px;border-radius:9px;display:flex;align-items:center;justify-content:center;font-size:16px;flex-shrink:0}
.stat-icon.sky{background:var(--sky-50)}
.stat-icon.green{background:var(--green-bg)}
.stat-icon.amber{background:var(--amber-bg)}
.stat-icon.red{background:var(--red-bg)}
.stat-num{font-size:22px;font-weight:800;line-height:1}
.stat-label{font-size:10px;color:var(--f-500);margin-top:2px}

.quick-actions{display:flex;gap:8px;flex-wrap:wrap;margin-bottom:16px}
.q-btn{display:flex;align-items:center;gap:6px;padding:9px 16px;border-radius:var(--r-sm);font-size:12px;font-weight:600;border:1.5px solid var(--f-200);background:var(--white);cursor:pointer;transition:all .15s;font-family:'Inter','Noto Sans',sans-serif}
.q-btn:hover{border-color:var(--sky-300);background:var(--sky-50);box-shadow:var(--sh)}
.q-btn.primary{background:var(--sky-500);color:var(--white);border-color:var(--sky-500)}
.q-btn.primary:hover{background:var(--sky-600)}
.q-btn.comm{background:var(--purple-bg);color:var(--purple-text);border-color:var(--purple)}

/* PREFILL */
.prefill-bar{background:var(--white);border:1px solid var(--sky-200);border-radius:var(--r);padding:10px 16px;margin-bottom:12px;display:flex;align-items:center;gap:12px;flex-wrap:wrap}
.prefill-label{font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.5px;color:var(--sky-600);display:flex;align-items:center;gap:4px}
.prefill-item{font-size:11px;color:var(--f-500);display:flex;align-items:center;gap:4px;padding:3px 8px;background:var(--sky-50);border-radius:4px}
.prefill-item strong{color:#0f172a}

.alerts-panel{background:var(--white);border:1px solid var(--f-200);border-radius:var(--r);padding:14px 16px;margin-bottom:16px}
.alerts-title{font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.5px;color:var(--f-500);margin-bottom:8px;display:flex;align-items:center;gap:6px}
.alerts-title .count{font-size:9px;background:var(--red-bg);color:var(--red-text);padding:1px 5px;border-radius:99px}
.alert-item{display:flex;align-items:center;gap:8px;padding:7px 10px;border-radius:var(--r-sm);font-size:11px;border:1px solid var(--f-200);margin-bottom:4px;cursor:pointer;transition:all .1s}
.alert-item:hover{border-color:var(--amber);background:var(--amber-bg)}
.alert-item.critical{border-left:3px solid var(--red)}
.alert-item.warning{border-left:3px solid var(--amber)}
.alert-item.info{border-left:3px solid var(--sky-400)}
.alert-dot{width:5px;height:5px;border-radius:50%;flex-shrink:0}
.alert-dot.red{background:var(--red);animation:pulse-live 1.5s infinite}
.alert-dot.amber{background:var(--amber)}
.alert-dot.blue{background:var(--sky-500)}
.alert-action{font-size:9px;font-weight:700;color:var(--sky-500);margin-left:auto;opacity:0;transition:opacity .1s}
.alert-item:hover .alert-action{opacity:1}

/* ROUND */
.round-container{background:var(--white);border-radius:var(--r-lg);overflow:hidden;box-shadow:var(--sh-lg);border:2px solid var(--sky-400)}
.round-header{background:var(--sky-700);color:var(--white);padding:14px 20px;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:8px}
.round-header h2{font-size:14px;font-weight:700;display:flex;align-items:center;gap:8px}
.round-status{display:flex;align-items:center;gap:12px;font-size:11px;color:var(--sky-200)}
.round-progress{height:3px;background:var(--sky-600)}
.round-progress-fill{height:100%;background:#34d399;transition:width .4s ease}
.round-body{padding:16px 20px}

.filter-row{display:flex;gap:6px;margin-bottom:12px;flex-wrap:wrap}
.filter-chip{padding:5px 12px;border-radius:5px;font-size:11px;font-weight:600;background:var(--f-100);color:var(--f-500);cursor:pointer;border:1px solid var(--f-200);transition:all .1s;font-family:'Inter','Noto Sans',sans-serif}
.filter-chip:hover{border-color:var(--sky-300);color:var(--sky-600)}
.filter-chip.active{background:var(--sky-500);color:var(--white);border-color:var(--sky-500)}

.bed-queue{display:flex;flex-direction:column;gap:5px}
.bed-card{display:flex;align-items:center;gap:12px;padding:9px 14px;border:1.5px solid var(--f-200);border-radius:var(--r);cursor:pointer;transition:all .15s;background:var(--white)}
.bed-card:hover{border-color:var(--sky-300);box-shadow:var(--sh)}
.bed-card.active{border-color:var(--sky-500);background:var(--sky-50);box-shadow:0 0 0 2px var(--sky-200)}
.bed-card.done{opacity:.65}
.bed-card.done:hover{opacity:.85}
.bed-num{width:30px;height:30px;border-radius:7px;background:var(--sky-100);color:var(--sky-700);font-weight:800;font-size:12px;display:flex;align-items:center;justify-content:center;flex-shrink:0}
.bed-card.done .bed-num{background:var(--green-bg);color:var(--green-text)}
.bed-card.active .bed-num{background:var(--sky-500);color:var(--white)}
.bed-info{flex:1;min-width:0}
.bed-name{font-size:12px;font-weight:700}
.bed-dx{font-size:10px;color:var(--f-500);margin-top:1px}
.bed-tags{display:flex;gap:3px;margin-top:3px;flex-wrap:wrap}
.bed-tag{font-size:8px;font-weight:600;padding:1px 5px;border-radius:3px}
.bed-tag.green{background:var(--green-bg);color:var(--green-text)}
.bed-tag.amber{background:var(--amber-bg);color:var(--amber-text)}
.bed-tag.red{background:var(--red-bg);color:var(--red-text)}
.bed-tag.blue{background:var(--blue-bg);color:var(--blue-text)}
.bed-tag.purple{background:var(--purple-bg);color:var(--purple-text)}
.bed-actions{display:flex;gap:5px;flex-shrink:0}
.bed-btn{font-size:10px;font-weight:700;padding:5px 12px;border-radius:7px;border:none;cursor:pointer;font-family:'Inter','Noto Sans',sans-serif;transition:all .1s}
.bed-btn.primary{background:var(--sky-500);color:var(--white)}
.bed-btn.primary:hover{background:var(--sky-600)}
.bed-btn.outline{background:var(--white);border:1.5px solid var(--f-200);color:var(--f-500)}
.bed-btn.outline:hover{border-color:var(--sky-300);color:var(--sky-600)}
.bed-btn.done-btn{background:var(--green-bg);color:var(--green-text)}
.bed-btn.done-btn:hover{background:var(--green);color:var(--white)}

/* PATIENT WORKSPACE */
.patient-ws{background:var(--white);border:2px solid var(--sky-300);border-radius:var(--r-lg);overflow:hidden;box-shadow:var(--sh-lg);margin-top:20px;animation:slideUp .3s}
.ws-top{background:var(--sky-50);border-bottom:1px solid var(--sky-200);padding:14px 20px;display:flex;justify-content:space-between;align-items:center}
.ws-patient{display:flex;align-items:center;gap:12px}
.ws-avatar{width:38px;height:38px;border-radius:10px;background:var(--sky-500);color:var(--white);display:flex;align-items:center;justify-content:center;font-weight:800;font-size:15px}
.ws-info{}
.ws-name{font-size:14px;font-weight:700}
.ws-meta{font-size:10px;color:var(--f-500);margin-top:1px}
.ws-status{display:flex;gap:5px}
.ws-pill{font-size:9px;font-weight:600;padding:2px 7px;border-radius:4px}
.ws-pill.inpatient{background:var(--purple-bg);color:var(--purple-text)}
.ws-pill.priority{background:var(--red-bg);color:var(--red-text)}
.ws-pill.stable{background:var(--green-bg);color:var(--green-text)}
.ws-close{background:none;border:none;font-size:16px;cursor:pointer;color:var(--f-500);padding:3px 7px;border-radius:6px;font-family:'Inter','Noto Sans',sans-serif}
.ws-close:hover{background:var(--sky-100);color:var(--sky-700)}

.ws-tabs{display:flex;border-bottom:1px solid var(--f-200);background:var(--f-50);overflow-x:auto;gap:0}
.ws-tab{padding:9px 12px;font-size:11px;font-weight:600;color:var(--f-500);cursor:pointer;border-bottom:2px solid transparent;transition:all .15s;white-space:nowrap;border:none;background:none;font-family:'Inter','Noto Sans',sans-serif;flex-shrink:0}
.ws-tab:hover{color:var(--sky-600)}
.ws-tab.active{color:var(--sky-700);border-bottom-color:var(--sky-500);background:var(--white)}
.ws-tab .tab-icon{margin-right:4px}

.ws-body{padding:20px}
.ws-section{display:none}
.ws-section.active{display:block}

.summary-grid{display:grid;grid-template-columns:1fr 1fr;gap:14px}
@media(max-width:900px){.summary-grid{grid-template-columns:1fr}}
.summary-card{border:1px solid var(--f-200);border-radius:var(--r);padding:14px;background:var(--white)}
.summary-card.full{grid-column:1/-1}
.summary-card-title{font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.5px;color:var(--f-500);margin-bottom:6px;display:flex;align-items:center;gap:6px;justify-content:space-between}
.summary-text{font-size:12px;line-height:1.6;color:#0f172a}

/* COLLAPSIBLE SECTIONS */
.collapse-header{display:flex;align-items:center;gap:6px;cursor:pointer;padding:6px 0;user-select:none;font-size:11px;font-weight:600;color:var(--sky-600);transition:color .1s}
.collapse-header:hover{color:var(--sky-800)}
.collapse-arrow{font-size:8px;transition:transform .2s;color:var(--f-400)}
.collapse-arrow.open{transform:rotate(90deg)}
.collapse-body{overflow:hidden;max-height:0;transition:max-height .3s ease}
.collapse-body.open{max-height:800px}

/* QUICK-LOOK */
.quicklook-grid{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin:8px 0}
@media(max-width:700px){.quicklook-grid{grid-template-columns:1fr}}
.quicklook-card{border:1px solid var(--sky-200);border-radius:var(--r-sm);padding:10px;background:var(--sky-50);cursor:pointer;transition:all .15s}
.quicklook-card:hover{border-color:var(--sky-400);box-shadow:var(--sh)}
.quicklook-label{font-size:8px;font-weight:700;text-transform:uppercase;letter-spacing:.5px;color:var(--sky-500);margin-bottom:4px}
.quicklook-value{font-size:16px;font-weight:800;color:var(--sky-700)}
.quicklook-unit{font-size:9px;color:var(--f-500);margin-left:2px}
.quicklook-detail{font-size:9px;color:var(--f-500);margin-top:2px}

/* SUMMARY */
.problem-item{display:flex;align-items:center;gap:8px;padding:5px 0;font-size:11px}
.problem-dot{width:7px;height:7px;border-radius:50%;flex-shrink:0}
.problem-dot.active{background:var(--amber)}
.problem-dot.resolved{background:var(--green)}
.problem-dot.critical{background:var(--red)}
.problem-name{font-weight:600}
.problem-detail{color:var(--f-500);margin-left:auto;font-size:10px}

.order-item{display:flex;align-items:center;gap:8px;padding:4px 0;font-size:11px}
.order-status-dot{width:5px;height:5px;border-radius:50%;flex-shrink:0}
.order-status-dot.active{background:var(--blue)}
.order-status-dot.pending{background:var(--amber)}
.order-status-dot.done{background:var(--green)}
.order-name{font-weight:600}
.order-detail{color:var(--f-500);font-size:10px;margin-left:auto}

.vitals-row{display:flex;gap:8px;overflow-x:auto;padding-bottom:4px}
.vital-card{flex-shrink:0;min-width:90px;padding:10px;border:1px solid var(--f-200);border-radius:var(--r-sm);text-align:center;background:var(--white)}
.vital-label{font-size:8px;font-weight:700;text-transform:uppercase;letter-spacing:.5px;color:var(--f-500);margin-bottom:3px}
.vital-value{font-size:18px;font-weight:800;color:var(--sky-700)}
.vital-unit{font-size:9px;color:var(--f-400)}
.vital-trend{font-size:9px;margin-top:1px;font-weight:600}
.vital-trend.up{color:var(--green)}
.vital-trend.down{color:var(--red)}
.vital-trend.stable{color:var(--f-400)}

.timeline-view{position:relative;padding-left:18px}
.timeline-view::before{content:'';position:absolute;left:6px;top:3px;bottom:3px;width:2px;background:var(--sky-200);border-radius:99px}
.tl-item{position:relative;padding:0 0 12px 14px}
.tl-item::before{content:'';position:absolute;left:-16px;top:4px;width:7px;height:7px;border-radius:50%;background:var(--white);border:2px solid var(--sky-400);z-index:2}
.tl-item.critical::before{border-color:var(--red);background:var(--red-bg)}
.tl-item.lab::before{border-color:var(--green);background:var(--green-bg)}
.tl-item.med::before{border-color:var(--purple);background:var(--purple-bg)}
.tl-item.reasoning::before{border-color:var(--sky-500);background:var(--sky-200)}
.tl-time{font-size:9px;font-weight:700;color:var(--f-400);font-family:monospace}
.tl-title{font-size:11px;font-weight:600;margin-top:1px}
.tl-detail{font-size:10px;color:var(--f-500);margin-top:1px}

.problem-card{display:flex;align-items:center;gap:10px;padding:8px 12px;border:1px solid var(--f-200);border-radius:var(--r);margin-bottom:5px;transition:all .1s}
.problem-card:hover{border-color:var(--sky-300)}
.problem-card.done{opacity:.5}
.problem-card .info{flex:1}
.problem-card .name{font-size:12px;font-weight:600}
.problem-card .detail{font-size:10px;color:var(--f-500);margin-top:1px}
.problem-card .actions{display:flex;gap:4px}
.prob-btn{font-size:9px;font-weight:600;padding:3px 8px;border-radius:4px;border:none;cursor:pointer;transition:all .1s;font-family:'Inter','Noto Sans',sans-serif}
.prob-btn.goal{background:var(--sky-50);color:var(--sky-600)}
.prob-btn.resolve{background:var(--green-bg);color:var(--green-text)}
.prob-btn.order{background:var(--purple-bg);color:var(--purple-text)}

.orders-group{margin-bottom:14px}
.orders-group-title{font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.5px;color:var(--f-500);margin-bottom:5px;padding-bottom:3px;border-bottom:1px solid var(--f-200)}
.order-card{display:flex;align-items:center;gap:8px;padding:6px 10px;border:1px solid var(--f-200);border-radius:var(--r-sm);margin-bottom:4px;transition:all .1s}
.order-card:hover{border-color:var(--sky-300);background:var(--sky-50)}
.order-icon{font-size:14px;width:20px;text-align:center}
.order-info{flex:1;min-width:0}
.order-card-name{font-size:11px;font-weight:600}
.order-card-detail{font-size:9px;color:var(--f-500);margin-top:1px}
.order-status-tag{font-size:9px;font-weight:700;padding:1px 5px;border-radius:3px}
.order-status-tag.pending{background:var(--amber-bg);color:var(--amber-text)}
.order-status-tag.done{background:var(--green-bg);color:var(--green-text)}
.order-status-tag.active{background:var(--blue-bg);color:var(--blue-text)}

.monitor-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:12px}
.monitor-card{border:1px solid var(--f-200);border-radius:var(--r);padding:14px;background:var(--white)}
.monitor-title{font-size:11px;font-weight:700;color:var(--sky-700);margin-bottom:8px;display:flex;align-items:center;gap:6px}
.monitor-param{display:flex;justify-content:space-between;padding:4px 0;font-size:11px;border-bottom:1px solid var(--f-100)}
.monitor-param:last-child{border-bottom:none}
.monitor-param .label{color:var(--f-500)}
.monitor-param .value{font-weight:700}
.monitor-param .value.green{color:var(--green)}
.monitor-param .value.amber{color:var(--amber)}
.monitor-param .value.red{color:var(--red)}

.constitutional-flow{display:flex;gap:4px;overflow-x:auto;padding:8px 0;margin-bottom:12px}
.constitutional-step{flex-shrink:0;display:flex;align-items:center;gap:4px;padding:4px 10px;border-radius:20px;font-size:9px;font-weight:600;background:var(--f-100);color:var(--f-500);white-space:nowrap;border:1px solid var(--f-200)}
.constitutional-step.active{background:var(--sky-100);color:var(--sky-700);border-color:var(--sky-300)}
.constitutional-step.done{background:var(--green-bg);color:var(--green-text);border-color:var(--green)}
.constitutional-step .arrow{color:var(--f-300);font-size:10px}

/* CASCADING UPDATE FEEDBACK */
.update-flash{position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);background:var(--white);border:2px solid var(--green);border-radius:var(--r-lg);padding:32px 40px;text-align:center;z-index:1000;box-shadow:var(--sh-lg);animation:slideUp .3s}
.update-flash .check{font-size:48px;animation:checkAnim .4s}
.update-flash .msg{font-size:16px;font-weight:700;color:var(--green-text);margin-top:8px}
.update-flash .sub{font-size:11px;color:var(--f-500);margin-top:4px}
.update-items{text-align:left;margin-top:12px;font-size:11px;display:flex;flex-direction:column;gap:4px}
.update-items .item{display:flex;align-items:center;gap:6px}
.update-items .item .icon{color:var(--green)}

/* COMMUNICATION PANEL */
.comm-panel{background:var(--white);border:1px solid var(--purple);border-radius:var(--r);padding:14px;margin-bottom:16px}
.comm-title{font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.5px;color:var(--purple-text);margin-bottom:8px;display:flex;align-items:center;gap:6px}
.comm-task{display:flex;align-items:center;gap:8px;padding:6px 8px;border:1px solid var(--f-200);border-radius:var(--r-sm);margin-bottom:4px;font-size:11px}
.comm-task .from{font-weight:600;color:var(--purple-text)}
.comm-task .text{flex:1}
.comm-task .status-dot{width:5px;height:5px;border-radius:50%}
.comm-task .status-dot.done{background:var(--green)}
.comm-task .status-dot.pending{background:var(--amber)}
.comm-input-row{display:flex;gap:6px;margin-top:8px}
.comm-input{flex:1;padding:7px 10px;border:1.5px solid var(--f-200);border-radius:var(--r-sm);font-size:11px;font-family:'Inter','Noto Sans',sans-serif;outline:none;transition:border-color .15s}
.comm-input:focus{border-color:var(--purple)}
.comm-send{padding:7px 14px;border-radius:var(--r-sm);border:none;background:var(--purple);color:var(--white);font-size:11px;font-weight:700;cursor:pointer;font-family:'Inter','Noto Sans',sans-serif}
.comm-send:hover{background:var(--purple-t)}

/* ROUND COMPLETE MODAL */
.modal-overlay{position:fixed;inset:0;background:rgba(0,0,0,.4);z-index:999;display:flex;align-items:center;justify-content:center;animation:fadeIn .2s}
.modal-box{background:var(--white);border-radius:var(--r-lg);padding:32px;max-width:480px;width:90%;box-shadow:var(--sh-lg);animation:slideUp .3s;max-height:80vh;overflow-y:auto}
.modal-box h2{font-size:18px;font-weight:800;color:var(--sky-800);margin-bottom:4px;display:flex;align-items:center;gap:8px}
.modal-box .sub{font-size:11px;color:var(--f-500);margin-bottom:16px}
.modal-stat-grid{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:16px}
.modal-stat{border:1px solid var(--f-200);border-radius:var(--r-sm);padding:12px;text-align:center}
.modal-stat .num{font-size:22px;font-weight:800;color:var(--sky-700)}
.modal-stat .label{font-size:9px;color:var(--f-500);margin-top:2px;text-transform:uppercase;letter-spacing:.3px}
.modal-btn{display:block;width:100%;padding:12px;border-radius:var(--r-sm);border:none;background:var(--sky-500);color:var(--white);font-size:13px;font-weight:700;cursor:pointer;font-family:'Inter','Noto Sans',sans-serif;text-align:center}
.modal-btn:hover{background:var(--sky-600)}

.ws-footer{display:flex;gap:8px;padding:12px 20px;border-top:1px solid var(--f-200);background:var(--f-50);flex-wrap:wrap}
.ws-action{font-size:11px;font-weight:700;padding:8px 16px;border-radius:7px;border:none;cursor:pointer;transition:all .1s;font-family:'Inter','Noto Sans',sans-serif}
.ws-action.primary{background:var(--sky-500);color:var(--white)}
.ws-action.primary:hover{background:var(--sky-600)}
.ws-action.outline{background:var(--white);border:1.5px solid var(--f-200);color:var(--f-500)}
.ws-action.outline:hover{border-color:var(--sky-300);color:var(--sky-600)}
.ws-action.green{background:var(--green-bg);color:var(--green-text)}
.ws-action.green:hover{background:var(--green);color:var(--white)}
`;

const bedsData = [
  { num: 1, name: "Mary A.", age: 45, gender: "F", dx: "Community Acquired Pneumonia", days: 3, pills: [{ label: "Better", cls: "green" }, { label: "O₂", cls: "blue" }], priority: "stable", prefill: "O₂ 2L · IV Ceftriaxone · Improved overnight" },
  { num: 2, name: "John K.", age: 62, gender: "M", dx: "Diabetic Ketoacidosis", days: 1, pills: [{ label: "ICU", cls: "red" }, { label: "Insulin", cls: "amber" }], priority: "critical", prefill: "Insulin infusion · ICU monitoring · ABG pH 7.1" },
  { num: 3, name: "Grace M.", age: 28, gender: "F", dx: "Severe Malaria", days: 2, pills: [{ label: "Hb 6.8", cls: "red" }, { label: "Transfuse", cls: "amber" }, { label: "Artesunate", cls: "purple" }], priority: "high", prefill: "Artesunate dose 2/7 · Hb 6.8→8.2 · Transfusing" },
  { num: 4, name: "Peter O.", age: 5, gender: "M", dx: "Dehydration", days: 1, pills: [{ label: "Rehydrating", cls: "green" }], priority: "stable", prefill: "IV D5 1/2 NS · Tolerating sips · CRT improving" },
  { num: 5, name: "Sarah W.", age: 34, gender: "F", dx: "Appendicitis", days: 0, pills: [{ label: "OR Today", cls: "amber" }], priority: "high", prefill: "NBM · IV antibiotics · Consent signed · OR 11:00" },
  { num: 6, name: "David N.", age: 58, gender: "M", dx: "Ischemic Stroke", days: 5, pills: [{ label: "Stable", cls: "green" }, { label: "Physio", cls: "blue" }], priority: "stable", prefill: "ASPIRIN · Physio ongoing · Swallow screen pass" },
  { num: 7, name: "Faith J.", age: 22, gender: "F", dx: "Pyelonephritis", days: 2, pills: [{ label: "Fever", cls: "red" }, { label: "IV ABx", cls: "purple" }], priority: "high", prefill: "IV Ceftriaxone · Fever 38.5°C last night · Urine culture pending" },
  { num: 8, name: "Samuel K.", age: 71, gender: "M", dx: "Heart Failure", days: 4, pills: [{ label: "Diuresis", cls: "amber" }, { label: "Echo Pending", cls: "blue" }], priority: "high", prefill: "IV Furosemide · Daily weights · Echo scheduled today" },
];

const timelineData = [
  { time: "08:01", event: "Arrival", detail: "Walked into A&E", type: "" },
  { time: "08:05", event: "Vitals", detail: "BP 90/60, HR 110, Temp 39.2°C", type: "" },
  { time: "08:08", event: "History Captured", detail: "3 days fever, chills, headache", type: "" },
  { time: "08:25", event: "Examination", detail: "Pallor, tender abdomen, slow cap refill", type: "" },
  { time: "08:40", event: "Investigations Ordered", detail: "CBC, mRDT, blood culture", type: "lab" },
  { time: "09:30", event: "Evidence Graph", detail: "Hb 6.8 g/dL → Severe anemia", type: "critical" },
  { time: "09:45", event: "Clinical Reasoning", detail: "Malaria + Anemia → Severe Malaria (94%)", type: "reasoning" },
  { time: "09:47", event: "Diagnosis", detail: "Severe Malaria (P. falciparum)", type: "reasoning" },
  { time: "09:49", event: "Artesunate Ordered", detail: "2.4mg/kg IV stat", type: "med" },
  { time: "10:15", event: "Blood Transfusion", detail: "1 unit PRBC started", type: "med" },
  { time: "14:00", event: "Fever Improved", detail: "Temp 37.1°C", type: "" },
  { time: "Day 2", event: "Eating Well", detail: "Tolerating oral feeds", type: "" },
  { time: "Day 4", event: "Discharge Criteria Met", detail: "Oral antibiotics, review in 1 week", type: "" },
];

const problemsData = [
  { name: "Fever", status: "active", detail: "Temp 39.2°C → 37.1°C" },
  { name: "Severe Anemia", status: "active", detail: "Hb 6.8 → 8.2, transfusion ongoing" },
  { name: "Dehydration", status: "resolved", detail: "Resolved Day 2" },
  { name: "Poor Feeding", status: "active", detail: "Tolerating sips" },
  { name: "Malaria (Severe)", status: "active", detail: "P. falciparum, Artesunate started" },
];

const ordersData = [
  { category: "💊 Medications", items: [
    { name: "IV Artesunate 2.4mg/kg", detail: "Stat, then 12hrly", status: "active" },
    { name: "IV Ceftriaxone 1g", detail: "BD", status: "active" },
    { name: "Paracetamol 500mg", detail: "PRN if temp >38.5", status: "pending" },
  ]},
  { category: "🧪 Investigations", items: [
    { name: "CBC", detail: "Hb 6.8 → repeat in 24h", status: "done" },
    { name: "mRDT", detail: "Positive — P. falciparum", status: "done" },
    { name: "Blood Culture", detail: "Pending 48h", status: "active" },
  ]},
  { category: "🩸 Blood Products", items: [
    { name: "PRBC 1 unit", detail: "Crossmatch compatible, transfusing", status: "active" },
  ]},
  { category: "🩻 Imaging", items: [
    { name: "Chest X-ray", detail: "Rule out pneumonia", status: "pending" },
  ]},
  { category: "🥗 Diet & Nursing", items: [
    { name: "High protein diet", detail: "As tolerated", status: "active" },
    { name: "Bed rest", detail: "Until Hb stable", status: "active" },
    { name: "Pressure area care", detail: "2hrly turns", status: "active" },
  ]},
  { category: "📡 Monitoring", items: [
    { name: "Hourly Vitals", detail: "BP/HR/Temp", status: "active" },
    { name: "Strict I/O Chart", detail: "Urine output", status: "active" },
    { name: "Bleeding Obs", detail: "4hrly check", status: "active" },
  ]},
  { category: "🔄 Therapy & Review", items: [
    { name: "Physiotherapy review", detail: "Mobilise when stable", status: "pending" },
    { name: "Infectious Disease review", detail: "If no improvement 48h", status: "pending" },
  ]},
];

const vitalsData = [
  { label: "Temp", value: "37.1", unit: "°C", trend: "up" },
  { label: "HR", value: "88", unit: "bpm", trend: "stable" },
  { label: "BP", value: "110/70", unit: "mmHg", trend: "up" },
  { label: "RR", value: "18", unit: "/min", trend: "stable" },
  { label: "SpO₂", value: "97", unit: "%", trend: "up" },
  { label: "Hb", value: "8.2", unit: "g/dL", trend: "up" },
];

const monitoringData = [
  { problem: "Severe Malaria", params: [
    { label: "Parasitemia", value: "Clearing", status: "green" },
    { label: "Temp 6hrly", value: "37.1°C", status: "green" },
    { label: "Hb trend", value: "8.2 → 9.1", status: "green" },
  ]},
  { problem: "Anemia", params: [
    { label: "Hb", value: "8.2 g/dL", status: "amber" },
    { label: "Bleeding", value: "None", status: "green" },
    { label: "Transfusion", value: "Ongoing", status: "amber" },
  ]},
  { problem: "Fluid Balance", params: [
    { label: "Urine Output", value: "1.2 mL/kg/hr", status: "green" },
    { label: "IV Intake", value: "1800 mL/24h", status: "green" },
    { label: "CRT", value: "<2s", status: "green" },
  ]},
];

const alertsData = [
  { text: "CBC ready — Hb 8.2 g/dL (was 6.8)", severity: "info", target: "labs" },
  { text: "Blood culture: No growth at 24h", severity: "info", target: "labs" },
  { text: "Artesunate dose verified by pharmacy", severity: "info", target: "orders" },
  { text: "IV site concern — Nurse requested review", severity: "warning", target: "exam" },
];

const quickLookData = [
  { label: "Temperature Trend", value: "39.2→37.1°C", unit: "↓ 2.1°C", detail: "Last 24h: Fever resolved", color: "var(--green)" },
  { label: "Fluid Balance", value: "+380", unit: "mL", detail: "Intake 1800 · Output 1420", color: "var(--sky-700)" },
  { label: "Current Medications", value: "3 Active", unit: "", detail: "Artesunate · Ceftriaxone · PRBC", color: "var(--purple)" },
  { label: "Hb Trend", value: "6.8→8.2→9.1", unit: "g/dL", detail: "↑ Improving with transfusion", color: "var(--amber)" },
];

function _CosDoctorDashboard() {
  const [sidebarTab, setSidebarTab] = useState("wardround");
  const [roundActive, setRoundActive] = useState(false);
  const [completedBeds, setCompletedBeds] = useState<number[]>([]);
  const [activeBed, setActiveBed] = useState<number | null>(null);
  const [showPatient, setShowPatient] = useState(false);
  const [wsTab, setWsTab] = useState("summary");
  const [filter, setFilter] = useState("all");
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({});
  const [showUpdate, setShowUpdate] = useState(false);
  const [showComplete, setShowComplete] = useState(false);
  const [commTasks, setCommTasks] = useState<{ from: string; text: string; status: string }[]>([
    { from: "Consultant", text: "Repeat Hb in AM", status: "pending" },
    { from: "Consultant", text: "Review transfusion rate", status: "done" },
  ]);
  const [commInput, setCommInput] = useState("");

  const activeBedData = activeBed !== null ? bedsData.find(b => b.num === activeBed) : null;

  const toggleSection = (key: string) => setExpandedSections(prev => ({ ...prev, [key]: !prev[key] }));

  const startRound = useCallback(() => {
    setRoundActive(true); setCompletedBeds([]); setActiveBed(null); setShowPatient(false); setShowComplete(false);
  }, []);

  const endRound = useCallback(() => {
    setRoundActive(false); setShowPatient(false); setActiveBed(null);
  }, []);

  const openBed = useCallback((num: number) => {
    setActiveBed(num); setShowPatient(true); setWsTab("summary");
    setExpandedSections({});
  }, []);

  const completeReview = useCallback(() => {
    if (!activeBed) return;
    setShowUpdate(true);
    setTimeout(() => {
      setShowUpdate(false);
      const newCompleted = completedBeds.includes(activeBed) ? completedBeds : [...completedBeds, activeBed];
      setCompletedBeds(newCompleted);
      const remaining = bedsData.filter(b => !newCompleted.includes(b.num) && b.num !== activeBed);
      if (remaining.length > 0) {
        setActiveBed(remaining[0].num); setWsTab("summary"); setExpandedSections({});
      } else {
        setShowPatient(false); setActiveBed(null);
        setTimeout(() => setShowComplete(true), 300);
      }
    }, 1200);
  }, [activeBed, completedBeds]);

  const handleAlertClick = (target: string) => {
    if (!showPatient) return;
    if (target === "labs") setWsTab("orders");
    else if (target === "orders") setWsTab("orders");
    else if (target === "exam") setWsTab("vitals");
  };

  const sendTask = () => {
    if (!commInput.trim()) return;
    setCommTasks(prev => [...prev, { from: "Dr. Kamau", text: commInput, status: "pending" }]);
    setCommInput("");
  };

  const toggleDone = useCallback((num: number) => {
    setCompletedBeds(prev => prev.includes(num) ? prev.filter(b => b !== num) : [...prev, num]);
  }, []);

  const notDoneBeds = bedsData.filter(b => !completedBeds.includes(b.num));
  const doneBeds = bedsData.filter(b => completedBeds.includes(b.num));
  const displayBeds = filter === "all" ? bedsData : filter === "pending" ? notDoneBeds : filter === "done" ? doneBeds : bedsData;

  const stats = [
    { icon: "🛏️", value: "24", label: "Total Beds", color: "sky" },
    { icon: "🆕", value: "3", label: "New Admissions", color: "green" },
    { icon: "⚠️", value: "2", label: "Critical", color: "red" },
    { icon: "🧪", value: "5", label: "Awaiting Labs", color: "amber" },
    { icon: "🚪", value: "4", label: "Discharges Today", color: "sky" },
  ];

  const constitutionalSteps = [
    { id: "patient", label: "Patient", icon: "👤" },
    { id: "encounter", label: "Encounter", icon: "📋" },
    { id: "history", label: "History", icon: "📖" },
    { id: "exam", label: "Examination", icon: "🔍" },
    { id: "investigations", label: "Investigations", icon: "🧪" },
    { id: "evidence", label: "Evidence Graph", icon: "🔗" },
    { id: "reasoning", label: "Clinical Reasoning", icon: "🧠" },
    { id: "diagnosis", label: "Diagnosis", icon: "🎯" },
    { id: "orders", label: "Orders", icon: "📝" },
    { id: "monitoring", label: "Monitoring", icon: "📡" },
    { id: "timeline", label: "Timeline", icon: "⏱" },
    { id: "disposition", label: "Disposition", icon: "🚪" },
    { id: "followup", label: "Follow-Up", icon: "📅" },
  ];

  return (
    <>
      <style>{S}</style>

      {/* UPDATE FEEDBACK FLASH */}
      {showUpdate && (
        <div className="update-flash">
          <div className="check">✔</div>
          <div className="msg">Plan Accepted</div>
          <div className="sub">Updating all systems...</div>
          <div className="update-items">
            <div className="item"><span className="icon">✓</span> Orders updated</div>
            <div className="item"><span className="icon">✓</span> Progress note generated</div>
            <div className="item"><span className="icon">✓</span> To-do list synced</div>
            <div className="item"><span className="icon">✓</span> Pharmacy notified</div>
            <div className="item"><span className="icon">✓</span> Nurse assigned</div>
          </div>
        </div>
      )}

      {/* ROUND COMPLETE MODAL */}
      {showComplete && (
        <div className="modal-overlay" onClick={() => setShowComplete(false)}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <h2>🏁 Ward Round Complete</h2>
            <div className="sub">Male Medical Ward · {new Date().toLocaleDateString()}</div>
            <div className="modal-stat-grid">
              <div className="modal-stat"><div className="num">{bedsData.length}</div><div className="label">Patients Reviewed</div></div>
              <div className="modal-stat"><div className="num">6</div><div className="label">Investigations Ordered</div></div>
              <div className="modal-stat"><div className="num">3</div><div className="label">Discharges</div></div>
              <div className="modal-stat"><div className="num">2</div><div className="label">Referrals</div></div>
              <div className="modal-stat"><div className="num">12</div><div className="label">Medication Changes</div></div>
              <div className="modal-stat"><div className="num">4</div><div className="label">Reviews Pending</div></div>
            </div>
            <div style={{fontSize:11,color:'var(--f-500)',marginBottom:16,lineHeight:1.6}}>
              All notes signed. 6 investigations ordered. 3 discharges completed. 2 referrals made. 12 medication changes communicated to pharmacy. 4 reviews pending for afternoon round.
            </div>
            <button className="modal-btn" onClick={() => setShowComplete(false)}>Done — Return to Dashboard</button>
          </div>
        </div>
      )}

      <div className="cos-layout">
        {/* SIDEBAR */}
        <aside className="cos-sidebar">
          <div className="cos-brand"><span className="cos-brand-name">AMEXAN</span><span className="cos-brand-badge">COS</span></div>
          <nav className="cos-nav">
            <div className="cos-nav-section">OPERATIONS</div>
            {[
              { id: "dashboard", icon: "📊", label: "Dashboard" },
              { id: "wardround", icon: "🛏️", label: "Ward Round", badge: roundActive ? `${completedBeds.length}/${bedsData.length}` : undefined, badgeCls: "green" },
              { id: "encounters", icon: "📋", label: "Encounters" },
            ].map(item => (
              <button key={item.id} className={`cos-nav-item ${sidebarTab === item.id ? "active" : ""}`} onClick={() => setSidebarTab(item.id)}>
                <span className="icon">{item.icon}</span>{item.label}
                {item.badge && <span className={`badge ${item.badgeCls || ""}`}>{item.badge}</span>}
              </button>
            ))}
            <div className="cos-nav-section">ENGINES</div>
            {[
              { id: "orders", icon: "📝", label: "Universal Orders" },
              { id: "monitoring", icon: "📡", label: "Monitoring" },
              { id: "timeline", icon: "⏱", label: "Timeline" },
              { id: "docs", icon: "📄", label: "Documentation" },
            ].map(item => (
              <button key={item.id} className={`cos-nav-item ${sidebarTab === item.id ? "active" : ""}`} onClick={() => setSidebarTab(item.id)}>
                <span className="icon">{item.icon}</span>{item.label}
              </button>
            ))}
            <div className="cos-nav-section">INTELLIGENCE</div>
            {[
              { id: "knowledge", icon: "🧠", label: "Knowledge Graph" },
              { id: "analytics", icon: "📈", label: "Analytics" },
              { id: "learning", icon: "🔄", label: "Learning" },
            ].map(item => (
              <button key={item.id} className={`cos-nav-item ${sidebarTab === item.id ? "active" : ""}`} onClick={() => setSidebarTab(item.id)}>
                <span className="icon">{item.icon}</span>{item.label}
              </button>
            ))}
          </nav>
          <div className="cos-profile">
            <div className="cos-avatar">JK</div>
            <div className="cos-profile-info">
              <div className="cos-profile-name">Dr. John Kamau</div>
              <div className="cos-profile-role">Paediatrician · Ward 3</div>
            </div>
          </div>
        </aside>

        {/* MAIN */}
        <div className="cos-main">
          <header className="cos-topbar">
            <div className="cos-greeting">Good morning, <strong>Dr. Kamau</strong></div>
            <div className="cos-topbar-right">
              {roundActive && (
                <span className="cos-round-badge"><span className="dot" />Round Active · {completedBeds.length}/{bedsData.length}</span>
              )}
              <button className="cos-topbar-btn">🔔<span className="notif-dot" /></button>
              <button className="cos-topbar-btn">👤</button>
            </div>
          </header>

          <div className="cos-content">
            {/* STATS */}
            <div className="stats-row">
              {stats.map((s, i) => (
                <div key={i} className="stat-card">
                  <div className={`stat-icon ${s.color}`}>{s.icon}</div>
                  <div><div className="stat-num">{s.value}</div><div className="stat-label">{s.label}</div></div>
                </div>
              ))}
            </div>

            {/* QUICK ACTIONS + COMMUNICATION */}
            <div className="quick-actions">
              {!roundActive ? (
                <button className="q-btn primary" onClick={startRound}>▶ Start Ward Round</button>
              ) : (
                <button className="q-btn primary" onClick={endRound}>⏹ End Ward Round</button>
              )}
              <button className="q-btn">➕ New Admission</button>
              <button className="q-btn">📋 Pending Reviews</button>
              <button className="q-btn">🧪 Lab Results</button>
              <button className="q-btn">🚪 Discharges</button>
              <button className="q-btn comm">💬 Tasks ({commTasks.filter(t => t.status === "pending").length})</button>
            </div>

            {/* COMMUNICATION PANEL */}
            {sidebarTab === "wardround" && roundActive && (
              <div className="comm-panel">
                <div className="comm-title">💬 Task Assignment — Consultant Communication</div>
                {commTasks.map((t, i) => (
                  <div key={i} className="comm-task">
                    <span className={`status-dot ${t.status}`} />
                    <span className="from">{t.from}:</span>
                    <span className="text">{t.text}</span>
                    <span style={{fontSize:9,fontWeight:700,padding:'1px 5px',borderRadius:3,background:t.status==='done'?'var(--green-bg)':'var(--amber-bg)',color:t.status==='done'?'var(--green-text)':'var(--amber-text)'}}>{t.status}</span>
                  </div>
                ))}
                <div className="comm-input-row">
                  <input className="comm-input" placeholder="Assign task to team..." value={commInput} onChange={e => setCommInput(e.target.value)} onKeyDown={e => e.key === "Enter" && sendTask()} />
                  <button className="comm-send" onClick={sendTask}>Assign</button>
                </div>
              </div>
            )}

            {/* ALERTS — actionable */}
            {alertsData.length > 0 && (
              <div className="alerts-panel">
                <div className="alerts-title">🔔 Active Alerts <span className="count">{alertsData.length}</span></div>
                {alertsData.map((a, i) => (
                  <div key={i} className={`alert-item ${a.severity}`} onClick={() => handleAlertClick(a.target)} style={{cursor: showPatient ? 'pointer' : 'default'}}>
                    <span className={`alert-dot ${a.severity === "critical" ? "red" : a.severity === "warning" ? "amber" : "blue"}`} />
                    <span>{a.text}</span>
                    {showPatient && <span className="alert-action">Open →</span>}
                  </div>
                ))}
              </div>
            )}

            {/* WARD ROUND */}
            {sidebarTab === "wardround" && (
              <div className="round-container">
                <div className="round-header">
                  <h2>🛏️ Male Medical Ward · Ward Round</h2>
                  <div className="round-status">
                    {roundActive && <span>⏺ LIVE · {completedBeds.length}/{bedsData.length}</span>}
                    {!roundActive && <span>{bedsData.length} patients · {notDoneBeds.length} pending</span>}
                  </div>
                </div>
                {roundActive && (
                  <div className="round-progress">
                    <div className="round-progress-fill" style={{ width: `${(completedBeds.length / bedsData.length) * 100}%` }} />
                  </div>
                )}
                <div className="round-body">
                  {/* PRE-ROUND PREFILL BAR */}
                  {roundActive && activeBedData && (
                    <div className="prefill-bar">
                      <span className="prefill-label">📋 Pre-round Data</span>
                      <span className="prefill-item"><strong>Overnight:</strong> {activeBedData.prefill}</span>
                    </div>
                  )}

                  {/* Constitutional Flow Indicator */}
                  {showPatient && activeBedData && (
                    <div className="constitutional-flow">
                      {constitutionalSteps.slice(0, 13).map((step, i) => (
                        <span key={step.id} className={`constitutional-step ${i < 9 ? "done" : i === 9 ? "active" : ""}`}>
                          {step.icon} {step.label}
                          {i < 12 && <span className="arrow">→</span>}
                        </span>
                      ))}
                    </div>
                  )}

                  <div className="filter-row">
                    <div className={`filter-chip ${filter === "all" ? "active" : ""}`} onClick={() => setFilter("all")}>All ({bedsData.length})</div>
                    <div className={`filter-chip ${filter === "pending" ? "active" : ""}`} onClick={() => setFilter("pending")}>Pending ({notDoneBeds.length})</div>
                    <div className={`filter-chip ${filter === "done" ? "active" : ""}`} onClick={() => setFilter("done")}>Reviewed ({doneBeds.length})</div>
                  </div>

                  <div className="bed-queue">
                    {displayBeds.map(bed => {
                      const isDone = completedBeds.includes(bed.num);
                      return (
                        <div key={bed.num} className={`bed-card ${isDone ? "done" : ""} ${activeBed === bed.num && showPatient ? "active" : ""}`} onClick={() => openBed(bed.num)}>
                          <div className="bed-num">{bed.num}</div>
                          <div className="bed-info">
                            <div className="bed-name">{bed.name} · {bed.age}{bed.gender}</div>
                            <div className="bed-dx">{bed.dx} · Day {bed.days}</div>
                            <div className="bed-tags">{bed.pills.map((p, j) => <span key={j} className={`bed-tag ${p.cls}`}>{p.label}</span>)}</div>
                          </div>
                          <div className="bed-actions">
                            {isDone ? (
                              <button className="bed-btn done-btn" onClick={(e) => { e.stopPropagation(); toggleDone(bed.num); }}>✓ Reviewed</button>
                            ) : (
                              <button className="bed-btn primary" onClick={(e) => { e.stopPropagation(); openBed(bed.num); }}>Review</button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* PATIENT WORKSPACE */}
            {showPatient && activeBedData && (
              <div className="patient-ws">
                <div className="ws-top">
                  <div className="ws-patient">
                    <div className="ws-avatar">{activeBedData.name.charAt(0)}</div>
                    <div className="ws-info">
                      <div className="ws-name">{activeBedData.name} · {activeBedData.age}{activeBedData.gender}</div>
                      <div className="ws-meta">{activeBedData.dx} · Day {activeBedData.days} · Bed {activeBedData.num}</div>
                    </div>
                    <div className="ws-status">
                      <span className={`ws-pill ${activeBedData.priority === "critical" ? "priority" : activeBedData.priority === "stable" ? "stable" : "priority"}`}>
                        {activeBedData.priority === "critical" ? "Critical" : activeBedData.priority === "high" ? "High Priority" : "Stable"}
                      </span>
                      <span className="ws-pill inpatient">Inpatient</span>
                    </div>
                  </div>
                  <button className="ws-close" onClick={() => setShowPatient(false)}>✕</button>
                </div>

                {/* Tabs */}
                <div className="ws-tabs">
                  {[
                    { id: "summary", label: "Summary", icon: "📊" },
                    { id: "timeline", label: "Timeline", icon: "⏱" },
                    { id: "problems", label: "Problems", icon: "🎯" },
                    { id: "vitals", label: "Vitals", icon: "🌡️" },
                    { id: "orders", label: "Orders", icon: "📝" },
                    { id: "monitoring_tab", label: "Monitoring", icon: "📡" },
                  ].map(tab => (
                    <button key={tab.id} className={`ws-tab ${wsTab === tab.id ? "active" : ""}`} onClick={() => setWsTab(tab.id)}>
                      <span className="tab-icon">{tab.icon}</span>{tab.label}
                    </button>
                  ))}
                </div>

                <div className="ws-body">
                  {/* SUMMARY with QUICK-LOOK and COLLAPSIBLE SECTIONS */}
                  <div className={`ws-section ${wsTab === "summary" ? "active" : ""}`}>
                    <div className="summary-grid">
                      <div className="summary-card full">
                        <div className="summary-card-title">
                          <span>📋 Today's Summary</span>
                        </div>
                        <div className="summary-text">Better overnight. No fever since 14:00. Eating well. Awaiting repeat CBC. Transfusion ongoing. Plan: complete Artesunate course, repeat Hb in AM, consider discharge Day 4.</div>
                      </div>

                      {/* QUICK-LOOK CARDS — One click answers */}
                      <div className="summary-card full">
                        <div className="summary-card-title">
                          <span>🔍 Quick Look — One Click Answers</span>
                        </div>
                        <div className="quicklook-grid">
                          {quickLookData.map((q, i) => (
                            <div key={i} className="quicklook-card" onClick={() => { if (i === 2) setWsTab("orders"); else if (i === 3 || i === 0) setWsTab("vitals"); }}>
                              <div className="quicklook-label">{q.label}</div>
                              <div className="quicklook-value">{q.value}<span className="quicklook-unit">{q.unit}</span></div>
                              <div className="quicklook-detail">{q.detail}</div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* COLLAPSIBLE: History */}
                      <div className="summary-card">
                        <div className="summary-card-title">
                          <span>📖 History</span>
                          <div className="collapse-header" onClick={() => toggleSection("history")}>
                            <span className={`collapse-arrow ${expandedSections.history ? "open" : ""}`}>▶</span>
                            {expandedSections.history ? "Hide" : "Expand"}
                          </div>
                        </div>
                        <div className="summary-text" style={{fontSize:11}}>3 days fever, chills, headache, vomiting. No convulsions. No known allergies.</div>
                        <div className={`collapse-body ${expandedSections.history ? "open" : ""}`}>
                          <div style={{marginTop:8,fontSize:11,lineHeight:1.7,color:'var(--f-500)'}}>
                            <strong>HPI:</strong> Previously well. 3 days ago developed high-grade fever (39.2°C), chills, rigors. Headache generalized. Vomiting ×3.<br />
                            <strong>PMH:</strong> None. No hospitalizations. No surgeries.<br />
                            <strong>Medications:</strong> Paracetamol PRN before admission.<br />
                            <strong>Allergies:</strong> NKDA<br />
                            <strong>Social:</strong> Lives in malaria-endemic area. Teacher. Non-smoker.
                          </div>
                        </div>
                      </div>

                      {/* COLLAPSIBLE: Examination */}
                      <div className="summary-card">
                        <div className="summary-card-title">
                          <span>🔍 Examination</span>
                          <div className="collapse-header" onClick={() => toggleSection("exam")}>
                            <span className={`collapse-arrow ${expandedSections.exam ? "open" : ""}`}>▶</span>
                            {expandedSections.exam ? "Hide" : "Expand"}
                          </div>
                        </div>
                        <div className="summary-text" style={{fontSize:11}}>Pallor ++, tender epigastrium, CRT &gt;3s. GCS 15/15.</div>
                        <div className={`collapse-body ${expandedSections.exam ? "open" : ""}`}>
                          <div style={{marginTop:8,fontSize:11,lineHeight:1.7,color:'var(--f-500)'}}>
                            <strong>General:</strong> Ill-looking, pale, lethargic. Conjunctival pallor ++. Jaundice +.<br />
                            <strong>CVS:</strong> HR 110, BP 90/60, CRT &gt;3s, JVP not raised.<br />
                            <strong>Resp:</strong> RR 24, clear lungs, SpO₂ 96%.<br />
                            <strong>Abd:</strong> Mild epigastric tenderness, liver 2cm palpable, spleen not palpable.<br />
                            <strong>CNS:</strong> GCS 15/15, pupils EARL, normal tone and power.
                          </div>
                        </div>
                      </div>

                      {/* COLLAPSIBLE: Labs */}
                      <div className="summary-card full">
                        <div className="summary-card-title">
                          <span>🧪 Investigations</span>
                          <div className="collapse-header" onClick={() => toggleSection("labs")}>
                            <span className={`collapse-arrow ${expandedSections.labs ? "open" : ""}`}>▶</span>
                            {expandedSections.labs ? "Hide" : "Expand"}
                          </div>
                        </div>
                        <div className="summary-text" style={{fontSize:11}}>Hb 8.2 g/dL · mRDT Positive · Blood culture pending</div>
                        <div className={`collapse-body ${expandedSections.labs ? "open" : ""}`}>
                          <div style={{marginTop:8,fontSize:11}}>
                            <table style={{width:'100%',borderCollapse:'collapse'}}>
                              <thead><tr style={{textAlign:'left',fontSize:9,color:'var(--f-500)',textTransform:'uppercase'}}><th style={{padding:'4px 6px'}}>Test</th><th style={{padding:'4px 6px'}}>Value</th><th style={{padding:'4px 6px'}}>Flag</th><th style={{padding:'4px 6px'}}>Trend</th></tr></thead>
                              <tbody>
                                {[
                                  {t:'Hemoglobin',v:'8.2 g/dL',f:'LOW',c:'var(--red)'},
                                  {t:'WBC',v:'11.2 ×10⁹/L',f:'HIGH',c:'var(--red)'},
                                  {t:'Platelets',v:'98 ×10⁹/L',f:'LOW',c:'var(--amber)'},
                                  {t:'mRDT',v:'Positive',f:'POS',c:'var(--red)'},
                                  {t:'Blood Culture',v:'No growth 24h',f:'—',c:'var(--f-500)'},
                                ].map((r,ri) => (
                                  <tr key={ri} style={{borderBottom:'1px solid var(--f-100)'}}>
                                    <td style={{padding:'4px 6px',fontWeight:600}}>{r.t}</td>
                                    <td style={{padding:'4px 6px'}}>{r.v}</td>
                                    <td style={{padding:'4px 6px',color:r.c,fontWeight:700}}>{r.f}</td>
                                    <td style={{padding:'4px 6px',color:'var(--sky-600)'}}>↑</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      </div>

                      {/* Active Problems */}
                      <div className="summary-card">
                        <div className="summary-card-title">🎯 Active Problems</div>
                        {problemsData.filter(p => p.status === "active").map((p, i) => (
                          <div key={i} className="problem-item">
                            <span className={`problem-dot ${p.status}`} />
                            <span className="problem-name">{p.name}</span>
                            <span className="problem-detail">{p.detail}</span>
                          </div>
                        ))}
                      </div>

                      {/* Current Orders */}
                      <div className="summary-card">
                        <div className="summary-card-title">📝 Current Orders</div>
                        {ordersData.flatMap(c => c.items).slice(0, 5).map((o, i) => (
                          <div key={i} className="order-item">
                            <span className={`order-status-dot ${o.status}`} />
                            <span className="order-name">{o.name}</span>
                            <span className="order-detail">{o.detail}</span>
                          </div>
                        ))}
                      </div>

                      {/* Today's Plan */}
                      <div className="summary-card full" style={{ background: "var(--sky-50)", borderColor: "var(--sky-200)" }}>
                        <div className="summary-card-title" style={{ color: "var(--sky-600)" }}>📋 Today's Plan</div>
                        <div className="summary-text" style={{ fontSize: 11 }}>
                          ✓ Continue IV Artesunate 2.4mg/kg 12hrly<br />
                          ✓ Complete blood transfusion (1 unit PRBC)<br />
                          ✓ Repeat Hb in AM<br />
                          ✓ Strict I/O chart monitoring<br />
                          ✓ Monitor for bleeding<br />
                          ⌛ Consider discharge Day 4 if afebrile 24h
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* TIMELINE */}
                  <div className={`ws-section ${wsTab === "timeline" ? "active" : ""}`}>
                    <div className="timeline-view">
                      {timelineData.map((t, i) => (
                        <div key={i} className={`tl-item ${t.type}`}>
                          <div className="tl-time">{t.time}</div>
                          <div className="tl-title">{t.event}</div>
                          <div className="tl-detail">{t.detail}</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* PROBLEMS */}
                  <div className={`ws-section ${wsTab === "problems" ? "active" : ""}`}>
                    {problemsData.map((p, i) => (
                      <div key={i} className={`problem-card ${p.status === "resolved" ? "done" : ""}`}>
                        <span className={`problem-dot ${p.status}`} />
                        <div className="info">
                          <div className="name">{p.name}</div>
                          <div className="detail">{p.detail}</div>
                        </div>
                        <div className="actions">
                          {p.status === "active" && <button className="prob-btn goal">Goals</button>}
                          {p.status === "active" && <button className="prob-btn resolve">Resolve</button>}
                          {p.status === "active" && <button className="prob-btn order">Order</button>}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* VITALS */}
                  <div className={`ws-section ${wsTab === "vitals" ? "active" : ""}`}>
                    <div className="vitals-row" style={{ flexWrap: "wrap" }}>
                      {vitalsData.map((v, i) => (
                        <div key={i} className="vital-card" style={{ flex: "1 1 120px", minWidth: 120 }}>
                          <div className="vital-label">{v.label}</div>
                          <div className="vital-value">{v.value}<span className="vital-unit">{v.unit}</span></div>
                          <div className={`vital-trend ${v.trend}`}>{v.trend === "up" ? "↑ Improving" : v.trend === "down" ? "↓ Declining" : "→ Stable"}</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* ORDERS — ALL TYPES */}
                  <div className={`ws-section ${wsTab === "orders" ? "active" : ""}`}>
                    {ordersData.map((cat, i) => (
                      <div key={i} className="orders-group">
                        <div className="orders-group-title">{cat.category}</div>
                        {cat.items.map((o, j) => (
                          <div key={j} className="order-card">
                            <span className="order-icon">{cat.category.charAt(0)}</span>
                            <div className="order-info">
                              <div className="order-card-name">{o.name}</div>
                              <div className="order-card-detail">{o.detail}</div>
                            </div>
                            <span className={`order-status-tag ${o.status}`}>{o.status}</span>
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>

                  {/* MONITORING */}
                  <div className={`ws-section ${wsTab === "monitoring_tab" ? "active" : ""}`}>
                    <div className="monitor-grid">
                      {monitoringData.map((m, i) => (
                        <div key={i} className="monitor-card">
                          <div className="monitor-title">📡 {m.problem}</div>
                          {m.params.map((p, j) => (
                            <div key={j} className="monitor-param">
                              <span className="label">{p.label}</span>
                              <span className={`value ${p.status}`}>{p.value}</span>
                            </div>
                          ))}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* FOOTER */}
                <div className="ws-footer">
                  <button className="ws-action primary" onClick={completeReview}>
                    ✔ Accept Plan {activeBed && completedBeds.includes(activeBed) ? "(Already Reviewed)" : activeBed ? `& Update Everything (Bed ${activeBed})` : ""}
                  </button>
                  <button className="ws-action outline">✏️ Add Order</button>
                  <button className="ws-action outline">📝 Write Progress Note</button>
                  <button className="ws-action outline">💬 Assign Task</button>
                  {activeBed && !completedBeds.includes(activeBed) && (
                    <button className="ws-action green" onClick={() => setShowPatient(false)}>⏭ Skip for Now</button>
                  )}
                </div>
              </div>
            )}

            {/* Placeholder for other tabs */}
            {sidebarTab !== "wardround" && !showPatient && (
              <div style={{ background: "var(--white)", border: "1px solid var(--f-200)", borderRadius: "var(--r-lg)", padding: 40, textAlign: "center" }}>
                <div style={{ fontSize: 32, marginBottom: 12 }}>
                  {sidebarTab === "dashboard" ? "📊" : sidebarTab === "encounters" ? "📋" : sidebarTab === "orders" ? "📝" :
                   sidebarTab === "monitoring" ? "📡" : sidebarTab === "timeline" ? "⏱" : sidebarTab === "docs" ? "📄" :
                   sidebarTab === "knowledge" ? "🧠" : sidebarTab === "analytics" ? "📈" : sidebarTab === "learning" ? "🔄" : "🔧"}
                </div>
                <div style={{ fontSize: 18, fontWeight: 700, color: "var(--sky-700)", marginBottom: 4 }}>
                  {sidebarTab === "dashboard" ? "Dashboard" : sidebarTab === "encounters" ? "Encounters" :
                   sidebarTab === "orders" ? "Universal Orders Engine" : sidebarTab === "monitoring" ? "Monitoring Engine" :
                   sidebarTab === "timeline" ? "Clinical Timeline Engine" : sidebarTab === "docs" ? "Documentation Engine" :
                   sidebarTab === "knowledge" ? "Universal Knowledge Graph" : sidebarTab === "analytics" ? "Analytics Engine" :
                   sidebarTab === "learning" ? "Learning Engine" : "Engine"}
                </div>
                <div style={{ fontSize: 13, color: "var(--f-500)", maxWidth: 400, margin: "0 auto", lineHeight: 1.6 }}>
                  {sidebarTab === "orders" && "Universal Orders Engine — Every order inherits the Order base class. Medications, blood products, imaging, diet, nursing, monitoring, therapy, review all follow one architecture."}
                  {sidebarTab === "monitoring" && "Monitoring Engine — Every problem creates monitoring with targets, alerts, and escalation rules."}
                  {sidebarTab === "timeline" && "Clinical Timeline Engine — Every event is a moment. Replay the entire admission chronologically."}
                  {sidebarTab === "docs" && "Documentation Engine — Which document? Then render. Admission, progress, discharge, referral all generated from encounter facts."}
                  {sidebarTab === "knowledge" && "Universal Knowledge Graph — Symptoms, signs, diseases, drugs, scores, guidelines. Everything is a node."}
                  {sidebarTab === "analytics" && "Analytics Engine — Real-time hospital intelligence. Census, throughput, outcomes."}
                  {sidebarTab === "learning" && "Learning Engine — Every encounter becomes non-identifiable knowledge. The hospital learns."}
                  {sidebarTab === "dashboard" && "Configure your workspace dashboard."}
                  {sidebarTab === "encounters" && "Browse all patient encounters. Filter by ward, date, status."}
                </div>
              </div>
            )}

          </div>
        </div>
      </div>
    </>
  );
}

const SUPPORTED_ROLES = [
  'clinical', 'telemedicine', 'teaching', 'clinical_leadership',
] as const;

export default function CosDoctorDashboard() {
  return (
    <WorkspaceGuard supportedRoles={SUPPORTED_ROLES}>
      <_CosDoctorDashboard />
    </WorkspaceGuard>
  );
}
