import React, { useMemo } from "react";
import { Card, Button, Badge, ProgressBar, Chart } from "impact-ui";
import Text from "../components/Text.jsx";
import Stack from "../components/Stack.jsx";
import Grid from "../components/Grid.jsx";
import { color } from "../styles/tokens.js";
import { FD_STORES } from "../data/stores.js";
import { useAuth } from "../context/AuthContext.jsx";
import {
  TODAY_SEED,
  VELOCITY_NETWORK_PCT,
  PIPELINE_PHASES,
  NEEDS_ATTENTION,
  RECENT_ACTIVITY,
  QUICK_ACTIONS,
  PRIORITY_ACTIONS,
} from "../data/todaySeed.js";
import "./Today.css";

const panelSx = {
  maxWidth: "none",
  minHeight: "auto",
  width: "100%",
  padding: "var(--sp-4)",
  border: "1px solid var(--color-border)",
  borderRadius: "var(--r)",
  boxShadow: "var(--sh)",
  background: "var(--color-surface)",
};
const clickableSx = {
  ...panelSx,
  cursor: "pointer",
  transition: "border-color .15s, box-shadow .15s, transform .15s",
};

const VELOCITY_BADGE = { A: "success", B: "info", C: "warning", D: "error" };
const SEVERITY_TAG = {
  error:   { label: "Urgent",    color: "error"   },
  warning: { label: "Soon",      color: "warning" },
  success: { label: "On track",  color: "success" },
  info:    { label: "Signal",    color: "info"    },
};

const PHASE_STATUS_ICON = {
  100: "✅", 0: "⏳",
};
function phaseIcon(pct) {
  if (pct === 100) return "✅";
  if (pct > 0) return "▶";
  return "○";
}
function phaseColor(pct) {
  if (pct === 100) return "#059669";
  if (pct > 0) return "#2563eb";
  return "#9ca3af";
}

