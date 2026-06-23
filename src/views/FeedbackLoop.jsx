/**
 * FeedbackLoop.jsx — Feedback Loop screen
 * Mirrors renderFeedbackLoop() from HTML v9-7 exactly.
 * Impact UI design-system aligned (tokens, Card, Badge, Button).
 */
import React, { useState } from "react";
import { Card, Button, Badge } from "impact-ui";
import { TrendingUp, TrendingDown, CheckCircle2, AlertTriangle, Bot, Star } from "lucide-react";
import Text from "../components/Text.jsx";
import Stack from "../components/Stack.jsx";
import Grid from "../components/Grid.jsx";
import {
  AGENT_TREND, LOOP_STEPS, FEEDBACK_INSIGHTS, INSIGHT_TYPE,
  REASON_LABEL, REASON_BREAKDOWN, SESSION_DISMISSED, SESSION_OVERRIDES,
} from "../data/feedback.js";
import "./FeedbackLoop.css";
import { panelSx, softSx } from "../styles/panelSx.js";
import { color } from "../styles/tokens.js";

/* ── helpers ─────────────────────────────────────────────────────────── */
const max = (arr, fn) => Math.max(...arr.map(fn));
const MAX_TOTAL = max(REASON_BREAKDOWN, (c) => c.overrides + c.dismissals);
const BAR_MAX   = 220; // max px width for reason-code bars

/* HTML's exact step color mapping */
const STEP_COLORS = [
  { bg: "#EAF3DE", fg: "#2D6A2D" },
  { bg: "#E6F7F4", fg: "#0B7A6C" },
  { bg: "#F5F3FF", fg: "#6D28D9" },
  { bg: "#FFFBEB", fg: "#D97706" },
  { bg: "#EAF3DE", fg: "#2D6A2D" },
];

/* HTML's exact insight type map */
const TYPE_MAP = {
  upgrade:          { bg: "#E6F7F4", bd: "#A3DDD6", fg: "#0B7A6C", icon: "▲", label: "Confidence upgraded" },
  downgrade:        { bg: "#FEF2F2", bd: "#FECACA", fg: "#991B1B", icon: "▽", label: "Confidence reduced"  },
  "cluster-split":  { bg: "#F5F3FF", bd: "#DDD6FE", fg: "#5B21B6", icon: "⬡", label: "New sub-cluster"     },
  "national-signal":{ bg: "#FFFBEB", bd: "#FDE68A", fg: "#92400E", icon: "◆", label: "National signal"     },
  flag:             { bg: "#FFFBEB", bd: "#FDE68A", fg: "#92400E", icon: "⚑", label: "Flagged to regional" },
};

/* Thin progress bar */
function Bar({ pct, bgColor, height = 5 }) {
  return (
    <div style={{ flex: 1, height, background: "var(--color-surface-sunken)", borderRadius: 3, overflow: "hidden" }}>
      <div style={{ height: "100%", width: `${Math.min(100, Math.max(0, pct))}%`, background: bgColor, borderRadius: 3, transition: "width .4s" }} />
    </div>
  );
}

/* ──────────────────────────────────────────────────────────────────────
   TREND STRIP — navy dark card matching HTML's var(--navy)
   ────────────────────────────────────────────────────────────────────── */
function TrendStrip() {
  return (
    <div className="fl-navy-header">
      {/* Title row */}
      <div className="fl-navy-titlerow">
        <div>
          <div className="fl-navy-title">Feedback loop — SS 2025 → FW 2025</div>
          <div className="fl-navy-sub">What the agent learned, and how it updated the model</div>
        </div>
        <span className="fl-model-updates-badge">5 model updates</span>
      </div>

      {/* Season trend cards */}
      <div className="fl-trend-grid">
        {AGENT_TREND.map((t) => (
          <div key={t.season} className={`fl-trend-card${t.current ? " is-current" : ""}`}>
            <div className="fl-trend-season">{t.season}{t.current ? " ★" : ""}</div>
            <div className={`fl-trend-conf${t.current ? " is-current" : ""}`}>{t.conf}%</div>
            <div className="fl-trend-label">confidence</div>
            <div className={`fl-trend-rate${t.overrideRate <= 19 ? " is-good" : ""}`}>{t.overrideRate}%</div>
            <div className="fl-trend-label">override rate</div>
            {t.st != null ? (
              <>
                <div className="fl-trend-st">{t.st}%</div>
                <div className="fl-trend-label">avg ST</div>
              </>
            ) : null}
          </div>
        ))}
      </div>

      {/* Improvement callout */}
      <div className="fl-navy-callout">
        <div className="fl-navy-callout-stat">↗ Agent confidence avg: 74% → 84% | Override rate: 28% → 19%</div>
        <div className="fl-navy-callout-note">3 seasons of feedback integrated. The system gets more accurate every cycle.</div>
      </div>
    </div>
  );
}

/* ──────────────────────────────────────────────────────────────────────
   HOW IT WORKS — 5 colored step cards matching HTML exactly
   ────────────────────────────────────────────────────────────────────── */
