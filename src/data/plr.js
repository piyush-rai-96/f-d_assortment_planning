/*
 * PLR Calendar data — ported from FD_PLR_CALENDAR + the `periods` section of
 * renderAdminPlanning in the legacy fd-assortment-v4-2.html.
 *
 * Each PLR = one assortment period (department · month) with weekly planning
 * windows and optional phases/milestones.
 */
import { color } from "../styles/tokens.js";

export const FD_PLR_CALENDAR = [
  { name: "DECORATIVE ACCESSORIES APRIL - 2026", dept: "Decorative Accessories", id: 532, presDate: "2026-04-21", dueDate: "2026-04-23", status: "Open",   versions: 0 },
  { name: "TILE APRIL - 2026",                   dept: "Tile",                   id: 529, presDate: "2026-04-21", dueDate: "2026-04-23", status: "Open",   versions: 1 },
  { name: "WOOD APRIL - 2026",                   dept: "Wood",                   id: 523, presDate: "2026-04-21", dueDate: "2026-04-23", status: "Open",   versions: 1 },
  { name: "LAMINATE AND VINYL APRIL - 2026",     dept: "Laminate & Vinyl",       id: 531, presDate: "2026-04-21", dueDate: "2026-04-23", status: "Open",   versions: 1 },
  { name: "DECORATIVE ACCESSORIES MARCH - 2026", dept: "Decorative Accessories", id: 519, presDate: "2026-03-17", dueDate: "2026-03-19", status: "Open",   versions: 0 },
  { name: "STONE JANUARY - 2026", dept: "Stone", id: 512, presDate: "2026-01-20", dueDate: "2026-01-22", status: "Closed" },
  { name: "DECORATIVE ACCESSORIES JANUARY - 2026", dept: "Decorative Accessories", id: 511, presDate: "2026-01-20", dueDate: "2026-01-22", status: "Closed" },
  { name: "DECORATIVE ACCESSORIES DECEMBER - 2025", dept: "Decorative Accessories", id: 503, presDate: "2025-12-15", dueDate: "2025-12-17", status: "Closed" },
  { name: "STONE DECEMBER - 2025", dept: "Stone", id: 501, presDate: "2025-12-15", dueDate: "2025-12-17", status: "Closed" },
  { name: "DECORATIVE ACCESSORIES OCTOBER - 2025", dept: "Decorative Accessories", id: 492, presDate: "2025-10-20", dueDate: "2025-10-22", status: "Closed" },
  { name: "TILE SEPTEMBER - 2025", dept: "Tile", id: 471, presDate: "2025-09-15", dueDate: "2025-09-19", status: "Closed" },
  { name: "WOOD SEPTEMBER - 2025", dept: "Wood", id: 468, presDate: "2025-09-15", dueDate: "2025-09-19", status: "Closed" },
  { name: "LAMINATE AND VINYL SEPTEMBER - 2025", dept: "Laminate & Vinyl", id: 474, presDate: "2025-09-15", dueDate: "2025-09-19", status: "Closed" },
];

export const PLR_DEPTS = ["Tile", "Wood", "Laminate & Vinyl", "Stone", "Decorative Accessories"];
export const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
export const YEARS = [2025, 2026, 2027];

/* Department → functional accent color + Badge role (shared with Planning Admin). */
export const PLR_DEPT_COLOR = {
  Tile: color.teal,
  Wood: color.wood,
  "Laminate & Vinyl": color.info,
  Stone: color.accent,
  "Decorative Accessories": color.warning,
};
export const PLR_DEPT_BADGE = {
  Tile: "success",
  Wood: "warning",
  "Laminate & Vinyl": "info",
  Stone: "info",
  "Decorative Accessories": "warning",
};

/*
 * Build the Mon–Sun weeks overlapping a given month. Ported verbatim from the
 * legacy buildWeeks() so derived presentation/due dates match the original.
 */
export function buildWeeks(month, year) {
  const mIdx = MONTHS.indexOf(month);
  if (mIdx < 0) return [];
  const firstDay = new Date(year, mIdx, 1);
  const lastDay = new Date(year, mIdx + 1, 0);
  const weeks = [];
  const cur = new Date(firstDay);
  const dow = cur.getDay();
  cur.setDate(cur.getDate() - ((dow + 6) % 7));
  while (cur <= lastDay) {
    const wkMon = new Date(cur);
    const wkSun = new Date(cur);
    wkSun.setDate(wkSun.getDate() + 6);
    const dispStart = wkMon < firstDay ? firstDay : wkMon;
    const dispEnd = wkSun > lastDay ? lastDay : wkSun;
    weeks.push({
      start: wkMon.toISOString().slice(0, 10),
      end: wkSun.toISOString().slice(0, 10),
      clampStart: dispStart.toISOString().slice(0, 10),
      clampEnd: dispEnd.toISOString().slice(0, 10),
      label: "W/C " + wkMon.toLocaleDateString("en-GB", { day: "2-digit", month: "short" }),
    });
    cur.setDate(cur.getDate() + 7);
  }
  return weeks;
}

