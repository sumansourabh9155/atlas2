// ─── Typography Sections ──────────────────────────────────────────────────────
// Heading, Paragraph, TextBlock, BlockQuote, RichText

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
  { value: "white",     label: "White" },
  { value: "light",     label: "Light gray" },
  { value: "dark",      label: "Dark" },
  { value: "navy",      label: "Navy" },
];

function getBg(bgStyle: string, isDark: boolean) {
  if (isDark) return bgStyle === "navy" ? "#0b1628" : bgStyle === "dark" ? "#0f172a" : "#1e293b";
  switch (bgStyle) {
    case "white": return "#ffffff";
    case "light": return "#f8f9fb";
    case "dark":  return "#1e293b";
    case "navy":  return NAVY;
    default:      return "#ffffff";
  }
}

function isDarkBg(bgStyle: string, isDark: boolean) {
  return isDark || bgStyle === "dark" || bgStyle === "navy";
}

// ─── HeadingSection ───────────────────────────────────────────────────────────

export interface HeadingState {
  text: string;
  subtext: string;
  level: "h1" | "h2" | "h3" | "h4";
  align: "left" | "center" | "right";
  size: "sm" | "md" | "lg" | "xl";
  accentColor: "none" | "amber" | "teal" | "navy";
  showDivider: boolean;
  ctaLabel: string;
  ctaHref: string;
  bgStyle: "white" | "light" | "dark" | "navy";
}

export function createDefaultHeading(): HeadingState {
  return {
    text: "Your Compelling Headline",
    subtext: "A supporting statement that reinforces the main message and invites the visitor to keep reading.",
    level: "h2",
    align: "center",
    size: "lg",
    accentColor: "amber",
    showDivider: false,
    ctaLabel: "",
    ctaHref: "#",
    bgStyle: "white",
  };
}

const HEADING_SIZE: Record<HeadingState["size"], string> = {
  sm: "text-2xl",
  md: "text-3xl",
  lg: "text-4xl",
  xl: "text-5xl md:text-6xl",
};

const ACCENT_COLOR: Record<HeadingState["accentColor"], string> = {
  none: "transparent",
  amber: AMBER,
  teal: TEAL,
  navy: NAVY,
};

export function HeadingSectionRenderer({
  state, isDark, compact,
}: { state: HeadingState; isDark: boolean; compact: boolean }) {
  const bg = getBg(state.bgStyle, isDark);
  const dark = isDarkBg(state.bgStyle, isDark);
  const alignClass = { left: "text-left items-start", center: "text-center items-center", right: "text-right items-end" }[state.align];
  const sizeClass = compact ? "text-2xl" : HEADING_SIZE[state.size];
  const Tag = state.level as keyof JSX.IntrinsicElements;

  return (
    <section
      className="px-6 py-14"
      style={{ background: bg, borderTop: `1px solid ${dark ? "rgba(255,255,255,0.06)" : "#f0f0f2"}` }}
      aria-label="Heading"
    >
      <div className={`max-w-3xl mx-auto flex flex-col ${alignClass} gap-3`}>
        {state.accentColor !== "none" && (
          <div
            className="h-1 w-12 rounded-full shrink-0"
            style={{ background: ACCENT_COLOR[state.accentColor] }}
          />
        )}
        <Tag
          className={`font-extrabold leading-tight ${sizeClass}`}
          style={{ color: dark ? "#f1f5f9" : "#111827" }}
        >
          {state.text}
        </Tag>
        {state.showDivider && (
          <div className="h-px w-full" style={{ background: dark ? "rgba(255,255,255,0.1)" : "#e5e7eb" }} />
        )}
        {state.subtext && (
          <p
            className={`${compact ? "text-base" : "text-lg"} leading-relaxed max-w-xl`}
            style={{ color: dark ? "#94a3b8" : "#6b7280" }}
          >
            {state.subtext}
          </p>
        )}
        {state.ctaLabel && (
          <a
            href={state.ctaHref}
            className="inline-block mt-2 px-6 py-2.5 rounded-lg text-sm font-bold text-white"
            style={{ background: NAVY }}
          >
            {state.ctaLabel}
          </a>
        )}
      </div>
    </section>
  );
}

