import React, { useState, useMemo } from "react";
import { Card, Badge, Input, Select } from "impact-ui";
import {
  PLANS, PIPE_STAGES, PLAN_STATUS, PLAN_MODE,
  DEPT_OPTIONS, CLUSTERING_SCENARIOS, CONTEXT_CHIPS,
} from "../data/workspace.js";
import "./Workspace.css";

/* ─── Shared atoms ──────────────────────────────────────────────────────── */
function StatusPill({ status }) {
  const s = PLAN_STATUS[status] || PLAN_STATUS.draft;
  return (
    <span className="ws-status-pill" style={{ color: s.color, background: s.bg }}>
      {s.label}
    </span>
  );
}
function ModePill({ mode }) {
  const m = PLAN_MODE[mode] || PLAN_MODE.gated;
  return (
    <span className="ws-mode-pill" style={{ color: m.color, background: m.bg }}>
      {m.label}
    </span>
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
    <div className={`ws-plan-card ${selected ? "ws-plan-card--selected" : ""}`} onClick={() => onOpen(plan.id)}>
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
    </div>
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
        <button className="ws-compare-close" onClick={onClose}>✕ Clear</button>
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
        <button className="ws-back-btn" onClick={onBack}>← All Plans</button>
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
    <div className="ws-wizard-overlay" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="ws-wizard">
        <div className="ws-wizard-header">
          <h3>Create New Plan</h3>
          <button className="ws-wizard-close" onClick={onClose}>✕</button>
        </div>

        <div className="ws-wizard-steps">
          {WIZARD_STEPS.map((s, i) => (
            <div key={s} className={`ws-wizard-step ${i === step ? "active" : i < step ? "done" : ""}`}>
              <div className="ws-wizard-step-circle">{i < step ? "✓" : i + 1}</div>
              <span className="ws-wizard-step-label">{s}</span>
              {i < WIZARD_STEPS.length - 1 && <div className="ws-wizard-step-connector" />}
            </div>
          ))}
        </div>

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
                  { id: "gated", label: "Gated", desc: "Merchant reviews and approves each stage before the agent proceeds. Full control, requires active participation.", icon: "🔒" },
                  { id: "autonomous", label: "Autonomous", desc: "Agent chains stages automatically using configured confidence threshold. Ideal for speed — review at the end.", icon: "🤖" },
                ].map((m) => (
                  <label key={m.id} className={`ws-mode-card ${draft.mode === m.id ? "selected" : ""}`}>
                    <input type="radio" value={m.id} checked={draft.mode === m.id} onChange={() => set("mode", m.id)} />
                    <span className="ws-mode-icon">{m.icon}</span>
                    <strong>{m.label}</strong>
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
          <button className="ws-btn-ghost" onClick={step === 0 ? onClose : () => setStep(step - 1)}>
            {step === 0 ? "Cancel" : "← Back"}
          </button>
          {step < WIZARD_STEPS.length - 1 ? (
            <button className="ws-btn-primary" disabled={!canNext()} onClick={() => setStep(step + 1)}>
              Next →
            </button>
          ) : (
            <button className="ws-btn-primary" onClick={handleCreate}>
              Create Plan
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

/* ─── Main Workspace View ───────────────────────────────────────────────── */
export default function Workspace({ onNavigate, user }) {
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
        <button className="ws-btn-primary" onClick={() => setShowWizard(true)}>
          + New Plan
        </button>
      </div>

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
        <div className="ws-empty">
          <div className="ws-empty-icon">📋</div>
          <p>No plans match the selected filters.</p>
          <button className="ws-btn-primary" onClick={() => setShowWizard(true)}>Create a plan</button>
        </div>
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
