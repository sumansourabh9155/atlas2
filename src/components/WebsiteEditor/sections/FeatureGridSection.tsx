// ─── Feature Grid Section ─────────────────────────────────────────────────────
// Flexible feature / benefit grid with icon, title, and description per item.
// Supports 2–4 columns, 3 visual styles, and full CRUD item editing.

import React from "react";

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

export interface FeatureItem {
  icon:        string;   // emoji or short text icon
  title:       string;
  description: string;
}

export interface FeatureGridState {
  headline:   string;
  subtext:    string;
  columns:    2 | 3 | 4;
  items:      FeatureItem[];   // 2–8 items
  style:      "cards" | "minimal" | "icon_top";
  bgStyle:    "white" | "light" | "navy";
  accentColor: "teal" | "amber" | "navy";
}

export function createDefaultFeatureGrid(): FeatureGridState {
  return {
    headline:   "Why Choose Our Clinic",
    subtext:    "We combine cutting-edge technology with compassionate care to keep your pets healthy and happy.",
    columns:    3,
    items: [
      { icon: "🏥", title: "Advanced Diagnostics",   description: "State-of-the-art imaging, lab work, and specialist consultations on-site." },
      { icon: "🕐", title: "24/7 Emergency Care",    description: "Round-the-clock emergency services so your pet is never without expert help." },
      { icon: "❤️", title: "Compassionate Team",     description: "Every team member is passionate about animal welfare and your peace of mind." },
      { icon: "💉", title: "Preventive Wellness",    description: "Tailored vaccination plans, dental cleanings, and routine health screenings." },
      { icon: "🐾", title: "Multi-Species Expertise", description: "Dogs, cats, and exotic pets — our specialists are trained across many species." },
      { icon: "📋", title: "Transparent Pricing",    description: "Clear cost estimates and payment plans so you can focus on your pet, not the bill." },
    ],
    style:      "cards",
    bgStyle:    "light",
    accentColor: "teal",
  };
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getBg(bgStyle: string): string {
  switch (bgStyle) {
    case "white": return "#ffffff";
    case "light": return "#f8f9fb";
    case "navy":  return NAVY;
    default:      return "#f8f9fb";
  }
}

function isDarkBg(bgStyle: string): boolean {
  return bgStyle === "navy";
}

const ACCENT: Record<FeatureGridState["accentColor"], string> = {
  teal:  TEAL,
  amber: AMBER,
  navy:  NAVY,
};

// ─── Renderer ─────────────────────────────────────────────────────────────────

interface RendererProps {
  state:    FeatureGridState;
  isDark?:  boolean;
  compact?: boolean;
}

function FeatureCard({
  item, style, accent, textCol, subCol, dark, compact,
}: {
  item: FeatureItem;
  style: FeatureGridState["style"];
  accent: string;
  textCol: string;
  subCol: string;
  dark: boolean;
  compact: boolean;
}) {
  if (style === "cards") {
    return (
      <div
        style={{
          background:   dark ? "rgba(255,255,255,0.08)" : "#ffffff",
          border:       `1px solid ${dark ? "rgba(255,255,255,0.12)" : "#e5e7eb"}`,
          borderRadius: "12px",
          padding:      compact ? "16px" : "24px",
          display:      "flex",
          flexDirection: "column",
          gap:          "10px",
        }}
      >
        <span style={{ fontSize: compact ? "1.5rem" : "2rem", lineHeight: 1 }}>{item.icon}</span>
        <strong style={{ color: textCol, fontSize: compact ? "0.8125rem" : "1rem" }}>{item.title}</strong>
        <p style={{ color: subCol, fontSize: compact ? "0.75rem" : "0.875rem", lineHeight: 1.6, margin: 0 }}>
          {item.description}
        </p>
      </div>
    );
  }

  if (style === "icon_top") {
    return (
      <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", gap: "8px" }}>
        <div
          style={{
            width:        compact ? "36px" : "48px",
            height:       compact ? "36px" : "48px",
            borderRadius: "10px",
            background:   `${accent}20`,
            display:      "flex",
            alignItems:   "center",
            justifyContent: "center",
            fontSize:     compact ? "1.25rem" : "1.5rem",
          }}
        >
          {item.icon}
        </div>
        <strong style={{ color: textCol, fontSize: compact ? "0.8125rem" : "0.9375rem" }}>{item.title}</strong>
        <p style={{ color: subCol, fontSize: compact ? "0.75rem" : "0.875rem", lineHeight: 1.6, margin: 0 }}>
          {item.description}
        </p>
      </div>
    );
  }

  // minimal
  return (
    <div style={{ display: "flex", gap: "12px", alignItems: "flex-start" }}>
      <span
        style={{
          fontSize:   compact ? "1.125rem" : "1.375rem",
          lineHeight: 1,
          marginTop:  "2px",
          flexShrink: 0,
        }}
      >
        {item.icon}
      </span>
      <div>
        <strong style={{ color: textCol, fontSize: compact ? "0.8125rem" : "0.9375rem", display: "block", marginBottom: "4px" }}>
          {item.title}
        </strong>
        <p style={{ color: subCol, fontSize: compact ? "0.75rem" : "0.875rem", lineHeight: 1.6, margin: 0 }}>
          {item.description}
        </p>
      </div>
    </div>
  );
}

export function FeatureGridSectionRenderer({ state, compact }: RendererProps) {
  const bg      = getBg(state.bgStyle);
  const dark    = isDarkBg(state.bgStyle);
  const textCol = dark ? "#ffffff"               : "#111827";
  const subCol  = dark ? "rgba(255,255,255,0.75)" : "#4b5563";
  const accent  = ACCENT[state.accentColor];

  // In compact mode, cap at 2 columns
  const cols = compact ? Math.min(state.columns, 2) : state.columns;

  return (
    <section style={{ background: bg, padding: compact ? "40px 20px" : "80px 32px" }}>
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        {(state.headline || state.subtext) && (
          <div className="text-center" style={{ marginBottom: compact ? "28px" : "48px" }}>
            {state.headline && (
              <h2
                className="font-extrabold leading-tight"
                style={{
                  color:        textCol,
                  fontSize:     compact ? "1.25rem" : "1.875rem",
                  marginBottom: "12px",
                }}
              >
                {state.headline}
              </h2>
            )}
            {state.subtext && (
              <p
                style={{
                  color:     subCol,
                  fontSize:  compact ? "0.8125rem" : "1rem",
                  maxWidth:  "580px",
                  margin:    "0 auto",
                  lineHeight: 1.7,
                }}
              >
                {state.subtext}
              </p>
            )}
          </div>
        )}

        {/* Grid */}
        <div
          style={{
            display:             "grid",
            gridTemplateColumns: `repeat(${cols}, 1fr)`,
            gap:                 compact ? "16px" : "24px",
          }}
        >
          {state.items.map((item, i) => (
            <FeatureCard
              key={i}
              item={item}
              style={state.style}
              accent={accent}
              textCol={textCol}
              subCol={subCol}
              dark={dark}
              compact={!!compact}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Editor ───────────────────────────────────────────────────────────────────

interface EditorProps {
  state:    FeatureGridState;
  onChange: (patch: Partial<FeatureGridState>) => void;
}

const MAX_ITEMS = 8;
const MIN_ITEMS = 2;

export function FeatureGridEditor({ state, onChange }: EditorProps) {
  function updateItem(index: number, patch: Partial<FeatureItem>) {
    const updated = state.items.map((it, i) => i === index ? { ...it, ...patch } : it);
    onChange({ items: updated });
  }

  function addItem() {
    if (state.items.length >= MAX_ITEMS) return;
    onChange({
      items: [...state.items, { icon: "⭐", title: "New Feature", description: "Describe this feature…" }],
    });
  }

  function removeItem(index: number) {
    if (state.items.length <= MIN_ITEMS) return;
    onChange({ items: state.items.filter((_, i) => i !== index) });
  }

  return (
    <div className="flex flex-col gap-4 px-4 pb-4 pt-1">

      {/* Background */}
      <div>
        <label className={LABEL}>Background</label>
        <select
          value={state.bgStyle}
          onChange={e => onChange({ bgStyle: e.target.value as FeatureGridState["bgStyle"] })}
          className={INPUT}
        >
          <option value="white">White</option>
          <option value="light">Light Gray</option>
          <option value="navy">Navy</option>
        </select>
      </div>

      {/* Accent color */}
      <div>
        <label className={LABEL}>Accent Color</label>
        <div className="flex gap-2">
          {(["teal", "amber", "navy"] as const).map(c => (
            <button
              key={c}
              type="button"
              onClick={() => onChange({ accentColor: c })}
              title={c}
              className={[
                "w-8 h-8 rounded-lg border-2 transition-transform hover:scale-110",
                state.accentColor === c ? "border-gray-800 scale-110" : "border-transparent",
              ].join(" ")}
              style={{ background: ACCENT[c] }}
            />
          ))}
        </div>
      </div>

      {/* Visual style */}
      <div>
        <label className={LABEL}>Card Style</label>
        <select
          value={state.style}
          onChange={e => onChange({ style: e.target.value as FeatureGridState["style"] })}
          className={INPUT}
        >
          <option value="cards">Cards (bordered boxes)</option>
          <option value="icon_top">Icon Top (colored chip)</option>
          <option value="minimal">Minimal (inline icon)</option>
        </select>
      </div>

      {/* Columns */}
      <div>
        <label className={LABEL}>Columns</label>
        <div className="flex gap-2">
          {([2, 3, 4] as const).map(n => (
            <button
              key={n}
              type="button"
              onClick={() => onChange({ columns: n })}
              className={[
                "flex-1 h-8 rounded-md border text-xs font-semibold transition-all",
                state.columns === n
                  ? "bg-[#003459] text-white border-[#003459]"
                  : "border-gray-200 text-gray-600 hover:border-gray-300",
              ].join(" ")}
            >
              {n}
            </button>
          ))}
        </div>
      </div>

      {/* Divider */}
      <div className="border-t border-gray-100 -mx-4" />

      {/* Headline */}
      <div>
        <label className={LABEL}>Headline</label>
        <input
          value={state.headline}
          onChange={e => onChange({ headline: e.target.value })}
          className={INPUT}
          placeholder="Why Choose Our Clinic"
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
          placeholder="Brief description under the headline…"
        />
      </div>

      {/* Divider */}
      <div className="border-t border-gray-100 -mx-4" />

      {/* Items */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className={LABEL} style={{ margin: 0 }}>
            Feature Items ({state.items.length}/{MAX_ITEMS})
          </label>
          <button
            type="button"
            onClick={addItem}
            disabled={state.items.length >= MAX_ITEMS}
            className="text-[11px] font-semibold text-[#003459] hover:text-[#0052a3] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            + Add Item
          </button>
        </div>

        <div className="flex flex-col gap-3">
          {state.items.map((item, i) => (
            <div
              key={i}
              className="border border-gray-200 rounded-lg p-3 flex flex-col gap-2"
              style={{ background: "#fafafa" }}
            >
              {/* Header row: index + remove */}
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                  Item {i + 1}
                </span>
                <button
                  type="button"
                  onClick={() => removeItem(i)}
                  disabled={state.items.length <= MIN_ITEMS}
                  className="text-[10px] text-red-400 hover:text-red-600 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  title="Remove item"
                >
                  Remove
                </button>
              </div>

              {/* Icon + Title row */}
              <div className="flex gap-2">
                <div style={{ width: "60px", flexShrink: 0 }}>
                  <label className={LABEL}>Icon</label>
                  <input
                    value={item.icon}
                    onChange={e => updateItem(i, { icon: e.target.value })}
                    className={INPUT}
                    placeholder="🏥"
                    style={{ textAlign: "center" }}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <label className={LABEL}>Title</label>
                  <input
                    value={item.title}
                    onChange={e => updateItem(i, { title: e.target.value })}
                    className={INPUT}
                    placeholder="Feature title"
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className={LABEL}>Description</label>
                <textarea
                  value={item.description}
                  onChange={e => updateItem(i, { description: e.target.value })}
                  rows={2}
                  className={TEXTAREA}
                  placeholder="Short description of this feature…"
                />
              </div>
            </div>
          ))}
        </div>

        {state.items.length < MAX_ITEMS && (
          <button
            type="button"
            onClick={addItem}
            className="mt-2 w-full h-8 rounded-md border-2 border-dashed border-gray-200 text-xs text-gray-400 hover:border-gray-300 hover:text-gray-500 transition-all"
          >
            + Add Feature Item
          </button>
        )}
        {state.items.length >= MAX_ITEMS && (
          <p className="mt-1 text-[10px] text-gray-400 text-center">Maximum {MAX_ITEMS} items reached</p>
        )}
      </div>

    </div>
  );
}

// ─── Thumbnail ────────────────────────────────────────────────────────────────

export function FeatureGridThumbnail() {
  return (
    <div className="w-full h-full flex flex-col gap-1.5 px-2 py-1.5" style={{ background: "#f8f9fb" }}>
      {/* Title bar */}
      <div style={{ height: 4, width: "55%", borderRadius: 2, background: "#1e293b", margin: "0 auto" }} />
      <div style={{ height: 2.5, width: "75%", borderRadius: 2, background: "#9ca3af", margin: "0 auto 4px" }} />
      {/* 3-col mini cards */}
      <div className="flex gap-1.5">
        {[0, 1, 2].map(i => (
          <div
            key={i}
            className="flex-1 flex flex-col gap-1 items-center"
            style={{
              background:   "#ffffff",
              borderRadius: 5,
              border:       "1px solid #e5e7eb",
              padding:      "4px",
            }}
          >
            <div style={{ fontSize: "9px", lineHeight: 1 }}>⭐</div>
            <div style={{ height: 3, width: "80%", borderRadius: 1.5, background: "#374151" }} />
            <div style={{ height: 2, width: "90%", borderRadius: 1, background: "#d1d5db" }} />
            <div style={{ height: 2, width: "70%", borderRadius: 1, background: "#d1d5db" }} />
          </div>
        ))}
      </div>
    </div>
  );
}
