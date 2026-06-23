import React, { useMemo } from "react";
import { Card, Badge, Button, EmptyState, Tooltip } from "impact-ui";
import {
  ClipboardList, Search, TrendingUp, TrendingDown, BarChart2,
  Bot, CheckCircle2, Tag, AlertTriangle, AlertCircle,
  Info, ChevronRight, Sparkles, DollarSign, Percent, Package,
  Activity,
} from "lucide-react";
import Text from "../components/Text.jsx";
import Stack from "../components/Stack.jsx";
import { FD_PLR_CALENDAR } from "../data/plr.js";
import { PLANS, PIPE_STAGES, PLAN_STATUS } from "../data/workspace.js";
import { INTEL_SEED } from "../data/intel.js";
import { MPI_DROPS } from "../data/mpi.js";
import {
  TODAY_SEED, NEEDS_ATTENTION, CURATION_DECISIONS, RANGE_PERFORMANCE,
} from "../data/todaySeed.js";
import { useAuth } from "../context/AuthContext.jsx";
import { panelSx } from "../styles/panelSx.js";
import "./Today.css";

/* ── View-local constants ─────────────────────────────────────────────────── */

const URGENCY_COLOR = {
  immediate: "var(--color-error)",
  season:    "var(--color-warning)",
  next:      "var(--color-accent)",
  watch:     "var(--color-success)",
};

const STATUS_COLOR = { "in-progress": "info", review: "warning", draft: "default", approved: "success" };

const SEV_ICON  = { error: AlertCircle, warning: AlertTriangle, success: CheckCircle2, info: Info };
const SEV_COLOR = {
  error:   "var(--color-error)",
  warning: "var(--color-warning)",
  success: "var(--color-success)",
  info:    "var(--color-info)",
};

/* Curation decision segment colours */
const DEC_COLORS = {
  keep:    { fill: "var(--color-success)", label: "Keep",    text: "var(--color-success)" },
  add:     { fill: "var(--color-info)",    label: "Add",     text: "var(--color-info)"    },
  drop:    { fill: "var(--color-error)",   label: "Drop",    text: "var(--color-error)"   },
  pending: { fill: "var(--color-warning)", label: "Pending", text: "var(--color-warning)" },
};

/* Card sx helpers */
const cardSx      = { ...panelSx, padding: "var(--sp-4)", height: "100%", boxSizing: "border-box" };
const cardClickSx = { ...cardSx, cursor: "pointer", transition: "border-color 0.15s, box-shadow 0.15s" };
const intelCardSx = { ...panelSx, padding: "var(--sp-3) var(--sp-4)", cursor: "pointer", marginBottom: "var(--sp-2)", transition: "box-shadow 0.12s" };
const plrCardSx   = { ...panelSx, padding: "var(--sp-3) var(--sp-4)", cursor: "pointer", marginBottom: "var(--sp-2)", transition: "border-color 0.12s, box-shadow 0.12s", borderLeft: "var(--border-accent-width) solid var(--color-teal)" };

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

