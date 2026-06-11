import React, { useState, useMemo, useEffect, useRef } from "react";
import { Card, Badge, EmptyState, Button } from "impact-ui";
import Text from "../components/Text.jsx";
import Stack from "../components/Stack.jsx";
import Grid from "../components/Grid.jsx";
import StepIndicator from "../components/StepIndicator.jsx";
import {
  PLANS, PIPE_STAGES, PLAN_STATUS, PLAN_MODE,
  DEPT_OPTIONS, CLUSTERING_SCENARIOS, CONTEXT_CHIPS,
} from "../data/workspace.js";
import {
  CATALOGUE_SKUS, HARD_LOCKED_COUNT, STORE_PICK_COUNT,
  runCatalogueAgent,
} from "../data/catalogue.js";
import { FD_STORES } from "../data/stores.js";
import { FD_CLUST_SCENARIOS } from "../data/clusters.js";
import { FD_ASSORTMENT } from "../data/assortment.js";
import { INTEL_SEED } from "../data/intel.js";
import { setAgentPlan, getAgentPlan, resetAgentPlan } from "../data/agentStore.js";
import { panelSx, softSx } from "../styles/panelSx.js";
import "./Workspace.css";

/* ─── Agent recommendation pipeline ────────────────────────────────────── */
const AGENT_PIPELINE = [
  { id: "scan",    icon: "📂", tone: "primary", title: "Scanning FW 2025 catalogue",
    result: (c) => `${c.total} SKUs · ${c.coreLocked} locked Core/BG · ${c.eligible} eligible to score` },
  { id: "r13",     icon: "📊", tone: "info",    title: "Analyzing R13 sell-through",
    result: (c) => `${c.assortRows.toLocaleString()} store-SKU rows · ${c.storeCount} stores` },
  { id: "carry",   icon: "🧮", tone: "primary", title: "Computing carry rates & avg sqft",
    result: (c) => `Carry % + avg sqft scored for ${c.eligible} SKUs` },
  { id: "core",    icon: "🔒", tone: "success", title: "Selecting National Core",
    result: (c) => `${c.natCount} SKUs promoted to Core` },
  { id: "cluster", icon: "🗂", tone: "teal",    title: "Evaluating behavioral clusters",
    result: (c) => `${c.clCount} cluster adds across ${c.clusterCount} clusters` },
  { id: "intel",   icon: "📡", tone: "accent",  title: "Applying Market Intel signals",
    result: (c) => (c.intelSignals ? `${c.intelSignals} actioned signal(s) folded in` : "No actioned signals — R13 only") },
  { id: "plan",    icon: "🧩", tone: "success", title: "Generating 3-tier assortment plan",
    result: (c) => `Core ${c.natCount} · Cluster ${c.clCount} · Store ${c.storePicks}` },
];

const AGENT_TIERS = [
  { icon: "🔒", tier: "National Core", desc: "SKUs with ≥80% carry + high avg sqft → mandatory all stores", tone: "success" },
  { icon: "🗂", tier: "Cluster Adds",  desc: "SKUs with ≥70% carry within a cluster → mandatory for that cluster", tone: "teal" },
  { icon: "📍", tier: "Store Picks",   desc: "Remaining catalogue SKUs available for individual store selection", tone: "accent" },
];

