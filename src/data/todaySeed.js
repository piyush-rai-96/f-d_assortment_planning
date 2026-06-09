/*
 * Seed data for the Today dashboard, ported from the legacy renderToday().
 *
 * Counts that the legacy derived from FD_SKUS / ASSORTMENT_PLAN / FORECAST_STATE
 * are captured here as their initial-state values (verified against the legacy
 * seed): coreCount = 5 (SKUs tagged Core/BG), catalogueSkuCount = 35
 * (FD_SKUS.length), and the agent/forecast/national flags all start empty.
 * These flow into the same calculations the legacy performed.
 */
export const CURRENT_USER = {
  name: "Karen M.",
  role: "VP Merchandising · Corporate",
};

export const TODAY_SEED = {
  catalogueSkuCount: 35,
  coreCount: 5,
  natLocked: 0,
  agentRan: false,
  fcstReceived: 0,
  submittedRatio: 0.7, // legacy: 70% of stores submitted
};

// Per-velocity "% of network" labels (legacy bandPct — display only)
export const VELOCITY_NETWORK_PCT = { A: 5, B: 15, C: 60, D: 15 };

// Pipeline phases (legacy `phases`). `pct` is computed in the view from flags.
export const PIPELINE_PHASES = [
  { label: "Portfolio", mod: "portfolio" },
  { label: "Forecast", mod: "forecast" },
  { label: "Catalogue", mod: "catalogue" },
  { label: "National", mod: "national" },
  { label: "Regional", mod: "regional" },
  { label: "Curation", mod: "store-curation" },
  { label: "MPI/NPI", mod: "mpi" },
  { label: "Oracle", mod: "lead-time" },
];

// "Needs attention" priority cards (legacy). `hideWhenAgentRan` mirrors the
// legacy `hide:agentRan` flag on the "Agent not run yet" item.
export const NEEDS_ATTENTION = [
  { severity: "error", title: "8 stores not started", sub: "Gulf cluster · auto-closes Sep 20", mod: "store-curation" },
  { severity: "warning", title: "Agent not run yet", sub: "Run in Catalogue to unlock tiers", mod: "catalogue", hideWhenAgentRan: true },
  { severity: "warning", title: "{pending} stores pending", sub: "Curation window closes in 9 days", mod: "store-curation" },
  { severity: "success", title: "Regional review open", sub: "6/8 clusters submitted", mod: "regional" },
  { severity: "info", title: "7 intel signals", sub: "2 competitor threats · 1 opportunity", mod: "intel" },
];

export const RECENT_ACTIVITY = [
  { time: "2m ago", icon: "✅", text: "107 Almeda submitted curation", severity: "success" },
  { time: "18m ago", icon: "🤖", text: "Agent flagged SOL-SEASHELL for expansion", severity: "violet" },
  { time: "1h ago", icon: "📊", text: "Forecast received for AQG-WARMOAK", severity: "info" },
  { time: "2h ago", icon: "🔒", text: "National Core locked · 5 SKUs approved", severity: "success" },
  { time: "3h ago", icon: "📍", text: "286 West Hartford — 3 store picks added", severity: "warning" },
  { time: "4h ago", icon: "⚠️", text: "POR-TRAVERT: lead time extended to 20wk", severity: "error" },
];

export const QUICK_ACTIONS = [
  { icon: "🤖", label: "Run agent", sub: "Catalogue step", mod: "catalogue" },
  { icon: "🔒", label: "Review National", sub: "National Core", mod: "national" },
  { icon: "🗂", label: "Regional Review", sub: "4 clusters", mod: "regional" },
  { icon: "🏪", label: "Store Curation", sub: "{pending} pending", mod: "store-curation" },
  { icon: "📊", label: "Hindsight", sub: "Business review", mod: "hindsight" },
  { icon: "🔍", label: "Market Intel", sub: "7 signals", mod: "intel" },
];
