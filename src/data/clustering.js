/*
 * Location Clustering data — ported from FD_CLUST_SCENARIOS / FD_OUTLIER_STORES
 * and renderAdminClustering() in the legacy fd-assortment-v4-2.html.
 *
 * Three clustering scenarios (Geographic / Behavioral / DC-based), each a set
 * of clusters referencing FD_STORES by id, plus flagged outlier stores.
 */
import { FD_STORES } from "./stores.js";
import { color } from "../styles/tokens.js";

export const FD_CLUST_SCENARIOS = {
  A: {
    id: "A", name: "Scenario A — Geographic (current state)", badge: "Current",
    composite: 74, statScore: 71, bizScore: 76,
    note: "Simple and familiar — but misses behavioral differences within regions.",
    clusters: [
      { id: "A1", label: "Mid-South & Gulf (TX)", color: "#D97706", stores: [104, 131, 240, 107, 376], tier: "high", revSqft: 311, st: 61, signals: ["High pro-contractor demand", "Hot climate — LVP and tile mixed", "DC 991 operational group"] },
      { id: "A2", label: "Mid-Atlantic (GA)", color: "#059669", stores: [101, 160], tier: "high", revSqft: 341, st: 61, signals: ["Historic home renovation", "Premium tile and stone", "Subway tile mainstay"] },
      { id: "A3", label: "Florida", color: "#0891B2", stores: [152, 360, 173], tier: "mid", revSqft: 328, st: 62, signals: ["Luxury tile demand", "High humidity — LVP focus", "Coastal style"] },
      { id: "A4", label: "New England (CT/NH)", color: "#6366F1", stores: [286, 237], tier: "mid", revSqft: 286, st: 57, signals: ["Traditional hardwood", "Cold climate — indoor focus", "Renovation-led"] },
      { id: "A5", label: "Northeast (PA/NY/NJ)", color: "#2563EB", stores: [344, 184, 236], tier: "high", revSqft: 428, st: 69, signals: ["Urban density", "High contractor pro mix", "Small format tile"] },
      { id: "A6", label: "Rockies & Pacific NW", color: "#0E7490", stores: [205, 358, 341], tier: "mid", revSqft: 290, st: 59, signals: ["Stone and slate trending", "Mountain aesthetic", "Outdoor tile demand"] },
      { id: "A7", label: "Great Lakes & Midwest", color: "#7C3AED", stores: [294, 356], tier: "low", revSqft: 241, st: 53, signals: ["Value-led shoppers", "LVP dominant", "Low stone penetration"] },
      { id: "A8", label: "Pacific South (CA)", color: "#B45309", stores: [129], tier: "high", revSqft: 412, st: 68, signals: ["Luxury tile", "High-end stone", "Designer-led market"] },
    ],
  },
  B: {
    id: "B", name: "Scenario B — Behavioral ★", badge: "Recommended",
    composite: 91, statScore: 88, bizScore: 93,
    note: "Best balance of signal and manageability. Groups stores by how they actually sell — not just where they are.",
    clusters: [
      { id: "B1", label: "High-Velocity Pro Markets", color: "#2D6A2D", stores: [104, 107, 101, 184, 129], tier: "high", revSqft: 382, st: 71, signals: ["Velocity A across all regions", "High pro-contractor mix", "Top unit productivity per sqft"] },
      { id: "B2", label: "Mid-Velocity Suburban", color: "#0B7A6C", stores: [240, 160, 360, 286, 236, 205, 358, 356], tier: "mid", revSqft: 308, st: 62, signals: ["Velocity B", "Balanced DIY + Pro", "Renovation-led demand"] },
      { id: "B3", label: "Volume / Value Stores", color: "#D97706", stores: [131, 376, 173, 237, 344, 294], tier: "mid", revSqft: 271, st: 57, signals: ["Velocity C", "High DIY mix", "LVP and basics-driven"] },
      { id: "B4", label: "Developing / Transitional", color: "#DC2626", stores: [152, 341], tier: "low", revSqft: 256, st: 55, signals: ["Velocity D", "Low velocity — monitoring", "Candidate for format review"] },
    ],
  },
  C: {
    id: "C", name: "Scenario C — DC-based Operational", badge: "Operational",
    composite: 79, statScore: 82, bizScore: 76,
    note: "Useful for logistics and replenishment planning. Does not reflect selling behavior.",
    clusters: [
      { id: "C1", label: "DC 991 — Southwest TX", color: "#B45309", stores: [104, 131, 240, 107, 376], tier: "mid", revSqft: 311, st: 61, signals: ["Texas markets", "Hot climate mix", "Pro + DIY balanced"] },
      { id: "C2", label: "DC 990 — Southeast", color: "#059669", stores: [101, 160, 152, 360, 173], tier: "high", revSqft: 334, st: 63, signals: ["Georgia + Florida", "Mixed climate", "Stone and tile heavy"] },
      { id: "C3", label: "DC 994 — Northeast", color: "#2563EB", stores: [286, 237, 344, 184, 236, 294, 356], tier: "high", revSqft: 349, st: 64, signals: ["Largest DC group", "7 stores", "Broad geography"] },
      { id: "C4", label: "DC 995 — Mountain/NW", color: "#0891B2", stores: [205, 358, 341], tier: "mid", revSqft: 290, st: 59, signals: ["Rockies + Pacific NW", "Outdoor and natural materials"] },
      { id: "C5", label: "DC 992 — Pacific South", color: "#6D28D9", stores: [129], tier: "high", revSqft: 412, st: 68, signals: ["California", "Luxury tier", "Designer market"] },
    ],
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