/* ── Pre-seeded assortment periods per dept + season ─────────────────────── */
export const ASSORT_PERIODS = [
  { id: "ap-tile-ss26",   dept: "Tile",                   season: "SS 2026", startWeek: "W01", endWeek: "W26", presDate: "2026-04-21", dueDate: "2026-04-14", status: "active"  },
  { id: "ap-wood-ss26",   dept: "Wood",                   season: "SS 2026", startWeek: "W01", endWeek: "W26", presDate: "2026-04-28", dueDate: "2026-04-21", status: "active"  },
  { id: "ap-lvp-ss26",    dept: "Laminate & Vinyl",       season: "SS 2026", startWeek: "W01", endWeek: "W26", presDate: "2026-05-05", dueDate: "2026-04-28", status: "active"  },
  { id: "ap-stone-ss26",  dept: "Stone",                  season: "SS 2026", startWeek: "W01", endWeek: "W26", presDate: "2026-05-05", dueDate: "2026-04-28", status: "active"  },
  { id: "ap-dec-ss26",    dept: "Decorative Accessories", season: "SS 2026", startWeek: "W01", endWeek: "W26", presDate: "2026-05-12", dueDate: "2026-05-05", status: "active"  },
  { id: "ap-tile-fw26",   dept: "Tile",                   season: "FW 2026", startWeek: "W27", endWeek: "W52", presDate: "2026-10-21", dueDate: "2026-10-14", status: "planned" },
  { id: "ap-wood-fw26",   dept: "Wood",                   season: "FW 2026", startWeek: "W27", endWeek: "W52", presDate: "2026-10-28", dueDate: "2026-10-21", status: "planned" },
  { id: "ap-lvp-fw26",    dept: "Laminate & Vinyl",       season: "FW 2026", startWeek: "W27", endWeek: "W52", presDate: "2026-11-05", dueDate: "2026-10-28", status: "planned" },
  { id: "ap-stone-fw26",  dept: "Stone",                  season: "FW 2026", startWeek: "W27", endWeek: "W52", presDate: "2026-11-05", dueDate: "2026-10-28", status: "planned" },
  { id: "ap-dec-fw26",    dept: "Decorative Accessories", season: "FW 2026", startWeek: "W27", endWeek: "W52", presDate: "2026-11-12", dueDate: "2026-11-05", status: "planned" },
];

/* ── Option count formula ─────────────────────────────────────────────────── */
const DEPT_PARAMS = {
  "Tile":                   { positions: 42, ros: 1.4, salesU: 18600 },
  "Wood":                   { positions: 38, ros: 1.2, salesU: 15200 },
  "Laminate & Vinyl":       { positions: 30, ros: 1.3, salesU: 12400 },
  "Stone":                  { positions: 18, ros: 0.9, salesU:  7200 },
  "Decorative Accessories": { positions: 22, ros: 1.1, salesU:  8800 },
};

/**
 * Calculates recommended option count from assortment period + cluster scenario.
 * Formula: Sales (period sqft) ÷ (Weeks × Positions × ROS)
 */
export function plrCalcOptionCount(dept, assortPeriodId, clustScenario, clustScenarios) {
  const period = ASSORT_PERIODS.find((p) => p.id === assortPeriodId);
  if (!period) return null;

  const startW = parseInt((period.startWeek || "W01").replace("W", "")) || 1;
  const endW   = parseInt((period.endWeek   || "W26").replace("W", "")) || 26;
  const weeks  = Math.max(1, endW - startW + 1);

  const params = DEPT_PARAMS[dept] || { positions: 30, ros: 1.2, salesU: 12000 };
  const { positions, ros, salesU } = params;
  const salesUPeriod = Math.round(salesU * (weeks / 26));
  const total = Math.max(1, Math.round(salesUPeriod / (weeks * positions * ros)));

  const national  = Math.round(total * 0.40);
  const regional  = Math.round(total * 0.35);
  const storeTier = Math.max(0, total - national - regional);

  const sc       = clustScenarios?.[clustScenario || "B"];
  const clusters = sc?.clusters || [];
  const clusterBreakdown = clusters.map((c, i) => ({
    id: c.id,
    label: c.label,
    stores: c.stores.length,
    options: i < storeTier % clusters.length
      ? Math.ceil(storeTier / clusters.length)
      : Math.floor(storeTier / clusters.length),
  }));

  return {
    total, national, regional, store: storeTier,
    weeks, positions,
    ros: parseFloat(ros.toFixed(2)),
    salesUPeriod,
    formula: `${salesUPeriod.toLocaleString()} sqft ÷ (${weeks} wks × ${positions} pos × ${ros} ROS)`,
    clusterBreakdown,
  };
}

/* Seed the working PLR map (id → item with flows). */
export function seedPlrItems() {
  const map = {};
  FD_PLR_CALENDAR.forEach((p) => {
    const id = `plr-${p.id}`;
    map[id] = {
      id,
      calId: p.id,
      name: p.name,
      dept: p.dept,
      presDate: p.presDate,
      dueDate: p.dueDate,
      status: p.status,
      flowsOpen: false,
      flows: [],
    };
  });
  return map;
}
