import React, { useMemo, useState } from "react";
import { Card, Badge, Button, ProgressBar } from "impact-ui";
import { Lock, ChevronRight, AlertTriangle, ChevronDown } from "lucide-react";
import Text from "../components/Text.jsx";
import Stack from "../components/Stack.jsx";
import SkuMedia from "../components/SkuMedia.jsx";
import { FD_STORES } from "../data/stores.js";
import { FD_SKUS } from "../data/skus.js";
import { FD_ASSORTMENT } from "../data/assortment.js";
import { FD_OTB_DEPTS, fmtCurrency } from "../data/otb.js";
import { getWpMetrics } from "../data/wpMetrics.js";
import { panelSx } from "../styles/panelSx.js";
import "./National.css";

const TOTAL_STORES = FD_STORES.length;
const DEPT_FILTERS = ["All", "Wood", "Tile", "Laminate & Vinyl"];
const METRICS_TABS = [
  { key: "full",    label: "Full range" },
  { key: "kept",    label: "Kept only"  },
  { key: "dropped", label: "Dropped"    },
];
const VEL_COLOR = { A: "success", B: "info", C: "warning", D: "error" };

function fmtSqft(n) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M sqft`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}k sqft`;
  return `${Math.round(n)} sqft`;
}
function fmtM(n) {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `$${(n / 1_000).toFixed(0)}k`;
  return `$${Math.round(n)}`;
}

/* ── WP Metrics panel (shared across curation views) ──────────────────────── */
export function WpMetricsPanel({ skuId }) {
  const wp = getWpMetrics(skuId);
  if (!wp) return null;
  const STATUS_COLOR = { New: "#059669", Carryover: "#2563EB", "Vendor SKU": "#D97706", Dropped: "#DC2626" };
  const fields = [
    { label: "Wp Start Week",       value: wp.wpStartWeek },
    { label: "Wp End Week",         value: wp.wpEndWeek },
    { label: "Wp Item Status",      value: wp.wpItemStatus, color: STATUS_COLOR[wp.wpItemStatus] },
    { label: "Wp Cost",             value: `$${wp.wpCost.toFixed(2)}` },
    { label: "Wp Retail",           value: `$${wp.wpRetail.toFixed(2)}` },
    { label: "Wp Receipt 1st Date", value: wp.wpReceiptFirstDate },
    { label: "Ly Sales U",          value: `${wp.lySalesU.toLocaleString()} sqft` },
    { label: "Ly Avg ROS U",        value: `${wp.lyAvgRosU} sqft/wk` },
    { label: "Wp On Order U",       value: `${wp.wpOnOrderU.toLocaleString()} sqft` },
    { label: "Wp On Order R",       value: wp.wpOnOrderR >= 1000 ? `$${(wp.wpOnOrderR / 1000).toFixed(1)}k` : `$${wp.wpOnOrderR}` },
  ];
  return (
    <div className="nat-wp-panel">
      {fields.map((f) => (
        <div key={f.label} className="nat-wp-cell">
          <span className="nat-wp-lbl">{f.label}</span>
          <span className="nat-wp-val" style={f.color ? { color: f.color, fontWeight: 700 } : undefined}>{f.value}</span>
        </div>
      ))}
    </div>
  );
}

