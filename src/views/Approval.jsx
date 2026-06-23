import React, { useState, useCallback, useMemo } from "react";
import { Card, Badge, Button } from "impact-ui";
import {
  BarChart3, Package, Layers, TrendingDown, Send, Eye,
  ChevronDown, ChevronUp, ChevronRight, ArrowLeft,
  CheckCircle2, Bot, Plus, RefreshCw, Sparkles,
  TreePine, Grid2x2, Mountain, Star, CheckCheck,
  Lock,
} from "lucide-react";
import Text from "../components/Text.jsx";
import Stack from "../components/Stack.jsx";
import { PLANS } from "../data/workspace.js";
import {
  FD_PLR_CALENDAR, ASSORT_PERIODS, plrCalcOptionCount,
} from "../data/plr.js";
import { FD_CLUST_SCENARIOS } from "../data/clustering.js";
import { panelSx } from "../styles/panelSx.js";
import "./Approval.css";

/* ─── Dept stripe colours ─────────────────────────────────────────────────── */
const DEPT_STRIPE = {
  "Tile":                   "var(--color-teal)",
  "Wood":                   "var(--color-wood)",
  "Laminate & Vinyl":       "var(--color-info)",
  "Stone":                  "var(--color-accent)",
  "Decorative Accessories": "var(--color-warning)",
};

/* Dept metadata for the Create wizard step-1 grid */
const DEPT_META = [
  { name: "Wood",                   Icon: TreePine,  color: "var(--color-wood, #b45309)" },
  { name: "Tile",                   Icon: Grid2x2,   color: "var(--color-teal)"          },
  { name: "Laminate & Vinyl",       Icon: Layers,    color: "var(--color-info)"           },
  { name: "Stone",                  Icon: Mountain,  color: "var(--color-accent)"         },
  { name: "Decorative Accessories", Icon: Star,      color: "var(--color-warning)"        },
];

/* ─── Stage definitions ───────────────────────────────────────────────────── */
const STAGES = [
  {
    key: "setup", num: 1,
    label: "Hindsight & Option Planning",
    sub: "Review historical data · define scope · calculate options",
    Icon: BarChart3,
    doneFn: (p) => p.stagesCompleted?.length >= 1 || p.status !== "draft",
    metrics: (p) => [
      { l: "Carry rate baseline", v: "68%",                                                                                    ok: true          },
      { l: "Avg R13 / store",     v: "124 sqft",                                                                               ok: true          },
      { l: "Sell-thru rate",      v: "72%",                                                                                    ok: true          },
      { l: "Option count",        v: p.optionCalc ? `${p.optionCalc.total} options` : "Not set",                              ok: !!p.optionCalc },
    ],
    agentFn: (st, p) => st === "done"
      ? `Setup complete. Hindsight reviewed, ${p?.optionCalc ? p.optionCalc.total + " options defined," : ""} cluster B accepted.`
      : "Review hindsight data and run option recommendation to define your range size before curation.",
    actions: [
      { l: "Hindsight Report",    mod: "hindsight"   },
      { l: "Market Intelligence", mod: "intel"       },
      { l: "Location Clustering", mod: "clustering"  },
    ],
  },
  {
    key: "portfolio", num: 2,
    label: "Portfolio Build & Forecast",
    sub: "New SKUs · like-item assignment · vendor forecasts",
    Icon: Package,
    doneFn: (p) => p.stagesCompleted?.includes("forecast"),
    metrics: (p) => [
      { l: "New SKUs",          v: `${p.kpis.skus} in scope`,                                                ok: true },
      { l: "Approved/listed",   v: `${Math.round(p.kpis.skus * 0.7)} SKUs`,                                 ok: true },
      { l: "Forecast received", v: `${Math.round(p.kpis.skus * 0.55)} / ${Math.round(p.kpis.skus * 0.7)}`,  ok: true },
      { l: "Declined",          v: `${Math.round(p.kpis.skus * 0.1)} SKUs`,                                 ok: true },
    ],
    agentFn: (st) => st === "done"
      ? "All new SKUs reviewed. Agent recommendations include projected performance."
      : "Review vendor submissions and assign like-item forecasts in Portfolio Build.",
    actions: [
      { l: "Portfolio Build",    mod: "portfolio" },
      { l: "Like-Item Forecast", mod: "forecast"  },
      { l: "Catalogue",          mod: "catalogue" },
    ],
  },
  {
    key: "curation", num: 3,
    label: "Assortment Curation",
    sub: "National → cluster → store three-tier cascade",
    Icon: Layers,
    doneFn: (p) => p.stagesCompleted?.includes("curation"),
    metrics: (p) => [
      { l: "National decisions", v: `${p.kpis.coreCount} / ${p.kpis.skus} done`,                         ok: p.stagesCompleted?.includes("national")  },
      { l: "Cluster decisions",  v: p.stagesCompleted?.includes("regional") ? "All resolved" : "Pending", ok: p.stagesCompleted?.includes("regional")  },
      { l: "National OTB",       v: `$${p.kpis.coreCount * 11}k / $${Math.round(p.kpis.skus * 12)}k`,    ok: true                                     },
      { l: "Keeps",              v: `${p.kpis.coreCount} national`,                                        ok: true                                     },
    ],
    agentFn: (st, p) => st === "done"
      ? "All curation decisions finalised. Range locked for NPI planning."
      : p.stagesCompleted?.includes("national")
        ? "National Core done. Complete Regional Review and Store Curation to finish this stage."
        : "Review SKU decisions in National Core, then Regional Review and Store Curation.",
    actions: [
      { l: "National Core",   mod: "national"       },
      { l: "Regional Review", mod: "regional"       },
      { l: "Store Curation",  mod: "store-curation" },
    ],
  },
  {
    key: "mpi", num: 4,
    label: "NPI & Markdown Planning",
    sub: "Exit strategy for all dropped SKUs",
    Icon: TrendingDown,
    doneFn: (p) => p.stagesCompleted?.includes("mpi"),
    metrics: (p) => [
      { l: "Dropped SKUs",      v: "3 total",                                                ok: true                             },
      { l: "Exit strategy set", v: p.stagesCompleted?.includes("mpi") ? "3 / 3" : "0 / 3", ok: p.stagesCompleted?.includes("mpi") },
      { l: "On-hand value",     v: "$45k at risk",                                            ok: true                             },
      { l: "National drops",    v: "3 SKUs",                                                  ok: true                             },
    ],
    agentFn: (st) => st === "done"
      ? "All dropped SKUs have an exit strategy. Ready for final review."
      : "Set exit strategies for all dropped SKUs in NPI / Product Line Review.",
    actions: [{ l: "NPI / Product Line Review", mod: "mpi" }],
  },
  {
    key: "approval", num: 5,
    label: "Review & Publish",
    sub: "Final sign-off · lock assortment · export",
    Icon: Send,
    doneFn: (p) => p.stagesCompleted?.includes("approval"),
    metrics: (p) => {
      const pub = p.stagesCompleted?.includes("approval");
      return [
        { l: "Status",           v: pub ? "Published" : "Pending approval",         ok: pub  },
        { l: "Total SKUs",       v: `${p.kpis.skus} in range`,                      ok: true },
        { l: "Net range change", v: `+${Math.round(p.kpis.skus * 0.15) - 3} SKUs`,  ok: true },
        { l: "OTB committed",    v: `$${p.kpis.coreCount * 11}k`,                   ok: true },
      ];
    },
    agentFn: (st) => st === "done"
      ? "Assortment published. Decisions are now locked and committed to Oracle."
      : "All stages complete. Review the summary then publish to lock the assortment.",
    actions: [
      { l: "Publish Assortment", mod: null, onClick: "publish" },
      { l: "Oracle Export",      mod: null, onClick: "oracle"  },
    ],
  },
  {
    key: "hindsight", num: 6,
    label: "Hindsight & Feedback",
    sub: "Actuals vs plan · feed next PLR",
    Icon: Eye,
    doneFn: () => false,
    metrics: () => [
      { l: "Hindsight report", v: "Not started", ok: false },
      { l: "Variance SKUs",    v: "Pending",      ok: false },
      { l: "Feedback signals", v: "0 logged",     ok: false },
      { l: "Next PLR seed",    v: "Pending",       ok: false },
    ],
    agentFn: () => "Run the Hindsight report to compare actuals vs plan and flag underperformers for the next PLR.",
    actions: [
      { l: "Hindsight Report", mod: "hindsight" },
      { l: "Feedback Loop",    mod: null        },
    ],
  },
];

