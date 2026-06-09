/*
 * Feedback Loop data — ported from renderFeedbackLoop in the legacy
 * fd-assortment-v4-2.html. Shows what the agent learned from manager
 * overrides/dismissals + actual sell-through, and how it updated the model
 * season over season.
 */

/* Agent confidence / override-rate / sell-through trend by season. */
export const AGENT_TREND = [
  { season: "SS 2024", conf: 68, overrideRate: 34, st: 59, current: false },
  { season: "FW 2024", conf: 72, overrideRate: 28, st: 63, current: false },
  { season: "SS 2025", conf: 74, overrideRate: 28, st: 64, current: false },
  { season: "FW 2025", conf: 84, overrideRate: 19, st: null, current: true },
];

/* The five-step feedback mechanism. */
export const LOOP_STEPS = [
  { icon: "✏️", label: "Manager acts", desc: "Override or dismiss. Pick a reason code." },
  { icon: "📋", label: "Reason logged", desc: "Code + note stored against SKU, store, cluster." },
  { icon: "📦", label: "Season closes", desc: "Actual sell-through captured for every SKU × store." },
  { icon: "🤖", label: "Agent retrains", desc: "Override + dismissal + ST data update confidence." },
  { icon: "↗️", label: "Next season", desc: "More accurate picks. Lower override rate needed." },
];

/* SS 2025 → FW 2025 model updates. */
export const FEEDBACK_INSIGHTS = [
  { id: "fi-1", type: "upgrade", title: "Coastal Blue Glass Mosaic confidence upgraded", skuId: "SKU-10782", prevConf: 44, newConf: 71, stores: 14, cluster: "Gulf Coast", dominantCode: "local-demand", st: 81, impact: "SKU now in active agent recommendations for Gulf Coast cluster", note: "14 stores overrode with \"local demand signal\" in SS 2025. Average sell-through for those stores: 81%. Agent treats Gulf Coast as a high-affinity cluster for coastal/glass tile formats." },
  { id: "fi-2", type: "downgrade", title: "Terracotta Encaustic confidence reduced", skuId: "SKU-10555", prevConf: 68, newConf: 43, stores: 22, cluster: "Southeast Suburban", dominantCode: "personal-judgment", st: 38, impact: "Removed from agent recommendations for 22 stores", note: "22 stores dismissed in SS 2025. Dominant reason: personal judgment + low local demand. Actual sell-through for the stores that kept it: only 38%. Agent now requires positive local signal before recommending." },
  { id: "fi-3", type: "cluster-split", title: "Mountain West stone affinity sub-cluster created", skuId: null, prevConf: null, newConf: null, stores: 6, cluster: "Mountain West", dominantCode: "local-demand", st: null, impact: "6 stores now receive expanded slate/stone recommendations (+8 SKUs)", note: "6 Mountain West stores consistently overrode to add slate and stone SKUs for 2 consecutive seasons, each time citing \"local demand signal\". Agent created a high-stone-affinity sub-cluster. Regional assortment expanded by 8 items for this group in FW 2025." },
  { id: "fi-4", type: "national-signal", title: "LVP category signal escalated to merchant team", skuId: null, prevConf: null, newConf: null, stores: 47, cluster: "All clusters", dominantCode: "contractor", st: null, impact: "3 new LVP SKUs added to FW 2025 catalogue consideration", note: "47 stores across 5 clusters overrode to add LVP variants not in SS 2025 recommendations. Dominant reason: contractor requests. Signal escalated to merchant team — 3 new LVP SKUs added to FW 2025 catalogue." },
  { id: "fi-5", type: "flag", title: "3 high-confidence dismissals flagged to regional", skuId: "SKU-10839", prevConf: 91, newConf: null, stores: 3, cluster: "Southeast Suburban", dominantCode: "competitor", st: null, impact: "Regional manager notified; monitoring competitor carry before updating model", note: "3 stores dismissed Mojave Sand (91% confidence) citing competitor activity. Jason R. (Regional VP) auto-notified. No cluster-wide model change yet — monitoring FW 2025 results to determine if the signal is sustained before updating recommendations." },
];

/* Type → presentation role. Impact-ui badge colors: info | success | warning | error | default. */
export const INSIGHT_TYPE = {
  upgrade: { badge: "success", accent: "var(--color-success)", icon: "▲", label: "Confidence upgraded" },
  downgrade: { badge: "error", accent: "var(--color-error)", icon: "▽", label: "Confidence reduced" },
  "cluster-split": { badge: "info", accent: "var(--color-accent)", icon: "⬡", label: "New sub-cluster" },
  "national-signal": { badge: "warning", accent: "var(--color-warning)", icon: "◆", label: "National signal" },
  flag: { badge: "warning", accent: "var(--color-warning)", icon: "⚑", label: "Flagged to regional" },
};

/* Reason code labels (dismiss + override share the same set of codes). */
export const REASON_LABEL = {
  "local-demand": "Local demand signal",
  contractor: "Contractor / pro request",
  competitor: "Competitor activity",
  "event-driven": "Event-driven",
  "personal-judgment": "Personal judgment",
  availability: "Availability concern",
  "new-product-trial": "New product trial",
};

/* SS 2025 override vs dismissal counts per reason code. */
export const REASON_BREAKDOWN = [
  { code: "Local demand signal", overrides: 47, dismissals: 8 },
  { code: "Contractor / pro request", overrides: 31, dismissals: 3 },
  { code: "Personal judgment", overrides: 12, dismissals: 22 },
  { code: "Event-driven", overrides: 18, dismissals: 4 },
  { code: "Competitor activity", overrides: 9, dismissals: 5 },
  { code: "Availability concern", overrides: 5, dismissals: 14 },
];

/*
 * "This session's feedback" — in the legacy these are populated live from
 * Store Curation override/dismiss actions (cross-module state). Seeded here
 * with representative entries so the section is meaningful standalone; will be
 * wired to shared state once modules share a store.
 */
export const SESSION_DISMISSED = [
  { skuId: "SKU-10839", skuName: "Mojave Sand 24×24 Porcelain", code: "competitor", note: "HomeDepot carries an equivalent two blocks away", conf: 91 },
];
export const SESSION_OVERRIDES = [
  { skuId: "SKU-11020", skuName: "Driftwood Ash 7×48 LVP", code: "contractor", note: "Marcus Tile & Stone requested for 3 active projects", conf: null },
];
