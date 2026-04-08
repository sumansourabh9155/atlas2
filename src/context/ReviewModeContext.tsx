/**
 * ReviewModeContext
 *
 * Provides field-level review state to form components so they can highlight:
 *  - Rejected fields  → red border + error hint  (custom-revise mode)
 *  - Pending fields   → amber border              (admin-review mode)
 *  - Approved fields  → green border              (admin-review mode, after approve)
 *
 * Usage in section components:
 *   const { getFieldHighlightClass, getFieldStatus, getFieldFeedback } = useReviewMode();
 *   <input className={`${INPUT} ${getFieldHighlightClass("general.name")}`} ... />
 */

import React, { createContext, useContext } from "react";
import type { FieldChange } from "../lib/approval/diffGenerator";

export type ReviewMode = "admin-review" | "custom-revise" | null;

/* ─── Context shape ─────────────────────────────────────────────────────────── */

interface ReviewModeContextType {
  mode: ReviewMode;
  fieldChanges: FieldChange[];
  clinicName: string;
  versionId: string;
  /** Extra Tailwind classes to append to an input — overrides the default border/bg */
  getFieldHighlightClass: (path: string) => string;
  /** The approval status for a given path, or null if no change touches it */
  getFieldStatus: (path: string) => "pending" | "rejected" | "approved" | null;
  /** Admin feedback message for a rejected field, if any */
  getFieldFeedback: (path: string) => string | undefined;
  /** True if any change touches this path (exact match OR ancestor) */
  hasChanges: (path: string) => boolean;
}

/* ─── Defaults (no-op) ───────────────────────────────────────────────────────── */

const DEFAULT_CTX: ReviewModeContextType = {
  mode:                   null,
  fieldChanges:           [],
  clinicName:             "",
  versionId:              "",
  getFieldHighlightClass: () => "",
  getFieldStatus:         () => null,
  getFieldFeedback:       () => undefined,
  hasChanges:             () => false,
};

const ReviewModeContext = createContext<ReviewModeContextType>(DEFAULT_CTX);

/* ─── Provider ───────────────────────────────────────────────────────────────── */

interface ReviewModeProviderProps {
  children:     React.ReactNode;
  mode:         ReviewMode;
  fieldChanges: FieldChange[];
  clinicName:   string;
  versionId:    string;
}

export function ReviewModeProvider({
  children,
  mode,
  fieldChanges,
  clinicName,
  versionId,
}: ReviewModeProviderProps) {

  /** Find the change entry that best matches a given dot-path */
  const findChange = (path: string): FieldChange | undefined =>
    fieldChanges.find(
      (fc) =>
        fc.path === path ||
        fc.path.startsWith(path + ".") ||
        path.startsWith(fc.path + "."),
    );

  const getFieldStatus = (path: string): "pending" | "rejected" | "approved" | null => {
    const change = findChange(path);
    if (!change) return null;
    // Map needs_revision → rejected for UI purposes
    if (change.status === "needs_revision") return "rejected";
    return (change.status as "pending" | "rejected" | "approved") ?? "pending";
  };

  const getFieldFeedback = (path: string): string | undefined => {
    const change = fieldChanges.find((fc) => fc.path === path);
    return change?.adminFeedback;
  };

  const hasChanges = (path: string): boolean => Boolean(findChange(path));

  /**
   * Returns Tailwind `!important` override classes so they win against the
   * shared INPUT const already applied to the element.
   */
  const getFieldHighlightClass = (path: string): string => {
    const status = getFieldStatus(path);
    if (!status) return "";

    if (status === "rejected") {
      return [
        "!border-red-400",
        "!bg-red-50",
        "focus:!ring-red-400",
        "focus:!border-red-400",
      ].join(" ");
    }

    if (mode === "admin-review") {
      if (status === "pending") {
        return [
          "!border-amber-300",
          "!bg-amber-50/60",
          "focus:!ring-amber-400",
          "focus:!border-amber-400",
        ].join(" ");
      }
      if (status === "approved") {
        return [
          "!border-emerald-400",
          "!bg-emerald-50/60",
          "focus:!ring-emerald-400",
          "focus:!border-emerald-400",
        ].join(" ");
      }
    }

    return "";
  };

  const value: ReviewModeContextType = {
    mode,
    fieldChanges,
    clinicName,
    versionId,
    getFieldHighlightClass,
    getFieldStatus,
    getFieldFeedback,
    hasChanges,
  };

  return (
    <ReviewModeContext.Provider value={value}>
      {children}
    </ReviewModeContext.Provider>
  );
}

/* ─── Hook ───────────────────────────────────────────────────────────────────── */

export function useReviewMode(): ReviewModeContextType {
  return useContext(ReviewModeContext);
}