function greetingFor(hour) {
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

/* Determine priority action from pipeline state */
function getPriorityAction(seed) {
  if (!seed.agentRan) return PRIORITY_ACTIONS.find((a) => a.condition === "agentNotRun");
  if (seed.natLocked === 0) return PRIORITY_ACTIONS.find((a) => a.condition === "natCorePending");
  if (seed.submittedRatio < 0.3) return PRIORITY_ACTIONS.find((a) => a.condition === "storesIncomplete");
  return PRIORITY_ACTIONS.find((a) => a.condition === "default");
}

export default function Today({ onNavigate, user: userProp }) {
  const go = (mod) => onNavigate?.(mod);
  const { user: authUser } = useAuth();
  const user = userProp || authUser;

  const model = useMemo(() => {
    const { coreCount, natLocked, agentRan, fcstReceived, submittedRatio, catalogueSkuCount, activePlans = 2, unreadIntel = 4 } = TODAY_SEED;

    const totalStores = FD_STORES.length;
    const submitted = Math.round(totalStores * submittedRatio);
    const pending = totalStores - submitted;
    const submittedPct = Math.round((submitted / totalStores) * 100);
    const totalCore = coreCount + natLocked;

    const phases = PIPELINE_PHASES.map((p) => {
      let pct = p.pct ?? 0;
      // Runtime override based on flags
      if (p.mod === "forecast") pct = fcstReceived > 0 ? 100 : 100;
      if (p.mod === "catalogue") pct = agentRan ? 100 : 45;
      if (p.mod === "store-curation") pct = submittedPct;
      return { ...p, pct };
    });
    const overallPct = Math.round(phases.reduce((a, p) => a + p.pct, 0) / phases.length);

    const priorityAction = getPriorityAction(TODAY_SEED);

    const greeting = greetingFor(new Date().getHours());
    const firstName = (user?.name || "there").split(" ")[0];

    const kpis = [
      { value: totalStores, label: "Total Stores",    sub: `${submitted} submitted (${submittedPct}%)`, mod: "store-curation" },
      { value: totalCore,   label: "National Core",   sub: `${coreCount} hard + ${natLocked} agent`,    mod: "national"       },
      { value: catalogueSkuCount, label: "Catalogue SKUs", sub: "SS 2026 active",                      mod: "catalogue"      },
      { value: pending,     label: "Pending Stores",  sub: "Deadline Sep 20",                           mod: "store-curation" },
      { value: unreadIntel, label: "Intel Signals",   sub: "2 threats · 1 opportunity",                 mod: "intel"          },
    ];

    const fill = (s) => s.replace("{pending}", pending);
    const attention = NEEDS_ATTENTION
      .filter((a) => !(a.hideWhenAgentRan && agentRan))
      .slice(0, 4)
      .map((a) => ({ ...a, title: fill(a.title) }));
    const quick = QUICK_ACTIONS.map((q) => ({ ...q, sub: fill(q.sub) }));

    return {
      greeting, firstName, pending, phases, overallPct, kpis, attention, quick,
      priorityAction, activePlans, unreadIntel, submittedPct, totalStores, submitted,
    };
  }, [user]);

  const prioritySeverityColor = {
    error: "#dc2626", warning: "#d97706", info: "#2563eb", success: "#059669",
  };
  const prioritySeverityBg = {
    error: "#fef2f2", warning: "#fffbeb", info: "#eff6ff", success: "#ecfdf5",
  };

  return (
    <Stack direction="column" gap={5} className="today">

      {/* ── Header: greeting + header pills ──────────────────────────────── */}
      <Stack direction="row" justify="space-between" align="center" gap={4} wrap>
        <Stack direction="column" gap={1}>
          <Text variant="display">
            {model.greeting}, {model.firstName} 👋
          </Text>
          <Text variant="caption" tone="muted">
            Floor &amp; Decor · {user?.role || "Assortment Planning"} · SS 2026
          </Text>
        </Stack>
        <Stack direction="row" align="center" gap={2} wrap>
          <div className="today-header-pill today-header-pill--intel" onClick={() => go("intel")}>
            📡 {model.unreadIntel} intel signals
          </div>
          <div className="today-header-pill today-header-pill--plans" onClick={() => go("workspace")}>
            📋 {model.activePlans} active plans
          </div>
          <Badge variant="subtle" color="warning" label="Sep 20 deadline" />
        </Stack>
      </Stack>

      {/* ── Persona context banner ────────────────────────────────────────── */}
      {user?.greeting && (
        <div className="today-persona-banner">
          <div className="today-persona-avatar" style={{ background: user.color || "#2d6a2d" }}>
            {user.avatar}
          </div>
          <div className="today-persona-content">
            <p className="today-persona-greeting">{user.greeting}</p>
            {user.focusModules && (
              <div className="today-persona-chips">
                {user.focusModules.slice(0, 4).map((mod) => (
                  <button key={mod} className="today-persona-chip" onClick={() => go(mod)}>
                    {mod.replace(/-/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Priority action card ──────────────────────────────────────────── */}
      {model.priorityAction && (
        <div
          className="today-priority-card"
          style={{
            background: prioritySeverityBg[model.priorityAction.severity],
            borderColor: prioritySeverityColor[model.priorityAction.severity],
          }}
          onClick={() => go(model.priorityAction.mod)}
        >
          <div className="today-priority-urgency" style={{ background: prioritySeverityColor[model.priorityAction.severity] }}>
            {model.priorityAction.severity === "error" ? "Urgent" : model.priorityAction.severity === "warning" ? "Action needed" : "Next step"}
          </div>
          <div className="today-priority-body">
            <p className="today-priority-title">{model.priorityAction.title}</p>
            <p className="today-priority-sub">{model.priorityAction.sub}</p>
          </div>
          <button
            className="today-priority-cta"
            style={{ background: prioritySeverityColor[model.priorityAction.severity] }}
            onClick={(e) => { e.stopPropagation(); go(model.priorityAction.mod); }}
          >
            {model.priorityAction.cta} →
          </button>
        </div>
      )}

      {/* ── Pipeline status table ─────────────────────────────────────────── */}
      <Card sx={panelSx}>
        <Stack direction="row" justify="space-between" align="center" style={{ marginBottom: "var(--sp-3)" }}>
          <Text variant="subheading" as="h3">SS 2026 Pipeline</Text>
          <Badge variant="subtle" color="info" label={`${model.overallPct}% overall`} />
        </Stack>
        <div className="today-pipeline-table">
          {model.phases.map((p, i) => (
            <div key={p.mod} className="today-pipeline-row" onClick={() => go(p.mod)}>
              <span className="today-pipeline-num">{i + 1}</span>
              <span className="today-pipeline-phase">{p.label}</span>
              <div className="today-pipeline-bar-wrap">
                <div className="today-pipeline-bar-track">
                  <div className="today-pipeline-bar-fill" style={{ width: `${p.pct}%`, background: phaseColor(p.pct) }} />
                </div>
              </div>
              <span className="today-pipeline-pct" style={{ color: phaseColor(p.pct) }}>{p.pct}%</span>
              <span className="today-pipeline-icon">{phaseIcon(p.pct)}</span>
            </div>
          ))}
        </div>
      </Card>

      {/* ── KPI row ──────────────────────────────────────────────────────── */}
      <Grid min={160} gap={3}>
        {model.kpis.map((k) => (
          <Card key={k.label} sx={clickableSx} onClick={() => go(k.mod)}>
            <Stack direction="column" gap={1}>
              <Text variant="kpi" tone="strong">{k.value}</Text>
              <Text variant="body-strong">{k.label}</Text>
              <Text variant="caption" tone="subtle">{k.sub}</Text>
            </Stack>
          </Card>
        ))}
      </Grid>

      {/* ── Middle row: overall ring + what needs attention ──────────────── */}
      <Grid min={300} gap={4} align="stretch">
        {/* SS 2026 overall donut */}
        <Card sx={panelSx}>
          <Text variant="subheading" as="h3">SS 2026 Overall</Text>
          <Stack direction="column" align="center" justify="center">
            <Chart
              graphType="pie"
              showHeader={false}
              cardContainer={false}
              showDownloadButton={false}
              showExpandButton={false}
              showSubTitle
              subtitleText={`${model.overallPct}%`}
              height={190}
              chartMarginBottom={8}
              legendOptions={{ enabled: false }}
              tooltipOptions={{ enabled: false }}
              seriesData={[
                {
                  name: "SS 2026",
                  type: "pie",
                  innerSize: "72%",
                  data: [
                    { name: "Complete",  y: model.overallPct,        color: color.primary },
                    { name: "Remaining", y: 100 - model.overallPct,  color: color.track   },
                  ],
                },
              ]}
              plotOptionsOptions={{
                pie: {
                  innerSize: "72%",
                  borderWidth: 0,
                  dataLabels: { enabled: false },
                  enableMouseTracking: false,
                  states: { hover: { halo: { size: 0 } } },
                },
              }}
            />
            <Text variant="caption" tone="subtle">Average completion across 8 phases</Text>
          </Stack>
        </Card>

        {/* What needs attention (state-derived, max 4) */}
        <Card sx={panelSx}>
          <Text variant="subheading" as="h3" style={{ marginBottom: "var(--sp-3)" }}>What needs attention</Text>
          <Stack direction="column" gap={3}>
            {model.attention.map((a, i) => (
              <Card key={i} sx={{ ...clickableSx, padding: "var(--sp-3)" }} onClick={() => go(a.mod)}>
                <Stack direction="row" align="center" gap={3}>
                  <Badge variant="subtle" size="small" color={SEVERITY_TAG[a.severity].color} label={SEVERITY_TAG[a.severity].label} />
                  <Stack direction="column" flex="1" style={{ minWidth: 0 }}>
                    <Text variant="body-strong" truncate>{a.title}</Text>
                    <Text variant="caption" tone="subtle">{a.sub}</Text>
                  </Stack>
                  <Text variant="heading" tone="subtle">›</Text>
                </Stack>
              </Card>
            ))}
          </Stack>
        </Card>

        {/* Quick actions */}
        <Card sx={panelSx}>
          <Text variant="subheading" as="h3" style={{ marginBottom: "var(--sp-3)" }}>Quick actions</Text>
          <Grid columns={2} gap={3}>
            {model.quick.map((q) => (
              <Card key={q.label} sx={{ ...clickableSx, padding: "var(--sp-3)" }} onClick={() => go(q.mod)}>
                <Stack direction="column" gap={1}>
                  <span className="today-quick-icon">{q.icon}</span>
                  <Text variant="subheading">{q.label}</Text>
                  <Text variant="caption" tone="subtle">{q.sub}</Text>
                </Stack>
              </Card>
            ))}
          </Grid>
        </Card>
      </Grid>

      {/* ── Recent activity ──────────────────────────────────────────────── */}
      <Card sx={panelSx}>
        <Text variant="subheading" as="h3" style={{ marginBottom: "var(--sp-3)" }}>Recent activity</Text>
        <Stack direction="column" gap={1}>
          {RECENT_ACTIVITY.map((a, i) => (
            <Stack
              key={i}
              direction="row" align="center" gap={3}
              className="today-feed-row" paddingX={3} paddingY={3}
              style={{ cursor: a.mod ? "pointer" : "default" }}
              onClick={() => a.mod && go(a.mod)}
            >
              <span className="today-feed-icon">{a.icon}</span>
              <Text variant="caption" tone="muted" flex="1" as="span" style={{ flex: 1 }}>{a.text}</Text>
              <Text variant="micro" tone="subtle" style={{ whiteSpace: "nowrap" }}>{a.time}</Text>
            </Stack>
          ))}
        </Stack>
      </Card>

    </Stack>
  );
}
