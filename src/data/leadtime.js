/*
 * Lead Time & Oracle data — ported from LEAD_TIME_SKUS / renderLeadTime() in
 * the legacy fd-assortment-v4-2.html (Phase 5).
 *
 * Approved SKUs moving through Oracle/Foundation creation and the 6–8 month
 * lead-time pipeline, with trend-risk monitoring.
 */
import { color } from "../styles/tokens.js";

export const LEAD_TIME_SKUS = [
  { id: "lt-01", name: "Marazzi Calacatta Statuarietto 24×48", dept: "Tile", approvedDate: "2026-06-10", oracleCreate: null, estimatedFloor: "2027-01-15", season: "SS 2027", leadWeeks: 32, status: "pending-oracle", atRisk: false },
  { id: "lt-02", name: "Atlas Concorde Wide Oak 9×60", dept: "Wood", approvedDate: "2026-06-10", oracleCreate: "2026-06-15", estimatedFloor: "2026-12-01", season: "FW 2026", leadWeeks: 28, status: "oracle-created", atRisk: false },
  { id: "lt-03", name: "MSI Greige LVP 7×48 Entry", dept: "Laminate & Vinyl", approvedDate: "2026-05-20", oracleCreate: "2026-05-28", estimatedFloor: "2026-11-15", season: "FW 2026", leadWeeks: 25, status: "in-production", atRisk: false },
  { id: "lt-04", name: "Florim Limewash Ceramic 4×12", dept: "Tile", approvedDate: "2026-06-08", oracleCreate: null, estimatedFloor: "2027-02-01", season: "SS 2027", leadWeeks: 36, status: "pending-oracle", atRisk: true, riskReason: "Limewash tile is a fast-moving trend — SS 2027 floor date may miss peak demand. Consider expediting Oracle creation and vendor confirmation." },
  { id: "lt-05", name: "Shaw Hickory Creek Wide 9×72", dept: "Wood", approvedDate: "2026-04-15", oracleCreate: "2026-04-22", estimatedFloor: "2026-10-01", season: "FW 2026", leadWeeks: 24, status: "confirmed", atRisk: false },
];

/* status → label, Badge color role, and pipeline progress %. */
export const STATUS_META = {
  confirmed: { label: "Confirmed", badge: "success", prog: 100 },
  "oracle-created": { label: "Oracle created", badge: "info", prog: 40 },
  "in-production": { label: "In production", badge: "info", prog: 65 },
  "pending-oracle": { label: "Pending Oracle", badge: "warning", prog: 15 },
};

/* The six fixed pipeline stages (functional phase colors). */
export const PIPELINE_STAGES = [
  { l: "PLR Approval", c: color.primary },
  { l: "Oracle Creation", c: color.teal },
  { l: "Vendor Confirm", c: "#0B7A6C" },
  { l: "Production", c: color.info },
  { l: "Ocean Freight", c: color.accent },
  { l: "DC Receiving", c: color.warning },
];
