# AMEXAN Clinician Clinical Operating System (COS)

## Volume 1 — Engines 8–13: The Reasoning Backbone

**Version:** 1.0.0
**Status:** Draft
**Last Updated:** 2026-08-07
**Editor:** AMEXAN Clinical OS
**License:** Proprietary — AMEXAN Internal

---

### Scope

This volume completes the clinician Clinical Operating System with the **reasoning and
improvement layer**. Engines 1–7 (Dashboard, Ward Round, Encounters, Universal Orders,
Monitoring, Timeline, Documentation) produce rich, structured, connected data. Engines
8–13 convert that data into clinical context, decision support, governed knowledge, and
continuous institutional learning — without ever overruling the clinician.

---

### Constitutional premise

```text
PATIENT
  ↓
ENCOUNTER
  ↓
ORDERS / RESULTS
  ↓
MONITORING
  ↓
TIMELINE
  ↓
DOCUMENTATION
  ↓
KNOWLEDGE GRAPH
  ↓
ANALYTICS
  ↓
LEARNING
  ↓
GOVERNANCE / PROTOCOLS
  ↓
KNOWLEDGE BACK INTO CARE
  ↓
BETTER FUTURE TREATMENT
```

The three engines in this volume are **not decorative pages**. They operate on the
authoritative facts already collected by Engines 1–7 and are always **patient and context
aware**: opening one of them from a patient encounter preserves the relevant context rather
than dumping the clinician into an unrelated global dashboard.

---

## Engine Matrix (Complete 13-Part Core)

| # | Engine | Core Purpose |
|---|--------|--------------|
| 1 | Dashboard | What needs attention? |
| 2 | Ward Round | Which patients require review? |
| 3 | Encounters | What clinical interaction am I performing? |
| 4 | Universal Orders | What action/request am I initiating? |
| 5 | Monitoring | What is changing now? |
| 6 | Timeline | What has happened over time? |
| 7 | Documentation | What is the formal record? |
| 8 | **Knowledge Graph** | **How is everything clinically connected?** |
| 9 | **Analytics** | **What patterns / workload / outcomes matter?** |
| 10 | **Learning** | **How do clinician & institution improve?** |
| 11 | **Clinical Intelligence** | **What reasoning supports this?** |
| 12 | **Knowledge & Guidelines** | **What is the governed truth?** |
| 13 | **Learning & Research** | **How does institutional learning compound?** |

---

## Chapters

| Chapter | Title |
|---------|-------|
| 08 | Knowledge Graph |
| 09 | Analytics |
| 10 | Learning |
| 11 | Clinical Intelligence |
| 12 | Knowledge & Guidelines |
| 13 | Learning & Research |

---

## Conventions

1. Engines 8–10 operate **over** the facts of Engines 1–7.
2. Engines 11–13 form the **reasoning backbone** sitting on top of all prior engines.
3. Every surfaced recommendation is **explainable** and **traceable** to source evidence.
4. The clinician remains the **decision-maker**; the system never silently concludes.
5. PostgreSQL = durable clinical truth · Neo4j = relationships/context ·
   Firestore = real-time interaction state.