/*
 * Location Clustering data — ported from FD_CLUST_SCENARIOS / FD_OUTLIER_STORES
 * and renderAdminClustering() in the legacy fd-assortment-v4-2.html.
 *
 * Three clustering scenarios (Behavioural / Performance+Demographics / Product Attributes),
 * each a set of clusters referencing FD_STORES by id, plus flagged outlier stores.
 *
 * Also includes Cluster Run management data: active cluster set, run history,
 * attributes library, and wizard configuration.
 */
import { FD_STORES } from "./stores.js";
import { FD_SKUS } from "./skus.js";
import { FD_ASSORTMENT } from "./assortment.js";
import { color } from "../styles/tokens.js";

/*
 * FD_CLUST_SCENARIOS mirrors the HTML v9-7 letter mapping:
 *   A = Behavioural (★ agent recommended)   — data from behavioural clusters
 *   B = Performance + Demographics           — data from geographic clusters
 *   C = Product Attributes                  — computed at runtime by buildAttrClusters()
 */
export const FD_CLUST_SCENARIOS = {
  A: {
    id: "A", name: "Scenario A — Behavioural ★", badge: "Recommended",
    composite: 91, statScore: 88, bizScore: 93,
    note: "Best balance of signal and manageability. Groups stores by how they actually sell — not just where they are.",
    clusters: [
      { id: "B1", label: "High-Velocity Pro Markets", color: "#2D6A2D", stores: [104, 107, 101, 184, 129], tier: "high", revSqft: 382, st: 71, signals: ["Velocity A across all regions", "High pro-contractor mix", "Top unit productivity per sqft"] },
      { id: "B2", label: "Mid-Velocity Suburban",     color: "#0B7A6C", stores: [240, 160, 360, 286, 236, 205, 358, 356], tier: "mid", revSqft: 308, st: 62, signals: ["Velocity B", "Balanced DIY + Pro", "Renovation-led demand"] },
      { id: "B3", label: "Volume / Value Stores",     color: "#D97706", stores: [131, 376, 173, 237, 344, 294], tier: "mid", revSqft: 271, st: 57, signals: ["Velocity C", "High DIY mix", "LVP and basics-driven"] },
      { id: "B4", label: "Developing / Transitional", color: "#DC2626", stores: [152, 341], tier: "low", revSqft: 256, st: 55, signals: ["Velocity D", "Low velocity — monitoring", "Candidate for format review"] },
    ],
  },
  B: {
    id: "B", name: "Scenario B — Performance + Demographics", badge: "Geographic",
    composite: 74, statScore: 71, bizScore: 76,
    note: "Simple and familiar — but misses behavioral differences within regions.",
    clusters: [
      { id: "A1", label: "Mid-South & Gulf (TX)",  color: "#D97706", stores: [104, 131, 240, 107, 376], tier: "high", revSqft: 311, st: 61, signals: ["High pro-contractor demand", "Hot climate — LVP and tile mixed", "DC 991 operational group"] },
      { id: "A2", label: "Mid-Atlantic (GA)",       color: "#059669", stores: [101, 160],                tier: "high", revSqft: 341, st: 61, signals: ["Historic home renovation", "Premium tile and stone", "Subway tile mainstay"] },
      { id: "A3", label: "Florida",                 color: "#0891B2", stores: [152, 360, 173],           tier: "mid",  revSqft: 328, st: 62, signals: ["Luxury tile demand", "High humidity — LVP focus", "Coastal style"] },
      { id: "A4", label: "New England (CT/NH)",     color: "#6366F1", stores: [286, 237],                tier: "mid",  revSqft: 286, st: 57, signals: ["Traditional hardwood", "Cold climate — indoor focus", "Renovation-led"] },
      { id: "A5", label: "Northeast (PA/NY/NJ)",    color: "#2563EB", stores: [344, 184, 236],           tier: "high", revSqft: 428, st: 69, signals: ["Urban density", "High contractor pro mix", "Small format tile"] },
      { id: "A6", label: "Rockies & Pacific NW",   color: "#0E7490", stores: [205, 358, 341],           tier: "mid",  revSqft: 290, st: 59, signals: ["Stone and slate trending", "Mountain aesthetic", "Outdoor tile demand"] },
      { id: "A7", label: "Great Lakes & Midwest",  color: "#7C3AED", stores: [294, 356],                tier: "low",  revSqft: 241, st: 53, signals: ["Value-led shoppers", "LVP dominant", "Low stone penetration"] },
      { id: "A8", label: "Pacific South (CA)",      color: "#B45309", stores: [129],                    tier: "high", revSqft: 412, st: 68, signals: ["Luxury tile", "High-end stone", "Designer-led market"] },
    ],
  },
  C: {
    id: "C", name: "Scenario C — Product Attributes", badge: "Attribute-led",
    composite: 79, statScore: 82, bizScore: 76,
    note: "Clusters built from actual attribute performance per store — colors, finishes, formats and price tiers that drive the most R13 sqft/wk at each location.",
    clusters: [], // populated by buildAttrClusters() below
  },
};

