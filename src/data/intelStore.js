/*
 * Lightweight mutable singleton — passes a "highlighted intel item" from
 * Portfolio Build → Market Intelligence without prop-drilling or a full
 * global state library.
 *
 * Usage:
 *   // Producer (PortfolioBuild.jsx)
 *   import { setIntelHighlight } from "../data/intelStore.js";
 *   setIntelHighlight("I-003");
 *   onNavigate("intel");
 *
 *   // Consumer (MarketIntel.jsx)
 *   import { popIntelHighlight } from "../data/intelStore.js";
 *   const id = popIntelHighlight(); // reads AND clears so the highlight is one-shot
 */

let _highlightId = null;

export function setIntelHighlight(id) {
  _highlightId = id;
}

/** Returns the current highlight ID and clears it (one-shot read). */
export function popIntelHighlight() {
  const id = _highlightId;
  _highlightId = null;
  return id;
}

export function peekIntelHighlight() {
  return _highlightId;
}
