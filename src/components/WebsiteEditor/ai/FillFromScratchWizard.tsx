import { useState } from "react";
import {
  Sparkles, X, ArrowLeft, ArrowRight,
  CheckCircle2, Loader2,
} from "lucide-react";
import {
  runFillFromScratch,
  type WizardAnswers, type AllSectionContent, type TonePreset,
} from "./mockAI";
import { useAIEditorContext } from "./AIEditorContext";

// ─── Config ───────────────────────────────────────────────────────────────────

const CLINIC_TYPES: {
  value: WizardAnswers["clinicType"];
  label: string;
  emoji: string;
  desc:  string;
}[] = [
  { value: "specialty", label: "Specialty & Emergency",  emoji: "🔬", desc: "Board-certified specialists, ICU & 24/7 ER" },
  { value: "general",   label: "General Practice",       emoji: "🏥", desc: "Wellness, vaccinations & routine care" },
  { value: "exotic",    label: "Exotic & Holistic",      emoji: "🦎", desc: "Exotic pets, acupuncture & alternative care" },
  { value: "network",   label: "Multi-location Network", emoji: "🌐", desc: "Multiple clinics under one brand" },
];

const AUDIENCE_OPTIONS = [
  { value: "dogs_cats", label: "Dogs & Cats",   emoji: "🐕" },
  { value: "exotic",    label: "Exotic Pets",   emoji: "🐰" },
  { value: "large",     label: "Large Animals", emoji: "🐎" },
  { value: "all",       label: "All Welcome",   emoji: "🌍" },
];

const TONE_OPTIONS: { value: TonePreset; label: string; emoji: string; desc: string }[] = [
  { value: "premium",   label: "Premium & Clinical",  emoji: "🏛",  desc: "Prestigious, board-certified, specialist-grade" },
  { value: "friendly",  label: "Warm & Friendly",     emoji: "🐾",  desc: "Approachable, community-focused, family feel" },
  { value: "emergency", label: "Emergency-Focused",   emoji: "🚨",  desc: "Urgent, 24/7, fast-response, critical care" },
];

// ─── Props ────────────────────────────────────────────────────────────────────

interface Props {
  onComplete: (content: AllSectionContent) => void;
  onClose:    () => void;
}

// ─── FillFromScratchWizard ────────────────────────────────────────────────────