/* ── Color swatch map for Product Attributes scenario ────────────────────── */
export const COLOR_SWATCHES = {
  Blonde:   "#F5CBA7",
  Brown:    "#8B4513",
  Beige:    "#F5F0E8",
  Ivory:    "#FFFCE0",
  Natural:  "#DEB887",
  Gray:     "#9E9E9E",
  White:    "#F8F8F8",
  "Red/Pink": "#E9A0A0",
  Blue:     "#7EC8E3",
  Green:    "#8BC34A",
  Other:    "#CCCCCC",
};

/* ── Attribute Clustering Engine (ported from HTML v9-7 lines 541-708) ───── */
(function buildAttrClusters() {
  if (!FD_ASSORTMENT?.length || !FD_SKUS?.length) return;

  // Step 1: per-store attribute totals (R13 sqft-weighted)
  const storeProfiles = {};
  FD_ASSORTMENT.forEach((row) => {
    const sku = FD_SKUS.find((s) => s.sku === row.sku);
    if (!sku) return;
    const sid = row.storeId;
    if (!storeProfiles[sid]) {
      storeProfiles[sid] = {
        storeId: sid, storeName: row.storeName, region: row.region,
        velocity: row.velocity, totalR13: 0,
        color: {}, finish: {}, priceGroup: {}, format: {}, cls: {}, subDept: {},
      };
    }
    const p = storeProfiles[sid];
    const r = row.r13Sqft || 0;
    p.totalR13 += r;
    const col = sku.color || "Other";         p.color[col]      = (p.color[col]      || 0) + r;
    const fin = sku.finish || "Other";        p.finish[fin]     = (p.finish[fin]     || 0) + r;
    const pg  = sku.price >= 8 ? "Premium ($8+)" : sku.price >= 5 ? "Mid ($5–8)" : sku.price >= 3 ? "Value ($3–5)" : "Entry (<$3)";
                                              p.priceGroup[pg]  = (p.priceGroup[pg]  || 0) + r;
    const fmt = sku.subCls || sku.cls || "Other"; p.format[fmt] = (p.format[fmt]    || 0) + r;
    const cl  = sku.cls || "Other";          p.cls[cl]         = (p.cls[cl]         || 0) + r;
    const sd  = sku.subDept || "Other";      p.subDept[sd]     = (p.subDept[sd]     || 0) + r;
  });

  // Step 2: convert totals to pct shares & derive dominant signals
  const topN = (obj, n, total) =>
    Object.keys(obj)
      .map((k) => ({ k, pct: Math.round((obj[k] / (total || 1)) * 100) }))
      .sort((a, b) => b.pct - a.pct)
      .slice(0, n);

  const profiles = Object.values(storeProfiles);
  profiles.forEach((p) => {
    p.topColors  = topN(p.color,      4, p.totalR13);
    p.topFinish  = topN(p.finish,     3, p.totalR13);
    p.topPrice   = topN(p.priceGroup, 3, p.totalR13);
    p.topFormat  = topN(p.format,     3, p.totalR13);
    p.topCls     = topN(p.cls,        3, p.totalR13);
    p.topSubDept = topN(p.subDept,    3, p.totalR13);

    p.dominantColor  = p.topColors[0]?.k  || "—";
    p.dominantFinish = p.topFinish[0]?.k  || "—";
    p.dominantPrice  = p.topPrice[0]?.k   || "—";
    p.dominantFormat = p.topFormat[0]?.k  || "—";

    const warmColors = ["Blonde", "Brown", "Beige", "Ivory", "Natural", "Red/Pink"];
    const warmScore  = warmColors.reduce((s, c) => s + (p.color[c] || 0), 0);
    const coolScore  = (p.color["Gray"] || 0) + (p.color["White"] || 0) + (p.color["Blue"] || 0) + (p.color["Green"] || 0);
    p.tone           = warmScore >= coolScore ? "Warm" : "Cool";
    p.isPremium      = ((p.priceGroup["Premium ($8+)"] || 0) + (p.priceGroup["Mid ($5–8)"] || 0)) >
                       ((p.priceGroup["Value ($3–5)"] || 0) + (p.priceGroup["Entry (<$3)"] || 0));
    const wideR      = p.format["Wide Plank (7\"+)"] || 0;
    const stdR       = p.format['Standard Plank (5-6.99")'] || 0;
    p.isWideOrLarge  = wideR > stdR || (p.subDept["Floor Tile"] || 0) > p.totalR13 * 0.4;
    const texturedR  = (p.finish["Wire-Brushed"] || 0) + (p.finish["Distressed"] || 0) + (p.finish["Hand-Scraped"] || 0) + (p.finish["Embossed"] || 0) + (p.finish["EIR"] || 0);
    const smoothR    = (p.finish["Smooth"] || 0) + (p.finish["Polished"] || 0) + (p.finish["Matte"] || 0) + (p.finish["Glossy"] || 0);
    p.isTextured     = texturedR > smoothR;
  });

  // Step 3: assign to 4 taste clusters
  const clusters = {
    C1: { id: "C1", label: "Warm Neutrals · Textured",        color: "#D97706", tier: "high", stores: [], storeDetails: [],
          description: "Brown, blonde and beige with wire-brushed or hand-scraped finishes. Skews toward wide plank wood and stone-look tile.",
          signals: ["#1 Color: Warm tones (Brown, Blonde, Beige)", "#1 Finish: Wire-Brushed / Hand-Scraped", "Format: Wide Plank & Stone Look dominant", "Mid-premium price band"] },
    C2: { id: "C2", label: "Cool Minimalist · Large Format",   color: "#2563EB", tier: "high", stores: [], storeDetails: [],
          description: "Gray and white with smooth, matte or polished finishes. Preference for large-format tile and modern LVP.",
          signals: ["#1 Color: Gray / White", "#1 Finish: Matte / Smooth / Polished", "Format: Large tile, 24×48 and 24×24 dominant", "Value-to-mid price point"] },
    C3: { id: "C3", label: "Classic Ivory · Premium",          color: "#059669", tier: "high", stores: [], storeDetails: [],
          description: "Ivory, natural and beige tones with polished or smooth finishes. Premium marble-look tile and solid wood.",
          signals: ["#1 Color: Ivory / Natural", "#1 Finish: Polished / Smooth", "Sub-dept: Marble Look & Solid Prefinished", "Premium price band ($5+)"] },
    C4: { id: "C4", label: "Mixed Palette · Value LVP",        color: "#7C3AED", tier: "mid",  stores: [], storeDetails: [],
          description: "Broad color mix led by entry-to-mid LVP (SPC/WPC). Embossed and EIR finishes. Practical assortment driven by waterproof need.",
          signals: ["Mixed color — no single dominant tone", "#1 Finish: EIR / Embossed", "Sub-dept: Nucore SPC / AquaGuard dominant", "Value price band (<$4)"] },
  };

  profiles.forEach((p) => {
    let assignment;
    if (p.tone === "Warm" && p.isTextured) assignment = "C1";
    else if (p.tone === "Cool" && !p.isPremium) assignment = "C2";
    else if (p.isPremium) assignment = "C3";
    else assignment = "C4";
    clusters[assignment].stores.push(p.storeId);
    clusters[assignment].storeDetails.push(p);
  });

  // Step 4: compute cluster-level aggregated attribute profiles
  Object.values(clusters).forEach((cl) => {
    if (!cl.storeDetails.length) return;
    const aggColor = {}, aggFinish = {}, aggPrice = {}, aggFormat = {}, aggCls = {};
    let totalR13 = 0, totalST = 0;
    const stByVel = { A: 71, B: 62, C: 57, D: 55 };
    cl.storeDetails.forEach((p) => {
      totalR13 += p.totalR13;
      totalST  += stByVel[p.velocity] || 60;
      Object.keys(p.color).forEach((k)      => { aggColor[k]   = (aggColor[k]   || 0) + p.color[k]; });
      Object.keys(p.finish).forEach((k)     => { aggFinish[k]  = (aggFinish[k]  || 0) + p.finish[k]; });
      Object.keys(p.priceGroup).forEach((k) => { aggPrice[k]   = (aggPrice[k]   || 0) + p.priceGroup[k]; });
      Object.keys(p.format).forEach((k)     => { aggFormat[k]  = (aggFormat[k]  || 0) + p.format[k]; });
      Object.keys(p.cls).forEach((k)        => { aggCls[k]     = (aggCls[k]     || 0) + p.cls[k]; });
    });
    const topAttr = (obj, n) =>
      Object.keys(obj)
        .map((k) => ({ k, r13: obj[k], pct: Math.round((obj[k] / (totalR13 || 1)) * 100) }))
        .sort((a, b) => b.r13 - a.r13)
        .slice(0, n);
    cl.attrProfile = {
      colors:   topAttr(aggColor,   5),
      finishes: topAttr(aggFinish,  4),
      prices:   topAttr(aggPrice,   4),
      formats:  topAttr(aggFormat,  4),
      species:  topAttr(aggCls,     4),
      totalR13: Math.round(totalR13),
    };
    cl.revSqft = cl.storeDetails.length > 0 ? Math.round(totalR13 / cl.storeDetails.length) : 0;
    cl.st      = cl.storeDetails.length > 0 ? Math.round(totalST  / cl.storeDetails.length) : 0;
  });

  FD_CLUST_SCENARIOS.C.clusters = Object.values(clusters).filter((cl) => cl.stores.length > 0);
})();

