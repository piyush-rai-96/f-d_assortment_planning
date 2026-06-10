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
  errorSoft: "#fef2f2",
  errorBorder: "#fca5a5",
  success: "#059669",
  successSoft: "#ecfdf5",
  successBorder: "#6ee7b7",
  warning: "#d97706",
  warningSoft: "#fffbeb",
  warningBorder: "#fcd34d",
  info: "#2563eb",
  infoSoft: "#eff6ff",
  infoBorder: "#bfdbfe",
  accent: "#6d28d9",
  accentSoft: "#f5f3ff",
  accentDark: "#4c1d95",
  teal: "#0b7a6c",
  tealSoft: "#e6f7f4",
  wood: "#b45309",
  woodSoft: "#fef3c7",
  neutral: "#9ca3af",

  // Neutral track for charts/bars
  track: "#eaefde",
};

/* Department → semantic color, shared by Hindsight + future merch views. */
export const deptColor = {
  Wood: color.wood,
  Tile: color.teal,
  "Laminate & Vinyl": color.info,
};