export function FillFromScratchWizard({ onComplete, onClose }: Props) {
  const { clinicContext } = useAIEditorContext();
  const clinicName        = clinicContext.name;

  const [step,         setStep]         = useState(0);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isDone,       setIsDone]       = useState(false);

  const [answers, setAnswers] = useState<WizardAnswers>({
    clinicType: "specialty",
    standout:   "",
    audience:   ["dogs_cats"],
    tone:       "friendly",
    promotion:  "",
  });

  const TOTAL = 5;

  const canProceed =
    step === 0 ? true :
    step === 1 ? answers.standout.trim().length > 0 :
    step === 2 ? answers.audience.length > 0 :
    step === 3 ? true :
    true; // step 4 promotion is optional

  async function handleGenerate() {
    setIsGenerating(true);
    try {
      const content = await runFillFromScratch(answers, clinicName);
      setIsDone(true);
      setTimeout(() => { onComplete(content); onClose(); }, 1200);
    } finally {
      setIsGenerating(false);
    }
  }

  function toggleAudience(val: string) {
    setAnswers(a => ({
      ...a,
      audience: a.audience.includes(val)
        ? a.audience.filter(v => v !== val)
        : [...a.audience, val],
    }));
  }

  // ── Shared card button ─────────────────────────────────────────────────────

  function CardButton({
    selected, emoji, label, desc, onClick,
  }: { selected: boolean; emoji: string; label: string; desc: string; onClick: () => void }) {
    return (
      <button
        type="button"
        onClick={onClick}
        className={[
          "flex items-center gap-3 px-4 py-3 rounded-xl border text-left transition-all",
          "focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400",
          selected
            ? "border-indigo-400 bg-indigo-50"
            : "border-gray-200 hover:border-gray-300 bg-white",
        ].join(" ")}
      >
        <span className="text-xl shrink-0">{emoji}</span>
        <div className="flex-1 min-w-0">
          <p className={`text-xs font-semibold leading-snug ${selected ? "text-indigo-700" : "text-gray-800"}`}>
            {label}
          </p>
          <p className="text-[10px] text-gray-400 mt-0.5">{desc}</p>
        </div>
        {selected && <CheckCircle2 className="w-4 h-4 text-indigo-500 shrink-0" />}
      </button>
    );
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.65)", backdropFilter: "blur(4px)" }}
    >
      <div
        className="w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden relative"
        style={{ boxShadow: "0 24px 80px rgba(0,0,0,0.25), 0 0 0 1px rgba(0,0,0,0.08)" }}
      >
        {/* Accent line */}
        <div
          className="h-[3px] w-full shrink-0"
          style={{ background: "linear-gradient(90deg, #4f46e5 0%, #3b82f6 55%, #67e8f9 100%)" }}
        />

        {/* Header */}
        <div className="px-6 pt-5 pb-4 flex items-start justify-between">
          <div className="flex items-center gap-3">
            <span
              className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
              style={{ background: "linear-gradient(135deg, #4f46e5 0%, #3b82f6 100%)" }}
            >
              <Sparkles className="w-4 h-4 text-white" />
            </span>
            <div>
              <p className="text-sm font-bold text-gray-900 leading-none">Fill from Scratch</p>
              <p className="text-[11px] text-gray-400 mt-0.5">
                5 quick questions → AI fills every section at once
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-300 hover:text-gray-500 hover:bg-gray-100 transition-colors"
            aria-label="Close wizard"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Progress bar */}
        <div className="px-6 pb-4 flex items-center gap-1.5">
          {Array.from({ length: TOTAL }).map((_, i) => (
            <div
              key={i}
              className="h-1 rounded-full transition-all duration-300"
              style={{
                flex:       i <= step ? 2 : 1,
                background: i < step ? "#4f46e5" : i === step ? "#818cf8" : "#e5e7eb",
              }}
            />
          ))}
          <span className="text-[10px] text-gray-400 ml-1 shrink-0">
            {step + 1} / {TOTAL}
          </span>
        </div>

        {/* Step content */}
        <div className="px-6 pb-2 min-h-[260px]">

          {/* Step 0 — Clinic type */}
          {step === 0 && (
            <div className="flex flex-col gap-2.5">
              <p className="text-sm font-semibold text-gray-800 mb-1">What type of clinic are you?</p>
              {CLINIC_TYPES.map(opt => (
                <CardButton
                  key={opt.value}
                  selected={answers.clinicType === opt.value}
                  emoji={opt.emoji}
                  label={opt.label}
                  desc={opt.desc}
                  onClick={() => setAnswers(a => ({ ...a, clinicType: opt.value }))}
                />
              ))}
            </div>
          )}

          {/* Step 1 — Standout */}
          {step === 1 && (
            <div className="flex flex-col gap-3">
              <p className="text-sm font-semibold text-gray-800">
                What makes <span className="text-indigo-600">{clinicName}</span> stand out?
              </p>
              <p className="text-[11px] text-gray-400 -mt-1">
                This becomes the core of your headline and hero subheadline.
              </p>
              <textarea
                value={answers.standout}
                onChange={e => setAnswers(a => ({ ...a, standout: e.target.value }))}
                rows={4}
                placeholder="e.g. 3 board-certified specialists, open 24/7, cutting-edge MRI, serving Austin for 15 years…"
                className="w-full px-3 py-2.5 text-sm text-gray-800 bg-gray-50 border border-gray-200 rounded-xl resize-none focus:outline-none focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100 placeholder:text-gray-400 leading-relaxed"
                // eslint-disable-next-line jsx-a11y/no-autofocus
                autoFocus
              />
              <p className="text-[10px] text-gray-400">
                Tip: be specific — "3 board-certified surgeons" beats "great surgeons"
              </p>
            </div>
          )}

          {/* Step 2 — Audience */}
          {step === 2 && (
            <div className="flex flex-col gap-3">
              <p className="text-sm font-semibold text-gray-800">Who are your primary clients?</p>
              <p className="text-[11px] text-gray-400 -mt-1 mb-1">Select all that apply.</p>
              <div className="grid grid-cols-2 gap-2">
                {AUDIENCE_OPTIONS.map(opt => {
                  const selected = answers.audience.includes(opt.value);
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => toggleAudience(opt.value)}
                      className={[
                        "flex items-center gap-2 px-3 py-3 rounded-xl border text-xs font-medium transition-all",
                        "focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400",
                        selected
                          ? "border-indigo-400 bg-indigo-50 text-indigo-700"
                          : "border-gray-200 bg-white text-gray-700 hover:border-gray-300",
                      ].join(" ")}
                    >
                      <span className="text-base">{opt.emoji}</span>
                      {opt.label}
                      {selected && <CheckCircle2 className="w-3.5 h-3.5 ml-auto shrink-0 text-indigo-500" />}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Step 3 — Brand tone */}
          {step === 3 && (
            <div className="flex flex-col gap-2.5">
              <p className="text-sm font-semibold text-gray-800 mb-1">What's your brand voice?</p>
              <p className="text-[11px] text-gray-400 -mt-1 mb-1">
                AI will write all sections to match this tone.
              </p>
              {TONE_OPTIONS.map(opt => (
                <CardButton
                  key={opt.value}
                  selected={answers.tone === opt.value}
                  emoji={opt.emoji}
                  label={opt.label}
                  desc={opt.desc}
                  onClick={() => setAnswers(a => ({ ...a, tone: opt.value }))}
                />
              ))}
            </div>
          )}

          {/* Step 4 — Promotions (optional) */}
          {step === 4 && (
            <div className="flex flex-col gap-3">
              <p className="text-sm font-semibold text-gray-800">
                Any active promotions or news?{" "}
                <span className="text-gray-400 font-normal">(optional)</span>
              </p>
              <p className="text-[11px] text-gray-400 -mt-1">
                AI will feature this in your hero badge and opening line.
              </p>
              <textarea
                value={answers.promotion ?? ""}
                onChange={e => setAnswers(a => ({ ...a, promotion: e.target.value }))}
                rows={3}
                placeholder="e.g. Dental Health Month — 20% off cleanings through February…"
                className="w-full px-3 py-2.5 text-sm text-gray-800 bg-gray-50 border border-gray-200 rounded-xl resize-none focus:outline-none focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100 placeholder:text-gray-400 leading-relaxed"
              />

              {/* Summary */}
              <div className="p-3 rounded-xl bg-indigo-50/60 border border-indigo-100 mt-1">
                <p className="text-[10px] font-semibold text-indigo-500 uppercase tracking-wide mb-2">
                  Ready to generate
                </p>
                <div className="flex flex-col gap-1">
                  {[
                    ["Clinic",    clinicName],
                    ["Type",     CLINIC_TYPES.find(t => t.value === answers.clinicType)?.label ?? ""],
                    ["Tone",     TONE_OPTIONS.find(t => t.value === answers.tone)?.label ?? ""],
                    ["Audience", answers.audience.map(a => AUDIENCE_OPTIONS.find(o => o.value === a)?.label).join(", ")],
                  ].map(([k, v]) => (
                    <p key={k} className="text-[11px] text-gray-600">
                      <span className="font-medium">{k}:</span> {v}
                    </p>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Generating overlay */}
          {isGenerating && (
            <div className="absolute inset-x-0 bottom-0 top-[108px] flex flex-col items-center justify-center gap-4 bg-white/96 z-10 rounded-b-2xl">
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg"
                style={{ background: "linear-gradient(135deg, #4f46e5, #3b82f6)" }}
              >
                <Sparkles className="w-6 h-6 text-white animate-pulse" />
              </div>
              <div className="text-center">
                <p className="text-sm font-semibold text-gray-800">Writing your pages…</p>
                <p className="text-[11px] text-gray-400 mt-1">AI is filling 7 sections simultaneously</p>
              </div>
              <Loader2 className="w-5 h-5 text-indigo-400 animate-spin" />
            </div>
          )}

          {/* Done overlay */}
          {isDone && !isGenerating && (
            <div className="absolute inset-x-0 bottom-0 top-[108px] flex flex-col items-center justify-center gap-3 bg-white/96 z-10 rounded-b-2xl">
              <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6 text-green-500" />
              </div>
              <p className="text-sm font-semibold text-gray-800">All sections filled!</p>
              <p className="text-[11px] text-gray-400">Applying content to your page…</p>
            </div>
          )}
        </div>

        {/* Footer navigation */}
        {!isGenerating && !isDone && (
          <div className="px-6 pb-6 pt-4 flex items-center justify-between border-t border-gray-100 mt-4">
            <button
              type="button"
              onClick={() => setStep(s => Math.max(0, s - 1))}
              disabled={step === 0}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium text-gray-500 hover:bg-gray-100 disabled:opacity-0 transition-all"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Back
            </button>

            {step < TOTAL - 1 ? (
              <button
                type="button"
                onClick={() => setStep(s => s + 1)}
                disabled={!canProceed}
                className={[
                  "flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold transition-all",
                  canProceed
                    ? "bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm"
                    : "bg-gray-100 text-gray-400 cursor-not-allowed",
                ].join(" ")}
              >
                Continue
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleGenerate}
                className="flex items-center gap-2 px-5 py-2 rounded-lg text-xs font-bold text-white shadow-md hover:shadow-lg transition-all active:scale-95"
                style={{ background: "linear-gradient(135deg, #4f46e5, #3b82f6)" }}
              >
                <Sparkles className="w-3.5 h-3.5" />
                Generate All Sections
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