function HowItWorks() {
  return (
    <Card sx={{ ...panelSx, padding: 0, overflow: "hidden" }}>
      <div className="fl-steps-strip">
        {LOOP_STEPS.map((s, i) => (
          <div key={s.label} className="fl-step" style={{ background: STEP_COLORS[i].bg }}>
            <div className="fl-step-icon">{s.icon}</div>
            <div className="fl-step-label" style={{ color: STEP_COLORS[i].fg }}>{s.label}</div>
            <div className="fl-step-desc">{s.desc}</div>
          </div>
        ))}
      </div>
    </Card>
  );
}

/* ──────────────────────────────────────────────────────────────────────
   MODEL UPDATE CARD
   ────────────────────────────────────────────────────────────────────── */
function InsightCard({ fi }) {
  const ts = TYPE_MAP[fi.type] || TYPE_MAP.flag;
  const reasonLabel = Object.entries(REASON_LABEL).find(([k]) => k === fi.dominantCode)?.[1] || fi.dominantCode;

  return (
    <Card sx={{ ...panelSx, padding: 0, borderLeft: `3px solid ${ts.fg}` }}>
      {/* Header */}
      <div className="fl-insight-head">
        <div style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 0, flex: 1 }}>
          <Text variant="body-strong" tone="strong" style={{ flex: 1, minWidth: 0 }}>{fi.title}</Text>
          {fi.skuId && (
            <Text variant="micro" tone="subtle" mono style={{ flexShrink: 0 }}>{fi.skuId}</Text>
          )}
        </div>
        <span className="fl-type-tag" style={{ background: ts.bg, color: ts.fg, border: `1px solid ${ts.bd}` }}>
          {ts.icon} {ts.label}
        </span>
      </div>

      <div style={{ padding: "0 20px 16px" }}>
        {/* Stats row */}
        <div className="fl-stats-row">
          {fi.stores != null && (
            <div className="fl-stat-box">
              <div className="fl-stat-num">{fi.stores}</div>
              <div className="fl-stat-label">stores</div>
            </div>
          )}
          {fi.prevConf != null && fi.newConf != null && (
            <div className="fl-stat-box" style={{ minWidth: 120 }}>
              <div className="fl-stat-num" style={{ color: ts.fg }}>{fi.prevConf}% → {fi.newConf}%</div>
              <div className="fl-stat-label">confidence</div>
            </div>
          )}
          {fi.st != null && (
            <div className="fl-stat-box">
              <div className="fl-stat-num">{fi.st}%</div>
              <div className="fl-stat-label">actual ST</div>
            </div>
          )}
          <div className="fl-stat-box" style={{ flex: 1 }}>
            <div className="fl-stat-label" style={{ marginBottom: 2 }}>Dominant reason code</div>
            <div style={{ fontSize: 12, fontWeight: 600, color: color.teal }}>{reasonLabel}</div>
          </div>
        </div>

        {/* Confidence before / after bars */}
        {fi.prevConf != null && fi.newConf != null && (
          <div style={{ marginBottom: 10 }}>
            {[
              { l: "Before (SS 2025)", v: fi.prevConf, c: "var(--color-border-strong)" },
              { l: "After  (FW 2025)",  v: fi.newConf,  c: ts.fg },
            ].map((b) => (
              <Stack key={b.l} direction="row" align="center" gap={2} style={{ marginBottom: 4 }}>
                <Text variant="micro" tone="subtle" style={{ width: 112, flexShrink: 0 }}>{b.l}</Text>
                <Bar pct={b.v} bgColor={b.c} />
                <Text variant="micro" mono style={{ width: 32, textAlign: "right", flexShrink: 0, color: b.c, fontWeight: 600 }}>{b.v}%</Text>
              </Stack>
            ))}
          </div>
        )}

        {/* Impact box */}
        <div style={{ background: ts.bg, borderRadius: "var(--r2)", padding: "8px 12px", fontSize: 12, color: ts.fg, marginBottom: 8, lineHeight: 1.5 }}>
          <strong>Impact:</strong> {fi.impact}
        </div>

        {/* Note */}
        <div style={{ fontSize: 11, color: "var(--color-text-muted)", lineHeight: 1.6, paddingTop: 8, borderTop: "1px solid var(--color-border)" }}>
          {fi.note}
        </div>
      </div>
    </Card>
  );
}

/* ──────────────────────────────────────────────────────────────────────
   REASON CODE BREAKDOWN
   ────────────────────────────────────────────────────────────────────── */
