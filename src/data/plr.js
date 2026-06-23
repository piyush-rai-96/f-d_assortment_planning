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
