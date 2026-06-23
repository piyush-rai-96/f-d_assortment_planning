/*
 * Seed data for the Today dashboard — updated for SS 2026.
 *
 * V3 changes:
 *  - Season: SS 2026
 *  - Pipeline phases: Portfolio renamed Hindsight, Oracle renamed Approval
 *  - PRIORITY_LOGIC: deterministic priority action based on pipeline state
 *  - NEEDS_ATTENTION: state-derived, max 4 shown
 *  - Added workspace data seed reference counts
 */
export const CURRENT_USER = {
  name: "Karen M.",
  role: "VP Merchandising · Corporate",
};

export const TODAY_SEED = {
  season: "SS 2026",
  catalogueSkuCount: 35,
  coreCount: 5,
  natLocked: 0,
  agentRan: false,
  fcstReceived: 0,
  submittedRatio: 0.26,   // 18/70 stores submitted
  activePlans: 2,
  unreadIntel: 4,
  openNotifications: 3,
};

// Per-velocity "% of network" labels (display only)
export const VELOCITY_NETWORK_PCT = { A: 5, B: 15, C: 60, D: 15 };

// SS 2026 Pipeline phases (V3: Hindsight first, Approval last)
export const PIPELINE_PHASES = [
  { label: "Hindsight",  mod: "hindsight",       pct: 100 },
  { label: "Forecast",   mod: "forecast",         pct: 100 },
  { label: "Catalogue",  mod: "catalogue",        pct:  45 },
  { label: "National",   mod: "national",         pct:  70 },
  { label: "Regional",   mod: "regional",         pct:  75 },
  { label: "Curation",   mod: "store-curation",   pct:  26 },
  { label: "MPI/NPI",    mod: "mpi",              pct:   0 },
  { label: "Approval",   mod: "approval",         pct:   0 },
];

/*
 * Priority action logic: determines the single most important action card
 * on Today, derived from pipeline state. First matching condition wins.
 */
export const PRIORITY_ACTIONS = [
  {
    condition: "agentNotRun",
    severity: "error",
    title: "Run the assortment agent",
    sub: "Catalogue step is waiting — agent unlock tiers and SKU recommendations for SS 2026.",
    mod: "catalogue",
    cta: "Go to Catalogue",
  },
  {
    condition: "natCorePending",
    severity: "warning",
    title: "National Core pending review",
    sub: "Agent has surfaced recommendations — review and lock National Core before regional review opens.",
    mod: "national",
    cta: "Review National Core",
  },
  {
    condition: "noClusterAdds",
    severity: "warning",
    title: "Regional review not started",
    sub: "6 of 8 cluster leads have not submitted cluster-level picks for SS 2026.",
    mod: "regional",
    cta: "Open Regional Review",
  },
  {
    condition: "storesIncomplete",
    severity: "warning",
    title: "8 stores have not started curation",
    sub: "Gulf cluster auto-closes Sep 20 — 52 stores still pending submission.",
    mod: "store-curation",
    cta: "Open Store Curation",
  },
  {
    condition: "default",
    severity: "info",
    title: "Curation progressing — review MPI drops",
    sub: "18 stores submitted. Review MPI / NPI drop reconciliation before final lock.",
    mod: "mpi",
    cta: "Review MPI / NPI",
  },
];

// "Needs attention" state-derived cards (max 4 shown in V3)
export const NEEDS_ATTENTION = [
  { severity: "error",   title: "170 SKUs need national decision",     sub: "→ National Core",       mod: "national"   },
  { severity: "warning", title: "No cluster scenario accepted",         sub: "→ Location Clustering", mod: "clustering" },
  { severity: "warning", title: "333 cluster decisions pending",        sub: "→ Regional Review",     mod: "regional"   },
  { severity: "info",    title: "3 intel signals awaiting model apply", sub: "→ Market Intelligence", mod: "intel"      },
];

export const RECENT_ACTIVITY = [
  { time: "2m ago",   icon: "✅", text: "107 Almeda submitted curation",                    severity: "success", mod: "store-curation" },
  { time: "18m ago",  icon: "🤖", text: "Agent flagged SOL-SEASHELL for expansion",          severity: "violet",  mod: "catalogue" },
  { time: "1h ago",   icon: "📊", text: "Forecast received for AQG-WARMOAK",                severity: "info",    mod: "forecast" },
  { time: "2h ago",   icon: "🔒", text: "National Core locked · 5 SKUs approved",           severity: "success", mod: "national" },
  { time: "3h ago",   icon: "📍", text: "286 West Hartford — 3 store picks added",           severity: "warning", mod: "store-curation" },
  { time: "4h ago",   icon: "⚠️", text: "POR-TRAVERT: lead time extended to 20wk",         severity: "error",   mod: "lead-time" },
  { time: "Yesterday",icon: "🏪", text: "Cluster CR-018 promoted to live — SS 2026 ready",  severity: "success", mod: "clustering" },
];

/* National keep/add/drop/pending counts — used by CurationDecisionsCard */
export const CURATION_DECISIONS = {
  keep: 49, add: 0, drop: 5, pending: 170, total: 224,
};

/* R13 range performance KPIs — used by RangePerformanceCard */
export const RANGE_PERFORMANCE = {
  salesDollars: "$2.7M",    salesSub:  "R13 revenue",
  gmPct:        45,         gmSub:     "Gross margin",
  units:        "324k sqft", unitsSub: "Sqft sold R13",
  sellThruPct:  "6.3",      stSub:     "Sold / (sold+OH)",
};

export const QUICK_ACTIONS = [
  { icon: "🤖", label: "Run agent",      sub: "Catalogue step",     mod: "catalogue" },
  { icon: "🔒", label: "National Core",  sub: "Review recs",        mod: "national" },
  { icon: "🗂", label: "Regional",       sub: "4 clusters open",    mod: "regional" },
  { icon: "🏪", label: "Store Curation", sub: "52 pending",         mod: "store-curation" },
  { icon: "📊", label: "Hindsight",      sub: "Business review",    mod: "hindsight" },
  { icon: "📁", label: "My Workspace",   sub: "2 plans active",     mod: "workspace" },
];
