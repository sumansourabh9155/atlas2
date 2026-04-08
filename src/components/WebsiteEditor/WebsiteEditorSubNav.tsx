/**
 * Website Editor Sub-Navigation Bar
 * Full-width header for the distraction-free clinic creation flow.
 *
 * Layout (3 equal zones):
 * [← Back label]   |   [Step 1 → Step 2 → Step 3]   |   [Save] [Save & Next / Publish]
 */

import React from "react";
import { ArrowLeft, Check, Save, Loader2, ChevronRight, Globe } from "lucide-react";

export type InternalMode = "setup" | "editor" | "domain";

interface WebsiteEditorSubNavProps {
  internalMode: InternalMode;
  onModeChange: (mode: InternalMode) => void;
  saveStatus: "idle" | "saving" | "saved" | "error";
  onSave: () => void;
  onPublish: () => void;
  isPublished: boolean;
  /** Called when the user clicks the back button */
  onBack?: () => void;
  /** Label shown next to the back arrow, e.g. "Clinic List" */
  backLabel?: string;
  /**
   * Approval mode — when true the "Publish" button is replaced with
   * "Submit for Review" / "Awaiting Review" / "Revise & Resubmit"
   * depending on submissionStatus. Used for Custom-role users.
   */
  approvalMode?: boolean;
  /** Current submission state (only used when approvalMode=true) */
  submissionStatus?: "idle" | "pending" | "rejected";
  /** Called instead of onPublish when approvalMode=true and status is idle/rejected */
  onSubmitForReview?: () => void;
}

const STEPS: { id: InternalMode; label: string }[] = [
  { id: "setup",  label: "Business Details"     },
  { id: "editor", label: "Website Builder"     },
  { id: "domain", label: "Domain & Publishing" },
];

