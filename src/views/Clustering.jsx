/**
 * Clustering.jsx — Location Clustering module
 * Impact UI design-system aligned. Matches HTML v9-7 flow exactly.
 */
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Card, Button, Badge, Chips } from "impact-ui";
import { AlertTriangle, CheckCircle2, MapPin, BarChart2, Tag, Cpu } from "lucide-react";
import Text from "../components/Text.jsx";
import StepIndicator from "../components/StepIndicator.jsx";
import Stack from "../components/Stack.jsx";
import Grid from "../components/Grid.jsx";
import { color } from "../styles/tokens.js";
import {
  FD_CLUST_SCENARIOS, FD_OUTLIER_STORES, OUTLIER_OPTIONS,
  STORE_COUNT, TIER_BADGE, VEL_COLOR, BAND_PCT,
  clusterStores, scenarioTagline,
  ACTIVE_CLUSTER_SET, CLUSTER_RUNS,
  WIZARD_DEFAULTS,
  SCENARIO_CARDS, AGENT_RECOMMENDATION, RUN_AGENT_STEPS, COLOR_SWATCHES,
  PREVIEW_CLUSTER_STORES, NETWORK_AVERAGES, VEL_SCORE_LABEL,
} from "../data/clustering.js";
import { panelSx, softSx } from "../styles/panelSx.js";
import "./Clustering.css";

// ─── micro helpers ────────────────────────────────────────────────────────────
const cap = (s) => s ? s.charAt(0).toUpperCase() + s.slice(1) : "";
const VEL_BADGE  = { A: "success", B: "info", C: "warning", D: "error" };
const TIER_COLOR = { high: color.success, mid: color.warning, low: color.error };

// ─────────────────────────────────────────────────────────────────────────────
// SHARED ATOMS
// ─────────────────────────────────────────────────────────────────────────────
function DistBar({ clusters }) {
  const total = clusters.reduce((s, c) => s + (Array.isArray(c.stores) ? c.stores.length : (c.stores || 0)), 0);
  if (!total) return null;
  return (
    <div className="cr-dist-bar" style={{ flex: 1, minWidth: 80 }}>
      {clusters.map((c) => {
        const n = Array.isArray(c.stores) ? c.stores.length : (c.stores || 0);
        return (
          <div key={c.id} className="cr-dist-seg"
            style={{ flex: n / total, background: c.color }}
            title={`${c.label ?? c.name}: ${n} stores`} />
        );
      })}
    </div>
  );
}

function CohesionBar({ value }) {
  const c = value >= 0.8 ? color.success : value >= 0.7 ? color.warning : color.error;
  return (
    <div className="cr-cohesion-wrap">
      <div className="cr-cohesion-track">
        <div className="cr-cohesion-fill" style={{ width: `${value * 100}%`, background: c }} />
      </div>
      <span className="cr-cohesion-val" style={{ color: c }}>{value.toFixed(2)}</span>
    </div>
  );
}

function VelBadge({ vel }) {
  return <Badge variant="subtle" size="small" color={VEL_BADGE[vel] || "neutral"} label={vel} />;
}

function TierBadge({ tier }) {
  return <Badge variant="subtle" size="small" color={TIER_BADGE[tier] || "info"} label={cap(tier)} />;
}

