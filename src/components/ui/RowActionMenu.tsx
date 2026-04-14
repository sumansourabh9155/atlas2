/**
 * RowActionMenu — three-dot (⋮) dropdown for table row actions.
 *
 * Closes on outside click, Escape key, and after any action fires.
 * Renders a portal-free absolute dropdown above/below the trigger.
 *
 * Usage:
 *   <RowActionMenu items={[
 *     { label: "Edit",    icon: Edit2,  onClick: () => … },
 *     { label: "Delete",  icon: Trash2, onClick: () => …, variant: "danger" },
 *   ]} />
 */

import React, { useState, useRef, useEffect } from "react";
import { MoreVertical } from "lucide-react";

export interface RowAction {
  label:    string;
  icon:     React.ElementType;
  onClick:  () => void;
  variant?: "default" | "danger";
  disabled?: boolean;
}

interface RowActionMenuProps {
  items:      RowAction[];
  /** aria-label for the trigger button */
  label?:     string;
  /** "bottom" (default) opens below trigger; "top" opens above */
  placement?: "bottom" | "top";
}

export function RowActionMenu({ items, label = "Open actions", placement = "bottom" }: RowActionMenuProps) {
  const [open, setOpen] = useState(false);
  const containerRef    = useRef<HTMLDivElement>(null);

  /* Close on outside click */
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (!containerRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  /* Close on Escape */
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open]);

  const positionCls = placement === "top"
    ? "bottom-full mb-1"
    : "top-full mt-1";

  return (
    <div ref={containerRef} className="relative inline-block">
      <button
        type="button"
        onClick={(e) => { e.stopPropagation(); setOpen((v) => !v); }}
        aria-label={label}
        aria-haspopup="menu"
        aria-expanded={open}
        className={`p-1.5 rounded-md transition-colors ${
          open
            ? "bg-gray-200 text-gray-700"
            : "text-gray-400 hover:bg-gray-100 hover:text-gray-600"
        }`}
      >
        <MoreVertical size={14} aria-hidden="true" />
      </button>

      {open && (
        <div
          role="menu"
          className={`absolute right-0 ${positionCls} z-50 min-w-[168px] bg-white border border-gray-200 rounded-xl shadow-lg py-1.5 focus:outline-none`}
        >
          {items.map(({ label: itemLabel, icon: Icon, onClick, variant = "default", disabled = false }) => (
            <button
              key={itemLabel}
              role="menuitem"
              disabled={disabled}
              onClick={(e) => {
                e.stopPropagation();
                setOpen(false);
                onClick();
              }}
              className={`w-full flex items-center gap-2.5 px-3.5 py-2 text-sm font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed ${
                variant === "danger"
                  ? "text-red-600 hover:bg-red-50"
                  : "text-gray-700 hover:bg-gray-50"
              }`}
            >
              <Icon size={14} aria-hidden="true" />
              {itemLabel}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
