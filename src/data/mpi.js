/*
 * MPI / NPI Reconciliation data — ported from the MPI module in the legacy
 * fd-assortment-v4-2.html.
 *
 * NPI (Non-Productive Inventory) is the discontinued on-hand created when stores
 * drop SKUs in their PLR add/drop forms. Drops are *simulated* here with a fixed
 * seed (LCG) so the dataset is deterministic across reloads — exactly matching
 * the legacy demo. Core/BG items are mandatory and never enter drop analysis.
 */
import { FD_SKUS } from "./skus.js";
import { FD_ASSORTMENT } from "./assortment.js";

export const NPI_THRESHOLD = 23; // % of on-hand that triggers a store flag
export const WATERLINE = 100; // r13 sqft/wk/store performance waterline

/* Deterministic drop simulation (seed 42 LCG), Core/BG excluded. */
export const MPI_DROPS = (() => {
  const drops = [];
  let seed = 42;
  const rng = () => {
    seed = (seed * 1664525 + 1013904223) & 0xffffffff;
    return (seed >>> 0) / 4294967296;
  };
  FD_ASSORTMENT.forEach((row) => {
    const sku = FD_SKUS.find((s) => s.sku === row.sku);
    const isDisc = sku && sku.status === "Discontinued";
    const isLowV = row.velocity === "D";
    const isLowPerf = row.r13Sqft < 55;
    let isMandatory = row.coreBG === "Core" || row.coreBG === "BG";
    if (!isMandatory) isMandatory = !!(sku && (sku.tag === "Core" || sku.tag === "BG"));
    if (isMandatory) return;
    const dropProb = isDisc ? 0.85 : isLowV ? 0.45 : isLowPerf ? 0.35 : 0.12;
    if (rng() < dropProb) {
      drops.push({
        sku: row.sku,
        desc: row.desc,
        dept: row.dept,
        subDept: row.subDept,
        storeId: row.storeId,
        storeName: row.storeName,
        region: row.region,
        velocity: row.velocity,
        menuPrice: row.menuPrice,
        r13Sqft: row.r13Sqft,
        onHand: row.onHand,
        coreBG: row.coreBG,
        npiDollars: Math.round(row.onHand * row.menuPrice),
      });
    }
  });
  return drops;
})();

/* Per-store NPI rollup. */
export const MPI_STORE_STATS = (() => {
  const storeMap = {};
  FD_ASSORTMENT.forEach((row) => {
    const k = row.storeId;
    if (!storeMap[k]) storeMap[k] = { storeId: row.storeId, storeName: row.storeName, region: row.region, velocity: row.velocity, totalOH: 0, npiOH: 0, drops: 0, adds: 0 };
    storeMap[k].totalOH += row.onHand * row.menuPrice;
  });
  MPI_DROPS.forEach((d) => {
    const s = storeMap[d.storeId];
    if (s) { s.npiOH += d.npiDollars; s.drops++; }
  });
  return Object.values(storeMap).map((s) => {
    s.npiPct = s.totalOH > 0 ? Math.round((s.npiOH / s.totalOH) * 1000) / 10 : 0;
    s.totalOH = Math.round(s.totalOH);
    s.npiOH = Math.round(s.npiOH);
    return s;
  });
})();

/* Per-SKU NPI detail (only SKUs that were dropped somewhere). */
export const MPI_SKU_STATS = (() => {
  const skuMap = {};
  FD_ASSORTMENT.forEach((row) => {
    const k = row.sku;
    if (!skuMap[k]) skuMap[k] = { sku: row.sku, desc: row.desc, dept: row.dept, subDept: row.subDept, menuPrice: row.menuPrice, storesBefore: 0, dropsCount: 0, npiDollars: 0, totalOH: 0, totalR13: 0 };
    skuMap[k].storesBefore++;
    skuMap[k].totalOH += row.onHand;
    skuMap[k].totalR13 += row.r13Sqft;
  });
  MPI_DROPS.forEach((d) => {
    const s = skuMap[d.sku];
    if (s) { s.dropsCount++; s.npiDollars += d.npiDollars; }
  });
  return Object.values(skuMap)
    .map((s) => {
      const sku = FD_SKUS.find((x) => x.sku === s.sku);
      s.storesAfter = Math.max(0, s.storesBefore - s.dropsCount);
      s.gmPct = Math.round(30 + Math.abs((s.sku % 10) - 5) * 2);
      s.wos = s.totalR13 > 0 ? Math.round(s.totalOH / s.totalR13) : 0;
      s.npiDollars = Math.round(s.npiDollars);
      s.avgR13 = s.storesBefore > 0 ? Math.round((s.totalR13 / s.storesBefore) * 10) / 10 : 0;
      s.status = sku ? sku.status : "Active";
      return s;
    })
    .filter((s) => s.dropsCount > 0)
    .sort((a, b) => b.dropsCount - a.dropsCount);
})();

export const MPI_REGIONS = [...new Set(MPI_STORE_STATS.map((s) => s.region))].sort();
export const MPI_DEPTS = [...new Set(FD_SKUS.map((s) => s.dept))].sort();