/* ── Scenario card config (mirrors HTML v9-7 lines 8082-8097) ─────────────── */
export const SCENARIO_CARDS = [
  {
    id: "A", scKey: "A", icon: "🧠", name: "Behavioural", subtitle: "How stores sell", recommended: true,
    signals: [
      "Velocity band (A/B/C/D)",
      "DIY vs pro-contractor mix",
      "Basket size & purchase frequency",
      "Units per transaction",
    ],
    why: "Velocity patterns directly predict carry depth needs. B1 (High-Velocity Pro) stores need 40% deeper assortment than B4. Most consistent across seasons.",
  },
  {
    id: "B", scKey: "B", icon: "📈", name: "Performance + Demographics", subtitle: "Market potential meets results", recommended: false,
    signals: [
      "R13 sqft/wk & sell-through",
      "Market population density",
      "Median income index",
      "Housing starts & renovation activity",
    ],
    why: "Identifies under-served high-potential markets. Separates mature performers from stores in growing demographics.",
  },
  {
    id: "C", scKey: "C", icon: "🏷", name: "Product Attributes", subtitle: "Clustered by what sells where", recommended: false,
    signals: [
      "Color palette dominance (warm vs cool tone)",
      "Finish preference (textured vs smooth/polished)",
      "Price tier distribution per store",
      "Format & species / look affinity",
    ],
    why: "Built from actual R13 sqft-weighted attribute performance at each store. Groups stores with the same taste profile — Warm Neutrals, Cool Minimalist, Classic Ivory, Value LVP. Best for driving localised color and finish recommendations.",
  },
];

