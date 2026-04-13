/**
 * Toast — Lightweight notification system.
 *
 * Usage:
 *   const { toasts, toast } = useToast();
 *   toast.success("Invitation sent!");
 *   toast.error("Something went wrong");
 *   toast.info("Processing...");
 *
 *   // In layout:
 *   <ToastContainer toasts={toasts} />
 */

import React, { useState, useCallback, useEffect } from "react";
import { CheckCircle2, AlertCircle, Info, X } from "lucide-react";

/* ── Types ──────────────────────────────────────────────────────── */

export type ToastVariant = "success" | "error" | "info" | "warning";

export interface ToastItem {
  id:       string;
  message:  string;
  variant:  ToastVariant;
}

/* ── Style map ──────────────────────────────────────────────────── */

const STYLES: Record<ToastVariant, { bar: string; icon: string; bg: string; text: string; Icon: React.ElementType }> = {
  success: { bar: "bg-emerald-500", icon: "text-emerald-500", bg: "bg-white", text: "text-gray-900", Icon: CheckCircle2 },
  error:   { bar: "bg-red-500",     icon: "text-red-500",     bg: "bg-white", text: "text-gray-900", Icon: AlertCircle  },
  warning: { bar: "bg-amber-500",   icon: "text-amber-500",   bg: "bg-white", text: "text-gray-900", Icon: AlertCircle  },
  info:    { bar: "bg-blue-500",    icon: "text-blue-500",    bg: "bg-white", text: "text-gray-900", Icon: Info         },
};

/* ── Individual toast ───────────────────────────────────────────── */

function Toast({ item, onDismiss }: { item: ToastItem; onDismiss: (id: string) => void }) {
  const s = STYLES[item.variant];
  const Icon = s.Icon;

  useEffect(() => {
    const timer = setTimeout(() => onDismiss(item.id), 4000);
    return () => clearTimeout(timer);
  }, [item.id, onDismiss]);

  return (
    <div
      role="alert"
      aria-live="polite"
      className="flex items-start gap-3 min-w-[280px] max-w-sm bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden animate-in slide-in-from-right-full duration-300"
    >
      {/* Colored left bar */}
      <div className={`w-1 self-stretch flex-shrink-0 ${s.bar}`} />

      <div className="flex items-start gap-2.5 py-3 pr-3 flex-1 min-w-0">
        <Icon size={16} className={`flex-shrink-0 mt-0.5 ${s.icon}`} aria-hidden="true" />
        <p className="text-sm text-gray-800 font-medium leading-snug flex-1">{item.message}</p>
        <button
          onClick={() => onDismiss(item.id)}
          className="flex-shrink-0 p-0.5 rounded text-gray-400 hover:text-gray-600 transition-colors"
          aria-label="Dismiss notification"
        >
          <X size={14} />
        </button>
      </div>
    </div>
  );
}

/* ── Container ──────────────────────────────────────────────────── */

export function ToastContainer({
  toasts,
  onDismiss,
}: {
  toasts: ToastItem[];
  onDismiss: (id: string) => void;
}) {
  if (toasts.length === 0) return null;
  return (
    <div
      className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-2"
      aria-label="Notifications"
    >
      {toasts.map((t) => (
        <Toast key={t.id} item={t} onDismiss={onDismiss} />
      ))}
    </div>
  );
}

/* ── Hook ───────────────────────────────────────────────────────── */

export function useToast() {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const push = useCallback((message: string, variant: ToastVariant) => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    setToasts((prev) => [...prev.slice(-3), { id, message, variant }]); // cap at 4
  }, []);

  const toast = {
    success: (msg: string) => push(msg, "success"),
    error:   (msg: string) => push(msg, "error"),
    warning: (msg: string) => push(msg, "warning"),
    info:    (msg: string) => push(msg, "info"),
  };

  return { toasts, toast, dismiss };
}
