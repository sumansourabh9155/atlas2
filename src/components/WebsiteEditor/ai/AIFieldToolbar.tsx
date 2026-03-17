import { Sparkles, RefreshCw, Minus, Plus, Check, RotateCcw, Loader2 } from "lucide-react";
import type { AIActionType } from "./mockAI";

// ─── Action definitions ────────────────────────────────────────────────────────

interface ActionDef {
  id:            AIActionType;
  label:         string;
  Icon:          React.ElementType;
  multilineOnly: boolean;
}

const ACTIONS: ActionDef[] = [
  { id: "enhance",      label: "Enhance",   Icon: Sparkles,   multilineOnly: false },
  { id: "rephrase",     label: "Rephrase",  Icon: RefreshCw,  multilineOnly: false },
  { id: "shorten",      label: "Shorten",   Icon: Minus,      multilineOnly: true  },
  { id: "expand",       label: "Expand",    Icon: Plus,       multilineOnly: true  },
  { id: "fix_spelling", label: "Fix",       Icon: Check,      multilineOnly: false },
];

// ─── Props ─────────────────────────────────────────────────────────────────────

interface Props {
  isVisible:     boolean;
  isLoading:     boolean;
  loadingAction: AIActionType | null;
  canUndo:       boolean;
  /** Show Shorten + Expand actions (for textarea) */
  multiline?:    boolean;
  onAction:      (action: AIActionType) => void;
  onUndo:        () => void;
}

// ─── Component ─────────────────────────────────────────────────────────────────

export function AIFieldToolbar({
  isVisible,
  isLoading,
  loadingAction,
  canUndo,
  multiline = false,
  onAction,
  onUndo,
}: Props) {
  const visibleActions = ACTIONS.filter((a) => multiline || !a.multilineOnly);

  return (
    // Smooth height animation via grid trick — no layout shift on parent
    <div
      style={{
        display: "grid",
        gridTemplateRows: isVisible ? "1fr" : "0fr",
        transition: "grid-template-rows 0.18s cubic-bezier(0.4,0,0.2,1)",
        marginTop: isVisible ? "3px" : 0,
      }}
      // Prevent mouse-down on toolbar from stealing focus from the field
      onMouseDown={(e) => e.preventDefault()}
    >
      <div style={{ overflow: "hidden" }}>
        <div
          role="toolbar"
          aria-label="AI writing actions"
          className="flex items-center gap-0.5 px-1.5 h-7 rounded-lg border bg-white overflow-x-auto"
          style={{
            borderColor: "#e0e7ff",
            boxShadow: "0 1px 3px rgba(79,70,229,0.08), 0 1px 8px rgba(0,0,0,0.04)",
            scrollbarWidth: "none",
          }}
        >
          {isLoading ? (
            /* ── Loading state ─────────────────────────────────────── */
            <div className="flex items-center gap-1.5 px-1">
              <Loader2
                className="w-3 h-3 text-indigo-500 animate-spin shrink-0"
                aria-hidden="true"
              />
              <span className="text-[10px] text-indigo-500 font-medium whitespace-nowrap">
                {ACTIONS.find((a) => a.id === loadingAction)?.label ?? "Working"}…
              </span>
            </div>
          ) : (
            /* ── Action buttons ────────────────────────────────────── */
            <>
              {visibleActions.map(({ id, label, Icon }) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => onAction(id)}
                  aria-label={label}
                  className={[
                    "flex items-center gap-1 px-1.5 py-1 rounded-md whitespace-nowrap shrink-0",
                    "text-[10px] font-medium text-gray-500 transition-colors",
                    "hover:text-indigo-600 hover:bg-indigo-50",
                    "focus:outline-none focus-visible:ring-1 focus-visible:ring-indigo-300",
                  ].join(" ")}
                >
                  <Icon className="w-2.5 h-2.5 shrink-0" aria-hidden="true" />
                  {label}
                </button>
              ))}

              {/* Undo — only when a previous AI value exists */}
              {canUndo && (
                <>
                  <div
                    className="w-px h-3.5 bg-gray-200 mx-0.5 shrink-0"
                    aria-hidden="true"
                  />
                  <button
                    type="button"
                    onClick={onUndo}
                    aria-label="Undo AI change"
                    className={[
                      "flex items-center gap-1 px-1.5 py-1 rounded-md whitespace-nowrap shrink-0",
                      "text-[10px] font-medium text-amber-500 transition-colors",
                      "hover:text-amber-600 hover:bg-amber-50",
                      "focus:outline-none focus-visible:ring-1 focus-visible:ring-amber-300",
                    ].join(" ")}
                  >
                    <RotateCcw className="w-2.5 h-2.5 shrink-0" aria-hidden="true" />
                    Undo
                  </button>
                </>
              )}
            </>
          )}

          {/* AI badge — right side */}
          <div className="ml-auto pl-2 shrink-0" aria-hidden="true">
            <span
              className="text-[8px] font-extrabold tracking-widest"
              style={{ color: "#a5b4fc" }}
            >
              AI
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
