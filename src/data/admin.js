/*
 * Planning Admin data — ported from the ADMIN_S / renderAdminPlanning module
 * (section === "planning") in the legacy fd-assortment-v4-2.html.
 *
 * Three tabs: Products (source from FD_SKUS, Core/BG + Status editable),
 * Location Attributes (source from FD_STORES, 5 editable attrs derived from
 * cluster defaults), and Global Exceptions (attribute×store / item×store
 * matrices).
 */
import { FD_SKUS } from "./skus.js";
import { FD_STORES } from "./stores.js";

/* ── Products: editable attribute options ─────────────────────────────────── */
export const CORE_BG_OPTS = ["", "Core", "BG", "East", "West"];
export const STATUS_OPTS = ["Active", "Discontinued", "Pending"];

/* ── Location attributes (editable) + cluster-derived defaults ────────────── */
export const LOC_ATTRS = [
  { key: "climate", label: "Climate", opts: ["Temperate", "Hot Humid", "Hot Dry", "Cold", "Mixed Humid"] },
  { key: "customerType", label: "Customer Type", opts: ["Mainstream", "Premium", "Value", "Pro Contractor", "Mixed"] },
  { key: "storeFormat", label: "Store Format", opts: ["Large Format", "Mid-Size", "Compact", "Flagship", "Outlet"] },
  { key: "installMix", label: "Install Mix", opts: ["High Pro", "Mixed", "High DIY"] },
  { key: "locationType", label: "Location Type", opts: ["Suburban", "Urban", "Strip Mall", "Standalone", "Mixed Use"] },
];

const CLIMATE_BY_REGION = { "Mid-South": "Hot Dry", Gulf: "Hot Humid", "Mid-Atlantic": "Mixed Humid", "North Florida": "Hot Humid", "South Florida": "Hot Humid", "New England": "Cold", Northeast: "Temperate", Rockies: "Cold", "Pacific Northwest": "Temperate", "Great Lakes": "Mixed Humid", Midwest: "Mixed Humid", "Pac South": "Hot Dry" };
const CUSTOMER_BY_REGION = { "Mid-South": "Pro Contractor", Gulf: "Pro Contractor", "Mid-Atlantic": "Premium", "North Florida": "Mainstream", "South Florida": "Premium", "New England": "Mainstream", Northeast: "Premium", Rockies: "Mainstream", "Pacific Northwest": "Premium", "Great Lakes": "Value", Midwest: "Value", "Pac South": "Premium" };
const MIX_BY_REGION = { "Mid-South": "High Pro", Gulf: "High Pro", "Mid-Atlantic": "Mixed", "North Florida": "Mixed", "South Florida": "High DIY", "New England": "Mixed", Northeast: "High Pro", Rockies: "High Pro", "Pacific Northwest": "Mixed", "Great Lakes": "High DIY", Midwest: "High DIY", "Pac South": "Mixed" };
const LOCTYPE_BY_REGION = { "Mid-South": "Suburban", Gulf: "Suburban", "Mid-Atlantic": "Suburban", "North Florida": "Suburban", "South Florida": "Suburban", "New England": "Strip Mall", Northeast: "Urban", Rockies: "Strip Mall", "Pacific Northwest": "Suburban", "Great Lakes": "Strip Mall", Midwest: "Strip Mall", "Pac South": "Suburban" };
const FORMAT_BY_VELOCITY = { A: "Large Format", B: "Mid-Size", C: "Mid-Size", D: "Compact", E: "Compact" };
export const BAND_PCT = { A: "5%", B: "15%", C: "60%", D: "15%", E: "5%" };

/* Stores enriched with format + default editable attributes. */
export const LOCATIONS = FD_STORES.map((s) => ({
  id: String(s.id),
  name: s.name,
  region: s.region,
  market: s.market,
  state: s.state,
  dc: s.dc,
  velocity: s.velocity,
  format: FORMAT_BY_VELOCITY[s.velocity] || "Mid-Size",
  defaults: {
    climate: CLIMATE_BY_REGION[s.region] || "Temperate",
    customerType: CUSTOMER_BY_REGION[s.region] || "Mainstream",
    storeFormat: FORMAT_BY_VELOCITY[s.velocity] || "Mid-Size",
    installMix: MIX_BY_REGION[s.region] || "Mixed",
    locationType: LOCTYPE_BY_REGION[s.region] || "Suburban",
  },
}));

/* ── Products enriched (effective Core/BG + Status default from FD_SKUS) ──── */
export const PRODUCTS = FD_SKUS.map((s) => ({
  sku: String(s.sku),
  vsn: s.vsn,
  dept: s.dept,
  subDept: s.subDept,
  cls: s.cls,
  subCls: s.subCls,
  desc: s.desc,
  color: s.color,
  finish: s.finish,
  size: s.size,
  price: s.price,
  lead: s.lead,
  attrs: s.attrs,
  defCoreBG: s.tag || "",
  defStatus: s.status || "Active",
}));

/* ── Global Exceptions: attribute groups + product departments ────────────── */
export const ATTR_GROUPS = [
  { key: "material", label: "Material", values: ["Porcelain", "Ceramic", "Glass", "Natural Stone", "Travertine", "Slate", "Marble", "Vinyl", "Hardwood", "Grout", "Mortar"] },
  { key: "format", label: "Format", values: ['Mosaic (< 4")', 'Small (4"–12")', 'Medium (12"–18")', 'Large (18"–24")', 'Extra Large (24"+)', "Plank", "Sheet", "Bag/Tub"] },
  { key: "finish", label: "Finish", values: ["Matte", "Polished", "Honed", "Brushed", "Textured", "Glazed", "Unglazed", "Natural"] },
  { key: "edgeType", label: "Edge Type", values: ["Rectified", "Non-Rectified", "Bevelled", "Bullnose"] },
  { key: "suitability", label: "Suitability", values: ["Floor & Wall", "Floor Only", "Wall Only", "Outdoor Rated", "Wet Area", "Commercial Grade"] },
];

/* Products grouped by department, for the Item × Store matrix. */
export const PRODUCTS_BY_DEPT = PRODUCTS.reduce((acc, p) => {
  (acc[p.dept] = acc[p.dept] || []).push(p);
  return acc;
}, {});

export const DEPT_BADGE = { Wood: "warning", Tile: "success", "Laminate & Vinyl": "info", Stone: "info", "Decorative Accessories": "warning" };
export const STATUS_BADGE = { Active: "success", Discontinued: "error", Pending: "warning" };
export const VEL_BADGE = { A: "success", B: "info", C: "warning", D: "error", E: "error" };
