import React from "react";
import { Card, Button, Badge, ProgressBar } from "impact-ui";
import Text from "../components/Text.jsx";
import Stack from "../components/Stack.jsx";
import Grid from "../components/Grid.jsx";
import { panelSx, softSx } from "../styles/panelSx.js";


const KPIS = [
  { l: "Stores submitted", v: "252/300", tone: "warning", pct: Math.round((252 / 300) * 100) },
  { l: "Override rate FW 2025", v: "19%", tone: "success", pct: 19 },
  { l: "Publish target", v: "Oct 1, 2025", tone: "teal" },
];

const CHECKLIST = [
  { done: true, l: "Catalogue locked (1,507 SKUs)" },
  { done: true, l: "National core published (842 SKUs)" },
  { done: true, l: "Location clusters finalised (8 clusters)" },
  { done: true, l: "Agent recommendations generated — feedback from SS 2025 integrated" },
  { done: false, l: "Regional review complete (6/8 submitted)" },
  { done: false, l: "All store curations submitted (252/300)" },
  { done: false, l: "Capacity validation (Sep 21–28)" },
  { done: false, l: "Final publish to OMS + feedback capture begins (Oct 1)" },
];

function Banner({ tone, icon, children }) {
  const bg = { warning: "var(--color-warning-soft)", info: "var(--color-primary-soft)" }[tone] || "var(--color-surface-alt)";
  const bd = { warning: "var(--color-warning)", info: "var(--color-primary)" }[tone] || "var(--color-border)";
  return (
    <Stack direction="row" gap={2} align="flex-start" paddingX={3} paddingY={3} style={{ background: bg, border: `1px solid ${bd}`, borderRadius: "var(--r2)" }}>
      <Text variant="body-strong">{icon}</Text>
      <Text variant="caption" tone="default" style={{ lineHeight: 1.6 }}>{children}</Text>
    </Stack>
  );
}

export default function Approval() {
  const doneCount = CHECKLIST.filter((c) => c.done).length;
  const allDone = doneCount === CHECKLIST.length;

  return (
    <Stack direction="column" gap={4}>
      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <Card sx={panelSx}>
        <Stack direction="row" justify="space-between" align="center" gap={4} wrap>
          <Stack direction="column" gap={1} flex="1 1 auto" style={{ minWidth: 0 }}>
            <Text variant="title">Final Approval</Text>
            <Text variant="caption" tone="muted">FW 2025 publish gate · all stores must complete before the assortment goes live</Text>
          </Stack>
          <Badge variant="subtle" size="small" color="warning" label={`${doneCount}/${CHECKLIST.length} steps complete`} />
        </Stack>
      </Card>

      <Banner tone="warning" icon="⏱">
        <strong>48 stores yet to submit.</strong> The assortment cannot be published until all stores complete, or the deadline auto-closes Sep 20.
      </Banner>

      {/* ── KPI strip ──────────────────────────────────────────────────────── */}
      <Grid columns={3} gap={3}>
        {KPIS.map((k) => (
          <Card key={k.l} sx={softSx}>
            <Stack direction="column" gap={2}>
              <Text variant="overline" tone="muted">{k.l}</Text>
              <Text variant="kpi" tone={k.tone}>{k.v}</Text>
              {k.pct != null ? <ProgressBar value={k.pct} status={k.l === "Override rate FW 2025" ? "completed" : k.pct >= 100 ? "completed" : "remaining"} showTime={false} customLabel=" " /> : null}
            </Stack>
          </Card>
        ))}
      </Grid>

      <Banner tone="info" icon="📈">
        <strong>Feedback capture starts at publish.</strong> Once published on Oct 1, the system logs all override events, dismissal reasons, and
        sell-through results in real time. All data feeds into the SS 2026 model — available before the next curation window opens.
      </Banner>

      {/* ── Approval checklist ─────────────────────────────────────────────── */}
      <Card sx={panelSx}>
        <Stack direction="column" gap={3}>
          <Text variant="body-strong" tone="strong">Approval checklist</Text>
          <Stack direction="column" gap={2}>
            {CHECKLIST.map((item) => (
              <Stack key={item.l} direction="row" gap={2} align="center">
                <div
                  style={{
                    width: 18, height: 18, borderRadius: "50%", flexShrink: 0,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 10, color: "#fff",
                    background: item.done ? "var(--color-success)" : "var(--color-surface-sunken)",
                  }}
                >
                  {item.done ? "✓" : ""}
                </div>
                <Text variant="caption" tone={item.done ? "success" : "muted"}>{item.l}</Text>
              </Stack>
            ))}
          </Stack>
        </Stack>
      </Card>

      {/* ── Publish ────────────────────────────────────────────────────────── */}
      <Stack direction="row" gap={3} align="center" wrap>
        <Button variant="primary" size="large" disabled={!allDone}>
          {allDone ? "Publish assortment →" : "Publish assortment (awaiting all submissions)"}
        </Button>
        {!allDone ? <Text variant="caption" tone="subtle">{CHECKLIST.length - doneCount} checklist item{CHECKLIST.length - doneCount !== 1 ? "s" : ""} remaining</Text> : null}
      </Stack>
    </Stack>
  );
}
