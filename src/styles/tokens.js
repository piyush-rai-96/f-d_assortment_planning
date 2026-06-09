/*
 * JS token mirror — for the few places that can't read CSS variables
 * (Highcharts SVG fills, canvas, etc.). Values MUST stay in sync with the
 * semantic roles in global.css. Import these instead of writing raw hex.
 */
export const color = {
  primary: "#2d6a2d",
  primaryStrong: "#1e5020",
  primarySoft: "#edfaed",

  surface: "#ffffff",
  surfaceAlt: "#f2f6ee",
  surfaceSunken: "#eaeee4",
  bg: "#f5f7f0",

  text: "#0a1a0a",
  textStrong: "#0a2210",
  textMuted: "#456845",
  textSubtle: "#7a9a7a",

  border: "#c8dcbc",
  borderStrong: "#b4c8a0",

  error: "#dc2626",
  success: "#059669",
  warning: "#d97706",
  info: "#2563eb",
  accent: "#6d28d9",
  teal: "#0b7a6c",
  wood: "#b45309",

  // Neutral track for charts/bars
  track: "#eaefde",
};

/* Department → semantic color, shared by Hindsight + future merch views. */
export const deptColor = {
  Wood: color.wood,
  Tile: color.teal,
  "Laminate & Vinyl": color.info,
};
