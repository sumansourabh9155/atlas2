/**
 * MetricBadge — Coloured status pill for Core Web Vitals and scores.
 * status: "good" = teal · "warn" = amber · "poor" = red
 */

import type { CWVStatus } from "../../../data/insightsMockData";

interface MetricBadgeProps {
  value: string | number;
  unit?: string;
  status: CWVStatus;
  size?: "sm" | "md";
}

const COLORS: Record<CWVStatus, string> = {
  good: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200",
  warn: "bg-amber-50  text-amber-700  ring-1 ring-amber-200",
  poor: "bg-red-50    text-red-700    ring-1 ring-red-200",
};

export function MetricBadge({ value, unit, status, size = "sm" }: MetricBadgeProps) {
  const pad = size === "md" ? "px-2.5 py-1 text-sm" : "px-2 py-0.5 text-xs";
  return (
    <span className={`inline-flex items-baseline gap-0.5 rounded font-semibold ${pad} ${COLORS[status]}`}>
      {value}
      {unit && <span className="font-normal opacity-80">{unit}</span>}
    </span>
  );
}
