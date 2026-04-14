/**
 * Card — Container primitive for the Atlas design system.
 *
 * Variants:
 *  - default  → white card with gray-200 border
 *  - hover    → adds hover:border-gray-300 + shadow lift
 *  - section  → padded content section (p-6, gap-5)
 *  - flush    → no padding, useful for tables inside cards
 */

import React from "react";

/* ── Variant class maps ─────────────────────────────────────────── */

const VARIANT = {
  default: "bg-white border border-gray-200 rounded-xl p-6",
  hover:   "bg-white border border-gray-200 rounded-xl p-6 hover:border-gray-300 hover:shadow-sm transition-all",
  section: "bg-white border border-gray-200 rounded-xl p-8 flex flex-col gap-6",
  flush:   "bg-white border border-gray-200 rounded-xl overflow-hidden",
} as const;

/* ── Props ──────────────────────────────────────────────────────── */

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?:  keyof typeof VARIANT;
  as?:       "div" | "section" | "article" | "button";
}

/* ── Component ──────────────────────────────────────────────────── */

export function Card({
  variant = "default",
  as: Tag = "div",
  className = "",
  children,
  ...rest
}: CardProps) {
  return (
    <Tag
      className={`${VARIANT[variant]} ${className}`}
      {...(rest as React.HTMLAttributes<HTMLElement>)}
    >
      {children}
    </Tag>
  );
}

/* ── CardHeader — consistent card title row ─────────────────────── */

export interface CardHeaderProps {
  title:       string;
  subtitle?:   string;
  action?:     React.ReactNode;
  className?:  string;
}

export function CardHeader({
  title,
  subtitle,
  action,
  className = "",
}: CardHeaderProps) {
  return (
    <div className={`px-6 py-5 border-b border-gray-100 flex items-center justify-between gap-3 ${className}`}>
      <div className="min-w-0">
        <h2 className="text-sm font-semibold text-gray-900 truncate">{title}</h2>
        {subtitle && (
          <p className="text-xs text-gray-400 mt-0.5 truncate">{subtitle}</p>
        )}
      </div>
      {action && <div className="flex-shrink-0">{action}</div>}
    </div>
  );
}
