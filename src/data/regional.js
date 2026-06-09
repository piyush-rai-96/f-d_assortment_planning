/*
 * Regional Review derivations — ported from renderRegional() in the legacy
 * fd-assortment-v4-2.html.
 *
 * The 3-tier model:
 *   • National Core  — Core/BG SKUs, locked in every store.
 *   • Cluster Level  — non-core SKUs carried by ≥50% of a cluster's stores.
 *   • Store Picks    — SKUs unique to a single store within its cluster.
 *
 * Cross-screen plan state isn't shared yet, so "national core" is the hard-locked
 * Core/BG set (the same fallback National Core uses). When a shared plan store is
 * introduced, CORE_IDS should also include agent-approved promotions.
 */
import { FD_SKUS } from "./skus.js";
import { FD_ASSORTMENT } from "./assortment.js";

export const CORE_IDS = new Set(
  FD_SKUS.filter((s) => s.tag === "Core" || s.tag === "BG").map((s) => s.sku)
);

/* Non-core SKUs carried by ≥50% of the cluster's stores, busiest first. */
export function clusterSkus(cl) {
  const cnt = {};
  FD_ASSORTMENT.filter((r) => cl.stores.indexOf(r.storeId) !== -1).forEach((r) => {
    (cnt[r.sku] = cnt[r.sku] || new Set()).add(r.storeId);
  });
  const threshold = Math.ceil(cl.stores.length * 0.5);
  return Object.entries(cnt)
    .filter(([sku, set]) => set.size >= threshold && !CORE_IDS.has(parseInt(sku, 10)))
    .map(([sku, set]) => {
      const s = FD_SKUS.find((x) => x.sku === parseInt(sku, 10));
      if (!s) return null;
      return { ...s, storeCount: set.size, totalStores: cl.stores.length };
    })
    .filter(Boolean)
    .sort((a, b) => b.storeCount - a.storeCount);
}

/* SKUs carried by this store but no sibling in the cluster, and not national core. */
export function storeOnlySkus(storeId, cl) {
  const seen = {};
  FD_ASSORTMENT.filter((r) => r.storeId === storeId).forEach((r) => (seen[r.sku] = true));
  const others = {};
  FD_ASSORTMENT.filter((r) => cl.stores.indexOf(r.storeId) !== -1 && r.storeId !== storeId).forEach(
    (r) => (others[r.sku] = true)
  );
  return FD_SKUS.filter((s) => seen[s.sku] && !others[s.sku] && !CORE_IDS.has(s.sku));
}

/* Total R13 sqft for one SKU in one store. */
export function r13forStore(storeId, skuId) {
  return FD_ASSORTMENT.filter((r) => r.storeId === storeId && r.sku === skuId).reduce(
    (a, r) => a + r.r13Sqft,
    0
  );
}

/* Average R13 sqft for one SKU across the cluster's stores that carry it. */
export function clusterAvgR13(cl, skuId) {
  const rows = FD_ASSORTMENT.filter((r) => cl.stores.indexOf(r.storeId) !== -1 && r.sku === skuId);
  return rows.length ? Math.round(rows.reduce((a, r) => a + r.r13Sqft, 0) / rows.length) : 0;
}

/* Total national R13 sqft for one SKU (used by the National Core sidebar). */
export function nationalR13(skuId) {
  return FD_ASSORTMENT.filter((r) => r.sku === skuId).reduce((a, r) => a + r.r13Sqft, 0);
}

/* One row per distinct SKU a store carries. */
export function storeUniqueRows(storeId) {
  const seen = {};
  return FD_ASSORTMENT.filter((r) => {
    if (r.storeId !== storeId) return false;
    if (seen[r.sku]) return false;
    seen[r.sku] = true;
    return true;
  });
}
