import React from "react";
import MainLayout from "./layouts/MainLayout.jsx";
import ModulePlaceholder from "./views/ModulePlaceholder.jsx";
import Today from "./views/Today.jsx";
import Hindsight from "./views/Hindsight.jsx";
import StoreHub from "./views/StoreHub.jsx";
import PortfolioBuild from "./views/PortfolioBuild.jsx";
import LikeItemForecast from "./views/LikeItemForecast.jsx";
import Catalogue from "./views/Catalogue.jsx";
import National from "./views/National.jsx";
import Regional from "./views/Regional.jsx";
import StoreCuration from "./views/StoreCuration.jsx";
import Mpi from "./views/Mpi.jsx";
import MarketIntel from "./views/MarketIntel.jsx";
import FeedbackLoop from "./views/FeedbackLoop.jsx";
import Approval from "./views/Approval.jsx";
import PlanningAdmin from "./views/PlanningAdmin.jsx";
import PlrCalendar from "./views/PlrCalendar.jsx";
import Clustering from "./views/Clustering.jsx";
import LeadTime from "./views/LeadTime.jsx";
import PeerIntelligence from "./views/PeerIntelligence.jsx";

/*
 * App root — wires MainLayout as the master wrapper for all views.
 *
 * MainLayout owns the navigation state and exposes the active module via a
 * render-prop child. Each migrated screen registers here by module value;
 * anything not yet built falls back to the placeholder. This map is the
 * single seam to swap in a real router later.
 */
const VIEWS = {
  today: ({ navigate }) => <Today onNavigate={navigate} />,
  hindsight: () => <Hindsight />,
  "store-hub": () => <StoreHub />,
  portfolio: () => <PortfolioBuild />,
  forecast: () => <LikeItemForecast />,
  catalogue: ({ navigate }) => <Catalogue onNavigate={navigate} />,
  national: ({ navigate }) => <National onNavigate={navigate} />,
  regional: ({ navigate }) => <Regional onNavigate={navigate} />,
  "store-curation": ({ navigate }) => <StoreCuration onNavigate={navigate} />,
  mpi: () => <Mpi />,
  intel: () => <MarketIntel />,
  feedback: () => <FeedbackLoop />,
  approval: () => <Approval />,
  "admin-planning": () => <PlanningAdmin />,
  periods: () => <PlrCalendar />,
  clustering: ({ navigate }) => <Clustering onNavigate={navigate} />,
  "lead-time": () => <LeadTime />,
  "peer-intel": () => <PeerIntelligence />,
};

export default function App() {
  return (
    <MainLayout
      user={{ name: "Karen M.", role: "VP Merchandising · Corporate" }}
      onLogout={() => console.log("logout")}
    >
      {({ activeModule, moduleLabel, groupLabel, navigate }) => {
        const View = VIEWS[activeModule];
        return View ? (
          View({ navigate })
        ) : (
          <ModulePlaceholder
            activeModule={activeModule}
            moduleLabel={moduleLabel}
            groupLabel={groupLabel}
          />
        );
      }}
    </MainLayout>
  );
}
