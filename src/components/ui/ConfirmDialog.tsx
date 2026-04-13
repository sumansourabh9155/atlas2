/**
 * ConfirmDialog — Accessible replacement for window.confirm().
 *
 * Usage:
 *   const [confirm, setConfirm] = useState<ConfirmState | null>(null);
 *
 *   // To trigger:
 *   setConfirm({
 *     title: "Delete banner?",
 *     message: "This action cannot be undone.",
 *     variant: "danger",
 *     onConfirm: () => handleDelete(id),
 *   });
 *
 *   // In JSX:
 *   <ConfirmDialog state={confirm} onClose={() => setConfirm(null)} />
 */

import React, { useEffect, useRef } from "react";
import { AlertTriangle, Trash2, X } from "lucide-react";
import { Button } from "./Button";

/* ── Types ──────────────────────────────────────────────────────── */

export interface ConfirmState {
  title:      string;
  message?:   string;
  confirmLabel?: string;
  variant?:   "danger" | "primary";
  onConfirm:  () => void;
}

interface Props {
  state:    ConfirmState | null;
  onClose:  () => void;
}

/* ── Component ──────────────────────────────────────────────────── */

export function ConfirmDialog({ state, onClose }: Props) {
  const confirmRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (state) {
      // Focus confirm button when dialog opens
      setTimeout(() => confirmRef.current?.focus(), 50);
    }
  }, [state]);

  useEffect(() => {
    if (!state) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [state, onClose]);

  if (!state) return null;

  const isDanger = state.variant !== "primary";

  return (
    <div
      className="fixed inset-0 z-[9998] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-title"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Panel */}
      <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-sm border border-gray-200 overflow-hidden">
        {/* Header */}
        <div className="flex items-start gap-3 px-5 pt-5 pb-4">
          {isDanger && (
            <div className="w-9 h-9 rounded-full bg-red-50 flex items-center justify-center flex-shrink-0">
              <AlertTriangle size={16} className="text-red-500" aria-hidden="true" />
            </div>
          )}
          <div className="flex-1 min-w-0 pt-0.5">
            <h2 id="confirm-title" className="text-sm font-semibold text-gray-900">
              {state.title}
            </h2>
            {state.message && (
              <p className="text-xs text-gray-500 mt-1 leading-relaxed">{state.message}</p>
            )}
          </div>
          <button
            onClick={onClose}
            className="flex-shrink-0 p-1 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
            aria-label="Cancel"
          >
            <X size={16} />
          </button>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 px-5 py-4 bg-gray-50 border-t border-gray-100">
          <Button variant="secondary" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button
            ref={confirmRef}
            variant={isDanger ? "danger" : "primary"}
            size="sm"
            icon={isDanger ? Trash2 : undefined}
            onClick={() => { state.onConfirm(); onClose(); }}
          >
            {state.confirmLabel ?? (isDanger ? "Delete" : "Confirm")}
          </Button>
        </div>
      </div>
    </div>
  );
}
