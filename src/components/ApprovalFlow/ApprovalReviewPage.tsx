/**
 * ApprovalReviewPage — Full-screen review / revise flow.
 *
 * Works in two modes driven by navigation state:
 *
 *  "admin-review"   Admin opens a pending submission to inspect field-level
 *                   changes (amber highlights) and approve or request changes.
 *
 *  "custom-revise"  Custom user opens a rejected submission to see exactly
 *                   which fields were rejected (red borders, like the reference
 *                   payment-form image), edit them inline, and resubmit.
 *
 * Layout
 * ──────
 *  ┌─ Review TopBar (breadcrumb + status + CTA) ──────────────────────────────┐
 *  │  ← Approval Flow  /  Happy Paws              [3 pending]  [Approve All]  │
 *  ├─ Left: Changes Panel (w-72) ─────┬─ Right: HospitalSetupPage ────────────┤
 *  │  General Info (2)                │  (field inputs highlighted via        │
 *  │    • Clinic Name   pending        │   ReviewModeContext)                  │
 *  │    • Tagline       pending        │                                       │
 *  │  Contact (2)                     │                                       │
 *  │    • Phone   ✕ rejected           │                                       │
 *  │      "Verify with clinic mgr"    │                                       │
 *  └──────────────────────────────────┴───────────────────────────────────────┘
 */

import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  ArrowLeft, CheckCircle2, AlertCircle, Clock,
  ChevronDown, ChevronRight, RotateCcw, Eye,
  AlertTriangle,
} from "lucide-react";

import { ReviewModeProvider } from "../../context/ReviewModeContext";
import { HospitalSetupPage } from "../HospitalSetup/HospitalSetupPage";
import type { FieldChange } from "../../lib/approval/diffGenerator";
import { useApproval } from "../../context/ApprovalContext";
import type { ClinicVersionV2 } from "../../context/ApprovalContext";

/* ─── Types ──────────────────────────────────────────────────────────────────── */

type ReviewMode = "admin-review" | "custom-revise";

interface ReviewPageState {
  mode?:         ReviewMode;
  clinicName?:   string;
  submissionId?: string;
}


/* ─── Helpers ─────────────────────────────────────────────────────────────────── */

const SECTION_LABELS: Record<string, string> = {
  general:       "General Information",
  taxonomy:      "Business Type & Pets",
  contact:       "Contact & Location",
  services:      "Services",
  veterinarians: "Team Members",
  blocks:        "Page Layout",
  other:         "Other",
};

function groupBySection(changes: FieldChange[]): Record<string, FieldChange[]> {
  const groups: Record<string, FieldChange[]> = {};
  for (const c of changes) {
    if (!groups[c.section]) groups[c.section] = [];
    groups[c.section].push(c);
  }
  return groups;
}

/* ─── Status meta ─────────────────────────────────────────────────────────────── */