/* ── Card: Curation Decisions ─────────────────────────────────────────────── */
function CurationDecisionsCard({ go }) {
  const { keep, add, drop, pending, total } = CURATION_DECISIONS;
  const decided = keep + add + drop;
  const decidedPct = Math.round((decided / total) * 100);
  const segments = [
    { key: "keep",    val: keep    },
    { key: "add",     val: add     },
    { key: "drop",    val: drop    },
    { key: "pending", val: pending },
  ];
  return (
    <Card size="small" sx={cardClickSx} onClick={() => go("national")} className="today-grid-card" tabIndex={0}>
      {/* Header */}
      <Stack direction="row" align="center" justify="space-between" style={{ marginBottom: "var(--sp-3)" }}>
        <Stack direction="row" align="center" gap={2}>
          <CheckCircle2 size={14} color="var(--color-success)" />
          <Text variant="overline" tone="subtle">Curation Decisions</Text>
        </Stack>
        <Text variant="micro" tone="primary" style={{ cursor: "pointer", fontWeight: 700 }}>National Core →</Text>
      </Stack>

      {/* Decision count tiles */}
      <div className="today-dec-tiles">
        {segments.map(({ key, val }) => {
          const c = DEC_COLORS[key];
          return (
            <div key={key} className="today-dec-tile">
              <div className="today-dec-tile-val" style={{ color: c.text }}>{val}</div>
              <div className="today-dec-tile-lbl">{c.label}</div>
            </div>
          );
        })}
      </div>

      {/* Segmented progress bar */}
      <div className="today-seg-bar" style={{ margin: "var(--sp-3) 0 var(--sp-2)" }}>
        {segments.map(({ key, val }) => (
          <div
            key={key}
            className="today-seg-bar-seg"
            style={{ flex: val, background: DEC_COLORS[key].fill }}
            title={`${DEC_COLORS[key].label}: ${val}`}
          />
        ))}
      </div>

      {/* Footer */}
      <Text variant="micro" tone="subtle">
        {total} SKUs in scope&nbsp;·&nbsp;<span style={{ color: "var(--color-success)", fontWeight: 700 }}>{decidedPct}% decided</span>
      </Text>
    </Card>
  );
}

/* ── Card: Agent Awaiting You ─────────────────────────────────────────────── */
function AgentAwaitingCard({ go }) {
  return (
    <Card size="small" sx={cardSx} className="today-grid-card">
      {/* Header */}
      <Stack direction="row" align="center" justify="space-between" style={{ marginBottom: "var(--sp-3)" }}>
        <Stack direction="row" align="center" gap={2}>
          <Sparkles size={14} color="var(--color-primary)" />
          <Text variant="overline" tone="subtle">Agent Awaiting You</Text>
        </Stack>
        <Badge variant="subtle" color="info" label={`${NEEDS_ATTENTION.length}`} />
      </Stack>

      {/* Awaiting items */}
      <div className="today-awaiting-list">
        {NEEDS_ATTENTION.map((item, idx) => {
          const SevIcon = SEV_ICON[item.severity] || Info;
          const sevColor = SEV_COLOR[item.severity] || "var(--color-info)";
          return (
            <button
              key={idx}
              type="button"
              className="today-awaiting-row"
              onClick={() => go(item.mod)}
            >
              <SevIcon size={14} color={sevColor} style={{ flexShrink: 0, marginTop: 1 }} />
              <div style={{ flex: 1, minWidth: 0, textAlign: "left" }}>
                <div className="today-awaiting-title">{item.title}</div>
                <div className="today-awaiting-sub">{item.sub}</div>
              </div>
              <ChevronRight size={13} color="var(--color-text-subtle)" style={{ flexShrink: 0 }} />
            </button>
          );
        })}
      </div>
    </Card>
  );
}

