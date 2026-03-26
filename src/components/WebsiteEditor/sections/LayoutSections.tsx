// ─── Layout Sections ──────────────────────────────────────────────────────────
// EmptySection, TwoColSection, ThreeColSection

const NAVY = "#1B2B4B";
const AMBER = "#F59E0B";
const TEAL = "#0F766E";

const INPUT =
  "w-full h-8 px-2.5 text-sm text-gray-900 bg-white border border-gray-200 rounded-md " +
  "placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-600 " +
  "focus:border-teal-600 transition-colors";

const TEXTAREA =
  "w-full px-2.5 py-1.5 text-sm text-gray-900 bg-white border border-gray-200 rounded-md " +
  "placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-600 " +
  "focus:border-teal-600 transition-colors resize-none";

const LABEL = "block text-xs font-medium text-gray-600 mb-1";

const BG_OPTIONS = [
  { value: "white",    label: "White"      },
  { value: "light",    label: "Light gray" },
  { value: "dark",     label: "Dark"       },
  { value: "navy",     label: "Navy"       },
  { value: "teal",     label: "Teal"       },
];

function getBg(bgStyle: string, isDark: boolean): string {
  if (isDark) return bgStyle === "navy" ? "#0b1628" : bgStyle === "dark" ? "#0f172a" : bgStyle === "teal" ? "#0d3330" : "#1e293b";
  switch (bgStyle) {
    case "white": return "#ffffff";
    case "light": return "#f8f9fb";
    case "dark":  return "#1e293b";
    case "navy":  return NAVY;
    case "teal":  return TEAL;
    default:      return "#ffffff";
  }
}

function isDarkBg(bgStyle: string, isDark: boolean): boolean {
  return isDark || bgStyle === "dark" || bgStyle === "navy" || bgStyle === "teal";
}

// ─── EmptySection ─────────────────────────────────────────────────────────────

export interface EmptyState {
  minHeight: "xs" | "sm" | "md" | "lg" | "xl";
  bgStyle: "white" | "light" | "dark" | "navy" | "teal";
  showPlaceholder: boolean;
  label: string;
}

export function createDefaultEmpty(): EmptyState {
  return {
    minHeight: "md",
    bgStyle: "white",
    showPlaceholder: true,
    label: "Custom Section",
  };
}

const HEIGHT_MAP: Record<EmptyState["minHeight"], string> = {
  xs: "80px",
  sm: "160px",
  md: "240px",
  lg: "360px",
  xl: "480px",
};

