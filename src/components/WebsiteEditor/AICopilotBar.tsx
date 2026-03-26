import { useState, useRef, useEffect } from "react";
import {
  Sparkles, ArrowUp, Loader2, ChevronDown,
  X, Wand2, RefreshCw, ShieldCheck, Zap,
  ArrowRight, CheckCircle2, RotateCcw,
} from "lucide-react";
import { useAIEditorContext } from "./ai/AIEditorContext";
import type { TonePreset } from "./ai/mockAI";
import {
  runCampaignBuilder,
  detectBuildMode,
  type BuildMode,
  type CampaignPlan,
  type CampaignDiffEntry,
} from "./ai/campaignBuilder";
import type { ClinicWebsite } from "../../types/clinic";

// ─── Campaign quick-start chips ────────────────────────────────────────────────

const CAMPAIGN_CHIPS = [
  {
    label:  "Dental Month",
    emoji:  "🦷",
    prompt: "I need a landing page for Dental Health Month with a 20% discount on cleanings — featuring our dental specialist.",
  },
  {
    label:  "Emergency",
    emoji:  "🚨",
    prompt: "Create an emergency care landing page that puts 24/7 contact information front and centre with a tap-to-call CTA.",
  },
  {
    label:  "Seasonal",
    emoji:  "🌸",
    prompt: "Build a seasonal wellness campaign page with a spring promotion and a booking call-to-action.",
  },
  {
    label:  "New Clients",
    emoji:  "🐾",
    prompt: "Create a new client welcome page with a special offer for first-time visitors.",
  },
];

// ─── Section quick-start chips ─────────────────────────────────────────────────

const SECTION_CHIPS = [
  {
    label:  "Email Signup",
    emoji:  "📧",
    prompt: "Create a section above the footer where users can enter their email to subscribe to clinic news and pet health tips.",
  },
  {
    label:  "Split Content",
    emoji:  "⬓",
    prompt: "Add a section with a headline and body text on the left side and an image on the right side, describing our clinic's mission.",
  },
  {
    label:  "Feature Grid",
    emoji:  "✨",
    prompt: "Create a 3-column feature grid section highlighting the key benefits and services of our clinic.",
  },
];

// ─── Campaign / Section parsing carousel ──────────────────────────────────────

const PARSING_PHRASES = [
  "Parsing your campaign intent…",
  "Matching team members…",
  "Selecting relevant services…",
  "Assembling your page layout…",
  "Almost ready…",
];

const SECTION_PARSING_PHRASES = [
  "Detecting section type…",
  "Reading your layout description…",
  "Seeding content from clinic data…",
  "Calculating insertion point…",
  "Preparing your section…",
];

// ─── Campaign diff styling ─────────────────────────────────────────────────────

const DIFF_BORDER: Record<CampaignDiffEntry["kind"], string> = {
  update_hero:      "border-l-blue-400",
  add_section:      "border-l-green-400",
  reorder_sections: "border-l-amber-400",
  set_visibility:   "border-l-gray-400",
};
const DIFF_ICON: Record<CampaignDiffEntry["kind"], string> = {
  update_hero: "✏️", add_section: "➕", reorder_sections: "↕️", set_visibility: "👁",
};
const DIFF_LABEL: Record<CampaignDiffEntry["kind"], string> = {
  update_hero: "Hero Update", add_section: "New Section",
  reorder_sections: "Reorder",  set_visibility: "Visibility",
};

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

type BarMode = "copilot" | "campaign";