export function WebsiteEditorSubNav({
  internalMode,
  onModeChange,
  saveStatus,
  onSave,
  onPublish,
  isPublished,
  onBack,
  backLabel,
  approvalMode = false,
  submissionStatus = "idle",
  onSubmitForReview,
}: WebsiteEditorSubNavProps) {

  const NEXT_STEP: Partial<Record<InternalMode, InternalMode>> = {
    setup: "editor",
    editor: "domain",
  };
  const nextStep = NEXT_STEP[internalMode];
  const activeIdx = STEPS.findIndex((s) => s.id === internalMode);

  const saveBtnLabel =
    saveStatus === "saving" ? "Saving…"
    : saveStatus === "saved"  ? "Saved"
    : "Save";

  return (
    <div className="shrink-0 h-14 bg-white border-b border-gray-200 flex items-center px-6 z-40">

      {/* ── Left: Back Button ── */}
      <div className="flex-1 flex items-center">
        {onBack && (
          <button
            type="button"
            onClick={onBack}
            className="flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors group"
            title={`Back to ${backLabel ?? "previous page"}`}
          >
            <ArrowLeft
              size={16}
              className="transition-transform group-hover:-translate-x-0.5"
              aria-hidden="true"
            />
            <span>{backLabel ?? "Back"}</span>
          </button>
        )}
      </div>

      {/* ── Center: Step Tabs ── */}
      <div role="tablist" aria-label="Clinic creation steps" className="flex items-center">
        {STEPS.map(({ id, label }, i) => {
          const active = internalMode === id;
          const past   = i < activeIdx;

          return (
            <div key={id} className="flex items-center">
              <button
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => onModeChange(id)}
                className="group flex items-center gap-2 px-2 py-1 rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-600"
              >
                {/* Bubble */}
                <div
                  aria-hidden="true"
                  className={[
                    "w-6 h-6 rounded-full flex items-center justify-center shrink-0 text-[11px] font-bold border-2 transition-all duration-200",
                    active
                      ? "bg-teal-600 border-teal-600 text-white shadow-sm"
                      : past
                        ? "bg-teal-50 border-teal-400 text-teal-600"
                        : "bg-white border-gray-300 text-gray-400 group-hover:border-gray-400",
                  ].join(" ")}
                >
                  {past ? <Check className="w-3 h-3" /> : i + 1}
                </div>

                {/* Label */}
                <span
                  className={[
                    "text-sm font-medium whitespace-nowrap transition-colors",
                    active
                      ? "text-teal-600"
                      : past
                        ? "text-gray-500"
                        : "text-gray-400 group-hover:text-gray-600",
                  ].join(" ")}
                >
                  {label}
                </span>
              </button>

              {/* Connector */}
              {i < STEPS.length - 1 && (
                <div className="w-10 h-px mx-1 shrink-0 relative">
                  <div className="absolute inset-0 bg-gray-200 rounded-full" aria-hidden="true" />
                  {past && (
                    <div className="absolute inset-0 bg-teal-400/40 rounded-full transition-all duration-300" />
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* ── Right: Action Buttons ── */}
      <div className="flex-1 flex items-center justify-end gap-2">

        {/* Save (always visible) */}
        <button
          type="button"
          onClick={onSave}
          disabled={saveStatus === "saving"}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-gray-600 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-600 disabled:opacity-60"
        >
          {saveStatus === "saving" ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" aria-hidden="true" />
          ) : saveStatus === "saved" ? (
            <Check className="w-3.5 h-3.5 text-green-600" aria-hidden="true" />
          ) : (
            <Save className="w-3.5 h-3.5" aria-hidden="true" />
          )}
          {saveBtnLabel}
        </button>

        {/* Save & Next (steps 1 & 2) */}
        {nextStep && (
          <button
            type="button"
            onClick={() => { onSave(); onModeChange(nextStep); }}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-md transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-600 focus-visible:ring-offset-1"
          >
            Save &amp; Next
            <ChevronRight className="w-3.5 h-3.5" aria-hidden="true" />
          </button>
        )}

        {/* Publish OR Submit for Review (step 3 only) */}
        {internalMode === "domain" && (
          approvalMode ? (
            /* ── Custom-user approval mode ── */
            <>
              {/* Contextual status pill next to Save */}
              {submissionStatus === "pending" && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full border bg-amber-50 text-amber-700 border-amber-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" aria-hidden="true" />
                  Under admin review
                </span>
              )}
              {submissionStatus === "rejected" && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full border bg-red-50 text-red-700 border-red-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-500" aria-hidden="true" />
                  Revision Requested
                </span>
              )}

              {/* Submit / Awaiting / Revise button */}
              {submissionStatus === "idle" && (
                <button
                  type="button"
                  onClick={onSubmitForReview}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-semibold text-white bg-amber-500 hover:bg-amber-600 rounded-md transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-offset-1"
                >
                  <Globe className="w-3.5 h-3.5" aria-hidden="true" />
                  Submit for Review
                </button>
              )}
              {submissionStatus === "pending" && (
                <button
                  type="button"
                  disabled
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-semibold text-white bg-amber-400 cursor-not-allowed opacity-70 rounded-md"
                >
                  <Loader2 className="w-3.5 h-3.5 animate-spin" aria-hidden="true" />
                  Awaiting Review
                </button>
              )}
              {submissionStatus === "rejected" && (
                <button
                  type="button"
                  onClick={onSubmitForReview}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-semibold text-white bg-red-500 hover:bg-red-600 rounded-md transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-1"
                >
                  <Globe className="w-3.5 h-3.5" aria-hidden="true" />
                  Revise &amp; Resubmit
                </button>
              )}
            </>
          ) : (
            /* ── Standard admin/manager publish button ── */
            <button
              type="button"
              onClick={onPublish}
              disabled={isPublished}
              className={[
                "inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-semibold text-white rounded-md transition-colors",
                "focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-1",
                isPublished
                  ? "bg-emerald-600 cursor-default focus-visible:ring-emerald-600"
                  : "bg-teal-600 hover:bg-teal-700 focus-visible:ring-teal-600",
              ].join(" ")}
            >
              {isPublished ? (
                <><Check className="w-3.5 h-3.5" aria-hidden="true" /> Published</>
              ) : (
                <><Globe className="w-3.5 h-3.5" aria-hidden="true" /> Publish Site</>
              )}
            </button>
          )
        )}
      </div>
    </div>
  );
}
