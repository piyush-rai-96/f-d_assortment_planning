import React, { useMemo, useState, useEffect, useRef } from "react";
import { Card, Button, Badge, Input, TextArea, Chips, FiltersStrip, FilterPanel, EmptyState } from "impact-ui";
import {
  Bot, ClipboardList, X,
  Swords, MapPin, Users, PackageSearch, Truck, TrendingUp,
  TrendingDown, ArrowUpRight,
  Zap, Calendar, CalendarCheck, Eye,
  Store, TreePine, Layers, Hexagon,
  MessageSquare, UsersRound, ShieldCheck,
  Building2,
} from "lucide-react";
import FdSelect from "../components/FdSelect.jsx";
import Text from "../components/Text.jsx";
import Stack from "../components/Stack.jsx";
import Grid from "../components/Grid.jsx";
import SkuSwatch from "../components/SkuSwatch.jsx";
import {
  INTEL_SEED,
  CATALOGUE_SKUS,
  CLUSTER_NAMES,
  TYPE_OPTIONS,
  DIRECTION_OPTIONS,
  URGENCY_OPTIONS,
  SCOPE_OPTIONS,
  CONFIDENCE_OPTIONS,
  TYPE_BADGE,
  DIR_BADGE,
  URGENCY_BADGE,
  STATUS_BADGE,
} from "../data/intel.js";
import { popIntelHighlight } from "../data/intelStore.js";
import "./MarketIntel.css";
import { panelSx, softSx } from "../styles/panelSx.js";

const EMPTY_LOG = {
  type: null, direction: null, urgency: null, scope: null,
  dept: null,
  title: "", body: "", skus: [], confidence: null, skuPick: "", submitted: false,
};

const DEPT_OPTIONS = ["All", "Wood", "Tile", "Laminate & Vinyl"];

const TYPE_TINT = {
  competitive: { bg: "var(--color-error-soft)", fg: "var(--color-error)" },
  market: { bg: "var(--color-info-soft)", fg: "var(--color-info)" },
  customer: { bg: "var(--color-success-soft)", fg: "var(--color-success)" },
  product: { bg: "var(--color-warning-soft)", fg: "var(--color-warning)" },
  supply: { bg: "var(--color-error-soft)", fg: "var(--color-error)" },
  trend: { bg: "var(--color-info-soft)", fg: "var(--color-info)" },
};

function Tag({ tint, children }) {
  return (
    <span className="mi-tag" style={tint ? { background: tint.bg, color: tint.fg } : undefined}>
      {children}
    </span>
  );
}

const CAT_NAME = Object.fromEntries(CATALOGUE_SKUS.map((s) => [s.id, s.name]));

function SkuChip({ children }) {
  const code = typeof children === "string" ? children : "";
  const name = CAT_NAME[code] || code;
  return (
    <Stack
      direction="row" align="center" gap={1}
      style={{ border: "1px solid var(--color-border)", borderRadius: "var(--r2)", background: "var(--color-surface)", padding: "2px 7px 2px 3px" }}
    >
      <SkuSwatch desc={name} size={16} />
      <Text variant="micro" mono style={{ color: "var(--color-accent)" }}>{code}</Text>
    </Stack>
  );
}

function NoteBox({ tone, label, children }) {
  const bg = { warning: "var(--color-warning-soft)", teal: "var(--color-surface-alt)", accent: "var(--color-primary-soft)" }[tone] || "var(--color-surface-alt)";
  const bd = { warning: "var(--color-warning)", teal: "var(--color-teal)", accent: "var(--color-primary)" }[tone] || "var(--color-border)";
  return (
    <Stack direction="column" gap={1} paddingX={3} paddingY={2}
      style={{ background: bg, border: `1px solid ${bd}`, borderRadius: "var(--r2)" }}
    >
      <Text variant="micro" style={{ fontWeight: 700, color: bd }}>{label}</Text>
      <Text variant="caption" style={{ lineHeight: 1.6, color: "var(--color-text)" }}>{children}</Text>
    </Stack>
  );
}

