import React, { useState, useMemo } from "react";
import { AgGridReact } from "ag-grid-react";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-alpine.css";
import { CATALOGUE_SKUS, nationalStats, runCatalogueAgent } from "../data/catalogue.js";
import { FD_SKUS } from "../data/skus.js";
import { FD_ASSORTMENT } from "../data/assortment.js";
import { FD_STORES } from "../data/stores.js";
import { INTEL_SEED } from "../data/intel.js";
import "./AssortmentIntelligence.css";

/* ── Score builder ───────────────────────────────────────────────────────── */
const INTEL_DELTAS = {
  competitive: -15,
  supply: -20,
  product: -12,
  market: +10,
  trend: +8,
  customer: +5,
};

function buildAIScore(skuId) {
  const sku = FD_SKUS.find((s) => String(s.sku) === skuId);
  if (!sku) return null;
  const stats = nationalStats(sku);
  const r13Base = Math.min(100, Math.round(stats.carryPct + stats.avgSqft / 3));

  // Forecast component (mock: BG/Core tagged = higher)
  const forecastScore = sku.tag === "Core" ? 85 : sku.tag === "BG" ? 78 : 55 + Math.round(Math.random() * 20);

  // Intel modifier
  const actioned = INTEL_SEED.filter(
    (i) =>
      i.feedsModel &&
      (i.status === "actioned" || i.status === "reviewed") &&
      i.skus?.includes(String(sku.sku))
  );
  let intelDelta = 0;
  const flags = [];
  actioned.forEach((sig) => {
    const d = INTEL_DELTAS[sig.type] || 0;
    intelDelta += d;
    if (sig.type === "supply") flags.push("supply-constrained");
    if (sig.type === "product") flags.push("quality-hold");
  });
  intelDelta = Math.max(-30, Math.min(30, intelDelta));
  const composite = Math.max(0, Math.min(100, Math.round(r13Base * 0.45 + forecastScore * 0.35 + (50 + intelDelta) * 0.2)));

  return {
    skuId,
    desc: sku.desc,
    dept: sku.dept,
    subDept: sku.subDept,
    price: sku.price,
    tag: sku.tag,
    r13Score: r13Base,
    forecastScore,
    intelDelta,
    composite,
    flags,
    signals: actioned,
    carryPct: Math.round(stats.carryPct),
    avgSqft: Math.round(stats.avgSqft),
  };
}

function scoreColor(v) {
  if (v >= 75) return { bg: "#ecfdf5", color: "#059669" };
  if (v >= 55) return { bg: "#eff6ff", color: "#2563eb" };
  if (v >= 35) return { bg: "#fffbeb", color: "#d97706" };
  return { bg: "#fef2f2", color: "#dc2626" };
}

/* ── Per-store R13 for detail panel ─────────────────────────────────────── */
function storeR13(skuId) {
  return FD_STORES.map((st) => {
    const row = FD_ASSORTMENT.find((r) => r.storeId === st.id && String(r.sku) === skuId);
    return { store: st.name, velocity: st.velocity, r13: row?.r13Sqft || 0 };
  }).sort((a, b) => b.r13 - a.r13).slice(0, 12);
}

/* ── Score bar ───────────────────────────────────────────────────────────── */
function ScoreBar({ label, value, color }) {
  return (
    <div className="ai-score-bar">
      <div className="ai-score-bar-head">
        <span className="ai-score-bar-label">{label}</span>
        <span className="ai-score-bar-val" style={{ color }}>{value}</span>
      </div>
      <div className="ai-score-bar-track">
        <div className="ai-score-bar-fill" style={{ width: `${value}%`, background: color }} />
      </div>
    </div>
  );
}

