/**
 * PlanningRules.jsx — Dedicated Planning Rules screen in the Admin module.
 * Matches HTML v9-7-2 renderAdminPlanning(rules branch) with Impact UI polish.
 */
import React, { useState } from "react";
import { Card, Badge, Button } from "impact-ui";
import { Lock, Pencil, SlidersHorizontal, RefreshCw, CheckCircle2, AlertTriangle, Sliders } from "lucide-react";
import Text from "../components/Text.jsx";
import Stack from "../components/Stack.jsx";
import {
  AGENT_RULES,
  PLANNING_DEPT_SPLITS,
  DEPT_COLORS_HEX,
  GLOBAL_OPTION_SPLIT,
} from "../data/admin.js";
import { panelSx, softSx } from "../styles/panelSx.js";
import "./PlanningRules.css";

/* ── type badge color ──────────────────────────────────────────────────────── */
const TYPE_COLOR = {
  threshold: { badge: "info",    label: "Threshold" },
  limit:     { badge: "warning", label: "Limit"     },
  weight:    { badge: "success", label: "Weight"    },
  config:    { badge: "neutral", label: "Config"    },
  integer:   { badge: "info",    label: "Integer"   },
  formula:   { badge: "error",   label: "Formula"   },
  system:    { badge: "neutral", label: "System"    },
};

/* Stacked split bar */
function SplitBar({ nat, reg, sto, valid }) {
  return (
    <div className="pr-bar-track">
      {valid ? (
        <>
          <div style={{ flex: nat, background: "#059669", minWidth: nat > 0 ? 2 : 0, transition: "flex .3s" }} />
          <div style={{ flex: reg, background: "#2563EB", minWidth: reg > 0 ? 2 : 0, transition: "flex .3s" }} />
          <div style={{ flex: sto, background: "#D97706", minWidth: sto > 0 ? 2 : 0, transition: "flex .3s" }} />
        </>
      ) : (
        <div style={{ flex: 1, background: "#EF4444" }} />
      )}
    </div>
  );
}

/* Editable % input */
function PctInput({ value, onChange, accent }) {
  return (
    <div className="pr-pct-wrap">
      <input
        className="pr-pct-input"
        type="number" min={0} max={100}
        value={value}
        onChange={(e) => onChange(Math.min(100, Math.max(0, parseInt(e.target.value) || 0)))}
        style={{ borderColor: accent + "55", focusBorderColor: accent }}
      />
      <span className="pr-pct-sym" style={{ color: accent }}>%</span>
    </div>
  );
}

