/*
 * wpMetrics.js — Working-Plan (Wp) and Last-Year (Ly) planning metrics per SKU.
 *
 * Fields:
 *   wpStartWeek       — Season start week (e.g. "WK02 FY26")
 *   wpEndWeek         — Season end week   (e.g. "WK48 FY26")
 *   wpItemStatus      — "New" | "Carryover" | "Vendor SKU"
 *   wpCost            — Unit cost ($)
 *   wpRetail          — Retail price ($/sqft)
 *   wpReceiptFirstDate— First planned receipt date
 *   lySalesU          — LY sales sqft
 *   lyAvgRosU         — LY avg rate-of-sale (sqft/wk per store)
 *   wpOnOrderU        — Current on-order sqft
 *   wpOnOrderR        — On-order value at retail ($)
 *
 * Values are deterministic seeds derived from sku.sku so they look real
 * and are consistent across renders without needing a database.
 */
import { FD_SKUS } from "./skus.js";

/* Helpers */
const pad2 = (n) => String(n).padStart(2, "0");
const MONTHS_SHORT = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

/* Derive all Wp + Ly metrics for one SKU from a deterministic seed. */
function derive(sku) {
  const s   = sku.sku % 10000;          // 4-digit seed
  const s3  = sku.sku % 1000;           // 3-digit seed

  /* Item status */
  const isDisc = sku.status === "Discontinued";
  const wpItemStatus = isDisc
    ? "Dropped"
    : s > 8500 ? "New"
    : s > 6800 ? "Vendor SKU"
    : "Carryover";

  /* Season weeks — SS26: WK01–WK26, FW26: WK27–WK52 */
  const startWk = 1  + (s3 % 4);          // WK01–WK04
  const endWk   = 44 + (s3 % 8);          // WK44–WK51
  const wpStartWeek = `WK${pad2(startWk)} FY26`;
  const wpEndWeek   = `WK${pad2(endWk)} FY26`;

  /* Cost — ~52–58% of retail */
  const costPct = 0.52 + (s3 % 60) / 1000;
  const wpCost  = Math.round(sku.price * costPct * 100) / 100;

  /* Retail = price ($/sqft, already in SKU) */
  const wpRetail = sku.price;

  /* First receipt date — Jan–Apr 2026 */
  const rMonth = (s3 % 4);              // 0=Jan … 3=Apr
  const rDay   = 1 + ((s3 * 3) % 27);
  const wpReceiptFirstDate = `${pad2(rDay)} ${MONTHS_SHORT[rMonth]} 2026`;

  /* LY sales U (sqft) — plausible range 800–12 000 */
  const lySalesU = Math.round(800 + (s / 10000) * 11200);

  /* LY avg ROS U = lySalesU / 52 weeks */
  const lyAvgRosU = Math.round((lySalesU / 52) * 10) / 10;

  /* On-order */
  const wpOnOrderU = isDisc ? 0 : Math.round(300 + (s3 % 700));
  const wpOnOrderR = Math.round(wpOnOrderU * wpRetail * 100) / 100;

  return {
    wpStartWeek,
    wpEndWeek,
    wpItemStatus,
    wpCost,
    wpRetail,
    wpReceiptFirstDate,
    lySalesU,
    lyAvgRosU,
    wpOnOrderU,
    wpOnOrderR,
  };
}

/* Map: skuId (number) → planning metrics */
const _cache = {};
FD_SKUS.forEach((s) => { _cache[s.sku] = derive(s); });

export function getWpMetrics(skuId) {
  return _cache[Number(skuId)] || null;
}

/* Pre-baked full map for bulk use */
export const WP_METRICS = _cache;
