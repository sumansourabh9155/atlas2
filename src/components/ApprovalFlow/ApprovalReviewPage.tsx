/**
 * ApprovalReviewPage — Full-screen review / revise flow.
 *
 * Uses the EXACT same 3-step flow as SiteCreation (App.tsx):
 *   [Business Details] → [Website Builder] → [Domain & Publishing]
 *
 * On mount the submitted clinic data (submission.changes) is loaded into
 * ClinicContext so all 3 steps show the actual submitted content with
 * ReviewModeContext field-level highlights. On unmount the original
 * working clinic data is restored.
 *
 * 3 flows driven by navigation state:
 *   "admin-review"   Amber highlights — Approve All / Request Changes
 *   "custom-revise"  Red highlights, editable — Submit Revision
 */

import { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  CheckCircle2, AlertCircle, Clock, RotateCcw, AlertTriangle, XCircle, X,
} from "lucide-react";

import { ReviewModeProvider }     from "../../context/ReviewModeContext";
import { WebsiteEditorSubNav }    from "../WebsiteEditor/WebsiteEditorSubNav";
import type { InternalMode }      from "../WebsiteEditor/WebsiteEditorSubNav";
import { HospitalSetupPage }      from "../HospitalSetup/HospitalSetupPage";
import { WebsiteEditorPage }      from "../WebsiteEditor/WebsiteEditorPage";
import { DomainManagementPage }   from "../WebsiteEditor/DomainManagementPage";
import { useClinic }              from "../../context/ClinicContext";
import type { ClinicState }       from "../../context/ClinicContext";
import { useApproval }            from "../../context/ApprovalContext";
import type { ClinicVersionV2 }   from "../../context/ApprovalContext";
import type { FieldChange }       from "../../lib/approval/diffGenerator";
import { buildContextFieldChanges } from "../../lib/approval/contextFieldChanges";
import { ArrowLeft }              from "lucide-react";

/* ─── Types ──────────────────────────────────────────────────────────────────── */

type ReviewMode = "admin-review" | "custom-revise";

interface ReviewPageState {
  mode?:         ReviewMode;
  clinicName?:   string;
  submissionId?: string;
}

