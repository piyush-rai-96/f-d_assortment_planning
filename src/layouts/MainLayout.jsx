import React, { useState } from "react";
import { Header, Sidebar } from "impact-ui";
import { routes, actionRoutes, MODULE_LABELS, MODULE_GROUP } from "../config/navigation.jsx";
import AgentRail from "../components/AgentRail.jsx";
import "./MainLayout.css";

/*
 * MainLayout — the master shell that wraps every view.
 *
 * Composition:
 *   • <Sidebar />  Impact UI fixed dark rail (64px → 280px overlay) for module nav
 *   • <Header />   Impact UI fixed top bar (logo, breadcrumb, user, actions)
 *   • <main>       scrollable content outlet (renders `children` / active view)
 *   • <AgentRail/> right-hand agent activity panel (legacy .hub-right)
 *
 * Navigation state is held here for now. When routing/views land, the
 * `onModuleChange` callback + `activeModule` can drive a router instead.
 */
export default function MainLayout({
  children,
  user = { name: "Karen M.", role: "VP Merchandising · Corporate" },
  showAgentRail = true,
  onModuleChange,
  onLogout,
}) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [parentActive, setParentActive] = useState("today");
  const [childActive, setChildActive] = useState(null);
  const [activeModule, setActiveModule] = useState("today");

  const selectModule = (value) => {
    setActiveModule(value);
    onModuleChange?.(value);
    setIsSidebarOpen(false);
  };

  // Programmatic navigation (e.g. from a dashboard tile). Keeps the sidebar
  // parent/child highlight in sync with the chosen module value.
  const navigate = (value) => {
    const topLevel = routes.find((r) => r.value === value);
    if (topLevel) {
      setParentActive(value);
      setChildActive(null);
    } else {
      const parent = routes.find((r) => (r.children || []).some((c) => c.value === value));
      if (parent) {
        setParentActive(parent.value);
        setChildActive(value);
      }
    }
    selectModule(value);
  };

  const handleParentRouteChange = (item) => {
    setParentActive(item.value);
    // Leaf parents (no children) navigate; group parents only expand/collapse.
    if (!item.children || item.children.length === 0) {
      setChildActive(null);
      selectModule(item.value);
    }
  };

  const handleChildRouteChange = (parent, child) => {
    setParentActive(parent.value);
    setChildActive(child.value);
    selectModule(child.value);
  };

  const moduleLabel = MODULE_LABELS[activeModule] || "Today";
  const groupLabel = MODULE_GROUP[activeModule];

  const breadcrumb = (
    <nav className="fd-breadcrumb" aria-label="Breadcrumb">
      <span className="crumb-group">Floor &amp; Decor</span>
      <span className="sep">/</span>
      {groupLabel && (
        <>
          <span className="crumb-group">{groupLabel}</span>
          <span className="sep">/</span>
        </>
      )}
      <span className="crumb-active">{moduleLabel}</span>
    </nav>
  );

  return (
    <div className="fd-shell">
      <Sidebar
        isOpen={isSidebarOpen}
        setIsOpen={setIsSidebarOpen}
        handleClose={() => setIsSidebarOpen((open) => !open)}
        routes={routes}
        actionRoutes={actionRoutes}
        parentActive={parentActive}
        childActive={childActive}
        handleParentRouteChange={handleParentRouteChange}
        handleChildRouteChange={handleChildRouteChange}
        handleLogOut={() => onLogout?.()}
        isCloseWhenClickOutside
      />

      <Header
        title="Assortment Planning"
        userName={user.name}
        centerComponent={breadcrumb}
        showHelpIcon
        showNotificationIcon
        notificationIndicator
        showMessageIcon={false}
        showChatBotIcon={false}
        handleLogoClick={() => selectModule("today")}
      />

      <div className="fd-body">
        <main className="fd-content" role="main" aria-live="polite">
          <div className="fd-content-inner">
            {typeof children === "function"
              ? children({ activeModule, moduleLabel, groupLabel, navigate })
              : children}
          </div>
        </main>
        {showAgentRail && <AgentRail />}
      </div>
    </div>
  );
}
