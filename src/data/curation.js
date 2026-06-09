/*
 * Store Curation derivations — ported from the SC state + renderSCform/renderSCsummary
 * helpers in the legacy fd-assortment-v4-2.html.
 *
 * Each store's catalogue is split into tiers:
 *   • Mandatory (Core/BG)  — locked nationally, cannot add/drop.
 *   • Cluster Assortment   — locked by Regional Review for the cluster, cannot drop.
 *   • Existing Assortment  — currently carried, droppable.
 *   • New PLR Items        — not carried by any store yet, addable.
 *   • Available to Add     — in the catalogue but not in this store, addable.
 *
 * Cluster-lock reuses the same ≥50%-carry cluster set Regional Review computes,
 * keeping the two screens consistent without a shared plan store.
 */
import { FD_SKUS } from "./skus.js";
import { FD_ASSORTMENT } from "./assortment.js";
import { FD_CLUST_SCENARIOS } from "./clusters.js";
import { clusterSkus, storeUniqueRows } from "./regional.js";

const SC_B = FD_CLUST_SCENARIOS.B;

export function isMandatory(sku) {
  return sku.tag === "Core" || sku.tag === "BG";
}

/* The behavioral cluster a store belongs to. */
export function storeClusterB(storeId) {
  return SC_B.clusters.find((c) => c.stores.indexOf(storeId) !== -1) || null;
}

/* SKU ids locked at cluster level for a store (cannot be dropped). */
export function clusterLockedIds(storeId) {
  const cl = storeClusterB(storeId);
  if (!cl) return new Set();
  return new Set(clusterSkus(cl).map((s) => s.sku));
}

/* SKUs not carried by any store — new PLR items available to add this season. */
const CARRIED_ANYWHERE = new Set(FD_ASSORTMENT.map((r) => r.sku));
export function newPlrSkus() {
  return FD_SKUS.filter((s) => !CARRIED_ANYWHERE.has(s.sku));
}

export { storeUniqueRows };