/* ─── Helper: map ClinicWebsite snapshot → ClinicContext updaters ────────────── */

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function loadSubmissionIntoContext(data: any, ctx: ReturnType<typeof useClinic>) {
  /* ── General ── */
  const g = data?.general ?? {};
  ctx.updateGeneral({
    name:            String(g.name            ?? ""),
    slug:            String(g.slug            ?? ""),
    primaryColor:    String(g.primaryColor    ?? "#0F766E"),
    secondaryColor:  String(g.secondaryColor  ?? "#F59E0B"),
    logoUrl:         g.logoUrl          as string | undefined,
    tagline:         g.tagline          as string | undefined,
    metaDescription: g.metaDescription  as string | undefined,
  });

  /* ── Taxonomy ── */
  const t = data?.taxonomy ?? {};
  ctx.updateTaxonomy({
    hospitalType: t.hospitalType ?? "general_practice",
    petTypes:     Array.isArray(t.petTypes) ? t.petTypes : [],
  });

  /* ── Contact ── */
  const c = data?.contact ?? {};
  const a = c.address ?? {};
  ctx.updateContact({
    address: {
      street:      String(a.street      ?? ""),
      city:        String(a.city        ?? ""),
      state:       String(a.state       ?? ""),
      zip:         String(a.zip         ?? ""),
      country:     String(a.country     ?? "United States"),
      mapEmbedUrl: a.mapEmbedUrl        as string | undefined,
    },
    phone:          String(c.phone          ?? ""),
    email:          String(c.email          ?? ""),
    emergencyPhone: c.emergencyPhone        as string | undefined,
    website:        c.website               as string | undefined,
  });

  /* ── Operating Hours (Business Details → Hours section) ── */
  if (data?.hours) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ctx.updateHours(data.hours as any);
  }

  /* ── SEO (Website Builder → SEO tab) ── */
  if (data?.seo) {
    const s = data.seo;
    ctx.updateSEO({
      metaTitle:       String(s.metaTitle       ?? ""),
      metaDescription: String(s.metaDescription ?? ""),
      ogImageUrl:      String(s.ogImageUrl      ?? ""),
      canonicalUrl:    String(s.canonicalUrl    ?? ""),
      robots:          String(s.robots          ?? "index,follow"),
      focusKeyword:    String(s.focusKeyword    ?? ""),
    });
  }

  /* ── Navigation (Website Builder preview bar + nav editor) ── */
  if (Array.isArray(data?.navLinks)) {
    ctx.updateNavLinks(data.navLinks);
  }
  if (data?.navConfig) {
    const nc = data.navConfig;
    ctx.updateNavConfig({
      isSticky:              nc.isSticky              ?? true,
      isTransparentOnScroll: nc.isTransparentOnScroll ?? true,
      colorScheme:           nc.colorScheme           ?? "light",
      showClinicName:        nc.showClinicName        ?? true,
      ctaLabel:              String(nc.ctaLabel ?? "Book Appointment"),
      ctaHref:               String(nc.ctaHref  ?? "#contact"),
    });
  }

  /* ── Services config (Website Builder → services section) ── */
  if (data?.servicesConfig) {
    const sc = data.servicesConfig;
    ctx.updateServicesConfig({
      pricingEnabled: sc.pricingEnabled ?? false,
      pricingUrl:     String(sc.pricingUrl ?? ""),
      serviceGroups:  Array.isArray(sc.serviceGroups) ? sc.serviceGroups : [],
    });
  }

  /* ── Vets config (Website Builder → team section) ── */
  if (data?.vetsConfig) {
    ctx.updateVetsConfig({
      selectedVetIds: Array.isArray(data.vetsConfig.selectedVetIds)
        ? data.vetsConfig.selectedVetIds
        : [],
    });
  }

  /* ── Integrations (Domain & Publishing page) ── */
  if (data?.integrations) {
    const ig = data.integrations;
    ctx.updateIntegrations({
      pixelTrackingEnabled:    ig.pixelTrackingEnabled    ?? false,
      ottoEnabled:             ig.ottoEnabled             ?? false,
      ottoWidgetScript:        String(ig.ottoWidgetScript ?? ""),
      vetstoriaEnabled:        ig.vetstoriaEnabled        ?? false,
      googleTagManagerEnabled: ig.googleTagManagerEnabled ?? false,
      facebookPixelEnabled:    ig.facebookPixelEnabled    ?? false,
      microsoftClarityEnabled: ig.microsoftClarityEnabled ?? false,
      cookieConsentEnabled:    ig.cookieConsentEnabled    ?? false,
    });
  }

  /* ── Footer config (Website Builder → footer section) ── */
  if (data?.footerConfig) {
    const fc = data.footerConfig;
    ctx.updateFooterConfig({
      subscriptionEnabled:    fc.subscriptionEnabled    ?? false,
      subscriptionHeading:    String(fc.subscriptionHeading ?? ""),
      subscriptionLink:       String(fc.subscriptionLink    ?? ""),
      additionalLinksEnabled: fc.additionalLinksEnabled ?? false,
      additionalLinks:        Array.isArray(fc.additionalLinks) ? fc.additionalLinks : [],
      termsOfService:         String(fc.termsOfService ?? ""),
      privacyPolicy:          String(fc.privacyPolicy  ?? ""),
    });
  }
}

/* ─── Component ──────────────────────────────────────────────────────────────── */

