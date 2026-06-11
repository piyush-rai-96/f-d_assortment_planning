/*
 * Catalogue screen — read-only reference fence of the locked FW 2025 superset.
 *
 * Per fd-assortment-v6.html this view is intentionally lean:
 *   • Active PLR Review banner (links to National Core / PLR Status)
 *   • "→ My Workspace" CTA in the header to kick off the agent run
 *   • Tier-strip: Core · Cluster · Store pick counts at a glance
 *   • Full SKU table with swatch, SKU ID, Market Intel signal badges,
 *     dept badge, tier pill, and a left-border accent coloured by tier
 *
 * The assortment plan (tier assignments) is driven by the agent that runs
 * in My Workspace and committed to agentStore.js.  Catalogue reads it on
 * every mount so it always shows the freshest plan without prop-drilling.
 */
import React, { useMemo } from "react";
import { Card, Badge, Table, Button } from "impact-ui";
import Text from "../components/Text.jsx";
import Stack from "../components/Stack.jsx";
import SkuSwatch from "../components/SkuSwatch.jsx";
import {
  CATALOGUE_SKUS, HARD_LOCKED_COUNT, STORE_PICK_COUNT,
  isNatLocked, isClusterAdd,
} from "../data/catalogue.js";
import { INTEL_SEED } from "../data/intel.js";
import { getAgentPlan } from "../data/agentStore.js";
import { panelSx } from "../styles/panelSx.js";
import "./Catalogue.css";

/* ── Constants ──────────────────────────────────────────────────────────── */
const TIER_META = {
  core:    { label: "🔒 Core",        badge: "success", border: "var(--color-success)" },
  cluster: { label: "🗂 Cluster",     badge: "info",    border: "var(--color-teal)" },
  store:   { label: "📍 Store pick",  badge: "accent",  border: "transparent" },
};

const DEPT_BADGE = {
  "Wood":              "warning",
  "Tile":              "success",
  "Laminate & Vinyl":  "info",
};

/* Map intel signals to the dept + subDept categories they cover */
function buildIntelMap() {
  const map = {};
  INTEL_SEED.forEach((sig) => {
    (sig.categories || []).forEach((cat) => {
      if (!map[cat]) map[cat] = [];
      map[cat].push({ title: sig.title, direction: sig.direction });
    });
  });
  return map;
}
const INTEL_BY_CAT = buildIntelMap();

function getSkuSignals(sku) {
  const key = `${sku.dept}${sku.subDept ? " \u2013 " + sku.subDept : ""}`;
  return (INTEL_BY_CAT[key] || []).slice(0, 2);
}

/* Active PLR plan mock — in production this would come from Workspace state */
const ACTIVE_PLR = {
  name: "FW 2025 — Tile (Agent Draft)",
  dept: "Tile",
  season: "FW 2025",
  updated: "Jun 10",
};

