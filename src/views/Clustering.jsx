import React, { useMemo, useState } from "react";
import { Card, Button, Badge, Table } from "impact-ui";
import Text from "../components/Text.jsx";
import Stack from "../components/Stack.jsx";
import Grid from "../components/Grid.jsx";
import { color } from "../styles/tokens.js";
import {
  FD_CLUST_SCENARIOS,
  FD_OUTLIER_STORES,
  OUTLIER_OPTIONS,
  STORE_COUNT,
  TIER_BADGE,
  VEL_COLOR,
  BAND_PCT,
  clusterStores,
  scenarioTagline,
} from "../data/clustering.js";
import "./Clustering.css";

const panelSx = {
  maxWidth: "none",
  minHeight: "auto",
  width: "100%",
  padding: "var(--sp-4)",
  border: "1px solid var(--color-border)",
  borderRadius: "var(--r)",
  boxShadow: "var(--sh)",
  background: "var(--color-surface)",
};

const sidebarSx = { ...panelSx, padding: 0, width: 264, minWidth: 264, overflow: "hidden" };
const PREVIEW_COLS = "56px 1fr 92px 46px 50px 48px 60px";
const cap = (s) => (s ? s.charAt(0).toUpperCase() + s.slice(1) : "");

function SignalChips({ signals, size = "small" }) {
  if (!signals || !signals.length) return null;
  return (
    <Stack direction="row" gap={1} wrap>
      {signals.map((s) => (
        <Badge key={s} variant="subtle" size={size} color="success" label={s} />
      ))}
    </Stack>
  );
}

