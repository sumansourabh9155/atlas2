import { AlignCenter, AlignLeft, Columns } from "lucide-react";
import type { HeroEditorState, CtaState } from "../WebsiteEditorPage";
import { AITextField, AITextarea } from "../ai/AITextField";

const INPUT =
  "w-full h-8 px-2.5 text-sm text-gray-900 bg-white border border-gray-200 rounded-md " +
  "placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#003459] " +
  "focus:border-[#003459] transition-colors";

const LABEL = "block text-xs font-medium text-gray-600 mb-1";

// ── Layout picker options ──────────────────────────────────────────────────────

const LAYOUTS: {
  value: HeroEditorState["layout"];
  label: string;
  Icon:  React.ElementType;
}[] = [
  { value: "centered",           label: "Centered", Icon: AlignCenter },
  { value: "left_aligned",       label: "Left",     Icon: AlignLeft   },
  { value: "split_image_right",  label: "Split",    Icon: Columns     },
];

// ── CtaRow ────────────────────────────────────────────────────────────────────

function CtaRow({
  label,
  value,
  onChange,
  fieldKeyPrefix,
}: {
  label:          string;
  value:          CtaState;
  onChange:       (v: CtaState) => void;
  fieldKeyPrefix: string;
}) {
  return (
    <div className="flex flex-col gap-2">
      {/* Toggle row */}
      <div className="flex items-center justify-between">
        <span className={LABEL}>{label}</span>
        <button
          type="button"
          role="switch"
          aria-checked={value.enabled}
          aria-label={`${label} enabled`}
          onClick={() => onChange({ ...value, enabled: !value.enabled })}
          className={`relative inline-flex h-4 w-7 shrink-0 rounded-full border-2 border-transparent
            transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#003459]
            ${value.enabled ? "bg-[#003459]" : "bg-gray-200"}`}
        >
          <span
            className={`inline-block h-3 w-3 rounded-full bg-white shadow transform transition-transform
              ${value.enabled ? "translate-x-3" : "translate-x-0"}`}
          />
        </button>
      </div>

      {value.enabled && (
        <div className="flex flex-col gap-1.5 pl-2 border-l-2 border-gray-100">
          {/* AI-powered label field */}
          <AITextField
            value={value.label}
            onChange={(v) => onChange({ ...value, label: v })}
            fieldKey={`${fieldKeyPrefix}.label`}
            placeholder="Button label"
          />
          {/* URL field — no AI needed */}
          <input
            type="text"
            value={value.href}
            onChange={(e) => onChange({ ...value, href: e.target.value })}
            className={`${INPUT} font-mono text-xs`}
            placeholder="#anchor or /path"
          />
        </div>
      )}
    </div>
  );
}

// ── Divider ───────────────────────────────────────────────────────────────────

function Divider({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-2 py-1">
      <div className="flex-1 h-px bg-gray-100" />
      <span className="text-[10px] font-semibold uppercase tracking-widest text-gray-400">
        {label}
      </span>
      <div className="flex-1 h-px bg-gray-100" />
    </div>
  );
}

// ── HeroEditor ────────────────────────────────────────────────────────────────

interface Props {
  state:        HeroEditorState;
  onChange:     (updates: Partial<HeroEditorState>) => void;
  primaryColor: string;
}

export function HeroEditor({ state, onChange, primaryColor }: Props) {
  return (
    <div className="flex flex-col gap-4 px-4 pb-5 pt-1">

      {/* ── Content ── */}
      <Divider label="Content" />

      {/* Badge */}
      <div>
        <label className={LABEL}>Badge / Eyebrow text</label>
        <AITextField
          value={state.badgeText}
          onChange={(v) => onChange({ badgeText: v })}
          fieldKey="badgeText"
          placeholder="⭐ Rated #1 in Austin — 2024"
        />
      </div>

      {/* Headline */}
      <div>
        <div className="flex items-baseline justify-between mb-1">
          <label className={LABEL}>Heading</label>
          <span className="text-[10px] text-gray-400">
            {state.headline.length}/120
          </span>
        </div>
        <AITextarea
          value={state.headline}
          onChange={(v) => onChange({ headline: v })}
          fieldKey="headline"
          rows={2}
          maxLength={120}
          placeholder="Advanced Care for the Pets You Love"
          className={`${INPUT} h-auto py-2 resize-none leading-snug`}
        />
      </div>

      {/* Subheadline */}
      <div>
        <div className="flex items-baseline justify-between mb-1">
          <label className={LABEL}>Subheading</label>
          <span className="text-[10px] text-gray-400">
            {state.subheadline.length}/240
          </span>
        </div>
        <AITextarea
          value={state.subheadline}
          onChange={(v) => onChange({ subheadline: v })}
          fieldKey="subheadline"
          rows={3}
          maxLength={240}
          placeholder="Your clinic's mission statement or key value prop."
          className={`${INPUT} h-auto py-2 resize-none leading-relaxed`}
        />
      </div>

      {/* ── Background ── */}
      <Divider label="Background" />

      <div>
        <label className={LABEL}>Image URL</label>
        <input
          type="url"
          value={state.backgroundValue}
          onChange={(e) => onChange({ backgroundValue: e.target.value })}
          className={`${INPUT} font-mono text-xs`}
          placeholder="https://images.unsplash.com/…"
        />
      </div>

      {/* Overlay opacity */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className={LABEL}>Overlay darkness</label>
          <span className="text-xs font-semibold tabular-nums" style={{ color: primaryColor }}>
            {Math.round(state.overlayOpacity * 100)}%
          </span>
        </div>
        <input
          type="range"
          min={0}
          max={100}
          step={5}
          value={Math.round(state.overlayOpacity * 100)}
          onChange={(e) =>
            onChange({ overlayOpacity: Number(e.target.value) / 100 })
          }
          className="w-full h-1.5 rounded-full appearance-none cursor-pointer accent-[#003459] bg-gray-200"
          aria-label="Overlay opacity"
        />
        <div className="flex justify-between mt-1 text-[10px] text-gray-400">
          <span>Light</span>
          <span>Dark</span>
        </div>
      </div>

      {/* ── Layout ── */}
      <Divider label="Layout" />

      <div>
        <label className={LABEL}>Content alignment</label>
        <div className="grid grid-cols-3 gap-1.5 mt-1">
          {LAYOUTS.map(({ value, label, Icon }) => {
            const active = state.layout === value;
            return (
              <button
                key={value}
                type="button"
                onClick={() => onChange({ layout: value })}
                aria-pressed={active}
                className={[
                  "flex flex-col items-center gap-1 py-2.5 rounded-lg border text-xs font-medium",
                  "transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-[#003459]",
                  active
                    ? "border-[#003459] bg-blue-50 text-[#003459] shadow-sm"
                    : "border-gray-200 bg-white text-gray-500 hover:border-gray-300 hover:text-gray-700",
                ].join(" ")}
              >
                <Icon className="w-4 h-4" aria-hidden="true" />
                {label}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Call to action ── */}
      <Divider label="Call to Action" />

      <CtaRow
        label="Primary button"
        value={state.primaryCta}
        onChange={(v) => onChange({ primaryCta: v })}
        fieldKeyPrefix="cta.primary"
      />

      <CtaRow
        label="Secondary button"
        value={state.secondaryCta}
        onChange={(v) => onChange({ secondaryCta: v })}
        fieldKeyPrefix="cta.secondary"
      />
    </div>
  );
}
