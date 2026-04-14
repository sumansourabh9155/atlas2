/**
 * KpiCard — Stat card used across Dashboard, SiteList, and Analytics pages.
 *
 * Shows: icon badge · label · large value · optional delta trend.
 */

import React from "react";
import type { LucideIcon } from "lucide-react";
import { ArrowUp, ArrowDown } from "lucide-react";

/* ── Color presets ──────────────────────────────────────────────── */

const COLOR = {
  teal:    { bg: "bg-teal-50",    icon: "text-teal-600",    badge: "bg-teal-100"    },
  emerald: { bg: "bg-emerald-50", icon: "text-emerald-600", badge: "bg-emerald-100" },
  amber:   { bg: "bg-amber-50",   icon: "text-amber-600",   badge: "bg-amber-100"   },
  red:     { bg: "bg-red-50",     icon: "text-red-600",     badge: "bg-red-100"     },
  blue:    { bg: "bg-blue-50",    icon: "text-blue-600",    badge: "bg-blue-100"    },
  gray:    { bg: "bg-gray-50",    icon: "text-gray-600",    badge: "bg-gray-100"    },
  violet:  { bg: "bg-violet-50",  icon: "text-violet-600",  badge: "bg-violet-100"  },
} as const;

export type KpiColor = keyof typeof COLOR;

/* ── Props ──────────────────────────────────────────────────────── */

export interface KpiCardProps {
  label:       string;
  value:       string | number;
  icon:        LucideIcon;
  color?:      KpiColor;
  /** Delta text, e.g. "+12 this month" */
  delta?:      string;
  /** true = green arrow up, false = red arrow down */
  deltaUp?:    boolean;
  /** Callback for click — makes card interactive */
  onClick?:    () => void;
  /** Optional tinted background instead of white */
  tinted?:     boolean;
  className?:  string;
}

/* ── Component ──────────────────────────────────────────────────── */

export function KpiCard({
  label,
  value,
  icon: Icon,
  color = "teal",
  delta,
  deltaUp,
  onClick,
  tinted = false,
  className = "",
}: KpiCardProps) {
  const c = COLOR[color];
  const Tag = onClick ? "button" : "div";

  return (
    <Tag
      onClick={onClick}
      className={[
        "border border-gray-200 rounded-xl p-6 text-left",
        "hover:border-gray-300 hover:shadow-sm transition-all group",
        tinted ? c.bg : "bg-white",
        onClick ? "cursor-pointer" : "",
        className,
      ].filter(Boolean).join(" ")}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
            {label}
          </p>
          <p className="text-3xl font-bold text-gray-900 mt-2 tabular-nums">
            {value}
          </p>
          {delta && (
            <div className="flex items-center gap-1 mt-2">
              {deltaUp !== undefined && (
                deltaUp
                  ? <ArrowUp   size={11} className="text-emerald-500 flex-shrink-0" aria-hidden="true" />
                  : <ArrowDown size={11} className="text-red-400 flex-shrink-0"     aria-hidden="true" />
              )}
              <span className="text-xs text-gray-400">{delta}</span>
            </div>
          )}
        </div>
        <div
          className={`${c.badge} rounded-lg p-3 flex-shrink-0 group-hover:scale-105 transition-transform`}
        >
          <Icon size={18} className={c.icon} aria-hidden="true" />
        </div>
      </div>
    </Tag>
  );
}
