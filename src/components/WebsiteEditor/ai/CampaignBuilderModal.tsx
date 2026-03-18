// ─── Campaign Builder Modal ────────────────────────────────────────────────────
// 4-step modal: input → parsing → review → applying
// Teal-to-blue accent gradient (distinct from FillFromScratch purple).

import { useState, useEffect, useRef } from "react";
import { X, Zap, CheckCircle2, Loader2, ArrowRight, RotateCcw } from "lucide-react";
import { runCampaignBuilder, type CampaignPlan, type CampaignDiffEntry } from "./campaignBuilder";
import type { ClinicWebsite } from "../../../types/clinic";

// ─── Quick-start chips ────────────────────────────────────────────────────────

interface QuickChip {
  label: string;
  emoji: string;
  prompt: string;
}

const QUICK_CHIPS: QuickChip[] = [
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
    label:  "Seasonal Promo",
    emoji:  "🌸",
    prompt: "Build a seasonal wellness campaign page with a spring promotion and a booking call-to-action.",
  },
  {
    label:  "New Clients",
    emoji:  "🐾",
    prompt: "Create a new client welcome page with a special offer for first-time visitors.",
  },
];

// ─── Parsing phrase carousel ──────────────────────────────────────────────────

const PARSING_PHRASES = [
  "Parsing your campaign intent…",
  "Matching team members…",
  "Selecting relevant services…",
  "Assembling your page layout…",
  "Almost ready…",
];

function ParsingCarousel() {
  const [idx, setIdx] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setIdx(i => (i + 1) % PARSING_PHRASES.length), 900);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="flex flex-col items-center gap-4 py-10">
      <div
        className="w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg"
        style={{ background: "linear-gradient(135deg, #0F766E 0%, #3b82f6 100%)" }}
      >
        <Zap className="w-7 h-7 text-white animate-pulse" aria-hidden="true" />
      </div>
      <div className="text-center">
        <p className="text-sm font-semibold text-gray-800 transition-all">
          {PARSING_PHRASES[idx]}
        </p>
        <p className="text-[11px] text-gray-400 mt-1">
          AI is reading your prompt and building the page…
        </p>
      </div>
      <Loader2 className="w-5 h-5 text-teal-500 animate-spin" aria-hidden="true" />
    </div>
  );
}

// ─── Diff card ────────────────────────────────────────────────────────────────

const DIFF_BORDER: Record<CampaignDiffEntry["kind"], string> = {
  update_hero:      "border-l-blue-400",
  add_section:      "border-l-green-400",
  reorder_sections: "border-l-amber-400",
  set_visibility:   "border-l-gray-400",
};

const DIFF_ICON: Record<CampaignDiffEntry["kind"], string> = {
  update_hero:      "✏️",
  add_section:      "➕",
  reorder_sections: "↕️",
  set_visibility:   "👁",
};

const DIFF_LABEL: Record<CampaignDiffEntry["kind"], string> = {
  update_hero:      "Hero Update",
  add_section:      "New Section",
  reorder_sections: "Reorder",
  set_visibility:   "Visibility",
};

function DiffCard({ diff }: { diff: CampaignDiffEntry }) {
  return (
    <div
      className={[
        "flex items-start gap-3 px-3 py-2.5 rounded-xl bg-white border border-l-4",
        "border-gray-100 shadow-sm",
        DIFF_BORDER[diff.kind],
      ].join(" ")}
    >
      <span className="text-base leading-none mt-0.5 shrink-0" aria-hidden="true">
        {DIFF_ICON[diff.kind]}
      </span>
      <div className="flex-1 min-w-0">
        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">
          {DIFF_LABEL[diff.kind]}
        </p>
        <p className="text-xs text-gray-700 mt-0.5 leading-snug">
          {diff.description}
        </p>
      </div>
    </div>
  );
}

// ─── Props ────────────────────────────────────────────────────────────────────

