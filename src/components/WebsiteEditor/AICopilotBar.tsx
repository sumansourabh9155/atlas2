import { useState, useRef, useEffect } from "react";
import {
  Sparkles, ArrowUp, Loader2, ChevronDown,
  X, Wand2, RefreshCw, ShieldCheck,
} from "lucide-react";
import { useAIEditorContext } from "./ai/AIEditorContext";
import type { TonePreset } from "./ai/mockAI";

const EXAMPLE_PROMPTS = [
  "Dental month promo — Dr. Smith",
  "Summer wellness campaign",
  "Emergency care landing page",
  "New puppy welcome package",
  "Senior pet awareness",
];

interface Props {
  isGenerating:        boolean;
  onGenerate:          (prompt: string) => void;
  onExpandChange?:     (expanded: boolean) => void;
  onOpenWizard?:       () => void;
  onCheckConsistency?: () => void;
  onTonePreset?:       (tone: TonePreset) => void;
  isToneLoading?:      boolean;
  activeTone?:         TonePreset | null;
}

// ─── Animations ───────────────────────────────────────────────────────────────

const KEYFRAMES = `
  @keyframes aiBreath {
    0%, 100% {
      box-shadow:
        0 1px 2px rgba(0,0,0,0.04),
        0 4px 16px rgba(79,70,229,0.06),
        0 0 0 1px rgba(79,70,229,0.07);
    }
    50% {
      box-shadow:
        0 1px 2px rgba(0,0,0,0.04),
        0 6px 24px rgba(79,70,229,0.13),
        0 0 0 1px rgba(79,70,229,0.14);
    }
  }
  @keyframes aiIconFloat {
    0%, 100% { transform: translateY(0px);   }
    50%       { transform: translateY(-1.5px); }
  }
  @keyframes aiShimmer {
    0%   { background-position: -200% center; }
    100% { background-position:  200% center; }
  }
`;

// ─── Sub-components ───────────────────────────────────────────────────────────

function AccentLine() {
  return (
    <div
      className="h-[1.5px] w-full shrink-0"
      style={{
        background:
          "linear-gradient(90deg, transparent 0%, #a5b4fc 15%, #6366f1 35%, #3b82f6 55%, #67e8f9 75%, transparent 100%)",
        opacity: 0.5,
      }}
      aria-hidden="true"
    />
  );
}

function AiIcon({ pulse }: { pulse?: boolean }) {
  return (
    <span
      className="w-7 h-7 rounded-xl flex items-center justify-center shrink-0"
      style={{
        background: "linear-gradient(135deg, #4f46e5 0%, #3b82f6 100%)",
        boxShadow: "0 2px 8px rgba(79,70,229,0.25)",
        animation: pulse ? "aiIconFloat 3s ease-in-out infinite" : undefined,
      }}
      aria-hidden="true"
    >
      <Sparkles className="w-3.5 h-3.5 text-white" />
    </span>
  );
}

function Chip({
  label, onClick, disabled,
}: { label: string; onClick: () => void; disabled?: boolean }) {
  return (
    <button
      type="button"
      onClick={(e) => { e.stopPropagation(); onClick(); }}
      disabled={disabled}
      className={[
        "shrink-0 text-[10px] px-2.5 py-1 rounded-full border font-medium whitespace-nowrap",
        "transition-all duration-150 focus:outline-none focus-visible:ring-1 focus-visible:ring-indigo-400",
        disabled
          ? "opacity-40 cursor-not-allowed border-gray-200 text-gray-400"
          : "border-indigo-100 text-gray-500 hover:text-indigo-600 hover:border-indigo-200 hover:bg-indigo-50/60 cursor-pointer",
      ].join(" ")}
    >
      {label}
    </button>
  );
}

// ─── Context pill — shows which section AI will target ────────────────────────

