/**
 * Diff View Panel
 * Displays field-level changes with before/after values
 * Shows change metadata and request change buttons
 */

import React, { useState } from "react";
import { ChevronDown, ChevronUp, AlertCircle, Plus, Trash2, Edit2 } from "lucide-react";
import { FieldChange } from "../../lib/approval/diffGenerator";

interface DiffViewPanelProps {
  fieldChanges: FieldChange[];
  selectedSectionKey: string;
  onRequestChange: (fieldPath: string, message: string) => void;
}

export function DiffViewPanel({
  fieldChanges,
  selectedSectionKey,
  onRequestChange,
}: DiffViewPanelProps) {
  const [expandedFields, setExpandedFields] = useState<Set<string>>(new Set());
  const [feedbackField, setFeedbackField] = useState<string | null>(null);
  const [feedbackText, setFeedbackText] = useState("");

  // Filter changes for selected section
  const sectionChanges = fieldChanges.filter(
    (change) => change.section === selectedSectionKey
  );

  const toggleExpanded = (path: string) => {
    const newExpanded = new Set(expandedFields);
    if (newExpanded.has(path)) {
      newExpanded.delete(path);
    } else {
      newExpanded.add(path);
    }
    setExpandedFields(newExpanded);
  };

  const handleSubmitFeedback = (fieldPath: string) => {
    if (feedbackText.trim()) {
      onRequestChange(fieldPath, feedbackText);
      setFeedbackField(null);
      setFeedbackText("");
    }
  };

  const getChangeTypeColor = (changeType: string) => {
    switch (changeType) {
      case "created":
        return "text-green-600";
      case "deleted":
        return "text-red-600";
      case "updated":
        return "text-teal-600";
      case "reordered":
        return "text-amber-600";
      default:
        return "text-gray-600";
    }
  };

  const getChangeTypeLabel = (changeType: string) => {
    switch (changeType) {
      case "created":
        return "Added";
      case "deleted":
        return "Removed";
      case "updated":
        return "Updated";
      case "reordered":
        return "Reordered";
      default:
        return "Changed";
    }
  };

  const getChangeTypeIcon = (changeType: string) => {
    switch (changeType) {
      case "created":
        return <Plus size={14} />;
      case "deleted":
        return <Trash2 size={14} />;
      case "updated":
        return <Edit2 size={14} />;
      default:
        return null;
    }
  };

  if (sectionChanges.length === 0) {
    return (
      <div className="p-6 text-center">
        <p className="text-sm text-gray-600">No changes in this section</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full overflow-y-auto">
      {sectionChanges.map((change) => {
        const isExpanded = expandedFields.has(change.path);
        const isRequestingFeedback = feedbackField === change.path;

        return (
          <div
            key={change.id}
            className="border-b border-gray-200 last:border-b-0"
          >
            {/* Header - Clickable to expand */}
            <button
              onClick={() => toggleExpanded(change.path)}
              className="w-full p-4 hover:bg-gray-50 active:bg-gray-100 transition-colors text-left focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-inset"
              aria-expanded={isExpanded}
              aria-label={`Toggle details for ${change.label}`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-sm font-semibold text-gray-900">
                      {change.label}
                    </span>
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold ${
                        change.changeType === "created"
                          ? "bg-green-100 text-green-800"
                          : change.changeType === "deleted"
                          ? "bg-red-100 text-red-800"
                          : change.changeType === "updated"
                          ? "bg-teal-100 text-teal-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {getChangeTypeIcon(change.changeType)}
                      {getChangeTypeLabel(change.changeType)}
                    </span>
                  </div>
                  <p className="text-xs text-gray-600 leading-relaxed break-words">
                    {change.humanSummary}
                  </p>
                </div>

                <div className="flex-shrink-0 text-gray-400 mt-0.5">
                  {isExpanded ? (
                    <ChevronUp size={18} />
                  ) : (
                    <ChevronDown size={18} />
                  )}
                </div>
              </div>
            </button>

            {/* Expanded Details */}
            {isExpanded && (
              <div className="px-4 py-4 bg-gray-50 border-t border-gray-200 space-y-4">
                {/* Field Path */}
                <div>
                  <p className="text-xs font-semibold text-gray-600 mb-2 uppercase tracking-wider">Field Path</p>
                  <p className="text-xs font-mono bg-white border border-gray-300 rounded-md px-3 py-2 text-gray-700 break-all">
                    {change.path}
                  </p>
                </div>

                {/* Previous & Updated Values */}
                {(change.changeType === "updated" || change.changeType === "created") && (
                  <div className="grid grid-cols-2 gap-3">
                    {/* Previous Value */}
                    {change.previousValue !== undefined && (
                      <div>
                        <p className="text-xs font-semibold text-gray-700 mb-2 uppercase tracking-wider">
                          {change.changeType === "created" ? "New" : "Previous"}
                        </p>
                        <div className="bg-gray-50 border border-gray-300 rounded-md p-3 min-h-[60px] flex items-center">
                          <p className="text-xs text-gray-600 break-words font-mono">
                            {change.changeType === "created"
                              ? "(none)"
                              : typeof change.previousValue === "string"
                              ? `"${change.previousValue}"`
                              : typeof change.previousValue === "object"
                              ? JSON.stringify(change.previousValue).slice(0, 50) + "..."
                              : String(change.previousValue)}
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Updated Value */}
                    {change.updatedValue !== undefined && (
                      <div>
                        <p className="text-xs font-semibold text-gray-700 mb-2 uppercase tracking-wider">
                          {change.changeType === "created" ? "Added" : "Updated"}
                        </p>
                        <div className="bg-teal-50 border border-teal-300 rounded-md p-3 min-h-[60px] flex items-center">
                          <p className="text-xs text-teal-900 break-words font-mono font-medium">
                            {typeof change.updatedValue === "string"
                              ? `"${change.updatedValue}"`
                              : typeof change.updatedValue === "object"
                              ? JSON.stringify(change.updatedValue).slice(0, 50) + "..."
                              : String(change.updatedValue)}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* For Deleted Items */}
                {change.changeType === "deleted" && change.previousValue !== undefined && (
                  <div>
                    <p className="text-xs font-semibold text-red-700 mb-2 uppercase tracking-wider">Removed</p>
                    <div className="bg-red-50 border border-red-300 rounded-md p-3">
                      <p className="text-xs text-red-900 break-words font-mono">
                        {typeof change.previousValue === "string"
                          ? `"${change.previousValue}"`
                          : typeof change.previousValue === "object"
                          ? JSON.stringify(change.previousValue).slice(0, 50) + "..."
                          : String(change.previousValue)}
                      </p>
                    </div>
                  </div>
                )}

                {/* Metadata Row */}
                <div className="grid grid-cols-2 gap-4">
                  {/* Field Type */}
                  <div>
                    <p className="text-xs font-semibold text-gray-600 mb-1 uppercase tracking-wider">Field Type</p>
                    <span className="text-xs font-medium bg-white border border-gray-300 rounded-md px-3 py-2 inline-block text-gray-700">
                      {change.dataType}
                    </span>
                  </div>

                  {/* Status Badge */}
                  <div>
                    <p className="text-xs font-semibold text-gray-600 mb-1 uppercase tracking-wider">Status</p>
                    <span
                      className={`inline-block text-xs font-semibold rounded-full px-3 py-1.5 ${
                        change.status === "pending"
                          ? "bg-amber-100 text-amber-800"
                          : change.status === "approved"
                          ? "bg-green-100 text-green-800"
                          : change.status === "rejected"
                          ? "bg-red-100 text-red-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {change.status.charAt(0).toUpperCase() + change.status.slice(1)}
                    </span>
                  </div>
                </div>

                {/* Request Change Section */}
                {!isRequestingFeedback && (
                  <button
                    onClick={() => setFeedbackField(change.path)}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-semibold border-2 border-gray-300 text-gray-700 rounded-md hover:border-amber-400 hover:text-amber-700 hover:bg-amber-50 active:bg-amber-100 transition-colors focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2"
                    aria-label={`Request changes for ${change.label}`}
                  >
                    <AlertCircle size={14} />
                    Request Change on This Field
                  </button>
                )}

                {isRequestingFeedback && (
                  <div className="space-y-3 bg-amber-50 border-2 border-amber-300 rounded-md p-4">
                    <label className="block text-xs font-semibold text-amber-900 uppercase tracking-wider">
                      Provide Feedback
                    </label>
                    <textarea
                      value={feedbackText}
                      onChange={(e) => setFeedbackText(e.target.value)}
                      placeholder="Describe what needs to be changed, and why..."
                      className="w-full text-xs px-3 py-2.5 border border-amber-300 rounded-md resize-none bg-white text-gray-700 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                      rows={4}
                      maxLength={500}
                    />
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-600">{feedbackText.length} / 500</span>
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            setFeedbackField(null);
                            setFeedbackText("");
                          }}
                          className="px-4 py-2 text-xs font-semibold text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-100 active:bg-gray-200 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => handleSubmitFeedback(change.path)}
                          disabled={!feedbackText.trim()}
                          className="px-4 py-2 text-xs font-semibold bg-amber-600 text-white rounded-md hover:bg-amber-700 active:bg-amber-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2"
                          aria-label="Send feedback"
                        >
                          Send Feedback
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