export function HeadingEditor({
  state, onChange,
}: { state: HeadingState; onChange: (u: Partial<HeadingState>) => void }) {
  return (
    <div className="flex flex-col gap-4 px-4 pb-4 pt-1">
      <div>
        <label className={LABEL}>Headline text</label>
        <textarea value={state.text} onChange={(e) => onChange({ text: e.target.value })} rows={2} className={TEXTAREA} placeholder="Your headline" />
      </div>
      <div>
        <label className={LABEL}>Supporting text</label>
        <textarea value={state.subtext} onChange={(e) => onChange({ subtext: e.target.value })} rows={2} className={TEXTAREA} placeholder="Supporting statement…" />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={LABEL}>Tag level</label>
          <select value={state.level} onChange={(e) => onChange({ level: e.target.value as HeadingState["level"] })} className={INPUT}>
            <option value="h1">H1 — Page title</option>
            <option value="h2">H2 — Section</option>
            <option value="h3">H3 — Sub-section</option>
            <option value="h4">H4 — Minor</option>
          </select>
        </div>
        <div>
          <label className={LABEL}>Font size</label>
          <select value={state.size} onChange={(e) => onChange({ size: e.target.value as HeadingState["size"] })} className={INPUT}>
            <option value="sm">Small</option>
            <option value="md">Medium</option>
            <option value="lg">Large</option>
            <option value="xl">Extra large</option>
          </select>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={LABEL}>Alignment</label>
          <select value={state.align} onChange={(e) => onChange({ align: e.target.value as HeadingState["align"] })} className={INPUT}>
            <option value="left">Left</option>
            <option value="center">Center</option>
            <option value="right">Right</option>
          </select>
        </div>
        <div>
          <label className={LABEL}>Accent color</label>
          <select value={state.accentColor} onChange={(e) => onChange({ accentColor: e.target.value as HeadingState["accentColor"] })} className={INPUT}>
            <option value="none">None</option>
            <option value="amber">Amber</option>
            <option value="teal">Teal</option>
            <option value="navy">Navy</option>
          </select>
        </div>
      </div>
      <div>
        <label className={LABEL}>Background</label>
        <select value={state.bgStyle} onChange={(e) => onChange({ bgStyle: e.target.value as HeadingState["bgStyle"] })} className={INPUT}>
          {BG_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      </div>
      <div className="flex items-center gap-2">
        <input type="checkbox" id="heading-divider" checked={state.showDivider} onChange={(e) => onChange({ showDivider: e.target.checked })} className="rounded" />
        <label htmlFor="heading-divider" className="text-xs text-gray-600">Show horizontal divider</label>
      </div>
      <div>
        <label className={LABEL}>CTA button label (optional)</label>
        <input type="text" value={state.ctaLabel} onChange={(e) => onChange({ ctaLabel: e.target.value })} className={INPUT} placeholder="Leave blank to hide" />
      </div>
      {state.ctaLabel && (
        <div>
          <label className={LABEL}>CTA link</label>
          <input type="text" value={state.ctaHref} onChange={(e) => onChange({ ctaHref: e.target.value })} className={INPUT} placeholder="#" />
        </div>
      )}
    </div>
  );
}

export function HeadingThumbnail() {
  return (
    <div className="flex flex-col items-center justify-center h-full gap-[3px] px-2 bg-white">
      <div className="w-5 h-[2px] rounded-full" style={{ background: AMBER }} />
      <span className="text-[9px] font-extrabold leading-tight text-center" style={{ color: NAVY }}>Advanced Specialty Care</span>
      <span className="text-[5px] text-gray-400 text-center leading-tight">Austin's trusted 24/7 emergency center</span>
    </div>
  );
}

// ─── ParagraphSection ─────────────────────────────────────────────────────────

export interface ParagraphState {
  content: string;
  align: "left" | "center" | "right";
  maxWidth: "narrow" | "normal" | "wide";
  leadParagraph: boolean;
  bgStyle: "white" | "light" | "dark" | "navy";
}

export function createDefaultParagraph(): ParagraphState {
  return {
    content:
      "This is your paragraph content. Write your body copy here — keep it clear, concise, and focused on what matters most to your readers.\n\nYou can add a second paragraph by leaving a blank line. This lets you break up longer content into digestible sections that guide the reader naturally through your message.",
    align: "left",
    maxWidth: "normal",
    leadParagraph: false,
    bgStyle: "white",
  };
}

const MAX_WIDTH: Record<ParagraphState["maxWidth"], string> = {
  narrow: "max-w-xl",
  normal: "max-w-2xl",
  wide: "max-w-4xl",
};

export function ParagraphSectionRenderer({
  state, isDark, compact,
}: { state: ParagraphState; isDark: boolean; compact: boolean }) {
  const bg = getBg(state.bgStyle, isDark);
  const dark = isDarkBg(state.bgStyle, isDark);
  const paras = state.content.split(/\n\n+/).filter(Boolean);
  const alignClass = { left: "text-left", center: "text-center", right: "text-right" }[state.align];
  const mxClass = state.align === "center" ? "mx-auto" : "";

  return (
    <section
      className="px-6 py-10"
      style={{ background: bg, borderTop: `1px solid ${dark ? "rgba(255,255,255,0.06)" : "#f0f0f2"}` }}
      aria-label="Paragraph"
    >
      <div className={`${MAX_WIDTH[state.maxWidth]} ${mxClass} flex flex-col gap-4 ${alignClass}`}>
        {paras.map((para, i) => (
          <p
            key={i}
            className={i === 0 && state.leadParagraph && !compact ? "text-lg font-medium leading-relaxed" : "text-base leading-relaxed"}
            style={{ color: dark ? "#cbd5e1" : "#374151" }}
          >
            {para}
          </p>
        ))}
      </div>
    </section>
  );
}

export function ParagraphEditor({
  state, onChange,
}: { state: ParagraphState; onChange: (u: Partial<ParagraphState>) => void }) {
  return (
    <div className="flex flex-col gap-4 px-4 pb-4 pt-1">
      <div>
        <label className={LABEL}>Content (blank line = new paragraph)</label>
        <textarea value={state.content} onChange={(e) => onChange({ content: e.target.value })} rows={8} className={TEXTAREA} placeholder="Your paragraph content…" />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={LABEL}>Alignment</label>
          <select value={state.align} onChange={(e) => onChange({ align: e.target.value as ParagraphState["align"] })} className={INPUT}>
            <option value="left">Left</option>
            <option value="center">Center</option>
            <option value="right">Right</option>
          </select>
        </div>
        <div>
          <label className={LABEL}>Max width</label>
          <select value={state.maxWidth} onChange={(e) => onChange({ maxWidth: e.target.value as ParagraphState["maxWidth"] })} className={INPUT}>
            <option value="narrow">Narrow</option>
            <option value="normal">Normal</option>
            <option value="wide">Wide</option>
          </select>
        </div>
      </div>
      <div>
        <label className={LABEL}>Background</label>
        <select value={state.bgStyle} onChange={(e) => onChange({ bgStyle: e.target.value as ParagraphState["bgStyle"] })} className={INPUT}>
          {BG_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      </div>
      <div className="flex items-center gap-2">
        <input type="checkbox" id="para-lead" checked={state.leadParagraph} onChange={(e) => onChange({ leadParagraph: e.target.checked })} className="rounded" />
        <label htmlFor="para-lead" className="text-xs text-gray-600">First paragraph larger (lead text)</label>
      </div>
    </div>
  );
}

export function ParagraphThumbnail() {
  return (
    <div className="flex flex-col justify-center gap-[2.5px] px-2 py-1 h-full bg-white">
      <span className="text-[6px] font-semibold text-gray-700 leading-tight">About Our Practice</span>
      {[100, 97, 88, 100, 92, 75].map((w, i) => (
        <div key={i} className="h-[2px] bg-gray-300 rounded" style={{ width: `${w}%` }} />
      ))}
    </div>
  );
}

// ─── TextBlockSection ─────────────────────────────────────────────────────────
// The "combine" section: Heading + Body + Image + optional CTA

export interface TextBlockState {
  overline: string;
  heading: string;
  body: string;
  imageUrl: string;
  imageAlt: string;
  imagePosition: "none" | "right" | "left" | "top";
  ctaLabel: string;
  ctaHref: string;
  ctaStyle: "primary" | "outline" | "link";
  align: "left" | "center";
  bgStyle: "white" | "light" | "dark" | "navy";
}

export function createDefaultTextBlock(): TextBlockState {
  return {
    overline: "Our Approach",
    heading: "Combining Expertise with Compassionate Care",
    body: "We believe exceptional veterinary medicine starts with listening. Our board-certified team takes the time to understand your pet's history, lifestyle, and unique needs before recommending any treatment path.\n\nFrom routine wellness checks to complex specialty procedures, we bring the same level of precision and empathy to every case — because your pet deserves nothing less.",
    imageUrl: "https://images.unsplash.com/photo-1576201836106-db1758fd1c97?w=800&auto=format&fit=crop&q=80",
    imageAlt: "Veterinarian examining a pet",
    imagePosition: "right",
    ctaLabel: "Learn about our team",
    ctaHref: "#",
    ctaStyle: "primary",
    align: "left",
    bgStyle: "white",
  };
}

export function TextBlockSectionRenderer({
  state, isDark, compact,
}: { state: TextBlockState; isDark: boolean; compact: boolean }) {
  const bg = getBg(state.bgStyle, isDark);
  const dark = isDarkBg(state.bgStyle, isDark);
  const paras = state.body.split(/\n\n+/).filter(Boolean);
  const hasImage = state.imagePosition !== "none" && state.imageUrl;
  const isTop = state.imagePosition === "top";
  const isLeft = state.imagePosition === "left";
  const centerClass = state.align === "center" ? "text-center items-center" : "";

  const ctaBg = dark ? "#ffffff" : NAVY;
  const ctaColor = dark ? NAVY : "#ffffff";

  return (
    <section
      className="px-6 py-14"
      style={{ background: bg, borderTop: `1px solid ${dark ? "rgba(255,255,255,0.06)" : "#f0f0f2"}` }}
      aria-label="Text Block"
    >
      <div className="max-w-4xl mx-auto">
        {hasImage && isTop && (
          <div className="w-full rounded-2xl overflow-hidden mb-10" style={{ maxHeight: 400 }}>
            <img src={state.imageUrl} alt={state.imageAlt} className="w-full h-full object-cover" loading="lazy"
              onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }} />
          </div>
        )}

        <div
          className={`flex gap-10 ${compact || isTop ? "flex-col" : "flex-row"} ${isLeft && !compact ? "" : ""}`}
          style={!compact && !isTop ? { flexDirection: isLeft ? "row-reverse" : "row" } : {}}
        >
          {/* Text side */}
          <div className={`flex-1 flex flex-col gap-4 ${centerClass}`}>
            {state.overline && (
              <p className="text-xs font-bold uppercase tracking-widest" style={{ color: AMBER }}>
                {state.overline}
              </p>
            )}
            <h2
              className={`font-extrabold leading-tight ${compact ? "text-2xl" : "text-3xl"}`}
              style={{ color: dark ? "#f1f5f9" : "#111827" }}
            >
              {state.heading}
            </h2>
            <div className="flex flex-col gap-3">
              {paras.map((para, i) => (
                <p key={i} className="text-base leading-relaxed" style={{ color: dark ? "#94a3b8" : "#374151" }}>
                  {para}
                </p>
              ))}
            </div>
            {state.ctaLabel && (
              <div className="mt-2">
                {state.ctaStyle === "primary" && (
                  <a href={state.ctaHref} className="inline-block px-6 py-2.5 rounded-lg text-sm font-bold"
                    style={{ background: ctaBg, color: ctaColor }}>
                    {state.ctaLabel}
                  </a>
                )}
                {state.ctaStyle === "outline" && (
                  <a href={state.ctaHref} className="inline-block px-6 py-2.5 rounded-lg text-sm font-bold border-2"
                    style={{ borderColor: dark ? "#ffffff" : NAVY, color: dark ? "#ffffff" : NAVY }}>
                    {state.ctaLabel}
                  </a>
                )}
                {state.ctaStyle === "link" && (
                  <a href={state.ctaHref} className="inline-flex items-center gap-1.5 text-sm font-bold"
                    style={{ color: dark ? "#94a3b8" : NAVY }}>
                    {state.ctaLabel} <span>→</span>
                  </a>
                )}
              </div>
            )}
          </div>

          {/* Image side */}
          {hasImage && !isTop && (
            <div className="flex-1 rounded-2xl overflow-hidden shrink-0"
              style={{ maxWidth: compact ? "100%" : "45%", minHeight: 280, background: dark ? "#1e293b" : "#e5e7eb" }}>
              <img src={state.imageUrl} alt={state.imageAlt} className="w-full h-full object-cover"
                loading="lazy"
                onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }} />
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

export function TextBlockEditor({
  state, onChange,
}: { state: TextBlockState; onChange: (u: Partial<TextBlockState>) => void }) {
  return (
    <div className="flex flex-col gap-4 px-4 pb-4 pt-1">
      <div>
        <label className={LABEL}>Overline (small text above heading)</label>
        <input type="text" value={state.overline} onChange={(e) => onChange({ overline: e.target.value })} className={INPUT} placeholder="Our Approach" />
      </div>
      <div>
        <label className={LABEL}>Heading</label>
        <textarea value={state.heading} onChange={(e) => onChange({ heading: e.target.value })} rows={2} className={TEXTAREA} placeholder="Main headline" />
      </div>
      <div>
        <label className={LABEL}>Body text (blank line = new paragraph)</label>
        <textarea value={state.body} onChange={(e) => onChange({ body: e.target.value })} rows={6} className={TEXTAREA} placeholder="Body content…" />
      </div>
      <div>
        <label className={LABEL}>Image URL</label>
        <input type="text" value={state.imageUrl} onChange={(e) => onChange({ imageUrl: e.target.value })} className={INPUT} placeholder="https://…" />
      </div>
      <div>
        <label className={LABEL}>Image alt text</label>
        <input type="text" value={state.imageAlt} onChange={(e) => onChange({ imageAlt: e.target.value })} className={INPUT} placeholder="Description for accessibility" />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={LABEL}>Image position</label>
          <select value={state.imagePosition} onChange={(e) => onChange({ imagePosition: e.target.value as TextBlockState["imagePosition"] })} className={INPUT}>
            <option value="none">No image</option>
            <option value="right">Right of text</option>
            <option value="left">Left of text</option>
            <option value="top">Above text</option>
          </select>
        </div>
        <div>
          <label className={LABEL}>Alignment</label>
          <select value={state.align} onChange={(e) => onChange({ align: e.target.value as TextBlockState["align"] })} className={INPUT}>
            <option value="left">Left</option>
            <option value="center">Center</option>
          </select>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={LABEL}>CTA button label</label>
          <input type="text" value={state.ctaLabel} onChange={(e) => onChange({ ctaLabel: e.target.value })} className={INPUT} placeholder="Leave blank to hide" />
        </div>
        <div>
          <label className={LABEL}>CTA style</label>
          <select value={state.ctaStyle} onChange={(e) => onChange({ ctaStyle: e.target.value as TextBlockState["ctaStyle"] })} className={INPUT}>
            <option value="primary">Filled</option>
            <option value="outline">Outline</option>
            <option value="link">Text link →</option>
          </select>
        </div>
      </div>
      {state.ctaLabel && (
        <div>
          <label className={LABEL}>CTA link</label>
          <input type="text" value={state.ctaHref} onChange={(e) => onChange({ ctaHref: e.target.value })} className={INPUT} placeholder="#" />
        </div>
      )}
      <div>
        <label className={LABEL}>Background</label>
        <select value={state.bgStyle} onChange={(e) => onChange({ bgStyle: e.target.value as TextBlockState["bgStyle"] })} className={INPUT}>
          {BG_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      </div>
    </div>
  );
}

export function TextBlockThumbnail() {
  return (
    <div className="flex h-full bg-white">
      <div className="flex-1 flex flex-col justify-center gap-[2.5px] px-1.5 py-1">
        <span className="text-[4.5px] font-bold uppercase tracking-wider" style={{ color: TEAL }}>Our Approach</span>
        <span className="text-[7px] font-extrabold leading-tight" style={{ color: NAVY }}>Combining Expertise with Care</span>
        <div className="h-[1.5px] bg-gray-200 rounded w-full" />
        <div className="h-[1.5px] bg-gray-200 rounded w-4/5" />
        <div className="h-[1.5px] bg-gray-200 rounded w-full" />
        <span className="text-[5px] font-semibold text-white rounded mt-0.5 px-1.5 py-[2px] self-start" style={{ background: NAVY }}>Learn more</span>
      </div>
      <div className="w-[38%] overflow-hidden shrink-0">
        <img src="https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=80&h=80&fit=crop&q=70" alt="" className="w-full h-full object-cover" />
      </div>
    </div>
  );
}

// ─── BlockQuoteSection ────────────────────────────────────────────────────────

export interface BlockQuoteState {
  quote: string;
  author: string;
  authorTitle: string;
  authorPhotoUrl: string;
  accentColor: "amber" | "teal" | "navy";
  align: "left" | "center";
  bgStyle: "white" | "light" | "dark" | "navy";
}

export function createDefaultBlockQuote(): BlockQuoteState {
  return {
    quote: "The team here went above and beyond for our dog Max. From the initial diagnosis to post-surgery follow-up, every step of the process was handled with exceptional care and professionalism.",
    author: "Sarah M.",
    authorTitle: "Pet Owner",
    authorPhotoUrl: "",
    accentColor: "amber",
    align: "center",
    bgStyle: "light",
  };
}

export function BlockQuoteSectionRenderer({
  state, isDark, compact,
}: { state: BlockQuoteState; isDark: boolean; compact: boolean }) {
  const bg = getBg(state.bgStyle, isDark);
  const dark = isDarkBg(state.bgStyle, isDark);
  const accent = ACCENT_COLOR[state.accentColor];
  const centerClass = state.align === "center" ? "text-center items-center" : "";
  const initials = state.author ? state.author.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase() : "?";

  return (
    <section
      className="px-6 py-14"
      style={{ background: bg, borderTop: `1px solid ${dark ? "rgba(255,255,255,0.06)" : "#f0f0f2"}` }}
      aria-label="Block Quote"
    >
      <div className={`max-w-2xl mx-auto flex flex-col gap-6 ${centerClass}`}>
        {/* Large quote mark */}
        <div className="text-5xl font-black leading-none" style={{ color: accent, lineHeight: 0.8 }}>"</div>

        <blockquote
          className={`${compact ? "text-lg" : "text-xl"} font-medium leading-relaxed`}
          style={{ color: dark ? "#e2e8f0" : "#1e293b" }}
        >
          {state.quote}
        </blockquote>

        {(state.author || state.authorTitle) && (
          <div className={`flex items-center gap-3 ${state.align === "center" ? "justify-center" : ""}`}>
            {state.authorPhotoUrl ? (
              <img src={state.authorPhotoUrl} alt={state.author} className="w-10 h-10 rounded-full object-cover"
                onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }} />
            ) : (
              <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-white shrink-0"
                style={{ background: accent }}>
                {initials}
              </div>
            )}
            <div>
              {state.author && (
                <p className="text-sm font-bold" style={{ color: dark ? "#f1f5f9" : "#111827" }}>{state.author}</p>
              )}
              {state.authorTitle && (
                <p className="text-xs" style={{ color: dark ? "#64748b" : "#9ca3af" }}>{state.authorTitle}</p>
              )}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

export function BlockQuoteEditor({
  state, onChange,
}: { state: BlockQuoteState; onChange: (u: Partial<BlockQuoteState>) => void }) {
  return (
    <div className="flex flex-col gap-4 px-4 pb-4 pt-1">
      <div>
        <label className={LABEL}>Quote text</label>
        <textarea value={state.quote} onChange={(e) => onChange({ quote: e.target.value })} rows={4} className={TEXTAREA} placeholder="The quote content…" />
      </div>
      <div>
        <label className={LABEL}>Author name</label>
        <input type="text" value={state.author} onChange={(e) => onChange({ author: e.target.value })} className={INPUT} placeholder="Jane Smith" />
      </div>
      <div>
        <label className={LABEL}>Author title / role</label>
        <input type="text" value={state.authorTitle} onChange={(e) => onChange({ authorTitle: e.target.value })} className={INPUT} placeholder="CEO, Company Name" />
      </div>
      <div>
        <label className={LABEL}>Author photo URL (optional)</label>
        <input type="text" value={state.authorPhotoUrl} onChange={(e) => onChange({ authorPhotoUrl: e.target.value })} className={INPUT} placeholder="https://…" />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={LABEL}>Accent color</label>
          <select value={state.accentColor} onChange={(e) => onChange({ accentColor: e.target.value as BlockQuoteState["accentColor"] })} className={INPUT}>
            <option value="amber">Amber</option>
            <option value="teal">Teal</option>
            <option value="navy">Navy</option>
          </select>
        </div>
        <div>
          <label className={LABEL}>Alignment</label>
          <select value={state.align} onChange={(e) => onChange({ align: e.target.value as BlockQuoteState["align"] })} className={INPUT}>
            <option value="left">Left</option>
            <option value="center">Center</option>
          </select>
        </div>
      </div>
      <div>
        <label className={LABEL}>Background</label>
        <select value={state.bgStyle} onChange={(e) => onChange({ bgStyle: e.target.value as BlockQuoteState["bgStyle"] })} className={INPUT}>
          {BG_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      </div>
    </div>
  );
}

export function BlockQuoteThumbnail() {
  return (
    <div className="flex flex-col items-center justify-center h-full gap-1 px-2 bg-gray-50">
      <span className="text-[18px] font-serif leading-none" style={{ color: AMBER }}>"</span>
      <span className="text-[5px] italic text-gray-600 text-center leading-tight">The team went above and beyond for our dog. Exceptional care from start to finish.</span>
      <div className="flex items-center gap-1 mt-0.5">
        <img src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=32&h=32&fit=crop&q=70" alt="" className="w-3 h-3 rounded-full object-cover" />
        <span className="text-[5px] font-semibold text-gray-700">Sarah M. · Austin, TX</span>
      </div>
    </div>
  );
}

// ─── RichTextSection ──────────────────────────────────────────────────────────

export interface RichTextState {
  title: string;
  content: string; // multi-paragraph, supports **bold** and *italic* markdown-lite
  imageUrl: string;
  imageAlt: string;
  imageCaption: string;
  bgStyle: "white" | "light" | "dark" | "navy";
  maxWidth: "narrow" | "normal" | "wide";
}

export function createDefaultRichText(): RichTextState {
  return {
    title: "A Closer Look at Advanced Veterinary Care",
    content:
      "When your pet faces a complex health challenge, having the right specialists on your side makes all the difference. Our team of board-certified veterinarians brings deep expertise across multiple disciplines — ensuring your pet receives the most accurate diagnosis and effective treatment plan available.\n\nFrom advanced diagnostic imaging to minimally invasive surgery, we combine cutting-edge technology with compassionate clinical care.\n\nWe understand that every pet is different, and we tailor our approach accordingly.",
    imageUrl: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=800&auto=format&fit=crop&q=80",
    imageAlt: "Veterinarian with patient",
    imageCaption: "Our specialists are available 24/7 for emergency and critical care.",
    bgStyle: "white",
    maxWidth: "normal",
  };
}

function renderRichContent(text: string, color: string) {
  // Simple line-based renderer — each line is a paragraph
  return text.split(/\n+/).filter(Boolean).map((line, i) => (
    <p key={i} className="text-base leading-relaxed" style={{ color }}>
      {line}
    </p>
  ));
}

export function RichTextSectionRenderer({
  state, isDark, compact,
}: { state: RichTextState; isDark: boolean; compact: boolean }) {
  const bg = getBg(state.bgStyle, isDark);
  const dark = isDarkBg(state.bgStyle, isDark);
  const mw = MAX_WIDTH[state.maxWidth];

  return (
    <section
      className="px-6 py-14"
      style={{ background: bg, borderTop: `1px solid ${dark ? "rgba(255,255,255,0.06)" : "#f0f0f2"}` }}
      aria-label="Rich Text"
    >
      <div className={`${mw} mx-auto flex flex-col gap-5`}>
        {state.title && (
          <h2 className={`font-extrabold leading-tight ${compact ? "text-2xl" : "text-3xl"}`}
            style={{ color: dark ? "#f1f5f9" : "#111827" }}>
            {state.title}
          </h2>
        )}

        {state.imageUrl && (
          <div className="w-full rounded-xl overflow-hidden" style={{ maxHeight: 360 }}>
            <img src={state.imageUrl} alt={state.imageAlt} className="w-full h-full object-cover" loading="lazy"
              onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }} />
            {state.imageCaption && (
              <p className="text-xs text-center mt-2 italic" style={{ color: dark ? "#64748b" : "#9ca3af" }}>
                {state.imageCaption}
              </p>
            )}
          </div>
        )}

        <div className="flex flex-col gap-3">
          {renderRichContent(state.content, dark ? "#cbd5e1" : "#374151")}
        </div>
      </div>
    </section>
  );
}

export function RichTextEditor({
  state, onChange,
}: { state: RichTextState; onChange: (u: Partial<RichTextState>) => void }) {
  return (
    <div className="flex flex-col gap-4 px-4 pb-4 pt-1">
      <div>
        <label className={LABEL}>Title</label>
        <input type="text" value={state.title} onChange={(e) => onChange({ title: e.target.value })} className={INPUT} placeholder="Article or section title" />
      </div>
      <div>
        <label className={LABEL}>Body content (blank line = new paragraph)</label>
        <textarea value={state.content} onChange={(e) => onChange({ content: e.target.value })} rows={8} className={TEXTAREA} placeholder="Article body…" />
      </div>
      <div>
        <label className={LABEL}>Image URL (optional)</label>
        <input type="text" value={state.imageUrl} onChange={(e) => onChange({ imageUrl: e.target.value })} className={INPUT} placeholder="https://…" />
      </div>
      {state.imageUrl && (
        <>
          <div>
            <label className={LABEL}>Image alt text</label>
            <input type="text" value={state.imageAlt} onChange={(e) => onChange({ imageAlt: e.target.value })} className={INPUT} placeholder="Image description" />
          </div>
          <div>
            <label className={LABEL}>Image caption</label>
            <input type="text" value={state.imageCaption} onChange={(e) => onChange({ imageCaption: e.target.value })} className={INPUT} placeholder="Optional caption below image" />
          </div>
        </>
      )}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={LABEL}>Max width</label>
          <select value={state.maxWidth} onChange={(e) => onChange({ maxWidth: e.target.value as RichTextState["maxWidth"] })} className={INPUT}>
            <option value="narrow">Narrow</option>
            <option value="normal">Normal</option>
            <option value="wide">Wide</option>
          </select>
        </div>
        <div>
          <label className={LABEL}>Background</label>
          <select value={state.bgStyle} onChange={(e) => onChange({ bgStyle: e.target.value as RichTextState["bgStyle"] })} className={INPUT}>
            {BG_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </div>
      </div>
    </div>
  );
}

export function RichTextThumbnail() {
  return (
    <div className="flex gap-1 h-full px-1.5 py-1 bg-white items-start">
      <div className="flex-1 flex flex-col gap-[2px]">
        <span className="text-[7px] font-extrabold leading-tight" style={{ color: NAVY }}>About Our Clinic</span>
        <div className="h-[1.5px] bg-gray-200 rounded w-full" />
        <div className="h-[1.5px] bg-gray-200 rounded w-11/12" />
        <div className="h-[1.5px] bg-gray-200 rounded w-full" />
        <div className="h-[1.5px] bg-gray-200 rounded w-3/4" />
        <div className="h-[1.5px] bg-gray-200 rounded w-full" />
      </div>
      <div className="w-[36%] shrink-0 overflow-hidden rounded-sm" style={{ height: 38 }}>
        <img src="https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=80&h=80&fit=crop&q=70" alt="" className="w-full h-full object-cover" />
      </div>
    </div>
  );
}