export default function Clustering({ onNavigate }) {
  const [scenarioId, setScenarioId] = useState("B");
  const [activeClId, setActiveClId] = useState(null);
  const [outlierDecisions, setOutlierDecisions] = useState({});

  const sc = FD_CLUST_SCENARIOS[scenarioId] || FD_CLUST_SCENARIOS.B;
  const activeCl = sc.clusters.find((c) => c.id === activeClId) || null;

  const selectScenario = (id) => { setScenarioId(id); setActiveClId(null); };
  const toggleCluster = (id) => setActiveClId((prev) => (prev === id ? null : id));
  const setOutlier = (id, decision) => setOutlierDecisions((prev) => ({ ...prev, [id]: decision }));

  const scoreChips = [
    { l: "Composite", v: `${sc.composite}%`, tone: "primary" },
    { l: "Statistical", v: `${sc.statScore}%`, tone: "info" },
    { l: "Business", v: `${sc.bizScore}%`, tone: "accent" },
  ];

  /* Single-cluster detail table */
  const detailRows = useMemo(
    () => (activeCl ? clusterStores(activeCl).map((s) => ({ ...s, bandPct: BAND_PCT[s.velocity] || "—" })) : []),
    [activeCl]
  );
  const detailColumns = useMemo(
    () => [
      { field: "id", headerName: "Store #", width: 96, cellStyle: { fontFamily: "var(--font-mono)", color: color.teal, fontWeight: 700 } },
      { field: "name", headerName: "Store Name", minWidth: 160, flex: 1 },
      { field: "region", headerName: "Region", width: 130 },
      { field: "market", headerName: "Market", width: 120 },
      { field: "state", headerName: "State", width: 78 },
      { field: "dc", headerName: "DC", width: 78 },
      { field: "velocity", headerName: "Vel.", width: 78, cellStyle: (p) => ({ color: VEL_COLOR[p.value] || color.text, fontWeight: 700 }) },
      { field: "bandPct", headerName: "Band %", width: 90 },
      {
        field: "action", headerName: "Action", width: 120, sortable: false,
        cellRenderer: () => (
          <Button variant="tertiary" size="small" onClick={() => onNavigate && onNavigate("store-curation")}>Curate →</Button>
        ),
      },
    ],
    [onNavigate]
  );

  return (
    <Stack direction="column" gap={4}>
      {/* Header */}
      <Card sx={panelSx}>
        <Stack direction="column" gap={3}>
          <Stack direction="row" justify="space-between" align="flex-start" gap={4} wrap>
            <Stack direction="column" gap={1} flex="1 1 auto" style={{ minWidth: 0 }}>
              <Text variant="title">Location Clustering</Text>
              <Text variant="caption" tone="muted">{STORE_COUNT} stores · {sc.clusters.length} clusters · {sc.name}</Text>
            </Stack>
            <Stack direction="row" gap={2} wrap>
              {scoreChips.map((m) => (
                <div key={m.l} className="cl-score">
                  <Text variant="body-strong" tone={m.tone}>{m.v}</Text>
                  <Text variant="micro" tone="subtle">{m.l}</Text>
                </div>
              ))}
            </Stack>
          </Stack>

          <Grid columns="1fr 1fr 1fr" gap={2}>
            {["A", "B", "C"].map((sid) => {
              const s2 = FD_CLUST_SCENARIOS[sid];
              const on = scenarioId === sid;
              return (
                <Stack key={sid} className={`cl-scenario${on ? " is-active" : ""}`} direction="column" gap={1} onClick={() => selectScenario(sid)}>
                  <Text variant="caption" tone={on ? "primary" : "default"} style={{ fontWeight: 700 }}>{sid}. {s2.badge}{on ? " ✓" : ""}</Text>
                  <Text variant="micro" tone={on ? "default" : "subtle"}>{scenarioTagline(s2.name)}</Text>
                </Stack>
              );
            })}
          </Grid>
        </Stack>
      </Card>

      {/* Body */}
      <Stack className="cl-body" direction="row" gap={4} wrap>
        {/* Sidebar: cluster list + outliers */}
        <Card sx={sidebarSx}>
          <Stack className="cl-sidebar" direction="column" gap={0}>
            <Stack className="cl-section-label" direction="row">
              <Text variant="micro" tone="subtle" style={{ fontWeight: 700, textTransform: "uppercase", letterSpacing: ".06em" }}>{sc.clusters.length} clusters — click to drill in</Text>
            </Stack>
            {sc.clusters.map((cl) => {
              const on = activeClId === cl.id;
              return (
                <Stack key={cl.id} className={`cl-clusterrow${on ? " is-active" : ""}`} direction="column" gap={1} onClick={() => toggleCluster(cl.id)} style={{ borderLeftColor: on ? cl.color : "transparent" }}>
                  <Stack direction="row" align="center" gap={2}>
                    <span className="cl-dot" style={{ background: cl.color }} />
                    <Text variant="caption" tone="strong" style={{ flex: 1, minWidth: 0 }} truncate>{cl.label}</Text>
                    <Badge variant="subtle" size="small" color={TIER_BADGE[cl.tier] || "info"} label={cap(cl.tier)} />
                  </Stack>
                  <Text variant="micro" tone="subtle" style={{ marginLeft: 18 }}>{cl.stores.length} stores · ${cl.revSqft}/sqft · {cl.st}% ST</Text>
                </Stack>
              );
            })}

            {FD_OUTLIER_STORES.length ? (
              <>
                <Stack className="cl-section-label" direction="row">
                  <Text variant="micro" tone="warning" style={{ fontWeight: 700, textTransform: "uppercase", letterSpacing: ".06em" }}>⚠ Outliers</Text>
                </Stack>
                {FD_OUTLIER_STORES.map((o) => {
                  const dec = outlierDecisions[o.id];
                  return (
                    <Stack key={o.id} direction="column" gap={2} paddingX={3} paddingY={2} style={{ borderBottom: "1px solid var(--color-border)" }}>
                      <Text variant="caption" tone="error" style={{ fontWeight: 600 }}>{o.name}</Text>
                      <Text variant="micro" tone="subtle">{o.reason}</Text>
                      {dec ? (
                        <Badge variant="subtle" size="small" color="success" label={dec} />
                      ) : (
                        <Stack direction="row" gap={1} wrap>
                          {OUTLIER_OPTIONS.map((opt) => (
                            <Button key={opt} variant="secondary" size="small" onClick={() => setOutlier(o.id, opt)}>{opt}</Button>
                          ))}
                        </Stack>
                      )}
                    </Stack>
                  );
                })}
              </>
            ) : null}
          </Stack>
        </Card>

        {/* Detail */}
        <Stack direction="column" gap={3} flex="1 1 420px" style={{ minWidth: 0 }}>
          <Card sx={{ ...panelSx, padding: "var(--sp-3) var(--sp-4)", background: "var(--color-surface-alt)", borderColor: "var(--color-teal)" }}>
            <Text variant="caption" tone="default">{sc.note}</Text>
          </Card>

          {!activeCl ? (
            <Stack direction="column" gap={3}>
              <Text variant="body-strong" tone="strong">{sc.name} — all clusters</Text>
              {sc.clusters.map((cl) => {
                const stores = clusterStores(cl);
                return (
                  <div key={cl.id} style={{ borderRadius: "var(--r)", border: "1px solid var(--color-border)", overflow: "hidden", background: "var(--color-surface)", boxShadow: "var(--sh)" }}>
                    <Stack direction="row" align="center" gap={3} paddingX={4} paddingY={3} style={{ background: "var(--color-surface-alt)", borderBottom: "1px solid var(--color-border)" }} wrap>
                      <span className="cl-dot" style={{ width: 12, height: 12, background: cl.color }} />
                      <Stack direction="column" gap={0} flex="1 1 auto" style={{ minWidth: 0 }}>
                        <Text variant="caption" tone="strong">{cl.label}</Text>
                        <Text variant="micro" tone="subtle">{stores.length} stores · ${cl.revSqft}/sqft avg · {cl.st}% sell-through</Text>
                      </Stack>
                      <SignalChips signals={cl.signals} />
                    </Stack>

                    <Grid className="cl-storehead" columns={PREVIEW_COLS} gap={0}>
                      {["Store #", "Name", "Market", "State", "DC", "Vel.", "Band %"].map((c) => (
                        <Text key={c} variant="micro" tone="subtle" style={{ fontWeight: 700, textTransform: "uppercase" }}>{c}</Text>
                      ))}
                    </Grid>
                    {stores.map((s, i) => (
                      <Grid key={s.id} className={`cl-storerow${i % 2 ? "" : " alt"}`} columns={PREVIEW_COLS} gap={0}>
                        <Text variant="micro" tone="default" mono style={{ fontWeight: 700, color: color.teal }}>{s.id}</Text>
                        <Text variant="micro" tone="default" truncate>{s.name}</Text>
                        <Text variant="micro" tone="muted">{s.market}</Text>
                        <Text variant="micro" tone="subtle" mono>{s.state}</Text>
                        <Text variant="micro" tone="subtle" mono>{s.dc}</Text>
                        <Text variant="micro" mono style={{ color: VEL_COLOR[s.velocity] || color.text, fontWeight: 700 }}>{s.velocity}</Text>
                        <Text variant="micro" tone="muted" mono>{BAND_PCT[s.velocity] || "—"}</Text>
                      </Grid>
                    ))}
                  </div>
                );
              })}
            </Stack>
          ) : (
            <Stack direction="column" gap={3}>
              <Stack direction="row" align="center" gap={2} wrap>
                <span className="cl-dot" style={{ width: 14, height: 14, background: activeCl.color }} />
                <Text variant="heading" tone="strong">{activeCl.label}</Text>
                <Button variant="secondary" size="small" onClick={() => setActiveClId(null)} style={{ marginLeft: "auto" }}>← All clusters</Button>
              </Stack>
              <Text variant="caption" tone="subtle">{clusterStores(activeCl).length} stores · ${activeCl.revSqft}/sqft · {activeCl.st}% ST</Text>
              <SignalChips signals={activeCl.signals} size="medium" />
              <Table cardContainer rowHeight="compact" tableHeader={activeCl.label} columnDefs={detailColumns} rowData={detailRows} domLayout="autoHeight" hideTableSetting hideTableActions pagination={false} />
              <div>
                <Button variant="primary" size="medium" onClick={() => onNavigate && onNavigate("store-curation")}>Open store curation →</Button>
              </div>
            </Stack>
          )}
        </Stack>
      </Stack>
    </Stack>
  );
}