export default function PlanningRules() {
  const [splits, setSplits] = useState(PLANNING_DEPT_SPLITS.map((d) => ({ ...d })));
  const [global, setGlobal]   = useState({ ...GLOBAL_OPTION_SPLIT });
  const [saved,  setSaved]    = useState(false);

  const validCount = splits.filter((d) => d.national + d.regional + d.store === 100).length;

  const updateSplit = (i, field, val) =>
    setSplits((prev) => prev.map((d, idx) => idx === i ? { ...d, [field]: val } : d));

  const resetRowToGlobal = (i) =>
    setSplits((prev) => prev.map((d, idx) => idx === i
      ? { ...d, national: global.national, regional: global.regional, store: global.store }
      : d));

  const resetAll = () =>
    setSplits((prev) => prev.map((d) => ({ ...d, national: global.national, regional: global.regional, store: global.store })));

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const globalTotal = global.national + global.regional + global.store;

  /* Group agent rules by type */
  const ruleGroups = AGENT_RULES.reduce((acc, r) => {
    (acc[r.type] = acc[r.type] || []).push(r);
    return acc;
  }, {});

  return (
    <div className="pr-page">
      {/* ── Navy header ── */}
      <div className="pr-nav-header">
        <div className="pr-nav-header-left">
          <div className="pr-nav-icon-wrap">
            <SlidersHorizontal size={20} color="#fff" />
          </div>
          <div>
            <Text variant="title" style={{ color: "#fff", fontWeight: 800 }}>Planning Rules</Text>
            <Text variant="micro" style={{ color: "rgba(255,255,255,.6)", marginTop: 2 }}>
              Curation split by department and agent confidence thresholds
            </Text>
          </div>
        </div>
        {/* KPI strip */}
        <div className="pr-kpi-strip">
          {[
            { label: "Departments",    value: splits.length,          sub: "configured",    accent: "#6EEDB8" },
            { label: "Valid configs",  value: `${validCount}/${splits.length}`, sub: "splits = 100%", accent: validCount === splits.length ? "#6EEDB8" : "#FCD34D" },
            { label: "Agent rules",    value: AGENT_RULES.length,     sub: "active",        accent: "#A5B4FC" },
          ].map((k) => (
            <div key={k.label} className="pr-kpi-card">
              <div className="pr-kpi-value" style={{ color: k.accent }}>{k.value}</div>
              <div className="pr-kpi-label">{k.label}</div>
              <div className="pr-kpi-sub">{k.sub}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="pr-page-body">
        {/* ─────────── Section 1: Curation split ─────────── */}
        <Card sx={{ ...panelSx, padding: 0 }}>
          {/* Card header */}
          <div className="pr-card-header">
            <div>
              <Text variant="body-strong" tone="strong">Curation split by department</Text>
              <Text variant="micro" tone="muted" style={{ marginTop: 3 }}>
                Set the % of agent-recommended total options allocated to each curation tier, per department.
                Total options are always agent-calculated — only the split is configured here.
              </Text>
            </div>
            <Button variant="secondary" size="small" onClick={resetAll}>
              <RefreshCw size={12} style={{ marginRight: 5 }} />Reset all to global
            </Button>
          </div>

          {/* Legend row */}
          <div className="pr-legend-row">
            {[
              { color: "#059669", label: "National core" },
              { color: "#2563EB", label: "Regional / cluster" },
              { color: "#D97706", label: "Store curated" },
            ].map((l) => (
              <div key={l.label} className="pr-legend-item">
                <div className="pr-legend-dot" style={{ background: l.color }} />
                <Text variant="micro" tone="muted">{l.label}</Text>
              </div>
            ))}
          </div>

          {/* Table header */}
          <div className="pr-table-head">
            <div>Department</div>
            <div style={{ color: "#059669" }}>National core</div>
            <div style={{ color: "#2563EB" }}>Regional / cluster</div>
            <div style={{ color: "#D97706" }}>Store curated</div>
            <div>Split bar</div>
            <div>Validation</div>
            <div></div>
          </div>

          {splits.map((d, i) => {
            const tot   = d.national + d.regional + d.store;
            const valid = tot === 100;
            const dc    = DEPT_COLORS_HEX[d.dept] || "#64748B";
            return (
              <div key={d.dept} className={`pr-table-row${i % 2 === 1 ? " alt" : ""}${i === splits.length - 1 ? " last" : ""}`}>
                {/* Dept name */}
                <div className="pr-dept-cell">
                  <span className="pr-dept-dot" style={{ background: dc }} />
                  <Text variant="caption" style={{ fontWeight: 600, color: dc }}>{d.dept}</Text>
                </div>
                {/* National */}
                <div>
                  <PctInput value={d.national} onChange={(v) => updateSplit(i, "national", v)} accent="#059669" />
                </div>
                {/* Regional */}
                <div>
                  <PctInput value={d.regional} onChange={(v) => updateSplit(i, "regional", v)} accent="#2563EB" />
                </div>
                {/* Store */}
                <div>
                  <PctInput value={d.store} onChange={(v) => updateSplit(i, "store", v)} accent="#D97706" />
                </div>
                {/* Bar */}
                <div>
                  <SplitBar nat={d.national} reg={d.regional} sto={d.store} valid={valid} />
                </div>
                {/* Validation */}
                <div>
                  {valid
                    ? <span className="pr-val-ok"><CheckCircle2 size={12} />100%</span>
                    : <span className="pr-val-err"><AlertTriangle size={12} />{tot}%</span>}
                </div>
                {/* Reset */}
                <div>
                  <button className="pr-row-reset" onClick={() => resetRowToGlobal(i)} title="Reset to global">
                    <RefreshCw size={11} />
                  </button>
                </div>
              </div>
            );
          })}

          {/* Global fallback strip */}
          <div className="pr-global-strip">
            <Text variant="micro" tone="subtle" style={{ fontWeight: 700, textTransform: "uppercase", letterSpacing: ".06em", marginRight: 12 }}>Global fallback</Text>
            <Text variant="micro" tone="muted" style={{ marginRight: 20, flex: "0 0 auto" }}>Used when no dept-specific split is set</Text>
            {[
              { key: "national", label: "National", accent: "#059669", soft: "#F0FDF4", bd: "#86EFAC" },
              { key: "regional", label: "Regional", accent: "#1E40AF", soft: "#EFF6FF", bd: "#93C5FD" },
              { key: "store",    label: "Store",    accent: "#92400E", soft: "#FFFBEB", bd: "#FDE68A" },
            ].map((t) => (
              <div key={t.key} className="pr-global-field">
                <Text variant="micro" style={{ color: t.accent, fontWeight: 700, marginRight: 6 }}>{t.label}</Text>
                <input
                  className="pr-pct-global"
                  type="number" min={0} max={100}
                  value={global[t.key]}
                  onChange={(e) => setGlobal((p) => ({ ...p, [t.key]: Math.min(100, Math.max(0, parseInt(e.target.value) || 0)) }))}
                  style={{ borderColor: t.bd, background: t.soft, color: t.accent }}
                />
                <Text variant="micro" style={{ color: t.accent, fontWeight: 700, marginLeft: 3 }}>%</Text>
              </div>
            ))}
            <span className={`pr-global-total${globalTotal === 100 ? " ok" : " err"}`}>
              {globalTotal === 100 ? <CheckCircle2 size={12} /> : <AlertTriangle size={12} />}
              {globalTotal}%
            </span>
          </div>
        </Card>

        {/* ─────────── Section 2: Agent rules ─────────── */}
        <Card sx={{ ...panelSx, padding: 0, marginTop: 20 }}>
          <div className="pr-card-header">
            <div>
              <Text variant="body-strong" tone="strong">Agent thresholds &amp; model weights</Text>
              <Text variant="micro" tone="muted" style={{ marginTop: 3 }}>
                System rules governing agent confidence, model signal weights, and enforcement behaviour.
              </Text>
            </div>
          </div>

          {/* Rules grouped by type */}
          {Object.entries(ruleGroups).map(([type, rules]) => {
            const tc = TYPE_COLOR[type] || { badge: "neutral", label: type };
            return (
              <div key={type}>
                <div className="pr-rules-group-label">
                  <Badge variant="subtle" size="small" color={tc.badge} label={tc.label} />
                  <Text variant="micro" tone="subtle">{rules.length} rule{rules.length > 1 ? "s" : ""}</Text>
                </div>
                {rules.map((r, ri) => (
                  <div key={r.id} className={`pr-rule-row${ri % 2 === 1 ? " alt" : ""}`}>
                    <div className="pr-rule-id">
                      <Text variant="micro" mono tone="subtle">{r.id}</Text>
                    </div>
                    <div className="pr-rule-name">
                      <Text variant="caption" style={{ fontWeight: 500 }}>{r.name}</Text>
                    </div>
                    <div className="pr-rule-value">
                      <span className="pr-rule-value-chip">{r.value}</span>
                    </div>
                    <div className="pr-rule-editable">
                      {r.editable
                        ? <span className="pr-editable-yes"><Pencil size={11} />Editable</span>
                        : <span className="pr-editable-locked"><Lock size={11} />System</span>}
                    </div>
                  </div>
                ))}
              </div>
            );
          })}
        </Card>

        {/* ─────────── Save bar ─────────── */}
        <div className="pr-save-bar">
          <Text variant="caption" tone="muted">Changes are applied on save and take effect at the next agent run.</Text>
          <Button variant="primary" size="medium" onClick={handleSave}>
            {saved ? <><CheckCircle2 size={14} style={{ marginRight: 6 }} />Saved</> : "Save changes"}
          </Button>
        </div>
      </div>
    </div>
  );
}
