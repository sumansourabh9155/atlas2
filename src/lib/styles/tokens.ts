/**
 * Design Tokens — Single source of truth for the Atlas design system.
 *
 * Every visual primitive (color role, spacing intent, radius, shadow)
 * is expressed as a Tailwind class string. Components import these
 * tokens rather than hard-coding inline classes.
 *
 * ┌─────────────────────────────────────────────────────────────────┐
 * │  WHY class-string tokens instead of CSS variables?             │
 * │  1. Zero runtime cost — Tailwind purges unused classes.        │
 * │  2. Type-safe — TypeScript catches misspelled keys.            │
 * │  3. Co-locate intent — `colors.primary.bg` reads better than   │
 * │     a hex in a theme file.                                     │
 * └─────────────────────────────────────────────────────────────────┘
 */

/* ═══════════════════════════════════════════════════════════════════
   1. SEMANTIC COLORS
   ═══════════════════════════════════════════════════════════════════ */

/** Semantic color roles — each maps to a Tailwind palette. */
export const colors = {
  /** Primary accent — CTAs, active states, focus rings */
  primary: {
    bg:      "bg-teal-600",
    bgHover: "bg-teal-700",
    bgActive:"bg-teal-800",
    bgSoft:  "bg-teal-50",
    text:    "text-teal-600",
    textHover:"text-teal-700",
    border:  "border-teal-600",
    borderSoft:"border-teal-200",
    ring:    "ring-teal-500",
    focus:   "focus:ring-teal-500 focus:border-teal-500",
  },
  /** Success — positive outcomes, published, approved */
  success: {
    bg:      "bg-emerald-600",
    bgSoft:  "bg-emerald-50",
    text:    "text-emerald-600",
    border:  "border-emerald-200",
    dot:     "bg-emerald-400",
  },
  /** Warning — pending, scheduled, caution */
  warning: {
    bg:      "bg-amber-500",
    bgSoft:  "bg-amber-50",
    text:    "text-amber-600",
    textDark:"text-amber-700",
    border:  "border-amber-200",
    dot:     "bg-orange-400",
  },
  /** Danger — errors, rejected, destructive */
  danger: {
    bg:      "bg-red-500",
    bgSoft:  "bg-red-50",
    text:    "text-red-600",
    textDark:"text-red-700",
    border:  "border-red-300",
    dot:     "bg-red-400",
  },
  /** Info — informational, domains, secondary actions */
  info: {
    bg:      "bg-blue-500",
    bgSoft:  "bg-blue-50",
    text:    "text-blue-600",
    textDark:"text-blue-700",
    border:  "border-blue-200",
    dot:     "bg-blue-400",
  },
  /** Neutral — the gray scale used for text, borders, backgrounds */
  neutral: {
    bg:        "bg-white",
    bgSubtle:  "bg-gray-50",
    bgMuted:   "bg-gray-100",
    border:    "border-gray-200",
    borderDark:"border-gray-300",
    textPrimary:"text-gray-900",
    textSecondary:"text-gray-600",
    textMuted: "text-gray-500",
    textPlaceholder:"text-gray-400",
    textDisabled:"text-gray-400",
    divider:   "border-gray-100",
  },
} as const;

/* ═══════════════════════════════════════════════════════════════════
   2. TYPOGRAPHY
   ═══════════════════════════════════════════════════════════════════ */

export const text = {
  /** Page title — "Dashboard", "User Management" */
  pageTitle:     "text-lg font-semibold text-gray-900",
  /** Section headings inside cards */
  sectionTitle:  "text-sm font-semibold text-gray-900",
  /** Card KPI labels */
  kpiLabel:      "text-xs font-semibold text-gray-500 uppercase tracking-wide",
  /** Card KPI value */
  kpiValue:      "text-3xl font-bold text-gray-900 tabular-nums",
  /** Body copy */
  body:          "text-sm text-gray-600",
  /** Small body — descriptions, hints */
  bodySmall:     "text-xs text-gray-500",
  /** Tiny — timestamps, tertiary info */
  caption:       "text-[11px] text-gray-400",
  /** Label above form inputs */
  label:         "text-sm font-medium text-gray-700",
  /** Overline — small uppercase section headings */
  overline:      "text-[10px] font-semibold text-gray-400 uppercase tracking-wider",
} as const;

/* ═══════════════════════════════════════════════════════════════════
   3. SPACING & LAYOUT
   ═══════════════════════════════════════════════════════════════════ */

export const spacing = {
  /** Standard page padding */
  page:    "p-6",
  /** Standard page vertical stack */
  pageGap: "space-y-4",
  /** Card inner padding */
  card:    "p-5",
  cardLg:  "p-6",
  /** Section gaps */
  sectionGap: "gap-4",
  /** Row gaps inside tables */
  cellPx:  "px-5",
  cellPy:  "py-3.5",
} as const;

