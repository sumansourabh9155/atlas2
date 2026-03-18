// ─── Email Capture Section ────────────────────────────────────────────────────
// Newsletter / email signup section with centered or side-by-side layout.

const NAVY  = "#1B2B4B";
const TEAL  = "#0F766E";
const AMBER = "#F59E0B";

const INPUT =
  "w-full h-8 px-2.5 text-sm text-gray-900 bg-white border border-gray-200 rounded-md " +
  "placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#003459] " +
  "focus:border-[#003459] transition-colors";

const LABEL = "block text-xs font-medium text-gray-600 mb-1";

const TEXTAREA =
  "w-full px-2.5 py-1.5 text-sm text-gray-900 bg-white border border-gray-200 rounded-md " +
  "placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#003459] " +
  "focus:border-[#003459] transition-colors resize-none";

// ─── State ────────────────────────────────────────────────────────────────────

export interface EmailCaptureState {
  headline:      string;
  subtext:       string;
  placeholder:   string;
  ctaLabel:      string;
  disclaimer:    string;
  layout:        "centered" | "side_by_side";
  bgStyle:       "white" | "light" | "teal" | "navy" | "dark";
  showNameField: boolean;
}

export function createDefaultEmailCapture(): EmailCaptureState {
  return {
    headline:      "Stay in the Loop",
    subtext:       "Get pet health tips, seasonal wellness reminders, and clinic updates delivered to your inbox.",
    placeholder:   "Enter your email address",
    ctaLabel:      "Subscribe",
    disclaimer:    "No spam. Unsubscribe anytime.",
    layout:        "centered",
    bgStyle:       "light",
    showNameField: false,
  };
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getBg(bgStyle: string): string {
  switch (bgStyle) {
    case "white": return "#ffffff";
    case "light": return "#f8f9fb";
    case "teal":  return TEAL;
    case "navy":  return NAVY;
    case "dark":  return "#1e293b";
    default:      return "#f8f9fb";
  }
}

function isDarkBg(bgStyle: string): boolean {
  return bgStyle === "teal" || bgStyle === "navy" || bgStyle === "dark";
}

function getButtonStyle(bgStyle: string) {
  const dark = isDarkBg(bgStyle);
  if (dark) return { background: "#ffffff", color: bgStyle === "teal" ? TEAL : NAVY };
  return { background: TEAL, color: "#ffffff" };
}

// ─── Renderer ─────────────────────────────────────────────────────────────────

interface RendererProps {
  state:    EmailCaptureState;
  isDark?:  boolean;
  compact?: boolean;
}

export function EmailCaptureSectionRenderer({ state, isDark: _isDark, compact }: RendererProps) {
  const bg      = getBg(state.bgStyle);
  const dark    = isDarkBg(state.bgStyle);
  const textCol = dark ? "#ffffff"    : "#111827";
  const subCol  = dark ? "rgba(255,255,255,0.75)" : "#6b7280";
  const discCol = dark ? "rgba(255,255,255,0.5)"  : "#9ca3af";
  const btnStyle = getButtonStyle(state.bgStyle);
  const inputBg  = dark ? "rgba(255,255,255,0.15)" : "#ffffff";
  const inputBdr = dark ? "rgba(255,255,255,0.25)" : "#d1d5db";

  const isSideBySide = state.layout === "side_by_side" && !compact;

  const inputBlock = (
    <div className="flex flex-col gap-2" style={{ minWidth: 0 }}>
      {state.showNameField && (
        <input
          disabled
          placeholder="First name"
          className="h-10 px-4 rounded-xl text-sm w-full"
          style={{ background: inputBg, border: `1px solid ${inputBdr}`, color: dark ? "#fff" : "#111" }}
        />
      )}
      <div className="flex gap-2">
        <input
          disabled
          placeholder={state.placeholder}
          className="flex-1 min-w-0 h-10 px-4 rounded-xl text-sm"
          style={{ background: inputBg, border: `1px solid ${inputBdr}`, color: dark ? "#fff" : "#111" }}
        />
        <button
          type="button"
          disabled
          className="shrink-0 h-10 px-5 rounded-xl text-sm font-bold transition-all"
          style={btnStyle}
        >
          {state.ctaLabel}
        </button>
      </div>
      {state.disclaimer && (
        <p className="text-xs text-center" style={{ color: discCol }}>{state.disclaimer}</p>
      )}
    </div>
  );

  return (
    <section
      style={{ background: bg, padding: compact ? "40px 20px" : "72px 32px" }}
    >
      <div
        className={isSideBySide ? "max-w-4xl mx-auto flex items-center gap-12" : "max-w-xl mx-auto text-center"}
      >
        {/* Text block */}
        <div className={isSideBySide ? "flex-1 min-w-0" : "mb-6"}>
          <h2
            className="font-extrabold leading-tight"
            style={{
              color:    textCol,
              fontSize: compact ? "1.25rem" : "1.875rem",
              marginBottom: "12px",
            }}
          >
            {state.headline}
          </h2>
          {state.subtext && (
            <p
              className="leading-relaxed"
              style={{
                color:    subCol,
                fontSize: compact ? "0.8125rem" : "1rem",
                marginBottom: isSideBySide ? 0 : "24px",
              }}
            >
              {state.subtext}
            </p>
          )}
        </div>

        {/* Input block (side-by-side or below) */}
        {isSideBySide ? (
          <div className="flex-1 min-w-0">{inputBlock}</div>
        ) : (
          inputBlock
        )}
      </div>
    </section>
  );
}

// ─── Editor ───────────────────────────────────────────────────────────────────

interface EditorProps {
  state:    EmailCaptureState;
  onChange: (patch: Partial<EmailCaptureState>) => void;
}

const BG_OPTIONS: { value: EmailCaptureState["bgStyle"]; label: string }[] = [
  { value: "white", label: "White"      },
  { value: "light", label: "Light Gray" },
  { value: "teal",  label: "Teal"       },
  { value: "navy",  label: "Navy"       },
  { value: "dark",  label: "Dark"       },
];

export function EmailCaptureEditor({ state, onChange }: EditorProps) {
  return (
    <div className="flex flex-col gap-4 px-4 pb-4 pt-1">

      {/* Background */}
      <div>
        <label className={LABEL}>Background</label>
        <select
          value={state.bgStyle}
          onChange={e => onChange({ bgStyle: e.target.value as EmailCaptureState["bgStyle"] })}
          className={INPUT}
        >
          {BG_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      </div>

      {/* Layout */}
      <div>
        <label className={LABEL}>Layout</label>
        <div className="flex gap-2">
          {(["centered", "side_by_side"] as const).map(l => (
            <button
              key={l}
              type="button"
              onClick={() => onChange({ layout: l })}
              className={[
                "flex-1 h-8 rounded-md border text-xs font-semibold transition-all",
                state.layout === l
                  ? "bg-[#003459] text-white border-[#003459]"
                  : "border-gray-200 text-gray-600 hover:border-gray-300",
              ].join(" ")}
            >
              {l === "centered" ? "Centered" : "Side by Side"}
            </button>
          ))}
        </div>
      </div>

      {/* Headline */}
      <div>
        <label className={LABEL}>Headline</label>
        <input
          value={state.headline}
          onChange={e => onChange({ headline: e.target.value })}
          className={INPUT}
          placeholder="Stay in the Loop"
        />
      </div>

      {/* Subtext */}
      <div>
        <label className={LABEL}>Subtext</label>
        <textarea
          value={state.subtext}
          onChange={e => onChange({ subtext: e.target.value })}
          rows={3}
          className={TEXTAREA}
          placeholder="Get updates from our clinic…"
        />
      </div>

      {/* Email placeholder */}
      <div>
        <label className={LABEL}>Input Placeholder</label>
        <input
          value={state.placeholder}
          onChange={e => onChange({ placeholder: e.target.value })}
          className={INPUT}
          placeholder="Enter your email address"
        />
      </div>

      {/* CTA label */}
      <div>
        <label className={LABEL}>Button Label</label>
        <input
          value={state.ctaLabel}
          onChange={e => onChange({ ctaLabel: e.target.value })}
          className={INPUT}
          placeholder="Subscribe"
        />
      </div>

      {/* Disclaimer */}
      <div>
        <label className={LABEL}>Disclaimer (optional)</label>
        <input
          value={state.disclaimer}
          onChange={e => onChange({ disclaimer: e.target.value })}
          className={INPUT}
          placeholder="No spam. Unsubscribe anytime."
        />
      </div>

      {/* Show name field toggle */}
      <div className="flex items-center justify-between py-1">
        <span className="text-xs font-medium text-gray-600">Show "First Name" field</span>
        <button
          type="button"
          role="switch"
          aria-checked={state.showNameField}
          onClick={() => onChange({ showNameField: !state.showNameField })}
          className={[
            "relative inline-flex h-5 w-9 rounded-full border-2 border-transparent transition-colors",
            "focus:outline-none focus-visible:ring-2 focus-visible:ring-[#003459]",
            state.showNameField ? "bg-[#003459]" : "bg-gray-200",
          ].join(" ")}
        >
          <span
            className={[
              "inline-block h-4 w-4 rounded-full bg-white shadow transform transition-transform",
              state.showNameField ? "translate-x-4" : "translate-x-0",
            ].join(" ")}
          />
        </button>
      </div>

    </div>
  );
}

// ─── Thumbnail ────────────────────────────────────────────────────────────────

export function EmailCaptureThumbnail() {
  return (
    <div
      className="w-full h-full flex flex-col items-center justify-center gap-1.5 px-2"
      style={{ background: NAVY, borderRadius: 4 }}
    >
      <span style={{ fontSize: "14px" }}>📧</span>
      <div className="flex flex-col items-center gap-1 w-full max-w-[80px]">
        <div style={{ height: 4, width: "70%", borderRadius: 2, background: "rgba(255,255,255,0.85)" }} />
        <div style={{ height: 3, width: "90%", borderRadius: 2, background: "rgba(255,255,255,0.4)" }} />
        <div style={{ height: 3, width: "80%", borderRadius: 2, background: "rgba(255,255,255,0.4)" }} />
      </div>
      <div className="flex gap-1 w-full max-w-[90px]">
        <div style={{ flex: 1, height: 7, borderRadius: 3, background: "rgba(255,255,255,0.2)", border: "1px solid rgba(255,255,255,0.25)" }} />
        <div style={{ width: 22, height: 7, borderRadius: 3, background: TEAL }} />
      </div>
    </div>
  );
}
