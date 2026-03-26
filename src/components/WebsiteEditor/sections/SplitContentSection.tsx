// ─── Split Content Section ────────────────────────────────────────────────────
// Rich 50/50 text-left + image-right (or vice versa) section with bullets & CTA.

const NAVY  = "#1B2B4B";
const TEAL  = "#0F766E";
const AMBER = "#F59E0B";

const INPUT =
  "w-full h-8 px-2.5 text-sm text-gray-900 bg-white border border-gray-200 rounded-md " +
  "placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-600 " +
  "focus:border-teal-600 transition-colors";

const LABEL = "block text-xs font-medium text-gray-600 mb-1";

const TEXTAREA =
  "w-full px-2.5 py-1.5 text-sm text-gray-900 bg-white border border-gray-200 rounded-md " +
  "placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-600 " +
  "focus:border-teal-600 transition-colors resize-none";

// ─── State ────────────────────────────────────────────────────────────────────

export interface SplitContentState {
  eyebrow:       string;
  headline:      string;
  body:          string;
  bullets:       string[];     // up to 5, one per line
  ctaLabel:      string;
  ctaHref:       string;
  ctaStyle:      "primary" | "outline" | "link";
  imageUrl:      string;
  imageAlt:      string;
  imagePosition: "left" | "right";
  imageStyle:    "natural" | "rounded" | "circle";
  bgStyle:       "white" | "light" | "navy";
  accentColor:   "teal" | "amber" | "navy";
}