/* ── Agent recommendation banner copy ────────────────────────────────────── */
export const AGENT_RECOMMENDATION = {
  title:   "Agent recommendation: Scenario A — Behavioural",
  body:    (storeCount, dept, season) =>
    `Based on ${storeCount} store profiles for ${season}, Behavioural clustering produces the most actionable segmentation for ${dept}. Velocity and purchase behaviour patterns are the strongest predictors of assortment performance — stores that sell alike should carry alike. Performance+Demographics is useful for identifying growth markets; Product Attributes works best as a lens on top of the behavioural base.`,
};

/* ── 6-step run agent pipeline (mirrors HTML v9-7 lines 8015-8022) ─────── */
export const RUN_AGENT_STEPS = [
  { id: "load",    icon: "📥", label: "Loading scope",                desc: (d) => `Dept: ${d.dept} · Channel: ${d.channel} · Season: ${d.season}` },
  { id: "profile", icon: "🏬", label: "Profiling stores",             desc: (d) => `${d.storeCount} stores · transaction patterns, velocity, R13, on-hand` },
  { id: "signals", icon: "📊", label: "Ingesting signals",            desc: (d) => d.activeParams.length ? d.activeParams.join(", ") + " · performance data" : "Store transaction profiles · performance data" },
  { id: "cluster", icon: "⬡",  label: "Running clustering analysis",  desc: ()  => "Identifying natural groupings based on scope and signals" },
  { id: "eval",    icon: "📋", label: "Evaluating scenario quality",  desc: ()  => "Silhouette score, within-cluster variance, business interpretability" },
  { id: "rec",     icon: "🤖", label: "Selecting recommended scenario", desc: (d) => `Agent picks the segmentation most actionable for ${d.dept}` },
];

