import React, { useMemo } from "react";
import { Card, Badge, Button } from "impact-ui";
import Text from "../components/Text.jsx";
import Stack from "../components/Stack.jsx";
import Grid from "../components/Grid.jsx";
import { FD_CLUST_SCENARIOS, CLUSTER_ACCEPTANCE } from "../data/clustering.js";
import { FD_PLR_CALENDAR } from "../data/plr.js";
import { PLANS, PIPE_STAGES, PLAN_STATUS } from "../data/workspace.js";
import { INTEL_SEED } from "../data/intel.js";
import { MPI_DROPS } from "../data/mpi.js";
import { TODAY_SEED } from "../data/todaySeed.js";
import { useAuth } from "../context/AuthContext.jsx";
import { panelSx } from "../styles/panelSx.js";
import "./Today.css";

/* ── View-local constants ─────────────────────────────────────────────────── */

const QUICK_ACCESS = [
  { icon: "📋", label: "Store Curation", mod: "store-curation", bg: "var(--color-warning-soft)",  iconColor: "var(--color-warning)" },
  { icon: "🔍", label: "Market Intel",   mod: "intel",          bg: "var(--color-error-soft)",    iconColor: "var(--color-error)"   },
  { icon: "🏠", label: "National Core",  mod: "national",       bg: "var(--color-success-soft)",  iconColor: "var(--color-success)" },
  { icon: "📈", label: "Forecast",       mod: "forecast",       bg: "var(--color-info-soft)",     iconColor: "var(--color-info)"    },
  { icon: "📊", label: "Hindsight",      mod: "hindsight",      bg: "var(--color-accent-soft)",   iconColor: "var(--color-accent)"  },
  { icon: "📁", label: "PLR Status",     mod: "approval",       bg: "var(--color-teal-soft)",     iconColor: "var(--color-teal)"    },
];

const URGENCY_COLOR = {
  immediate: "var(--color-error)",
  season:    "var(--color-warning)",
  next:      "var(--color-accent)",
  watch:     "var(--color-success)",
};

const SCENARIO_NAMES = {
  B: "Behavioural",
  A: "Performance + Demographics",
  C: "Product Attributes",
};
const SCENARIO_ICONS = { B: "🧠", A: "📈", C: "🏷️" };
const TIER_COLOR     = { high: "success", mid: "warning", low: "error" };
const STATUS_COLOR   = { "in-progress": "info", review: "warning", draft: undefined, approved: "success" };

/* Card sx helpers */
const cardClickSx = {
  ...panelSx,
  padding: "var(--sp-4)",
  cursor: "pointer",
  transition: "border-color 0.15s, box-shadow 0.15s, transform 0.15s",
};
const clusterCardSx = {
  ...panelSx,
  padding: "var(--sp-3)",
  cursor: "pointer",
  transition: "box-shadow 0.15s, transform 0.15s",
};
const intelCardSx = {
  ...panelSx,
  padding: "var(--sp-3) var(--sp-4)",
  cursor: "pointer",
  marginBottom: "var(--sp-2)",
  transition: "box-shadow 0.12s",
};
const plrCardSx = {
  ...panelSx,
  padding: "var(--sp-3) var(--sp-4)",
  cursor: "pointer",
  marginBottom: "var(--sp-2)",
  transition: "border-color 0.12s, box-shadow 0.12s",
  borderLeft: "3px solid var(--color-teal)",
};

