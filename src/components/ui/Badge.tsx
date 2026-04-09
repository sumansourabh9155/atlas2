/**
 * Badge — Semantic status pill for the Atlas design system.
 *
 * Variants map to color roles:
 *  - primary   → teal (published, active)
 *  - success   → emerald (approved, positive)
 *  - warning   → amber (pending, scheduled)
 *  - danger    → red (rejected, draft, error)
 *  - info      → blue (live domain, informational)
 *  - neutral   → gray (inactive, default)
 *  - violet    → violet (admin)
 *
 * Optional leading dot for status indicators.
 */

import React from "react";
import type { LucideIcon } from "lucide-react";

/* ── Variant class maps ─────────────────────────────────────────── */

const VARIANT = {
  primary:  "bg-teal-50 text-teal-700",
  success:  "bg-emerald-50 text-emerald-700",
  warning:  "bg-amber-50 text-amber-700",
  danger:   "bg-red-50 text-red-700",
  info:     "bg-blue-50 text-blue-700",
  neutral:  "bg-gray-100 text-gray-600",
  violet:   "bg-violet-50 text-violet-700",
} as const;

const VARIANT_BORDERED = {
  primary:  "bg-teal-50 text-teal-700 border border-teal-200",
  success:  "bg-emerald-50 text-emerald-700 border border-emerald-200",
  warning:  "bg-amber-50 text-amber-700 border border-amber-200",
  danger:   "bg-red-50 text-red-700 border border-red-200",
  info:     "bg-blue-50 text-blue-700 border border-blue-200",
  neutral:  "bg-gray-100 text-gray-600 border border-gray-200",
  violet:   "bg-violet-50 text-violet-700 border border-violet-200",
} as const;

const DOT_COLOR = {
  primary:  "bg-teal-400",
  success:  "bg-emerald-400",
  warning:  "bg-orange-400",
  danger:   "bg-red-400",
  info:     "bg-blue-400",
  neutral:  "bg-gray-400",
  violet:   "bg-violet-400",
} as const;

const SIZE = {
  sm: "px-1.5 py-0.5 text-[10px]",
  md: "px-2.5 py-1 text-xs",
} as const;

/* ── Props ──────────────────────────────────────────────────────── */

export type BadgeVariant = keyof typeof VARIANT;

export interface BadgeProps {
  variant?:   BadgeVariant;
  size?:      keyof typeof SIZE;
  /** Show a leading colored dot */
  dot?:       boolean;
  /** Show a leading icon */
  icon?:      LucideIcon;
  /** Add a visible border */
  bordered?:  boolean;
  className?: string;
  children:   React.ReactNode;
}

/* ── Component ──────────────────────────────────────────────────── */

export function Badge({
  variant = "neutral",
  size = "md",
  dot = false,
  icon: Icon,
  bordered = false,
  className = "",
  children,
}: BadgeProps) {
  const colorCls = bordered ? VARIANT_BORDERED[variant] : VARIANT[variant];

  return (
    <span
      className={[
        "inline-flex items-center gap-1.5 font-medium rounded-full whitespace-nowrap",
        colorCls,
        SIZE[size],
        className,
      ].join(" ")}
    >
      {dot && (
        <span
          className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${DOT_COLOR[variant]}`}
          aria-hidden="true"
        />
      )}
      {Icon && <Icon size={size === "sm" ? 10 : 12} className="flex-shrink-0" aria-hidden="true" />}
      {children}
    </span>
  );
}