/* ─── Stage status computation ────────────────────────────────────────────── */
function computeStageStatuses(plan, pipeOverrides) {
  const ov = pipeOverrides[plan.id] || {};
  const statuses = [];
  STAGES.forEach((stage, idx) => {
    const prevDone = idx === 0 ? true : statuses[idx - 1] === "done";
    if (ov[stage.key] === true)  { statuses.push("done");   return; }
    if (ov[stage.key] === false) { statuses.push(prevDone ? "active" : "locked"); return; }
    if (stage.doneFn(plan))      { statuses.push("done");   return; }
    if (!prevDone)               { statuses.push("locked"); return; }
    statuses.push("active");
  });
  return statuses;
}

/* ─── PLR helpers ─────────────────────────────────────────────────────────── */
function getVersions(calId, plans) {
  return plans.filter((p) => p.plrCalId === calId);
}
function plrComputeStatus(calId, plans) {
  const vers = getVersions(calId, plans);
  if (!vers.length) return "not-started";
  if (vers.some((v) => v.status === "approved"))    return "approved";
  if (vers.some((v) => v.status === "review"))      return "review";
  if (vers.some((v) => v.status === "in-progress")) return "in-progress";
  return "draft";
}
function plrDaysUntil(presDate) {
  return Math.round((new Date(presDate) - new Date("2026-06-19")) / 86400000);
}

const STATUS_CFG = {
  "not-started": { label: "Not started",  color: "neutral" },
  draft:         { label: "Draft",        color: "neutral" },
  "in-progress": { label: "In progress",  color: "info"    },
  review:        { label: "Under review", color: "warning" },
  approved:      { label: "Approved",     color: "success" },
  closed:        { label: "Closed",       color: "neutral" },
};
const STAGE_BADGE = {
  done:    { color: "success", label: "Complete"    },
  active:  { color: "info",    label: "In progress" },
  blocked: { color: "error",   label: "Blocked"     },
  locked:  { color: "neutral", label: "Locked"      },
};