/* ── Catalogue ──────────────────────────────────────────────────────────── */
export default function Catalogue({ onNavigate }) {
  const plan = getAgentPlan(); // read latest plan from shared store
  const hasAgentRun = !!plan.agentRunAt;

  /* Augment every SKU row with live tier + intel signals */
  const rows = useMemo(
    () =>
      CATALOGUE_SKUS.map((sku) => {
        const id = parseInt(sku.id, 10);
        const tier = isNatLocked(id, plan.natDecisions)
          ? "core"
          : isClusterAdd(sku.id, plan.clusterDecisions)
          ? "cluster"
          : sku.tier || "store";
        return { ...sku, tier, intel: getSkuSignals(sku) };
      }),
    // plan is a module-level object; re-compute only on mount (plan ref stable per session)
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  const coreCount    = rows.filter((r) => r.tier === "core").length;
  const clusterCount = rows.filter((r) => r.tier === "cluster").length;
  const storeCount   = rows.filter((r) => r.tier === "store").length;

  /* Column definitions */
  const columns = useMemo(() => [
    {
      headerName: "SKU / Description",
      minWidth: 300,
      flex: 2,
      filter: "agTextColumnFilter",
      valueGetter: (p) => p.data.name,
      autoHeight: true,
      cellRenderer: (p) => {
        const signals = p.data.intel || [];
        return (
          <div className="cat-sku-cell">
            <div className="cat-sku-swatch">
              <SkuSwatch
                sku={{ desc: p.data.name, dept: p.data.dept, subDept: p.data.subDept, cls: p.data.cls }}
                size={28}
              />
            </div>
            <div className="cat-sku-info">
              <span className="cat-sku-name">{p.data.name}</span>
              <span className="cat-sku-id">{p.data.id}</span>
              {signals.length > 0 && (
                <div className="cat-sku-signals">
                  {signals.map((sig, i) => (
                    <span
                      key={i}
                      className={`cat-signal cat-signal--${sig.direction}`}
                      title={sig.title}
                    >
                      {sig.direction === "opportunity" ? "↑" : "⚠"}{" "}
                      {sig.title.length > 32 ? sig.title.slice(0, 32) + "…" : sig.title}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        );
      },
    },
    {
      field: "dept",
      headerName: "Dept",
      width: 140,
      filter: "agSetColumnFilter",
      cellRenderer: (p) => (
        <div style={{ display: "flex", alignItems: "center", height: "100%" }}>
          <Badge variant="subtle" size="small" color={DEPT_BADGE[p.value] || "neutral"} label={p.value} />
        </div>
      ),
    },
    {
      field: "subDept",
      headerName: "Sub-Dept",
      minWidth: 150,
      flex: 1,
      filter: "agSetColumnFilter",
      cellStyle: () => ({
        fontSize: "var(--fs-micro)",
        color: "var(--color-text-muted)",
        display: "flex",
        alignItems: "center",
      }),
    },
    {
      field: "price",
      headerName: "Price",
      width: 90,
      filter: "agNumberColumnFilter",
      cellRenderer: (p) => (
        <div style={{ display: "flex", alignItems: "center", height: "100%" }}>
          <span style={{
            fontFamily: "var(--font-mono, monospace)",
            fontSize: "var(--fs-micro)",
            fontWeight: "var(--fw-semibold)",
            color: "var(--color-text)",
          }}>
            ${Number(p.value).toFixed(2)}
          </span>
        </div>
      ),
    },
    {
      field: "status",
      headerName: "Status",
      width: 100,
      filter: "agSetColumnFilter",
      cellStyle: (p) => ({
        fontSize: "var(--fs-micro)",
        fontWeight: "var(--fw-semibold)",
        color: p.value === "Active" ? "var(--color-success)" : "var(--color-text-subtle)",
        display: "flex",
        alignItems: "center",
      }),
    },
    {
      field: "tier",
      headerName: "Tier",
      width: 130,
      filter: "agSetColumnFilter",
      cellRenderer: (p) => {
        const meta = TIER_META[p.value] || TIER_META.store;
        return (
          <div style={{ display: "flex", alignItems: "center", height: "100%" }}>
            <Badge variant="subtle" size="small" color={meta.badge} label={meta.label} />
          </div>
        );
      },
    },
  ], []);

  /* Left-border per tier, matching HTML v6 row accent */
  const getRowStyle = (p) => {
    const border = TIER_META[p.data?.tier]?.border;
    return border && border !== "transparent"
      ? { borderLeft: `3px solid ${border}` }
      : { borderLeft: "3px solid transparent" };
  };

  return (
    <Stack direction="column" gap={4}>
      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <Card sx={panelSx}>
        <Stack direction="row" justify="space-between" align="center" gap={3} wrap>
          <Stack direction="column" gap={1} flex="1 1 auto" style={{ minWidth: 0 }}>
            <Text variant="title">Catalogue</Text>
            <Text variant="caption" tone="muted">
              FW 2025 locked · {CATALOGUE_SKUS.length} SKUs · Full product superset across all locations ·
              Submit scope in My Workspace to generate curation recommendations
            </Text>
          </Stack>
          <Stack direction="row" gap={2} align="center" wrap justify="flex-end">
            {hasAgentRun && (
              <Badge variant="subtle" color="success" size="small" label={`Agent applied · ${plan.agentRunAt}`} />
            )}
            <Button variant="primary" size="small" onClick={() => onNavigate?.("workspace")}>
              → My Workspace
            </Button>
          </Stack>
        </Stack>
      </Card>

      {/* ── Active PLR Review banner ────────────────────────────────────────── */}
      <div className="cat-plr-banner">
        <div className="cat-plr-banner__left">
          <span className="cat-plr-banner__label">Active PLR Review</span>
          <span className="cat-plr-banner__name">{ACTIVE_PLR.name}</span>
          <span className="cat-plr-banner__meta">
            {ACTIVE_PLR.dept} · {ACTIVE_PLR.season} · Updated: {ACTIVE_PLR.updated}
          </span>
        </div>
        <div className="cat-plr-banner__actions">
          <Button variant="primary" size="small" onClick={() => onNavigate?.("national")}>
            National Core →
          </Button>
          <Button variant="secondary" size="small" onClick={() => onNavigate?.("approval")}>
            PLR Status →
          </Button>
        </div>
      </div>

      {/* ── Tier strip ─────────────────────────────────────────────────────── */}
      <div className="cat-tier-strip">
        {[
          { label: "National Core", n: coreCount,              icon: "🔒", color: "var(--color-success)" },
          { label: "Cluster Adds",  n: clusterCount,           icon: "🗂", color: "var(--color-teal)" },
          { label: "Store Picks",   n: storeCount,             icon: "📍", color: "var(--color-accent)" },
          { label: "Total SKUs",    n: CATALOGUE_SKUS.length,  icon: "📦", color: "var(--color-text-muted)" },
        ].map((t) => (
          <div key={t.label} className="cat-tier-chip" style={{ "--tc": t.color }}>
            <span className="cat-tier-icon">{t.icon}</span>
            <span className="cat-tier-n">{t.n}</span>
            <span className="cat-tier-lbl">{t.label}</span>
          </div>
        ))}
      </div>

      {/* ── SKU Table ──────────────────────────────────────────────────────── */}
      <Table
        cardContainer
        rowHeight={56}
        tableHeader={`All ${CATALOGUE_SKUS.length} Catalogue SKUs`}
        columnDefs={columns}
        rowData={rows}
        domLayout="autoHeight"
        defaultColDef={{ floatingFilter: true }}
        hideTableSetting
        hideTableActions
        pagination={false}
        getRowStyle={getRowStyle}
      />
    </Stack>
  );
}