export default function National({ onNavigate }) {
  const [deptFilter, setDeptFilter] = useState("All");
  const [metricsTab, setMetricsTab] = useState("full");
  const [natDecisions, setNatDecisions] = useState({});
  const [expandedRows, setExpandedRows] = useState(new Set());

  const toggleExpand = (id) =>
    setExpandedRows((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });

  /* Per-SKU stats aggregated from FD_ASSORTMENT */
  const skuStats = useMemo(() => {
    const map = {};
    FD_ASSORTMENT.forEach((row) => {
      if (!map[row.sku]) {
        map[row.sku] = { r13Sum: 0, onHandSum: 0, stores: new Set(), velocities: {} };
      }
      const s = map[row.sku];
      s.r13Sum += row.r13Sqft;
      s.onHandSum += row.onHand;
      s.stores.add(row.storeId);
      s.velocities[row.velocity] = (s.velocities[row.velocity] || 0) + 1;
    });
    const result = {};
    Object.entries(map).forEach(([sku, d]) => {
      const storeCount = d.stores.size;
      const avgR13 = storeCount > 0 ? Math.round(d.r13Sum / storeCount) : 0;
      const vel =
        Object.entries(d.velocities).sort((a, b) => b[1] - a[1])[0]?.[0] || "—";
      result[Number(sku)] = {
        avgR13,
        storeCount,
        carryPct: Math.round((storeCount / TOTAL_STORES) * 100),
        velocity: vel,
        r13Total: Math.round(d.r13Sum),
        onHand: Math.round(d.onHandSum),
      };
    });
    return result;
  }, []);

  /* Agent rec per SKU — deterministic based on carry % and R13 */
  const agentRecMap = useMemo(() => {
    const map = {};
    FD_SKUS.forEach((sku) => {
      const id = sku.sku;
      const isLocked = sku.tag === "Core" || sku.tag === "BG";
      const isDisc = sku.status === "Discontinued";
      const st = skuStats[id] || { avgR13: 0, carryPct: 0 };

      if (isLocked) {
        map[id] = { rec: "keep", reason: "Core/BG — mandatory", locked: true };
      } else if (isDisc) {
        map[id] = { rec: "drop", reason: "Discontinued", locked: false };
      } else if (st.carryPct >= 80 && st.avgR13 >= 100) {
        map[id] = {
          rec: "keep",
          reason: `National core — ${st.carryPct}% carry, R13 ${st.avgR13} sqft`,
          locked: false,
        };
      } else if (st.avgR13 > 0 && st.avgR13 < 20) {
        map[id] = {
          rec: "drop",
          reason: `Very low national R13 (${st.avgR13} sqft)`,
          locked: false,
        };
      } else if (st.carryPct > 0 && st.carryPct < 30 && st.avgR13 < 55) {
        map[id] = { rec: "drop", reason: "Low adoption + weak R13", locked: false };
      } else if (st.storeCount === 0) {
        map[id] = {
          rec: "add",
          reason: "Approved in Portfolio Build — add to national",
          locked: false,
        };
      } else {
        map[id] = {
          rec: null,
          reason: `Cluster decision — ${st.carryPct}% carry, R13 ${st.avgR13} sqft`,
          locked: false,
        };
      }
    });
    return map;
  }, [skuStats]);

  /* Toggle decision; same value clicked again clears the override */
  const decide = (id, value) =>
    setNatDecisions((prev) => {
      const next = { ...prev };
      if (next[id] === value) delete next[id];
      else next[id] = value;
      return next;
    });

  /* Effective decision: user override ?? agent rec ?? null */
  const effDec = (id) => natDecisions[id] ?? agentRecMap[id]?.rec ?? null;

  /* Filtered SKUs by dept */
  const filteredSkus = useMemo(
    () =>
      deptFilter === "All" ? FD_SKUS : FD_SKUS.filter((s) => s.dept === deptFilter),
    [deptFilter]
  );

  /* 5 hero stats */
  const heroStats = useMemo(() => {
    const hardLocked = filteredSkus.filter((s) => agentRecMap[s.sku]?.locked).length;
    const keepCount  = filteredSkus.filter((s) => effDec(s.sku) === "keep").length;
    const addCount   = filteredSkus.filter((s) => effDec(s.sku) === "add").length;
    const dropCount  = filteredSkus.filter((s) => effDec(s.sku) === "drop").length;
    const overridden = filteredSkus.filter((s) => {
      const ud = natDecisions[s.sku];
      const ar = agentRecMap[s.sku]?.rec;
      return ud && ar && ud !== ar;
    }).length;
    return [
      { label: "Hard locked",  val: hardLocked, color: "#6EEDB8" },
      { label: "Keep",         val: keepCount,  color: "#A3DDD6" },
      { label: "Add",          val: addCount,   color: "#93C5FD" },
      { label: "Drop → NPI",   val: dropCount,  color: "#FCA5A5" },
      { label: "Overridden",   val: overridden, color: "#FCD34D" },
    ];
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filteredSkus, natDecisions, agentRecMap]);

  /* OTB national total */
  const totalOTBBudget = Object.values(FD_OTB_DEPTS).reduce((s, v) => s + v, 0);
  const otbConsumed = useMemo(
    () =>
      filteredSkus
        .filter((s) => effDec(s.sku) === "keep" || effDec(s.sku) === "add")
        .reduce((sum, s) => {
          const st = skuStats[s.sku] || {};
          return sum + (st.storeCount || 0) * s.price * (st.avgR13 || 0);
        }, 0),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [filteredSkus, natDecisions]
  );

  /* Metrics strip data */
  const metricsData = useMemo(() => {
    let rows =
      deptFilter === "All"
        ? FD_ASSORTMENT
        : FD_ASSORTMENT.filter((r) => r.dept === deptFilter);
    if (metricsTab === "kept") {
      rows = rows.filter((r) => {
        const d = effDec(r.sku);
        return d === "keep" || d === "add";
      });
    } else if (metricsTab === "dropped") {
      rows = rows.filter((r) => effDec(r.sku) === "drop");
    }
    const salesR13   = rows.reduce((s, r) => s + r.r13Sqft * r.menuPrice, 0);
    const salesUnits = rows.reduce((s, r) => s + r.r13Sqft, 0);
    const totalOH    = rows.reduce((s, r) => s + r.onHand, 0);
    const stPct =
      salesUnits + totalOH > 0
        ? ((salesUnits / (salesUnits + totalOH)) * 100).toFixed(1)
        : "0.0";
    const gmDollars = salesR13 * 0.42;
    return [
      { label: "Sales $",     value: fmtM(salesR13),     sub: "R13 revenue",        color: "var(--color-success)",  bg: "var(--color-success-soft)" },
      { label: "Sales Units", value: fmtSqft(salesUnits), sub: "R13 sqft sold",     color: "var(--color-info)",     bg: "var(--color-info-soft)"    },
      { label: "Sell Thru",   value: `${stPct}%`,         sub: "Sold / (sold+OH)",  color: Number(stPct) >= 20 ? "var(--color-success)" : Number(stPct) >= 10 ? "var(--color-warning)" : "var(--color-error)", bg: "var(--color-surface-alt)" },
      { label: "GM $",        value: fmtM(gmDollars),     sub: "Gross margin $",    color: "var(--color-primary)",  bg: "var(--color-primary-soft)" },
      { label: "GM %",        value: "42%",               sub: "Per-SKU landed cost",color:"var(--color-teal, #0d9488)", bg: "var(--color-teal-soft, #f0fdfa)" },
      { label: "On Hand",     value: fmtSqft(totalOH),    sub: "Units in stock",    color: "var(--color-warning)",  bg: "var(--color-warning-soft)" },
    ];
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [deptFilter, metricsTab, natDecisions]);

  /* Unified SKU rows sorted: Add → Keep → null → Drop; within group by avgR13 desc */
  const sortedSkus = useMemo(() => {
    const order = { add: 0, keep: 1, drop: 3 };
    return [...filteredSkus].sort((a, b) => {
      const da = effDec(a.sku);
      const db = effDec(b.sku);
      const oa = da != null ? (order[da] ?? 2) : 2;
      const ob = db != null ? (order[db] ?? 2) : 2;
      if (oa !== ob) return oa - ob;
      return (skuStats[b.sku]?.avgR13 ?? 0) - (skuStats[a.sku]?.avgR13 ?? 0);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filteredSkus, natDecisions]);

  const totalCore = filteredSkus.filter(
    (s) => effDec(s.sku) === "keep" || effDec(s.sku) === "add"
  ).length;

  const otbPctVal =
    totalOTBBudget > 0 ? Math.round((otbConsumed / totalOTBBudget) * 100) : 0;

  return (
    <Stack direction="column" gap={4}>
      {/* ── 1. Dark premium hero header ─────────────────────────────────────── */}
      <div className="nat-hero">
        <div className="nat-hero-top">
          <div>
            <div className="nat-hero-overline">SS 2026 · Assortment Curation</div>
            <h1 className="nat-hero-title">National Core</h1>
            <p className="nat-hero-subtitle">
              Agent recommends Keep / Add / Drop per SKU · override only where needed ·
              decisions cascade to cluster &amp; store
            </p>
          </div>
          <div className="nat-dept-pills">
            {DEPT_FILTERS.map((d) => (
              <button
                key={d}
                type="button"
                className={`nat-dept-pill${deptFilter === d ? " active" : ""}`}
                onClick={() => setDeptFilter(d)}
              >
                {d}
              </button>
            ))}
          </div>
        </div>
        {/* 5-stat summary row */}
        <div className="nat-hero-stats">
          {heroStats.map((stat) => (
            <div key={stat.label} className="nat-hero-stat">
              <div className="nat-hero-stat-val" style={{ color: stat.color }}>
                {stat.val}
              </div>
              <div className="nat-hero-stat-lbl">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── 2. OTB national budget bar ───────────────────────────────────────── */}
      <Card sx={panelSx}>
        <Stack direction="column" gap={3}>
          <Stack direction="row" align="center" justify="space-between" wrap>
            <Stack direction="row" align="center" gap={2}>
              <Text variant="body-strong">OTB — National — all stores</Text>
              {otbPctVal > 100 && (
                <Badge variant="subtle" color="error" label="OVER BUDGET" />
              )}
              {otbPctVal > 85 && otbPctVal <= 100 && (
                <Badge variant="subtle" color="warning" label="Near limit" />
              )}
            </Stack>
            <Text variant="caption" tone="muted">
              {fmtM(otbConsumed)} of {fmtM(totalOTBBudget)}
            </Text>
          </Stack>
          <div className="nat-otb-bar-track">
            <div
              className="nat-otb-bar-fill"
              style={{
                width: `${Math.min(100, otbPctVal)}%`,
                background:
                  otbPctVal > 100
                    ? "var(--color-error)"
                    : otbPctVal > 85
                    ? "var(--color-warning)"
                    : "var(--color-success)",
              }}
            />
          </div>
          <Text variant="micro" tone="subtle">
            {otbPctVal}% of budget · {fmtM(totalOTBBudget - otbConsumed)} remaining
          </Text>
        </Stack>
      </Card>

      {/* ── 3. Metrics tabs + 6-KPI strip ───────────────────────────────────── */}
      <Card sx={panelSx}>
        <Stack direction="column" gap={3}>
          <Stack direction="row" align="center" justify="space-between" wrap>
            <div className="nat-metrics-tabs">
              {METRICS_TABS.map((t) => (
                <button
                  key={t.key}
                  type="button"
                  className={`nat-metrics-tab${metricsTab === t.key ? " active" : ""}`}
                  onClick={() => setMetricsTab(t.key)}
                >
                  {t.label}
                </button>
              ))}
            </div>
            <Text variant="micro" tone="subtle">
              National · {deptFilter}
            </Text>
          </Stack>
          <div className="nat-metrics-strip">
            {metricsData.map((k) => (
              <div
                key={k.label}
                className="nat-metric-card"
                style={{ background: k.bg }}
              >
                <div className="nat-metric-lbl">{k.label}</div>
                <div className="nat-metric-val" style={{ color: k.color }}>
                  {k.value}
                </div>
                <div className="nat-metric-sub">{k.sub}</div>
              </div>
            ))}
          </div>
        </Stack>
      </Card>

      {/* ── 4. Unified SKU decision table ───────────────────────────────────── */}
      <Card sx={{ ...panelSx, padding: 0, overflow: "hidden" }}>
        {/* Column headers */}
        <div className="nat-table-head">
          <div className="nat-col-sku">SKU / Description</div>
          <div className="nat-col-dept">Dept</div>
          <div className="nat-col-price">Price</div>
          <div className="nat-col-vel">Vel.</div>
          <div className="nat-col-r13">Avg R13</div>
          <div className="nat-col-stores">Stores</div>
          <div className="nat-col-agent">Agent Rec</div>
          <div className="nat-col-override">Override</div>
        </div>

        {/* Table body */}
        <div className="nat-table-body">
          {sortedSkus.map((sku) => {
            const id      = sku.sku;
            const dec     = effDec(id);
            const userDec = natDecisions[id];
            const agent   = agentRecMap[id] || { rec: null, reason: "", locked: false };
            const st      = skuStats[id] || {};
            const isNew   = !st.storeCount;
            const rowClass =
              dec === "keep"
                ? "nat-row-keep"
                : dec === "add"
                ? "nat-row-add"
                : dec === "drop"
                ? "nat-row-drop"
                : "";

            const isExpanded = expandedRows.has(id);
            return (
              <div key={id} className={`nat-table-row-wrap${isExpanded ? " expanded" : ""}`}>
              <div className={`nat-table-row ${rowClass}`}>
                {/* SKU / Description */}
                <div className="nat-col-sku">
                  <div style={{ display: "flex", alignItems: "flex-start", gap: 8, minWidth: 0 }}>
                    <SkuMedia sku={sku} size={36} disablePreview />
                    <div style={{ minWidth: 0, flex: 1 }}>
                      <div className="nat-sku-desc">{sku.desc}</div>
                      <div style={{ display: "flex", alignItems: "center", gap: 4, flexWrap: "wrap", marginTop: 2 }}>
                        <span className="nat-sku-id">{id}</span>
                        {agent.locked && (
                          <Badge variant="subtle" size="small" color="success" label={sku.tag} />
                        )}
                        {sku.status === "Discontinued" && (
                          <Badge variant="subtle" size="small" color="error" label="Disc." />
                        )}
                        {isNew && (
                          <Badge variant="subtle" size="small" color="info" label="New SKU" />
                        )}
                        {userDec && agent.rec && userDec !== agent.rec && (
                          <Badge variant="subtle" size="small" color="warning" label="Overridden" />
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Dept */}
                <div className="nat-col-dept">
                  <Badge variant="subtle" size="small" color="default" label={sku.dept} />
                </div>

                {/* Price */}
                <div className="nat-col-price">
                  <span className="nat-mono">${sku.price.toFixed(2)}</span>
                </div>

                {/* Velocity */}
                <div className="nat-col-vel">
                  {st.velocity && st.velocity !== "—" ? (
                    <Badge
                      variant="subtle"
                      size="small"
                      color={VEL_COLOR[st.velocity] || "default"}
                      label={st.velocity}
                    />
                  ) : (
                    <span className="nat-muted">—</span>
                  )}
                </div>

                {/* Avg R13 */}
                <div className="nat-col-r13">
                  <span
                    className="nat-r13-val"
                    style={{
                      color:
                        (st.avgR13 || 0) >= 100
                          ? "var(--color-success)"
                          : (st.avgR13 || 0) <= 20
                          ? "var(--color-error)"
                          : "var(--color-text)",
                      fontWeight: (st.avgR13 || 0) >= 100 ? 700 : 400,
                    }}
                  >
                    {st.avgR13 || 0} sqft
                  </span>
                </div>

                {/* Stores */}
                <div className="nat-col-stores">
                  <span className="nat-stores-val">
                    {st.storeCount || 0}/{TOTAL_STORES}
                  </span>
                </div>

                {/* Agent Rec */}
                <div className="nat-col-agent">
                  <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
                    {agent.rec ? (
                      <Badge
                        variant="subtle"
                        size="small"
                        color={
                          agent.rec === "keep"
                            ? "success"
                            : agent.rec === "add"
                            ? "info"
                            : "error"
                        }
                        label={
                          agent.rec === "keep"
                            ? "✓ Keep"
                            : agent.rec === "add"
                            ? "+ Add"
                            : "− Drop"
                        }
                      />
                    ) : (
                      <Badge variant="subtle" size="small" color="default" label="— Cluster" />
                    )}
                    <span className="nat-agent-reason">{agent.reason}</span>
                  </div>
                </div>

                {/* Override */}
                <div className="nat-col-override">
                  {agent.locked ? (
                    <span className="nat-mandatory">Mandatory</span>
                  ) : (
                    <div style={{ display: "flex", gap: 4 }}>
                      <button
                        type="button"
                        className={`nat-dec-btn nat-dec-keep${userDec === "keep" ? " active" : ""}`}
                        onClick={() => decide(id, "keep")}
                      >
                        Keep
                      </button>
                      <button
                        type="button"
                        className={`nat-dec-btn nat-dec-add${userDec === "add" ? " active" : ""}`}
                        onClick={() => decide(id, "add")}
                      >
                        Add
                      </button>
                      <button
                        type="button"
                        className={`nat-dec-btn nat-dec-drop${userDec === "drop" ? " active" : ""}`}
                        onClick={() => decide(id, "drop")}
                      >
                        Drop
                      </button>
                    </div>
                  )}
                  <button
                    type="button"
                    className={`nat-wp-toggle${isExpanded ? " open" : ""}`}
                    title="Working Plan metrics"
                    onClick={() => toggleExpand(id)}
                  >
                    <ChevronDown size={13} />
                  </button>
                </div>
              </div>
              {isExpanded && <WpMetricsPanel skuId={id} />}
              </div>
            );
          })}
        </div>
      </Card>

      {/* ── 5. Lock-status footer ───────────────────────────────────────────── */}
      <Card
        sx={{
          ...panelSx,
          background: "var(--color-success-soft)",
          border: "1.5px solid var(--color-success)",
        }}
      >
        <Stack direction="row" align="center" gap={3} wrap>
          <Lock
            size={18}
            color="var(--color-success)"
            strokeWidth={1.75}
            style={{ flexShrink: 0 }}
          />
          <Stack direction="column" gap={1} flex="1 1 auto" style={{ minWidth: 0 }}>
            <Text variant="body-strong" tone="success">
              {totalCore} SKUs will be locked as National Core
            </Text>
            <Text variant="caption" tone="muted">
              These appear pre-filled and locked in Regional Review and Store Curation.
              They cannot be removed by regional managers or store teams.
            </Text>
          </Stack>
          <Button
            variant="primary"
            size="medium"
            onClick={() => onNavigate && onNavigate("regional")}
            style={{ flexShrink: 0 }}
          >
            Advance to Regional Review{" "}
            <ChevronRight size={14} style={{ marginLeft: 4 }} />
          </Button>
        </Stack>
      </Card>
    </Stack>
  );
}