/* ─── Animated agent run panel ──────────────────────────────────────────── */
function AgentRunPanel({ ctx, onComplete }) {
  const [done, setDone] = useState(0);
  const total = AGENT_PIPELINE.length;
  const cbRef = useRef(onComplete);
  cbRef.current = onComplete;

  useEffect(() => {
    if (done >= total) {
      const t = setTimeout(() => cbRef.current?.(), 760);
      return () => clearTimeout(t);
    }
    const dur = 640 + (done % 3) * 200;
    const t = setTimeout(() => setDone((d) => d + 1), dur);
    return () => clearTimeout(t);
  }, [done, total]);

  const finished = done >= total;
  const pct = Math.round((done / total) * 100);
  const activeStep = finished ? null : AGENT_PIPELINE[done];

  return (
    <Card sx={panelSx}>
      <div className="cat-run">
        <div className="cat-run-head">
          <div className={`cat-bot ${finished ? "is-done" : ""}`}>{finished ? "✅" : "🤖"}</div>
          <div className="cat-run-head-txt">
            <Text variant="subheading" tone="primary">
              {finished ? "Assortment plan ready" : "Agent is building your assortment…"}
            </Text>
            <Text variant="caption" tone="muted">
              {finished
                ? "All 7 stages complete — tiers applied to Catalogue"
                : `Step ${Math.min(done + 1, total)} of ${total} · ${activeStep?.title ?? ""}`}
            </Text>
          </div>
          <div className="cat-run-pct">
            <Text variant="kpi" tone={finished ? "success" : "primary"}>{pct}%</Text>
          </div>
        </div>

        <div className="cat-run-bar">
          <div className="cat-run-bar-fill" style={{ width: `${pct}%` }} />
        </div>

        <div className="cat-run-grid">
          <ol className="cat-steps">
            {AGENT_PIPELINE.map((s, i) => {
              const state = i < done ? "done" : i === done ? "active" : "queued";
              return (
                <li key={s.id} className={`cat-step is-${state}`}>
                  <span className={`cat-step-ico tone-${s.tone}`}>
                    {state === "done" ? "✓" : state === "active" ? <span className="cat-spin" /> : s.icon}
                  </span>
                  <div className="cat-step-body">
                    <span className="cat-step-title">{s.title}</span>
                    <span className="cat-step-sub">
                      {state === "active"
                        ? <>{s.sub}<span className="cat-dots" /></>
                        : state === "done" ? s.result(ctx) : "Waiting…"}
                    </span>
                  </div>
                </li>
              );
            })}
          </ol>

          <div className="cat-console" aria-hidden="true">
            <div className="cat-console-bar">
              <span className="cat-dot r" /><span className="cat-dot y" /><span className="cat-dot g" />
              <span className="cat-console-title">assortment-agent · trace</span>
            </div>
            <div className="cat-console-body">
              <div className="cat-log cat-log-muted">$ agent run --catalogue FW2025 --stores {ctx.storeCount}</div>
              {AGENT_PIPELINE.slice(0, done).map((s) => (
                <div key={s.id} className="cat-log">
                  <span className="cat-log-ok">✓</span> {s.title} <span className="cat-log-muted">— {s.result(ctx)}</span>
                </div>
              ))}
              {!finished && (
                <div className="cat-log cat-log-run">
                  <span className="cat-log-arrow">▸</span> {activeStep?.title}<span className="cat-cursor" />
                </div>
              )}
              {finished && (
                <div className="cat-log cat-log-done">
                  ✓ Plan committed · Core {ctx.natCount} · Cluster {ctx.clCount} · Store {ctx.storePicks}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}

/* ─── Top-of-Workspace agent section ────────────────────────────────────── */
function AgentSection({ onNavigateCatalogue }) {
  const scClusters = FD_CLUST_SCENARIOS.B.clusters;
  const existing = getAgentPlan();
  const alreadyRun = !!existing.agentRunAt;

  const [phase, setPhase]   = useState(alreadyRun ? "done" : "idle");
  const [plan,  setPlanLocal] = useState(alreadyRun ? existing : null);
  const [collapsed, setCollapsed] = useState(alreadyRun); // collapse after first run

  const runAgent = () => {
    const result = runCatalogueAgent();
    setPlanLocal(result);
    setPhase("running");
  };
  const reRun = () => {
    resetAgentPlan();
    setPlanLocal(null);
    setPhase("idle");
    setCollapsed(false);
  };
  const onComplete = () => {
    setAgentPlan(plan);
    setPhase("done");
    setCollapsed(false);
  };

  const natCount = plan
    ? HARD_LOCKED_COUNT + Object.values(plan.natDecisions || {}).filter((v) => v === "core").length
    : HARD_LOCKED_COUNT;
  const clCount = plan
    ? Object.values(plan.clusterDecisions || {}).filter((v) => v === "add").length
    : 0;

  const agentCtx = useMemo(() => ({
    total: CATALOGUE_SKUS.length,
    coreLocked: HARD_LOCKED_COUNT,
    eligible: CATALOGUE_SKUS.filter((s) => !s.tag && s.status === "Active").length,
    assortRows: FD_ASSORTMENT.length,
    storeCount: FD_STORES.length,
    clusterCount: scClusters.length,
    intelSignals: INTEL_SEED.filter((i) => i.feedsModel && (i.status === "actioned" || i.status === "reviewed")).length,
    natCount,
    clCount,
    storePicks: STORE_PICK_COUNT,
  }), [natCount, clCount, scClusters.length]);

  /* Compact done banner */
  if (phase === "done" && collapsed) {
    return (
      <Card sx={{ ...panelSx, borderLeft: "3px solid var(--color-success)" }}>
        <Stack direction="row" justify="space-between" align="center" gap={3} wrap>
          <Stack direction="row" gap={2} align="center" flex="1 1 auto" style={{ minWidth: 0 }}>
            <span style={{ fontSize: 20 }}>✅</span>
            <Stack direction="column" gap={0}>
              <Text variant="body-strong" tone="success">Assortment agent applied</Text>
              <Text variant="micro" tone="muted">
                Core {natCount} · Cluster {clCount} · Store {STORE_PICK_COUNT} · {plan?.agentRunAt}
              </Text>
            </Stack>
          </Stack>
          <Stack direction="row" gap={2} wrap>
            <Button variant="secondary" size="small" onClick={() => setCollapsed(false)}>View details</Button>
            <Button variant="ghost" size="small" onClick={reRun}>Re-run</Button>
            <Button variant="primary" size="small" onClick={onNavigateCatalogue}>View Catalogue →</Button>
          </Stack>
        </Stack>
      </Card>
    );
  }

  /* Idle CTA */
  if (phase === "idle") {
    return (
      <Card sx={panelSx}>
        <Stack direction="row" gap={3} align="flex-start" wrap>
          <Stack className="cat-agent-dot" align="center" justify="center"
            style={{ width: 48, height: 48, borderRadius: "50%", background: "var(--color-primary-soft)", flexShrink: 0 }}>
            <span style={{ fontSize: 22 }}>🤖</span>
          </Stack>
          <Stack direction="column" gap={3} flex="1 1 auto" style={{ minWidth: 0 }}>
            <Stack direction="column" gap={1}>
              <Text variant="subheading" tone="primary">Agent Assortment Recommendation</Text>
              <Text variant="caption" tone="muted">
                The agent analyses R13 sell-through, carry rates, cluster performance, and market intel signals across all{" "}
                {FD_STORES.length} stores to recommend a 3-tier assortment plan — National Core, Cluster-level adds, and
                Store picks. Results are reflected in the Catalogue screen.
              </Text>
            </Stack>

            {/* Pipeline preview */}
            <div className="cat-pipe">
              {AGENT_PIPELINE.map((s, i) => (
                <React.Fragment key={s.id}>
                  <span className={`cat-pipe-chip tone-${s.tone}`}>
                    <span className="cat-pipe-ico">{s.icon}</span>
                    <span className="cat-pipe-label">{s.title.replace(/^(Scanning|Analyzing|Computing|Selecting|Evaluating|Applying|Generating) /, "")}</span>
                  </span>
                  {i < AGENT_PIPELINE.length - 1 && <span className="cat-pipe-arrow">→</span>}
                </React.Fragment>
              ))}
            </div>

            <Grid min={180} gap={3}>
              {AGENT_TIERS.map((t) => (
                <Card key={t.tier} sx={softSx}>
                  <Stack direction="column" gap={1}>
                    <Text variant="subheading">{t.icon}</Text>
                    <Text variant="body-strong" tone={t.tone}>{t.tier}</Text>
                    <Text variant="micro" tone="muted">{t.desc}</Text>
                  </Stack>
                </Card>
              ))}
            </Grid>

            <Stack direction="row" gap={3} align="center" wrap>
              <Button variant="primary" size="medium" onClick={runAgent}>🤖 Run agent recommendation</Button>
              <Text variant="micro" tone="subtle">
                Recommendations apply as defaults. Review and override in National Core → Regional → Store Curation.
              </Text>
            </Stack>
          </Stack>
        </Stack>
      </Card>
    );
  }

  /* Running */
  if (phase === "running") {
    return <AgentRunPanel ctx={agentCtx} onComplete={onComplete} />;
  }

  /* Done — expanded */
  return (
    <Stack direction="column" gap={3}>
      {/* Success header */}
      <Card sx={{ ...panelSx, borderLeft: "3px solid var(--color-success)" }}>
        <Stack direction="row" justify="space-between" align="center" gap={3} wrap>
          <Stack direction="row" gap={2} align="center" flex="1 1 auto">
            <span style={{ fontSize: 22 }}>✅</span>
            <Stack direction="column" gap={0}>
              <Text variant="subheading" tone="success">Assortment plan committed to Catalogue</Text>
              <Text variant="micro" tone="muted">Applied {plan?.agentRunAt} — navigate to Catalogue to see tier assignments</Text>
            </Stack>
          </Stack>
          <Stack direction="row" gap={2} wrap>
            <Button variant="ghost" size="small" onClick={reRun}>Re-run</Button>
            <Button variant="ghost" size="small" onClick={() => setCollapsed(true)}>Collapse</Button>
            <Button variant="primary" size="small" onClick={onNavigateCatalogue}>View Catalogue →</Button>
          </Stack>
        </Stack>
      </Card>

      {/* Tier cascade */}
      <div className="ws-agent-cascade">
        {[
          { label: "🔒 National Core", n: natCount,       note: "All stores · locked", color: "var(--color-success)" },
          { label: "🗂 Cluster Adds",  n: clCount,        note: "Per-cluster mandatory", color: "var(--color-teal)" },
          { label: "📍 Store Picks",   n: STORE_PICK_COUNT, note: "Store-level curation", color: "var(--color-accent)" },
        ].map((t) => (
          <div key={t.label} className="ws-agent-cascade-tile" style={{ "--wac": t.color }}>
            <span className="ws-agent-cascade-n">{t.n}</span>
            <span className="ws-agent-cascade-label">{t.label}</span>
            <span className="ws-agent-cascade-note">{t.note}</span>
          </div>
        ))}
      </div>
    </Stack>
  );
}

/* ─── Shared atoms ──────────────────────────────────────────────────────── */
const STATUS_BADGE_COLOR = {
  draft: "neutral", "in-progress": "info", review: "warning", approved: "success",
};
const MODE_BADGE_COLOR = {
  gated: "accent", autonomous: "teal",
};
function StatusPill({ status }) {
  const s = PLAN_STATUS[status] || PLAN_STATUS.draft;
  return (
    <Badge variant="subtle" color={STATUS_BADGE_COLOR[status] || "neutral"} label={s.label} />
  );
}
function ModePill({ mode }) {
  const m = PLAN_MODE[mode] || PLAN_MODE.gated;
  return (
    <Badge variant="subtle" color={MODE_BADGE_COLOR[mode] || "neutral"} label={m.label} />
  );
}

function PipelineMicroBar({ stages, completed, active }) {
  return (
    <div className="ws-pipe-bar" title="Pipeline progress">
      {stages.map((s) => {
        const done = completed.includes(s.id);
        const isCurrent = s.id === active && !done;
        return (
          <div
            key={s.id}
            className={`ws-pipe-seg ${done ? "done" : isCurrent ? "active" : "pending"}`}
            title={s.label}
          />
        );
      })}
    </div>
  );
}

function KpiChip({ label, value }) {
  return (
    <div className="ws-kpi-chip">
      <span className="ws-kpi-val">{value}</span>
      <span className="ws-kpi-lbl">{label}</span>
    </div>
  );
}

/* ─── Plan Card ─────────────────────────────────────────────────────────── */
function PlanCard({ plan, onOpen, selected, onToggleCompare }) {
  const completedPct = Math.round((plan.stagesCompleted.length / PIPE_STAGES.length) * 100);
  return (
    <Card
      className={`ws-plan-card ${selected ? "ws-plan-card--selected" : ""}`}
      onClick={() => onOpen(plan.id)}
      sx={{ cursor: "pointer", padding: "var(--sp-4)", transition: "box-shadow 0.15s" }}
    >
      <div className="ws-plan-card-header">
        <div className="ws-plan-card-title">
          <span className="ws-plan-name">{plan.name}</span>
          <StatusPill status={plan.status} />
        </div>
        <div className="ws-plan-card-meta">
          <ModePill mode={plan.mode} />
          <span className="ws-plan-dept">{plan.dept}</span>
          <span className="ws-plan-season">{plan.season}</span>
        </div>
      </div>

      <PipelineMicroBar stages={PIPE_STAGES} completed={plan.stagesCompleted} active={plan.activeStage} />

      <div className="ws-plan-card-kpis">
        <KpiChip label="Stores" value={plan.kpis.stores} />
        <KpiChip label="SKUs" value={plan.kpis.skus} />
        <KpiChip label="Core" value={plan.kpis.coreCount} />
        <KpiChip label="Submitted" value={`${plan.kpis.submittedPct}%`} />
        <KpiChip label="Complete" value={`${completedPct}%`} />
      </div>

      {plan.notes && <p className="ws-plan-notes">{plan.notes}</p>}

      <div className="ws-plan-card-footer">
        <span className="ws-plan-updated">Updated {plan.updatedAt}</span>
        <label className="ws-compare-check" onClick={(e) => e.stopPropagation()}>
          <input
            type="checkbox"
            checked={selected}
            onChange={(e) => { e.stopPropagation(); onToggleCompare(plan.id); }}
          />
          Compare
        </label>
      </div>
    </Card>
  );
}

/* ─── Compare Tray ──────────────────────────────────────────────────────── */
function CompareTray({ planIds, plans, onClose }) {
  if (!planIds.length) return null;
  const selected = plans.filter((p) => planIds.includes(p.id));
  const metrics = [
    { key: "skus",         label: "SKUs" },
    { key: "coreCount",    label: "Core SKUs" },
    { key: "submittedPct", label: "Submitted %" },
  ];
  return (
    <div className="ws-compare-tray">
      <div className="ws-compare-tray-inner">
        <span className="ws-compare-label">Compare ({planIds.length}/3)</span>
        <div className="ws-compare-slots">
          {selected.map((p) => (
            <div key={p.id} className="ws-compare-slot">
              <span className="ws-compare-slot-name">{p.name}</span>
              <div className="ws-compare-slot-kpis">
                {metrics.map((m) => (
                  <span key={m.key} className="ws-compare-slot-kpi">
                    <strong>{p.kpis[m.key]}{m.key === "submittedPct" ? "%" : ""}</strong> {m.label}
                  </span>
                ))}
              </div>
              <StatusPill status={p.status} />
            </div>
          ))}
        </div>
        <button type="button" className="ws-compare-close" onClick={onClose}>✕ Clear</button>
      </div>
    </div>
  );
}

/* ─── Plan Detail (9-stage pipeline view) ───────────────────────────────── */
function PlanDetail({ plan, onBack, onNavigate }) {
  const completedSet = new Set(plan.stagesCompleted);
  return (
    <div className="ws-detail">
      <div className="ws-detail-header">
        <button type="button" className="ws-back-btn" onClick={onBack}>← All Plans</button>
        <div className="ws-detail-title-row">
          <h2 className="ws-detail-name">{plan.name}</h2>
          <StatusPill status={plan.status} />
          <ModePill mode={plan.mode} />
        </div>
        <p className="ws-detail-meta">
          {plan.dept} · {plan.season} · Created by {plan.createdBy} on {plan.createdAt}
        </p>
        {plan.notes && <div className="ws-detail-notes">{plan.notes}</div>}
      </div>

      <div className="ws-detail-kpi-row">
        {[
          { label: "Stores",    val: plan.kpis.stores },
          { label: "SKUs",      val: plan.kpis.skus },
          { label: "Core SKUs", val: plan.kpis.coreCount },
          { label: "Submitted", val: `${plan.kpis.submittedPct}%` },
          { label: "Confidence threshold", val: `${plan.confidenceThreshold}%` },
        ].map((k) => (
          <div key={k.label} className="ws-detail-kpi">
            <span className="ws-detail-kpi-val">{k.val}</span>
            <span className="ws-detail-kpi-lbl">{k.label}</span>
          </div>
        ))}
      </div>

      <div className="ws-detail-section-label">Pipeline — 9 stages</div>
      <div className="ws-pipeline-grid">
        {PIPE_STAGES.map((s, i) => {
          const done = completedSet.has(s.id);
          const isCurrent = s.id === plan.activeStage && !done;
          const state = done ? "done" : isCurrent ? "active" : "pending";
          return (
            <div key={s.id} className={`ws-stage-card ws-stage-card--${state}`}>
              <div className="ws-stage-num">{i + 1}</div>
              <div className="ws-stage-info">
                <span className="ws-stage-label">{s.label}</span>
                <span className="ws-stage-state">{done ? "Complete ✓" : isCurrent ? "In progress ▶" : "Pending"}</span>
              </div>
              {(done || isCurrent) && (
                <button
                  type="button"
                  className="ws-stage-go"
                  onClick={() => onNavigate(s.mod)}
                >
                  {isCurrent ? "Go →" : "View →"}
                </button>
              )}
            </div>
          );
        })}
      </div>

      {plan.activeStage && (
        <div className="ws-detail-cta">
          <button
            type="button"
            className="ws-cta-btn"
            onClick={() => {
              const stage = PIPE_STAGES.find((s) => s.id === plan.activeStage);
              if (stage) onNavigate(stage.mod);
            }}
          >
            Go to active stage: {PIPE_STAGES.find((s) => s.id === plan.activeStage)?.label}
          </button>
        </div>
      )}
    </div>
  );
}

/* ─── Create Wizard ─────────────────────────────────────────────────────── */
const WIZARD_STEPS = ["Details", "Mode", "Clustering", "Context", "Review"];

function CreateWizard({ onClose, onCreate }) {
  const [step, setStep] = useState(0);
  const [draft, setDraft] = useState({
    name: "",
    dept: "Tile",
    season: "SS 2026",
    mode: "gated",
    confidenceThreshold: 75,
    clusteringScenario: "cr-018",
    context: "",
  });

  const set = (key, val) => setDraft((d) => ({ ...d, [key]: val }));
  const canNext = () => {
    if (step === 0) return draft.name.trim().length >= 3;
    return true;
  };

  const handleCreate = () => {
    onCreate({
      ...draft,
      id: `p${Date.now()}`,
      status: "draft",
      activeStage: "hindsight",
      stagesCompleted: [],
      kpis: { stores: 70, skus: 0, coreCount: 0, submittedPct: 0 },
      createdBy: "Karen M.",
      createdAt: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
      updatedAt: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
    });
  };

  return (
    <div className="ws-wizard-overlay" role="dialog" aria-modal="true" aria-labelledby="ws-wizard-title" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="ws-wizard">
        <div className="ws-wizard-header">
          <h3 id="ws-wizard-title">Create New Plan</h3>
          <button type="button" className="ws-wizard-close" onClick={onClose} aria-label="Close create plan wizard">✕</button>
        </div>

        <StepIndicator step={step} labels={WIZARD_STEPS} className="ws-wizard-steps" />

        <div className="ws-wizard-body">
          {step === 0 && (
            <div className="ws-wizard-section">
              <label className="ws-form-label">Plan name *</label>
              <input
                className="ws-form-input"
                placeholder="e.g. SS 2026 Tile & Ceramic"
                value={draft.name}
                onChange={(e) => set("name", e.target.value)}
              />
              <label className="ws-form-label" style={{ marginTop: 16 }}>Department</label>
              <div className="ws-radio-group">
                {DEPT_OPTIONS.filter((d) => d !== "All").map((d) => (
                  <label key={d} className={`ws-radio-card ${draft.dept === d ? "selected" : ""}`}>
                    <input type="radio" value={d} checked={draft.dept === d} onChange={() => set("dept", d)} />
                    {d}
                  </label>
                ))}
              </div>
              <label className="ws-form-label" style={{ marginTop: 16 }}>Season</label>
              <input className="ws-form-input" value={draft.season} onChange={(e) => set("season", e.target.value)} />
            </div>
          )}

          {step === 1 && (
            <div className="ws-wizard-section">
              <label className="ws-form-label">Pipeline mode</label>
              <div className="ws-mode-cards">
                {[
                  { id: "gated", label: "Gated", desc: "Merchant reviews and approves each stage before the agent proceeds. Full control, requires active participation.", badge: "Recommended" },
                  { id: "autonomous", label: "Autonomous", desc: "Agent chains stages automatically using configured confidence threshold. Ideal for speed — review at the end.", badge: "Fast" },
                ].map((m) => (
                  <label key={m.id} className={`ws-mode-card ${draft.mode === m.id ? "selected" : ""}`}>
                    <input type="radio" value={m.id} checked={draft.mode === m.id} onChange={() => set("mode", m.id)} />
                    <div style={{ display: "flex", alignItems: "center", gap: "var(--sp-2)", marginBottom: "var(--sp-1)" }}>
                      <strong>{m.label}</strong>
                      <span className="ws-mode-badge">{m.badge}</span>
                    </div>
                    <p>{m.desc}</p>
                  </label>
                ))}
              </div>
              <label className="ws-form-label" style={{ marginTop: 20 }}>
                Confidence threshold — {draft.confidenceThreshold}%
              </label>
              <input
                type="range" min={50} max={95} step={5}
                value={draft.confidenceThreshold}
                onChange={(e) => set("confidenceThreshold", Number(e.target.value))}
                className="ws-slider"
              />
              <div className="ws-slider-labels"><span>50%</span><span>95%</span></div>
            </div>
          )}

          {step === 2 && (
            <div className="ws-wizard-section">
              <label className="ws-form-label">Clustering scenario</label>
              <div className="ws-radio-group ws-radio-group--vertical">
                {CLUSTERING_SCENARIOS.map((s) => (
                  <label key={s.id} className={`ws-radio-card ws-radio-card--full ${draft.clusteringScenario === s.id ? "selected" : ""}`}>
                    <input type="radio" value={s.id} checked={draft.clusteringScenario === s.id} onChange={() => set("clusteringScenario", s.id)} />
                    {s.label}
                    {s.default && <span className="ws-rec-badge">Recommended</span>}
                  </label>
                ))}
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="ws-wizard-section">
              <label className="ws-form-label">Additional context for the agent (optional)</label>
              <textarea
                className="ws-form-textarea"
                placeholder="Describe any focus areas, constraints, or goals for this plan..."
                value={draft.context}
                onChange={(e) => set("context", e.target.value)}
                rows={5}
              />
              <div className="ws-context-chips">
                {CONTEXT_CHIPS.map((c) => (
                  <button
                    key={c}
                    className="ws-context-chip"
                    onClick={() => set("context", draft.context ? `${draft.context}\n${c}` : c)}
                  >
                    + {c}
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="ws-wizard-section">
              <div className="ws-review-grid">
                {[
                  { label: "Plan name",    val: draft.name },
                  { label: "Department",   val: draft.dept },
                  { label: "Season",       val: draft.season },
                  { label: "Mode",         val: draft.mode.charAt(0).toUpperCase() + draft.mode.slice(1) },
                  { label: "Confidence",   val: `${draft.confidenceThreshold}%` },
                  { label: "Clustering",   val: CLUSTERING_SCENARIOS.find((s) => s.id === draft.clusteringScenario)?.label || draft.clusteringScenario },
                ].map((r) => (
                  <div key={r.label} className="ws-review-row">
                    <span className="ws-review-key">{r.label}</span>
                    <span className="ws-review-val">{r.val}</span>
                  </div>
                ))}
              </div>
              {draft.context && (
                <div className="ws-review-notes">
                  <span className="ws-form-label">Context</span>
                  <p>{draft.context}</p>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="ws-wizard-footer">
          <button type="button" className="ws-btn-ghost" onClick={step === 0 ? onClose : () => setStep(step - 1)}>
            {step === 0 ? "Cancel" : "← Back"}
          </button>
          {step < WIZARD_STEPS.length - 1 ? (
            <button type="button" className="ws-btn-primary" disabled={!canNext()} onClick={() => setStep(step + 1)}>
              Next →
            </button>
          ) : (
            <button type="button" className="ws-btn-primary" onClick={handleCreate}>
              Create Plan
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

/* ─── Main Workspace View ───────────────────────────────────────────────── */
export default function Workspace({ onNavigate, user }) { // eslint-disable-line no-unused-vars
  const [plans, setPlans]           = useState(PLANS);
  const [statusFilter, setStatusFilter] = useState("all");
  const [deptFilter, setDeptFilter] = useState("All");
  const [detailId, setDetailId]     = useState(null);
  const [compareIds, setCompareIds] = useState([]);
  const [showWizard, setShowWizard] = useState(false);

  const STATUS_FILTERS = ["all", "draft", "in-progress", "review", "approved"];

  const filtered = useMemo(() => plans.filter((p) => {
    const statusOk = statusFilter === "all" || p.status === statusFilter;
    const deptOk = deptFilter === "All" || p.dept === deptFilter;
    return statusOk && deptOk;
  }), [plans, statusFilter, deptFilter]);

  const toggleCompare = (id) => {
    setCompareIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : prev.length < 3 ? [...prev, id] : prev
    );
  };

  const handleCreate = (newPlan) => {
    setPlans((prev) => [newPlan, ...prev]);
    setShowWizard(false);
    setDetailId(newPlan.id);
  };

  const detailPlan = plans.find((p) => p.id === detailId);

  if (detailPlan) {
    return (
      <div className="ws-root">
        <PlanDetail plan={detailPlan} onBack={() => setDetailId(null)} onNavigate={onNavigate} />
      </div>
    );
  }

  const activePlansCount = plans.filter((p) => p.status === "in-progress").length;

  return (
    <div className="ws-root">
      <div className="ws-header">
        <div className="ws-header-left">
          <h1 className="ws-title">My Workspace</h1>
          <span className="ws-season-badge">SS 2026</span>
          <span className="ws-active-badge">{activePlansCount} active</span>
        </div>
        <button type="button" className="ws-btn-primary" onClick={() => setShowWizard(true)}>
          + New Plan
        </button>
      </div>

      {/* ── Agent Recommendation Section ─────────────────────────────────── */}
      <AgentSection onNavigateCatalogue={() => onNavigate?.("catalogue")} />

      <div className="ws-filters">
        <div className="ws-status-tabs">
          {STATUS_FILTERS.map((s) => (
            <button
              key={s}
              className={`ws-status-tab ${statusFilter === s ? "active" : ""}`}
              onClick={() => setStatusFilter(s)}
            >
              {s === "all" ? "All" : PLAN_STATUS[s]?.label || s}
              <span className="ws-tab-count">
                {s === "all" ? plans.length : plans.filter((p) => p.status === s).length}
              </span>
            </button>
          ))}
        </div>
        <div className="ws-dept-filter">
          {DEPT_OPTIONS.map((d) => (
            <button
              key={d}
              className={`ws-dept-chip ${deptFilter === d ? "active" : ""}`}
              onClick={() => setDeptFilter(d)}
            >
              {d}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          heading="No plans match"
          description="Try adjusting the filters above or create a new plan."
          action={<Button variant="primary" onClick={() => setShowWizard(true)}>+ New Plan</Button>}
        />
      ) : (
        <div className="ws-plan-grid">
          {filtered.map((p) => (
            <PlanCard
              key={p.id}
              plan={p}
              onOpen={setDetailId}
              selected={compareIds.includes(p.id)}
              onToggleCompare={toggleCompare}
            />
          ))}
        </div>
      )}

      <CompareTray planIds={compareIds} plans={plans} onClose={() => setCompareIds([])} />

      {showWizard && (
        <CreateWizard onClose={() => setShowWizard(false)} onCreate={handleCreate} />
      )}
    </div>
  );
}