/*
 * CLUSTER_ACCEPTANCE — tracks which scenario (A/B/C) has been accepted as the
 * active cluster model. Set acceptedScenario to null to simulate the "no model
 * yet" state shown on the Today dashboard. Mirrors CLUST_S.acceptedScenario /
 * CLUST_S.acceptedScope in the legacy HTML prototype.
 */
export const CLUSTER_ACCEPTANCE = {
  acceptedScenario: "B",   // key into FD_CLUST_SCENARIOS, or null if not yet accepted
  acceptedScope: {
    dept: "All",
    channel: "All Stores",
    season: "FW 2025",
  },
};

export const FD_OUTLIER_STORES = [
  { id: 341, name: "341 Bremerton", reason: "Velocity D — low trading volume, only 2 seasons of full data", severity: "warn" },
  { id: 152, name: "152 Savannah", reason: "Velocity D — candidate for format review or cluster reassignment", severity: "warn" },
];

export const OUTLIER_OPTIONS = ["Include", "Exclude", "Monitor"];
export const STORE_COUNT = FD_STORES.length;

export const TIER_BADGE = { high: "success", mid: "warning", low: "error" };
export const VEL_COLOR = { A: color.success, B: color.teal, C: color.warning, D: color.error };
export const BAND_PCT = { A: "5%", B: "15%", C: "60%", D: "15%" };

/* Resolve a cluster's store-id list into full FD_STORES records (order preserved). */
export function clusterStores(cluster) {
  return cluster.stores.map((id) => FD_STORES.find((s) => s.id === id)).filter(Boolean);
}

/* The part of a scenario name after the em-dash (used as the tab tagline). */
export function scenarioTagline(name) {
  return name.split("—").slice(1).join("—").trim();
}

/* Resolve a scenario card's cluster preview pills from FD_CLUST_SCENARIOS. */
export function scenarioClusters(scKey) {
  return FD_CLUST_SCENARIOS[scKey]?.clusters ?? [];
}

/* ── Cluster Run Management ──────────────────────────────────────────────── */

export const ACTIVE_CLUSTER_SET = {
  runId: "CR-018",
  name: "Network 5-cluster (k-means)",
  method: "k-means",
  attrNames: ["Pro / DIY mix", "Climate zone", "Sales velocity", "Category mix"],
  date: "2026-01-12",
  author: "D. Rivera",
  cohesion: 0.80,
  clusters: [
    { id: "C1", name: "Pro-Heavy South",    stores: 18, proAvg: 70, cohesion: 0.84, color: color.primary,  dominantCats: ["Tile", "Installation Materials", "Stone"], skus: 1124 },
    { id: "C2", name: "DIY-Heavy West",     stores: 15, proAvg: 28, cohesion: 0.78, color: color.teal,     dominantCats: ["LVP", "Laminate", "Tools"],                skus: 986  },
    { id: "C3", name: "DIY-Heavy South",    stores: 16, proAvg: 32, cohesion: 0.81, color: color.info,     dominantCats: ["Tile", "Grout", "Accessories"],            skus: 1042 },
    { id: "C4", name: "Mixed Urban East",   stores: 13, proAvg: 51, cohesion: 0.76, color: color.accent,   dominantCats: ["Stone", "Mosaic", "Natural Stone"],        skus: 874  },
    { id: "C5", name: "Pro-Heavy Midwest",  stores:  8, proAvg: 65, cohesion: 0.79, color: color.warning,  dominantCats: ["Industrial", "Commercial Tile", "Install"], skus: 756  },
  ],
};

