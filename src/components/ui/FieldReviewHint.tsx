/**
 * FieldReviewHint — Inline status indicator below a form field in review mode.
 *
 * - "rejected" → red row with AlertCircle + "Revision requested" + admin feedback
 * - "pending" (admin-review mode only) → amber dot + "Changed — pending review"
 * - No change at this path → renders nothing
 *
 * Usage:
 *   <input className={`${INPUT} ${reviewMode.getFieldHighlightClass("general.name")}`} />
 *   <FieldReviewHint path="general.name" />
 */

import { AlertCircle } from "lucide-react";
import { useReviewMode } from "../../context/ReviewModeContext";

interface FieldReviewHintProps {
  path: string;
}

export function FieldReviewHint({ path }: FieldReviewHintProps) {
  const { getFieldStatus, getFieldFeedback, mode } = useReviewMode();
  const status   = getFieldStatus(path);
  const feedback = getFieldFeedback(path);

  if (!status) return null;

  if (status === "rejected") {
    return (
      <div className="mt-1.5 flex items-start gap-1.5">
        <AlertCircle size={11} className="text-red-500 shrink-0 mt-0.5" aria-hidden="true" />
        <div>
          <p className="text-xs font-medium text-red-600">Revision requested</p>
          {feedback && (
            <p className="text-[11px] text-red-500 mt-0.5 leading-snug">{feedback}</p>
          )}
        </div>
      </div>
    );
  }

  if (status === "pending" && mode === "admin-review") {
    return (
      <p className="mt-1 text-[11px] text-amber-600 flex items-center gap-1">
        <span className="inline-block w-1.5 h-1.5 rounded-full bg-amber-400" aria-hidden="true" />
        Changed — pending review
      </p>
    );
  }

  return null;
}
