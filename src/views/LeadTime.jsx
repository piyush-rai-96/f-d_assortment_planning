import React, { useMemo, useState } from "react";
import { Card, Button, Badge, ProgressBar } from "impact-ui";
import {
  Clock, AlertTriangle, CheckCircle2, Package, Truck, Anchor,
  CalendarDays, Zap, TrendingUp, Factory, ChevronRight,
} from "lucide-react";
import Text from "../components/Text.jsx";
import Stack from "../components/Stack.jsx";
import Grid from "../components/Grid.jsx";
import { LEAD_TIME_SKUS, STATUS_META, PIPELINE_STAGES } from "../data/leadtime.js";
import "./LeadTime.css";
import { panelSx, softSx } from "../styles/panelSx.js";

const STAGE_ICONS = [CheckCircle2, Zap, Package, Factory, Anchor, Truck];

function fmtDate(d) {
  if (!d) return null;
  const dt = new Date(d);
  return dt.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function RiskBanner({ reason }) {
  return (
    <div className="lt-risk-banner">
      <AlertTriangle size={14} strokeWidth={2} style={{ flexShrink: 0, marginTop: 1 }} />
      <div>
        <span className="lt-risk-label">Trend risk · </span>
        {reason}
      </div>
    </div>
  );
}

export default function LeadTime() {
  const [skus, setSkus] = useState(LEAD_TIME_SKUS);

  const atRiskCount   = skus.filter((s) => s.atRisk).length;
  const pendingOracle = skus.filter((s) => s.status === "pending-oracle").length;
  const avgLead = useMemo(() => Math.round(skus.reduce((a, s) => a + s.leadWeeks, 0) / (skus.length || 1)), [skus]);
  const confirmedCount = skus.filter((s) => s.status === "confirmed").length;

  const markOracle = (id) =>
    setSkus((prev) =>
      prev.map((s) => s.id === id ? { ...s, status: "oracle-created", oracleCreate: new Date().toISOString().slice(0, 10) } : s)
    );

  return (
    <Stack direction="column" gap={4}>

      {/* ── Premium dark hero ─────────────────────────────────────────── */}
      <div className="lt-hero">
        <div className="lt-hero-left">
          <div className="lt-hero-overline">FW 2026 · SS 2027</div>
          <h1 className="lt-hero-title">Lead Time &amp; Oracle</h1>
          <p className="lt-hero-subtitle">
            Approved SKUs in the procurement pipeline · Oracle / Foundation creation ·
            6–8 month lead-time visibility · Trend risk monitoring
          </p>
          <div className="lt-hero-kpis">
            {[
              { v: skus.length,            lbl: "In pipeline",        sub: "approved SKUs",    color: "#93C5FD" },
              { v: `${avgLead}w`,          lbl: "Avg lead time",      sub: "approval to floor", color: "#6EE7B7" },
              { v: pendingOracle,          lbl: "Pending Oracle",     sub: "action needed",     color: pendingOracle ? "#FCD34D" : "#6EE7B7" },
              { v: atRiskCount,            lbl: "Trend-risk flags",   sub: "may miss peak",     color: atRiskCount ? "#FCA5A5" : "#6EE7B7" },
            ].map((k) => (
              <div key={k.lbl} className="lt-hero-kpi">
                <div className="lt-hero-kpi-val" style={{ color: k.color }}>{k.v}</div>
                <div className="lt-hero-kpi-lbl">{k.lbl}</div>
                <div className="lt-hero-kpi-sub">{k.sub}</div>
              </div>
            ))}
          </div>
        </div>
        <div className="lt-hero-visual">
          <div className="lt-lead-arc">
            <div className="lt-lead-arc-val">{avgLead}w</div>
            <div className="lt-lead-arc-lbl">avg lead</div>
          </div>
        </div>
      </div>

      {/* ── Pipeline stage timeline ───────────────────────────────────── */}
      <Card sx={panelSx}>
        <Stack direction="column" gap={4}>
          <Stack direction="row" align="center" gap={2}>
            <CalendarDays size={16} color="var(--color-primary)" strokeWidth={1.75} />
            <Text variant="body-strong" tone="strong">Procurement pipeline · typical 6–8 month sequence</Text>
          </Stack>
          <div className="lt-pipeline">
            {PIPELINE_STAGES.map((stage, i) => {
              const Icon = STAGE_ICONS[i] || Package;
              return (
                <div key={stage.l} className="lt-pipeline-stage">
                  <div className="lt-pipeline-icon" style={{ background: stage.c + "18", borderColor: stage.c + "60" }}>
                    <Icon size={14} color={stage.c} strokeWidth={2} />
                  </div>
                  <div className="lt-pipeline-step-num" style={{ color: stage.c }}>{i + 1}</div>
                  <div className="lt-pipeline-lbl">{stage.l}</div>
                  {i < PIPELINE_STAGES.length - 1 && (
                    <ChevronRight size={12} className="lt-pipeline-arrow" />
                  )}
                </div>
              );
            })}
          </div>
          <div className="lt-pipeline-note">
            <Clock size={13} color="var(--color-warning)" />
            <span>
              Total pipeline: <strong>6–8+ months</strong> from approval to floor.
              Oracle creation should begin within <strong>5 business days</strong> of approval.
            </span>
          </div>
        </Stack>
      </Card>

      {/* ── SKU pipeline cards ────────────────────────────────────────── */}
      <Stack direction="column" gap={3}>
        <Stack direction="row" align="center" gap={2}>
          <Text variant="overline" tone="muted">Pipeline SKUs ({skus.length})</Text>
          {atRiskCount > 0 && <Badge variant="subtle" size="small" color="error" label={`${atRiskCount} at risk`} />}
          {pendingOracle > 0 && <Badge variant="subtle" size="small" color="warning" label={`${pendingOracle} pending Oracle`} />}
        </Stack>

        {skus.map((sku) => {
          const meta = STATUS_META[sku.status] || { label: sku.status, badge: "default", prog: 10 };
          const oracleMissing = !sku.oracleCreate;
          const DEPT_COLORS = { Tile: "var(--color-teal)", Wood: "var(--color-wood)", "Laminate & Vinyl": "var(--color-info)" };
          const deptColor = DEPT_COLORS[sku.dept] || "var(--color-primary)";

          return (
            <div key={sku.id} className={`lt-sku-card${sku.atRisk ? " lt-sku-at-risk" : ""}`} style={{ borderLeftColor: deptColor }}>
              {/* Top row */}
              <div className="lt-sku-top">
                <div className="lt-sku-identity">
                  <div className="lt-sku-dept-dot" style={{ background: deptColor }} />
                  <div>
                    <div className="lt-sku-name">{sku.name}</div>
                    <div className="lt-sku-meta">
                      <span className="lt-sku-dept">{sku.dept}</span>
                      <span className="lt-dot-sep" />
                      <CalendarDays size={11} />
                      <span>Approved {fmtDate(sku.approvedDate)}</span>
                      <span className="lt-dot-sep" />
                      <span>Target: {sku.season}</span>
                    </div>
                  </div>
                </div>
                <div className="lt-sku-badge-group">
                  <Badge variant="subtle" size="small" color={meta.badge} label={meta.label} />
                  <span className="lt-sku-lead">{sku.leadWeeks}w lead</span>
                </div>
              </div>

              {/* Progress bar */}
              <div className="lt-sku-progress">
                <div className="lt-progress-track">
                  <div
                    className="lt-progress-fill"
                    style={{
                      width: `${meta.prog}%`,
                      background: meta.prog >= 100 ? "var(--color-success)" : meta.prog >= 60 ? "var(--color-info)" : meta.prog >= 30 ? "var(--color-warning)" : "var(--color-error)",
                    }}
                  />
                </div>
                <span className="lt-progress-pct">{meta.prog}%</span>
              </div>

              {/* Details row */}
              <div className="lt-sku-details">
                <div className="lt-detail-item">
                  <span className="lt-detail-lbl">Oracle creation</span>
                  <span className={`lt-detail-val${oracleMissing ? " lt-detail-missing" : ""}`}>
                    {oracleMissing ? "⚠ Not yet created" : fmtDate(sku.oracleCreate)}
                  </span>
                </div>
                <div className="lt-detail-item">
                  <span className="lt-detail-lbl">Est. floor date</span>
                  <span className="lt-detail-val">{fmtDate(sku.estimatedFloor)}</span>
                </div>
                <div className="lt-detail-item">
                  <span className="lt-detail-lbl">Lead time</span>
                  <span className="lt-detail-val">{sku.leadWeeks} weeks</span>
                </div>
              </div>

              {/* Risk banner */}
              {sku.atRisk && <RiskBanner reason={sku.riskReason} />}

              {/* CTA */}
              {sku.status === "pending-oracle" && (
                <div className="lt-sku-cta">
                  <Button variant="primary" size="small" onClick={() => markOracle(sku.id)}>
                    <CheckCircle2 size={13} style={{ marginRight: 6 }} />
                    Mark Oracle created
                  </Button>
                </div>
              )}
            </div>
          );
        })}
      </Stack>
    </Stack>
  );
}
