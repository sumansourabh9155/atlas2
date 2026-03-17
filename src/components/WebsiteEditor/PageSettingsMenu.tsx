// ─── PageSettingsMenu — per-page context menu ────────────────────────────────
// Floating popover triggered by the ··· button on each page row in LeftPanel.
// Uses fixed positioning so it escapes the overflow:hidden LeftPanel container.

import { useState, useRef, useEffect } from "react";
import {
  Navigation2, GitBranch, EyeOff, Copy, Trash2,
  ChevronDown, Check, CornerDownRight,
} from "lucide-react";

// ─── Types (exported — used by LeftPanel) ─────────────────────────────────────

export type NavMode = "top" | "sub" | "hidden";

export interface ManagedPage {
  id: string;
  label: string;
  slug: string;
  icon: React.ElementType;
  navMode: NavMode;
  parentId?: string;  // only when navMode === "sub"
}

// ─── NavMode options ──────────────────────────────────────────────────────────

const NAV_MODES: {
  mode: NavMode;
  label: string;
  icon: React.ElementType;
  desc: string;
}[] = [
  {
    mode: "top",
    label: "Top Navigation",
    icon: Navigation2,
    desc: "Appears as a main nav item",
  },
  {
    mode: "sub",
    label: "Sub Navigation",
    icon: GitBranch,
    desc: "Nested under another page",
  },
  {
    mode: "hidden",
    label: "Hidden from Nav",
    icon: EyeOff,
    desc: "Not shown in navigation",
  },
];

// ─── Component ────────────────────────────────────────────────────────────────

interface PageSettingsMenuProps {
  page: ManagedPage;
  /** Top-level pages available as parent options when Sub Nav is selected. */
  topPages: ManagedPage[];
  /** Anchor rect of the trigger button — used for fixed positioning. */
  anchorRect: DOMRect;
  onUpdate: (updates: Partial<ManagedPage>) => void;
  onDuplicate: () => void;
  onDelete: () => void;
  onClose: () => void;
}

