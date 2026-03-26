/**
 * Feedback Thread
 * Displays admin feedback on approval pending version chronologically
 * Shows feedback for specific fields with resolution status
 */

import React from "react";
import { MessageSquare, CheckCircle, Clock } from "lucide-react";
import { ApprovalFeedback } from "../../context/ApprovalContext";

interface FeedbackThreadProps {
  feedback: ApprovalFeedback[];
  onResolveFeedback?: (feedbackId: string) => void;
}

export function FeedbackThread({ feedback, onResolveFeedback }: FeedbackThreadProps) {
  if (feedback.length === 0) {
    return (
      <div className="p-6 text-center">
        <MessageSquare size={24} className="mx-auto mb-2 text-gray-400" />
        <p className="text-sm text-gray-600">No feedback yet</p>
      </div>
    );
  }

  // Sort by date descending (newest first)
  const sorted = [...feedback].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  const formatDate = (isoString: string) => {
    const date = new Date(isoString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return date.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
      });
    }

    if (date.toDateString() === yesterday.toDateString()) {
      return "Yesterday";
    }

    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };

  const getFeedbackTypeLabel = (type: string) => {
    switch (type) {
      case "request_change":
        return "Change Requested";
      case "needs_review":
        return "Needs Review";
      case "approved":
        return "Approved";
      case "rejected":
        return "Rejected";
      default:
        return "Feedback";
    }
  };

  const getFeedbackTypeColor = (type: string, resolved: boolean) => {
    if (resolved) {
      return "bg-gray-50 border-gray-200";
    }

    switch (type) {
      case "request_change":
        return "bg-amber-50 border-amber-200";
      case "needs_review":
        return "bg-blue-50 border-blue-200";
      case "approved":
        return "bg-green-50 border-green-200";
      case "rejected":
        return "bg-red-50 border-red-200";
      default:
        return "bg-gray-50 border-gray-200";
    }
  };

  const getFeedbackTypeBadgeColor = (type: string) => {
    switch (type) {
      case "request_change":
        return "bg-amber-100 text-amber-800";
      case "needs_review":
        return "bg-teal-100 text-teal-800";
      case "approved":
        return "bg-green-100 text-green-800";
      case "rejected":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="flex flex-col h-full overflow-y-auto bg-white">
      {sorted.map((item) => (
        <div
          key={item.id}
          className={`border-b border-gray-200 last:border-b-0 p-4 transition-colors ${getFeedbackTypeColor(
            item.type,
            item.resolved
          )}`}
        >
          {/* Header: Type + Date + Status */}
          <div className="flex items-start justify-between gap-3 mb-3 pb-3 border-b border-gray-300/40">
            <div className="flex items-center gap-2 flex-wrap">
              <span
                className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${getFeedbackTypeBadgeColor(
                  item.type
                )}`}
              >
                {getFeedbackTypeLabel(item.type)}
              </span>
              <span className="text-xs text-gray-500 font-medium">{formatDate(item.createdAt)}</span>
            </div>

            {item.resolved ? (
              <div className="flex items-center gap-1.5 text-xs font-semibold text-green-700 bg-green-50 px-2.5 py-1 rounded-full">
                <CheckCircle size={14} />
                Resolved
              </div>
            ) : (
              <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-full">
                <Clock size={14} />
                Pending
              </div>
            )}
          </div>

          {/* Field Path (if field-specific) */}
          {item.fieldPath && (
            <div className="mb-3">
              <p className="text-xs font-mono bg-gray-100 text-gray-700 px-2.5 py-1.5 rounded inline-block border border-gray-300 break-all">
                {item.fieldPath}
              </p>
            </div>
          )}

          {/* Message */}
          <div className="mb-4">
            <p className="text-sm text-gray-800 leading-relaxed font-medium">{item.message}</p>
          </div>

          {/* Footer: Submitter + Action */}
          <div className="flex items-center justify-between text-xs text-gray-600 pt-2">
            <span className="font-medium">From: {item.createdBy}</span>

            {!item.resolved && item.type === "request_change" && onResolveFeedback && (
              <button
                onClick={() => onResolveFeedback(item.id)}
                className="text-xs px-3 py-1.5 rounded-md border-2 border-gray-300 text-gray-700 hover:border-teal-400 hover:text-teal-700 hover:bg-teal-50 active:bg-teal-100 transition-colors font-semibold focus:outline-none focus:ring-2 focus:ring-teal-600 focus:ring-offset-2"
                aria-label="Mark this feedback as resolved"
              >
                Mark Resolved
              </button>
            )}
          </div>

          {/* Resolution Info */}
          {item.resolved && item.resolutionTimestamp && (
            <div className="mt-3 pt-3 border-t border-teal-300 bg-teal-50/30 px-3 py-2 rounded text-xs text-teal-700 font-medium">
              ✓ Resolved on {formatDate(item.resolutionTimestamp)}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