function ReasonBreakdown() {
  return (
    <Card sx={panelSx}>
      <Stack direction="column" gap={3}>
        {REASON_BREAKDOWN.map((cb) => (
          <Stack key={cb.code} direction="row" align="center" gap={3}>
            <Text variant="caption" style={{ width: 176, flexShrink: 0 }}>{cb.code}</Text>
            <div style={{ flex: 1 }}>
              <Stack direction="row" align="center" gap={2} style={{ marginBottom: 4 }}>
                <div style={{ width: Math.round((cb.overrides / MAX_TOTAL) * BAR_MAX), height: 5, background: "#2D6A2D", borderRadius: 2, minWidth: 2 }} />
                <Text variant="micro" tone="subtle">{cb.overrides} overrides</Text>
              </Stack>
              <Stack direction="row" align="center" gap={2}>
                <div style={{ width: Math.round((cb.dismissals / MAX_TOTAL) * BAR_MAX), height: 5, background: "#DC2626", borderRadius: 2, minWidth: 2 }} />
                <Text variant="micro" tone="subtle">{cb.dismissals} dismissals</Text>
              </Stack>
            </div>
            <Text variant="caption" tone="strong" style={{ width: 28, textAlign: "right", flexShrink: 0 }}>{cb.overrides + cb.dismissals}</Text>
          </Stack>
        ))}

        {/* Legend */}
        <Stack direction="row" gap={4} wrap style={{ borderTop: "1px solid var(--color-border)", paddingTop: "var(--sp-2)" }}>
          <Stack direction="row" align="center" gap={2}>
            <div style={{ width: 14, height: 5, background: "#2D6A2D", borderRadius: 2 }} />
            <Text variant="micro" tone="muted">Override — manager added something the agent didn't recommend</Text>
          </Stack>
          <Stack direction="row" align="center" gap={2}>
            <div style={{ width: 14, height: 5, background: "#DC2626", borderRadius: 2 }} />
            <Text variant="micro" tone="muted">Dismissal — manager rejected an agent recommendation</Text>
          </Stack>
        </Stack>
      </Stack>
    </Card>
  );
}

/* ──────────────────────────────────────────────────────────────────────
   SESSION FEEDBACK
   ────────────────────────────────────────────────────────────────────── */
function SessionFeedback() {
  if (!SESSION_DISMISSED.length && !SESSION_OVERRIDES.length) return null;
  return (
    <Stack direction="column" gap={3}>
      <Text variant="overline" tone="muted">This session's feedback (FW 2025)</Text>
      <Card sx={{ ...panelSx, padding: 0, overflow: "hidden" }}>
        {SESSION_DISMISSED.map((dr) => (
          <Stack key={`d-${dr.skuId}`} direction="row" gap={3} align="flex-start" paddingX={4} paddingY={3}
            style={{ borderBottom: "1px solid var(--color-border)" }}>
            <div className="fb-dot" style={{ background: "#FEF2F2", border: "1px solid #FECACA", color: "#991B1B" }}>▽</div>
            <Stack direction="column" gap={1} style={{ flex: 1 }}>
              <Text variant="caption" tone="strong">{dr.skuName}</Text>
              <Text variant="micro" tone="muted">
                Dismissed ·{" "}
                <Text as="span" variant="micro" style={{ color: color.teal, fontWeight: 600 }}>{REASON_LABEL[dr.code]}</Text>
                {dr.note ? ` · "${dr.note}"` : ""}
              </Text>
              {dr.conf >= 80 && (
                <Text variant="micro" style={{ color: color.warning, fontWeight: 600 }}>
                  ⚑ High confidence ({dr.conf}%) — flagged to regional manager
                </Text>
              )}
            </Stack>
          </Stack>
        ))}
        {SESSION_OVERRIDES.map((ov) => (
          <Stack key={`o-${ov.skuId}`} direction="row" gap={3} align="flex-start" paddingX={4} paddingY={3}
            style={{ borderBottom: "1px solid var(--color-border)" }}>
            <div className="fb-dot" style={{ background: "#E6F7F4", border: "1px solid #A3DDD6", color: "#0B7A6C" }}>▲</div>
            <Stack direction="column" gap={1} style={{ flex: 1 }}>
              <Text variant="caption" tone="strong">{ov.skuName}</Text>
              <Text variant="micro" tone="muted">
                Override ·{" "}
                <Text as="span" variant="micro" style={{ color: color.teal, fontWeight: 600 }}>{REASON_LABEL[ov.code]}</Text>
                {ov.note ? ` · "${ov.note}"` : ""}
              </Text>
            </Stack>
          </Stack>
        ))}
      </Card>
    </Stack>
  );
}

/* ──────────────────────────────────────────────────────────────────────
   MAIN EXPORT
   ────────────────────────────────────────────────────────────────────── */
export default function FeedbackLoop() {
  return (
    <Stack direction="column" gap={4}>
      {/* ── 1. Navy trend header ── */}
      <TrendStrip />

      {/* ── 2. How it works ── */}
      <HowItWorks />

      {/* ── 3. Model updates ── */}
      <Stack direction="column" gap={3}>
        <Text variant="overline" tone="muted">SS 2025 model updates ({FEEDBACK_INSIGHTS.length})</Text>
        {FEEDBACK_INSIGHTS.map((fi) => <InsightCard key={fi.id} fi={fi} />)}
      </Stack>

      {/* ── 4. Reason code breakdown ── */}
      <Stack direction="column" gap={3}>
        <Text variant="overline" tone="muted">SS 2025 reason code breakdown</Text>
        <ReasonBreakdown />
      </Stack>

      {/* ── 5. This session's feedback ── */}
      <SessionFeedback />
    </Stack>
  );
}
