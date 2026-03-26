/**
 * NavigationEditor
 *
 * Right-panel editor for navigation bar settings (colorScheme, sticky,
 * transparency, showClinicName, CTA button).  Edits NavConfigCtx in
 * ClinicContext — changes are instantly reflected in the live preview.
 */

import type { NavConfigCtx } from "../../../context/ClinicContext";

// ─── Shared style tokens ──────────────────────────────────────────────────────

const INPUT =
  "w-full h-8 px-2.5 text-sm text-gray-900 bg-white border border-gray-200 rounded-md " +
  "placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-600 " +
  "focus:border-teal-600 transition-colors";

const LABEL = "block text-xs font-medium text-gray-600 mb-1";

// ─── MiniToggle ───────────────────────────────────────────────────────────────

function MiniToggle({
  label,
  description,
  checked,
  onChange,
}: {
  label: string;
  description?: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-start justify-between gap-3 py-1.5">
      <div className="min-w-0">
        <p className="text-xs font-medium text-gray-700 leading-tight">{label}</p>
        {description && (
          <p className="text-[10px] text-gray-400 mt-0.5 leading-snug">{description}</p>
        )}
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={label}
        onClick={() => onChange(!checked)}
        className={[
          "relative inline-flex h-4 w-7 shrink-0 rounded-full border-2 border-transparent transition-colors mt-0.5",
          "focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-600",
          checked ? "bg-teal-600" : "bg-gray-200",
        ].join(" ")}
      >
        <span
          className={`inline-block h-3 w-3 rounded-full bg-white shadow transform transition-transform ${
            checked ? "translate-x-3" : "translate-x-0"
          }`}
        />
      </button>
    </div>
  );
}

// ─── ColorSchemeSelector ──────────────────────────────────────────────────────

const SCHEME_OPTIONS: { value: NavConfigCtx["colorScheme"]; label: string; bg: string; text: string; border: string }[] = [
  { value: "light", label: "Light", bg: "#ffffff", text: "#111827", border: "#e5e7eb" },
  { value: "dark",  label: "Dark",  bg: "#111827", text: "#ffffff", border: "#374151" },
  { value: "brand", label: "Brand", bg: "teal-600", text: "#ffffff", border: "teal-600" },
];

function ColorSchemeSelector({
  value,
  onChange,
}: {
  value: NavConfigCtx["colorScheme"];
  onChange: (v: NavConfigCtx["colorScheme"]) => void;
}) {
  return (
    <div>
      <p className={LABEL}>Color scheme</p>
      <div className="flex gap-2">
        {SCHEME_OPTIONS.map(opt => (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(opt.value)}
            title={opt.label}
            className={[
              "flex-1 flex flex-col items-center gap-1 py-2 rounded-lg border-2 transition-all",
              "focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-600",
              value === opt.value
                ? "border-teal-600 shadow-sm"
                : "border-gray-200 hover:border-gray-300",
            ].join(" ")}
          >
            {/* Mini nav preview swatch */}
            <div
              className="w-full h-5 rounded-sm flex items-center justify-between px-1.5"
              style={{ background: opt.bg, border: `1px solid ${opt.border}` }}
            >
              <span className="block w-3 h-1 rounded-full" style={{ background: opt.text, opacity: 0.7 }} />
              <span className="block w-1.5 h-1 rounded-full" style={{ background: opt.text, opacity: 0.4 }} />
            </div>
            <span
              className={`text-[10px] font-medium ${
                value === opt.value ? "text-teal-600" : "text-gray-500"
              }`}
            >
              {opt.label}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── NavigationEditor ─────────────────────────────────────────────────────────

interface NavigationEditorProps {
  config: NavConfigCtx;
  onChange: (patch: Partial<NavConfigCtx>) => void;
}

export function NavigationEditor({ config, onChange }: NavigationEditorProps) {
  return (
    <div className="flex flex-col gap-5 px-4 pb-5 pt-3">

      {/* ── Appearance ── */}
      <section>
        <p className="text-[9px] font-bold tracking-widest text-gray-400 uppercase mb-3">
          Appearance
        </p>
        <ColorSchemeSelector
          value={config.colorScheme}
          onChange={(v) => onChange({ colorScheme: v })}
        />
      </section>

      {/* ── Behaviour ── */}
      <section className="flex flex-col gap-0.5 p-3 bg-gray-50 rounded-xl border border-gray-100">
        <p className="text-[9px] font-bold tracking-widest text-gray-400 uppercase mb-1">
          Behaviour
        </p>
        <MiniToggle
          label="Sticky navigation"
          description="Bar stays at the top while the user scrolls"
          checked={config.isSticky}
          onChange={(v) => onChange({ isSticky: v })}
        />
        <div className="h-px bg-gray-200 my-0.5" />
        <MiniToggle
          label="Transparent on scroll top"
          description="Nav is transparent when the page is at the very top"
          checked={config.isTransparentOnScroll}
          onChange={(v) => onChange({ isTransparentOnScroll: v })}
        />
        <div className="h-px bg-gray-200 my-0.5" />
        <MiniToggle
          label="Show clinic name"
          description="Displays the clinic name next to the logo"
          checked={config.showClinicName}
          onChange={(v) => onChange({ showClinicName: v })}
        />
      </section>

      {/* ── CTA button ── */}
      <section>
        <p className="text-[9px] font-bold tracking-widest text-gray-400 uppercase mb-3">
          CTA Button
        </p>
        <div className="flex flex-col gap-3">
          <div>
            <label className={LABEL}>Button label</label>
            <input
              type="text"
              value={config.ctaLabel}
              onChange={(e) => onChange({ ctaLabel: e.target.value })}
              className={INPUT}
              placeholder="Book Appointment"
            />
          </div>
          <div>
            <label className={LABEL}>Button URL</label>
            <input
              type="text"
              value={config.ctaHref}
              onChange={(e) => onChange({ ctaHref: e.target.value })}
              className={INPUT}
              placeholder="/book"
            />
            {!config.ctaHref && (
              <p className="text-[10px] text-gray-400 mt-1.5">
                Leave empty to hide the CTA button
              </p>
            )}
          </div>
        </div>
      </section>

      {/* ── Link management hint ── */}
      <div className="flex gap-2.5 p-3 rounded-xl border border-dashed border-gray-200 bg-gray-50/80">
        <div>
          <p className="text-xs font-semibold text-gray-700 leading-snug">
            Navigation links
          </p>
          <p className="text-[10px] text-gray-400 mt-0.5 leading-relaxed">
            Links are managed in the <strong>Pages</strong> tab on the left. Toggle a
            page's nav mode to <em>Top</em>, <em>Sub</em>, or <em>Hidden</em> — the
            preview updates instantly.
          </p>
        </div>
      </div>

    </div>
  );
}
