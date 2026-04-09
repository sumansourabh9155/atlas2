/**
 * EmptyState — Placeholder for empty lists, tables, and sections.
 *
 * Consistent empty state pattern across the platform.
 */

import React from "react";
import type { LucideIcon } from "lucide-react";
import { Button, type ButtonProps } from "./Button";

/* ── Props ──────────────────────────────────────────────────────── */

export interface EmptyStateProps {
  icon?:       LucideIcon;
  title:       string;
  subtitle?:   string;
  action?:     ButtonProps & { label: string };
  className?:  string;
}

/* ── Component ──────────────────────────────────────────────────── */

export function EmptyState({
  icon: Icon,
  title,
  subtitle,
  action,
  className = "",
}: EmptyStateProps) {
  return (
    <div className={`py-16 flex flex-col items-center justify-center text-center ${className}`}>
      {Icon && (
        <Icon size={40} className="text-gray-200 mb-4" aria-hidden="true" />
      )}
      <p className="text-sm font-medium text-gray-500">{title}</p>
      {subtitle && (
        <p className="text-xs text-gray-400 mt-1 max-w-xs">{subtitle}</p>
      )}
      {action && (
        <div className="mt-4">
          <Button size="sm" {...action}>
            {action.label}
          </Button>
        </div>
      )}
    </div>
  );
}