/* ── Detail panel ────────────────────────────────────────────────────────── */
function DetailPanel({ score, onNavigate, onClose }) {
  if (!score) return (
    <div className="ai-detail-empty">
      <div className="ai-detail-empty-icon">📊</div>
      <p>Select a SKU to view signal breakdown</p>
    </div>
  );

  const sc = scoreColor(score.composite);
  const stores = storeR13(score.skuId);
  const maxR13 = Math.max(...stores.map((s) => s.r13), 1);

  return (
    <div className="ai-detail">
      <div className="ai-detail-header">
        <div className="ai-detail-title">
          <span className="ai-detail-sku-id">{score.skuId}</span>
          <span className="ai-detail-sku-name">{score.desc}</span>
        </div>
        <div className="ai-detail-tags">
          <span className="ai-dept-badge">{score.dept}</span>
          {score.tag && <span className="ai-tag-badge">{score.tag}</span>}
          {score.flags.map((f) => (
            <span key={f} className={`ai-flag-badge ai-flag-badge--${f}`}>{f}</span>
          ))}
        </div>
        <div className="ai-composite-score" style={{ background: sc.bg, color: sc.color }}>
          <span className="ai-comp-val">{score.composite}</span>
          <span className="ai-comp-lbl">Composite score</span>
        </div>
      </div>

      <div className="ai-section-label">Score breakdown</div>
      <div className="ai-score-breakdown">
        <ScoreBar label="R13 performance" value={score.r13Score} color="#059669" />
        <ScoreBar label="Like-item forecast" value={score.forecastScore} color="#2563eb" />
        <div className="ai-score-bar">
          <div className="ai-score-bar-head">
            <span className="ai-score-bar-label">Intel modifier</span>
            <span className="ai-score-bar-val" style={{ color: score.intelDelta >= 0 ? "#059669" : "#dc2626" }}>
              {score.intelDelta >= 0 ? "+" : ""}{score.intelDelta} pts
            </span>
          </div>
        </div>
      </div>

      {score.signals.length > 0 && (
        <>
          <div className="ai-section-label" style={{ marginTop: 16 }}>Contributing signals</div>
          {score.signals.map((sig) => (
            <div key={sig.id} className="ai-signal-row">
              <span className="ai-signal-type">{sig.type}</span>
              <span className="ai-signal-title">{sig.title}</span>
              <span className={`ai-signal-delta ${sig.direction === "threat" ? "neg" : "pos"}`}>
                {sig.direction === "threat" ? "↓" : "↑"} {Math.abs(INTEL_DELTAS[sig.type] || 0)}
              </span>
            </div>
          ))}
        </>
      )}

      <div className="ai-section-label" style={{ marginTop: 16 }}>R13 by store (top 12)</div>
      <div className="ai-store-bars">
        {stores.map((s) => (
          <div key={s.store} className="ai-store-bar-row">
            <span className="ai-store-bar-name">{s.store.replace("Floor & Decor ", "")}</span>
            <div className="ai-store-bar-track">
              <div
                className="ai-store-bar-fill"
                style={{
                  width: `${(s.r13 / maxR13) * 100}%`,
                  background: s.velocity === "A" ? "#059669" : s.velocity === "B" ? "#2563eb" : s.velocity === "C" ? "#d97706" : "#9ca3af",
                }}
              />
            </div>
            <span className="ai-store-bar-val">{s.r13 > 0 ? `$${s.r13}` : "—"}</span>
          </div>
        ))}
      </div>

      <div className="ai-detail-actions">
        <button className="ai-action-btn" onClick={() => onNavigate("catalogue")}>Open in Catalogue →</button>
        <button className="ai-action-btn ai-action-btn--ghost" onClick={() => onNavigate("forecast")}>View Forecast →</button>
      </div>
    </div>
  );
}

/* ── Main view ───────────────────────────────────────────────────────────── */
const DEPT_OPTS = ["All", "Wood", "Tile", "Laminate & Vinyl"];
const SIGNAL_TABS = ["All", "Forecast signals", "Intel signals", "R13 only"];

