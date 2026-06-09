/*
 * Portfolio Build seed data + option lists.
 * Ported from the legacy PORTFOLIO_STATE in fd-assortment-v4-2.html.
 *
 * Gaps and wishlists are static seeds (mutated at runtime via CRUD). Vendor SKUs
 * are derived once from the FD_SKUS catalogue, mirroring the legacy getter.
 */
import { FD_SKUS } from "./skus.js";

export const INITIAL_GAPS = [
  { id: "g1", type: "Price Point", desc: "Missing entry-level LVP under $2.49/sqft", priority: "high", addedBy: "Blake M.", date: "May 15" },
  { id: "g2", type: "Material", desc: 'No wide-plank white oak 9"+ in engineered', priority: "high", addedBy: "Barbara S.", date: "May 18" },
  { id: "g3", type: "Color", desc: "Warm greige wood-look tile — gap vs competitors", priority: "med", addedBy: "Chris G.", date: "May 20" },
  { id: "g4", type: "Look/Style", desc: "Limewash ceramic wall tile — trend incoming", priority: "med", addedBy: "Field Signal", date: "May 22" },
  { id: "g5", type: "Depth", desc: "Marble-look mosaic at sub-$8/sqft price point", priority: "low", addedBy: "Blake M.", date: "May 25" },
];

export const INITIAL_WISHLISTS = [
  { id: "w1", store: "107 Almeda", region: "Gulf", item: "Rectified large-format porcelain 32×32", evidence: "3 contractor projects confirmed", date: "May 19" },
  { id: "w2", store: "184 Farmingdale", region: "Northeast", item: "Wide white oak plank — farmhouse design trend strong", evidence: "Customer requests + Instagram saves", date: "May 21" },
  { id: "w3", store: "101 I-85", region: "Mid-Atlantic", item: "Terracotta floor tile authentic look", evidence: "High-end reno market, designer spec", date: "May 22" },
  { id: "w4", store: "358 N. Seattle", region: "Pacific NW", item: "Slate-look outdoor-rated porcelain", evidence: "Patio/outdoor renovation demand", date: "May 24" },
  { id: "w5", store: "205 Denver", region: "Rockies", item: "Wide-plank hickory engineered — rustic look", evidence: "Mountain home segment growing", date: "May 25" },
];

/* Build the vendor SKU shortlist from the catalogue (legacy PORTFOLIO_STATE.vendor_skus getter). */
export function buildVendorSkus() {
  const vendors = { Wood: "Shaw", Tile: "Daltile", "Laminate & Vinyl": "MSI" };
  const statuses = ["Shortlisted", "Shortlisted", "Approved", "Under review", "Shortlisted", "Declined"];
  return FD_SKUS.map((s, i) => ({
    id: "vsku-" + s.sku,
    name: s.desc,
    vendor: vendors[s.dept] || "Direct",
    show: s.dept === "Tile" ? "Coverings 2026" : "Direct",
    dept: s.dept,
    subDept: s.subDept,
    cls: s.cls,
    vsn: s.vsn,
    size: s.size,
    color: s.color,
    finish: s.finish,
    tag: s.tag,
    lead: s.lead,
    status:
      s.status === "Discontinued"
        ? "Declined"
        : s.tag === "BG" || s.tag === "Core"
        ? "Approved"
        : statuses[i % 6],
    margin: Math.round(38 + ((s.price || 3) * 2.1) % 14),
    landedCost: +(s.price * 0.55).toFixed(2),
    price: s.price,
    attrs: s.attrs,
  }));
}

/* ── Form option lists ──────────────────────────────────────────────────── */
export const GAP_TYPE_OPTIONS = ["Price Point", "Material", "Color", "Look/Style", "Depth", "Format", "Size", "Brand"].map((v) => ({ value: v, label: v }));
export const PRIORITY_OPTIONS = [
  { value: "high", label: "High — act this PLR" },
  { value: "med", label: "Medium — monitor" },
  { value: "low", label: "Low — future cycle" },
];
export const URGENCY_OPTIONS = [
  { value: "high", label: "High — this PLR" },
  { value: "med", label: "Medium — next cycle" },
  { value: "low", label: "Low — future" },
];
export const DEPT_OPTIONS = [{ value: "", label: "— Select dept —" }, ...["Tile", "Wood", "Laminate & Vinyl", "Stone", "Accessories"].map((v) => ({ value: v, label: v }))];
export const EVIDENCE_OPTIONS = ["Customer requests", "Contractor demand", "Competitor observation", "Social / trend signal", "Renovation market", "Designer spec"].map((v) => ({ value: v, label: v }));

/* Semantic Badge color mapping (Impact UI colors only) */
export const PRIORITY_BADGE = { high: "error", med: "warning", low: "success" };
export const PRIORITY_LABEL = { high: "High", med: "Med", low: "Low" };
export const STATUS_BADGE = { Approved: "success", Shortlisted: "info", "Under review": "warning", Declined: "error" };