interface Props {
  clinic:               ClinicWebsite;
  currentSectionOrder:  string[];
  onClose:              () => void;
  onApply:              (plan: CampaignPlan) => void;
}

// ─── CampaignBuilderModal ─────────────────────────────────────────────────────

type Step = "input" | "parsing" | "review" | "applying";

export function CampaignBuilderModal({ clinic, currentSectionOrder, onClose, onApply }: Props) {
  const [step,    setStep]    = useState<Step>("input");
  const [prompt,  setPrompt]  = useState("");
  const [plan,    setPlan]    = useState<CampaignPlan | null>(null);
  const [error,   setError]   = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Focus textarea on mount
  useEffect(() => { textareaRef.current?.focus(); }, []);

  async function handleGenerate() {
    const trimmed = prompt.trim();
    if (!trimmed) return;
    setError(null);
    setStep("parsing");
    try {
      const result = await runCampaignBuilder(trimmed, clinic, currentSectionOrder);
      setPlan(result);
      setStep("review");
    } catch {
      setError("Something went wrong. Please try again.");
      setStep("input");
    }
  }

  function handleApply() {
    if (!plan) return;
    setStep("applying");
    // Brief confirmation before closing
    setTimeout(() => { onApply(plan); onClose(); }, 800);
  }

  function handleStartOver() {
    setStep("input");
    setPrompt("");
    setPlan(null);
    setError(null);
    setTimeout(() => textareaRef.current?.focus(), 100);
  }

  function handleChip(chip: QuickChip) {
    setPrompt(chip.prompt);
    textareaRef.current?.focus();
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleGenerate();
    }
  }

  const canGenerate = prompt.trim().length > 0 && step === "input";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.65)", backdropFilter: "blur(4px)" }}
    >
      <div
        className="w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden relative"
        style={{ boxShadow: "0 24px 80px rgba(0,0,0,0.25), 0 0 0 1px rgba(0,0,0,0.08)" }}
        role="dialog"
        aria-modal="true"
        aria-label="Campaign Builder"
      >
        {/* Accent line — teal → blue */}
        <div
          className="h-[3px] w-full shrink-0"
          style={{ background: "linear-gradient(90deg, #0F766E 0%, #0ea5e9 55%, #6366f1 100%)" }}
          aria-hidden="true"
        />

        {/* ── Header ── */}
        <div className="px-6 pt-5 pb-4 flex items-start justify-between">
          <div className="flex items-center gap-3">
            <span
              className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
              style={{ background: "linear-gradient(135deg, #0F766E 0%, #3b82f6 100%)" }}
            >
              <Zap className="w-4 h-4 text-white" aria-hidden="true" />
            </span>
            <div>
              <p className="text-sm font-bold text-gray-900 leading-none">Campaign Builder</p>
              <p className="text-[11px] text-gray-400 mt-0.5">
                Describe your campaign → AI assembles the page
              </p>
            </div>
          </div>
          {step !== "applying" && (
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-gray-300 hover:text-gray-500 hover:bg-gray-100 transition-colors"
              aria-label="Close Campaign Builder"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* ── Body ── */}
        <div className="px-6 pb-6 min-h-[280px]">

          {/* Step: input */}
          {step === "input" && (
            <div className="flex flex-col gap-4">

              {/* Quick-start chips */}
              <div>
                <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-2">
                  Quick start
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {QUICK_CHIPS.map(chip => (
                    <button
                      key={chip.label}
                      type="button"
                      onClick={() => handleChip(chip)}
                      className={[
                        "inline-flex items-center gap-1 px-2.5 py-1 rounded-full border text-[10px] font-semibold",
                        "border-teal-200 text-teal-700 bg-teal-50 hover:bg-teal-100 transition-colors",
                        "focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-400",
                      ].join(" ")}
                    >
                      <span aria-hidden="true">{chip.emoji}</span>
                      {chip.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Prompt textarea */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-gray-700" htmlFor="campaign-prompt">
                  Describe your campaign
                </label>
                <textarea
                  ref={textareaRef}
                  id="campaign-prompt"
                  value={prompt}
                  onChange={e => setPrompt(e.target.value)}
                  onKeyDown={handleKeyDown}
                  rows={4}
                  placeholder={`e.g. "I need a landing page for Dental Health Month featuring Dr. Chen, with a 20% discount on cleanings"`}
                  className="w-full px-3 py-2.5 text-sm text-gray-800 bg-gray-50 border border-gray-200 rounded-xl resize-none focus:outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-100 placeholder:text-gray-400 leading-relaxed"
                />
                {error && (
                  <p className="text-xs text-red-500" role="alert">{error}</p>
                )}
                <p className="text-[10px] text-gray-400">
                  Tip: mention a vet name, campaign theme, and any promotion for the best results.
                </p>
              </div>

              {/* Generate button */}
              <button
                type="button"
                onClick={handleGenerate}
                disabled={!canGenerate}
                className={[
                  "w-full flex items-center justify-center gap-2 h-10 rounded-xl text-sm font-bold transition-all",
                  "focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-400",
                  canGenerate
                    ? "text-white shadow-md hover:shadow-lg active:scale-95"
                    : "bg-gray-100 text-gray-400 cursor-not-allowed",
                ].join(" ")}
                style={canGenerate ? { background: "linear-gradient(135deg, #0F766E, #3b82f6)" } : undefined}
              >
                <Zap className="w-4 h-4" aria-hidden="true" />
                Generate Campaign
                <ArrowRight className="w-4 h-4" aria-hidden="true" />
              </button>
            </div>
          )}

          {/* Step: parsing */}
          {step === "parsing" && <ParsingCarousel />}

          {/* Step: review */}
          {step === "review" && plan && (
            <div className="flex flex-col gap-4">

              {/* Summary callout */}
              <div
                className="p-3 rounded-xl border"
                style={{ background: "linear-gradient(135deg, #f0fdfa, #eff6ff)", borderColor: "#99f6e4" }}
              >
                <p className="text-[10px] font-bold text-teal-600 uppercase tracking-wide mb-1">
                  Campaign Ready
                </p>
                <p className="text-xs text-gray-700 leading-relaxed">
                  {plan.previewSummary}
                </p>
                {plan.intent.matchedVets.length > 0 && (
                  <p className="text-[10px] text-teal-600 mt-1 font-medium">
                    ✓ Matched: {plan.intent.matchedVets.map(v => v.name).join(", ")}
                  </p>
                )}
              </div>

              {/* Diff cards */}
              <div>
                <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-2">
                  Changes to apply ({plan.diffs.length})
                </p>
                <div className="flex flex-col gap-2">
                  {plan.diffs.map((diff, i) => (
                    <DiffCard key={i} diff={diff} />
                  ))}
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={handleStartOver}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-gray-200 text-xs font-semibold text-gray-600 hover:bg-gray-50 transition-colors focus:outline-none"
                >
                  <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
                  Start Over
                </button>
                <button
                  type="button"
                  onClick={handleApply}
                  className="flex-1 flex items-center justify-center gap-2 h-9 rounded-xl text-sm font-bold text-white transition-all active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-400"
                  style={{ background: "linear-gradient(135deg, #0F766E, #3b82f6)" }}
                >
                  <CheckCircle2 className="w-4 h-4" aria-hidden="true" />
                  Apply to Page
                </button>
              </div>
            </div>
          )}

          {/* Step: applying */}
          {step === "applying" && (
            <div className="flex flex-col items-center justify-center gap-4 py-10">
              <div className="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center">
                <CheckCircle2 className="w-7 h-7 text-green-500" aria-hidden="true" />
              </div>
              <div className="text-center">
                <p className="text-sm font-semibold text-gray-800">Campaign applied!</p>
                <p className="text-[11px] text-gray-400 mt-1">Updating your page layout…</p>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