/* ─── Stage Card ──────────────────────────────────────────────────────────── */
function StageCard({
  stage, plan, st, isExpanded, onToggle,
  onNavigate, onMarkDone, onReopen, onPublish,
  onRerun, isRerunning,
  s1SubStep, onS1SubStep, onOptionRec,
}) {
  const isDone    = st === "done";
  const isBlocked = st === "blocked";
  const isLocked  = st === "locked";
  const isActive  = st === "active";
  const badge     = STAGE_BADGE[st] || STAGE_BADGE.locked;
  const metrics   = stage.metrics(plan, st);
  const agentText = stage.agentFn(st, plan);

  const actSx = {
    fontSize: "var(--fs-xs)",
    background: isDone    ? "var(--color-success-soft)"
               : isActive  ? "var(--color-primary-soft)"
               : isBlocked ? "#fef2f2"
               : "var(--color-surface-alt)",
    border: `1px solid ${isDone    ? "var(--color-success-border, #86efac)"
                        : isActive  ? "var(--color-primary-border, #93c5fd)"
                        : isBlocked ? "#fca5a5"
                        : "var(--color-border)"}`,
    color: isDone    ? "var(--color-success)"
          : isActive  ? "var(--color-primary)"
          : isBlocked ? "var(--color-error)"
          : "var(--color-text-muted)",
    opacity: isLocked ? 0.5 : 1,
  };

  const isSetup = stage.key === "setup";

  return (
    <div className={`plr-stage-card plr-stage-card--${st}`}>
      {/* Clickable header */}
      <div
        className={`plr-stage-header plr-stage-header--${st}`}
        onClick={onToggle}
        role="button" tabIndex={0}
        onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && onToggle()}
        aria-expanded={isExpanded}
      >
        <div className="plr-stage-num">
          {isDone
            ? <CheckCircle2 size={11} strokeWidth={2.5} style={{ color: "#6ee7b7" }} />
            : <span>{stage.num}</span>}
        </div>
        <div className="plr-stage-hd-body">
          <span className="plr-stage-label">{stage.label}</span>
          <span className="plr-stage-sub">{stage.sub}</span>
        </div>
        <Badge variant="subtle" color={badge.color} label={badge.label} size="small" />
        {isExpanded
          ? <ChevronUp   size={13} style={{ color: "rgba(255,255,255,.4)", flexShrink: 0 }} />
          : <ChevronDown size={13} style={{ color: "rgba(255,255,255,.4)", flexShrink: 0 }} />}
      </div>

      {/* Expanded body */}
      {isExpanded && (
        <div className="plr-stage-body">
          {/* ── Stage 1 sub-tabs ─────────────────────────────────────────── */}
          {isSetup && (
            <div className="plr-s1-tabs">
              <button
                type="button"
                className={`plr-s1-tab${s1SubStep === "hindsight" ? " plr-s1-tab--active" : ""}`}
                onClick={() => onS1SubStep("hindsight")}
              >
                Hindsight Review
              </button>
              <button
                type="button"
                className={`plr-s1-tab${s1SubStep === "options" ? " plr-s1-tab--active" : ""}`}
                onClick={() => onS1SubStep("options")}
              >
                <Sparkles size={11} style={{ marginRight: 4 }} />
                Option Planning
              </button>
            </div>
          )}

          {/* ── Options sub-step (setup only) ─────────────────────────── */}
          {isSetup && s1SubStep === "options" ? (
            <div className="plr-option-panel">
              {plan.optionCalc ? (
                <>
                  {/* Result header */}
                  <div className="plr-option-result-hd">
                    <div>
                      <div className="plr-option-total">{plan.optionCalc.total}</div>
                      <div className="plr-option-total-lbl">Recommended options</div>
                    </div>
                    <button
                      type="button"
                      className="plr-option-rerun-btn"
                      onClick={onOptionRec}
                    >
                      <RefreshCw size={11} style={{ marginRight: 5 }} />
                      Recalculate
                    </button>
                  </div>

                  {/* Formula */}
                  <div className="plr-option-formula">
                    {plan.optionCalc.formula}
                  </div>

                  {/* Tier split */}
                  <div className="plr-option-tiers">
                    <div className="plr-option-tier">
                      <div className="plr-option-tier-val">{plan.optionCalc.national}</div>
                      <div className="plr-option-tier-lbl">National</div>
                    </div>
                    <div className="plr-option-tier">
                      <div className="plr-option-tier-val">{plan.optionCalc.regional}</div>
                      <div className="plr-option-tier-lbl">Regional</div>
                    </div>
                    <div className="plr-option-tier">
                      <div className="plr-option-tier-val">{plan.optionCalc.store}</div>
                      <div className="plr-option-tier-lbl">Store</div>
                    </div>
                  </div>

                  {/* Per-cluster table */}
                  {plan.optionCalc.clusterBreakdown?.length > 0 && (
                    <div className="plr-cluster-table">
                      <div className="plr-cluster-table-head">
                        <span>Cluster</span>
                        <span>Stores</span>
                        <span>Options</span>
                      </div>
                      {plan.optionCalc.clusterBreakdown.map((row) => (
                        <div key={row.id} className="plr-cluster-table-row">
                          <span>{row.label}</span>
                          <span>{row.stores}</span>
                          <span className="plr-cluster-opts">{row.options}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              ) : (
                <div className="plr-option-empty">
                  <Sparkles size={22} style={{ color: "var(--color-primary)", opacity: 0.7 }} />
                  <Text variant="body-strong" tone="muted">Option count not yet calculated</Text>
                  <Text variant="caption" tone="subtle">Run the agent to determine the recommended option count based on assortment period and cluster scenario.</Text>
                  <button type="button" className="plr-option-run-btn" onClick={onOptionRec}>
                    <Sparkles size={12} style={{ marginRight: 6 }} />
                    Run option recommendation
                  </button>
                </div>
              )}
            </div>
          ) : (
            /* ── Default stage body (agent + metrics + actions) ─────────── */
            <>
              {/* Agent narration */}
              <div className={`plr-agent-narr plr-agent-narr--${st}`}>
                <Bot size={13} className={`plr-bot plr-bot--${st}`} />
                <Text variant="caption" style={{ lineHeight: 1.6, flex: 1 }}>{agentText}</Text>
                {!isLocked && (
                  <button
                    type="button"
                    className={`plr-rerun-btn${isRerunning ? " plr-rerun-btn--loading" : ""}`}
                    onClick={isRerunning ? undefined : onRerun}
                    title="Re-run agent for this stage"
                  >
                    <RefreshCw size={10} style={{ marginRight: 4, animation: isRerunning ? "plrSpin 0.8s linear infinite" : "none" }} />
                    {isRerunning ? "Running…" : "Re-run"}
                  </button>
                )}
              </div>

              {/* 4-col metric tiles */}
              <div className="plr-metric-grid">
                {metrics.map((m) => (
                  <div key={m.l} className="plr-metric-tile">
                    <div className="plr-metric-lbl">{m.l}</div>
                    <div className={`plr-metric-val${m.ok ? "" : " plr-metric-val--bad"}`}>{m.v}</div>
                  </div>
                ))}
              </div>

              {/* Actions row */}
              <div className="plr-stage-actions">
                {stage.actions.map((act) => {
                  const canClick = !isLocked && (act.mod || act.onClick);
                  return (
                    <Button
                      key={act.l}
                      variant="ghost"
                      size="small"
                      disabled={!canClick}
                      sx={actSx}
                      onClick={
                        canClick
                          ? act.onClick === "publish" ? onPublish
                            : act.onClick === "oracle"  ? () => {}
                            : () => onNavigate?.(act.mod)
                          : undefined
                      }
                    >
                      {act.l}
                    </Button>
                  );
                })}
                {!isLocked && (
                  isDone ? (
                    <Button
                      variant="ghost" size="small" onClick={onReopen}
                      sx={{ marginLeft: "auto", fontSize: "var(--fs-xs)", color: "var(--color-text-muted)", border: "1px solid var(--color-border)", background: "transparent" }}
                    >
                      ↩ Reopen
                    </Button>
                  ) : (isActive || isBlocked) && (
                    <Button
                      variant="primary" size="small" onClick={onMarkDone}
                      sx={{ marginLeft: "auto", fontSize: "var(--fs-xs)" }}
                    >
                      <CheckCheck size={12} style={{ marginRight: 4 }} />
                      Mark complete
                    </Button>
                  )
                )}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}

/* ─── PLR List ────────────────────────────────────────────────────────────── */
function PLRList({ plans, localPlrCal, onSelectPlr, onCreatePlr }) {
  const openCount = localPlrCal.filter((p) => p.status === "Open").length;

  return (
    <div className="plr-list-outer">
      <div className="plr-list-header">
        <Stack direction="column" gap={0.5}>
          <Text variant="title" style={{ fontWeight: 800, color: "#fff" }}>Product Line Reviews</Text>
          <Text variant="caption" style={{ color: "rgba(255,255,255,.5)" }}>
            {openCount} open PLRs · Select one to begin or continue curation
          </Text>
        </Stack>
        <Button variant="primary" size="small" onClick={onCreatePlr}>
          <Plus size={13} style={{ marginRight: 5 }} /> Create new PLR
        </Button>
      </div>

      <div className="plr-list-body">
        {localPlrCal.map((plr) => {
          const versions  = getVersions(plr.id, plans);
          const st        = plr.status === "Closed" ? "closed" : plrComputeStatus(plr.id, plans);
          const cfg       = STATUS_CFG[st] || STATUS_CFG["not-started"];
          const isClosed  = plr.status === "Closed";
          const days      = plrDaysUntil(plr.presDate);
          const overdue   = !isClosed && days < 0;
          const urgent    = !isClosed && days >= 0 && days <= 14;
          const deptColor = DEPT_STRIPE[plr.dept] || "var(--color-border)";

          return (
            <div
              key={plr.id}
              className={`plr-list-row${isClosed ? " plr-list-row--closed" : ""}`}
              onClick={isClosed ? undefined : () => onSelectPlr(plr.id)}
              role={isClosed ? undefined : "button"}
              tabIndex={isClosed ? undefined : 0}
              onKeyDown={isClosed ? undefined : (e) => e.key === "Enter" && onSelectPlr(plr.id)}
            >
              <div className="plr-dept-stripe" style={{ background: deptColor, opacity: isClosed ? 0.3 : 1 }} />
              <div className="plr-list-main">
                <Text
                  variant="body-strong"
                  style={{
                    color: isClosed ? "var(--color-text-muted)" : "var(--color-text-strong)",
                    textTransform: "uppercase", letterSpacing: ".3px", lineHeight: 1.3,
                  }}
                >
                  {plr.name}
                </Text>
                <Stack direction="row" gap={2} align="center" style={{ marginTop: 3 }}>
                  <Text variant="caption" tone="muted">{plr.dept}</Text>
                  {!isClosed && (
                    <>
                      <span className="plr-bullet">·</span>
                      <Text variant="caption" tone="muted">Pres: {plr.presDate}</Text>
                    </>
                  )}
                </Stack>
              </div>

              {versions.length > 0 && (
                <div className="plr-list-stat">
                  <Text variant="body-strong" tone="strong">{versions.length}</Text>
                  <Text variant="micro" tone="muted">version{versions.length > 1 ? "s" : ""}</Text>
                </div>
              )}

              {!isClosed && (
                <div className="plr-list-stat">
                  {overdue ? (
                    <>
                      <Text variant="caption" style={{ fontWeight: 700, color: "var(--color-error)" }}>Overdue</Text>
                      <Text variant="micro"   style={{ color: "var(--color-error)" }}>{Math.abs(days)}d ago</Text>
                    </>
                  ) : (
                    <>
                      <Text variant="body-strong" style={{ color: urgent ? "var(--color-warning)" : "var(--color-text-strong)" }}>{days}</Text>
                      <Text variant="micro" tone="muted">days left</Text>
                    </>
                  )}
                </div>
              )}

              <Badge variant="subtle" color={cfg.color} label={cfg.label} />
              {!isClosed && <ChevronRight size={15} style={{ color: "var(--color-text-muted)", flexShrink: 0 }} />}
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ─── PLR Detail ──────────────────────────────────────────────────────────── */
/* ─── Agent simulation log line builder ───────────────────────────────────── */
function buildSimLogLines(plan) {
  if (!plan) return [];
  const ts = new Date().toLocaleTimeString("en-US", { hour12: false, hour: "2-digit", minute: "2-digit", second: "2-digit" });
  const sc  = plan.clustScenario || "B";
  const calc = plan.optionCalc;
  const lines = [
    { t: ts, text: `PLR scope submitted — ${plan.dept} · ${plan.season}`, type: "info" },
    { t: ts, text: `Assortment period: ${plan.assortPeriodId || "auto-detected"}`, type: "info" },
    { t: ts, text: `Cluster scenario: ${sc}`, type: "info" },
    { t: ts, text: "Stage 1 ▶ Calculating option count recommendation", type: "active" },
  ];
  if (calc) {
    lines.push({ t: ts, text: `Sales U: ${calc.salesUPeriod?.toLocaleString() || "—"} sqft over ${calc.weeks || 26} weeks`, type: "info" });
    lines.push({ t: ts, text: `ROS: ${calc.ros || "—"} sqft/SKU/wk/store across ${calc.positions || "—"} positions`, type: "info" });
    lines.push({ t: ts, text: `Recommended: ${calc.total} total options → National ${calc.national} · Cluster ${calc.regional} · Store ${calc.store}`, type: "success" });
    (calc.clusterBreakdown || []).slice(0, 4).forEach((row) => {
      lines.push({ t: ts, text: `  ${row.id} (${row.stores} stores): ${row.options} options · ROS ${(calc.ros * 2 / (row.stores || 1)).toFixed(2)}`, type: "sub" });
    });
  }
  lines.push({ t: ts, text: "Agent pipeline complete — review stages below", type: "done" });
  return lines;
}

function PLRDetail({
  plrId, plans, localPlrCal, pipeOverrides,
  onBack, onNavigate, onMarkDone, onReopen, onNewVersion, onPublish, onOptionRec,
  showSimLog, onDismissSimLog,
}) {
  const plrRow    = localPlrCal.find((p) => p.id === plrId);
  const versions  = getVersions(plrId, plans);
  const [versionId,     setVersionId]     = useState(() => versions[0]?.id ?? null);
  const [expandedStage, setExpandedStage] = useState(-99);
  const [s1SubStep,     setS1SubStep]     = useState("hindsight");
  const [rerunning,     setRerunning]     = useState({});

  const activeVersion = (versionId ? versions.find((v) => v.id === versionId) : null) || versions[0] || null;

  const stageStatuses = useMemo(
    () => activeVersion ? computeStageStatuses(activeVersion, pipeOverrides) : STAGES.map(() => "locked"),
    [activeVersion, pipeOverrides],
  );

  const effectiveExpanded = expandedStage === -99
    ? (() => {
        const idx = stageStatuses.findIndex((s) => s === "active" || s === "blocked");
        return idx >= 0 ? idx + 1 : 1;
      })()
    : expandedStage;

  const doneCount = stageStatuses.filter((s) => s === "done").length;
  const pct       = Math.round((doneCount / STAGES.length) * 100);

  const handleRerun = useCallback((stageKey) => {
    setRerunning((prev) => ({ ...prev, [stageKey]: true }));
    setTimeout(() => setRerunning((prev) => ({ ...prev, [stageKey]: false })), 1600);
  }, []);

  const handleOptionRec = useCallback(() => {
    if (!activeVersion) return;
    const periodId = activeVersion.assortPeriodId
      || ASSORT_PERIODS.find((p) => p.dept === activeVersion.dept)?.id;
    const calc = plrCalcOptionCount(
      activeVersion.dept,
      periodId,
      activeVersion.clustScenario || "B",
      FD_CLUST_SCENARIOS,
    );
    if (calc) onOptionRec(activeVersion.id, calc);
  }, [activeVersion, onOptionRec]);

  if (!plrRow) return null;

  return (
    <div className="plr-detail-outer">
      {/* Dark header */}
      <div className="plr-detail-hd">
        <div className="plr-detail-hd-top">
          <Button
            variant="ghost" size="small" onClick={onBack}
            sx={{ color: "rgba(255,255,255,.7)", fontSize: "var(--fs-xs)", gap: "var(--sp-1)", flexShrink: 0 }}
          >
            <ArrowLeft size={12} style={{ marginRight: 3 }} /> All PLRs
          </Button>

          <div className="plr-detail-hd-info">
            <Text variant="heading" style={{ color: "#fff", fontWeight: 700 }}>{plrRow.name}</Text>
            <Text variant="micro"   style={{ color: "rgba(255,255,255,.45)", marginTop: 2 }}>
              {plrRow.dept} · Pres: {plrRow.presDate} · Due: {plrRow.dueDate}
            </Text>
          </div>

          {/* Version tabs */}
          <div className="plr-version-area">
            {versions.map((v) => {
              const on   = activeVersion?.id === v.id;
              const vCfg = STATUS_CFG[v.status] || STATUS_CFG.draft;
              return (
                <div
                  key={v.id}
                  className={`plr-ver-tab${on ? " plr-ver-tab--on" : ""}`}
                  onClick={() => { setVersionId(v.id); setExpandedStage(-99); }}
                  role="button" tabIndex={0}
                >
                  <span className="plr-ver-name">
                    {v.name.includes("—") ? v.name.split("—").pop().trim() : v.name}
                  </span>
                  <Badge variant="subtle" color={vCfg.color} label={vCfg.label} size="small" />
                </div>
              );
            })}
            <Button
              variant="ghost" size="small"
              onClick={() => onNewVersion(plrId)}
              sx={{
                fontSize: "var(--fs-micro)",
                padding: "var(--sp-1) var(--sp-3)",
                background: "rgba(30,90,200,.18)",
                border: "1px solid rgba(93,160,255,.3)",
                color: "rgba(147,197,253,.9)",
              }}
            >
              + Version
            </Button>
          </div>
        </div>

        {/* Progress bar */}
        <div className="plr-detail-prog-row">
          <Text variant="micro" style={{ color: "rgba(255,255,255,.4)", textTransform: "uppercase", letterSpacing: ".5px", fontWeight: 700, whiteSpace: "nowrap" }}>
            Stage {doneCount} of {STAGES.length}
          </Text>
          <div className="plr-prog-track">
            <div className="plr-prog-fill" style={{ width: `${pct}%` }} />
          </div>
        </div>
      </div>

      {/* ── Agent pipeline log (shown after creation) ─────────────────────── */}
      {showSimLog && activeVersion && (
        <div className="plr-sim-log">
          <div className="plr-sim-log-hd">
            <Bot size={13} style={{ color: "#6ee7b7", flexShrink: 0 }} />
            <span className="plr-sim-log-title">Agent pipeline log</span>
            <button type="button" className="plr-sim-log-dismiss" onClick={onDismissSimLog}>
              × Dismiss
            </button>
          </div>
          <div className="plr-sim-log-body">
            {buildSimLogLines(activeVersion).map((line, i) => (
              <div key={i} className={`plr-sim-line plr-sim-line--${line.type}`}>
                <span className="plr-sim-ts">[{line.t}]</span>
                <span className="plr-sim-text">{line.text}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Stage accordion list */}
      {activeVersion ? (
        <div className="plr-stage-list">
          {STAGES.map((stage, idx) => (
            <StageCard
              key={stage.key}
              stage={stage}
              plan={activeVersion}
              st={stageStatuses[idx]}
              isExpanded={effectiveExpanded === stage.num}
              onToggle={() => setExpandedStage(effectiveExpanded === stage.num ? -1 : stage.num)}
              onNavigate={onNavigate}
              onMarkDone={() => onMarkDone(activeVersion.id, stage.key)}
              onReopen={()   => onReopen(activeVersion.id, stage.key)}
              onPublish={()  => onPublish(activeVersion.id)}
              onRerun={() => handleRerun(stage.key)}
              isRerunning={!!rerunning[stage.key]}
              s1SubStep={s1SubStep}
              onS1SubStep={setS1SubStep}
              onOptionRec={handleOptionRec}
            />
          ))}
        </div>
      ) : (
        <div className="plr-empty-ver">
          <Stack direction="column" gap={3} align="center">
            <Text variant="body-strong" tone="muted">No plan versions yet</Text>
            <Button variant="primary" size="small" onClick={() => onNewVersion(plrId)}>
              + Start plan
            </Button>
          </Stack>
        </div>
      )}
    </div>
  );
}

/* ─── Main export — PLR Status ────────────────────────────────────────────── */
export default function Approval({ onNavigate }) {
  const [view,          setView]          = useState("list");
  const [activePlrId,   setActivePlrId]   = useState(null);
  const [localPlans,    setLocalPlans]    = useState(PLANS);
  const [localPlrCal,   setLocalPlrCal]   = useState(FD_PLR_CALENDAR);
  const [pipeOverrides, setPipeOverrides] = useState({});
  const [showSimLog,    setShowSimLog]    = useState(false);   // show agent log after creation
  const [createWiz,     setCreateWiz]     = useState({
    step: 1, dept: null, assortPeriodId: null, clustScenario: null, optionCalc: null,
  });

  const handleSelectPlr = useCallback((id) => { setActivePlrId(id); setView("detail"); }, []);
  const handleCreatePlr = useCallback(() => {
    setCreateWiz({ step: 1, dept: null, assortPeriodId: null, clustScenario: null, optionCalc: null });
    setView("create");
  }, []);
  const handleBack = useCallback(() => { setView("list"); setActivePlrId(null); }, []);

  const handleMarkDone = useCallback((planId, key) =>
    setPipeOverrides((prev) => ({ ...prev, [planId]: { ...(prev[planId] || {}), [key]: true  } })), []);
  const handleReopen   = useCallback((planId, key) =>
    setPipeOverrides((prev) => ({ ...prev, [planId]: { ...(prev[planId] || {}), [key]: false } })), []);

  const handleOptionRec = useCallback((planId, calc) => {
    setLocalPlans((prev) => prev.map((p) =>
      p.id === planId ? { ...p, optionCalc: calc } : p
    ));
  }, []);

  const handleNewVersion = useCallback((calId) => {
    const plrRow   = localPlrCal.find((p) => p.id === calId);
    if (!plrRow) return;
    const existing = localPlans.filter((p) => p.plrCalId === calId);
    const newId    = `p-new-${Date.now()}`;
    setLocalPlans((prev) => [...prev, {
      id: newId, plrCalId: calId,
      name: `${plrRow.dept} ${plrRow.presDate} — V${existing.length + 1}`,
      dept: plrRow.dept, season: "SS 2026", status: "draft", mode: "gated",
      confidenceThreshold: 75, activeStage: "setup", stagesCompleted: [],
      clustIds: ["B1", "B2", "B3", "B4"],
      kpis: { stores: 70, skus: 18, coreCount: 6, submittedPct: 0 },
      notes: "", createdBy: "You",
      createdAt: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
      updatedAt: "just now",
    }]);
    setActivePlrId(calId);
    setView("detail");
  }, [localPlans, localPlrCal]);

  const handlePublish = useCallback((planId) => {
    setLocalPlans((prev) => prev.map((p) =>
      p.id === planId
        ? { ...p, status: "approved", stagesCompleted: [...new Set([...(p.stagesCompleted || []), "approval"])] }
        : p
    ));
    setPipeOverrides((prev) => ({ ...prev, [planId]: { ...(prev[planId] || {}), approval: true } }));
  }, []);

  /* Wizard: run option calc in step 3 */
  const handleWizOptionRec = useCallback(() => {
    if (!createWiz.dept || !createWiz.assortPeriodId) return;
    const calc = plrCalcOptionCount(
      createWiz.dept,
      createWiz.assortPeriodId,
      createWiz.clustScenario || "B",
      FD_CLUST_SCENARIOS,
    );
    if (calc) setCreateWiz((prev) => ({ ...prev, optionCalc: calc }));
  }, [createWiz]);

  /* Wizard: final confirm — create new PLR calendar entry + first plan version */
  const handleCreateConfirm = useCallback(() => {
    const period = ASSORT_PERIODS.find((p) => p.id === createWiz.assortPeriodId);
    if (!period || !createWiz.dept) return;
    const newId     = Math.max(...localPlrCal.map((p) => p.id), 1000) + 1;
    const newCalEntry = {
      id: newId,
      name: `${createWiz.dept.toUpperCase()} ${period.season}`,
      dept: createWiz.dept,
      season: period.season,
      presDate: period.presDate,
      dueDate:  period.dueDate,
      status: "Open",
      versions: 0,
    };
    setLocalPlrCal((prev) => [newCalEntry, ...prev]);
    const planId = `p-new-${Date.now()}`;
    setLocalPlans((prev) => [...prev, {
      id: planId, plrCalId: newId,
      name: `${createWiz.dept} ${period.season} — V1`,
      dept: createWiz.dept, season: period.season,
      status: "draft", mode: "gated", confidenceThreshold: 75,
      activeStage: "setup", stagesCompleted: [],
      clustIds: Object.values(FD_CLUST_SCENARIOS[createWiz.clustScenario || "B"]?.clusters || []).map((c) => c.id),
      clustScenario: createWiz.clustScenario || "B",
      assortPeriodId: createWiz.assortPeriodId,
      optionCalc: createWiz.optionCalc,
      kpis: {
        stores: 21,
        skus: createWiz.optionCalc?.total || 20,
        coreCount: Math.round((createWiz.optionCalc?.national || 8)),
        submittedPct: 0,
      },
      notes: "", createdBy: "You",
      createdAt: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
      updatedAt: "just now",
    }]);
    setActivePlrId(newId);
    setView("detail");
    setShowSimLog(true);
    setCreateWiz({ step: 1, dept: null, assortPeriodId: null, clustScenario: null, optionCalc: null });
  }, [createWiz, localPlrCal]);

  /* ── Create screen — 3-step wizard ─────────────────────────────────────── */
  if (view === "create") {
    const step       = createWiz.step;
    const STEP_LABELS = ["Department", "Assortment Period", "Cluster Scenario"];
    const deptPeriods = ASSORT_PERIODS.filter((p) => p.dept === createWiz.dept);

    return (
      <div className="plr-list-outer">
        {/* Dark header */}
        <div className="plr-list-header">
          <Stack direction="row" align="center" gap={3}>
            <Button variant="ghost" size="small" onClick={handleBack}
              sx={{ color: "rgba(255,255,255,.75)", fontSize: "var(--fs-xs)" }}>
              <ArrowLeft size={12} style={{ marginRight: 3 }} /> Back
            </Button>
            <Text variant="heading" style={{ color: "#fff", fontWeight: 700 }}>Create new PLR</Text>
          </Stack>
        </div>

        {/* Step indicator */}
        <div className="plr-wizard-steps">
          {STEP_LABELS.map((lbl, i) => {
            const n   = i + 1;
            const isDone   = n < step;
            const isActive = n === step;
            return (
              <React.Fragment key={n}>
                <div className={`plr-wizard-step${isDone ? " plr-wizard-step--done" : isActive ? " plr-wizard-step--active" : " plr-wizard-step--pending"}`}>
                  <div className="plr-wizard-step-num">
                    {isDone ? <CheckCircle2 size={13} /> : n}
                  </div>
                  <span className="plr-wizard-step-lbl">{lbl}</span>
                </div>
                {i < STEP_LABELS.length - 1 && <div className={`plr-wizard-connector${isDone ? " plr-wizard-connector--done" : ""}`} />}
              </React.Fragment>
            );
          })}
        </div>

        <div className="plr-wizard-body">
          {/* ── Step 1: Department ───────────────────────────────────────── */}
          {step === 1 && (
            <>
              <Text variant="caption" tone="muted" style={{ marginBottom: "var(--sp-4)", display: "block" }}>
                Select the department for this PLR cycle
              </Text>
              <div className="plr-dept-grid">
                {DEPT_META.map(({ name, Icon: DIcon, color }) => (
                  <button
                    key={name}
                    type="button"
                    className={`plr-dept-card${createWiz.dept === name ? " plr-dept-card--selected" : ""}`}
                    onClick={() => setCreateWiz((prev) => ({ ...prev, dept: name, step: 2 }))}
                  >
                    <div className="plr-dept-card-icon" style={{ background: color + "22", color }}>
                      <DIcon size={20} />
                    </div>
                    <span className="plr-dept-card-name">{name}</span>
                  </button>
                ))}
              </div>
            </>
          )}

          {/* ── Step 2: Assortment Period ─────────────────────────────────── */}
          {step === 2 && (
            <>
              <Stack direction="row" align="center" justify="space-between" style={{ marginBottom: "var(--sp-4)" }}>
                <Text variant="caption" tone="muted">
                  Select the assortment period for <strong>{createWiz.dept}</strong>
                </Text>
                <button type="button" className="plr-back-step" onClick={() => setCreateWiz((prev) => ({ ...prev, step: 1 }))}>
                  ← Change dept
                </button>
              </Stack>
              {deptPeriods.length === 0 ? (
                <div className="plr-period-empty">
                  <Text variant="body-strong" tone="muted">No assortment periods defined for {createWiz.dept}</Text>
                  <button type="button" className="plr-option-run-btn" style={{ marginTop: "var(--sp-3)" }}
                    onClick={() => onNavigate?.("assort-periods")}>
                    Define Assort Period →
                  </button>
                </div>
              ) : (
                <div className="plr-period-list">
                  {deptPeriods.map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      className={`plr-period-row${createWiz.assortPeriodId === p.id ? " plr-period-row--selected" : ""}`}
                      onClick={() => setCreateWiz((prev) => ({ ...prev, assortPeriodId: p.id, step: 3 }))}
                    >
                      <div>
                        <div className="plr-period-season">{p.season}</div>
                        <div className="plr-period-dates">W{p.startWeek?.replace("W", "") || "01"}–W{p.endWeek?.replace("W", "") || "26"} · Pres: {p.presDate}</div>
                      </div>
                      <Badge
                        variant="subtle" size="small"
                        color={p.status === "active" ? "success" : "neutral"}
                        label={p.status === "active" ? "Active" : "Planned"}
                      />
                      <ChevronRight size={14} style={{ color: "var(--color-text-muted)" }} />
                    </button>
                  ))}
                </div>
              )}
            </>
          )}

          {/* ── Step 3: Cluster Scenario + Option Count ─────────────────── */}
          {step === 3 && (
            <>
              <Stack direction="row" align="center" justify="space-between" style={{ marginBottom: "var(--sp-4)" }}>
                <Text variant="caption" tone="muted">
                  Select cluster scenario · then run option recommendation
                </Text>
                <button type="button" className="plr-back-step" onClick={() => setCreateWiz((prev) => ({ ...prev, step: 2 }))}>
                  ← Change period
                </button>
              </Stack>

              {/* Cluster scenario cards */}
              <div className="plr-clust-grid">
                {Object.values(FD_CLUST_SCENARIOS).map((sc) => (
                  <button
                    key={sc.id}
                    type="button"
                    className={`plr-clust-card${createWiz.clustScenario === sc.id ? " plr-clust-card--selected" : ""}`}
                    onClick={() => setCreateWiz((prev) => ({ ...prev, clustScenario: sc.id, optionCalc: null }))}
                  >
                    <div className="plr-clust-card-top">
                      <span className="plr-clust-id">{sc.id}</span>
                      {sc.badge === "Recommended" && <Badge variant="subtle" size="small" color="success" label="★ Recommended" />}
                    </div>
                    <div className="plr-clust-name">{sc.name.replace(`Scenario ${sc.id} — `, "")}</div>
                    <div className="plr-clust-meta">{sc.clusters.length} clusters · score {sc.composite}</div>
                  </button>
                ))}
              </div>

              {/* Option recommendation panel */}
              {createWiz.clustScenario && (
                <div className="plr-option-panel" style={{ marginTop: "var(--sp-4)" }}>
                  {createWiz.optionCalc ? (
                    <>
                      <div className="plr-option-result-hd">
                        <div>
                          <div className="plr-option-total">{createWiz.optionCalc.total}</div>
                          <div className="plr-option-total-lbl">Recommended options</div>
                        </div>
                        <button type="button" className="plr-option-rerun-btn" onClick={handleWizOptionRec}>
                          <RefreshCw size={11} style={{ marginRight: 5 }} />Recalculate
                        </button>
                      </div>
                      <div className="plr-option-formula">{createWiz.optionCalc.formula}</div>
                      <div className="plr-option-tiers">
                        {[
                          { v: createWiz.optionCalc.national, l: "National" },
                          { v: createWiz.optionCalc.regional, l: "Regional" },
                          { v: createWiz.optionCalc.store,    l: "Store"    },
                        ].map((t) => (
                          <div key={t.l} className="plr-option-tier">
                            <div className="plr-option-tier-val">{t.v}</div>
                            <div className="plr-option-tier-lbl">{t.l}</div>
                          </div>
                        ))}
                      </div>
                    </>
                  ) : (
                    <div className="plr-option-empty">
                      <Sparkles size={18} style={{ color: "var(--color-primary)", opacity: 0.7 }} />
                      <Text variant="caption" tone="muted">Run the agent to calculate recommended option count</Text>
                      <button type="button" className="plr-option-run-btn" onClick={handleWizOptionRec}>
                        <Sparkles size={12} style={{ marginRight: 6 }} />
                        Run option recommendation
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Confirm button */}
              <div style={{ marginTop: "var(--sp-5)", display: "flex", justifyContent: "flex-end", gap: "var(--sp-3)" }}>
                <Button variant="secondary" size="medium" onClick={handleBack}>Cancel</Button>
                <Button
                  variant="primary" size="medium"
                  disabled={!createWiz.clustScenario}
                  onClick={handleCreateConfirm}
                >
                  <CheckCheck size={13} style={{ marginRight: 6 }} />
                  Create PLR
                </Button>
              </div>
            </>
          )}
        </div>
      </div>
    );
  }

  /* ── Detail screen ── */
  if (view === "detail") {
    return (
      <PLRDetail
        plrId={activePlrId}
        plans={localPlans}
        localPlrCal={localPlrCal}
        pipeOverrides={pipeOverrides}
        onBack={() => { setShowSimLog(false); handleBack(); }}
        onNavigate={onNavigate}
        onMarkDone={handleMarkDone}
        onReopen={handleReopen}
        onNewVersion={handleNewVersion}
        onPublish={handlePublish}
        onOptionRec={handleOptionRec}
        showSimLog={showSimLog}
        onDismissSimLog={() => setShowSimLog(false)}
      />
    );
  }

  /* ── List screen (default) ── */
  return (
    <PLRList
      plans={localPlans}
      localPlrCal={localPlrCal}
      onSelectPlr={handleSelectPlr}
      onCreatePlr={handleCreatePlr}
    />
  );
}