function AccentLine({ mode }: { mode: BarMode }) {
  const gradient = mode === "campaign"
    ? "linear-gradient(90deg, transparent 0%, #5eead4 15%, #0F766E 35%, #0ea5e9 55%, #67e8f9 75%, transparent 100%)"
    : "linear-gradient(90deg, transparent 0%, #a5b4fc 15%, #6366f1 35%, #3b82f6 55%, #67e8f9 75%, transparent 100%)";
  return (
    <div
      className="h-[1.5px] w-full shrink-0"
      style={{ background: gradient, opacity: 0.5 }}
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

// ─── Context pill ─────────────────────────────────────────────────────────────

function ContextPill({
  label, onClear, disabled,
}: { label: string; onClear: () => void; disabled?: boolean }) {
  return (
    <span
      className="inline-flex items-center gap-1 pl-2 pr-1 py-0.5 rounded-full border shrink-0"
      style={{ background: "#eff6ff", borderColor: "#bfdbfe" }}
      title={`AI will target: ${label}`}
    >
      <span className="text-[10px] font-semibold text-teal-700">{label}</span>
      <button
        type="button"
        onClick={(e) => { e.stopPropagation(); onClear(); }}
        disabled={disabled}
        aria-label={`Clear ${label} context`}
        className="w-3.5 h-3.5 rounded-full flex items-center justify-center text-teal-400 hover:text-teal-700 hover:bg-teal-100 transition-colors focus:outline-none"
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

      <div className="w-px h-3.5 bg-gray-200 shrink-0 mx-0.5" aria-hidden="true" />

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

// ─── Props ────────────────────────────────────────────────────────────────────

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
  // Campaign Builder (inline)
  clinic?:               ClinicWebsite;
  currentSectionOrder?:  string[];
  onApplyCampaign?:      (plan: CampaignPlan) => void;
}

// ─── AICopilotBar ─────────────────────────────────────────────────────────────

export function AICopilotBar({
  isGenerating, onGenerate, onExpandChange,
  onOpenWizard, onCheckConsistency,
  onTonePreset, isToneLoading, activeTone,
  clinic, currentSectionOrder, onApplyCampaign,
}: Props) {
  // ── Copilot state ──────────────────────────────────────────────────────────
  const [prompt,       setPrompt]      = useState("");
  const [isExpanded,   setIsExpanded]  = useState(false);
  const [clearContext, setClearContext] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // ── Campaign state ─────────────────────────────────────────────────────────
  const [barMode,            setBarMode]            = useState<BarMode>("copilot");
  const [campaignStep,       setCampaignStep]       = useState<"input" | "parsing" | "review" | "applying">("input");
  const [campaignPrompt,     setCampaignPrompt]     = useState("");
  const [campaignPlan,       setCampaignPlan]       = useState<CampaignPlan | null>(null);
  const [campaignError,      setCampaignError]      = useState<string | null>(null);
  const [parsingPhraseIdx,   setParsingPhraseIdx]   = useState(0);
  const [detectedBuildMode,  setDetectedBuildMode]  = useState<BuildMode>("campaign");
  const campaignTextareaRef = useRef<HTMLTextAreaElement>(null);

  // Compute live build mode as user types (for button label / placeholder)
  const liveBuildMode: BuildMode = campaignPrompt.trim() ? detectBuildMode(campaignPrompt) : "campaign";

  // Cycle parsing phrases
  useEffect(() => {
    if (campaignStep !== "parsing") return;
    const id = setInterval(() => setParsingPhraseIdx(i => (i + 1) % PARSING_PHRASES.length), 900);
    return () => clearInterval(id);
  }, [campaignStep]);

  const { activeSectionLabel, activeSectionId, clinicContext } = useAIEditorContext();

  const showContextPill = !clearContext && activeSectionId !== null;
  const contextLabel    = activeSectionLabel;

  useEffect(() => { setClearContext(false); }, [activeSectionId]);

  // Auto-expand when loading starts
  useEffect(() => {
    if (isGenerating || isToneLoading) expand();
  }, [isGenerating, isToneLoading]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Expand / collapse ──────────────────────────────────────────────────────

  function expand() {
    setIsExpanded(true);
    onExpandChange?.(true);
    setTimeout(() => {
      if (barMode === "campaign") campaignTextareaRef.current?.focus();
      else textareaRef.current?.focus();
    }, 150);
  }

  function collapse() {
    setIsExpanded(false);
    onExpandChange?.(false);
  }

  // ── Copilot handlers ───────────────────────────────────────────────────────

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

  // ── Campaign handlers ──────────────────────────────────────────────────────

  function handleOpenCampaign() {
    setBarMode("campaign");
    if (!isExpanded) {
      setIsExpanded(true);
      onExpandChange?.(true);
    }
    setTimeout(() => campaignTextareaRef.current?.focus(), 150);
  }

  function handleSwitchMode(mode: BarMode) {
    setBarMode(mode);
    if (mode === "campaign") {
      setTimeout(() => campaignTextareaRef.current?.focus(), 100);
    } else {
      setTimeout(() => textareaRef.current?.focus(), 100);
    }
  }

  async function handleCampaignGenerate() {
    const trimmed = campaignPrompt.trim();
    if (!trimmed || !clinic || !currentSectionOrder) return;
    const mode = detectBuildMode(trimmed);
    setDetectedBuildMode(mode);
    setCampaignError(null);
    setParsingPhraseIdx(0);
    setCampaignStep("parsing");
    try {
      const result = await runCampaignBuilder(trimmed, clinic, currentSectionOrder);
      setCampaignPlan(result);
      setCampaignStep("review");
    } catch {
      setCampaignError("Something went wrong. Please try again.");
      setCampaignStep("input");
    }
  }

  function handleCampaignApply() {
    if (!campaignPlan || !onApplyCampaign) return;
    setCampaignStep("applying");
    setTimeout(() => {
      onApplyCampaign(campaignPlan);
      // Reset campaign state and close
      setCampaignStep("input");
      setCampaignPrompt("");
      setCampaignPlan(null);
      setBarMode("copilot");
      collapse();
    }, 800);
  }

  function handleCampaignStartOver() {
    setCampaignStep("input");
    setCampaignPrompt("");
    setCampaignPlan(null);
    setCampaignError(null);
    setTimeout(() => campaignTextareaRef.current?.focus(), 100);
  }

  function handleCampaignKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleCampaignGenerate(); }
  }

  const canSubmit  = prompt.trim().length > 0 && !isGenerating;
  const anyLoading = isGenerating || !!isToneLoading;
  const campaignRunning = campaignStep === "parsing" || campaignStep === "applying";

  // ── Collapsed pill ─────────────────────────────────────────────────────────

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
          <AccentLine mode={barMode} />
          <div className="px-3.5 py-2.5 flex items-center gap-2.5">
            <AiIcon pulse />

            <div className="shrink-0">
              <p className="text-[11px] font-semibold text-gray-800 leading-none tracking-tight">AI Copilot</p>
              <p className="text-[9px] text-gray-400 mt-0.5 leading-none">
                {barMode === "campaign" ? "Build" : "Describe what to build"}
              </p>
            </div>

            <div className="w-px h-5 bg-gray-200 shrink-0" aria-hidden="true" />

            {/* Context pill */}
            {showContextPill && barMode === "copilot" && (
              <ContextPill label={contextLabel} onClear={() => setClearContext(true)} />
            )}

            {/* Placeholder */}
            <span className="text-[11px] text-gray-400 flex-1 truncate min-w-0">
              {barMode === "campaign"
                ? "Describe your campaign → AI assembles the page"
                : showContextPill
                  ? `Ask AI about ${contextLabel}…`
                  : "e.g. Dental month promo with Dr. Smith…"}
            </span>

            {/* Fill page wizard trigger */}
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

            {/* Campaign / Section Builder trigger */}
            {clinic && onApplyCampaign && (
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); handleOpenCampaign(); }}
                className={[
                  "shrink-0 inline-flex items-center gap-1 px-2.5 py-1 rounded-full border",
                  "border-teal-200 text-[10px] font-semibold text-teal-700 bg-teal-50/70",
                  "hover:bg-teal-100 transition-colors focus:outline-none focus-visible:ring-1 focus-visible:ring-teal-400",
                ].join(" ")}
                title="Build campaigns or add new sections from natural language"
              >
                <Zap className="w-2.5 h-2.5" aria-hidden="true" />
                Build
              </button>
            )}

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

  // ── Expanded form ──────────────────────────────────────────────────────────

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
        <AccentLine mode={barMode} />
        <div className="px-4 pt-3.5 pb-3.5 flex flex-col gap-3">

          {/* ── Header row ── */}
          <div className="flex items-center gap-2.5">
            <AiIcon pulse={anyLoading || campaignRunning} />

            {/* Mode tabs */}
            {!anyLoading && (
              <div
                className="flex items-center gap-0.5 p-0.5 rounded-lg shrink-0"
                style={{ background: "#f1f5f9" }}
              >
                <button
                  type="button"
                  onClick={() => handleSwitchMode("copilot")}
                  className={[
                    "inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[10px] font-semibold transition-all",
                    "focus:outline-none focus-visible:ring-1 focus-visible:ring-indigo-400",
                    barMode === "copilot"
                      ? "bg-white text-indigo-700 shadow-sm"
                      : "text-gray-400 hover:text-gray-600",
                  ].join(" ")}
                >
                  <Sparkles className="w-2.5 h-2.5" aria-hidden="true" />
                  Copilot
                </button>
                <button
                  type="button"
                  onClick={() => handleSwitchMode("campaign")}
                  className={[
                    "inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[10px] font-semibold transition-all",
                    "focus:outline-none focus-visible:ring-1 focus-visible:ring-teal-400",
                    barMode === "campaign"
                      ? "bg-white text-teal-700 shadow-sm"
                      : "text-gray-400 hover:text-gray-600",
                  ].join(" ")}
                  disabled={!clinic || !onApplyCampaign}
                >
                  <Zap className="w-2.5 h-2.5" aria-hidden="true" />
                  Build
                </button>
              </div>
            )}

            {/* Copilot mode: context pill OR example chips OR loading pill */}
            {barMode === "copilot" && (
              <>
                {showContextPill && !anyLoading && (
                  <ContextPill
                    label={contextLabel}
                    onClear={() => setClearContext(true)}
                    disabled={anyLoading}
                  />
                )}

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

                {anyLoading && (
                  <span className="ml-2 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-[10px] text-indigo-700 font-semibold">
                    <Loader2 className="w-3 h-3 animate-spin" aria-hidden="true" />
                    {isToneLoading ? "Rewriting tone…" : "Working on it…"}
                  </span>
                )}
              </>
            )}

            {/* Campaign mode: status pill */}
            {barMode === "campaign" && campaignRunning && (
              <span className="ml-2 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-teal-50 border border-teal-100 text-[10px] text-teal-700 font-semibold">
                <Loader2 className="w-3 h-3 animate-spin" aria-hidden="true" />
                {campaignStep === "parsing"
                  ? (detectedBuildMode === "section" ? "Building section…" : "Building campaign…")
                  : "Applying…"}
              </span>
            )}

            {!anyLoading && !campaignRunning && (
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

          {/* ═══════════════════════════════════════════════════════════════════
              COPILOT MODE
          ═══════════════════════════════════════════════════════════════════ */}
          {barMode === "copilot" && (
            <>
              {/* Tone + consistency row */}
              {(onTonePreset || onCheckConsistency) && (
                <ToneRow
                  onTonePreset={onTonePreset}
                  onCheckConsistency={onCheckConsistency}
                  isToneLoading={isToneLoading}
                  activeTone={activeTone}
                  disabled={isGenerating}
                />
              )}

              {/* Quick actions row (shown when section is targeted) */}
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

              {/* Prompt textarea */}
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
            </>
          )}

          {/* ═══════════════════════════════════════════════════════════════════
              CAMPAIGN MODE
          ═══════════════════════════════════════════════════════════════════ */}
          {barMode === "campaign" && (
            <>

              {/* ── Step: input ── */}
              {campaignStep === "input" && (
                <div className="flex flex-col gap-3">

                  {/* Campaign quick-start chips */}
                  <div>
                    <p className="text-[9px] font-semibold text-gray-400 uppercase tracking-wide mb-1.5">
                      Campaign ideas
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {CAMPAIGN_CHIPS.map(chip => (
                        <button
                          key={chip.label}
                          type="button"
                          onClick={() => {
                            setCampaignPrompt(chip.prompt);
                            campaignTextareaRef.current?.focus();
                          }}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full border text-[10px] font-semibold border-teal-200 text-teal-700 bg-teal-50 hover:bg-teal-100 transition-colors focus:outline-none focus-visible:ring-1 focus-visible:ring-teal-400"
                        >
                          <span aria-hidden="true">{chip.emoji}</span>
                          {chip.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Section quick-start chips */}
                  <div>
                    <p className="text-[9px] font-semibold text-gray-400 uppercase tracking-wide mb-1.5">
                      Build a section
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {SECTION_CHIPS.map(chip => (
                        <button
                          key={chip.label}
                          type="button"
                          onClick={() => {
                            setCampaignPrompt(chip.prompt);
                            campaignTextareaRef.current?.focus();
                          }}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full border text-[10px] font-semibold border-indigo-200 text-indigo-700 bg-indigo-50 hover:bg-indigo-100 transition-colors focus:outline-none focus-visible:ring-1 focus-visible:ring-indigo-400"
                        >
                          <span aria-hidden="true">{chip.emoji}</span>
                          {chip.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Prompt textarea — placeholder adapts to live mode */}
                  <div className="flex flex-col gap-1">
                    <textarea
                      ref={campaignTextareaRef}
                      value={campaignPrompt}
                      onChange={e => setCampaignPrompt(e.target.value)}
                      onKeyDown={handleCampaignKeyDown}
                      rows={3}
                      placeholder={
                        liveBuildMode === "section"
                          ? `e.g. "Create a section above the footer where visitors can subscribe by email to our newsletter"`
                          : `e.g. "Dental Health Month featuring Dr. Chen, with 20% off cleanings and a booking CTA"`
                      }
                      className="w-full px-3.5 py-2.5 text-sm text-gray-800 bg-gray-50 border border-gray-200 rounded-xl resize-none focus:outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-100 placeholder:text-gray-400 leading-relaxed transition-all"
                      aria-label="Campaign or section prompt"
                    />
                    {campaignError && (
                      <p className="text-xs text-red-500" role="alert">{campaignError}</p>
                    )}
                    <p className="text-[9px] text-gray-400">
                      {liveBuildMode === "section"
                        ? "Describe layout, position (e.g. \"above footer\"), and any content hints."
                        : "Tip: mention a vet name, campaign theme, and any promotion for the best results."}
                    </p>
                  </div>

                  {/* Build button — label adapts to live mode */}
                  <button
                    type="button"
                    onClick={handleCampaignGenerate}
                    disabled={!campaignPrompt.trim() || !clinic}
                    className={[
                      "w-full flex items-center justify-center gap-2 h-9 rounded-xl text-xs font-bold transition-all",
                      "focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-400",
                      campaignPrompt.trim() && clinic
                        ? "text-white shadow-md hover:shadow-lg active:scale-95"
                        : "bg-gray-100 text-gray-400 cursor-not-allowed",
                    ].join(" ")}
                    style={campaignPrompt.trim() && clinic
                      ? { background: liveBuildMode === "section"
                          ? "linear-gradient(135deg, #4f46e5, #3b82f6)"
                          : "linear-gradient(135deg, #0F766E, #3b82f6)" }
                      : undefined}
                  >
                    {liveBuildMode === "section"
                      ? <Sparkles className="w-3.5 h-3.5" aria-hidden="true" />
                      : <Zap className="w-3.5 h-3.5" aria-hidden="true" />}
                    {liveBuildMode === "section" ? "Build Section" : "Build Campaign"}
                    <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
                  </button>

                </div>
              )}

              {/* ── Step: parsing ── */}
              {campaignStep === "parsing" && (
                <div className="flex flex-col items-center gap-3 py-5">
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center shadow-md"
                    style={{
                      background: detectedBuildMode === "section"
                        ? "linear-gradient(135deg, #4f46e5, #3b82f6)"
                        : "linear-gradient(135deg, #0F766E, #3b82f6)",
                    }}
                  >
                    {detectedBuildMode === "section"
                      ? <Sparkles className="w-5 h-5 text-white animate-pulse" aria-hidden="true" />
                      : <Zap className="w-5 h-5 text-white animate-pulse" aria-hidden="true" />}
                  </div>
                  <div className="text-center">
                    <p className="text-xs font-semibold text-gray-800 transition-all">
                      {detectedBuildMode === "section"
                        ? SECTION_PARSING_PHRASES[parsingPhraseIdx % SECTION_PARSING_PHRASES.length]
                        : PARSING_PHRASES[parsingPhraseIdx]}
                    </p>
                    <p className="text-[10px] text-gray-400 mt-0.5">
                      {detectedBuildMode === "section"
                        ? "AI is reading your description and preparing the section…"
                        : "AI is reading your prompt and building the page…"}
                    </p>
                  </div>
                  <Loader2 className={`w-4 h-4 animate-spin ${detectedBuildMode === "section" ? "text-indigo-500" : "text-teal-500"}`} aria-hidden="true" />
                </div>
              )}

              {/* ── Step: review ── */}
              {campaignStep === "review" && campaignPlan && (() => {
                const isSectionMode = campaignPlan.intent.buildMode === "section";
                return (
                  <div className="flex flex-col gap-3">

                    {/* Summary callout — teal for campaign, indigo for section */}
                    <div
                      className="p-2.5 rounded-xl border"
                      style={isSectionMode ? {
                        background:  "linear-gradient(135deg, #eef2ff, #eff6ff)",
                        borderColor: "#c7d2fe",
                      } : {
                        background:  "linear-gradient(135deg, #f0fdfa, #eff6ff)",
                        borderColor: "#99f6e4",
                      }}
                    >
                      <p className={`text-[9px] font-bold uppercase tracking-wide mb-0.5 ${isSectionMode ? "text-indigo-600" : "text-teal-600"}`}>
                        {isSectionMode ? "Section Ready" : "Campaign Ready"}
                      </p>
                      <p className="text-[11px] text-gray-700 leading-relaxed">
                        {campaignPlan.previewSummary}
                      </p>
                      {!isSectionMode && campaignPlan.intent.matchedVets.length > 0 && (
                        <p className="text-[10px] text-teal-600 mt-1 font-medium">
                          ✓ Matched: {campaignPlan.intent.matchedVets.map(v => v.name).join(", ")}
                        </p>
                      )}
                      {isSectionMode && (
                        <p className="text-[10px] text-indigo-500 mt-1 font-medium">
                          ✓ After applying, open the section in the right panel to customise content &amp; style.
                        </p>
                      )}
                    </div>

                    {/* Diff cards */}
                    <div>
                      <p className="text-[9px] font-semibold text-gray-400 uppercase tracking-wide mb-1.5">
                        {isSectionMode ? "Section to add" : `Changes to apply (${campaignPlan.diffs.length})`}
                      </p>
                      <div
                        className="flex flex-col gap-1.5 overflow-y-auto"
                        style={{ maxHeight: "128px" }}
                      >
                        {campaignPlan.diffs.map((diff, i) => (
                          <div
                            key={i}
                            className={[
                              "flex items-start gap-2 px-2.5 py-2 rounded-lg bg-white border border-l-4 border-gray-100 shadow-sm",
                              DIFF_BORDER[diff.kind],
                            ].join(" ")}
                          >
                            <span className="text-sm leading-none mt-0.5 shrink-0" aria-hidden="true">
                              {DIFF_ICON[diff.kind]}
                            </span>
                            <div className="flex-1 min-w-0">
                              <p className="text-[9px] font-bold text-gray-400 uppercase tracking-wide">
                                {DIFF_LABEL[diff.kind]}
                              </p>
                              <p className="text-[11px] text-gray-700 mt-0.5 leading-snug">
                                {diff.description}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Action buttons — apply label adapts to mode */}
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={handleCampaignStartOver}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 text-[11px] font-semibold text-gray-600 hover:bg-gray-50 transition-colors focus:outline-none"
                      >
                        <RotateCcw className="w-3 h-3" aria-hidden="true" />
                        Start Over
                      </button>
                      <button
                        type="button"
                        onClick={handleCampaignApply}
                        className={[
                          "flex-1 flex items-center justify-center gap-1.5 h-8 rounded-lg text-xs font-bold text-white active:scale-95 transition-all focus:outline-none",
                          isSectionMode
                            ? "focus-visible:ring-2 focus-visible:ring-indigo-400"
                            : "focus-visible:ring-2 focus-visible:ring-teal-400",
                        ].join(" ")}
                        style={{
                          background: isSectionMode
                            ? "linear-gradient(135deg, #4f46e5, #3b82f6)"
                            : "linear-gradient(135deg, #0F766E, #3b82f6)",
                        }}
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" aria-hidden="true" />
                        {isSectionMode ? "Add Section to Page" : "Apply to Page"}
                      </button>
                    </div>
                  </div>
                );
              })()}

              {/* ── Step: applying ── */}
              {campaignStep === "applying" && (
                <div className="flex flex-col items-center gap-3 py-5">
                  <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                    <CheckCircle2 className="w-6 h-6 text-green-500" aria-hidden="true" />
                  </div>
                  <div className="text-center">
                    <p className="text-xs font-semibold text-gray-800">
                      {detectedBuildMode === "section" ? "Section added!" : "Campaign applied!"}
                    </p>
                    <p className="text-[10px] text-gray-400 mt-0.5">
                      {detectedBuildMode === "section"
                        ? "Open it in the right panel to customise…"
                        : "Updating your page layout…"}
                    </p>
                  </div>
                </div>
              )}

            </>
          )}

        </div>
      </div>
    </>
  );
}
