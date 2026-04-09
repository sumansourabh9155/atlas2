/**
 * FilterPill — Toggle button used in filter bars.
 *
 * Active state: solid teal. Inactive: bordered gray.
 * Used in activity feeds, role filters, tab-like controls.
 */

import React from "react";

/* ── Props ──────────────────────────────────────────────────────── */

export interface FilterPillProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  active?:    boolean;
  /** Visual style */
  variant?:   "solid" | "bordered";
}

/* ── Component ──────────────────────────────────────────────────── */

export function FilterPill({
  active = false,
  variant = "solid",
  className = "",
  children,
  ...rest
}: FilterPillProps) {
  const base = "px-2.5 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-colors outline-none focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:ring-offset-1";

  const solidCls = active
    ? "bg-teal-600 text-white"
    : "bg-gray-100 text-gray-500 hover:bg-gray-200";

  const borderedCls = active
    ? "bg-teal-600 text-white border border-teal-600"
    : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 hover:border-gray-300";

  return (
    <button
      className={`${base} ${variant === "solid" ? solidCls : borderedCls} ${className}`}
      {...rest}
    >
      {children}
    </button>
  );
}
