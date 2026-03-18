// ─── Smart Modes — Types & Runtime Logic ──────────────────────────────────────
// Clinics can configure up to 3 modes (Business Hours / After Hours / Emergency)
// with time-range rules. computeActiveMode() is a pure function that determines
// which mode is active right now given the current Date.

export type SmartModeId = "business_hours" | "after_hours" | "emergency";

export interface SmartModeTrigger {
  /** "manual" = only via explicit override; "time_range" = automatic via clock */
  type: "manual" | "time_range";
  /** Day-of-week numbers: 0 = Sunday … 6 = Saturday */
  days?: number[];
  /** Minutes since midnight, 0–1439 */
  startMinute?: number;
  endMinute?: number;
}

export interface SmartMode {
  id: SmartModeId;
  label: string;
  /** Used to colour the indicator pill in the live preview */
  color: "green" | "amber" | "red";
  triggers: SmartModeTrigger[];
  /** Section types to automatically elevate to the top of the page in this mode */
  prioritySectionTypes?: string[];
  /** Optional hero copy overrides applied when this mode is active */
  heroHeadlineOverride?: string;
  heroSubheadlineOverride?: string;
}

export interface SmartModesState {
  enabled: boolean;
  /** When non-null, this mode is forced regardless of time rules */
  manualOverride: SmartModeId | null;
  modes: SmartMode[];
}

export interface ActiveModeResult {
  mode: SmartMode;
  triggeredBy: "manual" | "time_range" | "default";
}

// ─── Defaults ─────────────────────────────────────────────────────────────────

export const DEFAULT_SMART_MODES_STATE: SmartModesState = {
  enabled: false,
  manualOverride: null,
  modes: [
    {
      id: "business_hours",
      label: "Business Hours",
      color: "green",
      triggers: [
        {
          type: "time_range",
          days: [1, 2, 3, 4, 5],    // Mon–Fri
          startMinute: 8 * 60,       // 08:00
          endMinute:   18 * 60,      // 18:00
        },
      ],
      heroHeadlineOverride: undefined,
      heroSubheadlineOverride: undefined,
      prioritySectionTypes: [],
    },
    {
      id: "after_hours",
      label: "After Hours",
      color: "amber",
      triggers: [
        {
          type: "time_range",
          days: [0, 1, 2, 3, 4, 5, 6],
          startMinute: 18 * 60,      // 18:00
          endMinute:   8 * 60,       // 08:00 next day (midnight-wrap)
        },
      ],
      heroHeadlineOverride: "After-Hours Care — We're Still Here For You",
      heroSubheadlineOverride: "Our emergency line is active. Call us anytime — no appointment needed for urgent cases.",
      prioritySectionTypes: ["contactsplit", "contactinfo"],
    },
    {
      id: "emergency",
      label: "Emergency Mode",
      color: "red",
      triggers: [
        { type: "manual" },
      ],
      heroHeadlineOverride: "🚨 Emergency Care — Open 24/7",
      heroSubheadlineOverride: "Board-certified emergency specialists on-site right now. Walk-ins welcome. Call our emergency line immediately.",
      prioritySectionTypes: ["contactsplit", "contactinfo", "ctaband"],
    },
  ],
};

// ─── computeActiveMode ────────────────────────────────────────────────────────
// Priority: manual override → time_range rules → "business_hours" default
// Handles midnight-wrap: a range where startMinute > endMinute wraps past midnight.

export function computeActiveMode(state: SmartModesState, now: Date): ActiveModeResult {
  const { enabled, manualOverride, modes } = state;
  const businessHoursMode = modes.find(m => m.id === "business_hours") ?? modes[0];

  if (!enabled) {
    return { mode: businessHoursMode, triggeredBy: "default" };
  }

  // 1. Manual override wins
  if (manualOverride !== null) {
    const overrideMode = modes.find(m => m.id === manualOverride);
    if (overrideMode) return { mode: overrideMode, triggeredBy: "manual" };
  }

  const dayOfWeek = now.getDay();
  const minuteOfDay = now.getHours() * 60 + now.getMinutes();

  // 2. Check time_range triggers in mode order (emergency first if listed first)
  for (const mode of modes) {
    for (const trigger of mode.triggers) {
      if (trigger.type !== "time_range") continue;
      const days        = trigger.days ?? [0, 1, 2, 3, 4, 5, 6];
      const startMinute = trigger.startMinute ?? 0;
      const endMinute   = trigger.endMinute   ?? 1439;

      if (!days.includes(dayOfWeek)) continue;

      const inRange =
        startMinute <= endMinute
          // Normal range (e.g. 08:00 – 18:00)
          ? minuteOfDay >= startMinute && minuteOfDay < endMinute
          // Midnight-wrap (e.g. 22:00 – 06:00)
          : minuteOfDay >= startMinute || minuteOfDay < endMinute;

      if (inRange) return { mode, triggeredBy: "time_range" };
    }
  }

  // 3. Default — business hours
  return { mode: businessHoursMode, triggeredBy: "default" };
}
