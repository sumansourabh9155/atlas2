/**
 * Changes Summary Card
 * Displays a compact summary of changes for a pending approval
 * Shows "5 fields changed" breakdown by section with feedback indicators
 */

import React, { useState } from "react";
import { ChevronDown, ChevronUp, MessageSquare, AlertCircle } from "lucide-react";
import { ChangeGroupSummary, ApprovalFeedback } from "../../context/ApprovalContext";

interface ChangesSummaryCardProps {
  clinicName: string;
  submittedBy: string;
  submittedAt: string;
  changesSummary: ChangeGroupSummary[];
  feedbackCount: number;
  diffStats: {
    totalChanged: number;
    bySection: Record<string, number>;
    createdItems: number;
    deletedItems: number;
  };
  onViewDetails: () => void;
}

export function ChangesSummaryCard({
  clinicName,
  submittedBy,
  submittedAt,
  changesSummary,
  feedbackCount,
  diffStats,
  onViewDetails,
}: ChangesSummaryCardProps) {
  const [isBreakdownExpanded, setIsBreakdownExpanded] = useState(false);

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 hover:border-gray-300 transition cursor-pointer group">
      {/* Header Row */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          {/* Clinic Name + Status */}
          <div className="flex items-center gap-2.5 mb-2">
            <h3 className="text-sm font-medium text-gray-900">{clinicName}</h3>
            <span className="px-2 py-0.5 text-xs font-medium rounded bg-amber-50 text-amber-700">
              Pending Review
            </span>
            {feedbackCount > 0 && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded bg-red-50 text-red-700">
                <AlertCircle size={12} />
                {feedbackCount} feedback
              </span>
            )}
          </div>

          {/* Submission Info */}
          <div className="flex flex-wrap gap-5 text-xs text-gray-600 mb-3">
            <div>Submitted by {submittedBy}</div>
            <div>{submittedAt}</div>
          </div>

          {/* Change Summary */}
          <div className="flex items-baseline gap-2 mb-3">
            <p className="text-sm font-medium text-gray-900">
              {diffStats.totalChanged} field{diffStats.totalChanged !== 1 ? "s" : ""} changed
            </p>
            {diffStats.createdItems > 0 && (
              <span className="text-xs text-green-600">+{diffStats.createdItems} created</span>
            )}
            {diffStats.deletedItems > 0 && (
              <span className="text-xs text-red-600">-{diffStats.deletedItems} deleted</span>
            )}
          </div>

          {/* Expandable Breakdown by Section */}
          {isBreakdownExpanded && (
            <div className="bg-gray-50 rounded-md p-4 mb-4 space-y-3 border border-gray-200">
              {changesSummary.map((group) => (
                <div key={group.sectionKey} className="flex items-center justify-between">
                  <span className="text-xs font-medium text-gray-700">{group.section}</span>
                  <div className="flex items-center gap-3">
                    {group.createdCount > 0 && (
                      <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded">
                        +{group.createdCount} added
                      </span>
                    )}
                    {group.updatedCount > 0 && (
                      <span className="text-xs font-medium text-teal-600 bg-teal-50 px-2 py-1 rounded">
                        ~{group.updatedCount} updated
                      </span>
                    )}
                    {group.deletedCount > 0 && (
                      <span className="text-xs font-medium text-red-600 bg-red-50 px-2 py-1 rounded">
                        -{group.deletedCount} removed
                      </span>
                    )}
                    {group.changeCount === 0 && (
                      <span className="text-xs text-gray-500">No changes</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Actions Column */}
        <div className="flex items-center gap-2 ml-4 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => setIsBreakdownExpanded(!isBreakdownExpanded)}
            className="p-1.5 text-gray-600 hover:text-gray-900 hover:bg-gray-100 active:bg-gray-200 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2"
            title={isBreakdownExpanded ? "Hide change breakdown" : "Show change breakdown"}
            aria-label={isBreakdownExpanded ? "Hide breakdown" : "Show breakdown"}
            aria-expanded={isBreakdownExpanded}
          >
            {isBreakdownExpanded ? (
              <ChevronUp size={18} />
            ) : (
              <ChevronDown size={18} />
            )}
          </button>
          <button
            onClick={onViewDetails}
            className="px-4 py-2 text-xs font-semibold rounded-md bg-teal-600 text-white hover:bg-teal-700 active:bg-teal-800 transition-colors focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label={`Review changes for ${clinicName}`}
          >
            Review Changes
          </button>
        </div>
      </div>
    </div>
  );
}