export const CLUSTER_RUNS = [
  { id: "CR-018", name: "Network 5-cluster (k-means)", method: "k-means · k=5",   attrs: 4, stores: 70, status: "live",     date: "2026-01-12", author: "D. Rivera", cohesion: 0.80 },
  { id: "CR-017", name: "Network 4-cluster (k-means)", method: "k-means · k=4",   attrs: 4, stores: 70, status: "archived", date: "2025-10-08", author: "S. Patel",  cohesion: 0.74 },
  { id: "CR-016", name: "Regional behavioral run",     method: "k-means · k=6",   attrs: 5, stores: 70, status: "archived", date: "2025-07-15", author: "D. Rivera", cohesion: 0.77 },
  { id: "CR-015", name: "DC-aligned baseline",         method: "hierarchical",     attrs: 3, stores: 70, status: "archived", date: "2025-04-02", author: "T. Nguyen", cohesion: 0.68 },
];

export const CLUSTER_ATTRIBUTES = [
  { id: "pro_split",      name: "Pro / DIY mix",               group: "Customer",     desc: "Share of revenue from Pro contractor accounts",      recommended: true  },
  { id: "loyalty",        name: "Pro loyalty enrolment",        group: "Customer",     desc: "Pro loyalty program penetration rate",               recommended: false },
  { id: "sqft",           name: "Square footage",               group: "Format",       desc: "Total selling area in square feet",                  recommended: false },
  { id: "format",         name: "Store format",                 group: "Format",       desc: "Standard, Large, or Compact classification",         recommended: false },
  { id: "climate",        name: "Climate zone",                 group: "Geography",    desc: "Köppen climate classification for product mix",       recommended: true  },
  { id: "region",         name: "Region",                       group: "Geography",    desc: "Operational region assignment",                      recommended: false },
  { id: "permits",        name: "New-construction permits",     group: "Geography",    desc: "Local residential building permits index",            recommended: false },
  { id: "hhi",            name: "Median household income",      group: "Demographics", desc: "MSA-level median household income",                  recommended: false },
  { id: "pop",            name: "Catchment population",         group: "Demographics", desc: "Drive-time trade area population",                   recommended: false },
  { id: "sales_velocity", name: "Sales velocity",               group: "Performance",  desc: "Aggregate revenue velocity tier A–D",                recommended: true  },
  { id: "vol_tier",       name: "Volume tier",                  group: "Performance",  desc: "Store volume ranking within network",                recommended: false },
  { id: "cat_mix",        name: "Category mix index",           group: "Assortment",   desc: "Tile vs LVP vs Stone revenue balance",               recommended: true  },
];

export const WIZARD_DEFAULTS = {
  name: "",
  notes: "",
  scope: "network",
  method: "kmeans",
  k: 5,
  attrs: ["pro_split", "climate", "sales_velocity", "cat_mix"],
  dept: "All",
  channel: "All Stores",
  season: "SS26",
  params: { performance: true, demographics: false, attributes: false },
};

export const SCOPE_OPTIONS = [
  { id: "network", label: "Entire network",    desc: `All ${FD_STORES.length} stores. Default for quarterly refresh.` },
  { id: "region",  label: "Single region",     desc: "Cluster within Southeast / Midwest / West only." },
  { id: "format",  label: "Format-only",       desc: "Compare Standard vs Large vs Compact in isolation." },
  { id: "custom",  label: "Custom store list", desc: "0 stores selected. Upload CSV or pick from list." },
];

export const METHOD_OPTIONS = [
  { id: "kmeans",   label: "k-means",              desc: "Hard partitioning, fast convergence",     badge: "Recommended", disabled: false },
  { id: "ward",     label: "Hierarchical (Ward)",   desc: "Tree-based, produces dendrogram",         badge: null,          disabled: false },
  { id: "dbscan",   label: "DBSCAN",                desc: "Density-based, identifies outliers",      badge: null,          disabled: false },
  { id: "gmm",      label: "Gaussian mixture",      desc: "Probabilistic soft assignment",           badge: "Stage 2",     disabled: true  },
];