/* ═══════════════════════════════════════════════════════════════════
   4. RADII
   ═══════════════════════════════════════════════════════════════════ */

export const radius = {
  /** Cards, panels, containers */
  card:    "rounded-xl",
  /** Inputs, buttons, smaller controls */
  control: "rounded-lg",
  /** Badges, pills */
  badge:   "rounded-full",
  /** Small interior elements */
  sm:      "rounded-md",
} as const;

/* ═══════════════════════════════════════════════════════════════════
   5. SHADOWS
   ═══════════════════════════════════════════════════════════════════ */

export const shadow = {
  none:    "",
  sm:      "shadow-sm",
  md:      "shadow",
  lg:      "shadow-lg",
  xl:      "shadow-xl",
  overlay: "shadow-2xl",
} as const;

/* ═══════════════════════════════════════════════════════════════════
   6. TRANSITIONS
   ═══════════════════════════════════════════════════════════════════ */

export const transition = {
  fast:    "transition-colors duration-150",
  base:    "transition-all duration-200",
  slow:    "transition-all duration-300",
} as const;

/* ═══════════════════════════════════════════════════════════════════
   7. FOCUS RING (accessibility)
   ═══════════════════════════════════════════════════════════════════ */

export const focus = {
  ring: "focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-1",
  ringInset: "focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500",
  visible: "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:ring-offset-1",
} as const;

/* ═══════════════════════════════════════════════════════════════════
   8. COMPOSITE TOKENS (pre-composed for high-frequency patterns)
   ═══════════════════════════════════════════════════════════════════ */

/** Standard card surface */
export const surface = {
  card:        "bg-white border border-gray-200 rounded-xl",
  cardHover:   "bg-white border border-gray-200 rounded-xl hover:border-gray-300 hover:shadow-sm transition-all",
  panel:       "bg-white border border-gray-200 rounded-xl overflow-hidden",
  page:        "flex-1 overflow-y-auto bg-gray-50",
  section:     "bg-white border border-gray-200 rounded-xl p-6 flex flex-col gap-5",
} as const;

/** Standard form input */
export const input = {
  base: [
    "w-full h-9 px-3 text-sm text-gray-900 bg-white",
    "border border-gray-300 rounded-lg",
    "placeholder:text-gray-400",
    "focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500",
    "transition-colors",
    "disabled:bg-gray-50 disabled:text-gray-400 disabled:cursor-not-allowed",
  ].join(" "),
  /** Compact input for dense UIs (website editor panels) */
  compact: [
    "w-full h-8 px-2.5 text-sm text-gray-900 bg-white",
    "border border-gray-200 rounded-md",
    "placeholder:text-gray-400",
    "focus:outline-none focus:ring-2 focus:ring-teal-600 focus:border-teal-600",
    "transition-colors",
  ].join(" "),
  /** Textarea variant */
  textarea: [
    "w-full px-3 py-2.5 text-sm text-gray-900 bg-white",
    "border border-gray-300 rounded-lg",
    "placeholder:text-gray-400",
    "focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500",
    "transition-colors resize-none",
    "disabled:bg-gray-50 disabled:text-gray-400 disabled:cursor-not-allowed",
  ].join(" "),
  /** Select / dropdown */
  select: [
    "appearance-none w-full h-9 pl-3 pr-8 text-sm text-gray-900 bg-white",
    "border border-gray-300 rounded-lg cursor-pointer",
    "focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500",
    "transition-colors",
    "disabled:bg-gray-50 disabled:text-gray-400 disabled:cursor-not-allowed",
  ].join(" "),
  /** Search input with left icon space */
  search: [
    "w-full pl-9 pr-4 h-9 text-sm bg-white",
    "border border-gray-200 rounded-lg",
    "placeholder:text-gray-400",
    "focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500",
    "transition-colors",
  ].join(" "),
  /** Checkbox */
  checkbox: "w-4 h-4 rounded border-gray-300 text-teal-600 focus:ring-teal-600",
} as const;

/** Table class tokens */
export const table = {
  wrapper:   "border border-gray-200 rounded-xl overflow-hidden",
  root:      "w-full text-sm border-collapse",
  thead:     "bg-gray-50 border-b border-gray-200",
  th:        "px-5 py-3 text-left text-xs font-semibold text-gray-600 whitespace-nowrap",
  /** Alternating row: idx % 2 === 0 ? row : rowAlt */
  row:       "border-b border-gray-100 bg-white hover:bg-gray-50/70 transition-colors",
  rowAlt:    "border-b border-gray-100 bg-gray-50/30 hover:bg-gray-50/70 transition-colors",
  td:        "px-5 py-3.5",
  /** Default empty-state row */
  empty:     "py-16 text-center text-sm text-gray-400",
} as const;