/* Signal card rendered in the 2-col grid */
function SignalCard({ i, isSelected, fromPortfolio, onSelect, onMarkReviewed, onApplyModel, onCatTask, onFieldReq, onWatch, onDismiss }) {
  const isThreat = i.direction === "threat";
  const hasActions =
    i.status === "new" ||
    i.status === "reviewed" ||
    ((i.status === "actioned" || i.status === "watching") && i.merchantNote);

  return (
    <div
      className={`mi-signal-card mi-signal-card--${i.direction}${isSelected ? " mi-signal-card--selected" : ""}${i.id === fromPortfolio ? " mi-signal-card--portfolio" : ""}`}
      onClick={onSelect}
    >
      {/* ── Top: title + status badge ── */}
      <div className="mi-sc-top">
        <div className="mi-sc-title">{i.title}</div>
        <Badge variant="subtle" size="small" color={STATUS_BADGE[i.status]} label={i.status} />
      </div>

      {/* ── Meta row: author/date on left, scope pill on right ── */}
      <div className="mi-sc-meta">
        <span>{i.author} · {i.date}</span>
        <span className="mi-sc-scope-pill">
          {i.scope}{i.store ? ` · ${i.store}` : ""}
        </span>
      </div>

      {/* ── Compact tag row: type + direction + urgency + icons ── */}
      <div className="mi-sc-tags">
        <Tag tint={TYPE_TINT[i.type]}>{i.type}</Tag>
        <span className={`mi-dir-badge mi-dir-badge--${i.direction}`}>
          {isThreat ? "↓" : "↑"} {i.direction}
        </span>
        {i.urgency !== "watch" ? (
          <span className={`mi-urg-badge mi-urg-badge--${i.urgency}`}>{i.urgency}</span>
        ) : null}
        {i.feedsModel && (
          <span className="mi-sc-indicator mi-sc-indicator--model" title="Feeds agent model">
            <Bot size={10} aria-hidden="true" />
          </span>
        )}
        {i.catalogueGap && (
          <span className="mi-sc-indicator mi-sc-indicator--gap" title="Catalogue gap">gap</span>
        )}
      </div>

      {/* ── Body — 2-line CSS clamp ── */}
      <div className="mi-sc-body">{i.body}</div>

      {/* ── Footer: SKUs + actions ── */}
      {(i.skus.length > 0 || hasActions) && (
        <div className="mi-sc-footer" onClick={(e) => e.stopPropagation()}>
          {i.skus.length > 0 && (
            <div className="mi-sc-skus">
              {i.skus.map((s) => <SkuChip key={s}>{s}</SkuChip>)}
            </div>
          )}
          {hasActions && (
            <div className="mi-sc-actions">
              {i.status === "new" && (
                <Button size="small" variant="secondary" onClick={() => onMarkReviewed(i.id)}>Mark reviewed</Button>
              )}
              {(i.status === "new" || i.status === "reviewed") && i.feedsModel && (
                <Button size="small" variant="primary" onClick={() => onApplyModel(i.id)}>Apply to model</Button>
              )}
              {(i.status === "new" || i.status === "reviewed") && i.catalogueGap && (
                <Button size="small" variant="secondary" onClick={() => onCatTask(i.id)}>Line Gap</Button>
              )}
              {(i.status === "new" || i.status === "reviewed") && i.direction === "opportunity" && !i.feedsModel && (
                <Button size="small" variant="secondary" onClick={() => onFieldReq(i.id)}>Field Request</Button>
              )}
              {i.status === "reviewed" && (
                <>
                  <Button size="small" variant="secondary" onClick={() => onWatch(i.id)}>Watch</Button>
                  <Button size="small" variant="secondary" type="destructive" onClick={() => onDismiss(i.id)}>Dismiss</Button>
                </>
              )}
              {(i.status === "actioned" || i.status === "watching") && i.merchantNote && (
                <span className="mi-actioned-note">{i.merchantNote}</span>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function MarketIntel() {
  const [view, setView] = useState("inbox");
  const [intel, setIntel] = useState(INTEL_SEED);
  const [statusTab, setStatusTab] = useState("all");
  const [dirFilter, setDirFilter] = useState(null);
  const [typeFilter, setTypeFilter] = useState(null);
  const [selectedId, setSelectedId] = useState(null);
  const [noteDraft, setNoteDraft] = useState("");
  const [log, setLog] = useState(EMPTY_LOG);
  const [fromPortfolio, setFromPortfolio] = useState(null);
  const [toast, setToast] = useState(null);
  const [filterPanelOpen, setFilterPanelOpen] = useState(false);
  const [activeFilterTab, setActiveFilterTab] = useState("status");
  const highlightedRowRef = useRef(null);
  const toastTimer = useRef(null);

  const showToast = (msg, tone = "success") => {
    if (toastTimer.current) clearTimeout(toastTimer.current);
    setToast({ msg, tone });
    toastTimer.current = setTimeout(() => setToast(null), 3200);
  };

  useEffect(() => {
    const id = popIntelHighlight();
    if (id) {
      setSelectedId(id);
      setFromPortfolio(id);
      setStatusTab("all");
      setDirFilter(null);
      setTypeFilter(null);
      const it = INTEL_SEED.find((i) => i.id === id);
      if (it) setNoteDraft(it.merchantNote || "");
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (fromPortfolio && highlightedRowRef.current) {
      highlightedRowRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [fromPortfolio]);

  const selected = useMemo(() => intel.find((i) => i.id === selectedId) || null, [intel, selectedId]);

  const filtered = useMemo(
    () =>
      intel.filter((i) => {
        if (statusTab !== "all" && i.status !== statusTab) return false;
        if (dirFilter && i.direction !== dirFilter) return false;
        if (typeFilter && i.type !== typeFilter) return false;
        return true;
      }),
    [intel, statusTab, dirFilter, typeFilter]
  );

  /* ── Metrics ──────────────────────────────────────────────────────────── */
  const total = intel.length;
  const newCount = intel.filter((i) => i.status === "new").length;
  const threats = intel.filter((i) => i.direction === "threat").length;
  const opps = intel.filter((i) => i.direction === "opportunity").length;
  const feedModel = intel.filter((i) => i.feedsModel).length;
  const metrics = [
    { v: total, l: "Total signals", tone: "strong" },
    { v: newCount, l: "Awaiting review", tone: "error" },
    { v: threats, l: "Threat signals", tone: "error" },
    { v: opps, l: "Opportunities", tone: "success" },
    { v: feedModel, l: "Feed model", tone: "accent" },
  ];

  /* ── Mutations ────────────────────────────────────────────────────────── */
  const patch = (id, fields) => setIntel((prev) => prev.map((i) => (i.id === id ? { ...i, ...fields } : i)));
  const selectIntel = (id) => {
    setSelectedId((prev) => (prev === id ? null : id));
    const it = intel.find((i) => i.id === id);
    setNoteDraft(it?.merchantNote || "");
  };
  const saveNote = (id) => { patch(id, { merchantNote: noteDraft }); showToast("Note saved"); };

  /* ── Filter handlers ──────────────────────────────────────────────────── */
  const setStatus = (key) => { setStatusTab(key); setDirFilter(null); setTypeFilter(null); };
  const toggleDir = (key) => { setDirFilter((d) => (d === key ? null : key)); setStatusTab("all"); };
  const toggleType = (key) => { setTypeFilter((t) => (t === key ? null : key)); setStatusTab("all"); };

  /* ── Card actions ─────────────────────────────────────────────────────── */
  const markReviewed = (id) => { patch(id, { status: "reviewed" }); showToast('Status updated to "reviewed"'); };
  const applyToModel = (id) => {
    patch(id, { status: "actioned" });
    showToast("Applied to model — confidence scores updated. Visible in Catalogue.", "accent");
  };
  const createCatalogueTask = (id) => { patch(id, { status: "actioned" }); showToast("Line gap added to Portfolio Build"); };
  const sendFieldRequest = (id) => { patch(id, { status: "actioned" }); showToast("Field request sent to Portfolio Build"); };
  const watchSignal = (id) => { patch(id, { status: "watching" }); showToast("Signal added to Watch list"); };
  const dismissSignal = (id) => {
    patch(id, { status: "dismissed" });
    if (selectedId === id) setSelectedId(null);
    showToast("Signal dismissed", "error");
  };

  /* ── Log form ─────────────────────────────────────────────────────────── */
  const setLogField = (key, val) => setLog((p) => ({ ...p, [key]: p[key] === val ? null : val }));
  const addSku = () => setLog((p) => (p.skuPick && !p.skus.includes(p.skuPick) ? { ...p, skus: [...p.skus, p.skuPick], skuPick: "" } : p));
  const removeSku = (s) => setLog((p) => ({ ...p, skus: p.skus.filter((x) => x !== s) }));
  const submitLog = () => {
    if (!log.type || !log.direction || !log.title.trim() || !log.body.trim()) {
      showToast("Please fill in all required fields", "error");
      return;
    }
    const entry = {
      id: `I-${String(100 + intel.length + 1)}`,
      type: log.type, direction: log.direction, urgency: log.urgency || "watch", scope: log.scope || "store",
      cluster: "Southeast Suburban", store: "ATL-01", title: log.title, body: log.body,
      skus: [...log.skus], categories: [], confidence: log.confidence || "anecdotal",
      modelInstruction: log.skus.length
        ? `Signal logged: ${log.type} / ${log.direction}. Affects ${log.skus.join(", ")}. Pending merchant review before model update.`
        : null,
      dept: log.dept || null,
      feedsModel: !!(log.skus.length || log.dept), status: "new", author: "Lisa T.", authorRole: "Store Manager",
      date: "Jun 3, 2025", escalated: false, merchantNote: "",
    };
    setIntel((prev) => [entry, ...prev]);
    setLog({ ...EMPTY_LOG, submitted: true });
  };

  const countBy = (pred) => intel.filter(pred).length;

  /* ── Derived filter tags for FiltersStrip ─────────────────────────────── */
  const miFilterTags = useMemo(() => {
    const tags = [];
    if (statusTab !== "all") tags.push({ id: "status", label: "Status", values: [{ id: 1, label: statusTab }] });
    if (dirFilter) tags.push({ id: "dir", label: "Direction", values: [{ id: 1, label: dirFilter }] });
    if (typeFilter) {
      const opt = TYPE_OPTIONS.find((t) => t.id === typeFilter);
      tags.push({ id: "type", label: "Type", values: [{ id: 1, label: opt?.label || typeFilter }] });
    }
    return tags;
  }, [statusTab, dirFilter, typeFilter]);

  const STATUS_FD_OPTIONS = [
    { value: "all", label: `All (${intel.length})` },
    { value: "new", label: `New (${newCount})` },
    { value: "reviewed", label: `Reviewed (${countBy((i) => i.status === "reviewed")})` },
    { value: "actioned", label: `Actioned (${countBy((i) => i.status === "actioned")})` },
  ];
  const DIR_FD_OPTIONS = [
    { value: "threat", label: `Threats (${threats})` },
    { value: "opportunity", label: `Opps (${opps})` },
  ];
  const TYPE_FD_OPTIONS = TYPE_OPTIONS.map((t) => ({ value: t.id, label: t.label }));

  const miFilterPanelTabs = [
    {
      value: "status",
      title: "Status",
      numberOfFilter: statusTab !== "all" ? 1 : 0,
      children: (
        <Stack direction="column" gap={3} style={{ padding: "var(--sp-4)" }}>
          <FdSelect
            label="Signal Status"
            value={statusTab}
            options={STATUS_FD_OPTIONS}
            onChange={(v) => setStatus(v)}
            width={320}
          />
        </Stack>
      ),
    },
    {
      value: "direction",
      title: "Direction",
      numberOfFilter: dirFilter ? 1 : 0,
      children: (
        <Stack direction="column" gap={3} style={{ padding: "var(--sp-4)" }}>
          <FdSelect
            label="Direction"
            value={dirFilter || ""}
            options={[{ value: "", label: "All directions" }, ...DIR_FD_OPTIONS]}
            onChange={(v) => { if (v === "") setDirFilter(null); else setDirFilter(v); }}
            width={320}
          />
        </Stack>
      ),
    },
    {
      value: "type",
      title: "Type",
      numberOfFilter: typeFilter ? 1 : 0,
      children: (
        <Stack direction="column" gap={3} style={{ padding: "var(--sp-4)" }}>
          <FdSelect
            label="Signal Type"
            value={typeFilter || ""}
            options={[{ value: "", label: "All types" }, ...TYPE_FD_OPTIONS]}
            onChange={(v) => { if (v === "") setTypeFilter(null); else setTypeFilter(v); }}
            width={320}
          />
        </Stack>
      ),
    },
  ];

  /* ── Cluster map data ─────────────────────────────────────────────────── */
  const clusterData = useMemo(() => {
    const data = {};
    CLUSTER_NAMES.forEach((c) => { data[c] = { threats: 0, opps: 0, signals: [] }; });
    intel.forEach((i) => {
      const targets = i.scope === "national" ? CLUSTER_NAMES : i.cluster ? [i.cluster] : [];
      targets.forEach((t) => {
        if (data[t]) {
          data[t][i.direction === "threat" ? "threats" : "opps"]++;
          data[t].signals.push(i);
        }
      });
    });
    return data;
  }, [intel]);

  /* ═══════════════ SIDEBAR (signal list only) ═══════════════ */
  const sidebar = (
    <div className="mi-sidebar-pane">
      <div className="mi-filter-scroll">
        <div className="mi-filter-label">{filtered.length} signal{filtered.length !== 1 ? "s" : ""}</div>
        <div className="mi-list-items">
          {filtered.length === 0 ? (
            <div className="mi-list-empty">No signals match current filters.</div>
          ) : (
            filtered.map((i) => (
              <div
                key={i.id}
                ref={i.id === fromPortfolio ? highlightedRowRef : undefined}
                className={`mi-list-row${selectedId === i.id ? " is-active" : ""}${i.id === fromPortfolio ? " is-from-portfolio" : ""}`}
                onClick={() => selectIntel(i.id)}
              >
                <span className={`mi-dir-dot is-${i.direction}`} aria-hidden>
                  {i.direction === "threat" ? "↓" : "↑"}
                </span>
                <div className="mi-list-row-body">
                  <div className="mi-list-row-title">{i.title}</div>
                  <div className="mi-list-row-meta">
                    <Tag tint={TYPE_TINT[i.type]}>{i.type}</Tag>
                    {i.status === "new" ? <span className="mi-new-dot" title="New" /> : null}
                    <span className="mi-list-row-date">{i.date}</span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Footer CTA */}
      <div className="mi-sidebar-footer">
        <Button
          variant="primary" size="medium"
          onClick={() => { setView("log"); setLog(EMPTY_LOG); }}
          style={{ width: "100%" }}
        >
          + Log new intelligence
        </Button>
      </div>
    </div>
  );

  /* ═══════════════ METRIC STRIP ═══════════════ */
  const metricStrip = (
    <div className="mi-metric-strip">
      {metrics.map((m) => (
        <div key={m.l} className="mi-metric">
          <span className={`mi-metric-accent tone-${m.tone}`} />
          <span className={`mi-metric-num tone-${m.tone}`}>{m.v}</span>
          <span className="mi-metric-label">{m.l}</span>
        </div>
      ))}
    </div>
  );

  /* ═══════════════ INBOX (card grid) ═══════════════ */
  const TABS = [
    { id: "all", label: "All signals" },
    { id: "new", label: `New  (${newCount})` },
    { id: "actioned", label: "Actioned" },
    { id: "watching", label: "Watching" },
  ];

  const cardGrid = (
    <div className="mi-main-scroll">
      {metricStrip}
      <div className="mi-tabs-row">
        {TABS.map((t) => (
          <Chips key={t.id} label={t.label} isActive={statusTab === t.id} onClick={() => setStatus(t.id)} />
        ))}
      </div>
      {filtered.length === 0 ? (
        <div className="mi-cards-empty">
          <EmptyState
            title="No signals match"
            description="Try adjusting or clearing your filters to see more market intelligence."
          />
        </div>
      ) : (
        <div className="mi-cards-grid">
          {filtered.map((i) => (
            <SignalCard
              key={i.id}
              i={i}
              isSelected={selectedId === i.id}
              fromPortfolio={fromPortfolio}
              onSelect={() => selectIntel(i.id)}
              onMarkReviewed={markReviewed}
              onApplyModel={applyToModel}
              onCatTask={createCatalogueTask}
              onFieldReq={sendFieldRequest}
              onWatch={watchSignal}
              onDismiss={dismissSignal}
            />
          ))}
        </div>
      )}
    </div>
  );

  /* ═══════════════ SIGNAL DETAIL (right panel) ═══════════════ */
  const detailPanel = selected && (
    <div className="mi-detail-inner">
      {/* Close row */}
      <div className="mi-detail-close-row">
        <span className="mi-detail-label">Signal detail</span>
        <button className="mi-detail-close-btn" onClick={() => setSelectedId(null)} aria-label="Close detail">
          <X size={16} />
        </button>
      </div>

      {/* Body */}
      <div className="mi-detail-body">
        {/* Title + badges */}
        <div className="mi-detail-title">{selected.title}</div>
        <div className="mi-signal-tags" style={{ marginBottom: "var(--sp-3)" }}>
          <Tag tint={TYPE_TINT[selected.type]}>{selected.type}</Tag>
          <span className={`mi-dir-badge mi-dir-badge--${selected.direction}`}>
            {selected.direction === "threat" ? "↓" : "↑"} {selected.direction}
          </span>
          {selected.urgency !== "watch" ? (
            <span className={`mi-urg-badge mi-urg-badge--${selected.urgency}`}>{selected.urgency}</span>
          ) : null}
          <Badge variant="subtle" size="small" color={STATUS_BADGE[selected.status]} label={selected.status} />
        </div>

        {/* Metadata grid */}
        <div className="mi-detail-meta-card">
          {[
            ["Author", `${selected.author} · ${selected.authorRole}`],
            ["Date", selected.date],
            ["Scope", `${selected.scope}${selected.store ? ` · ${selected.store}` : ""}${selected.cluster ? ` / ${selected.cluster}` : ""}`],
            ["Confidence", selected.confidence],
          ].map(([l, v]) => (
            <div key={l} className="mi-detail-meta-row">
              <span className="mi-detail-meta-lbl">{l}</span>
              <span className="mi-detail-meta-val">{v}</span>
            </div>
          ))}
        </div>

        {/* Full body */}
        <div className="mi-detail-full-body">{selected.body}</div>

        {/* Affected SKUs */}
        {selected.skus.length > 0 && (
          <div className="mi-detail-section">
            <div className="mi-detail-section-label">Affected SKUs</div>
            <div className="mi-signal-skus">
              {selected.skus.map((s) => <SkuChip key={s}>{s}</SkuChip>)}
            </div>
          </div>
        )}

        {/* Model instruction */}
        {selected.feedsModel && selected.modelInstruction && (
          <NoteBox tone="accent" label="Agent model instruction">{selected.modelInstruction}</NoteBox>
        )}

        {/* Catalogue gap */}
        {selected.catalogueGap && (
          <NoteBox tone="warning" label="Catalogue gap flagged">{selected.catalogueRequest}</NoteBox>
        )}

        {/* Merchant note display */}
        {selected.merchantNote && (
          <NoteBox tone="teal" label="Merchant note">{selected.merchantNote}</NoteBox>
        )}

        {/* Merchant note input */}
        <div className="mi-detail-section">
          <div className="mi-detail-section-label">Add merchant note</div>
          <TextArea
            placeholder="Note for tracking — visible to merchant team only…"
            value={noteDraft}
            onChange={(e) => setNoteDraft(e.target.value)}
            width="100%"
            height="72px"
          />
        </div>

        {/* Detail action buttons */}
        <div className="mi-detail-actions">
          {(selected.status === "new" || selected.status === "reviewed") && selected.feedsModel && (
            <Button variant="primary" size="medium" onClick={() => applyToModel(selected.id)} style={{ width: "100%" }}>
              Apply structured tags to model
            </Button>
          )}
          {(selected.status === "new" || selected.status === "reviewed") && selected.catalogueGap && (
            <Button variant="secondary" size="medium" onClick={() => createCatalogueTask(selected.id)} style={{ width: "100%" }}>
              Create catalogue task
            </Button>
          )}
          <div className="mi-detail-actions-row">
            {selected.status === "new" && (
              <Button variant="secondary" size="small" onClick={() => markReviewed(selected.id)}>
                Mark reviewed
              </Button>
            )}
            {selected.status !== "actioned" && (
              <Button variant="secondary" size="small" onClick={() => saveNote(selected.id)}>
                Save note
              </Button>
            )}
            <Button variant="secondary" size="small" onClick={() => watchSignal(selected.id)}>Watch</Button>
            <Button variant="secondary" size="small" type="destructive" onClick={() => dismissSignal(selected.id)}>Dismiss</Button>
          </div>
        </div>
      </div>
    </div>
  );

  /* ═══════════════ MAP VIEW ═══════════════ */
  const mapView = (
    <div className="mi-main-scroll">
      <div className="mi-map-legend">
        <Badge variant="subtle" size="small" color="error" label="Threat" />
        <Badge variant="subtle" size="small" color="success" label="Opportunity" />
        <Badge variant="subtle" size="small" color="info" label="Feeds model" />
      </div>
      <Grid columns={2} gap={3}>
        {CLUSTER_NAMES.map((cn) => {
          const cd = clusterData[cn];
          const totalSig = cd.signals.length;
          const urgImmediate = cd.signals.filter((s) => s.urgency === "immediate").length;
          const threatPct = totalSig > 0 ? Math.round((cd.threats / totalSig) * 100) : 0;
          return (
            <Card
              key={cn}
              sx={{ ...softSx, borderLeft: `3px solid ${cd.threats > 0 ? "var(--color-error)" : "var(--color-success)"}` }}
            >
              <Stack direction="column" gap={2}>
                <Stack direction="row" justify="space-between" align="center" gap={2}>
                  <Text variant="body-strong" tone="strong">{cn}</Text>
                  <Stack direction="row" gap={2} align="center">
                    {urgImmediate ? (
                      <Badge variant="subtle" size="small" color="error" label={`${urgImmediate} immediate`} />
                    ) : null}
                    <Text variant="micro" tone="subtle">{totalSig} signal{totalSig !== 1 ? "s" : ""}</Text>
                  </Stack>
                </Stack>
                <Stack direction="row" gap={2}>
                  <Stack direction="column" align="center" paddingX={3} paddingY={1}
                    style={{ background: "var(--color-error-soft)", borderRadius: "var(--r2)", minWidth: 56 }}>
                    <Text variant="kpi" tone="error">{cd.threats}</Text>
                    <Text variant="micro" tone="error">T</Text>
                  </Stack>
                  <Stack direction="column" align="center" paddingX={3} paddingY={1}
                    style={{ background: "var(--color-success-soft)", borderRadius: "var(--r2)", minWidth: 56 }}>
                    <Text variant="kpi" tone="success">{cd.opps}</Text>
                    <Text variant="micro" tone="success">O</Text>
                  </Stack>
                  <Stack direction="column" gap={1} flex="1 1 auto" style={{ minWidth: 0 }}>
                    {cd.signals.slice(0, 2).map((s) => (
                      <Text
                        key={s.id} variant="micro" tone="muted" truncate
                        style={{ cursor: "pointer" }}
                        onClick={() => { selectIntel(s.id); setView("inbox"); }}
                      >
                        {s.title}
                      </Text>
                    ))}
                    {cd.signals.length > 2 ? (
                      <Text variant="micro" tone="subtle">+{cd.signals.length - 2} more</Text>
                    ) : null}
                  </Stack>
                </Stack>
                {totalSig > 0 ? (
                  <div className="mi-bar">
                    <div className="mi-bar-threat" style={{ width: `${threatPct}%` }} />
                    <div className="mi-bar-opp" style={{ flex: 1 }} />
                  </div>
                ) : null}
              </Stack>
            </Card>
          );
        })}
      </Grid>
    </div>
  );

  /* ═══════════════ LOG FORM ═══════════════ */

  /* Per-type icon + accent color — Lucide icons */
  const TYPE_META = {
    competitive:  { icon: <Swords     size={20} />, accent: "#DC2626", soft: "#FEF2F2", border: "#FECACA" },
    market:       { icon: <MapPin     size={20} />, accent: "#2563EB", soft: "#EFF6FF", border: "#BFDBFE" },
    customer:     { icon: <Users      size={20} />, accent: "#059669", soft: "#ECFDF5", border: "#6EE7B7" },
    product:      { icon: <PackageSearch size={20} />, accent: "#D97706", soft: "#FFFBEB", border: "#FDE68A" },
    supply:       { icon: <Truck      size={20} />, accent: "#EA580C", soft: "#FFF7ED", border: "#FDBA74" },
    trend:        { icon: <TrendingUp size={20} />, accent: "#7C3AED", soft: "#F5F3FF", border: "#DDD6FE" },
  };
  const DIR_META = {
    threat:       { icon: <TrendingDown size={26} />, accent: "#DC2626", soft: "#FEF2F2", border: "#FECACA" },
    opportunity:  { icon: <ArrowUpRight size={26} />, accent: "#059669", soft: "#ECFDF5", border: "#6EE7B7" },
  };
  const URG_META = {
    immediate:    { icon: <Zap          size={18} />, accent: "#DC2626" },
    season:       { icon: <Calendar     size={18} />, accent: "#D97706" },
    next:         { icon: <CalendarCheck size={18} />, accent: "#2563EB" },
    watch:        { icon: <Eye          size={18} />, accent: "#6B7280" },
  };
  const CONF_META = {
    anecdotal:           { icon: <MessageSquare size={20} /> },
    "multiple customers":{ icon: <UsersRound   size={20} /> },
    confirmed:           { icon: <ShieldCheck  size={20} /> },
  };
  const DEPT_META = {
    All:              { icon: <Building2 size={20} />, accent: "#2563EB", soft: "#EFF6FF" },
    Wood:             { icon: <TreePine  size={20} />, accent: "#B45309", soft: "#FEF3C7" },
    Tile:             { icon: <Hexagon   size={20} />, accent: "#0B7A6C", soft: "#E6F7F4" },
    "Laminate & Vinyl":{ icon: <Layers   size={20} />, accent: "#6D28D9", soft: "#F5F3FF" },
  };

  /* Reusable section label */
  const SectionLabel = ({ label, required, step }) => (
    <div className="mi-form-section-label">
      {step && <span className="mi-form-step-num">{step}</span>}
      <span className="mi-form-label-text">{label}</span>
      {required && <span className="mi-form-required">required</span>}
    </div>
  );

  const feedsModelPreview = log.type && log.direction && (log.skus.length > 0 || log.dept);

  const logForm = log.submitted ? (
    /* ── Success state ── */
    <div className="mi-log-success-wrap">
      <div className="mi-log-success-card">
        <div className="mi-log-success-circle">✓</div>
        <Text variant="heading" tone="strong">Intel logged successfully</Text>
        <Text variant="caption" tone="muted" style={{ textAlign: "center", lineHeight: 1.6 }}>
          Your signal is in the merchant inbox.<br />Structured tags will feed the agent model at the next refresh.
        </Text>
        <Stack direction="row" gap={3}>
          <Button variant="primary" size="large" onClick={() => setLog(EMPTY_LOG)}>Log another signal</Button>
          <Button variant="secondary" size="large" onClick={() => { setView("inbox"); setLog(EMPTY_LOG); }}>
            Back to inbox
          </Button>
        </Stack>
      </div>
    </div>
  ) : (
    <div className="mi-log-layout">
      {/* ── Left: Form ── */}
      <Card sx={{ ...panelSx, padding: 0, overflow: "hidden" }}>
        {/* Form header strip */}
        <div className="mi-log-form-header">
          <div>
            <Text variant="body-strong" style={{ color: "#fff", fontWeight: 800 }}>Log market intelligence</Text>
            <Text variant="micro" style={{ color: "rgba(255,255,255,.6)", marginTop: 2, display: "block" }}>
              Raw intel goes to the merchant inbox. Structured tags feed the agent model.
            </Text>
          </div>
          <div className="mi-log-step-track">
            {["Signal", "Direction", "Context", "Details"].map((s, i) => (
              <div key={s} className={`mi-log-step-dot${
                (i === 0 && log.type) || (i === 1 && log.direction) || (i === 2 && (log.urgency || log.scope)) || (i === 3 && (log.title || log.body)) ? " is-done" : ""
              }`} title={s} />
            ))}
          </div>
        </div>

        <div className="mi-log-form-body">
          {/* ① Signal type */}
          <div className="mi-form-section">
            <SectionLabel label="Signal type" required step="①" />
            <div className="mi-choice-type-grid">
              {TYPE_OPTIONS.map((o) => {
                const m = TYPE_META[o.id] || {};
                const on = log.type === o.id;
                return (
                  <div key={o.id} className={`mi-choice-type${on ? " is-on" : ""}`}
                    style={on ? { borderColor: m.accent, background: m.soft } : {}}
                    onClick={() => setLogField("type", o.id)}>
                    <div className="mi-choice-type-top">
                      <div className="mi-choice-type-icon-wrap" style={{ background: on ? m.accent : `${m.accent}15`, color: on ? "#fff" : m.accent }}>
                        {m.icon}
                      </div>
                      <div className={`mi-choice-check${on ? " is-on" : ""}`} style={on ? { background: m.accent, borderColor: m.accent } : {}}>
                        {on && <span>✓</span>}
                      </div>
                    </div>
                    <div className="mi-choice-type-label" style={on ? { color: m.accent } : {}}>{o.label}</div>
                    <div className="mi-choice-type-desc">{o.desc}</div>
                    {on && <div className="mi-choice-type-accent" style={{ background: m.accent }} />}
                  </div>
                );
              })}
            </div>
          </div>

          {/* ② Direction */}
          <div className="mi-form-section">
            <SectionLabel label="Direction" required step="②" />
            <div className="mi-choice-dir-grid">
              {DIRECTION_OPTIONS.map((o) => {
                const m = DIR_META[o.id] || {};
                const on = log.direction === o.id;
                return (
                  <div key={o.id} className={`mi-choice-dir${on ? " is-on" : ""}`}
                    style={on ? { borderColor: m.accent, background: m.soft, boxShadow: `0 0 0 3px ${m.accent}1A` } : {}}
                    onClick={() => setLogField("direction", o.id)}>
                    <div className="mi-choice-dir-icon-wrap" style={{ background: on ? m.accent : `${m.accent}15`, color: on ? "#fff" : m.accent }}>
                      {m.icon}
                    </div>
                    <div>
                      <div className="mi-choice-dir-label" style={on ? { color: m.accent } : {}}>{o.label}</div>
                      <div className="mi-choice-dir-desc">{o.desc}</div>
                    </div>
                    {on && <div className="mi-choice-dir-check" style={{ background: m.accent }}>✓</div>}
                  </div>
                );
              })}
            </div>
          </div>

          {/* ③ Urgency + Scope row */}
          <div className="mi-form-section mi-form-two-col">
            <div>
              <SectionLabel label="Urgency" step="③" />
              <div className="mi-choice-urg-grid">
                {URGENCY_OPTIONS.map((o) => {
                  const m = URG_META[o.id] || {};
                  const on = log.urgency === o.id;
                  return (
                    <div key={o.id} className={`mi-choice-compact${on ? " is-on" : ""}`}
                      style={on ? { borderColor: m.accent, background: `${m.accent}10` } : {}}
                      onClick={() => setLogField("urgency", o.id)}>
                      <div className="mi-compact-icon-wrap" style={{ color: on ? m.accent : "var(--color-text-muted)" }}>{m.icon}</div>
                      <div className="mi-choice-compact-label" style={on ? { color: m.accent } : {}}>{o.label}</div>
                      <div className="mi-choice-compact-desc">{o.desc}</div>
                    </div>
                  );
                })}
              </div>
            </div>
            <div>
              <SectionLabel label="Scope" />
              <div className="mi-choice-urg-grid">
                {SCOPE_OPTIONS.map((o) => {
                  const on = log.scope === o.id;
                  return (
                    <div key={o.id} className={`mi-choice-compact${on ? " is-on" : ""}`}
                      onClick={() => setLogField("scope", o.id)}>
                      <div className="mi-choice-compact-label" style={on ? { color: "var(--color-primary)" } : {}}>{o.label}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Department */}
          <div className="mi-form-section">
            <SectionLabel label="Department (optional)" />
            <div className="mi-choice-dept-grid">
              {DEPT_OPTIONS.map((d) => {
                const m = DEPT_META[d] || {};
                const on = log.dept === d;
                return (
                  <div key={d} className={`mi-choice-dept${on ? " is-on" : ""}`}
                    style={on ? { borderColor: m.accent, background: m.soft } : {}}
                    onClick={() => setLog((p) => ({ ...p, dept: p.dept === d ? null : d }))}>
                    <div className="mi-dept-icon-wrap" style={{ background: on ? m.accent : `${m.accent}15`, color: on ? "#fff" : m.accent }}>{m.icon}</div>
                    <div className="mi-choice-compact-label" style={on ? { color: m.accent } : {}}>{d}</div>
                  </div>
                );
              })}
            </div>
            <Text variant="micro" tone="subtle">Dept-level signal applies to all SKUs in that department. Required if no specific SKUs selected.</Text>
          </div>

          {/* Title */}
          <div className="mi-form-section">
            <SectionLabel label="Title" required step="④" />
            <div className="mi-field-wrap">
              <input
                className="mi-field-input"
                type="text"
                placeholder="One-line description — e.g. Competitor opening 2 blocks away Q3"
                value={log.title}
                onChange={(e) => setLog((p) => ({ ...p, title: e.target.value }))}
              />
            </div>
          </div>

          {/* What you observed */}
          <div className="mi-form-section">
            <SectionLabel label="What you observed" required />
            <div className="mi-field-wrap">
              <textarea
                className="mi-field-textarea"
                placeholder="The full picture — who, what, where, when. Free text stays human-read only; only the structured tags above feed the agent model."
                value={log.body}
                onChange={(e) => setLog((p) => ({ ...p, body: e.target.value }))}
                rows={5}
              />
            </div>
            <Text variant="micro" tone="subtle" style={{ marginTop: 6 }}>Free text is human-read only — it never feeds the agent model directly.</Text>
          </div>

          {/* Affected SKUs */}
          <div className="mi-form-section">
            <SectionLabel label="Affected SKUs (optional)" step="⑤" />
            {log.skus.length > 0 && (
              <div className="mi-sku-tag-list">
                {log.skus.map((s) => (
                  <div key={s} className="mi-sku-tag">
                    <Text variant="micro" mono style={{ color: "var(--color-accent)" }}>{s}</Text>
                    <span className="mi-sku-remove" onClick={() => removeSku(s)}>×</span>
                  </div>
                ))}
              </div>
            )}
            <div className="mi-sku-pick-row">
              <div className="mi-field-wrap" style={{ flex: 1 }}>
                <select
                  className="mi-field-select"
                  value={log.skuPick}
                  onChange={(e) => setLog((p) => ({ ...p, skuPick: e.target.value }))}
                >
                  <option value="">Select a catalogue SKU…</option>
                  {CATALOGUE_SKUS.filter((s) => !log.skus.includes(s.id)).map((s) => (
                    <option key={s.id} value={s.id}>{s.id} · {s.name}</option>
                  ))}
                </select>
              </div>
              <button className="mi-add-sku-btn" onClick={addSku}>+ Add SKU</button>
            </div>
            <Text variant="micro" tone="subtle" style={{ marginTop: 6 }}>
              SKU references let the agent update confidence scores for specific products. Leave blank for general market / trend signals.
            </Text>
          </div>

          {/* Confidence */}
          <div className="mi-form-section">
            <SectionLabel label="Confidence level" />
            <div className="mi-choice-conf-grid">
              {CONFIDENCE_OPTIONS.map((o) => {
                const m = CONF_META[o.id] || {};
                const on = log.confidence === o.id;
                return (
                  <div key={o.id} className={`mi-choice-conf${on ? " is-on" : ""}`}
                    onClick={() => setLogField("confidence", o.id)}>
                    <div className="mi-choice-conf-icon" style={{ color: on ? "var(--color-primary)" : "var(--color-text-muted)" }}>{m.icon}</div>
                    <div className="mi-choice-compact-label" style={on ? { color: "var(--color-primary)" } : {}}>{o.label}</div>
                    <div className="mi-choice-compact-desc">{o.desc}</div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Submit */}
          <div className="mi-log-submit-row">
            <button className="mi-log-submit-btn" onClick={submitLog}>
              Log intelligence →
            </button>
            <Button variant="secondary" size="medium" onClick={() => setView("inbox")}>Cancel</Button>
          </div>
        </div>
      </Card>

      {/* ── Right: Preview panel ── */}
      <div style={{ position: "sticky", top: 0, alignSelf: "flex-start" }}>
        <Card sx={{ ...panelSx, padding: 0, overflow: "hidden" }}>
          {/* Preview header */}
          <div className="mi-preview-header">
            <span style={{ fontSize: 14 }}>📋</span>
            <Text variant="caption" style={{ color: "#fff", fontWeight: 700 }}>Entry preview</Text>
          </div>
          <div className="mi-preview-body">
            {!log.type && !log.direction ? (
              <div className="mi-preview-empty">
                <div style={{ fontSize: 32, marginBottom: 10 }}>📝</div>
                <Text variant="caption" tone="muted">Start filling in the form to preview your entry</Text>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {/* Tag row */}
                <Stack direction="row" gap={1} wrap>
                  {log.type ? (
                    <span className="mi-preview-tag" style={{ background: (TYPE_META[log.type]?.soft || "#f3f4f6"), color: (TYPE_META[log.type]?.accent || "#374151"), border: `1px solid ${TYPE_META[log.type]?.border || "#d1d5db"}` }}>
                      {TYPE_META[log.type]?.icon} {log.type}
                    </span>
                  ) : null}
                  {log.direction ? (
                    <span className="mi-preview-tag mi-preview-tag--dir" style={{ background: (DIR_META[log.direction]?.soft || "#f3f4f6"), color: (DIR_META[log.direction]?.accent || "#374151"), border: `1px solid ${DIR_META[log.direction]?.border || "#d1d5db"}` }}>
                      {DIR_META[log.direction]?.icon} {log.direction}
                    </span>
                  ) : null}
                  {log.urgency ? <Badge variant="subtle" size="small" color={URGENCY_BADGE[log.urgency]} label={log.urgency} /> : null}
                  {log.scope ? <span className="mi-preview-scope">{log.scope}</span> : null}
                </Stack>
                {log.title && <div className="mi-preview-title">{log.title}</div>}
                {log.body && (
                  <div className="mi-preview-body-text">
                    {log.body.slice(0, 200)}{log.body.length > 200 ? "…" : ""}
                  </div>
                )}
                {log.skus.length > 0 && (
                  <Stack direction="row" gap={1} wrap>
                    {log.skus.map((s) => <SkuChip key={s}>{s}</SkuChip>)}
                  </Stack>
                )}
              </div>
            )}

            {/* Model impact section */}
            <div className="mi-preview-model-section">
              <div className="mi-preview-model-label">🤖 Model impact</div>
              {feedsModelPreview ? (
                <div className="mi-preview-model-active">
                  <strong>Will feed agent:</strong><br />
                  {log.direction === "threat" ? "Drop" : "Boost"} confidence for{" "}
                  {log.skus.length > 0
                    ? log.skus.join(", ")
                    : (log.dept && log.dept !== "All" ? `all ${log.dept} SKUs` : "all SKUs (national)")
                  } at {log.scope || "specified"} scope.<br />
                  Signal: {log.type} · urgency: {log.urgency || "unset"}.<br />
                  Affects: Portfolio Build gaps, assortment recommendations, NPI analysis.
                </div>
              ) : (
                <div className="mi-preview-model-inactive">
                  {!log.type && <div>• Select a signal type to enable model tagging</div>}
                  {log.type && !log.skus.length && !log.dept && <div>• Add at least one SKU to enable confidence score updates</div>}
                  {log.type && (log.skus.length > 0 || log.dept) && (
                    <div>✓ Free text stays human-read. Structured tags will feed model on submit.</div>
                  )}
                </div>
              )}
            </div>
          </div>
        </Card>
      </div>
    </div>
  );

  /* ═══════════════ SHELL ═══════════════ */
  return (
    <Stack direction="column" gap={4}>
      {/* Header */}
      <Card sx={{ ...softSx, padding: "var(--sp-4) var(--sp-5)" }}>
        <Stack direction="row" justify="space-between" align="center" gap={4} wrap>
          <Text variant="title">Market Intelligence</Text>
          <Stack direction="row" gap={2} wrap align="center">
            {view !== "log" && (
              <>
                <Chips label="Inbox" isActive={view === "inbox"} onClick={() => setView("inbox")} />
                <Chips label="Signal map" isActive={view === "map"} onClick={() => setView("map")} />
              </>
            )}
            {view === "log" ? (
              <Button variant="secondary" size="medium" onClick={() => setView("inbox")}>
                ← Back to inbox
              </Button>
            ) : (
              <Button variant="primary" size="medium" onClick={() => { setView("log"); setLog(EMPTY_LOG); }}>
                + Log intelligence
              </Button>
            )}
          </Stack>
        </Stack>
      </Card>

      {/* Log form (full-width, no sidebar) */}
      {view === "log" ? logForm : (
        <>
          <FiltersStrip
            filterTags={miFilterTags}
            filterButtonLabel="All Filters"
            filterButtonClick={() => setFilterPanelOpen(true)}
            hideSelectedFilterBadge
            recentFilters={[]}
            savedFiltersBadge={[]}
            savedFilterLists={[]}
            selectedFilter={null}
            setSelectedFilter={() => {}}
            handleBadgeChange={() => {}}
            handleSavedRecentFilterDropdown={() => {}}
          />
          <FilterPanel
            title="Signal Filters"
            size="medium"
            anchor="right"
            isOpen={filterPanelOpen}
            setIsOpen={setFilterPanelOpen}
            active={activeFilterTab}
            setActive={setActiveFilterTab}
            filters={miFilterPanelTabs}
            primaryButtonLabel="Apply"
            onPrimaryButtonClick={() => setFilterPanelOpen(false)}
            secondaryButtonLabel="Clear all"
            onSecondaryButtonClick={() => { setStatus("all"); setDirFilter(null); setTypeFilter(null); }}
          />
          {/* 3-pane shell */}
          <div className="mi-shell">
            {sidebar}
            <div className="mi-main-pane">
              {view === "inbox" ? cardGrid : mapView}
            </div>
            <div className={`mi-detail-rail${selectedId && selected ? " is-open" : ""}`}>
              {detailPanel}
            </div>
          </div>
        </>
      )}

      {/* Toast */}
      {toast && (
        <div className={`mi-toast mi-toast--${toast.tone}`}>{toast.msg}</div>
      )}
    </Stack>
  );
}
