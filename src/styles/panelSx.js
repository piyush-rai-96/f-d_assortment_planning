/**
 * Shared panel style object for Impact UI <Card sx={...}>.
 * Import this instead of copy-pasting the same literal in every view.
 *
 * Usage:
 *   import { panelSx, softSx } from "../styles/panelSx.js";
 *   <Card sx={panelSx}> ... </Card>
 */

export const panelSx = {
  maxWidth: "none",
  minHeight: "auto",
  width: "100%",
  padding: "var(--sp-4)",
  border: "1px solid var(--color-border)",
  borderRadius: "var(--r)",
  boxShadow: "var(--sh-card, var(--sh))",
  background: "var(--color-surface)",
  transition: "box-shadow var(--transition-fast, 150ms), transform var(--transition-fast, 150ms)",
};

/** Sunken variant: no shadow, surface-alt background */
export const softSx = {
  ...panelSx,
  background: "var(--color-surface-alt)",
  boxShadow: "none",
};

/** Compact variant: less padding for dense layouts */
export const compactSx = {
  ...panelSx,
  padding: "var(--sp-3)",
};

/** Elevated variant: stronger shadow with hover lift */
export const elevatedSx = {
  ...panelSx,
  boxShadow: "var(--sh-hover, var(--sh))",
};

/** Hero dark card */
export const heroSx = {
  maxWidth: "none",
  minHeight: "auto",
  width: "100%",
  padding: 0,
  border: "none",
  borderRadius: "var(--r)",
  boxShadow: "var(--sh-pop, var(--sh))",
  overflow: "hidden",
};