export function ApprovalReviewPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const state    = (location.state ?? {}) as ReviewPageState;

  const { pendingApprovals, approveChanges, rejectChanges, requestRevision, workflows } = useApproval();

  const clinicCtx = useClinic();
  const { saveStatus, triggerSave } = clinicCtx;

  const mode:         ReviewMode = state.mode        ?? "custom-revise";
  const versionId:    string     = state.submissionId ?? "v-demo";
  const isAdminReview            = mode === "admin-review";
  const backPath                 = isAdminReview ? "/approvals"    : "/my-submissions";
  const backLabel                = isAdminReview ? "Approval Flow" : "My Submissions";

  /* 3-step navigation — mirrors SiteCreation */
  const [internalMode,       setInternalMode]       = useState<InternalMode>("setup");
  const [showToast,          setShowToast]          = useState(false);
  const [bannerDismissed,    setBannerDismissed]    = useState(false);
  const [dataLoaded,         setDataLoaded]         = useState(false);
  const [requestModalOpen,   setRequestModalOpen]   = useState(false);
  const [requestFeedback,    setRequestFeedback]    = useState("");
  const [rejectModalOpen,    setRejectModalOpen]    = useState(false);
  const [rejectReason,       setRejectReason]       = useState("");

  /* Find submission in pending list or approval history */
  const submission: ClinicVersionV2 | undefined =
    (pendingApprovals.find((p) => p.id === versionId) as ClinicVersionV2 | undefined) ??
    Array.from(workflows.values())
      .flatMap((wf) => wf.approvalHistory as ClinicVersionV2[])
      .find((v) => v.id === versionId);

  const clinicName: string =
    state.clinicName ??
    submission?.changes?.general?.name ??
    (isAdminReview ? "Happy Paws Specialty" : "Urban Pet Care");

  const baseFieldChanges: FieldChange[] = submission?.fieldChanges ?? [];
  // Augment with synthetic FieldChange entries for context-only fields
  // (seo, navConfig, navLinks, hours, integrations, footerConfig, servicesConfig, vetsConfig)
  const contextFieldChanges = submission?.changes
    ? buildContextFieldChanges(submission.changes)
    : [];
  const fieldChanges: FieldChange[] = [...baseFieldChanges, ...contextFieldChanges];

  const totalPending  = fieldChanges.filter((c) => c.status === "pending").length;
  const totalRejected = fieldChanges.filter((c) => c.status === "rejected").length;

  /* ── Load submission data into ClinicContext on mount; restore on unmount ── */
  // Capture the working clinic state at mount time so we can restore it later
  const originalClinicRef = useRef<ClinicState>(clinicCtx.clinic);

  useEffect(() => {
    if (!submission?.changes) {
      setDataLoaded(true);
      return;
    }

    // Capture original state (before we overwrite it)
    originalClinicRef.current = { ...clinicCtx.clinic };

    // Populate the form with the submitted data
    loadSubmissionIntoContext(submission.changes, clinicCtx);
    setDataLoaded(true);

    // Restore the original working data when the review session ends
    return () => {
      const orig = originalClinicRef.current;
      clinicCtx.updateGeneral(orig.general);
      clinicCtx.updateTaxonomy(orig.taxonomy);
      clinicCtx.updateContact(orig.contact);
      clinicCtx.updateSEO(orig.seo);
      clinicCtx.updateNavLinks(orig.navLinks);
      clinicCtx.updateNavConfig(orig.navConfig);
      clinicCtx.updateServicesConfig(orig.servicesConfig);
      clinicCtx.updateVetsConfig(orig.vetsConfig);
      clinicCtx.updateIntegrations(orig.integrations);
      clinicCtx.updateFooterConfig(orig.footerConfig);
      if (orig.hours) clinicCtx.updateHours(orig.hours);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [submission?.id]); // only re-run when the submission itself changes

  /* ── Action handlers ── */
  function handleApproveAll() {
    approveChanges(versionId, "", "admin");
    setShowToast(true);
    setTimeout(() => { setShowToast(false); navigate("/approvals"); }, 2500);
  }

  function handleRequestChanges() {
    if (!requestFeedback.trim()) return;
    requestRevision(versionId, requestFeedback.trim(), "admin");
    setRequestModalOpen(false);
    setRequestFeedback("");
    navigate("/approvals");
  }

  function handleReject() {
    rejectChanges(versionId, rejectReason.trim(), "admin");
    setRejectModalOpen(false);
    setRejectReason("");
    navigate("/approvals");
  }

  function handleSubmitRevision() {
    setShowToast(true);
    setTimeout(() => { setShowToast(false); navigate("/my-submissions"); }, 2500);
  }

  /* ── Approval CTAs injected into the SubNav right zone ── */
  const rightActions = isAdminReview ? (
    <div className="flex items-center gap-2">
      {totalPending > 0 && (
        <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold rounded-full bg-amber-50 text-amber-700 border border-amber-200">
          <Clock size={10} aria-hidden="true" />
          {totalPending} pending
        </span>
      )}
      <button
        onClick={() => setRequestModalOpen(true)}
        className="px-3.5 py-1.5 text-sm font-semibold text-amber-700 border border-amber-200 bg-amber-50 hover:bg-amber-100 rounded-md transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
      >
        Request Changes
      </button>
      <button
        onClick={() => setRejectModalOpen(true)}
        className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-sm font-semibold text-red-600 border border-red-200 bg-red-50 hover:bg-red-100 rounded-md transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-red-400"
      >
        <XCircle size={14} aria-hidden="true" />
        Reject
      </button>
      <button
        onClick={handleApproveAll}
        className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-sm font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-md transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-600"
      >
        <CheckCircle2 size={14} aria-hidden="true" />
        Approve All
      </button>
    </div>
  ) : (
    <div className="flex items-center gap-2">
      {totalRejected > 0 && (
        <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold rounded-full bg-red-50 text-red-700 border border-red-200">
          <AlertCircle size={10} aria-hidden="true" />
          {totalRejected} to revise
        </span>
      )}
      <button
        onClick={handleSubmitRevision}
        className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-sm font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-md transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-600"
      >
        <RotateCcw size={14} aria-hidden="true" />
        Submit Revision
      </button>
    </div>
  );

  /* ── Not-found guard ── */
  if (!submission) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-xs">
          <div className="w-12 h-12 bg-amber-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <AlertTriangle size={20} className="text-amber-500" aria-hidden="true" />
          </div>
          <p className="text-sm font-semibold text-gray-800">Submission not found</p>
          <p className="text-xs text-gray-400 mt-1 leading-relaxed">
            This submission may have already been processed, or the page was refreshed.
          </p>
          <button
            onClick={() => navigate(backPath)}
            className="mt-5 inline-flex items-center gap-1.5 text-sm font-medium text-teal-600 hover:text-teal-700 transition-colors"
          >
            <ArrowLeft size={13} aria-hidden="true" />
            {backLabel}
          </button>
        </div>
      </div>
    );
  }

  /* ── Loading guard — wait for submission data to populate context ── */
  if (!dataLoaded) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-teal-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs text-gray-400">Loading submission…</p>
        </div>
      </div>
    );
  }

  /* ── Render ── */
  return (
    <ReviewModeProvider
      mode={mode}
      fieldChanges={fieldChanges}
      clinicName={clinicName}
      versionId={versionId}
    >
      <div className="h-screen flex flex-col overflow-hidden bg-gray-50">

        {/* ══════════════════════════════════════════════════════════════════════
            Sub-nav — same component as SiteCreation, approval CTAs in right zone
        ══════════════════════════════════════════════════════════════════════ */}
        <WebsiteEditorSubNav
          internalMode={internalMode}
          onModeChange={setInternalMode}
          saveStatus={saveStatus}
          onSave={triggerSave}
          onPublish={() => {}}
          isPublished={false}
          backLabel={backLabel}
          onBack={() => navigate(backPath)}
          rightActions={rightActions}
        />

        {/* ══════════════════════════════════════════════════════════════════════
            Context banner
        ══════════════════════════════════════════════════════════════════════ */}
        {isAdminReview && (
          <div className="shrink-0 bg-amber-50 border-b border-amber-200 px-6 py-2.5 flex items-center gap-2.5">
            <Clock size={13} className="text-amber-600 flex-shrink-0" aria-hidden="true" />
            <p className="text-xs text-amber-800 flex-1">
              <span className="font-semibold">Reviewing: {clinicName} — </span>
              highlighted fields show what the user changed. Step through all three sections, then approve or request changes.
            </p>
          </div>
        )}

        {!isAdminReview && totalRejected > 0 && !bannerDismissed && (
          <div className="shrink-0 bg-red-50 border-b border-red-200 px-6 py-2.5 flex items-center gap-2.5">
            <AlertCircle size={13} className="text-red-500 flex-shrink-0" aria-hidden="true" />
            <p className="text-xs text-red-800 flex-1">
              <span className="font-semibold">
                {totalRejected} field{totalRejected !== 1 ? "s" : ""} need revision —
              </span>
              {" "}fix the red-outlined inputs across all sections, then submit your revision.
            </p>
            <button
              onClick={() => setBannerDismissed(true)}
              className="flex-shrink-0 text-xs font-medium text-red-400 hover:text-red-600 transition-colors ml-1"
              aria-label="Dismiss"
            >
              ✕
            </button>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════════════
            Page content — identical 3-step structure to SiteCreation in App.tsx.
            Submission data is now in ClinicContext so the forms are pre-populated.
        ══════════════════════════════════════════════════════════════════════ */}
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
          {internalMode === "domain" && (
            <DomainManagementPage />
          )}
        </div>

        {/* ── Request Changes modal (soft — clinic revises & resubmits) ── */}
        {requestModalOpen && (
          <div
            className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
            onClick={e => { if (e.target === e.currentTarget) setRequestModalOpen(false); }}
            role="dialog"
            aria-modal="true"
            aria-label="Request Changes"
          >
            <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-amber-200 overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <AlertCircle size={16} className="text-amber-500 shrink-0" aria-hidden="true" />
                  <div>
                    <h2 className="text-sm font-bold text-gray-900">Request Revision</h2>
                    <p className="text-xs text-gray-400 mt-0.5">
                      The clinic can make changes and resubmit.
                    </p>
                  </div>
                </div>
                <button type="button"
                  onClick={() => { setRequestModalOpen(false); setRequestFeedback(""); }}
                  className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
                  aria-label="Close">
                  <X size={14} />
                </button>
              </div>
              <div className="px-5 py-4">
                <textarea
                  value={requestFeedback}
                  onChange={e => setRequestFeedback(e.target.value)}
                  placeholder="e.g. The emergency phone number format needs a country code. Please confirm the new address before publishing."
                  className="w-full text-sm px-3.5 py-3 border border-gray-200 rounded-xl resize-none bg-gray-50 text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent"
                  rows={4}
                  maxLength={1000}
                  autoFocus
                />
                <span className="text-[11px] text-gray-400 mt-1 block">{requestFeedback.length} / 1000</span>
              </div>
              <div className="px-5 py-3.5 border-t border-gray-100 bg-gray-50/60 flex items-center justify-end gap-2">
                <button type="button"
                  onClick={() => { setRequestModalOpen(false); setRequestFeedback(""); }}
                  className="px-4 py-2 text-sm font-semibold text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                  Cancel
                </button>
                <button type="button"
                  disabled={!requestFeedback.trim()}
                  onClick={handleRequestChanges}
                  className="px-4 py-2 text-sm font-semibold text-white bg-amber-500 rounded-lg hover:bg-amber-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
                  Send for Revision
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── Reject modal (hard — permanent) ── */}
        {rejectModalOpen && (
          <div
            className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
            onClick={e => { if (e.target === e.currentTarget) setRejectModalOpen(false); }}
            role="dialog"
            aria-modal="true"
            aria-label="Reject Submission"
          >
            <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-red-200 overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <XCircle size={16} className="text-red-500 shrink-0" aria-hidden="true" />
                  <div>
                    <h2 className="text-sm font-bold text-gray-900">Reject Submission</h2>
                    <p className="text-xs text-gray-400 mt-0.5">
                      This is permanent — the clinic will be notified.
                    </p>
                  </div>
                </div>
                <button type="button"
                  onClick={() => { setRejectModalOpen(false); setRejectReason(""); }}
                  className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
                  aria-label="Close">
                  <X size={14} />
                </button>
              </div>
              <div className="px-5 py-4">
                <p className="text-xs text-red-700 bg-red-50 border border-red-100 rounded-lg px-3 py-2.5 mb-3">
                  Once rejected, this version cannot be resubmitted. The clinic will need to start a new submission.
                </p>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                  Reason <span className="text-gray-400 font-normal">(optional)</span>
                </label>
                <textarea
                  value={rejectReason}
                  onChange={e => setRejectReason(e.target.value)}
                  placeholder="e.g. This submission contains duplicate information from a previous version."
                  className="w-full text-sm px-3.5 py-3 border border-gray-200 rounded-xl resize-none bg-gray-50 text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-400 focus:border-transparent"
                  rows={3}
                  maxLength={1000}
                  autoFocus
                />
                <span className="text-[11px] text-gray-400 mt-1 block">{rejectReason.length} / 1000</span>
              </div>
              <div className="px-5 py-3.5 border-t border-gray-100 bg-gray-50/60 flex items-center justify-end gap-2">
                <button type="button"
                  onClick={() => { setRejectModalOpen(false); setRejectReason(""); }}
                  className="px-4 py-2 text-sm font-semibold text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                  Cancel
                </button>
                <button type="button"
                  onClick={handleReject}
                  className="px-4 py-2 text-sm font-semibold text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors">
                  Reject Submission
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── Success toast ── */}
        {showToast && (
          <div
            className="fixed bottom-6 right-6 z-50 flex items-center gap-3 bg-teal-600 text-white text-sm font-medium px-5 py-3.5 rounded-xl shadow-lg"
            role="status"
            aria-live="polite"
          >
            <CheckCircle2 size={16} className="flex-shrink-0" aria-hidden="true" />
            <div>
              <p className="font-semibold">
                {isAdminReview ? "Changes approved!" : "Revision submitted!"}
              </p>
              <p className="text-xs text-teal-100 mt-0.5">
                {isAdminReview
                  ? "All changes approved and will go live shortly."
                  : "Your revision is now under admin review."}
              </p>
            </div>
          </div>
        )}

      </div>
    </ReviewModeProvider>
  );
}