const STATUS_META = {
  pending:  { icon: Clock,         color: "text-amber-500",   bg: "bg-amber-50",   border: "border-amber-200",   label: "Pending"          },
  rejected: { icon: AlertCircle,   color: "text-red-500",     bg: "bg-red-50",     border: "border-red-200",     label: "Needs Revision"   },
  approved: { icon: CheckCircle2,  color: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-200", label: "Approved"         },
} as const;

/* ─── Component ──────────────────────────────────────────────────────────────── */

export function ApprovalReviewPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const state    = (location.state ?? {}) as ReviewPageState;

  const { pendingApprovals, approveChanges, rejectChanges, workflows } = useApproval();

  const mode:      ReviewMode = state.mode       ?? "custom-revise";
  const versionId: string     = state.submissionId ?? "v-demo";

  const isAdminReview = mode === "admin-review";
  const backPath      = isAdminReview ? "/approvals"      : "/my-submissions";
  const backLabel     = isAdminReview ? "Approval Flow"   : "My Submissions";

  // Find submission: check pending list first, then approval history (for rejected/revise flows)
  const submission: ClinicVersionV2 | undefined =
    (pendingApprovals.find((p) => p.id === versionId) as ClinicVersionV2 | undefined) ??
    Array.from(workflows.values())
      .flatMap((wf) => wf.approvalHistory as ClinicVersionV2[])
      .find((v) => v.id === versionId);

  const clinicName: string =
    state.clinicName ??
    submission?.changes?.general?.name ??
    (mode === "admin-review" ? "Happy Paws Specialty" : "Urban Pet Care");

  const fieldChanges: FieldChange[] = submission?.fieldChanges ?? [];
  const grouped      = groupBySection(fieldChanges);

  const totalRejected = fieldChanges.filter((c) => c.status === "rejected").length;
  const totalPending  = fieldChanges.filter((c) => c.status === "pending").length;

  const [collapsedSections, setCollapsedSections] = useState<Set<string>>(new Set());
  const [showToast,         setShowToast]         = useState(false);

  function toggleSection(key: string) {
    setCollapsedSections((prev) => {
      const next = new Set(prev);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });
  }

  function handleApproveAll() {
    if (!window.confirm("Approve all changes for this submission?")) return;
    approveChanges(versionId, "", "admin");
    setShowToast(true);
    setTimeout(() => {
      setShowToast(false);
      navigate("/approvals");
    }, 2500);
  }

  function handleRequestChanges() {
    const feedback = window.prompt("Describe the changes needed:");
    if (!feedback?.trim()) return;
    rejectChanges(versionId, feedback.trim(), "admin");
    navigate("/approvals");
  }

  function handleSubmitRevision() {
    setShowToast(true);
    setTimeout(() => {
      setShowToast(false);
      navigate("/my-submissions");
    }, 2500);
  }

  /* ─── Not-found guard (submission processed or page refreshed) ── */
  if (!submission) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-xs">
          <div className="w-12 h-12 bg-amber-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <AlertTriangle size={20} className="text-amber-500" aria-hidden="true" />
          </div>
          <p className="text-sm font-semibold text-gray-800">Submission not found</p>
          <p className="text-xs text-gray-400 mt-1 leading-relaxed">
            This submission may have already been approved, rejected, or the page was refreshed.
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

  /* ─── Render ── */
  return (
    <ReviewModeProvider
      mode={mode}
      fieldChanges={fieldChanges}
      clinicName={clinicName}
      versionId={versionId}
    >
      <div className="h-screen flex flex-col overflow-hidden bg-gray-50">

        {/* ── Review Top Bar ── */}
        <div className="h-14 shrink-0 bg-white border-b border-gray-200 flex items-center px-5 gap-3 z-50">

          {/* Breadcrumb back */}
          <button
            onClick={() => navigate(backPath)}
            className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-700 transition-colors group flex-shrink-0"
          >
            <ArrowLeft size={13} className="transition-transform group-hover:-translate-x-0.5" aria-hidden="true" />
            <span className="font-medium">{backLabel}</span>
          </button>
          <span className="text-gray-200 select-none">/</span>

          {/* Clinic name + status badge */}
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <span className="text-sm font-semibold text-gray-900 truncate">{clinicName}</span>

            {isAdminReview && totalPending > 0 && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[11px] font-semibold rounded-full bg-amber-50 text-amber-700 border border-amber-200 flex-shrink-0">
                <Clock size={10} aria-hidden="true" />
                {totalPending} pending
              </span>
            )}
            {!isAdminReview && totalRejected > 0 && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[11px] font-semibold rounded-full bg-red-50 text-red-700 border border-red-200 flex-shrink-0">
                <AlertCircle size={10} aria-hidden="true" />
                {totalRejected} to revise
              </span>
            )}
          </div>

          {/* Mode indicator (subtle) */}
          <span className="text-xs text-gray-400 hidden sm:block flex-shrink-0">
            {isAdminReview ? "Admin Review" : "Revise & Resubmit"}
          </span>

          {/* CTA buttons */}
          {isAdminReview ? (
            <div className="flex items-center gap-2 flex-shrink-0">
              <button
                onClick={handleRequestChanges}
                className="px-3.5 py-1.5 text-sm font-semibold text-red-600 border border-red-200 bg-red-50 hover:bg-red-100 rounded-md transition-colors"
              >
                Request Changes
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
            <button
              onClick={handleSubmitRevision}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-sm font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-md transition-colors flex-shrink-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-600"
            >
              <RotateCcw size={14} aria-hidden="true" />
              Submit Revision
            </button>
          )}
        </div>

        {/* ── Body ── */}
        <div className="flex-1 overflow-hidden flex">

          {/* ── Left: Changes Panel ── */}
          <aside
            className="w-72 shrink-0 border-r border-gray-200 bg-white flex flex-col overflow-hidden"
            aria-label="Field changes panel"
          >
            {/* Panel header */}
            <div className="px-4 py-3 border-b border-gray-100 bg-gray-50 shrink-0">
              <p className="text-xs font-semibold text-gray-800">
                {isAdminReview ? "Submitted Changes" : "Fields to Revise"}
              </p>
              <p className="text-[11px] text-gray-400 mt-0.5">
                {isAdminReview
                  ? `${fieldChanges.length} field${fieldChanges.length !== 1 ? "s" : ""} changed by user`
                  : `${totalRejected} rejected · ${fieldChanges.length - totalRejected} other`}
              </p>
            </div>

            {/* Change groups list */}
            <div className="flex-1 overflow-y-auto px-3 py-3 space-y-2">
              {Object.entries(grouped).map(([sectionKey, changes]) => {
                const isCollapsed    = collapsedSections.has(sectionKey);
                const rejectedCount  = changes.filter((c) => c.status === "rejected").length;
                const sectionLabel   = SECTION_LABELS[sectionKey] ?? sectionKey;

                return (
                  <div key={sectionKey} className="rounded-lg border border-gray-100 overflow-hidden bg-white">
                    {/* Section toggle header */}
                    <button
                      onClick={() => toggleSection(sectionKey)}
                      className="w-full flex items-center gap-2 px-3 py-2.5 bg-gray-50 hover:bg-gray-100 transition-colors text-left"
                      aria-expanded={!isCollapsed}
                    >
                      <span className="text-xs font-semibold text-gray-700 flex-1 truncate">
                        {sectionLabel}
                      </span>
                      {rejectedCount > 0 && (
                        <span className="text-[10px] font-bold text-red-600 bg-red-100 px-1.5 py-0.5 rounded-full flex-shrink-0">
                          {rejectedCount} ✕
                        </span>
                      )}
                      <span className="text-[10px] text-gray-400 flex-shrink-0">{changes.length}</span>
                      {isCollapsed
                        ? <ChevronRight size={12} className="text-gray-400 flex-shrink-0" aria-hidden="true" />
                        : <ChevronDown  size={12} className="text-gray-400 flex-shrink-0" aria-hidden="true" />
                      }
                    </button>

                    {/* Field change items */}
                    {!isCollapsed && (
                      <div className="divide-y divide-gray-50">
                        {changes.map((change) => {
                          const sm = STATUS_META[change.status as keyof typeof STATUS_META] ?? STATUS_META.pending;
                          const SI = sm.icon;

                          return (
                            <div key={change.id} className="px-3 py-2.5">
                              {/* Label + status pill */}
                              <div className="flex items-center gap-1.5 mb-2">
                                <SI size={11} className={sm.color} aria-hidden="true" />
                                <span className="text-xs font-medium text-gray-700 flex-1 truncate">
                                  {change.label}
                                </span>
                                <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full border flex-shrink-0 ${sm.bg} ${sm.color} ${sm.border}`}>
                                  {sm.label}
                                </span>
                              </div>

                              {/* Before → After value chips */}
                              <div className="space-y-1">
                                {change.previousValue !== undefined && (
                                  <div className="flex items-start gap-1.5">
                                    <span className="text-[10px] text-gray-400 w-7 shrink-0 pt-0.5">was</span>
                                    <span
                                      className="text-[11px] text-red-600 bg-red-50 px-1.5 py-0.5 rounded line-through leading-snug break-all flex-1"
                                      title={String(change.previousValue)}
                                    >
                                      {String(change.previousValue).slice(0, 50)}
                                      {String(change.previousValue).length > 50 ? "…" : ""}
                                    </span>
                                  </div>
                                )}
                                <div className="flex items-start gap-1.5">
                                  <span className="text-[10px] text-gray-400 w-7 shrink-0 pt-0.5">now</span>
                                  <span
                                    className="text-[11px] text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded leading-snug break-all flex-1"
                                    title={String(change.updatedValue)}
                                  >
                                    {String(change.updatedValue).slice(0, 50)}
                                    {String(change.updatedValue).length > 50 ? "…" : ""}
                                  </span>
                                </div>
                              </div>

                              {/* Admin feedback (rejection reason) */}
                              {change.adminFeedback && (
                                <div className="mt-2 flex items-start gap-1.5 bg-amber-50 border border-amber-100 rounded-md px-2 py-1.5">
                                  <AlertTriangle size={10} className="text-amber-500 shrink-0 mt-0.5" aria-hidden="true" />
                                  <p className="text-[10px] text-amber-800 leading-relaxed">
                                    {change.adminFeedback}
                                  </p>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Panel footer hint */}
            <div className="px-4 py-3 border-t border-gray-100 bg-gray-50 shrink-0">
              {isAdminReview ? (
                <div className="flex items-start gap-1.5">
                  <Eye size={11} className="text-amber-500 shrink-0 mt-0.5" aria-hidden="true" />
                  <p className="text-[10px] text-gray-500 leading-relaxed">
                    Amber fields are pending your review. Approve all or request changes above.
                  </p>
                </div>
              ) : (
                <div className="flex items-start gap-1.5">
                  <AlertCircle size={11} className="text-red-400 shrink-0 mt-0.5" aria-hidden="true" />
                  <p className="text-[10px] text-gray-500 leading-relaxed">
                    Red fields were rejected by admin. Fix them in the form, then submit your revision.
                  </p>
                </div>
              )}
            </div>
          </aside>

          {/* ── Right: Form + context banner ── */}
          <div className="flex-1 overflow-hidden flex flex-col min-w-0">

            {/* Contextual info banner */}
            {!isAdminReview && totalRejected > 0 && (
              <div className="shrink-0 bg-red-50 border-b border-red-200 px-5 py-2.5 flex items-center gap-2.5">
                <AlertCircle size={14} className="text-red-500 flex-shrink-0" aria-hidden="true" />
                <p className="text-xs text-red-800">
                  <span className="font-semibold">
                    {totalRejected} field{totalRejected !== 1 ? "s" : ""} need{totalRejected === 1 ? "s" : ""} revision
                  </span>
                  {" — "}inputs outlined in red require your attention. Update them and click{" "}
                  <span className="font-semibold">Submit Revision</span>.
                </p>
              </div>
            )}
            {isAdminReview && (
              <div className="shrink-0 bg-amber-50 border-b border-amber-200 px-5 py-2.5 flex items-center gap-2.5">
                <Eye size={14} className="text-amber-600 flex-shrink-0" aria-hidden="true" />
                <p className="text-xs text-amber-800">
                  <span className="font-semibold">Review mode</span>
                  {" — "}inputs outlined in amber are pending changes submitted by the user.
                  Review the left panel, then approve or request changes.
                </p>
              </div>
            )}

            {/* Embedded setup form (left panel hidden — we have our own) */}
            <HospitalSetupPage hideLeftPanel onNext={undefined} />
          </div>

        </div>

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
                  ? "All changes have been approved and will go live shortly."
                  : "Your revision is now under admin review."}
              </p>
            </div>
          </div>
        )}

      </div>
    </ReviewModeProvider>
  );
}
