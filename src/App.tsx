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
import { AlertTriangle, CheckCircle2 }   from "lucide-react";

import { ClinicProvider, useClinic }     from "./context/ClinicContext";
import { ApprovalProvider, useApproval } from "./context/ApprovalContext";
import type { ClinicWebsite }            from "./types/clinic";

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
import { ApprovalReviewPage }   from "./components/ApprovalFlow/ApprovalReviewPage";
import { MySubmissionsPage }    from "./components/ApprovalFlow/MySubmissionsPage";
import { UserManagementPage }   from "./components/UserManagement/UserManagementPage";
import { InviteUserPage }       from "./components/UserManagement/InviteUserPage";

// Site creation 3-step flow
import { HospitalSetupPage }    from "./components/HospitalSetup/HospitalSetupPage";
import { WebsiteEditorPage }    from "./components/WebsiteEditor/WebsiteEditorPage";
import { DomainManagementPage } from "./components/WebsiteEditor/DomainManagementPage";

import { findRouteByPath }      from "./config/routes.config";
import { LayoutProvider }       from "./context/LayoutContext";

/* ── Shared type ─────────────────────────────────────────────────────────── */

type DemoRole = "admin" | "manager" | "custom";
type SubmissionStatus = "idle" | "pending" | "rejected";

/* ══════════════════════════════════════════════════════════════════════════
   AppLayout — Standard layout: TopBar + LeftNav + page content
   Used by every normal page. Child route rendered via <Outlet />.
══════════════════════════════════════════════════════════════════════════ */

interface AppLayoutProps {
  activeRole:   DemoRole;
  onRoleChange: (r: DemoRole) => void;
}

function AppLayout({ activeRole, onRoleChange }: AppLayoutProps) {
  const navigate   = useNavigate();
  const { getPendingCount } = useApproval();
  const approvalCount = getPendingCount();

  // Show a nav badge on "My Submissions" for custom users (demo: static 1)
  const mySubmissionsCount = activeRole === "custom" ? 1 : 0;

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
            mySubmissionsCount={mySubmissionsCount}
            userRole={activeRole}
            onRoleChange={onRoleChange}
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

interface SiteCreationProps {
  activeRole: DemoRole;
}

function SiteCreation({ activeRole }: SiteCreationProps) {
  const navigate  = useNavigate();
  const location  = useLocation();
  const { clinic, saveStatus, triggerSave, publish } = useClinic();
  const { submitForApprovalWithDiff } = useApproval();

  const [internalMode,     setInternalMode]     = useState<InternalMode>("setup");
  const [submissionStatus, setSubmissionStatus] = useState<SubmissionStatus>("idle");
  const [showSuccessToast, setShowSuccessToast] = useState(false);

  const isCustom = activeRole === "custom";

  // Figure out where the "← Back" button should go
  const fromPath: string  = (location.state as { from?: string })?.from ?? "/dashboard";
  const fromRoute         = findRouteByPath(fromPath);
  const backLabel         = fromRoute?.label ?? "Back";

  /* Submit for review — custom role only */
  const handleSubmitForReview = () => {
    const clinicId = clinic.general?.slug || "demo-clinic";
    // Cast to ClinicWebsite — draft is compatible enough for the diff engine
    submitForApprovalWithDiff(clinicId, clinic as unknown as ClinicWebsite, "custom-user");
    setSubmissionStatus("pending");
    setShowSuccessToast(true);
    setTimeout(() => setShowSuccessToast(false), 4000);
  };

  /* Dismiss the rejection banner (user has seen it, going back to edit) */
  const handleDismissRejection = () => setSubmissionStatus("idle");

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-gray-50">

      {/* ── Sub-nav ── */}
      <WebsiteEditorSubNav
        internalMode={internalMode}
        onModeChange={setInternalMode}
        saveStatus={saveStatus}
        onSave={triggerSave}
        onPublish={publish}
        isPublished={clinic.status === "published"}
        onBack={() => navigate(fromPath)}
        backLabel={backLabel}
        /* Approval mode — only active for custom role */
        approvalMode={isCustom}
        submissionStatus={isCustom ? submissionStatus : undefined}
        onSubmitForReview={isCustom ? handleSubmitForReview : undefined}
      />

      {/* ── Rejection banner — shown inline below SubNav for custom users ── */}
      {isCustom && submissionStatus === "rejected" && (
        <div className="shrink-0 bg-amber-50 border-b border-amber-200 px-6 py-3 flex items-center gap-3 z-10">
          <AlertTriangle size={15} className="text-amber-600 flex-shrink-0" aria-hidden="true" />
          <div className="flex-1 min-w-0">
            <span className="text-sm font-semibold text-amber-900">Your last submission was rejected — </span>
            <span className="text-sm text-amber-700">
              An admin has requested changes. Review their feedback and revise your content.
            </span>
          </div>
          <button
            onClick={() => navigate("/my-submissions")}
            className="flex-shrink-0 text-xs font-semibold text-amber-700 underline underline-offset-2 hover:text-amber-900 transition-colors"
          >
            View feedback →
          </button>
          <button
            onClick={handleDismissRejection}
            className="flex-shrink-0 text-xs font-medium text-amber-500 hover:text-amber-700 transition-colors ml-1"
            aria-label="Dismiss notification"
          >
            ✕
          </button>
        </div>
      )}

      {/* ── Page content ── */}
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

      {/* ── Success toast — fixed bottom-right, auto-dismisses ── */}
      {showSuccessToast && (
        <div
          className="fixed bottom-6 right-6 z-50 flex items-center gap-3 bg-teal-600 text-white text-sm font-medium px-5 py-3.5 rounded-xl shadow-lg"
          role="status"
          aria-live="polite"
        >
          <CheckCircle2 size={16} className="flex-shrink-0" aria-hidden="true" />
          <div>
            <p className="font-semibold">Submitted for review</p>
            <p className="text-xs text-teal-100 mt-0.5">An admin will check your changes within 24–48 hrs</p>
          </div>
        </div>
      )}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════════════
   Router — maps URL paths to layouts + pages
   activeRole lives here so both AppLayout and SiteCreation can share it.
══════════════════════════════════════════════════════════════════════════ */

function AppRouter() {
  const [activeRole, setActiveRole] = useState<DemoRole>("admin");

  return (
    <Routes>
      {/* ── Distraction-free flows (no nav) ── */}
      <Route path="/sites/new"             element={<SiteCreation activeRole={activeRole} />} />
      {/* Admin reviews a pending submission; custom user revises a rejected one */}
      <Route path="/approvals/review"      element={<ApprovalReviewPage />} />
      <Route path="/my-submissions/revise" element={<ApprovalReviewPage />} />

      {/* ── Normal layout ── */}
      <Route element={<AppLayout activeRole={activeRole} onRoleChange={setActiveRole} />}>
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
        <Route path="/my-submissions"      element={<MySubmissionsPage />} />
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
