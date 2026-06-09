import React, { useState } from "react";

/*
 * Right-hand "Agent Activity" rail — the modern equivalent of the legacy
 * .hub-right panel (Signals / Pipeline / Log / Ask). For the foundation this
 * is a tasteful, static placeholder; each tab will be wired to live agent data
 * (SIGNALS, AUDIT_LOG, CHAT_MSGS) in a later milestone.
 */
const TABS = ["Signals", "Pipeline", "Log", "Ask"];

export default function AgentRail() {
  const [tab, setTab] = useState("Signals");

  return (
    <aside className="fd-agent-rail" aria-label="Agent activity">
      <div className="fd-agent-head">
        <div className="fd-agent-title">
          <span className="fd-agent-dot" />
          Agent Activity
          <span className="fd-agent-period">FW 2025</span>
        </div>
      </div>

      <div className="fd-agent-tabs" role="tablist">
        {TABS.map((t) => (
          <button
            key={t}
            role="tab"
            aria-selected={tab === t}
            className={`fd-agent-tab${tab === t ? " active" : ""}`}
            onClick={() => setTab(t)}
          >
            {t}
          </button>
        ))}
      </div>

      <div className="fd-agent-body">
        <div className="fd-agent-card">
          <div className="ac-title">Curation window open</div>
          <div className="ac-sub">
            FW 2025 store curation is live. The agent is monitoring overrides and
            dismissals to retrain before the next period.
          </div>
        </div>
        <div className="fd-agent-card">
          <div className="ac-title">Agent confidence avg · 84%</div>
          <div className="ac-sub">Override rate trending down 28% → 19% over 3 seasons.</div>
        </div>
        <div className="fd-agent-placeholder">
          {tab} feed connects to live data in an upcoming milestone.
        </div>
      </div>
    </aside>
  );
}
