import React, { useState, useCallback, useMemo } from "react";
import { Card, Badge, Button } from "impact-ui";
import {
  Cog, Package, Layers, TrendingDown, Send, Eye,
  ChevronDown, ChevronUp, ChevronRight, ArrowLeft,
  CheckCircle2, Bot, Plus,
} from "lucide-react";
import Text from "../components/Text.jsx";
import Stack from "../components/Stack.jsx";
import { PLANS } from "../data/workspace.js";
import { FD_PLR_CALENDAR } from "../data/plr.js";
import { panelSx } from "../styles/panelSx.js";
import "./Approval.css";

/* ─── Stage definitions ───────────────────────────────────────────────────── */
const STAGES = [
  {
    key: "setup", num: 1,
    label: "Plan Setup & Intelligence",
    sub: "Define scope · cluster stores · ingest signals",
    Icon: Cog,
    doneFn: (p) => p.stagesCompleted.length >= 1 || p.status !== "draft",
    metrics: () => [
      { l: "Assort period",    v: "Defined",        ok: true },
      { l: "Cluster scenario", v: "B — Behavioral", ok: true },
      { l: "Intel signals",    v: "4 logged",        ok: true },
      { l: "Applied signals",  v: "2 actioned",      ok: true },
    ],
    agentFn: (st) => st === "done"
      ? "Setup complete. Cluster B accepted, assortment period defined."
      : "Go to Location Clustering to accept a scenario before curation can begin.",
    actions: [
      { l: "PLR Calendar",         mod: "periods"    },
      { l: "Market Intelligence",  mod: "intel"      },
      { l: "Location Clustering",  mod: "clustering" },
    ],
  },
  {
    key: "portfolio", num: 2,
    label: "Portfolio Build & Forecast",
    sub: "New SKUs · like-item assignment · vendor forecasts",
    Icon: Package,
    doneFn: (p) => p.stagesCompleted.includes("forecast"),
    metrics: (p) => [
      { l: "New SKUs",          v: `${p.kpis.skus} in scope`,                                              ok: true },
      { l: "Approved/listed",   v: `${Math.round(p.kpis.skus * 0.7)} SKUs`,                               ok: true },
      { l: "Forecast received", v: `${Math.round(p.kpis.skus * 0.55)} / ${Math.round(p.kpis.skus * 0.7)}`, ok: true },
      { l: "Declined",          v: `${Math.round(p.kpis.skus * 0.1)} SKUs`,                               ok: true },
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
    doneFn: (p) => p.stagesCompleted.includes("curation"),
    metrics: (p) => [
      { l: "National decisions", v: `${p.kpis.coreCount} / ${p.kpis.skus} done`,                          ok: p.stagesCompleted.includes("national")  },
      { l: "Cluster decisions",  v: p.stagesCompleted.includes("regional") ? "All resolved" : "Pending",  ok: p.stagesCompleted.includes("regional")  },
      { l: "National OTB",       v: `$${p.kpis.coreCount * 11}k / $${Math.round(p.kpis.skus * 12)}k`,    ok: true                                    },
      { l: "Keeps",              v: `${p.kpis.coreCount} national`,                                        ok: true                                    },
    ],
    agentFn: (st, p) => st === "done"
      ? "All curation decisions finalised. Range locked for NPI planning."
      : p.stagesCompleted.includes("national")
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
    doneFn: (p) => p.stagesCompleted.includes("mpi"),
    metrics: (p) => [
      { l: "Dropped SKUs",      v: "3 total",                                               ok: true                            },
      { l: "Exit strategy set", v: p.stagesCompleted.includes("mpi") ? "3 / 3" : "0 / 3",  ok: p.stagesCompleted.includes("mpi") },
      { l: "On-hand value",     v: "$45k at risk",                                           ok: true                            },
      { l: "National drops",    v: "3 SKUs",                                                 ok: true                            },
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
    doneFn: (p) => p.stagesCompleted.includes("approval"),
    metrics: (p) => {
      const pub = p.stagesCompleted.includes("approval");
      return [
        { l: "Status",           v: pub ? "Published" : "Pending approval",        ok: pub  },
        { l: "Total SKUs",       v: `${p.kpis.skus} in range`,                     ok: true },
        { l: "Net range change", v: `+${Math.round(p.kpis.skus * 0.15) - 3} SKUs`, ok: true },
        { l: "OTB committed",    v: `$${p.kpis.coreCount * 11}k`,                  ok: true },
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
      { l: "Variance SKUs",    v: "Pending",     ok: false },
      { l: "Feedback signals", v: "0 logged",    ok: false },
      { l: "Next PLR seed",    v: "Pending",     ok: false },
    ],
    agentFn: (st) => st === "done"
      ? "Hindsight complete. Variance signals loaded into Market Intelligence for the next cycle."
      : "Run the Hindsight report to compare actuals vs plan and flag underperformers for the next PLR.",
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
const DEPT_STRIPE = {
  "Tile":                    "var(--color-teal)",
  "Wood":                    "var(--color-wood)",
  "Laminate & Vinyl":        "var(--color-info)",
  "Stone":                   "var(--color-accent)",
  "Decorative Accessories":  "var(--color-warning)",
};

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
function StageCard({ stage, plan, st, isExpanded, onToggle, onNavigate, onMarkDone, onReopen, onPublish }) {
  const isDone    = st === "done";
  const isBlocked = st === "blocked";
  const isLocked  = st === "locked";
  const isActive  = st === "active";
  const badge     = STAGE_BADGE[st];
  const metrics   = stage.metrics(plan, st);
  const agentText = stage.agentFn(st, plan);

  /* Action button colors derived from stage state */
  const actSx = {
    fontSize: "var(--fs-xs)",
    background: isDone   ? "var(--color-success-soft)"
                : isActive ? "var(--color-primary-soft)"
                : isBlocked ? "#fef2f2"
                : "var(--color-surface-alt)",
    border: `1px solid ${isDone   ? "var(--color-success-border, #86efac)"
                        : isActive ? "var(--color-primary-border, #93c5fd)"
                        : isBlocked ? "#fca5a5"
                        : "var(--color-border)"}`,
    color: isDone    ? "var(--color-success)"
          : isActive  ? "var(--color-primary)"
          : isBlocked ? "var(--color-error)"
          : "var(--color-text-muted)",
    opacity: isLocked ? 0.5 : 1,
  };

  return (
    <div className={`plr-stage-card plr-stage-card--${st}`}>
      {/* Clickable header */}
      <div
        className={`plr-stage-header plr-stage-header--${st}`}
        onClick={onToggle}
        role="button"
        tabIndex={0}
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
          {/* Agent narration */}
          <div className={`plr-agent-narr plr-agent-narr--${st}`}>
            <Bot size={13} className={`plr-bot plr-bot--${st}`} />
            <Text variant="caption" style={{ lineHeight: 1.6 }}>{agentText}</Text>
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
              isDone
                ? <Button
                    variant="ghost" size="small"
                    onClick={onReopen}
                    sx={{ marginLeft: "auto", fontSize: "var(--fs-xs)", color: "var(--color-text-muted)", border: "1px solid var(--color-border)", background: "transparent" }}
                  >
                    ↩ Reopen
                  </Button>
                : (isActive || isBlocked) && (
                    <Button
                      variant="primary" size="small"
                      onClick={onMarkDone}
                      sx={{ marginLeft: "auto", fontSize: "var(--fs-xs)" }}
                    >
                      ✓ Mark complete
                    </Button>
                  )
            )}
          </div>
        </div>
      )}
    </div>
  );
}

/* ─── PLR List ────────────────────────────────────────────────────────────── */
function PLRList({ plans, onSelectPlr, onCreatePlr }) {
  const openCount = FD_PLR_CALENDAR.filter((p) => p.status === "Open").length;

  return (
    <div className="plr-list-outer">
      {/* Dark header */}
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

      {/* List rows */}
      <div className="plr-list-body">
        {FD_PLR_CALENDAR.map((plr) => {
          const versions   = getVersions(plr.id, plans);
          const st         = plr.status === "Closed" ? "closed" : plrComputeStatus(plr.id, plans);
          const cfg        = STATUS_CFG[st] || STATUS_CFG["not-started"];
          const isClosed   = plr.status === "Closed";
          const days       = plrDaysUntil(plr.presDate);
          const overdue    = !isClosed && days < 0;
          const urgent     = !isClosed && days >= 0 && days <= 14;
          const deptColor  = DEPT_STRIPE[plr.dept] || "var(--color-border)";

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
                    textTransform: "uppercase",
                    letterSpacing: ".3px",
                    lineHeight: 1.3,
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
function PLRDetail({ plrId, plans, pipeOverrides, onBack, onNavigate, onMarkDone, onReopen, onNewVersion, onPublish }) {
  const plrRow    = FD_PLR_CALENDAR.find((p) => p.id === plrId);
  const versions  = getVersions(plrId, plans);
  const [versionId,     setVersionId]     = useState(() => versions[0]?.id ?? null);
  const [expandedStage, setExpandedStage] = useState(-99); // -99 = auto-detect

  const activeVersion = (versionId ? versions.find((v) => v.id === versionId) : null) || versions[0] || null;

  const stageStatuses = useMemo(
    () => activeVersion ? computeStageStatuses(activeVersion, pipeOverrides) : STAGES.map(() => "locked"),
    [activeVersion, pipeOverrides],
  );

  /* Auto-expand first active/blocked stage; user clicks override to explicit num/-1 */
  const effectiveExpanded = expandedStage === -99
    ? (() => {
        const idx = stageStatuses.findIndex((s) => s === "active" || s === "blocked");
        return idx >= 0 ? idx + 1 : 1;
      })()
    : expandedStage;

  const doneCount = stageStatuses.filter((s) => s === "done").length;
  const pct       = Math.round((doneCount / STAGES.length) * 100);

  if (!plrRow) return null;

  return (
    <div className="plr-detail-outer">
      {/* Dark header */}
      <div className="plr-detail-hd">
        <div className="plr-detail-hd-top">
          <Button
            variant="ghost" size="small"
            onClick={onBack}
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
  const [pipeOverrides, setPipeOverrides] = useState({});

  const handleSelectPlr = useCallback((id) => { setActivePlrId(id); setView("detail"); }, []);
  const handleCreatePlr = useCallback(() => setView("create"), []);
  const handleBack      = useCallback(() => { setView("list"); setActivePlrId(null); }, []);

  const handleMarkDone = useCallback((planId, key) =>
    setPipeOverrides((prev) => ({ ...prev, [planId]: { ...(prev[planId] || {}), [key]: true  } })), []);
  const handleReopen   = useCallback((planId, key) =>
    setPipeOverrides((prev) => ({ ...prev, [planId]: { ...(prev[planId] || {}), [key]: false } })), []);

  const handleNewVersion = useCallback((calId) => {
    const plrRow   = FD_PLR_CALENDAR.find((p) => p.id === calId);
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
  }, [localPlans]);

  const handlePublish = useCallback((planId) => {
    setLocalPlans((prev) => prev.map((p) =>
      p.id === planId
        ? { ...p, status: "approved", stagesCompleted: [...new Set([...p.stagesCompleted, "approval"])] }
        : p
    ));
    setPipeOverrides((prev) => ({ ...prev, [planId]: { ...(prev[planId] || {}), approval: true } }));
  }, []);

  /* ── Create screen ── */
  if (view === "create") {
    const openPlrs = FD_PLR_CALENDAR.filter((p) => p.status === "Open");
    return (
      <div className="plr-list-outer">
        <div className="plr-list-header">
          <Stack direction="row" align="center" gap={3}>
            <Button variant="ghost" size="small" onClick={handleBack}
              sx={{ color: "rgba(255,255,255,.75)", fontSize: "var(--fs-xs)" }}>
              <ArrowLeft size={12} style={{ marginRight: 3 }} /> Back
            </Button>
            <Text variant="heading" style={{ color: "#fff", fontWeight: 700 }}>Create new PLR</Text>
          </Stack>
        </div>
        <div className="plr-list-body">
          <div style={{ padding: "var(--sp-3) var(--sp-6) 0" }}>
            <Text variant="caption" tone="muted">Select a PLR event to begin</Text>
          </div>
          {openPlrs.map((plr) => {
            const existing = localPlans.filter((p) => p.plrCalId === plr.id).length;
            return (
              <div
                key={plr.id}
                className="plr-list-row"
                onClick={() => handleNewVersion(plr.id)}
                role="button" tabIndex={0}
              >
                <div className="plr-dept-stripe" style={{ background: DEPT_STRIPE[plr.dept] || "var(--color-border)" }} />
                <div className="plr-list-main">
                  <Text variant="body-strong" tone="strong" style={{ textTransform: "uppercase", letterSpacing: ".3px" }}>{plr.name}</Text>
                  <Text variant="caption" tone="muted" style={{ display: "block", marginTop: 2 }}>{plr.dept} · Pres: {plr.presDate}</Text>
                </div>
                {existing > 0 && (
                  <Text variant="micro" tone="muted" style={{ flexShrink: 0 }}>{existing} version{existing > 1 ? "s" : ""} exists</Text>
                )}
                <ChevronRight size={14} style={{ color: "var(--color-text-muted)", flexShrink: 0, marginLeft: 8 }} />
              </div>
            );
          })}
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
        pipeOverrides={pipeOverrides}
        onBack={handleBack}
        onNavigate={onNavigate}
        onMarkDone={handleMarkDone}
        onReopen={handleReopen}
        onNewVersion={handleNewVersion}
        onPublish={handlePublish}
      />
    );
  }

  /* ── List screen (default) ── */
  return (
    <PLRList
      plans={localPlans}
      onSelectPlr={handleSelectPlr}
      onCreatePlr={handleCreatePlr}
    />
  );
}