export const RUN_STATUS_PHASES = [
  "Standardising features…",
  "Computing centroids…",
  "Assigning stores…",
  "Computing cohesion…",
  "Done",
];

/*
 * PREVIEW_CLUSTER_STORES — sample store-level records used for analytics and
 * store management inside the Cluster Run wizard (Step 3 done-state).
 *
 * Fields:
 *   id            — unique store key
 *   name          — display name
 *   state         — 2-char state code
 *   region        — operational region
 *   clusterId     — 'C1'–'C5' or null (unassigned / available to add)
 *   proSplit      — % revenue from Pro contractor accounts (0-100)
 *   sqftK         — selling area in thousands of sq ft
 *   velScore      — 1(A best)–4(D worst)
 *   cohesionContrib — store's contribution to cluster cohesion (null if unassigned)
 *   catTile       — % of sales in Tile category
 *   catLvp        — % of sales in LVP / Laminate category
 *   hhi           — median household income (USD)
 */
export const PREVIEW_CLUSTER_STORES = [
  /* ── C1: Pro-Heavy South ────── */
  { id:"PS101", name:"Austin Central",      state:"TX", region:"Southwest", clusterId:"C1", proSplit:75, sqftK:85, velScore:1, cohesionContrib:0.88, catTile:52, catLvp:28, hhi:71000 },
  { id:"PS102", name:"Dallas Uptown",       state:"TX", region:"Southwest", clusterId:"C1", proSplit:70, sqftK:78, velScore:1, cohesionContrib:0.85, catTile:55, catLvp:22, hhi:68000 },
  { id:"PS103", name:"Houston South",       state:"TX", region:"Southwest", clusterId:"C1", proSplit:68, sqftK:91, velScore:1, cohesionContrib:0.82, catTile:48, catLvp:31, hhi:64000 },
  { id:"PS104", name:"San Antonio Pro",     state:"TX", region:"Southwest", clusterId:"C1", proSplit:72, sqftK:73, velScore:2, cohesionContrib:0.80, catTile:50, catLvp:30, hhi:58000 },

  /* ── C2: DIY-Heavy West ─────── */
  { id:"PS201", name:"Phoenix West",        state:"AZ", region:"Southwest", clusterId:"C2", proSplit:25, sqftK:68, velScore:2, cohesionContrib:0.80, catTile:38, catLvp:44, hhi:62000 },
  { id:"PS202", name:"Las Vegas NW",        state:"NV", region:"West",      clusterId:"C2", proSplit:30, sqftK:72, velScore:2, cohesionContrib:0.77, catTile:42, catLvp:40, hhi:59000 },
  { id:"PS203", name:"Denver Tech",         state:"CO", region:"Mountain",  clusterId:"C2", proSplit:28, sqftK:65, velScore:2, cohesionContrib:0.78, catTile:35, catLvp:48, hhi:75000 },
  { id:"PS204", name:"Seattle East",        state:"WA", region:"Northwest", clusterId:"C2", proSplit:32, sqftK:61, velScore:3, cohesionContrib:0.74, catTile:33, catLvp:50, hhi:82000 },

  /* ── C3: DIY-Heavy South ────── */
  { id:"PS301", name:"Charlotte South",     state:"NC", region:"Southeast", clusterId:"C3", proSplit:30, sqftK:74, velScore:2, cohesionContrib:0.83, catTile:44, catLvp:40, hhi:66000 },
  { id:"PS302", name:"Raleigh West",        state:"NC", region:"Southeast", clusterId:"C3", proSplit:35, sqftK:70, velScore:2, cohesionContrib:0.82, catTile:46, catLvp:38, hhi:72000 },
  { id:"PS303", name:"Nashville DIY",       state:"TN", region:"Southeast", clusterId:"C3", proSplit:29, sqftK:77, velScore:2, cohesionContrib:0.80, catTile:40, catLvp:45, hhi:61000 },
  { id:"PS304", name:"Memphis Whitehaven",  state:"TN", region:"Southeast", clusterId:"C3", proSplit:33, sqftK:66, velScore:3, cohesionContrib:0.76, catTile:38, catLvp:47, hhi:55000 },

  /* ── C4: Mixed Urban East ───── */
  { id:"PS401", name:"NYC Brooklyn",        state:"NY", region:"Northeast", clusterId:"C4", proSplit:54, sqftK:48, velScore:2, cohesionContrib:0.78, catTile:48, catLvp:30, hhi:92000 },
  { id:"PS402", name:"Boston Cambridge",    state:"MA", region:"Northeast", clusterId:"C4", proSplit:50, sqftK:52, velScore:2, cohesionContrib:0.77, catTile:50, catLvp:28, hhi:98000 },
  { id:"PS403", name:"Philadelphia Center", state:"PA", region:"Northeast", clusterId:"C4", proSplit:47, sqftK:55, velScore:3, cohesionContrib:0.74, catTile:45, catLvp:33, hhi:71000 },
  { id:"PS404", name:"Washington DC East",  state:"DC", region:"Mid-Atl",   clusterId:"C4", proSplit:52, sqftK:58, velScore:2, cohesionContrib:0.75, catTile:47, catLvp:32, hhi:95000 },

  /* ── C5: Pro-Heavy Midwest ──── */
  { id:"PS501", name:"Chicago South Loop",  state:"IL", region:"Midwest",   clusterId:"C5", proSplit:68, sqftK:80, velScore:1, cohesionContrib:0.82, catTile:50, catLvp:30, hhi:64000 },
  { id:"PS502", name:"Columbus Pro",        state:"OH", region:"Midwest",   clusterId:"C5", proSplit:63, sqftK:75, velScore:2, cohesionContrib:0.79, catTile:48, catLvp:32, hhi:59000 },
  { id:"PS503", name:"Indianapolis North",  state:"IN", region:"Midwest",   clusterId:"C5", proSplit:66, sqftK:82, velScore:1, cohesionContrib:0.80, catTile:52, catLvp:28, hhi:62000 },
  { id:"PS504", name:"Detroit West",        state:"MI", region:"Midwest",   clusterId:"C5", proSplit:62, sqftK:69, velScore:2, cohesionContrib:0.77, catTile:46, catLvp:35, hhi:57000 },

  /* ── Available (unassigned) — can be added to any cluster ── */
  { id:"PS601", name:"Tampa Bay North",     state:"FL", region:"Southeast", clusterId:null,  proSplit:55, sqftK:76, velScore:2, cohesionContrib:null, catTile:44, catLvp:38, hhi:66000 },
  { id:"PS602", name:"Orlando Pro Center",  state:"FL", region:"Southeast", clusterId:null,  proSplit:62, sqftK:84, velScore:1, cohesionContrib:null, catTile:52, catLvp:28, hhi:70000 },
  { id:"PS603", name:"Kansas City West",    state:"MO", region:"Midwest",   clusterId:null,  proSplit:40, sqftK:71, velScore:2, cohesionContrib:null, catTile:40, catLvp:42, hhi:61000 },
];