export default function AssortmentIntelligence({ onNavigate }) {
  const [deptFilter, setDeptFilter]     = useState("All");
  const [signalTab, setSignalTab]       = useState("All");
  const [selectedSkuId, setSelectedSkuId] = useState(null);

  const scores = useMemo(() => {
    return CATALOGUE_SKUS.map((c) => buildAIScore(c.id)).filter(Boolean);
  }, []);

  const filtered = useMemo(() => {
    return scores.filter((s) => {
      const deptOk = deptFilter === "All" || s.dept === deptFilter;
      const sigOk =
        signalTab === "All" ||
        (signalTab === "Intel signals" && s.signals.length > 0) ||
        (signalTab === "Forecast signals" && s.forecastScore > 65) ||
        (signalTab === "R13 only" && s.signals.length === 0);
      return deptOk && sigOk;
    });
  }, [scores, deptFilter, signalTab]);

  const selectedScore = scores.find((s) => s.skuId === selectedSkuId) || null;

  const colDefs = useMemo(() => [
    {
      field: "skuId", headerName: "SKU", width: 110,
      cellRenderer: ({ value, data }) => (
        <div className="ai-sku-cell">
          <div className="ai-sku-swatch" style={{
            background: data.dept === "Wood" ? "#c8a26e" : data.dept === "Tile" ? "#6e9ab4" : "#8fbc72",
          }} />
          <span>{value}</span>
        </div>
      ),
    },
    { field: "desc", headerName: "Description", flex: 1, minWidth: 160 },
    { field: "dept", headerName: "Dept", width: 120 },
    {
      field: "r13Score", headerName: "R13", width: 70,
      cellStyle: { fontWeight: 700, color: "#059669" },
    },
    {
      field: "forecastScore", headerName: "Forecast", width: 90,
      cellStyle: { fontWeight: 700, color: "#2563eb" },
    },
    {
      field: "intelDelta", headerName: "Intel Δ", width: 80,
      cellRenderer: ({ value }) => (
        <span style={{ fontWeight: 700, color: value >= 0 ? "#059669" : "#dc2626" }}>
          {value >= 0 ? "+" : ""}{value}
        </span>
      ),
    },
    {
      field: "composite", headerName: "Score", width: 80,
      cellRenderer: ({ value }) => {
        const sc = scoreColor(value);
        return (
          <span className="ai-comp-pill" style={{ background: sc.bg, color: sc.color }}>
            {value}
          </span>
        );
      },
      sort: "desc",
    },
  ], []);

  return (
    <div className="ai-root">
      <div className="ai-header">
        <div className="ai-header-left">
          <h1 className="ai-title">Assortment Intelligence</h1>
          <span className="ai-season-badge">SS 2026 · {scores.length} SKUs</span>
        </div>
        <div className="ai-header-right">
          <span className="ai-signal-count">{scores.filter((s) => s.signals.length > 0).length} SKUs with intel signals</span>
        </div>
      </div>

      <div className="ai-filters">
        <div className="ai-dept-tabs">
          {DEPT_OPTS.map((d) => (
            <button
              key={d}
              className={`ai-dept-tab ${deptFilter === d ? "active" : ""}`}
              onClick={() => setDeptFilter(d)}
            >
              {d}
            </button>
          ))}
        </div>
        <div className="ai-signal-tabs">
          {SIGNAL_TABS.map((t) => (
            <button
              key={t}
              className={`ai-signal-tab ${signalTab === t ? "active" : ""}`}
              onClick={() => setSignalTab(t)}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      <div className="ai-layout">
        <div className="ai-table-panel">
          <div className="ag-theme-alpine" style={{ height: 520, width: "100%" }}>
            <AgGridReact
              rowData={filtered}
              columnDefs={colDefs}
              defaultColDef={{ sortable: true, filter: true, resizable: true, floatingFilter: true }}
              rowSelection="single"
              onRowClicked={({ data }) => setSelectedSkuId(data.skuId)}
              getRowStyle={({ data }) => ({
                background: data.skuId === selectedSkuId ? "#edfaed" : undefined,
                cursor: "pointer",
              })}
              animateRows
            />
          </div>
        </div>
        <div className="ai-detail-panel">
          <DetailPanel score={selectedScore} onNavigate={onNavigate} />
        </div>
      </div>
    </div>
  );
}