/* ── Card: Range Performance ──────────────────────────────────────────────── */
function RangePerformanceCard({ go }) {
  const { salesDollars, salesSub, gmPct, gmSub, units, unitsSub, sellThruPct, stSub } = RANGE_PERFORMANCE;
  const metrics = [
    { Icon: DollarSign, label: "Sales $",     val: salesDollars,      sub: salesSub,  color: "var(--color-success)",  bg: "var(--color-success-soft)"  },
    { Icon: Percent,    label: "GM %",        val: `${gmPct}%`,       sub: gmSub,     color: "var(--color-info)",     bg: "var(--color-info-soft)"     },
    { Icon: Package,    label: "Sales Units", val: units,             sub: unitsSub,  color: "var(--color-accent)",   bg: "var(--color-accent-soft)"   },
    { Icon: Activity,   label: "Sell Thru",   val: `${sellThruPct}%`, sub: stSub,     color: "var(--color-warning)",  bg: "var(--color-warning-soft)"  },
  ];
  return (
    <Card size="small" sx={cardClickSx} onClick={() => go("hindsight")} className="today-grid-card" tabIndex={0}>
      {/* Header */}
      <Stack direction="row" align="center" justify="space-between" style={{ marginBottom: "var(--sp-3)" }}>
        <Stack direction="row" align="center" gap={2}>
          <BarChart2 size={14} color="var(--color-accent)" />
          <Text variant="overline" tone="subtle">Range Performance</Text>
        </Stack>
        <Text variant="micro" tone="primary" style={{ cursor: "pointer", fontWeight: 700 }}>Hindsight →</Text>
      </Stack>

      {/* 2×2 KPI tiles */}
      <div className="today-metric-2x2">
        {metrics.map(({ Icon, label, val, sub, color, bg }) => (
          <div key={label} className="today-metric-tile" style={{ background: bg }}>
            <Stack direction="row" align="center" gap={1} style={{ marginBottom: "var(--sp-1)" }}>
              <Icon size={12} color={color} />
              <span className="today-metric-lbl">{label}</span>
            </Stack>
            <div className="today-metric-val" style={{ color }}>{val}</div>
            <div className="today-metric-sub" style={{ color }}>{sub}</div>
          </div>
        ))}
      </div>

      <Text variant="micro" tone="subtle" style={{ marginTop: "var(--sp-2)" }}>
        R13 rolling · all depts
      </Text>
    </Card>
  );
}

/* ── Card: NPI Exposure ───────────────────────────────────────────────────── */
function NpiExposureCard({ mpiDrops, go }) {
  const national = mpiDrops.filter((d) => d.velocity === "A");
  const cluster  = mpiDrops.filter((d) => d.velocity === "B" || d.velocity === "C");
  const store    = mpiDrops.filter((d) => d.velocity === "D");
  const totalVal = mpiDrops.reduce((s, d) => s + d.npiDollars, 0);
  const fmt      = (n) => n >= 1000 ? `$${(n / 1000).toFixed(0)}K` : `$${n}`;
  const tiers = [
    { label: "National",  count: national.length, color: "var(--color-error)",   bg: "var(--color-error-soft)"   },
    { label: "Cluster",   count: cluster.length,  color: "var(--color-warning)", bg: "var(--color-warning-soft)" },
    { label: "Store",     count: store.length,    color: "var(--color-info)",    bg: "var(--color-info-soft)"    },
  ];
  return (
    <Card size="small" sx={cardClickSx} onClick={() => go("mpi")} className="today-grid-card" tabIndex={0}>
      {/* Header */}
      <Stack direction="row" align="center" justify="space-between" style={{ marginBottom: "var(--sp-3)" }}>
        <Stack direction="row" align="center" gap={2}>
          <TrendingDown size={14} color="var(--color-error)" />
          <Text variant="overline" tone="subtle">NPI Exposure</Text>
        </Stack>
        <Text variant="micro" tone="primary" style={{ cursor: "pointer", fontWeight: 700 }}>Review →</Text>
      </Stack>

      {/* Total */}
      <Stack direction="row" align="baseline" gap={2} style={{ marginBottom: "var(--sp-3)" }}>
        <div className="today-npi-total" style={{ color: "var(--color-error)" }}>{mpiDrops.length}</div>
        <div>
          <Text variant="caption" tone="muted">SKUs to exit</Text>
          <Text variant="micro" tone="subtle" as="div">{fmt(totalVal)} at-risk value</Text>
        </div>
      </Stack>

      {/* Tier rows */}
      <div className="today-npi-tiers">
        {tiers.map(({ label, count, color, bg }) => (
          <div key={label} className="today-npi-tier-row">
            <span className="today-npi-tier-lbl">{label}</span>
            <div className="today-npi-tier-bar-wrap">
              <div
                className="today-npi-tier-bar"
                style={{
                  width: `${mpiDrops.length ? Math.round((count / mpiDrops.length) * 100) : 0}%`,
                  background: color,
                }}
              />
            </div>
            <span className="today-npi-tier-count" style={{ color, background: bg }}>{count}</span>
          </div>
        ))}
      </div>
    </Card>
  );
}