export function createDefaultSplitContent(): SplitContentState {
  return {
    eyebrow:       "About Our Clinic",
    headline:      "Compassionate Care Backed by Board-Certified Expertise",
    body:          "Our specialists bring decades of experience treating complex cases. From routine wellness to critical emergencies, your pet is always in expert hands.",
    bullets:       [
      "Board-certified specialists on staff",
      "24/7 emergency availability",
      "State-of-the-art diagnostic equipment",
    ],
    ctaLabel:      "Meet Our Team",
    ctaHref:       "#",
    ctaStyle:      "primary",
    imageUrl:      "https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=800&auto=format&fit=crop&q=80",
    imageAlt:      "Veterinarian with patient",
    imagePosition: "right",
    imageStyle:    "rounded",
    bgStyle:       "white",
    accentColor:   "teal",
  };
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getBg(bgStyle: string): string {
  switch (bgStyle) {
    case "white": return "#ffffff";
    case "light": return "#f8f9fb";
    case "navy":  return NAVY;
    default:      return "#ffffff";
  }
}

function isDarkBg(bgStyle: string): boolean {
  return bgStyle === "navy";
}

const ACCENT: Record<SplitContentState["accentColor"], string> = {
  teal:  TEAL,
  amber: AMBER,
  navy:  NAVY,
};

function getImageRadius(imageStyle: SplitContentState["imageStyle"]): string {
  switch (imageStyle) {
    case "rounded": return "16px";
    case "circle":  return "50%";
    default:        return "0px";
  }
}

// ─── Renderer ─────────────────────────────────────────────────────────────────

interface RendererProps {
  state:    SplitContentState;
  isDark?:  boolean;
  compact?: boolean;
}

export function SplitContentSectionRenderer({ state, compact }: RendererProps) {
  const bg      = getBg(state.bgStyle);
  const dark    = isDarkBg(state.bgStyle);
  const textCol = dark ? "#ffffff"              : "#111827";
  const subCol  = dark ? "rgba(255,255,255,0.75)" : "#4b5563";
  const accent  = ACCENT[state.accentColor];
  const visibleBullets = state.bullets.filter(Boolean);

  const textSide = (
    <div className="flex flex-col justify-center" style={{ flex: 1, minWidth: 0 }}>
      {state.eyebrow && (
        <p
          className="text-xs font-bold uppercase tracking-widest mb-3"
          style={{ color: accent }}
        >
          {state.eyebrow}
        </p>
      )}
      <h2
        className="font-extrabold leading-tight mb-4"
        style={{
          color:    textCol,
          fontSize: compact ? "1.25rem" : "1.875rem",
        }}
      >
        {state.headline}
      </h2>
      {state.body && (
        <p
          className="leading-relaxed mb-4"
          style={{ color: subCol, fontSize: compact ? "0.8125rem" : "1rem" }}
        >
          {state.body}
        </p>
      )}

      {visibleBullets.length > 0 && (
        <ul className="flex flex-col gap-2 mb-5">
          {visibleBullets.map((b, i) => (
            <li key={i} className="flex items-start gap-2">
              <span style={{ color: accent, fontWeight: 700, lineHeight: 1.5 }}>✓</span>
              <span style={{ color: subCol, fontSize: "0.875rem" }}>{b}</span>
            </li>
          ))}
        </ul>
      )}

      {state.ctaLabel && (
        <>
          {state.ctaStyle === "primary" && (
            <a
              href={state.ctaHref || "#"}
              className="inline-flex items-center gap-2 self-start px-5 py-2.5 rounded-xl font-bold text-sm transition-all"
              style={{ background: accent, color: "#ffffff" }}
            >
              {state.ctaLabel}
            </a>
          )}
          {state.ctaStyle === "outline" && (
            <a
              href={state.ctaHref || "#"}
              className="inline-flex items-center gap-2 self-start px-5 py-2.5 rounded-xl font-bold text-sm border-2 transition-all"
              style={{ borderColor: accent, color: accent, background: "transparent" }}
            >
              {state.ctaLabel}
            </a>
          )}
          {state.ctaStyle === "link" && (
            <a
              href={state.ctaHref || "#"}
              className="inline-flex items-center gap-1 self-start font-semibold text-sm transition-all"
              style={{ color: accent }}
            >
              {state.ctaLabel} →
            </a>
          )}
        </>
      )}
    </div>
  );

  const imageSide = (
    <div style={{ flex: 1, minWidth: 0 }}>
      <div
        style={{
          width:         "100%",
          aspectRatio:   state.imageStyle === "circle" ? "1 / 1" : "4 / 3",
          borderRadius:  getImageRadius(state.imageStyle),
          overflow:      "hidden",
          background:    "#e5e7eb",
        }}
      >
        {state.imageUrl && (
          <img
            src={state.imageUrl}
            alt={state.imageAlt}
            loading="lazy"
            style={{
              width:     "100%",
              height:    "100%",
              objectFit: "cover",
            }}
            onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
          />
        )}
      </div>
    </div>
  );

  const isReversed = state.imagePosition === "left";

  return (
    <section style={{ background: bg, padding: compact ? "40px 20px" : "80px 32px" }}>
      <div
        className="max-w-5xl mx-auto"
        style={{
          display:       "flex",
          flexDirection: compact ? "column" : (isReversed ? "row-reverse" : "row"),
          alignItems:    "center",
          gap:           compact ? "32px" : "64px",
        }}
      >
        {textSide}
        {imageSide}
      </div>
    </section>
  );
}

// ─── Editor ───────────────────────────────────────────────────────────────────

interface EditorProps {
  state:    SplitContentState;
  onChange: (patch: Partial<SplitContentState>) => void;
}

export function SplitContentEditor({ state, onChange }: EditorProps) {
  return (
    <div className="flex flex-col gap-4 px-4 pb-4 pt-1">

      {/* Background */}
      <div>
        <label className={LABEL}>Background</label>
        <select
          value={state.bgStyle}
          onChange={e => onChange({ bgStyle: e.target.value as SplitContentState["bgStyle"] })}
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

      {/* Image position */}
      <div>
        <label className={LABEL}>Image Position</label>
        <div className="flex gap-2">
          {(["right", "left"] as const).map(pos => (
            <button
              key={pos}
              type="button"
              onClick={() => onChange({ imagePosition: pos })}
              className={[
                "flex-1 h-8 rounded-md border text-xs font-semibold transition-all",
                state.imagePosition === pos
                  ? "bg-teal-600 text-white border-teal-600"
                  : "border-gray-200 text-gray-600 hover:border-gray-300",
              ].join(" ")}
            >
              {pos === "right" ? "Text Left / Image Right" : "Image Left / Text Right"}
            </button>
          ))}
        </div>
      </div>

      {/* Image style */}
      <div>
        <label className={LABEL}>Image Style</label>
        <select
          value={state.imageStyle}
          onChange={e => onChange({ imageStyle: e.target.value as SplitContentState["imageStyle"] })}
          className={INPUT}
        >
          <option value="natural">Natural (no rounding)</option>
          <option value="rounded">Rounded corners</option>
          <option value="circle">Circle</option>
        </select>
      </div>

      {/* Divider */}
      <div className="border-t border-gray-100 -mx-4" />

      {/* Eyebrow */}
      <div>
        <label className={LABEL}>Eyebrow Label</label>
        <input
          value={state.eyebrow}
          onChange={e => onChange({ eyebrow: e.target.value })}
          className={INPUT}
          placeholder="About Our Clinic"
        />
      </div>

      {/* Headline */}
      <div>
        <label className={LABEL}>Headline</label>
        <textarea
          value={state.headline}
          onChange={e => onChange({ headline: e.target.value })}
          rows={2}
          className={TEXTAREA}
          placeholder="Compassionate Care Backed by Expertise"
        />
      </div>

      {/* Body */}
      <div>
        <label className={LABEL}>Body Text</label>
        <textarea
          value={state.body}
          onChange={e => onChange({ body: e.target.value })}
          rows={4}
          className={TEXTAREA}
          placeholder="Tell your story…"
        />
      </div>

      {/* Bullets */}
      <div>
        <label className={LABEL}>Bullet Points (one per line, max 5)</label>
        <textarea
          value={state.bullets.join("\n")}
          onChange={e => onChange({ bullets: e.target.value.split("\n").slice(0, 5) })}
          rows={4}
          className={TEXTAREA}
          placeholder={"Board-certified specialists\n24/7 emergency care\nState-of-the-art equipment"}
        />
        <p className="text-[10px] text-gray-400 mt-1">Leave empty to hide bullet list</p>
      </div>

      {/* Divider */}
      <div className="border-t border-gray-100 -mx-4" />

      {/* CTA */}
      <div>
        <label className={LABEL}>Button Label</label>
        <input
          value={state.ctaLabel}
          onChange={e => onChange({ ctaLabel: e.target.value })}
          className={INPUT}
          placeholder="Learn More"
        />
      </div>

      <div>
        <label className={LABEL}>Button Style</label>
        <select
          value={state.ctaStyle}
          onChange={e => onChange({ ctaStyle: e.target.value as SplitContentState["ctaStyle"] })}
          className={INPUT}
        >
          <option value="primary">Primary (filled)</option>
          <option value="outline">Outline (bordered)</option>
          <option value="link">Text link</option>
        </select>
      </div>

      <div>
        <label className={LABEL}>Button Link</label>
        <input
          value={state.ctaHref}
          onChange={e => onChange({ ctaHref: e.target.value })}
          className={INPUT}
          placeholder="#team"
        />
      </div>

      {/* Divider */}
      <div className="border-t border-gray-100 -mx-4" />

      {/* Image */}
      <div>
        <label className={LABEL}>Image URL</label>
        <input
          value={state.imageUrl}
          onChange={e => onChange({ imageUrl: e.target.value })}
          className={INPUT}
          placeholder="https://…"
        />
      </div>

      <div>
        <label className={LABEL}>Image Alt Text</label>
        <input
          value={state.imageAlt}
          onChange={e => onChange({ imageAlt: e.target.value })}
          className={INPUT}
          placeholder="Veterinarian with patient"
        />
      </div>

    </div>
  );
}

// ─── Thumbnail ────────────────────────────────────────────────────────────────

export function SplitContentThumbnail() {
  return (
    <div className="w-full h-full flex items-center gap-1.5 px-2 py-1.5" style={{ background: "#f8f9fb" }}>
      {/* Text side */}
      <div className="flex flex-col gap-1 flex-1">
        <div style={{ height: 3, width: "50%", borderRadius: 2, background: TEAL }} />
        <div style={{ height: 5, width: "90%", borderRadius: 2, background: "#1e293b" }} />
        <div style={{ height: 3, width: "85%", borderRadius: 2, background: "#9ca3af" }} />
        <div style={{ height: 3, width: "80%", borderRadius: 2, background: "#9ca3af" }} />
        <div className="flex flex-col gap-0.5 mt-1">
          {[70, 80, 65].map((w, i) => (
            <div key={i} style={{ height: 2.5, width: `${w}%`, borderRadius: 1.5, background: "#d1d5db" }} />
          ))}
        </div>
        <div style={{ height: 7, width: "45%", borderRadius: 4, background: TEAL, marginTop: 4 }} />
      </div>
      {/* Image side */}
      <div
        style={{
          flex:         1,
          aspectRatio:  "4/3",
          borderRadius: 6,
          background:   "linear-gradient(135deg, #e5e7eb, #d1d5db)",
          overflow:     "hidden",
          display:      "flex",
          alignItems:   "center",
          justifyContent: "center",
        }}
      >
        <span style={{ fontSize: "14px", opacity: 0.4 }}>🖼</span>
      </div>
    </div>
  );
}