function ContextPill({
  label, onClear, disabled,
}: { label: string; onClear: () => void; disabled?: boolean }) {
  return (
    <span
      className="inline-flex items-center gap-1 pl-2 pr-1 py-0.5 rounded-full border shrink-0"
      style={{ background: "#eff6ff", borderColor: "#bfdbfe" }}
      title={`AI will target: ${label}`}
    >
      <span className="text-[10px] font-semibold text-blue-700">{label}</span>
      <button
        type="button"
        onClick={(e) => { e.stopPropagation(); onClear(); }}
        disabled={disabled}
        aria-label={`Clear ${label} context`}
        className="w-3.5 h-3.5 rounded-full flex items-center justify-center text-blue-400 hover:text-blue-700 hover:bg-blue-100 transition-colors focus:outline-none"
      >
        <X className="w-2.5 h-2.5" />
      </button>
    </span>
  );
}

// ─── Quick action buttons ─────────────────────────────────────────────────────

interface QuickAction {
  id:     string;
  label:  string;
  Icon:   React.ElementType;
  buildPrompt: (sectionLabel: string, clinicName: string) => string;
}

const QUICK_ACTIONS: QuickAction[] = [
  {
    id: "fill",
    label: "Fill Section",
    Icon: Wand2,
    buildPrompt: (sec, name) =>
      `Fill the ${sec} section with compelling, professional content for ${name}. Use persuasive language that builds trust and drives action.`,
  },
  {
    id: "improve",
    label: "Improve All",
    Icon: RefreshCw,
    buildPrompt: (sec, name) =>
      `Review and improve all content in the ${sec} section for ${name}. Make it more engaging, clear, and conversion-focused.`,
  },
];

// ─── Tone Row ─────────────────────────────────────────────────────────────────

const TONE_OPTIONS: { tone: TonePreset; label: string; emoji: string }[] = [
  { tone: "premium",   label: "Premium",   emoji: "🏛" },
  { tone: "friendly",  label: "Friendly",  emoji: "🐾" },
  { tone: "emergency", label: "Emergency", emoji: "🚨" },
];

function ToneRow({
  onTonePreset, onCheckConsistency,
  isToneLoading, activeTone, disabled,
}: {
  onTonePreset?:       (t: TonePreset) => void;
  onCheckConsistency?: () => void;
  isToneLoading?:      boolean;
  activeTone?:         TonePreset | null;
  disabled?:           boolean;
}) {
  return (
    <div className="flex items-center gap-1.5 flex-wrap">
      <span className="text-[9px] text-gray-400 font-medium uppercase tracking-wide shrink-0 select-none">
        Tone:
      </span>

      {TONE_OPTIONS.map(({ tone, label, emoji }) => {
        const isActive  = activeTone === tone;
        const isLoading = isToneLoading && isActive;
        return (
          <button
            key={tone}
            type="button"
            onClick={() => onTonePreset?.(tone)}
            disabled={disabled || isToneLoading}
            className={[
              "inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-[10px] font-semibold",
              "transition-all focus:outline-none focus-visible:ring-1 focus-visible:ring-indigo-300",
              disabled || isToneLoading
                ? "opacity-50 cursor-not-allowed"
                : "cursor-pointer hover:shadow-sm",
              isActive
                ? "bg-indigo-600 border-indigo-600 text-white"
                : "border-gray-200 text-gray-500 bg-white hover:border-indigo-200 hover:text-indigo-600",
            ].join(" ")}
            title={`Rewrite all sections in ${label} tone`}
          >
            {isLoading
              ? <Loader2 className="w-2.5 h-2.5 animate-spin" aria-hidden="true" />
              : <span aria-hidden="true">{emoji}</span>}
            {label}
          </button>
        );
      })}

      {/* Divider */}
      <div className="w-px h-3.5 bg-gray-200 shrink-0 mx-0.5" aria-hidden="true" />

      {/* Consistency check button */}
      {onCheckConsistency && (
        <button
          type="button"
          onClick={onCheckConsistency}
          disabled={disabled || isToneLoading}
          className={[
            "inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-[10px] font-semibold",
            "border-amber-200 text-amber-700 bg-amber-50 transition-all",
            "hover:bg-amber-100 hover:shadow-sm focus:outline-none focus-visible:ring-1 focus-visible:ring-amber-400",
            disabled || isToneLoading ? "opacity-50 cursor-not-allowed" : "cursor-pointer",
          ].join(" ")}
          title="Check brand voice consistency across all sections"
        >
          <ShieldCheck className="w-2.5 h-2.5 shrink-0" aria-hidden="true" />
          Check
        </button>
      )}
    </div>
  );
}