function greetingFor(hour) {
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

function formatDate(d) {
  const days   = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
  const months = ["January","February","March","April","May","June","July","August","September","October","November","December"];
  return `${days[d.getDay()]}, ${months[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
}

/* ── Main component ───────────────────────────────────────────────────────── */

export default function Today({ onNavigate }) {
  const go = (mod) => onNavigate?.(mod);
  const { user } = useAuth();

  const model = useMemo(() => {
    const now        = new Date();
    const greeting   = greetingFor(now.getHours());
    const firstName  = (user?.name || "there").split(" ")[0];
    const dateStr    = formatDate(now);

    const openPlans    = PLANS.filter((p) => p.status === "in-progress").length;
    const openIntel    = INTEL_SEED.filter((s) => s.status === "new").length;
    const openPLRs     = FD_PLR_CALENDAR.filter((p) => p.status === "Open").length;
    const openDrops    = MPI_DROPS.length;
    const awaitingAppr = PLANS.filter((p) => p.status === "review").length;
    const openNotifs   = TODAY_SEED.openNotifications ?? 0;

    const activePlans   = PLANS.filter((p) =>
      p.status === "in-progress" || p.status === "review"
    ).slice(0, 4);
    const openPLRList   = FD_PLR_CALENDAR.filter((p) => p.status === "Open").slice(0, 3);
    const recentSignals = INTEL_SEED.slice(0, 4);

    const statStrip = [
      { icon: "🤖", label: "Plans active",      val: openPlans,    color: "var(--color-info)",    bg: "var(--color-info-soft)",    mod: "workspace" },
      { icon: "🔍", label: "New intel signals",  val: openIntel,    color: "var(--color-warning)", bg: "var(--color-warning-soft)", mod: "intel"     },
      { icon: "📋", label: "Open PLRs",          val: openPLRs,     color: "var(--color-teal)",    bg: "var(--color-teal-soft)",    mod: "plr-calendar" },
      { icon: "📉", label: "NPI drop items",     val: openDrops,    color: "var(--color-error)",   bg: "var(--color-error-soft)",   mod: "mpi"       },
      { icon: "✅", label: "Awaiting approval",  val: awaitingAppr, color: "var(--color-success)", bg: "var(--color-success-soft)", mod: "approval"  },
    ];

    return {
      greeting, firstName, dateStr, openNotifs,
      statStrip, activePlans, openPLRList, recentSignals,
    };
  }, [user]);

  /* Cluster panel state */
  const { acceptedScenario, acceptedScope } = CLUSTER_ACCEPTANCE;
  const activeScenario = acceptedScenario ? FD_CLUST_SCENARIOS[acceptedScenario] : null;

  return (
    <div className="today-shell">

      {/* ── 1. Hero banner ─────────────────────────────────────────────────── */}
      <div className="today-hero">
        <div className="today-hero-left">
          <div className="today-hero-date">
            {model.dateStr}&nbsp;·&nbsp;FW 2025 curation window open
          </div>
          <div className="today-hero-greeting">
            {model.greeting}, {model.firstName} 👋
          </div>
          {user?.greeting && (
            <div className="today-hero-sub">{user.greeting}</div>
          )}
        </div>
        <div className="today-hero-notifs" onClick={() => go("workspace")}>
          <div className="today-hero-notifs-count">{model.openNotifs}</div>
          <div className="today-hero-notifs-label">open notifications</div>
        </div>
      </div>

      {/* ── 2. Quick-stat strip ────────────────────────────────────────────── */}
      <div className="today-stat-strip">
        {model.statStrip.map((stat) => (
          <div
            key={stat.mod}
            className="today-stat-cell"
            style={{ "--stat-color": stat.color, "--stat-bg": stat.bg }}
            onClick={() => go(stat.mod)}
          >
            <div className="today-stat-icon-wrap" style={{ background: stat.bg }}>
              {stat.icon}
            </div>
            <div className="today-stat-val" style={{ color: stat.color }}>{stat.val}</div>
            <div className="today-stat-label">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* ── 3. Active cluster model panel ──────────────────────────────────── */}
      <div className="today-cluster-panel">
        {!activeScenario ? (
          /* No model accepted yet */
          <Card sx={{ ...panelSx, padding: "var(--sp-4)" }}>
            <Stack direction="row" align="center" gap={3}>
              <span className="today-cluster-empty-icon">◆</span>
              <Stack direction="column" gap={0} style={{ flex: 1 }}>
                <Text variant="body-strong">No active cluster model</Text>
                <Text variant="caption" tone="subtle">
                  Build and accept a scenario in Location Clustering before creating a plan
                </Text>
              </Stack>
              <Button variant="primary" size="small" onClick={() => go("clustering")}>
                Set up clusters →
              </Button>
            </Stack>
          </Card>
        ) : (
          /* Model accepted */
          <Card sx={{ ...panelSx, padding: "var(--sp-4) var(--sp-5)" }}>
            {/* Header */}
            <Stack direction="row" align="center" justify="space-between" style={{ marginBottom: "var(--sp-4)" }}>
              <Stack direction="row" align="center" gap={2}>
                <div className="today-cluster-model-icon">
                  {SCENARIO_ICONS[acceptedScenario] || "🧠"}
                </div>
                <Stack direction="column" gap={0}>
                  <Text variant="body-strong">
                    Active Cluster Model&nbsp;·&nbsp;{SCENARIO_NAMES[acceptedScenario] || acceptedScenario}
                  </Text>
                  <Text variant="caption" tone="subtle">
                    {activeScenario.clusters.length} clusters&nbsp;·&nbsp;
                    {acceptedScope.dept}&nbsp;·&nbsp;
                    {acceptedScope.channel}&nbsp;·&nbsp;
                    {acceptedScope.season}
                  </Text>
                </Stack>
              </Stack>
              <Button variant="ghost" size="small" onClick={() => go("clustering")}>
                Manage →
              </Button>
            </Stack>

            {/* Cluster cards grid */}
            <div
              className="today-cluster-cards"
              style={{ gridTemplateColumns: `repeat(${Math.min(activeScenario.clusters.length, 4)}, 1fr)` }}
            >
              {activeScenario.clusters.map((cl) => (
                <Card
                  key={cl.id}
                  className="today-cluster-card"
                  sx={{
                    ...clusterCardSx,
                    borderLeft: `3px solid ${cl.color}`,
                    background: "var(--color-surface-alt)",
                    boxShadow: "none",
                  }}
                  onClick={() => go("clustering")}
                >
                  <Stack direction="row" align="center" gap={1} style={{ marginBottom: "var(--sp-2)" }}>
                    <div className="today-cluster-dot" style={{ background: cl.color }} />
                    <span className="today-cluster-label">{cl.label}</span>
                  </Stack>
                  <div className="today-cluster-meta">
                    {cl.stores.length} stores&nbsp;·&nbsp;${cl.revSqft}/sqft&nbsp;·&nbsp;{cl.st}% ST
                  </div>
                  <div style={{ marginTop: "var(--sp-2)" }}>
                    <Badge
                      variant="subtle"
                      color={TIER_COLOR[cl.tier] || "info"}
                      label={`${(cl.tier || "").charAt(0).toUpperCase()}${(cl.tier || "").slice(1)} tier`}
                    />
                  </div>
                  {cl.signals?.[0] && (
                    <div className="today-cluster-signal">{cl.signals[0]}</div>
                  )}
                </Card>
              ))}
            </div>
          </Card>
        )}
      </div>

      {/* ── 4. Two-column body ─────────────────────────────────────────────── */}
      <div className="today-body">

        {/* Left: My focus today */}
        <div className="today-focus-col">
          <div className="today-section-label">
            <span className="today-section-label-icon">🎯</span>
            <span>My focus today</span>
          </div>

          {/* Active plan cards */}
          {model.activePlans.length ? (
            model.activePlans.map((plan) => {
              const st   = PLAN_STATUS[plan.status] || { label: plan.status };
              const done = plan.stagesCompleted.length;
              return (
                <Card
                  key={plan.id}
                  sx={cardClickSx}
                  onClick={() => go("workspace")}
                  className="today-plan-card"
                >
                  <Stack direction="row" justify="space-between" align="center" style={{ marginBottom: "var(--sp-3)" }}>
                    <Text variant="subheading">{plan.name}</Text>
                    <Badge
                      variant="subtle"
                      color={STATUS_COLOR[plan.status]}
                      label={st.label}
                    />
                  </Stack>

                  {/* Segmented pipeline progress bar */}
                  <div className="today-plan-pipe">
                    {PIPE_STAGES.map((s) => (
                      <div
                        key={s.id}
                        className="today-plan-pipe-seg"
                        title={s.label}
                        style={{
                          background: plan.stagesCompleted.includes(s.id)
                            ? "var(--color-success)"
                            : s.id === plan.activeStage
                            ? "color-mix(in srgb, var(--color-info) 60%, transparent)"
                            : "var(--color-border)",
                        }}
                      />
                    ))}
                  </div>

                  <Text variant="caption" tone="subtle">
                    {done}/{PIPE_STAGES.length} stages&nbsp;·&nbsp;{plan.createdBy}&nbsp;·&nbsp;{plan.updatedAt}
                  </Text>
                </Card>
              );
            })
          ) : (
            <Card sx={{ ...panelSx, padding: "var(--sp-6)", textAlign: "center" }}>
              <Stack direction="column" align="center" gap={2}>
                <span style={{ fontSize: "var(--fs-title)" }}>📋</span>
                <Text variant="body-strong" tone="muted">No active plans</Text>
                <Button variant="primary" size="small" onClick={() => go("workspace")}>
                  + Create Plan
                </Button>
              </Stack>
            </Card>
          )}

          {/* Open PLR windows */}
          {model.openPLRList.length > 0 && (
            <>
              <div className="today-section-label" style={{ marginTop: "var(--sp-5)" }}>
                <span className="today-section-label-icon">📅</span>
                <span>Open PLR windows</span>
              </div>
              {model.openPLRList.map((plr) => (
                <Card
                  key={plr.id}
                  className="today-plr-card"
                  sx={plrCardSx}
                  onClick={() => go("plr-calendar")}
                >
                  <Stack direction="row" align="center" justify="space-between" gap={3}>
                    <Stack direction="column" gap={0} style={{ flex: 1, minWidth: 0 }}>
                      <Text variant="caption" tone="strong" style={{ marginBottom: 2 }}>{plr.name}</Text>
                      <Text variant="micro" tone="subtle">
                        Pres: {plr.presDate}&nbsp;·&nbsp;Due: {plr.dueDate}
                      </Text>
                    </Stack>
                    <Badge variant="subtle" color="success" label="Open" />
                  </Stack>
                </Card>
              ))}
            </>
          )}
        </div>

        {/* Right: Quick access + Recent signals */}
        <div className="today-right-col">

          <div className="today-section-label">
            <span className="today-section-label-icon">⚡</span>
            <span>Quick access</span>
          </div>

          <div className="today-quick-grid">
            {QUICK_ACCESS.map((btn) => (
              <Card
                key={btn.mod}
                sx={{
                  ...panelSx,
                  padding: "var(--sp-3) var(--sp-3)",
                  cursor: "pointer",
                  background: btn.bg,
                  boxShadow: "none",
                  border: "1px solid transparent",
                  transition: "transform 0.12s, box-shadow 0.12s, border-color 0.12s",
                }}
                onClick={() => go(btn.mod)}
                className="today-quick-card"
              >
                <Stack direction="row" align="center" gap={2}>
                  <span className="today-quick-icon">{btn.icon}</span>
                  <Text variant="caption" tone="strong">{btn.label}</Text>
                </Stack>
              </Card>
            ))}
          </div>

          {model.recentSignals.length > 0 && (
            <>
              <div className="today-section-label" style={{ marginTop: "var(--sp-5)" }}>
                <span className="today-section-label-icon">🔍</span>
                <span>Recent signals</span>
              </div>
              {model.recentSignals.map((sig) => (
                <Card
                  key={sig.id}
                  className="today-intel-card"
                  sx={{
                    ...intelCardSx,
                    borderLeft: `3px solid ${URGENCY_COLOR[sig.urgency] || "var(--color-border-strong)"}`,
                  }}
                  onClick={() => go("intel")}
                >
                  <Text
                    variant="caption"
                    tone="strong"
                    style={{
                      display: "block",
                      marginBottom: 3,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {sig.title}
                  </Text>
                  <Text variant="micro" tone="subtle">
                    {sig.author}&nbsp;·&nbsp;{sig.date}
                  </Text>
                </Card>
              ))}
              <button type="button" className="today-intel-all" onClick={() => go("intel")}>
                View all signals →
              </button>
            </>
          )}
        </div>

      </div>
    </div>
  );
}
