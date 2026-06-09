import React from "react";
import "./ModulePlaceholder.css";

/*
 * Temporary content shown for any module until its real view is built.
 * Reflects the active module selected in the Sidebar so the shell feels live.
 */
export default function ModulePlaceholder({ moduleLabel, groupLabel, activeModule }) {
  const isToday = activeModule === "today";

  return (
    <section className="fd-placeholder">
      <span className="fd-pill">
        {groupLabel ? `${groupLabel} · ` : ""}
        {moduleLabel}
      </span>

      <h1 className="fd-placeholder-title">
        {isToday ? "Welcome back, Karen 👋" : moduleLabel}
      </h1>
      <p className="fd-placeholder-sub">
        {isToday
          ? "The Floor & Decor agentic assortment workspace is ready. Pick a module from the sidebar — each screen is being rebuilt on Impact UI."
          : `The “${moduleLabel}” view is scaffolded and will be implemented in an upcoming milestone.`}
      </p>

      <div className="fd-card-grid">
        <article className="fd-card">
          <div className="fd-card-k">21</div>
          <div className="fd-card-l">Stores in network</div>
        </article>
        <article className="fd-card">
          <div className="fd-card-k">1,507</div>
          <div className="fd-card-l">Catalogue SKUs</div>
        </article>
        <article className="fd-card">
          <div className="fd-card-k">842</div>
          <div className="fd-card-l">National Core</div>
        </article>
        <article className="fd-card">
          <div className="fd-card-k accent">84%</div>
          <div className="fd-card-l">Agent confidence</div>
        </article>
      </div>

      <div className="fd-note">
        Layout shell composed with Impact UI <code>Header</code> + <code>Sidebar</code>.
        Module views render here via <code>MainLayout</code>.
      </div>
    </section>
  );
}