/* ── Main component ───────────────────────────────────────────────────────── */

export default function Today({ onNavigate }) {
  const go = (mod) => onNavigate?.(mod);
  const { user } = useAuth();

  const model = useMemo(() => {
    const now       = new Date();
    const greeting  = greetingFor(now.getHours());
    const firstName = (user?.name || "there").split(" ")[0];
    const dateStr   = formatDate(now);
    const role      = user?.role || "Floor & Decor Assortment Planning";

    const inProgressPlans = PLANS.filter((p) => p.status === "in-progress").length;
    const openPlans       = PLANS.filter((p) => p.status === "in-progress" || p.status === "review").length;
    const openIntel       = INTEL_SEED.filter((s) => s.status === "new").length;
    const openPLRs        = FD_PLR_CALENDAR.filter((p) => p.status === "Open").length;
    const openNotifs      = TODAY_SEED.openNotifications ?? 0;

    /* Overdue = Open PLRs whose dueDate is before today */
    const todayStr    = now.toISOString().slice(0, 10);
    const overduePLRs = FD_PLR_CALENDAR.filter((p) => p.status === "Open" && p.dueDate < todayStr).length;

    const agentUrgent  = NEEDS_ATTENTION.filter((n) => n.severity === "error" || n.severity === "warning").length;
    const awaitingSub  = NEEDS_ATTENTION.find((n) => n.severity === "error" || n.severity === "warning")?.title
                         || NEEDS_ATTENTION[0]?.title
                         || "Review pending items";

    /* 4-tile hero KPIs — first 3 navigate to approval (PLR Status) per HTML reference */
    const heroKpis = [
      {
        label:    "Open PLRs",
        val:      openPLRs,
        sub:      overduePLRs > 0 ? `${overduePLRs} overdue` : "All on track",
        subWarn:  overduePLRs > 0,
        mod:      "approval",
      },
      {
        label:    "Active Plans",
        val:      openPlans,
        sub:      `${inProgressPlans} in progress`,
        subWarn:  false,
        mod:      "approval",
      },
      {
        label:    "Awaiting You",
        val:      NEEDS_ATTENTION.length,
        sub:      awaitingSub,
        subWarn:  agentUrgent > 0,
        mod:      "approval",
      },
      {
        label:    "New Intel Signals",
        val:      openIntel,
        sub:      "4 actioned this session",
        subWarn:  false,
        mod:      "intel",
      },
    ];

    const activePlans   = PLANS.filter((p) => p.status === "in-progress" || p.status === "review").slice(0, 4);
    const openPLRList   = FD_PLR_CALENDAR.filter((p) => p.status === "Open").slice(0, 5);
    const recentSignals = INTEL_SEED.slice(0, 4);

    return {
      greeting, firstName, dateStr, role, openNotifs, agentUrgent, todayStr,
      heroKpis, activePlans, openPLRList, recentSignals,
    };
  }, [user]);

  return (
    <div className="today-shell">

      {/* ── 1. Premium dark hero card ────────────────────────────────────────── */}
      <div className="today-hero-card">
        {/* Top: greeting + agent pill */}
        <div className="today-hero-top">
          <div>
            <div className="today-hero-overline">
              {model.dateStr}&nbsp;·&nbsp;FW 2025 curation window open
            </div>
            <h1 className="today-hero-title">
              {model.greeting}, {model.firstName}
            </h1>
            <p className="today-hero-subtitle">
              {model.role}&nbsp;·&nbsp;Floor &amp; Decor Assortment Planning
            </p>
          </div>
          {/* Agent active pill */}
          <div className="today-agent-pill-hero">
            <div className="today-agent-pill-dot" />
            <Sparkles size={12} />
            <span>Agent active</span>
            {model.agentUrgent > 0 && (
              <span className="today-agent-pill-badge-hero">{model.agentUrgent} awaiting</span>
            )}
          </div>
        </div>

        {/* Bottom: 4 KPI tiles */}
        <div className="today-hero-kpis">
          {model.heroKpis.map((kpi) => (
            <button
              key={kpi.mod}
              type="button"
              className="today-hero-kpi"
              onClick={() => go(kpi.mod)}
            >
              <div className="today-hero-kpi-val">{kpi.val}</div>
              <div className="today-hero-kpi-label">{kpi.label}</div>
              <div
                className="today-hero-kpi-sub"
                style={{ color: kpi.subWarn ? "var(--color-warning-on-dark, #f6c344)" : "rgba(255,255,255,0.5)" }}
              >
                {kpi.sub}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* ── 3. Main 3×2 grid ────────────────────────────────────────────────── */}
      <div className="today-main-grid">

        {/* Row 1 */}
        <CurationDecisionsCard go={go} />

        {/* Open PLRs */}
        <Card size="small" sx={cardSx} className="today-grid-card">
          <Stack direction="row" align="center" justify="space-between" style={{ marginBottom: "var(--sp-3)" }}>
            <Stack direction="row" align="center" gap={2}>
              <ClipboardList size={14} color="var(--color-teal)" />
              <Text variant="overline" tone="subtle">Open PLRs</Text>
            </Stack>
            <Text variant="micro" tone="primary" style={{ cursor: "pointer", fontWeight: 700 }} onClick={() => go("approval")}>All PLRs →</Text>
          </Stack>
          {model.openPLRList.length ? (
            model.openPLRList.map((plr) => {
              const isOverdue = plr.presDate < model.todayStr;
              const daysTo = isOverdue ? 0 : Math.round(
                (new Date(plr.presDate) - new Date(model.todayStr)) / 86400000
              );
              const vLabel = plr.versions === 1 ? "1 version" : `${plr.versions ?? 0} versions`;
              return (
                <Card
                  key={plr.id}
                  size="small"
                  sx={plrCardSx}
                  onClick={() => go("approval")}
                  className="today-plr-card"
                  tabIndex={0}
                >
                  <Stack direction="row" align="center" justify="space-between" gap={2}>
                    <Stack direction="column" gap={0} style={{ flex: 1, minWidth: 0 }}>
                      <Text variant="caption" tone="strong" truncate style={{ marginBottom: "var(--sp-1)" }}>{plr.name}</Text>
                      <Text variant="micro" tone="subtle">{vLabel}&nbsp;·&nbsp;{plr.dept}</Text>
                    </Stack>
                    {isOverdue
                      ? <Badge variant="subtle" color="error"   label="Overdue" />
                      : <Badge variant="subtle" color="info"    label={`${daysTo}d to pres`} />
                    }
                  </Stack>
                </Card>
              );
            })
          ) : (
            <EmptyState heading="No open PLRs" />
          )}
        </Card>

        <AgentAwaitingCard go={go} />

        {/* Row 2 */}
        <RangePerformanceCard go={go} />

        {/* Active Plans */}
        <Card size="small" sx={cardSx} className="today-grid-card">
          <Stack direction="row" align="center" justify="space-between" style={{ marginBottom: "var(--sp-3)" }}>
            <Stack direction="row" align="center" gap={2}>
              <Bot size={14} color="var(--color-info)" />
              <Text variant="overline" tone="subtle">Active Plans</Text>
            </Stack>
            <Text variant="micro" tone="primary" style={{ cursor: "pointer", fontWeight: 700 }} onClick={() => go("workspace")}>My Workspace →</Text>
          </Stack>
          {model.activePlans.length ? (
            model.activePlans.map((plan) => {
              const st   = PLAN_STATUS[plan.status] || { label: plan.status };
              const done = plan.stagesCompleted.length;
              return (
                <Card
                  key={plan.id}
                  size="small"
                  sx={{ ...panelSx, padding: "var(--sp-3)", cursor: "pointer", marginBottom: "var(--sp-2)", transition: "border-color 0.15s, box-shadow 0.15s" }}
                  onClick={() => go("workspace")}
                  className="today-plan-card"
                  tabIndex={0}
                >
                  <Stack direction="row" justify="space-between" align="center" style={{ marginBottom: "var(--sp-2)" }}>
                    <Text variant="caption" tone="strong" truncate>{plan.name}</Text>
                    <Badge variant="subtle" color={STATUS_COLOR[plan.status]} label={st.label} />
                  </Stack>
                  <div className="today-plan-pipe">
                    {PIPE_STAGES.map((s) => (
                      <Tooltip key={s.id} title={s.label} variant="secondary" orientation="top">
                        <div
                          className="today-plan-pipe-seg"
                          style={{
                            background: plan.stagesCompleted.includes(s.id)
                              ? "var(--color-success)"
                              : s.id === plan.activeStage
                              ? "color-mix(in srgb, var(--color-info) 60%, transparent)"
                              : "var(--color-border)",
                          }}
                        />
                      </Tooltip>
                    ))}
                  </div>
                  <Text variant="micro" tone="subtle">
                    {done}/{PIPE_STAGES.length} stages&nbsp;·&nbsp;{plan.createdBy}&nbsp;·&nbsp;{plan.updatedAt}
                  </Text>
                </Card>
              );
            })
          ) : (
            <EmptyState
              heading="No active plans"
              primaryButtonLabel="+ Create Plan"
              onPrimaryButtonClick={() => go("workspace")}
            />
          )}
        </Card>

        <NpiExposureCard mpiDrops={MPI_DROPS} go={go} />

      </div>

      {/* ── 4. Market Intelligence — full-width signal strip ──────────────────── */}
      <Card size="small" sx={{ ...panelSx, padding: "var(--sp-4) var(--sp-5)", marginBottom: "var(--sp-2)" }}>
        <Stack direction="row" align="center" justify="space-between" style={{ marginBottom: "var(--sp-3)" }}>
          <Stack direction="row" align="center" gap={2}>
            <Search size={14} color="var(--color-warning)" />
            <Text variant="overline" tone="subtle">Market Intelligence</Text>
          </Stack>
          <Stack direction="row" align="center" gap={3}>
            <Badge variant="subtle" color="warning" label={`${INTEL_SEED.filter((s) => s.status === "new").length} new`} />
            <Button variant="ghost" size="small" onClick={() => go("intel")}>View all →</Button>
          </Stack>
        </Stack>

        <div className="today-intel-grid">
          {model.recentSignals.map((sig) => (
            <Card
              key={sig.id}
              size="small"
              className="today-intel-card"
              sx={{
                ...panelSx,
                padding: "var(--sp-3) var(--sp-4)",
                cursor: "pointer",
                background: "var(--color-surface-alt)",
                boxShadow: "none",
                borderLeft: `var(--border-accent-width) solid ${URGENCY_COLOR[sig.urgency] || "var(--color-border-strong)"}`,
                transition: "box-shadow 0.12s",
              }}
              onClick={() => go("intel")}
              tabIndex={0}
            >
              <Stack direction="row" align="center" gap={2} style={{ marginBottom: "var(--sp-1)" }}>
                <Badge
                  variant="subtle"
                  color={sig.direction === "opportunity" ? "success" : "error"}
                  label={sig.direction ? sig.direction.toUpperCase() : "SIGNAL"}
                />
                <Text variant="caption" tone="strong" truncate as="div">
                  {sig.title}
                </Text>
              </Stack>
              <Text variant="micro" tone="subtle">
                {sig.categories?.[0] || sig.type}&nbsp;·&nbsp;{sig.status}
              </Text>
            </Card>
          ))}
        </div>
      </Card>

    </div>
  );
}
