import { createContext, useContext } from "react";

// ─── Types ─────────────────────────────────────────────────────────────────────

export interface ClinicAIContext {
  /** e.g. "Austin Paws Specialty & Emergency" */
  name: string;
  /** e.g. "specialty and emergency veterinary hospital" */
  type: string;
  /** e.g. "Austin, TX" */
  location: string;
}

export interface AIEditorContextValue {
  clinicContext: ClinicAIContext;
  /** Which accordion section is currently open — null = whole page */
  activeSectionId: string | null;
  /** Human-readable label for the active section */
  activeSectionLabel: string;
  /**
   * Set by the preview click-to-target system.
   * When non-null, the AITextField/AITextarea whose fieldKey matches
   * will auto-focus and scroll into view, then clear this key.
   */
  pendingFocusKey: string | null;
  /** Request focus on a specific field by its fieldKey; pass null to clear. */
  requestFieldFocus: (key: string | null) => void;
}

// ─── Section label map ─────────────────────────────────────────────────────────

export const SECTION_LABELS: Record<string, string> = {
  hero:         "Hero",
  quicklinks:   "Quick Links",
  services:     "Services",
  locations:    "Locations",
  awards:       "Awards",
  teams:        "Our Team",
  testimonials: "Testimonials",
  jointeam:     "Join Our Team",
  faq:          "FAQ",
  newsletter:   "Newsletter",
  footer:       "Footer",
};

// ─── Context ───────────────────────────────────────────────────────────────────

const DEFAULT: AIEditorContextValue = {
  clinicContext: {
    name:     "Your Clinic",
    type:     "veterinary hospital",
    location: "your city",
  },
  activeSectionId:    null,
  activeSectionLabel: "Whole Page",
  pendingFocusKey:    null,
  requestFieldFocus:  () => {},
};

export const AIEditorContext = createContext<AIEditorContextValue>(DEFAULT);

/** Consume the AI editor context inside any editor or toolbar component. */
export function useAIEditorContext(): AIEditorContextValue {
  return useContext(AIEditorContext);
}