/* Network-wide averages used as radar baseline. */
export const NETWORK_AVERAGES = {
  proSplit:  49,
  sqftK:     71,
  velScore:  2.2,
  catTile:   45,
  cohesion:  0.78,
};

/* Velocity score → letter label */
export const VEL_SCORE_LABEL = { 1: "A", 2: "B", 3: "C", 4: "D" };

/* Deterministic preview clusters for wizard Step 1 live-preview. */
export function previewClusters(k, attrCount, method) {
  const methodBonus = { kmeans: 0, ward: 0.02, dbscan: -0.03 };
  const attrBonus = Math.min(0.04, Math.max(-0.04, (attrCount - 4) * 0.01));
  const bonus = (methodBonus[method] || 0) + attrBonus;
  const extraColors = ["#0E7490", "#B45309", "#7C3AED"];
  const extraNames  = ["Value Volume", "Emerging Markets", "Premium Urban"];
  const result = [];
  for (let i = 0; i < k; i++) {
    const base = ACTIVE_CLUSTER_SET.clusters[i];
    result.push({
      id: `C${i + 1}`,
      name:     base ? base.name    : extraNames[i - 5] || `Cluster ${i + 1}`,
      stores:   base ? base.stores  : Math.round(70 / k),
      cohesion: Math.max(0.5, Math.min(0.99, (base ? base.cohesion : 0.72) + bonus)),
      color:    base ? base.color   : extraColors[(i - 5) % 3],
    });
  }
  return result;
}