export function PageSettingsMenu({
  page, topPages, anchorRect,
  onUpdate, onDuplicate, onDelete, onClose,
}: PageSettingsMenuProps) {
  const [confirmDelete, setConfirmDelete]   = useState(false);
  const [parentPickerOpen, setParentPickerOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    function handle(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) onClose();
    }
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, [onClose]);

  // Close on Escape
  useEffect(() => {
    function handle(e: KeyboardEvent) { if (e.key === "Escape") onClose(); }
    document.addEventListener("keydown", handle);
    return () => document.removeEventListener("keydown", handle);
  }, [onClose]);

  // Position: prefer below trigger, fall back to above; always clamped to viewport
  const MENU_W = 264;
  const MENU_H = 320; // approximate
  const gap = 6;
  const spaceBelow = window.innerHeight - anchorRect.bottom;
  const spaceAbove = anchorRect.top;
  const rawTop = spaceBelow >= MENU_H + gap
    ? anchorRect.bottom + gap
    : spaceAbove >= MENU_H + gap
      ? anchorRect.top - MENU_H - gap
      : anchorRect.bottom + gap; // fallback: below even if clipped
  const top  = Math.max(8, Math.min(rawTop, window.innerHeight - MENU_H - 8));
  const left = Math.max(8, Math.min(anchorRect.right - MENU_W, window.innerWidth - MENU_W - 8));

  const parentLabel = topPages.find(p => p.id === page.parentId)?.label;

  return (
    <div
      ref={menuRef}
      style={{ position: "fixed", top, left, width: MENU_W, zIndex: 9999 }}
      className="bg-white border border-slate-200 rounded-xl shadow-2xl overflow-visible"
    >
      {/* ── Navigation mode ─────────────────────────────────────────────── */}
      <div className="p-2.5">
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-1 mb-1.5">
          Navigation
        </p>

        {NAV_MODES.map(({ mode, label, icon: Icon, desc }) => {
          const active = page.navMode === mode;
          return (
            <button
              key={mode}
              type="button"
              onClick={() =>
                onUpdate({ navMode: mode, parentId: mode !== "sub" ? undefined : page.parentId })
              }
              className={[
                "w-full flex items-center gap-2.5 px-2 py-1.5 rounded-lg text-left transition-all",
                active ? "bg-[#003459]/8 text-[#003459]" : "text-slate-600 hover:bg-slate-50",
              ].join(" ")}
            >
              <div
                className={[
                  "w-6 h-6 rounded-md flex items-center justify-center shrink-0 transition-colors",
                  active ? "bg-[#003459] text-white" : "bg-slate-100 text-slate-500",
                ].join(" ")}
              >
                <Icon className="w-3.5 h-3.5" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-xs font-semibold leading-none mb-0.5">{label}</div>
                <div className="text-[10px] text-slate-400 leading-none">{desc}</div>
              </div>
              {active && <Check className="w-3.5 h-3.5 text-[#003459] shrink-0" />}
            </button>
          );
        })}

        {/* Parent picker — visible when Sub Nav is active */}
        {page.navMode === "sub" && (
          <div className="mt-1.5 ml-8">
            <div className="flex items-center gap-1 mb-1">
              <CornerDownRight className="w-3 h-3 text-slate-400 shrink-0" />
              <span className="text-[10px] text-slate-400">Place under</span>
            </div>
            <div className="relative">
              <button
                type="button"
                onClick={() => setParentPickerOpen(p => !p)}
                className="w-full flex items-center justify-between gap-1.5 px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-md hover:border-[#003459]/30 transition-colors"
              >
                <span className="truncate text-slate-700">
                  {parentLabel ?? "Choose a parent page…"}
                </span>
                <ChevronDown
                  className={`w-3.5 h-3.5 text-slate-400 shrink-0 transition-transform ${parentPickerOpen ? "rotate-180" : ""}`}
                />
              </button>

              {parentPickerOpen && (
                <div className="absolute top-full mt-1 left-0 right-0 bg-white border border-slate-200 rounded-lg shadow-lg z-50 max-h-36 overflow-y-auto">
                  {topPages
                    .filter(p => p.id !== page.id)
                    .map(p => {
                      const PIcon = p.icon;
                      return (
                        <button
                          key={p.id}
                          type="button"
                          onClick={() => {
                            onUpdate({ parentId: p.id });
                            setParentPickerOpen(false);
                          }}
                          className="w-full flex items-center gap-2 px-2.5 py-1.5 text-xs text-slate-700 hover:bg-slate-50 transition-colors"
                        >
                          <PIcon className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span className="flex-1 truncate">{p.label}</span>
                          {page.parentId === p.id && (
                            <Check className="w-3 h-3 text-[#003459] shrink-0" />
                          )}
                        </button>
                      );
                    })}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Divider */}
      <div className="h-px bg-slate-100" />

      {/* ── Page actions ────────────────────────────────────────────────── */}
      <div className="p-1.5">
        <button
          type="button"
          onClick={() => { onDuplicate(); onClose(); }}
          className="w-full flex items-center gap-2 px-2.5 py-1.5 text-xs text-slate-600 hover:bg-slate-50 rounded-lg transition-colors"
        >
          <Copy className="w-3.5 h-3.5" />
          Duplicate page
        </button>

        {!confirmDelete ? (
          <button
            type="button"
            onClick={() => setConfirmDelete(true)}
            className="w-full flex items-center gap-2 px-2.5 py-1.5 text-xs text-red-500 hover:bg-red-50 rounded-lg transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Delete page
          </button>
        ) : (
          <div className="flex items-center gap-1.5 px-2.5 py-1.5">
            <span className="flex-1 text-xs text-red-500 leading-tight">
              Delete &ldquo;{page.label}&rdquo;?
            </span>
            <button
              type="button"
              onClick={() => { onDelete(); onClose(); }}
              className="text-[10px] font-semibold text-white bg-red-500 hover:bg-red-600 rounded px-2 py-0.5 shrink-0 transition-colors"
            >
              Delete
            </button>
            <button
              type="button"
              onClick={() => setConfirmDelete(false)}
              className="text-[10px] font-semibold text-slate-500 bg-slate-100 hover:bg-slate-200 rounded px-2 py-0.5 shrink-0 transition-colors"
            >
              Cancel
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