// ─── AICopilotBar ─────────────────────────────────────────────────────────────

export function AICopilotBar({
  isGenerating, onGenerate, onExpandChange,
  onOpenWizard, onCheckConsistency,
  onTonePreset, isToneLoading, activeTone,
}: Props) {
  const [prompt,       setPrompt]      = useState("");
  const [isExpanded,   setIsExpanded]  = useState(false);
  const [clearContext, setClearContext] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const { activeSectionLabel, activeSectionId, clinicContext } = useAIEditorContext();

  // Show the context pill when a section is open (unless user manually cleared it)
  const showContextPill = !clearContext && activeSectionId !== null;
  const contextLabel    = activeSectionLabel;

  // Reset the manual-clear when the section changes
  useEffect(() => { setClearContext(false); }, [activeSectionId]);

  // Auto-expand when generation or tone rewrite starts
  useEffect(() => {
    if (isGenerating || isToneLoading) expand();
  }, [isGenerating, isToneLoading]); // eslint-disable-line react-hooks/exhaustive-deps

  function expand() {
    setIsExpanded(true);
    onExpandChange?.(true);
    setTimeout(() => textareaRef.current?.focus(), 150);
  }

  function collapse() {
    setIsExpanded(false);
    onExpandChange?.(false);
  }

  function handleSubmit() {
    const trimmed = prompt.trim();
    if (!trimmed || isGenerating) return;
    onGenerate(trimmed);
    setPrompt("");
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSubmit(); }
  }

  function handleChipClick(ex: string) {
    if (isGenerating) return;
    setPrompt(ex);
    expand();
  }

  function handleQuickAction(qa: QuickAction) {
    if (isGenerating) return;
    onGenerate(qa.buildPrompt(contextLabel, clinicContext.name));
    expand();
  }

  const canSubmit  = prompt.trim().length > 0 && !isGenerating;
  const anyLoading = isGenerating || !!isToneLoading;

  // ── Collapsed pill ──────────────────────────────────────────────────────────

  if (!isExpanded && !anyLoading) {
    return (
      <>
        <style>{KEYFRAMES}</style>
        <div
          className="w-full rounded-2xl overflow-hidden cursor-text select-none"
          style={{ background: "#ffffff", animation: "aiBreath 4s ease-in-out infinite" }}
          onClick={expand}
          role="button"
          tabIndex={0}
          onKeyDown={e => e.key === "Enter" && expand()}
          aria-label="Open AI Copilot"
        >
          <AccentLine />
          <div className="px-3.5 py-2.5 flex items-center gap-2.5">
            <AiIcon pulse />

            <div className="shrink-0">
              <p className="text-[11px] font-semibold text-gray-800 leading-none tracking-tight">AI Copilot</p>
              <p className="text-[9px] text-gray-400 mt-0.5 leading-none">Describe what to build</p>
            </div>

            <div className="w-px h-5 bg-gray-200 shrink-0" aria-hidden="true" />

            {/* Context pill — shown when a section is active */}
            {showContextPill && (
              <ContextPill
                label={contextLabel}
                onClear={() => setClearContext(true)}
              />
            )}

            {/* Placeholder */}
            <span className="text-[11px] text-gray-400 flex-1 truncate min-w-0">
              {showContextPill
                ? `Ask AI about ${contextLabel}…`
                : "e.g. Dental month promo with Dr. Smith…"}
            </span>

            {/* "Fill page" wizard trigger */}
            {onOpenWizard && (
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); onOpenWizard(); }}
                className={[
                  "shrink-0 inline-flex items-center gap-1 px-2.5 py-1 rounded-full border",
                  "border-indigo-200 text-[10px] font-semibold text-indigo-600 bg-indigo-50/70",
                  "hover:bg-indigo-100 transition-colors focus:outline-none focus-visible:ring-1 focus-visible:ring-indigo-400",
                ].join(" ")}
                title="Fill entire page with AI wizard"
              >
                <Sparkles className="w-2.5 h-2.5" aria-hidden="true" />
                Fill page
              </button>
            )}

            {/* Quick chips (desktop only) */}
            {/* <div className="hidden lg:flex items-center gap-1.5" aria-label="Quick prompts">
              {EXAMPLE_PROMPTS.slice(0, 2).map(ex => (
                <Chip key={ex} label={ex} onClick={() => handleChipClick(ex)} />
              ))}
            </div> */}

            <span
              className="hidden sm:flex items-center gap-1 shrink-0 text-[9px] text-gray-300 font-medium px-1.5 py-0.5 rounded-md border border-gray-200"
              aria-hidden="true"
            >
              ↵ Generate
            </span>
          </div>
        </div>
      </>
    );
  }

  // ── Expanded form ─────────────────────────────────────────────────────────

  return (
    <>
      <style>{KEYFRAMES}</style>
      <div
        className="w-full rounded-2xl overflow-hidden"
        style={{
          background: "#ffffff",
          boxShadow:
            "0 2px 8px rgba(0,0,0,0.05), 0 20px 48px rgba(79,70,229,0.10), 0 0 0 1px rgba(79,70,229,0.10)",
        }}
      >
        <AccentLine />
        <div className="px-4 pt-3.5 pb-3.5 flex flex-col gap-3">

          {/* ── Header row ── */}
          <div className="flex items-center gap-2.5">
            <AiIcon pulse={anyLoading} />

            <div className="shrink-0">
              <p className="text-[11px] font-semibold text-gray-800 leading-none tracking-tight">AI Copilot</p>
              <p className="text-[9px] text-gray-400 mt-0.5 leading-none">
                {isGenerating   ? "Generating your page…"
                  : isToneLoading ? "Applying tone preset…"
                  : "Describe what you want to build"}
              </p>
            </div>

            {/* Context pill */}
            {showContextPill && !anyLoading && (
              <ContextPill
                label={contextLabel}
                onClear={() => setClearContext(true)}
                disabled={anyLoading}
              />
            )}

            {/* Example prompt chips (when idle + no context pill) */}
            {!anyLoading && !showContextPill && (
              <div
                className="flex items-center gap-1.5 flex-1 overflow-x-auto min-w-0 ml-1"
                style={{ scrollbarWidth: "none" }}
                aria-label="Example prompts"
              >
                {EXAMPLE_PROMPTS.map(ex => (
                  <Chip key={ex} label={ex} onClick={() => handleChipClick(ex)} />
                ))}
              </div>
            )}

            {/* Loading pill */}
            {anyLoading && (
              <span className="ml-2 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-[10px] text-indigo-700 font-semibold">
                <Loader2 className="w-3 h-3 animate-spin" aria-hidden="true" />
                {isToneLoading ? "Rewriting tone…" : "Working on it…"}
              </span>
            )}

            {!anyLoading && (
              <button
                type="button"
                onClick={collapse}
                className="ml-auto p-1.5 rounded-lg text-gray-300 hover:text-gray-500 hover:bg-gray-100 transition-colors focus:outline-none shrink-0"
                aria-label="Collapse AI Copilot"
              >
                <ChevronDown className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* ── Tone + consistency row ── */}
          {(onTonePreset || onCheckConsistency) && (
            <ToneRow
              onTonePreset={onTonePreset}
              onCheckConsistency={onCheckConsistency}
              isToneLoading={isToneLoading}
              activeTone={activeTone}
              disabled={isGenerating}
            />
          )}

          {/* ── Quick actions row (shown when section is targeted) ── */}
          {showContextPill && !anyLoading && (
            <div className="flex items-center gap-1.5">
              {QUICK_ACTIONS.map((qa) => (
                <button
                  key={qa.id}
                  type="button"
                  onClick={() => handleQuickAction(qa)}
                  className={[
                    "flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-[10px] font-semibold",
                    "transition-all focus:outline-none focus-visible:ring-1 focus-visible:ring-indigo-300",
                    "border-indigo-100 text-indigo-600 bg-indigo-50/60 hover:bg-indigo-50 hover:border-indigo-200",
                  ].join(" ")}
                >
                  <qa.Icon className="w-3 h-3 shrink-0" aria-hidden="true" />
                  {qa.label}
                </button>
              ))}
              <span className="text-[9px] text-gray-400 ml-1">→ {contextLabel}</span>
            </div>
          )}

          {/* ── Prompt textarea ── */}
          <div
            className="relative rounded-xl border transition-all duration-200"
            style={{
              background: "rgba(249,250,251,0.9)",
              borderColor: anyLoading ? "rgba(79,70,229,0.25)" : undefined,
            }}
          >
            <textarea
              ref={textareaRef}
              value={prompt}
              onChange={e => setPrompt(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={anyLoading}
              placeholder={
                showContextPill
                  ? `Ask AI to change the ${contextLabel} section…`
                  : "e.g. Build a dental month promo page featuring Dr. Smith with a 20% discount and a booking CTA…"
              }
              rows={2}
              className={[
                "w-full bg-transparent resize-none text-sm text-gray-800 placeholder:text-gray-400",
                "px-3.5 pt-3 pb-10 leading-relaxed rounded-xl",
                "focus:outline-none focus:border-indigo-200",
                "border border-transparent focus:shadow-[0_0_0_3px_rgba(79,70,229,0.07)]",
                "transition-all duration-200",
                anyLoading ? "opacity-50 cursor-not-allowed" : "",
              ].join(" ")}
              aria-label="AI prompt"
            />

            {/* Bottom toolbar */}
            <div className="absolute bottom-2.5 left-3.5 right-3 flex items-center justify-between pointer-events-none">
              <span className="text-[10px] text-gray-400 select-none">
                {prompt.length > 0
                  ? <><span className="font-medium text-gray-500">{prompt.length}</span> chars · Enter ↵ to generate</>
                  : "Shift+Enter for new line · Enter to generate"
                }
              </span>

              <button
                type="button"
                onClick={handleSubmit}
                disabled={!canSubmit}
                aria-label="Generate"
                className={[
                  "pointer-events-auto w-7 h-7 rounded-lg flex items-center justify-center",
                  "transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400",
                  canSubmit
                    ? "shadow-md hover:shadow-lg hover:scale-105 active:scale-95 cursor-pointer"
                    : "bg-gray-100 text-gray-300 cursor-not-allowed",
                ].join(" ")}
                style={canSubmit ? { background: "linear-gradient(135deg, #4f46e5, #3b82f6)" } : undefined}
              >
                {isGenerating
                  ? <Loader2 className="w-3.5 h-3.5 animate-spin text-indigo-400" aria-hidden="true" />
                  : <ArrowUp className={`w-3.5 h-3.5 ${canSubmit ? "text-white" : "text-gray-300"}`} aria-hidden="true" />
                }
              </button>
            </div>
          </div>

          {/* Footer hint */}
          {!anyLoading && (
            <div className="flex items-center justify-between">
              <p className="text-[9px] text-gray-400 leading-none">
                AI can make mistakes — always review before publishing
              </p>
              {onOpenWizard && (
                <button
                  type="button"
                  onClick={onOpenWizard}
                  className="text-[9px] text-indigo-500 hover:text-indigo-700 font-medium underline-offset-2 hover:underline transition-colors focus:outline-none"
                >
                  ✦ Fill from scratch
                </button>
              )}
            </div>
          )}

        </div>
      </div>
    </>
  );
}
