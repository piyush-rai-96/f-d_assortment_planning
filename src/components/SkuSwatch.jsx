import React from "react";

/*
 * SkuSwatch — 40×40 SVG color tile thumbnail generated from a SKU's finish/color.
 * Used in table rows across National, Regional, Store Curation, and Assortment Intelligence.
 *
 * The color is derived deterministically from the SKU's `color` and `finish` fields
 * to create a visually consistent, recognizable tile swatch without needing actual images.
 */

const FINISH_PATTERNS = {
  "Wire-Brushed":   { pattern: "linear", lineColor: "rgba(0,0,0,.12)", lines: true },
  "Smooth":         { pattern: "solid",  lineColor: null,               lines: false },
  "Scraped":        { pattern: "rough",  lineColor: "rgba(0,0,0,.18)",  lines: true },
  "Hand-Scraped":   { pattern: "rough",  lineColor: "rgba(0,0,0,.15)",  lines: true },
  "Matte":          { pattern: "matte",  lineColor: "rgba(0,0,0,.06)",  lines: false },
  "Polished":       { pattern: "gloss",  lineColor: "rgba(255,255,255,.25)", lines: false },
  "Honed":          { pattern: "subtle", lineColor: "rgba(0,0,0,.07)",  lines: false },
  "Textured":       { pattern: "rough",  lineColor: "rgba(0,0,0,.12)",  lines: true },
};

const BASE_COLORS = {
  // Wood tones
  "Blonde":      "#e8d5a3", "Natural":    "#d4b483", "Brown":     "#8b6914",
  "Gray":        "#9a9590", "Grey":       "#9a9590", "White":     "#f0ede8",
  "Charcoal":    "#4a4540", "Dark":       "#5c4a32", "Light":     "#e5d5b8",
  "Warm":        "#c4955a", "Cool":       "#a8b0b8", "Beige":     "#d4c4a0",
  // Tile colors
  "Sage":        "#8fab8a", "Green":      "#6a8c6a", "Blue":      "#6a7fb4",
  "Coastal":     "#7baabb", "Sand":       "#d4c29a", "Lava":      "#2a2a2a",
  "Black":       "#2c2c2c", "White Oak":  "#e0c990", "Mojave":    "#c8a87a",
  "Barnwood":    "#8b7355", "Driftwood":  "#a09070", "Pebble":    "#b4a090",
  "Travertine":  "#d4c4a0", "Slate":      "#7a8090",
};

function strHash(s) {
  let h = 5381;
  for (let i = 0; i < s.length; i++) h = (h * 33) ^ s.charCodeAt(i);
  return Math.abs(h);
}

export function skuSwatchColor(colorStr, dept) {
  if (!colorStr) {
    if (dept === "Tile") return "#b4c8d4";
    if (dept === "Wood") return "#d4b870";
    return "#a8c090";
  }
  // Try exact match first
  for (const [key, val] of Object.entries(BASE_COLORS)) {
    if (colorStr.toLowerCase().includes(key.toLowerCase())) return val;
  }
  // Fallback: deterministic hue from hash
  const hue = strHash(colorStr) % 360;
  const sat = 20 + (strHash(colorStr + "s") % 25);
  const lit = 60 + (strHash(colorStr + "l") % 20);
  return `hsl(${hue}, ${sat}%, ${lit}%)`;
}

export default function SkuSwatch({ sku, size = 32 }) {
  if (!sku) return null;

  const baseColor = skuSwatchColor(sku.color, sku.dept);
  const finish = sku.finish || "";
  const finishMeta = FINISH_PATTERNS[finish] || FINISH_PATTERNS["Smooth"];

  const patternId = `swatch-${String(sku.sku).replace(/\W/g, "")}`;

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 40 40"
      style={{ borderRadius: 4, flexShrink: 0, display: "block" }}
      aria-label={`${sku.desc} swatch`}
    >
      {/* Base fill */}
      <rect width="40" height="40" rx="4" fill={baseColor} />

      {/* Grain / texture lines for wire-brushed / scraped finishes */}
      {finishMeta.lines && (
        <>
          <line x1="0"  y1="8"  x2="40" y2="8"  stroke={finishMeta.lineColor} strokeWidth="0.8" />
          <line x1="0"  y1="16" x2="40" y2="16" stroke={finishMeta.lineColor} strokeWidth="0.5" />
          <line x1="0"  y1="24" x2="40" y2="24" stroke={finishMeta.lineColor} strokeWidth="0.8" />
          <line x1="0"  y1="32" x2="40" y2="32" stroke={finishMeta.lineColor} strokeWidth="0.5" />
        </>
      )}

      {/* Gloss highlight */}
      {finish === "Polished" && (
        <ellipse cx="14" cy="12" rx="8" ry="5" fill="rgba(255,255,255,.18)" />
      )}

      {/* Dept marker dot */}
      <circle
        cx="33"
        cy="33"
        r="4"
        fill={sku.dept === "Wood" ? "#c8a82a" : sku.dept === "Tile" ? "#2a7ab4" : "#6aaa6a"}
        opacity="0.85"
      />
    </svg>
  );
}
