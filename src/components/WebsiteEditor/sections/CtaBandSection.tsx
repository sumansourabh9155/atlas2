// ─── CTA Band Section ─────────────────────────────────────────────────────────
// Full-width call-to-action banner: headline + subtext + button.

const NAVY = "#1B2B4B";
const TEAL = "#0F766E";
const AMBER = "#F59E0B";

import { input as inputTokens } from "../../../lib/styles/tokens";

const INPUT = inputTokens.compact;

const LABEL = "block text-xs font-medium text-gray-600 mb-1";

// ─── State ────────────────────────────────────────────────────────────────────

export interface CtaBandState {
  headline: string;
  subtext: string;
  ctaLabel: string;
  ctaHref: string;
  style: "teal" | "navy" | "amber";
}

export function createDefaultCtaBand(): CtaBandState {
  return {
    headline: "Ready to schedule your pet's visit?",
    subtext: "Our board-certified specialists are accepting new patients. Same-day emergency slots available.",
    ctaLabel: "Book an Appointment",
    ctaHref: "#",
    style: "teal",
  };
}

// ─── Renderer ─────────────────────────────────────────────────────────────────

export function CtaBandSectionRenderer({
  state, isDark, compact,
}: { state: CtaBandState; isDark?: boolean; compact?: boolean }) {
  const bgMap: Record<CtaBandState["style"], string> = {
    teal: TEAL,
    navy: NAVY,
    amber: AMBER,
  };
  const bg = bgMap[state.style];
  const isAmber = state.style === "amber";
  const btnBg   = isAmber ? NAVY : "#ffffff";
  const btnColor = isAmber ? "#ffffff" : (state.style === "teal" ? TEAL : NAVY);

  return (
    <section
      className="px-6"
      style={{
        background: bg,
        borderTop: `1px solid rgba(255,255,255,0.08)`,
        paddingTop: compact ? "32px" : "48px",
        paddingBottom: compact ? "32px" : "48px",
      }}
      aria-label="CTA Band"
    >
      <div className="max-w-4xl mx-auto flex flex-col items-center text-center gap-4">
        {/* Headline */}
        <h2
          className={`font-extrabold leading-tight ${compact ? "text-xl" : "text-2xl"}`}
          style={{ color: isAmber ? NAVY : "#ffffff" }}
        >
          {state.headline}
        </h2>

        {/* Subtext */}
        {state.subtext && (
          <p
            className="text-sm max-w-lg leading-relaxed"
            style={{ color: isAmber ? "rgba(27,43,75,0.72)" : "rgba(255,255,255,0.75)" }}
          >
            {state.subtext}
          </p>
        )}

        {/* CTA Button */}
        <a
          href={state.ctaHref}
          className="inline-block mt-2 px-6 py-2.5 rounded-lg text-sm font-bold shadow-sm transition-opacity hover:opacity-90"
          style={{ background: btnBg, color: btnColor }}
        >
          {state.ctaLabel}
        </a>
      </div>
    </section>
  );
}

// ─── Editor ───────────────────────────────────────────────────────────────────

export function CtaBandEditor({
  state, onChange,
}: { state: CtaBandState; onChange: (u: Partial<CtaBandState>) => void }) {
  return (
    <div className="flex flex-col gap-4 px-4 pb-4 pt-1">
      <div>
        <label className={LABEL}>Style</label>
        <select
          value={state.style}
          onChange={(e) => onChange({ style: e.target.value as CtaBandState["style"] })}
          className={INPUT}
        >
          <option value="teal">Teal</option>
          <option value="navy">Navy</option>
          <option value="amber">Amber / Gold</option>
        </select>
      </div>

      <div>
        <label className={LABEL}>Headline</label>
        <input
          type="text"
          value={state.headline}
          onChange={(e) => onChange({ headline: e.target.value })}
          className={INPUT}
          placeholder="Ready to schedule your pet's visit?"
        />
      </div>

      <div>
        <label className={LABEL}>Supporting text</label>
        <textarea
          value={state.subtext}
          onChange={(e) => onChange({ subtext: e.target.value })}
          rows={2}
          className="w-full px-2.5 py-1.5 text-sm text-gray-900 bg-white border border-gray-200 rounded-md placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-600 focus:border-teal-600 transition-colors resize-none"
          placeholder="Short description…"
        />
      </div>

      <div>
        <label className={LABEL}>Button label</label>
        <input
          type="text"
          value={state.ctaLabel}
          onChange={(e) => onChange({ ctaLabel: e.target.value })}
          className={INPUT}
          placeholder="Book an Appointment"
        />
      </div>

      <div>
        <label className={LABEL}>Button link</label>
        <input
          type="text"
          value={state.ctaHref}
          onChange={(e) => onChange({ ctaHref: e.target.value })}
          className={INPUT}
          placeholder="#contact"
        />
      </div>
    </div>
  );
}

// ─── Thumbnail ─────────────────────────────────────────────────────────────────

export function CtaBandThumbnail() {
  return (
    <div className="flex flex-col items-center justify-center h-full gap-[3px] px-2" style={{ background: TEAL }}>
      <span className="text-[7.5px] font-bold text-white leading-tight text-center">Ready to book your pet's visit?</span>
      <span className="text-[5px] leading-tight text-center" style={{ color: "rgba(255,255,255,0.65)" }}>Same-day appointments · Open 24/7</span>
      <div className="flex gap-1 mt-1">
        <span className="text-[5.5px] font-bold rounded-full px-2 py-[2px]" style={{ background: "#fff", color: TEAL }}>Book Now</span>
        <span className="text-[5.5px] font-medium text-white rounded-full px-2 py-[2px] border" style={{ borderColor: "rgba(255,255,255,0.4)" }}>Learn More</span>
      </div>
    </div>
  );
}