// ─────────────────────────────────────────────────────────────────────────────
// CLUSTER RUNS DASHBOARD
// ─────────────────────────────────────────────────────────────────────────────
function ClusterRunsDashboard({ onNew }) {
  const { clusters } = ACTIVE_CLUSTER_SET;
  const totalStores  = clusters.reduce((s, c) => s + c.stores, 0);
  const avgCohesion  = (clusters.reduce((s, c) => s + c.cohesion, 0) / clusters.length).toFixed(2);

  return (
    <Stack direction="column" gap={4}>
      {/* KPI strip */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 12 }}>
        {[
          { label: "Active clusters",  value: clusters.length,  sub: "k-means · live",                          accent: color.primary },
          { label: "Stores covered",   value: totalStores,      sub: `${totalStores} / ${STORE_COUNT} total`,    accent: color.teal    },
          { label: "Avg cohesion",     value: avgCohesion,      sub: Number(avgCohesion) >= 0.8 ? "Excellent" : "Good",  accent: Number(avgCohesion) >= 0.8 ? color.success : color.warning },
          { label: "Next re-run",      value: "Apr 12",         sub: "quarterly cycle",                          accent: color.info    },
        ].map((k) => (
          <Card key={k.label} sx={panelSx}>
            <Stack direction="column" gap={2}>
              <Text variant="micro" tone="subtle" style={{ fontWeight: 700, textTransform: "uppercase", letterSpacing: ".06em" }}>{k.label}</Text>
              <div style={{ fontSize: 28, fontWeight: 800, color: k.accent, lineHeight: 1, letterSpacing: "-.5px" }}>{k.value}</div>
              <Text variant="micro" tone="muted">{k.sub}</Text>
            </Stack>
          </Card>
        ))}
      </div>

      {/* Active cluster set */}
      <Card sx={{ ...panelSx, padding: 0 }}>
        <div style={{ padding: "16px 20px", background: "var(--color-surface-alt)", borderBottom: "1px solid var(--color-border)", display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
          <div style={{ flex: "1 1 auto", minWidth: 0 }}>
            <Stack direction="row" align="center" gap={2}>
              <Text variant="body-strong" tone="strong">{ACTIVE_CLUSTER_SET.runId}</Text>
              <span className="cr-status-live">Live</span>
            </Stack>
            <Text variant="micro" tone="muted" style={{ marginTop: 2 }}>
              {ACTIVE_CLUSTER_SET.method} · {ACTIVE_CLUSTER_SET.attrNames.length} attributes · {ACTIVE_CLUSTER_SET.date} · {ACTIVE_CLUSTER_SET.author}
            </Text>
          </div>
          <Stack direction="row" align="center" gap={3}>
            <DistBar clusters={clusters} />
            <Button variant="primary" size="small" onClick={onNew}>+ New cluster run</Button>
          </Stack>
        </div>

        <div style={{ overflowX: "auto" }}>
          <table className="cr-table" style={{ width: "100%", minWidth: 560 }}>
            <thead>
              <tr>
                <th>Cluster</th><th>Stores</th><th>Pro avg</th>
                <th>Cohesion</th><th>Top categories</th><th>SKUs</th>
              </tr>
            </thead>
            <tbody>
              {clusters.map((c) => (
                <tr key={c.id}>
                  <td>
                    <Stack direction="row" align="center" gap={2}>
                      <div style={{ width: 10, height: 10, borderRadius: "50%", background: c.color, flexShrink: 0, boxShadow: `0 0 0 3px ${c.color}22` }} />
                      <Text variant="caption" tone="strong" style={{ fontWeight: 600 }}>{c.name}</Text>
                    </Stack>
                  </td>
                  <td><Text variant="caption" mono style={{ fontWeight: 700 }}>{c.stores}</Text></td>
                  <td>
                    <Stack direction="row" align="center" gap={2}>
                      <Text variant="caption" style={{ fontWeight: 600 }}>{c.proAvg}%</Text>
                      <div style={{ width: 48, height: 4, background: "var(--color-surface-sunken)", borderRadius: 2, overflow: "hidden" }}>
                        <div style={{ height: "100%", width: `${c.proAvg}%`, background: color.primary, borderRadius: 2 }} />
                      </div>
                    </Stack>
                  </td>
                  <td style={{ minWidth: 140 }}><CohesionBar value={c.cohesion} /></td>
                  <td>
                    <Stack direction="row" gap={1} wrap>
                      {c.dominantCats.map((cat) => <span key={cat} className="cr-cat-pill">{cat}</span>)}
                    </Stack>
                  </td>
                  <td><Text variant="caption" mono tone="muted">{c.skus.toLocaleString()}</Text></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Run history */}
      <Card sx={{ ...panelSx, padding: 0 }}>
        <div style={{ padding: "14px 20px", background: "var(--color-surface-alt)", borderBottom: "1px solid var(--color-border)" }}>
          <Text variant="body-strong" tone="strong">Run history</Text>
        </div>
        <div style={{ overflowX: "auto" }}>
          <table className="cr-table" style={{ width: "100%", minWidth: 520 }}>
            <thead>
              <tr><th>Run ID</th><th>Method</th><th>Cohesion</th><th>Date</th><th>Author</th><th>Status</th><th></th></tr>
            </thead>
            <tbody>
              {CLUSTER_RUNS.map((run) => (
                <tr key={run.id}>
                  <td>
                    <Stack direction="column" gap={0.5}>
                      <span className="cr-run-id">{run.id}</span>
                      <Text variant="micro" tone="muted">{run.name}</Text>
                    </Stack>
                  </td>
                  <td><Text variant="caption" tone="muted">{run.method}</Text></td>
                  <td style={{ minWidth: 130 }}><CohesionBar value={run.cohesion} /></td>
                  <td><Text variant="caption" tone="muted">{run.date}</Text></td>
                  <td><Text variant="caption" tone="muted">{run.author}</Text></td>
                  <td>
                    {run.status === "live"
                      ? <span className="cr-status-live">Live</span>
                      : <span className="cr-status-archived">Archived</span>}
                  </td>
                  <td><Button variant="secondary" size="small">Open</Button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </Stack>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// WIZARD STEP 0 — DEFINE SCOPE
// ─────────────────────────────────────────────────────────────────────────────
const DEPT_OPTS    = ["All", "Wood", "Tile", "Laminate & Vinyl"];
const CHANNEL_OPTS = ["All Stores", "Brick & Mortar", "Online"];
const SEASON_OPTS  = ["SS25", "FW25", "SS26", "FW26", "SS27"];
const OPT_PARAMS   = [
  { key: "performance",  icon: <BarChart2 size={18} />, label: "Performance",        desc: "R13 sqft/wk · Sell-through · Velocity band · On-hand turnover" },
  { key: "demographics", icon: <MapPin    size={18} />, label: "Demographics",       desc: "Market population · Median income · Housing starts · Store maturity" },
  { key: "attributes",   icon: <Tag       size={18} />, label: "Product attributes", desc: "Top sub-depts · Price tier mix · Format penetration · Category spread" },
];

function RadioRow({ label, checked, onClick }) {
  return (
    <div onClick={onClick} className={`cl-radio-row${checked ? " is-on" : ""}`}>
      <div className={`cl-radio-dot${checked ? " is-on" : ""}`}>
        {checked && <div className="cl-radio-inner" />}
      </div>
      <span className="cl-radio-label">{label}</span>
    </div>
  );
}

function StepScope({ draft, setDraft, onRun }) {
  const update     = (k, v) => setDraft((d) => ({ ...d, [k]: v }));
  const toggleParam = (k)  => setDraft((d) => ({ ...d, params: { ...d.params, [k]: !d.params[k] } }));
  const activeParams = Object.keys(draft.params).filter((k) => draft.params[k]);

  const bullets = [
    `Analyse ${STORE_COUNT} store profiles across ${draft.dept} for ${draft.season}`,
    activeParams.length > 0 ? `Using signals: ${activeParams.join(", ")} · performance data` : "Using store transaction profiles (add optional parameters for richer segmentation)",
    "Generate clustering scenarios based on what best separates store behaviour",
    "Recommend the scenario that produces the most actionable assortment groupings",
  ];
  const bulletIcons = ["📊", "⚙", "⬡", "✅"];

  return (
    <div style={{ flex: 1, overflowY: "auto", background: "var(--color-bg)", padding: "28px 24px" }}>
      <div style={{ maxWidth: 740, margin: "0 auto", display: "flex", flexDirection: "column", gap: 16 }}>

        {/* Scope */}
        <Card sx={{ ...panelSx, padding: 0 }}>
          <div style={{ padding: "14px 20px", borderBottom: "1px solid var(--color-border)" }}>
            <Text variant="body-strong" tone="strong">Clustering scope</Text>
            <Text variant="micro" tone="subtle" style={{ marginTop: 2 }}>Select the department, channel, and season you want to cluster for</Text>
          </div>
          <div style={{ padding: 20, display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 24 }}>
            {[
              { label: "Department", opts: DEPT_OPTS, val: draft.dept, key: "dept" },
              { label: "Channel",    opts: CHANNEL_OPTS, val: draft.channel, key: "channel" },
              { label: "Season",     opts: SEASON_OPTS, val: draft.season, key: "season" },
            ].map((col) => (
              <div key={col.key}>
                <Text variant="micro" tone="subtle" style={{ fontWeight: 700, textTransform: "uppercase", letterSpacing: ".06em", marginBottom: 10, display: "block" }}>{col.label}</Text>
                {col.opts.map((o) => <RadioRow key={o} label={o} checked={col.val === o} onClick={() => update(col.key, o)} />)}
              </div>
            ))}
          </div>
        </Card>

        {/* Optional parameters */}
        <Card sx={{ ...panelSx, padding: 0 }}>
          <div style={{ padding: "14px 20px", borderBottom: "1px solid var(--color-border)" }}>
            <Text variant="body-strong" tone="strong">Optional parameters</Text>
            <Text variant="micro" tone="subtle" style={{ marginTop: 2 }}>Additional signals fed to the clustering agent — more signals = richer scenarios</Text>
          </div>
          <div style={{ padding: 16, display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
            {OPT_PARAMS.map((p) => {
              const on = draft.params[p.key];
              return (
                <div key={p.key} onClick={() => toggleParam(p.key)} className={`cl-param-card${on ? " is-on" : ""}`}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
                    <span style={{ color: on ? color.primary : color.textMuted }}>{p.icon}</span>
                    <div className={`cl-param-check${on ? " is-on" : ""}`}>
                      {on && <span>✓</span>}
                    </div>
                  </div>
                  <Text variant="caption" style={{ fontWeight: 700, color: on ? color.primary : "var(--color-text)", marginBottom: 4, display: "block" }}>{p.label}</Text>
                  <Text variant="micro" tone="subtle" style={{ lineHeight: 1.5 }}>{p.desc}</Text>
                </div>
              );
            })}
          </div>
        </Card>

        {/* What the agent will do */}
        <div className="cl-agent-card">
          <div className="cl-agent-card-header">
            <Cpu size={16} color="var(--color-primary-soft)" />
            <Text variant="caption" style={{ color: "var(--color-primary-soft)", fontWeight: 700 }}>What the agent will do</Text>
          </div>
          {bullets.map((b, i) => (
            <div key={i} className="cl-agent-card-row">
              <span style={{ fontSize: 13, flexShrink: 0 }}>{bulletIcons[i]}</span>
              <Text variant="micro" style={{ color: "#93C5FD", lineHeight: 1.5 }}>{b}</Text>
            </div>
          ))}
        </div>

        <div style={{ display: "flex", justifyContent: "flex-end" }}>
          <Button variant="primary" size="large" onClick={onRun}>
            Run Location Clustering Agent →
          </Button>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// WIZARD STEP 1 — RUN AGENT
// ─────────────────────────────────────────────────────────────────────────────
function StepRunAgent({ draft, runStep }) {
  const activeParams = Object.keys(draft.params).filter((k) => draft.params[k]);
  const ctx = { dept: draft.dept, channel: draft.channel, season: draft.season, storeCount: STORE_COUNT, activeParams };
  const pct = Math.round((runStep / RUN_AGENT_STEPS.length) * 100);

  return (
    <div style={{ flex: 1, overflowY: "auto", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--color-bg)", padding: 40 }}>
      <div style={{ maxWidth: 500, width: "100%" }}>
        {/* Agent avatar */}
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div className="cl-agent-avatar">
            <Cpu size={28} color={color.primary} />
          </div>
          <Text variant="title" tone="strong" style={{ marginTop: 16, marginBottom: 6 }}>Clustering agent running…</Text>
          <Text variant="caption" tone="muted">
            {STORE_COUNT} stores · {draft.dept} · {draft.channel} · {draft.season}
          </Text>
        </div>

        {/* Step list */}
        <Card sx={{ ...panelSx, padding: 0 }}>
          {RUN_AGENT_STEPS.map((step, i) => {
            const done    = i < runStep;
            const running = i === runStep;
            return (
              <div key={step.id} className={`cl-run-step${done ? " is-done" : running ? " is-running" : " is-queued"}`}>
                <div className="cl-run-step-ico">
                  {done    ? <CheckCircle2 size={14} color={color.success} />
                    : running ? <div className="cl-run-spinner" />
                    : <span style={{ fontSize: 13 }}>{step.icon}</span>}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <Text variant="caption" tone={done ? "success" : running ? "strong" : "subtle"} style={{ fontWeight: running ? 700 : done ? 600 : 400 }}>
                    {step.label}
                  </Text>
                  {(done || running) && (
                    <Text variant="micro" tone="muted" style={{ display: "block", marginTop: 1 }}>
                      {step.desc(ctx)}{running && <span className="cr-agent-dots" />}
                    </Text>
                  )}
                </div>
                {running && <div className="cl-run-pulse" />}
              </div>
            );
          })}
        </Card>

        {/* Progress bar */}
        <div style={{ marginTop: 16 }}>
          <div style={{ height: 4, background: "var(--color-border)", borderRadius: 4, overflow: "hidden" }}>
            <div style={{ height: "100%", width: `${pct}%`, background: `linear-gradient(90deg, ${color.primary}, ${color.teal})`, borderRadius: 4, transition: "width .4s" }} />
          </div>
          <Text variant="micro" tone="subtle" style={{ textAlign: "center", display: "block", marginTop: 6 }}>{pct}% complete</Text>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// WIZARD STEP 2 — REVIEW & ACCEPT
// ─────────────────────────────────────────────────────────────────────────────

/* Attribute bar (Scenario C) */
function AttrBar({ title, items, accentColor }) {
  return (
    <Card sx={{ ...panelSx, padding: "14px 16px" }}>
      <Text variant="micro" tone="subtle" style={{ fontWeight: 700, textTransform: "uppercase", letterSpacing: ".06em", marginBottom: 12, display: "block" }}>{title}</Text>
      {(items || []).map((item, idx) => (
        <div key={item.k} style={{ marginBottom: 8 }}>
          <Stack direction="row" justify="space-between" align="center" style={{ marginBottom: 3 }}>
            <Text variant="micro" style={{ fontWeight: idx === 0 ? 700 : 400, color: "var(--color-text)" }}>{item.k}</Text>
            <Text variant="micro" mono style={{ fontWeight: idx === 0 ? 700 : 400, color: idx === 0 ? accentColor : "var(--color-text-muted)" }}>{item.pct}%</Text>
          </Stack>
          <div style={{ height: 5, background: "var(--color-surface-sunken)", borderRadius: 3, overflow: "hidden" }}>
            <div style={{ height: "100%", width: `${Math.min(item.pct, 100)}%`, background: idx === 0 ? accentColor : "var(--color-border)", borderRadius: 3, transition: "width .5s" }} />
          </div>
        </div>
      ))}
    </Card>
  );
}

/* Right panel: single cluster drill-in */
function ClusterDrillIn({ scenario, cluster, onBack, onAccept, onNavigate }) {
  const stores = scenario !== "C" ? clusterStores(cluster) : [];
  const ap     = cluster.attrProfile || { colors: [], finishes: [], prices: [], formats: [], species: [] };

  return (
    <div style={{ flex: 1, overflowY: "auto", padding: "20px 24px" }}>
      {/* Cluster breadcrumb header */}
      <div className="cl-cluster-drillhead">
        <div style={{ width: 16, height: 16, borderRadius: "50%", background: cluster.color, flexShrink: 0, boxShadow: `0 0 0 4px ${cluster.color}22` }} />
        <div style={{ flex: 1 }}>
          <Text variant="heading" tone="strong">{cluster.label}</Text>
          <Text variant="micro" tone="muted" style={{ marginTop: 1 }}>
            {Array.isArray(cluster.stores) ? cluster.stores.length : cluster.stores} stores &nbsp;·&nbsp; ${cluster.revSqft}/sqft avg &nbsp;·&nbsp; {cluster.st}% sell-through
          </Text>
        </div>
        <TierBadge tier={cluster.tier} />
        <Button variant="secondary" size="small" onClick={onBack}>← All clusters</Button>
      </div>

      {/* Signal chips */}
      {cluster.signals && (
        <Stack direction="row" gap={2} wrap style={{ marginBottom: 16 }}>
          {cluster.signals.map((sig) => <Badge key={sig} variant="subtle" size="small" color="success" label={sig} />)}
        </Stack>
      )}

      {scenario === "C" && ap.colors.length > 0 ? (
        /* ── Scenario C: attribute profile ─────────────────────────────────── */
        <div>
          {cluster.description && (
            <Card sx={{ ...softSx, borderLeft: `3px solid ${color.info}`, marginBottom: 14 }}>
              <Text variant="caption" style={{ color: color.info, lineHeight: 1.6 }}>{cluster.description}</Text>
            </Card>
          )}

          {/* Color palette */}
          <Card sx={{ ...panelSx, padding: "14px 16px", marginBottom: 14 }}>
            <Text variant="micro" tone="subtle" style={{ fontWeight: 700, textTransform: "uppercase", letterSpacing: ".06em", marginBottom: 12, display: "block" }}>Color palette — R13 sqft share</Text>
            <Stack direction="row" wrap gap={2} style={{ marginBottom: 12 }}>
              {ap.colors.map((c) => (
                <div key={c.k} className="cl-color-chip">
                  <div style={{ width: 18, height: 18, borderRadius: "50%", background: COLOR_SWATCHES[c.k] || "#CCC", border: "1.5px solid rgba(0,0,0,.08)", flexShrink: 0 }} />
                  <div>
                    <div style={{ fontSize: 10, fontWeight: 600, lineHeight: 1.2 }}>{c.k}</div>
                    <div style={{ fontSize: 9, color: "var(--color-text-muted)" }}>{c.pct}%</div>
                  </div>
                </div>
              ))}
            </Stack>
            <div style={{ height: 10, borderRadius: 6, overflow: "hidden", display: "flex" }}>
              {ap.colors.map((c) => (
                <div key={c.k} style={{ width: `${c.pct}%`, background: COLOR_SWATCHES[c.k] || "#CCC", borderRight: "1px solid rgba(255,255,255,.4)" }} title={`${c.k} ${c.pct}%`} />
              ))}
            </div>
          </Card>

          {/* 2×2 attribute charts */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 }}>
            <AttrBar title="Finish"             items={ap.finishes} accentColor={cluster.color} />
            <AttrBar title="Price tier"         items={ap.prices}   accentColor={color.primary} />
            <AttrBar title="Format / sub-class" items={ap.formats}  accentColor={color.teal}    />
            <AttrBar title="Species / look"     items={ap.species}  accentColor={color.accent}  />
          </div>

          {/* Per-store fingerprint */}
          {(cluster.storeDetails || []).length > 0 && (
            <Card sx={{ ...panelSx, padding: 0 }}>
              <div style={{ padding: "10px 16px", borderBottom: "1px solid var(--color-border)", background: "var(--color-surface-alt)" }}>
                <Text variant="caption" tone="strong" style={{ fontWeight: 700 }}>Store breakdown — attribute fingerprint</Text>
              </div>
              <div className="cl-fp-head">
                {["Store", "Name", "Top Color", "Finish", "Price Band", "Vel.", "Action"].map((h) => (
                  <Text key={h} variant="micro" tone="subtle" style={{ fontWeight: 700, textTransform: "uppercase", letterSpacing: ".05em" }}>{h}</Text>
                ))}
              </div>
              {cluster.storeDetails.map((pd, i) => (
                <div key={pd.storeId} className={`cl-fp-row${i % 2 ? "" : " alt"}`}>
                  <Text variant="micro" mono style={{ fontWeight: 700, color: color.teal }}>{pd.storeId}</Text>
                  <Text variant="micro" style={{ fontWeight: 500 }}>{pd.storeName}</Text>
                  <Stack direction="row" align="center" gap={1}>
                    <div style={{ width: 10, height: 10, borderRadius: "50%", background: COLOR_SWATCHES[pd.dominantColor] || "#CCC", border: "1px solid rgba(0,0,0,.08)", flexShrink: 0 }} />
                    <Text variant="micro">{pd.dominantColor}</Text>
                  </Stack>
                  <Text variant="micro" tone="muted">{pd.dominantFinish}</Text>
                  <Text variant="micro" tone="muted" style={{ fontSize: 9 }}>{pd.dominantPrice}</Text>
                  <VelBadge vel={pd.velocity} />
                  <button className="cl-curate-btn" onClick={() => onNavigate?.("store-curation")}>Curate →</button>
                </div>
              ))}
            </Card>
          )}
        </div>
      ) : (
        /* ── Scenarios A & B: store table ──────────────────────────────────── */
        <Card sx={{ ...panelSx, padding: 0 }}>
          <div className="cl-store-head">
            {["Store #", "Store Name", "Region", "Market", "St", "DC", "Vel.", "Band %", ""].map((h) => (
              <Text key={h} variant="micro" tone="subtle" style={{ fontWeight: 700, textTransform: "uppercase", letterSpacing: ".05em" }}>{h}</Text>
            ))}
          </div>
          {stores.map((s, i) => (
            <div key={s.id} className={`cl-store-row${i % 2 ? "" : " alt"}`}>
              <Text variant="micro" mono style={{ fontWeight: 700, color: color.teal }}>{s.id}</Text>
              <Text variant="micro" style={{ fontWeight: 500 }}>{s.name}</Text>
              <Text variant="micro" tone="muted">{s.region}</Text>
              <Text variant="micro" tone="muted">{s.market}</Text>
              <Text variant="micro" mono tone="muted">{s.state}</Text>
              <Text variant="micro" mono tone="muted">{s.dc}</Text>
              <VelBadge vel={s.velocity} />
              <Text variant="micro" mono tone="muted">{BAND_PCT[s.velocity] || "—"}</Text>
              <button className="cl-curate-btn" onClick={() => onNavigate?.("store-curation")}>Curate →</button>
            </div>
          ))}
        </Card>
      )}

      {/* Accept */}
      <div className="cl-accept-bar">
        <Text variant="caption" tone="muted" style={{ flex: 1 }}>Accept this scenario to use it as the active model for assortment curation</Text>
        <Button variant="primary" size="medium" onClick={onAccept}>✓ Accept Scenario</Button>
      </div>
    </div>
  );
}

/* Right panel: cluster overview (all clusters) */
function ClusterOverview({ scenario, sc, onSelectCluster, onAccept, onNavigate }) {
  return (
    <div style={{ flex: 1, overflowY: "auto", padding: "20px 24px" }}>
      {scenario === "C" ? (
        (sc?.clusters || []).map((cl) => {
          const ap = cl.attrProfile || { colors: [], finishes: [], prices: [], formats: [] };
          return (
            <Card key={cl.id} sx={{ ...panelSx, padding: 0, marginBottom: 14, cursor: "pointer", transition: "box-shadow .15s, transform .15s" }}
              onClick={() => onSelectCluster(cl.id)}
              onMouseOver={(e) => { e.currentTarget.style.boxShadow = `0 4px 24px rgba(0,0,0,.10), 0 0 0 2px ${cl.color}`; e.currentTarget.style.transform = "translateY(-1px)"; }}
              onMouseOut={(e)  => { e.currentTarget.style.boxShadow = "var(--sh)"; e.currentTarget.style.transform = ""; }}>
              {/* Color accent bar */}
              <div style={{ height: 3, background: cl.color, borderRadius: "var(--r) var(--r) 0 0" }} />
              <div style={{ padding: "12px 16px", borderBottom: "1px solid var(--color-border)", display: "flex", alignItems: "center", gap: 10, background: "var(--color-surface-alt)" }}>
                <div style={{ width: 12, height: 12, borderRadius: "50%", background: cl.color, flexShrink: 0 }} />
                <div style={{ flex: 1 }}>
                  <Text variant="caption" tone="strong" style={{ fontWeight: 700 }}>{cl.label}</Text>
                  <Text variant="micro" tone="muted" style={{ marginTop: 1 }}>
                    {Array.isArray(cl.stores) ? cl.stores.length : cl.stores} stores · ${cl.revSqft}/sqft avg · {cl.st}% ST
                  </Text>
                </div>
                <TierBadge tier={cl.tier} />
              </div>
              {cl.description && (
                <div style={{ padding: "8px 16px", borderBottom: "1px solid var(--color-border)" }}>
                  <Text variant="micro" tone="muted" style={{ lineHeight: 1.5 }}>{cl.description}</Text>
                </div>
              )}
              <div style={{ padding: "12px 16px", display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 16 }}>
                {/* Colors */}
                <div>
                  <Text variant="micro" tone="subtle" style={{ fontWeight: 700, textTransform: "uppercase", letterSpacing: ".05em", marginBottom: 8, display: "block" }}>Top colors</Text>
                  {ap.colors.slice(0, 4).map((c) => (
                    <Stack key={c.k} direction="row" align="center" gap={1} style={{ marginBottom: 4 }}>
                      <div style={{ width: 12, height: 12, borderRadius: "50%", background: COLOR_SWATCHES[c.k] || "#CCC", border: "1px solid rgba(0,0,0,.08)", flexShrink: 0 }} />
                      <Text variant="micro" style={{ flex: 1 }}>{c.k}</Text>
                      <Text variant="micro" tone="muted">{c.pct}%</Text>
                    </Stack>
                  ))}
                </div>
                {/* Finishes */}
                <div>
                  <Text variant="micro" tone="subtle" style={{ fontWeight: 700, textTransform: "uppercase", letterSpacing: ".05em", marginBottom: 8, display: "block" }}>Finishes</Text>
                  {ap.finishes.slice(0, 3).map((f) => (
                    <div key={f.k} style={{ marginBottom: 5 }}>
                      <Stack direction="row" justify="space-between" style={{ marginBottom: 2 }}>
                        <Text variant="micro">{f.k}</Text>
                        <Text variant="micro" style={{ color: cl.color, fontWeight: 700 }}>{f.pct}%</Text>
                      </Stack>
                      <div style={{ height: 3, background: "var(--color-surface-sunken)", borderRadius: 2, overflow: "hidden" }}>
                        <div style={{ height: "100%", width: `${f.pct}%`, background: cl.color, borderRadius: 2 }} />
                      </div>
                    </div>
                  ))}
                </div>
                {/* Prices */}
                <div>
                  <Text variant="micro" tone="subtle" style={{ fontWeight: 700, textTransform: "uppercase", letterSpacing: ".05em", marginBottom: 8, display: "block" }}>Price tiers</Text>
                  {ap.prices.slice(0, 4).map((p) => (
                    <Stack key={p.k} direction="row" justify="space-between" style={{ marginBottom: 4 }}>
                      <Text variant="micro">{p.k}</Text>
                      <Text variant="micro" tone="muted">{p.pct}%</Text>
                    </Stack>
                  ))}
                </div>
                {/* Formats */}
                <div>
                  <Text variant="micro" tone="subtle" style={{ fontWeight: 700, textTransform: "uppercase", letterSpacing: ".05em", marginBottom: 8, display: "block" }}>Formats</Text>
                  {ap.formats.slice(0, 3).map((f) => (
                    <div key={f.k} style={{ marginBottom: 4, padding: "2px 7px", background: "var(--color-surface-sunken)", borderRadius: 4, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      <Text variant="micro">{f.k} <span style={{ color: "var(--color-text-muted)" }}>{f.pct}%</span></Text>
                    </div>
                  ))}
                </div>
              </div>
              <div style={{ padding: "8px 16px", borderTop: "1px solid var(--color-border)", background: "var(--color-surface-alt)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <Text variant="micro" tone="muted">Click to explore stores →</Text>
                <Text variant="micro" style={{ color: cl.color, fontWeight: 600 }}>↗</Text>
              </div>
            </Card>
          );
        })
      ) : (
        /* Scenarios A & B cluster overview */
        (sc?.clusters || []).map((cl) => {
          const stores = clusterStores(cl);
          return (
            <Card key={cl.id} sx={{ ...panelSx, padding: 0, marginBottom: 14 }}>
              <div style={{ height: 3, background: cl.color, borderRadius: "var(--r) var(--r) 0 0" }} />
              <div style={{ padding: "12px 16px", borderBottom: "1px solid var(--color-border)", background: "var(--color-surface-alt)", display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ width: 12, height: 12, borderRadius: "50%", background: cl.color, flexShrink: 0 }} />
                <div style={{ flex: 1 }}>
                  <Text variant="caption" tone="strong" style={{ fontWeight: 700 }}>{cl.label}</Text>
                  <Text variant="micro" tone="muted" style={{ marginTop: 1 }}>{stores.length} stores · ${cl.revSqft}/sqft · {cl.st}% ST</Text>
                </div>
                <TierBadge tier={cl.tier} />
              </div>
              {cl.signals && (
                <div style={{ padding: "8px 16px", borderBottom: "1px solid var(--color-border)", display: "flex", gap: 6, flexWrap: "wrap" }}>
                  {cl.signals.map((sig) => <Badge key={sig} variant="subtle" size="small" color="success" label={sig} />)}
                </div>
              )}
              {/* Column headers */}
              <div className="cl-store-head-sm">
                {["Store", "Name", "Market", "St", "DC", "Vel.", "Band"].map((h) => (
                  <Text key={h} variant="micro" tone="subtle" style={{ fontWeight: 700, textTransform: "uppercase", letterSpacing: ".05em" }}>{h}</Text>
                ))}
              </div>
              {stores.map((s, i) => (
                <div key={s.id} className={`cl-store-row-sm${i % 2 ? "" : " alt"}`}>
                  <Text variant="micro" mono style={{ fontWeight: 700, color: color.teal }}>{s.id}</Text>
                  <Text variant="micro">{s.name}</Text>
                  <Text variant="micro" tone="muted">{s.market}</Text>
                  <Text variant="micro" mono tone="muted">{s.state}</Text>
                  <Text variant="micro" mono tone="muted">{s.dc}</Text>
                  <VelBadge vel={s.velocity} />
                  <Text variant="micro" mono tone="muted">{BAND_PCT[s.velocity] || "—"}</Text>
                </div>
              ))}
            </Card>
          );
        })
      )}

      {/* Accept bar */}
      <div className="cl-accept-bar">
        <Text variant="caption" tone="muted" style={{ flex: 1 }}>Accept this scenario to promote it as the active assortment model</Text>
        <Button variant="primary" size="medium" onClick={onAccept}>✓ Accept Scenario</Button>
      </div>
    </div>
  );
}

/* Full cluster detail (sidebar + right panel) */
function ClusterDetailView({ outlierDecisions, setOutlierDecisions, onAccept, onNavigate }) {
  const [activeScenario, setActiveScenario] = useState("B");
  const [activeCluster,  setActiveCluster]  = useState(null);

  const sc       = FD_CLUST_SCENARIOS[activeScenario];
  const activeCl = sc?.clusters.find((c) => c.id === activeCluster) ?? null;

  const SCENARIO_TABS = [
    { key: "B", icon: "🧠", letter: "A", label: "Behavioural" },
    { key: "A", icon: "📈", letter: "B", label: "Perf + Demo" },
    { key: "C", icon: "🏷", letter: "C", label: "Attributes"  },
  ];

  return (
    <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>
      {/* ── Sidebar ── */}
      <div className="cl-detail-sidebar">
        {/* Scenario switcher */}
        <div style={{ padding: "12px 14px", borderBottom: "1px solid var(--color-border)", background: "var(--color-surface-alt)" }}>
          <Text variant="micro" tone="subtle" style={{ fontWeight: 700, textTransform: "uppercase", letterSpacing: ".06em", marginBottom: 8, display: "block" }}>Scenario</Text>
          <div style={{ display: "flex", gap: 4 }}>
            {SCENARIO_TABS.map((tab) => {
              const on = activeScenario === tab.key;
              return (
                <button key={tab.key} onClick={() => { setActiveScenario(tab.key); setActiveCluster(null); }}
                  className={`cl-scene-tab${on ? " is-on" : ""}`}>
                  {tab.icon} {tab.letter}
                </button>
              );
            })}
          </div>
          {/* Scenario description chip */}
          <div style={{ marginTop: 8, padding: "6px 10px", background: "var(--color-surface)", borderRadius: 6, border: "1px solid var(--color-border)" }}>
            <Text variant="micro" tone="muted" style={{ lineHeight: 1.4 }}>{sc?.note}</Text>
          </div>
        </div>

        {/* Cluster list */}
        <div style={{ padding: "8px 14px", background: "var(--color-surface)", borderBottom: "1px solid var(--color-border)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <Text variant="micro" tone="subtle" style={{ fontWeight: 700, textTransform: "uppercase", letterSpacing: ".06em" }}>Clusters</Text>
          <Badge variant="subtle" size="small" color="neutral" label={String(sc?.clusters.length || 0)} />
        </div>
        <div style={{ flex: 1, overflowY: "auto" }}>
          {(sc?.clusters || []).map((cl) => {
            const on = activeCluster === cl.id;
            const n  = Array.isArray(cl.stores) ? cl.stores.length : cl.stores;
            return (
              <div key={cl.id} onClick={() => setActiveCluster(on ? null : cl.id)}
                className={`cl-cluster-row${on ? " is-on" : ""}`}
                style={{ borderLeftColor: on ? cl.color : "transparent" }}>
                <Stack direction="row" align="center" gap={2} style={{ marginBottom: 4 }}>
                  <div style={{ width: 10, height: 10, borderRadius: "50%", background: cl.color, flexShrink: 0, boxShadow: on ? `0 0 0 3px ${cl.color}33` : "none" }} />
                  <Text variant="caption" style={{ flex: 1, fontWeight: on ? 700 : 500, minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{cl.label}</Text>
                </Stack>
                <Stack direction="row" align="center" gap={2} style={{ paddingLeft: 18 }}>
                  <Text variant="micro" tone="subtle">{n} stores</Text>
                  <Text variant="micro" tone="subtle">·</Text>
                  <Text variant="micro" tone="subtle">${cl.revSqft}/sqft</Text>
                  <div style={{ flex: 1 }} />
                  <TierBadge tier={cl.tier} />
                </Stack>
              </div>
            );
          })}

          {/* Outlier stores */}
          {FD_OUTLIER_STORES.length > 0 && (
            <>
              <div style={{ padding: "8px 14px", background: "var(--color-warning-soft)", borderTop: "1px solid var(--color-border)", borderBottom: "1px solid var(--color-border)", display: "flex", alignItems: "center", gap: 6 }}>
                <AlertTriangle size={12} color={color.warning} />
                <Text variant="micro" style={{ fontWeight: 700, color: color.warning, textTransform: "uppercase", letterSpacing: ".06em" }}>Outlier stores</Text>
              </div>
              {FD_OUTLIER_STORES.map((o) => {
                const dec = outlierDecisions[o.id];
                return (
                  <div key={o.id} style={{ padding: "10px 14px", borderBottom: "1px solid var(--color-border)" }}>
                    <Text variant="caption" style={{ fontWeight: 600, color: color.error, marginBottom: 3, display: "block" }}>{o.name}</Text>
                    <Text variant="micro" tone="muted" style={{ lineHeight: 1.4, marginBottom: 6, display: "block" }}>{o.reason}</Text>
                    {dec
                      ? <Badge variant="subtle" size="small" color="success" label={dec} />
                      : (
                        <Stack direction="row" gap={1} wrap>
                          {OUTLIER_OPTIONS.map((opt) => (
                            <button key={opt} className="cl-outlier-btn"
                              onClick={() => setOutlierDecisions((p) => ({ ...p, [o.id]: opt }))}>
                              {opt}
                            </button>
                          ))}
                        </Stack>
                      )}
                  </div>
                );
              })}
            </>
          )}
        </div>
      </div>

      {/* ── Right panel ── */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        {/* Scenario header strip */}
        <div className="cl-right-header">
          <span style={{ fontSize: 22 }}>{SCENARIO_TABS.find((t) => t.key === activeScenario)?.icon}</span>
          <div style={{ flex: 1 }}>
            <Stack direction="row" align="center" gap={2}>
              <Text variant="heading" tone="strong">{SCENARIO_TABS.find((t) => t.key === activeScenario)?.label}</Text>
              {activeScenario === "B" && <Badge variant="subtle" size="small" color="success" label="★ Agent recommended" />}
            </Stack>
          </div>
          {activeCl && (
            <button className="cl-back-btn" onClick={() => setActiveCluster(null)}>← All clusters</button>
          )}
        </div>

        {activeCl ? (
          <ClusterDrillIn
            scenario={activeScenario}
            cluster={activeCl}
            onBack={() => setActiveCluster(null)}
            onAccept={onAccept}
            onNavigate={onNavigate}
          />
        ) : (
          <ClusterOverview
            scenario={activeScenario}
            sc={sc}
            onSelectCluster={setActiveCluster}
            onAccept={onAccept}
            onNavigate={onNavigate}
          />
        )}
      </div>
    </div>
  );
}

/* Step 2 root: scenario card picker → cluster detail */
function StepReview({ draft, onNavigate, outlierDecisions, setOutlierDecisions, onPromote }) {
  const [phase, setPhase] = useState("cards");

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
      {/* Topbar — now uses app deep navy, consistent with other screens */}
      <div className="cl-results-topbar">
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div className="cl-results-dot" />
          <div>
            <Text variant="body-strong" style={{ color: "#fff", fontWeight: 800 }}>Location Clustering — Results</Text>
            <Stack direction="row" gap={2} wrap style={{ marginTop: 3 }}>
              <Badge variant="subtle" size="small" color="neutral" label={draft.dept} />
              <Badge variant="subtle" size="small" color="neutral" label={draft.channel} />
              <Badge variant="subtle" size="small" color="info"    label={draft.season} />
              {Object.keys(draft.params).filter((k) => draft.params[k]).map((k) => (
                <Badge key={k} variant="subtle" size="small" color="success" label={`+${k}`} />
              ))}
            </Stack>
          </div>
        </div>
        {phase === "detail" && (
          <button className="cl-topbar-back-btn" onClick={() => setPhase("cards")}>← Back to scenarios</button>
        )}
      </div>

      {phase === "cards" ? (
        /* ── Scenario selection cards ── */
        <div style={{ flex: 1, overflowY: "auto", background: "var(--color-bg)", padding: "20px 24px" }}>
          <div style={{ maxWidth: 920, margin: "0 auto" }}>
            {/* Agent recommendation banner */}
            <Card sx={{ ...panelSx, padding: 0, marginBottom: 20, overflow: "hidden", borderLeft: `4px solid ${color.primary}` }}>
              <div style={{ padding: "16px 20px", display: "flex", alignItems: "flex-start", gap: 14 }}>
                <div style={{ width: 40, height: 40, borderRadius: "var(--r)", background: "var(--color-primary-soft)", border: `1px solid ${color.primary}33`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, fontSize: 20 }}>🤖</div>
                <div>
                  <Text variant="body-strong" tone="primary" style={{ fontWeight: 800, marginBottom: 6 }}>{AGENT_RECOMMENDATION.title}</Text>
                  <Text variant="caption" tone="muted" style={{ lineHeight: 1.6 }}>{AGENT_RECOMMENDATION.body(STORE_COUNT, draft.dept, draft.season)}</Text>
                </div>
              </div>
            </Card>

            {/* 3 scenario cards */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16 }}>
              {SCENARIO_CARDS.map((card) => {
                const sc = FD_CLUST_SCENARIOS[card.scKey];
                return (
                  <Card key={card.id} sx={{ ...panelSx, padding: 0, cursor: "pointer", transition: "all .15s", overflow: "hidden", border: `2px solid ${card.recommended ? color.primary : "var(--color-border)"}` }}
                    onClick={() => setPhase("detail")}
                    onMouseOver={(e) => { e.currentTarget.style.transform = "translateY(-3px)"; e.currentTarget.style.boxShadow = "0 8px 32px rgba(0,0,0,.12)"; }}
                    onMouseOut={(e)  => { e.currentTarget.style.transform = ""; e.currentTarget.style.boxShadow = "var(--sh)"; }}>
                    {/* Accent bar */}
                    {card.recommended
                      ? <div className="cl-rec-strip">★ Agent Recommended</div>
                      : <div style={{ height: 3, background: "var(--color-border)" }} />}
                    <div style={{ padding: "16px" }}>
                      {/* Header */}
                      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
                        <div style={{ width: 36, height: 36, borderRadius: "var(--r)", background: card.recommended ? "var(--color-primary-soft)" : "var(--color-surface-alt)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0 }}>{card.icon}</div>
                        <div>
                          <Text variant="caption" tone="strong" style={{ fontWeight: 800 }}>Scenario {card.id}: {card.name}</Text>
                          <Text variant="micro" tone="muted">{card.subtitle}</Text>
                        </div>
                      </div>
                      {/* Cluster pills */}
                      {sc && (
                        <Stack direction="row" wrap gap={1} style={{ marginBottom: 12 }}>
                          {sc.clusters.map((cl) => (
                            <span key={cl.id} style={{ display: "inline-flex", alignItems: "center", gap: 4, background: "var(--color-surface-sunken)", border: "1px solid var(--color-border)", borderRadius: 20, padding: "2px 8px", fontSize: 9, fontWeight: 600, color: "var(--color-text-muted)" }}>
                              <span style={{ width: 6, height: 6, borderRadius: "50%", background: cl.color, display: "inline-block" }} />
                              {cl.label}
                            </span>
                          ))}
                        </Stack>
                      )}
                      {/* Signals */}
                      <Text variant="micro" tone="subtle" style={{ fontWeight: 700, textTransform: "uppercase", letterSpacing: ".06em", marginBottom: 6, display: "block" }}>Signals used</Text>
                      <Stack direction="column" gap={2} style={{ marginBottom: 12 }}>
                        {card.signals.map((sig) => (
                          <Stack key={sig} direction="row" align="center" gap={2}>
                            <div style={{ width: 4, height: 4, borderRadius: "50%", background: color.teal, flexShrink: 0 }} />
                            <Text variant="micro">{sig}</Text>
                          </Stack>
                        ))}
                      </Stack>
                      {/* Why */}
                      <div style={{ background: "var(--color-surface-alt)", borderRadius: 6, padding: "8px 10px" }}>
                        <Text variant="micro" tone="muted" style={{ lineHeight: 1.5 }}>{card.why}</Text>
                      </div>
                    </div>
                    <div style={{ padding: "10px 16px", borderTop: "1px solid var(--color-border)", background: card.recommended ? "var(--color-primary-soft)" : "var(--color-surface-alt)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                      <Text variant="caption" style={{ fontWeight: 700, color: card.recommended ? color.primary : "var(--color-text-muted)" }}>View clusters</Text>
                      <Text variant="caption" style={{ color: card.recommended ? color.primary : "var(--color-text-muted)" }}>→</Text>
                    </div>
                  </Card>
                );
              })}
            </div>
          </div>
        </div>
      ) : (
        <ClusterDetailView
          outlierDecisions={outlierDecisions}
          setOutlierDecisions={setOutlierDecisions}
          onAccept={onPromote}
          onNavigate={onNavigate}
        />
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SCENARIO EXPLORER (outer tab)
// ─────────────────────────────────────────────────────────────────────────────
const PREVIEW_COLS = "56px 1fr 92px 46px 50px 48px 60px";

function ScenarioExplorer({ onNavigate }) {
  const [scenarioId, setScenarioId] = useState("A");
  const [activeClId, setActiveClId] = useState(null);
  const [outlierDec, setOutlierDec] = useState({});

  const sc       = FD_CLUST_SCENARIOS[scenarioId] || FD_CLUST_SCENARIOS.A;
  const activeCl = sc.clusters.find((c) => c.id === activeClId) || null;

  const detailRows = useMemo(
    () => activeCl ? clusterStores(activeCl).map((s) => ({ ...s, bandPct: BAND_PCT[s.velocity] || "—" })) : [],
    [activeCl]
  );

  return (
    <>
      <Card sx={panelSx}>
        <Grid columns="1fr 1fr 1fr" gap={2}>
          {["A", "B", "C"].map((sid) => {
            const s2 = FD_CLUST_SCENARIOS[sid];
            const on = scenarioId === sid;
            return (
              <Stack key={sid} className={`cl-scenario${on ? " is-active" : ""}`} direction="column" gap={1}
                onClick={() => { setScenarioId(sid); setActiveClId(null); }}>
                <Text variant="caption" tone={on ? "primary" : "default"} style={{ fontWeight: 700 }}>{sid}. {s2.badge}{on ? " ✓" : ""}</Text>
                <Text variant="micro" tone={on ? "default" : "subtle"}>{scenarioTagline(s2.name)}</Text>
              </Stack>
            );
          })}
        </Grid>
      </Card>

      <Stack className="cl-body" direction="row" gap={4} wrap>
        <Card sx={{ ...panelSx, padding: 0, width: 264, minWidth: 264, overflow: "hidden", alignSelf: "flex-start" }}>
          <Stack className="cl-sidebar" direction="column" gap={0}>
            <Stack className="cl-section-label" direction="row">
              <Text variant="micro" tone="subtle" style={{ fontWeight: 700, textTransform: "uppercase", letterSpacing: ".06em" }}>{sc.clusters.length} clusters</Text>
            </Stack>
            {sc.clusters.map((cl) => {
              const on = activeClId === cl.id;
              return (
                <Stack key={cl.id} className={`cl-clusterrow${on ? " is-active" : ""}`} direction="column" gap={1}
                  onClick={() => setActiveClId(on ? null : cl.id)} style={{ borderLeftColor: on ? cl.color : "transparent" }}>
                  <Stack direction="row" align="center" gap={2}>
                    <span className="cl-dot" style={{ background: cl.color }} />
                    <Text variant="caption" tone="strong" style={{ flex: 1, minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", fontWeight: on ? 700 : 400 }}>{cl.label}</Text>
                    <TierBadge tier={cl.tier} />
                  </Stack>
                  <Text variant="micro" tone="subtle" style={{ marginLeft: 18 }}>{cl.stores.length} stores · ${cl.revSqft}/sqft · {cl.st}% ST</Text>
                </Stack>
              );
            })}
            {FD_OUTLIER_STORES.length > 0 && (
              <>
                <Stack className="cl-section-label" direction="row" align="center" gap={0.5}>
                  <AlertTriangle size={12} style={{ color: color.warning }} />
                  <Text variant="micro" tone="warning" style={{ fontWeight: 700, textTransform: "uppercase", letterSpacing: ".06em" }}>Outliers</Text>
                </Stack>
                {FD_OUTLIER_STORES.map((o) => {
                  const dec = outlierDec[o.id];
                  return (
                    <Stack key={o.id} direction="column" gap={2} style={{ padding: "10px 12px", borderBottom: "1px solid var(--color-border)" }}>
                      <Text variant="caption" tone="error" style={{ fontWeight: 600 }}>{o.name}</Text>
                      <Text variant="micro" tone="subtle">{o.reason}</Text>
                      {dec ? <Badge variant="subtle" size="small" color="success" label={dec} />
                        : (
                          <Stack direction="row" gap={2} wrap>
                            {OUTLIER_OPTIONS.map((opt) => (
                              <Button key={opt} variant="secondary" size="small" onClick={() => setOutlierDec((p) => ({ ...p, [o.id]: opt }))}>{opt}</Button>
                            ))}
                          </Stack>
                        )}
                    </Stack>
                  );
                })}
              </>
            )}
          </Stack>
        </Card>

        <Stack direction="column" gap={3} style={{ flex: "1 1 420px", minWidth: 0 }}>
          <Card sx={{ ...softSx, borderLeft: `3px solid var(--color-primary)` }}>
            <Text variant="caption" tone="muted" style={{ lineHeight: 1.5 }}>{sc.note}</Text>
          </Card>

          {!activeCl ? (
            <Stack direction="column" gap={3}>
              {sc.clusters.map((cl) => {
                const stores = clusterStores(cl);
                return (
                  <Card key={cl.id} sx={{ ...panelSx, padding: 0 }}>
                    <div style={{ height: 3, background: cl.color, borderRadius: "var(--r) var(--r) 0 0" }} />
                    <Stack direction="row" align="center" gap={3} style={{ padding: "12px 16px", background: "var(--color-surface-alt)", borderBottom: "1px solid var(--color-border)" }} wrap>
                      <span className="cl-dot" style={{ width: 12, height: 12, background: cl.color }} />
                      <Stack direction="column" gap={0} style={{ flex: "1 1 auto", minWidth: 0 }}>
                        <Text variant="caption" tone="strong" style={{ fontWeight: 700 }}>{cl.label}</Text>
                        <Text variant="micro" tone="subtle">{stores.length} stores · ${cl.revSqft}/sqft avg · {cl.st}% sell-through</Text>
                      </Stack>
                      <Stack direction="row" gap={1} wrap>
                        {(cl.signals || []).map((s) => <Badge key={s} variant="subtle" size="small" color="success" label={s} />)}
                      </Stack>
                    </Stack>
                    <Grid className="cl-storehead" columns={PREVIEW_COLS} gap={0}>
                      {["Store #", "Name", "Market", "State", "DC", "Vel.", "Band %"].map((c) => (
                        <Text key={c} variant="micro" tone="subtle" style={{ fontWeight: 700, textTransform: "uppercase" }}>{c}</Text>
                      ))}
                    </Grid>
                    {stores.map((s, i) => (
                      <Grid key={s.id} className={`cl-storerow${i % 2 ? "" : " alt"}`} columns={PREVIEW_COLS} gap={0}>
                        <Text variant="micro" mono style={{ fontWeight: 700, color: color.teal }}>{s.id}</Text>
                        <Text variant="micro" style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{s.name}</Text>
                        <Text variant="micro" tone="muted">{s.market}</Text>
                        <Text variant="micro" tone="subtle" mono>{s.state}</Text>
                        <Text variant="micro" tone="subtle" mono>{s.dc}</Text>
                        <VelBadge vel={s.velocity} />
                        <Text variant="micro" tone="muted" mono>{BAND_PCT[s.velocity] || "—"}</Text>
                      </Grid>
                    ))}
                  </Card>
                );
              })}
            </Stack>
          ) : (
            <Stack direction="column" gap={3}>
              <Stack direction="row" align="center" gap={2} wrap>
                <div style={{ width: 14, height: 14, borderRadius: "50%", background: activeCl.color, flexShrink: 0 }} />
                <Text variant="heading" tone="strong">{activeCl.label}</Text>
                <Button variant="secondary" size="small" onClick={() => setActiveClId(null)} style={{ marginLeft: "auto" }}>← All clusters</Button>
              </Stack>
              <Stack direction="row" gap={1} wrap>
                {(activeCl.signals || []).map((s) => <Badge key={s} variant="subtle" size="medium" color="success" label={s} />)}
              </Stack>
              <Card sx={{ ...panelSx, padding: 0 }}>
                <Grid className="cl-storehead" columns={PREVIEW_COLS} gap={0}>
                  {["Store #", "Name", "Market", "State", "DC", "Vel.", "Band %"].map((c) => (
                    <Text key={c} variant="micro" tone="subtle" style={{ fontWeight: 700, textTransform: "uppercase" }}>{c}</Text>
                  ))}
                </Grid>
                {detailRows.map((s, i) => (
                  <Grid key={s.id} className={`cl-storerow${i % 2 ? "" : " alt"}`} columns={PREVIEW_COLS} gap={0}>
                    <Text variant="micro" mono style={{ fontWeight: 700, color: color.teal }}>{s.id}</Text>
                    <Text variant="micro" style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{s.name}</Text>
                    <Text variant="micro" tone="muted">{s.market}</Text>
                    <Text variant="micro" tone="subtle" mono>{s.state}</Text>
                    <Text variant="micro" tone="subtle" mono>{s.dc}</Text>
                    <VelBadge vel={s.velocity} />
                    <Text variant="micro" tone="muted" mono>{s.bandPct}</Text>
                  </Grid>
                ))}
              </Card>
              <div>
                <Button variant="primary" size="medium" onClick={() => onNavigate?.("store-curation")}>Open store curation →</Button>
              </div>
            </Stack>
          )}
        </Stack>
      </Stack>
    </>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN EXPORT
// ─────────────────────────────────────────────────────────────────────────────
export default function Clustering({ onNavigate }) {
  const [tab, setTab] = useState("runs");

  const [wizardOpen, setWizardOpen] = useState(false);
  const [wizardStep, setWizardStep] = useState(0);
  const [draft,      setDraft]      = useState({ ...WIZARD_DEFAULTS });
  const [runStep,    setRunStep]    = useState(0);
  const [promoted,   setPromoted]   = useState(false);
  const [outlierDec, setOutlierDec] = useState({});
  const intervalRef = useRef(null);

  const STEPS = ["Define Scope", "Run Agent", "Review & Accept"];

  const openWizard = useCallback(() => {
    setWizardOpen(true); setWizardStep(0);
    setDraft({ ...WIZARD_DEFAULTS });
    setRunStep(0); setPromoted(false); setOutlierDec({});
  }, []);

  const closeWizard = useCallback(() => {
    if (intervalRef.current) clearTimeout(intervalRef.current);
    setWizardOpen(false);
  }, []);

  useEffect(() => () => { if (intervalRef.current) clearTimeout(intervalRef.current); }, []);

  const startRun = useCallback(() => {
    setWizardStep(1); setRunStep(0);
    const total = RUN_AGENT_STEPS.length;
    let step = 0;
    const advance = () => {
      step += 1;
      setRunStep(step);
      if (step >= total) {
        setWizardStep(2);
      } else {
        intervalRef.current = setTimeout(advance, step <= 3 ? 900 : 700);
      }
    };
    intervalRef.current = setTimeout(advance, 600);
  }, []);

  const promoteToLive = useCallback(() => {
    setPromoted(true);
    setTimeout(() => closeWizard(), 2400);
  }, [closeWizard]);

  /* ── Wizard overlay ── */
  if (wizardOpen) {
    return (
      <div className="cr-wizard-overlay">
        <div className="cr-wizard-header">
          <Stack direction="column" gap={0.5} style={{ minWidth: 0 }}>
            <Text variant="heading" tone="strong">New cluster run</Text>
            <Text variant="micro" tone="muted">{[draft.dept, draft.channel, draft.season].join(" · ")} · {STORE_COUNT} stores</Text>
          </Stack>
          <StepIndicator step={wizardStep} labels={STEPS} className="cr-steps" />
          <Button variant="secondary" size="small" onClick={closeWizard}>Cancel</Button>
        </div>

        <div className="cr-wizard-body">
          {promoted ? (
            <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", background: "var(--color-bg)" }}>
              <Card sx={{ ...panelSx, maxWidth: 480, display: "flex", alignItems: "center", gap: 16 }}>
                <div style={{ width: 48, height: 48, borderRadius: "var(--r)", background: "var(--color-success-soft)", border: `1px solid ${color.success}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <CheckCircle2 size={24} color={color.success} strokeWidth={1.75} />
                </div>
                <Stack direction="column" gap={1}>
                  <Text variant="heading" style={{ color: color.success }}>CR-019 accepted and live</Text>
                  <Text variant="caption" tone="muted">Previous set CR-018 has been archived. Returning to dashboard…</Text>
                </Stack>
              </Card>
            </div>
          ) : wizardStep === 0 ? (
            <StepScope draft={draft} setDraft={setDraft} onRun={startRun} />
          ) : wizardStep === 1 ? (
            <StepRunAgent draft={draft} runStep={runStep} />
          ) : (
            <StepReview
              draft={draft}
              onNavigate={onNavigate}
              outlierDecisions={outlierDec}
              setOutlierDecisions={setOutlierDec}
              onPromote={promoteToLive}
            />
          )}
        </div>
      </div>
    );
  }

  /* ── Normal page ── */
  return (
    <Stack direction="column" gap={4}>
      <Card sx={panelSx}>
        <Stack direction="row" justify="space-between" align="center" gap={4} wrap>
          <Stack direction="column" gap={1} style={{ flex: "1 1 auto", minWidth: 0 }}>
            <Text variant="title">Location Clustering</Text>
            <Text variant="caption" tone="muted">
              {STORE_COUNT} stores · {ACTIVE_CLUSTER_SET.clusters.length} active clusters · {ACTIVE_CLUSTER_SET.runId}
            </Text>
          </Stack>
          <Stack direction="row" gap={2} align="center" wrap>
            <Chips label="Cluster Runs"      isActive={tab === "runs"}      onClick={() => setTab("runs")} />
            <Chips label="Scenario Explorer" isActive={tab === "scenarios"} onClick={() => setTab("scenarios")} />
            {tab === "runs" && <Button variant="primary" size="medium" onClick={openWizard}>+ New cluster run</Button>}
          </Stack>
        </Stack>
      </Card>

      {tab === "runs"      && <ClusterRunsDashboard onNew={openWizard} />}
      {tab === "scenarios" && <ScenarioExplorer onNavigate={onNavigate} />}
    </Stack>
  );
}
