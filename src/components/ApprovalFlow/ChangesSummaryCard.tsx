/**
 * ChangesSummaryCard
 * Compact submission row shown in the Approval Flow list.
 * "Draft" button signals parent to expand the DraftPanel inline.
 */

import { FileText, MessageSquare, Clock, ExternalLink } from "lucide-react";
import type { ChangeGroupSummary } from "../../context/ApprovalContext";

interface ChangesSummaryCardProps {
  clinicName:    string;
  submittedBy:   string;
  submittedAt:   string;
  changesSummary: ChangeGroupSummary[];
  feedbackCount: number;
  diffStats: {
    totalChanged:  number;
    bySection:     Record<string, number>;
    createdItems:  number;
    deletedItems:  number;
  };
  /** True when the DraftPanel for this card is currently open */
  isDraftOpen?:      boolean;
  onViewDraft:       () => void;
  onReviewInEditor?: () => void;
}

export function ChangesSummaryCard({
  clinicName,
  submittedBy,
  submittedAt,
  diffStats,
  feedbackCount,
  changesSummary,
  isDraftOpen = false,
  onViewDraft,
  onReviewInEditor,
}: ChangesSummaryCardProps) {

  // Section pill summary — max 4 shown inline
  const activeSections = changesSummary.filter(g => g.changeCount > 0);

  return (
    <div
      className="bg-white border border-gray-200 rounded-xl hover:border-gray-300 transition-all"
    >
      <div className="px-5 py-4 flex items-start justify-between gap-4">

        {/* Left: clinic info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1.5">
            <span className="text-sm font-semibold text-gray-900">{clinicName}</span>
            <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-amber-50 text-amber-700 border border-amber-200 uppercase tracking-wider">
              Pending
            </span>
            {feedbackCount > 0 && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-semibold rounded-full bg-red-50 text-red-700 border border-red-200">
                <MessageSquare className="w-2.5 h-2.5" aria-hidden="true" />
                {feedbackCount} feedback
              </span>
            )}
          </div>

          {/* Submitted by + date */}
          <div className="flex items-center gap-3 text-xs text-gray-500 mb-3">
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3 text-gray-400" aria-hidden="true" />
              {submittedAt}
            </span>
            <span>by <span className="font-medium text-gray-700">{submittedBy}</span></span>
          </div>

          {/* Stats + section pills */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-semibold text-gray-700">
              {diffStats.totalChanged} change{diffStats.totalChanged !== 1 ? "s" : ""}
            </span>
            {diffStats.createdItems > 0 && (
              <span className="text-[10px] font-semibold text-green-700 bg-green-50 border border-green-200 px-1.5 py-0.5 rounded-full">
                +{diffStats.createdItems} added
              </span>
            )}
            {diffStats.deletedItems > 0 && (
              <span className="text-[10px] font-semibold text-red-700 bg-red-50 border border-red-200 px-1.5 py-0.5 rounded-full">
                −{diffStats.deletedItems} removed
              </span>
            )}
            {activeSections.slice(0, 4).map(g => (
              <span
                key={g.sectionKey}
                className="text-[10px] text-gray-500 bg-gray-100 border border-gray-200 px-1.5 py-0.5 rounded-full"
              >
                {g.section}
              </span>
            ))}
            {activeSections.length > 4 && (
              <span className="text-[10px] text-gray-400">
                +{activeSections.length - 4} more
              </span>
            )}
          </div>
        </div>

        {/* Right: action buttons */}
        <div className="flex items-center gap-2 shrink-0">

          {/* Draft — toggles the inline diff panel */}
          <button
            type="button"
            onClick={e => { e.stopPropagation(); onViewDraft(); }}
            className={[
              "inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border transition-colors",
              "focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:ring-offset-1",
              isDraftOpen
                ? "bg-teal-600 text-white border-teal-600 hover:bg-teal-700"
                : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50 hover:border-gray-300",
            ].join(" ")}
            aria-expanded={isDraftOpen}
            aria-label={`${isDraftOpen ? "Close" : "Open"} draft for ${clinicName}`}
          >
            <FileText className="w-3.5 h-3.5" aria-hidden="true" />
            Draft
          </button>

          {/* Review in Editor */}
          {onReviewInEditor && (
            <button
              type="button"
              onClick={e => { e.stopPropagation(); onReviewInEditor(); }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-teal-700 bg-teal-50 border border-teal-200 rounded-lg hover:bg-teal-100 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:ring-offset-1"
              aria-label={`Review ${clinicName} in editor`}
            >
              <ExternalLink className="w-3.5 h-3.5" aria-hidden="true" />
              Review in Editor
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
