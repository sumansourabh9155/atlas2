/**
 * App.tsx — Root application shell.
 *
 * Architecture:
 *  - React Router drives all navigation (URL = source of truth)
 *  - Two layout branches:
 *      AppLayout      — TopBar + LeftNav + <Outlet> for all normal pages
 *      SiteCreation   — Distraction-free flow (no nav, no top bar)
 *  - Context providers wrap everything at the root
 *
 * Adding a new page:
 *  1. Add one entry to src/config/routes.config.ts
 *  2. Add one <Route> inside <AppLayout> below
 *  Done — nav, TopBar label, and CTA all update automatically.
 */

import { Routes, Route, Navigate, Outlet, useNavigate, useLocation } from "react-router-dom";
import { useState }                      from "react";

import { ClinicProvider, useClinic }     from "./context/ClinicContext";
import { ApprovalProvider, useApproval } from "./context/ApprovalContext";

import { TopBar }             from "./components/layout/TopBar";
import { LeftNavigation }     from "./components/LeftNavigation";
import { WebsiteEditorSubNav } from "./components/WebsiteEditor/WebsiteEditorSubNav";
import type { InternalMode }  from "./components/WebsiteEditor/WebsiteEditorSubNav";

// Pages
import { DashboardPage }        from "./components/Dashboard/DashboardPage";
import { ABTestingPage }           from "./components/Insights/ABTestingPage";
import { ConversionFunnelsPage }   from "./components/Insights/ConversionFunnelsPage";
import { SiteManagementPage }   from "./components/SiteManagement/SiteManagementPage";
import { SiteListPage }         from "./components/SiteManagement/SiteListPage";
import { GroupsPage }           from "./components/SiteManagement/GroupsPage";
import { MultiLocationPage }    from "./components/SiteManagement/MultiLocationPage";
import { DataCollectionPage }   from "./components/DataCollection/DataCollectionPage";
import { MediaLibraryPage }     from "./components/MediaLibrary/MediaLibraryPage";
import { BannerManagementPage } from "./components/BannerManagement/BannerManagementPage";
import { ApprovalFlowPage }     from "./components/ApprovalFlow/ApprovalFlowPage";
import { UserManagementPage }   from "./components/UserManagement/UserManagementPage";
import { InviteUserPage }       from "./components/UserManagement/InviteUserPage";

// Site creation 3-step flow
import { HospitalSetupPage }    from "./components/HospitalSetup/HospitalSetupPage";
import { WebsiteEditorPage }    from "./components/WebsiteEditor/WebsiteEditorPage";
import { DomainManagementPage } from "./components/WebsiteEditor/DomainManagementPage";

import { findRouteByPath }      from "./config/routes.config";
import { LayoutProvider }       from "./context/LayoutContext";

/* ══════════════════════════════════════════════════════════════════════════
   AppLayout — Standard layout: TopBar + LeftNav + page content
   Used by every normal page. Child route rendered via <Outlet />.
══════════════════════════════════════════════════════════════════════════ */

function AppLayout() {
  const navigate   = useNavigate();
  const { getPendingCount } = useApproval();
  const approvalCount = getPendingCount();

  const handleCTAAction = (action: string) => {
    switch (action) {
      case "new-site":
        navigate("/sites/new", { state: { from: window.location.pathname } });
        break;
      case "invite-user":
        navigate("/users/invite");
        break;
      default:
        console.info("CTA action:", action);
    }
  };

  return (
    <LayoutProvider>
      <div className="h-screen flex flex-col overflow-hidden">
        <TopBar onCTAClick={handleCTAAction} />

        <div className="flex-1 overflow-hidden flex">
          <LeftNavigation
            approvalCount={approvalCount}
            userRole="admin"
            userName="Admin User"
            userEmail="admin@atlas.com"
            onLogout={() => console.log("Logout")}
          />

          {/* Page content — rendered by React Router */}
          <div className="flex-1 overflow-hidden flex flex-col">
            <Outlet />
          </div>
        </div>
      </div>
    </LayoutProvider>
  );
}

/* ══════════════════════════════════════════════════════════════════════════
   SiteCreation — Distraction-free 3-step creation flow.
   No TopBar, no LeftNav. Back button returns to the previous URL.
══════════════════════════════════════════════════════════════════════════ */

function SiteCreation() {
  const navigate  = useNavigate();
  const location  = useLocation();
  const { clinic, saveStatus, triggerSave, publish } = useClinic();

  const [internalMode, setInternalMode] = useState<InternalMode>("setup");

  // Figure out where the "← Back" button should go
  const fromPath: string  = (location.state as { from?: string })?.from ?? "/dashboard";
  const fromRoute         = findRouteByPath(fromPath);
  const backLabel         = fromRoute?.label ?? "Back";

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-gray-50">
      <WebsiteEditorSubNav
        internalMode={internalMode}
        onModeChange={setInternalMode}
        saveStatus={saveStatus}
        onSave={triggerSave}
        onPublish={publish}
        isPublished={clinic.status === "published"}
        onBack={() => navigate(fromPath)}
        backLabel={backLabel}
      />

      <div className="flex-1 overflow-hidden flex flex-col">
        {internalMode === "setup" && (
          <HospitalSetupPage
            onNext={() => { triggerSave(); setInternalMode("editor"); }}
          />
        )}
        {internalMode === "editor" && (
          <WebsiteEditorPage
            onNavigateToSetup={() => setInternalMode("setup")}
            onNext={() => { triggerSave(); setInternalMode("domain"); }}
          />
        )}
        {internalMode === "domain" && <DomainManagementPage />}
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════════════
   Router — maps URL paths to layouts + pages
══════════════════════════════════════════════════════════════════════════ */

function AppRouter() {
  return (
    <Routes>
      {/* ── Distraction-free creation (no nav) ── */}
      <Route path="/sites/new" element={<SiteCreation />} />

      {/* ── Normal layout ── */}
      <Route element={<AppLayout />}>
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard"               element={<DashboardPage />} />
        <Route path="/insights/ab-testing" element={<ABTestingPage />} />
        <Route path="/insights/funnels"    element={<ConversionFunnelsPage />} />
        <Route path="/sites"               element={<Navigate to="/sites/all" replace />} />
        <Route path="/sites/all"           element={<SiteListPage />} />
        <Route path="/sites/groups"        element={<GroupsPage />} />
        <Route path="/sites/multi-location" element={<MultiLocationPage />} />
        <Route path="/data-collection"     element={<DataCollectionPage />} />
        <Route path="/media-library"       element={<MediaLibraryPage />} />
        <Route path="/banners"             element={<BannerManagementPage />} />
        <Route path="/approvals"           element={<ApprovalFlowPage />} />
        <Route path="/users"               element={<UserManagementPage />} />
        <Route path="/users/invite"        element={<InviteUserPage />} />
        {/* Catch-all → dashboard */}
        <Route path="*"                    element={<Navigate to="/dashboard" replace />} />
      </Route>
    </Routes>
  );
}

/* ══════════════════════════════════════════════════════════════════════════
   App — providers + router (BrowserRouter lives in main.tsx)
══════════════════════════════════════════════════════════════════════════ */

export default function App() {
  return (
    <ClinicProvider>
      <ApprovalProvider>
        <AppRouter />
      </ApprovalProvider>
    </ClinicProvider>
  );
}