export function EmptySectionRenderer({
  state, isDark, compact,
}: { state: EmptyState; isDark: boolean; compact: boolean }) {
  const bg = getBg(state.bgStyle, isDark);
  const dark = isDarkBg(state.bgStyle, isDark);
  const height = compact ? "120px" : HEIGHT_MAP[state.minHeight];

  return (
    <section
      style={{
        background: bg,
        minHeight: height,
        borderTop: `1px solid ${dark ? "rgba(255,255,255,0.06)" : "#f0f0f2"}`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
      aria-label="Empty Section"
    >
      {state.showPlaceholder && (
        <div className="flex flex-col items-center gap-2 opacity-30 select-none pointer-events-none">
          <div className="w-10 h-10 border-2 border-dashed rounded-xl flex items-center justify-center"
            style={{ borderColor: dark ? "#ffffff" : NAVY }}>
            <span className="text-xl font-black" style={{ color: dark ? "#ffffff" : NAVY }}>+</span>
          </div>
          <span className="text-xs font-semibold uppercase tracking-widest" style={{ color: dark ? "#ffffff" : NAVY }}>
            {state.label}
          </span>
        </div>
      )}
    </section>
  );
}

export function EmptyEditor({
  state, onChange,
}: { state: EmptyState; onChange: (u: Partial<EmptyState>) => void }) {
  return (
    <div className="flex flex-col gap-4 px-4 pb-4 pt-1">
      <div>
        <label className={LABEL}>Label (shown as placeholder)</label>
        <input type="text" value={state.label} onChange={(e) => onChange({ label: e.target.value })} className={INPUT} placeholder="Custom Section" />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={LABEL}>Min height</label>
          <select value={state.minHeight} onChange={(e) => onChange({ minHeight: e.target.value as EmptyState["minHeight"] })} className={INPUT}>
            <option value="xs">Extra small (80px)</option>
            <option value="sm">Small (160px)</option>
            <option value="md">Medium (240px)</option>
            <option value="lg">Large (360px)</option>
            <option value="xl">Extra large (480px)</option>
          </select>
        </div>
        <div>
          <label className={LABEL}>Background</label>
          <select value={state.bgStyle} onChange={(e) => onChange({ bgStyle: e.target.value as EmptyState["bgStyle"] })} className={INPUT}>
            {BG_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <input type="checkbox" id="empty-placeholder" checked={state.showPlaceholder} onChange={(e) => onChange({ showPlaceholder: e.target.checked })} className="rounded" />
        <label htmlFor="empty-placeholder" className="text-xs text-gray-600">Show placeholder indicator</label>
      </div>
    </div>
  );
}

export function EmptyThumbnail() {
  return (
    <div className="flex flex-col items-center justify-center h-full border-2 border-dashed rounded-sm m-1.5 gap-1" style={{ borderColor: "#cbd5e1", background: "#f8fafc" }}>
      <div className="w-4 h-4 rounded-full border-2 border-dashed flex items-center justify-center" style={{ borderColor: "#94a3b8" }}>
        <span className="text-[10px] font-bold leading-none" style={{ color: "#94a3b8" }}>+</span>
      </div>
      <span className="text-[6px] font-semibold tracking-wide" style={{ color: "#94a3b8" }}>EMPTY SPACE</span>
    </div>
  );
}

// ─── TwoColSection ────────────────────────────────────────────────────────────

export interface TwoColColumn {
  icon: string;
  heading: string;
  body: string;
  imageUrl: string;
  ctaLabel: string;
  ctaHref: string;
}

export interface TwoColState {
  heading: string;
  subtext: string;
  columns: [TwoColColumn, TwoColColumn];
  gap: "tight" | "normal" | "wide";
  verticalAlign: "top" | "center";
  showDivider: boolean;
  bgStyle: "white" | "light" | "dark" | "navy";
}

const DEFAULT_COL: TwoColColumn = {
  icon: "✦",
  heading: "Column Heading",
  body: "Write your column content here. This can describe a feature, benefit, or any information you want to present alongside the other column.",
  imageUrl: "",
  ctaLabel: "",
  ctaHref: "#",
};

export function createDefaultTwoCol(): TwoColState {
  return {
    heading: "Two Things Worth Knowing",
    subtext: "",
    columns: [
      { ...DEFAULT_COL, icon: "🔬", heading: "Advanced Diagnostics", body: "State-of-the-art MRI, CT, and digital radiography equipment interpreted by board-certified radiologists. Same-day results for urgent cases." },
      { ...DEFAULT_COL, icon: "❤️", heading: "Compassionate Care", body: "Every patient is treated with the same warmth and attention we'd give our own pets. We take time to explain every step and answer every question." },
    ],
    gap: "normal",
    verticalAlign: "top",
    showDivider: false,
    bgStyle: "white",
  };
}

export function TwoColSectionRenderer({
  state, isDark, compact,
}: { state: TwoColState; isDark: boolean; compact: boolean }) {
  const bg = getBg(state.bgStyle, isDark);
  const dark = isDarkBg(state.bgStyle, isDark);
  const gapClass = { tight: "gap-6", normal: "gap-10", wide: "gap-16" }[state.gap];
  const valign = state.verticalAlign === "center" ? "items-center" : "items-start";

  return (
    <section
      className="px-6 py-14"
      style={{ background: bg, borderTop: `1px solid ${dark ? "rgba(255,255,255,0.06)" : "#f0f0f2"}` }}
      aria-label="Two Column"
    >
      <div className="max-w-4xl mx-auto">
        {(state.heading || state.subtext) && (
          <div className="text-center mb-10">
            {state.heading && (
              <h2 className={`font-extrabold ${compact ? "text-xl" : "text-2xl"}`}
                style={{ color: dark ? "#f1f5f9" : "#111827" }}>{state.heading}</h2>
            )}
            {state.subtext && (
              <p className="text-sm mt-2 leading-relaxed" style={{ color: dark ? "#64748b" : "#6b7280" }}>{state.subtext}</p>
            )}
          </div>
        )}

        <div className={`grid ${compact ? "grid-cols-1" : "grid-cols-2"} ${gapClass} ${valign}`}>
          {state.columns.map((col, idx) => (
            <div key={idx} className="flex flex-col gap-4">
              {state.showDivider && idx === 1 && !compact && (
                <div className="hidden" /> // spacer
              )}
              {col.imageUrl ? (
                <div className="w-full rounded-xl overflow-hidden" style={{ aspectRatio: "16/9", background: dark ? "#1e293b" : "#e5e7eb" }}>
                  <img src={col.imageUrl} alt={col.heading} className="w-full h-full object-cover"
                    onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }} />
                </div>
              ) : col.icon ? (
                <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl shrink-0"
                  style={{ background: dark ? "rgba(255,255,255,0.06)" : "#f3f4f6" }}>
                  {col.icon}
                </div>
              ) : null}
              <div>
                <h3 className="font-bold text-lg mb-2" style={{ color: dark ? "#f1f5f9" : "#111827" }}>{col.heading}</h3>
                <p className="text-sm leading-relaxed" style={{ color: dark ? "#94a3b8" : "#374151" }}>{col.body}</p>
              </div>
              {col.ctaLabel && (
                <a href={col.ctaHref} className="inline-flex items-center gap-1 text-sm font-semibold"
                  style={{ color: dark ? "#94a3b8" : NAVY }}>
                  {col.ctaLabel} <span>→</span>
                </a>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function TwoColEditor({
  state, onChange,
}: { state: TwoColState; onChange: (u: Partial<TwoColState>) => void }) {
  function updateCol(idx: 0 | 1, key: keyof TwoColColumn, val: string) {
    const next = [...state.columns] as [TwoColColumn, TwoColColumn];
    next[idx] = { ...next[idx], [key]: val };
    onChange({ columns: next });
  }

  return (
    <div className="flex flex-col gap-4 px-4 pb-4 pt-1">
      <div>
        <label className={LABEL}>Section heading (optional)</label>
        <input type="text" value={state.heading} onChange={(e) => onChange({ heading: e.target.value })} className={INPUT} placeholder="Leave blank to hide" />
      </div>
      <div>
        <label className={LABEL}>Section subtext</label>
        <input type="text" value={state.subtext} onChange={(e) => onChange({ subtext: e.target.value })} className={INPUT} placeholder="Supporting text under heading" />
      </div>

      {([0, 1] as const).map((idx) => (
        <div key={idx} className="border border-gray-200 rounded-lg p-3 flex flex-col gap-3">
          <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">Column {idx + 1}</p>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className={LABEL}>Icon / Emoji</label>
              <input type="text" value={state.columns[idx].icon} onChange={(e) => updateCol(idx, "icon", e.target.value)} className={INPUT} placeholder="🔬" />
            </div>
            <div>
              <label className={LABEL}>CTA label</label>
              <input type="text" value={state.columns[idx].ctaLabel} onChange={(e) => updateCol(idx, "ctaLabel", e.target.value)} className={INPUT} placeholder="Optional" />
            </div>
          </div>
          <div>
            <label className={LABEL}>Heading</label>
            <input type="text" value={state.columns[idx].heading} onChange={(e) => updateCol(idx, "heading", e.target.value)} className={INPUT} placeholder="Column heading" />
          </div>
          <div>
            <label className={LABEL}>Body text</label>
            <textarea value={state.columns[idx].body} onChange={(e) => updateCol(idx, "body", e.target.value)} rows={3} className={TEXTAREA} placeholder="Column body…" />
          </div>
          <div>
            <label className={LABEL}>Image URL (overrides icon)</label>
            <input type="text" value={state.columns[idx].imageUrl} onChange={(e) => updateCol(idx, "imageUrl", e.target.value)} className={INPUT} placeholder="https://…" />
          </div>
        </div>
      ))}

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={LABEL}>Gap between columns</label>
          <select value={state.gap} onChange={(e) => onChange({ gap: e.target.value as TwoColState["gap"] })} className={INPUT}>
            <option value="tight">Tight</option>
            <option value="normal">Normal</option>
            <option value="wide">Wide</option>
          </select>
        </div>
        <div>
          <label className={LABEL}>Vertical align</label>
          <select value={state.verticalAlign} onChange={(e) => onChange({ verticalAlign: e.target.value as TwoColState["verticalAlign"] })} className={INPUT}>
            <option value="top">Top</option>
            <option value="center">Center</option>
          </select>
        </div>
      </div>
      <div>
        <label className={LABEL}>Background</label>
        <select value={state.bgStyle} onChange={(e) => onChange({ bgStyle: e.target.value as TwoColState["bgStyle"] })} className={INPUT}>
          {BG_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      </div>
    </div>
  );
}

export function TwoColThumbnail() {
  const cols = [
    { icon: "🔬", title: "Advanced Diagnostics", color: "#dbeafe" },
    { icon: "❤️", title: "Compassionate Care", color: "#d1fae5" },
  ];
  return (
    <div className="flex flex-col h-full p-1 bg-white gap-1">
      <div className="h-[2px] rounded bg-gray-700 w-1/2 mx-auto" />
      <div className="flex gap-1 flex-1">
        {cols.map((col, i) => (
          <div key={i} className="flex-1 border border-gray-100 rounded-sm p-1 flex flex-col gap-[2px]">
            <div className="w-4 h-4 rounded-sm flex items-center justify-center text-[9px]" style={{ background: col.color }}>{col.icon}</div>
            <span className="text-[5.5px] font-bold text-gray-800 leading-tight">{col.title}</span>
            <div className="h-[1.5px] bg-gray-200 rounded w-full" />
            <div className="h-[1.5px] bg-gray-200 rounded w-3/4" />
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── ThreeColSection ──────────────────────────────────────────────────────────

export interface ThreeColItem {
  icon: string;
  title: string;
  body: string;
  accentColor: "amber" | "teal" | "navy" | "none";
}

export interface ThreeColState {
  heading: string;
  subtext: string;
  items: ThreeColItem[];
  cardStyle: "plain" | "bordered" | "filled";
  bgStyle: "white" | "light" | "dark" | "navy";
}

const DEFAULT_THREE_ITEM: ThreeColItem = {
  icon: "✦",
  title: "Feature Title",
  body: "A short description of this feature or benefit, written to be clear and compelling.",
  accentColor: "amber",
};

export function createDefaultThreeCol(): ThreeColState {
  return {
    heading: "Everything Your Pet Needs",
    subtext: "From preventive care to complex surgery — all under one roof, staffed by board-certified specialists.",
    items: [
      { icon: "🏥", title: "State-of-the-Art Facility", body: "Our 12,000 sq ft hospital is equipped with in-house MRI, CT, and digital radiography for same-day diagnostics.", accentColor: "amber" },
      { icon: "👨‍⚕️", title: "Board-Certified Specialists", body: "Every specialist has completed additional years of residency training after veterinary school, certified by their respective colleges.", accentColor: "teal" },
      { icon: "🕐", title: "24/7 Emergency Care", body: "Our emergency department is staffed around the clock by specialists trained in critical care and acute medicine.", accentColor: "navy" },
    ],
    cardStyle: "bordered",
    bgStyle: "light",
  };
}

export function ThreeColSectionRenderer({
  state, isDark, compact,
}: { state: ThreeColState; isDark: boolean; compact: boolean }) {
  const bg = getBg(state.bgStyle, isDark);
  const dark = isDarkBg(state.bgStyle, isDark);
  const ACCENT: Record<ThreeColItem["accentColor"], string> = { amber: AMBER, teal: TEAL, navy: NAVY, none: "transparent" };

  const cardBg: Record<ThreeColState["cardStyle"], string> = {
    plain: "transparent",
    bordered: dark ? "#1e293b" : "#ffffff",
    filled: dark ? "#1e293b" : "#f8f9fb",
  };
  const cardBorder: Record<ThreeColState["cardStyle"], string> = {
    plain: "transparent",
    bordered: dark ? "rgba(255,255,255,0.08)" : "#e5e7eb",
    filled: "transparent",
  };

  return (
    <section
      className="px-6 py-14"
      style={{ background: bg, borderTop: `1px solid ${dark ? "rgba(255,255,255,0.06)" : "#f0f0f2"}` }}
      aria-label="Three Column"
    >
      <div className="max-w-5xl mx-auto">
        {(state.heading || state.subtext) && (
          <div className="text-center mb-10">
            {state.heading && (
              <h2 className={`font-extrabold ${compact ? "text-xl" : "text-2xl"}`}
                style={{ color: dark ? "#f1f5f9" : "#111827" }}>
                {state.heading}
              </h2>
            )}
            {state.subtext && (
              <p className="text-sm mt-2 leading-relaxed max-w-2xl mx-auto"
                style={{ color: dark ? "#64748b" : "#6b7280" }}>
                {state.subtext}
              </p>
            )}
          </div>
        )}

        <div className={`grid gap-5 ${compact ? "grid-cols-1" : "grid-cols-3"}`}>
          {state.items.map((item, i) => (
            <div
              key={i}
              className="flex flex-col gap-4 p-5 rounded-2xl"
              style={{
                background: cardBg[state.cardStyle],
                border: `1px solid ${cardBorder[state.cardStyle]}`,
              }}
            >
              <div
                className="w-11 h-11 rounded-xl flex items-center justify-center text-xl shrink-0"
                style={{
                  background: item.accentColor !== "none"
                    ? `${ACCENT[item.accentColor]}20`
                    : dark ? "rgba(255,255,255,0.06)" : "#f3f4f6",
                }}
              >
                {item.icon}
              </div>
              <div>
                <h3 className="font-bold text-base mb-2" style={{ color: dark ? "#f1f5f9" : "#111827" }}>
                  {item.title}
                </h3>
                <p className="text-sm leading-relaxed" style={{ color: dark ? "#94a3b8" : "#374151" }}>
                  {item.body}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function ThreeColEditor({
  state, onChange,
}: { state: ThreeColState; onChange: (u: Partial<ThreeColState>) => void }) {
  function updateItem(idx: number, key: keyof ThreeColItem, val: string) {
    const next = state.items.map((item, i) => i === idx ? { ...item, [key]: val } : item);
    onChange({ items: next });
  }

  function addItem() {
    onChange({ items: [...state.items, { ...DEFAULT_THREE_ITEM }] });
  }

  function removeItem(idx: number) {
    if (state.items.length <= 1) return;
    onChange({ items: state.items.filter((_, i) => i !== idx) });
  }

  return (
    <div className="flex flex-col gap-4 px-4 pb-4 pt-1">
      <div>
        <label className={LABEL}>Section heading</label>
        <input type="text" value={state.heading} onChange={(e) => onChange({ heading: e.target.value })} className={INPUT} placeholder="Section heading" />
      </div>
      <div>
        <label className={LABEL}>Subtext</label>
        <textarea value={state.subtext} onChange={(e) => onChange({ subtext: e.target.value })} rows={2} className={TEXTAREA} placeholder="Supporting text…" />
      </div>

      {state.items.map((item, idx) => (
        <div key={idx} className="border border-gray-200 rounded-lg p-3 flex flex-col gap-2">
          <div className="flex items-center justify-between mb-1">
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">Item {idx + 1}</p>
            {state.items.length > 1 && (
              <button type="button" onClick={() => removeItem(idx)} className="text-xs text-red-400 hover:text-red-600">Remove</button>
            )}
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className={LABEL}>Icon / Emoji</label>
              <input type="text" value={item.icon} onChange={(e) => updateItem(idx, "icon", e.target.value)} className={INPUT} placeholder="🏥" />
            </div>
            <div>
              <label className={LABEL}>Accent color</label>
              <select value={item.accentColor} onChange={(e) => updateItem(idx, "accentColor", e.target.value)} className={INPUT}>
                <option value="amber">Amber</option>
                <option value="teal">Teal</option>
                <option value="navy">Navy</option>
                <option value="none">None</option>
              </select>
            </div>
          </div>
          <div>
            <label className={LABEL}>Title</label>
            <input type="text" value={item.title} onChange={(e) => updateItem(idx, "title", e.target.value)} className={INPUT} placeholder="Feature title" />
          </div>
          <div>
            <label className={LABEL}>Description</label>
            <textarea value={item.body} onChange={(e) => updateItem(idx, "body", e.target.value)} rows={2} className={TEXTAREA} placeholder="Feature description…" />
          </div>
        </div>
      ))}

      <button
        type="button"
        onClick={addItem}
        className="w-full h-8 border border-dashed border-gray-300 text-xs text-gray-400 hover:text-gray-600 hover:border-gray-400 rounded-lg transition-colors"
      >
        + Add item
      </button>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={LABEL}>Card style</label>
          <select value={state.cardStyle} onChange={(e) => onChange({ cardStyle: e.target.value as ThreeColState["cardStyle"] })} className={INPUT}>
            <option value="plain">Plain</option>
            <option value="bordered">Bordered card</option>
            <option value="filled">Filled card</option>
          </select>
        </div>
        <div>
          <label className={LABEL}>Background</label>
          <select value={state.bgStyle} onChange={(e) => onChange({ bgStyle: e.target.value as ThreeColState["bgStyle"] })} className={INPUT}>
            {BG_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </div>
      </div>
    </div>
  );
}

export function ThreeColThumbnail() {
  const items = [
    { icon: "🏥", label: "Emergency", accent: "#fef3c7" },
    { icon: "🔬", label: "Diagnostics", accent: "#dbeafe" },
    { icon: "❤️", label: "Wellness", accent: "#d1fae5" },
  ];
  return (
    <div className="flex flex-col h-full p-1 bg-gray-50 gap-1">
      <div className="h-[2px] rounded bg-gray-700 w-2/5 mx-auto" />
      <div className="grid grid-cols-3 gap-[3px] flex-1">
        {items.map((item, i) => (
          <div key={i} className="bg-white border border-gray-100 rounded-sm p-0.5 flex flex-col gap-[2px]">
            <div className="w-3 h-3 rounded-sm flex items-center justify-center text-[8px]" style={{ background: item.accent }}>{item.icon}</div>
            <span className="text-[4.5px] font-bold text-gray-700 leading-tight">{item.label}</span>
            <div className="h-[1.5px] bg-gray-200 rounded" />
            <div className="h-[1.5px] bg-gray-200 rounded w-3/4" />
          </div>
        ))}
      </div>
    </div>
  );
}
