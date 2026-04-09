// ─── Hero Sections ─────────────────────────────────────────────────────────────
// HeroCenteredSection, HeroSplitSection

const NAVY = "#1B2B4B";
const AMBER = "#F59E0B";
const TEAL = "#0F766E";

import { input as inputTokens } from "../../../lib/styles/tokens";

const INPUT = inputTokens.compact;

const TEXTAREA =
  "w-full px-2.5 py-1.5 text-sm text-gray-900 bg-white border border-gray-200 rounded-md " +
  "placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-600 " +
  "focus:border-teal-600 transition-colors resize-none";

const LABEL = "block text-xs font-medium text-gray-600 mb-1";

// ─── HeroCenteredSection ──────────────────────────────────────────────────────

export interface HeroCenteredState {
  overline: string;
  headline: string;
  subheadline: string;
  primaryCtaLabel: string;
  primaryCtaHref: string;
  secondaryCtaLabel: string;
  secondaryCtaHref: string;
  backgroundImageUrl: string;
  overlayDarkness: number; // 0–90
  minHeight: "sm" | "md" | "lg" | "screen";
  badgeText: string;
  showTrustBadge: boolean;
  trustText: string;
}

export function createDefaultHeroCentered(): HeroCenteredState {
  return {
    overline: "Board-Certified Specialists",
    headline: "Advanced Care for the Pets You Love",
    subheadline: "Austin's only 24/7 specialty & emergency center staffed by board-certified specialists in internal medicine, surgery, and critical care.",
    primaryCtaLabel: "Book an Appointment",
    primaryCtaHref: "#",
    secondaryCtaLabel: "Explore Services",
    secondaryCtaHref: "#",
    backgroundImageUrl: "https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=1400&auto=format&fit=crop&q=80",
    overlayDarkness: 60,
    minHeight: "lg",
    badgeText: "Now Open & Taking Patients",
    showTrustBadge: true,
    trustText: "AAHA Accredited · Fear Free Certified",
  };
}

const HERO_HEIGHT: Record<HeroCenteredState["minHeight"], string> = {
  sm: "320px",
  md: "480px",
  lg: "600px",
  screen: "100vh",
};

export function HeroCenteredSectionRenderer({
  state, isDark, compact,
}: { state: HeroCenteredState; isDark: boolean; compact: boolean }) {
  const overlay = `rgba(${isDark ? "0,0,0" : "15,23,42"},${state.overlayDarkness / 100})`;
  const minH = compact ? "280px" : HERO_HEIGHT[state.minHeight];

  return (
    <section
      className="relative flex items-center justify-center px-6"
      style={{ minHeight: minH, background: NAVY }}
      aria-label="Hero Centered"
    >
      {/* Background image */}
      {state.backgroundImageUrl && (
        <img
          src={state.backgroundImageUrl}
          alt=""
          className="absolute inset-0 w-full h-full object-cover"
          loading="lazy"
          onError={(e) => { (e.currentTarget as HTMLImageElement).style.opacity = "0"; }}
        />
      )}
      {/* Overlay */}
      <div className="absolute inset-0" style={{ background: overlay }} />

      {/* Content */}
      <div className="relative z-10 max-w-3xl mx-auto text-center flex flex-col items-center gap-5 py-16">
        {state.badgeText && (
          <span className="inline-block text-xs font-bold px-3 py-1.5 rounded-full"
            style={{ background: `${AMBER}25`, color: AMBER, border: `1px solid ${AMBER}40` }}>
            {state.badgeText}
          </span>
        )}

        {state.overline && (
          <p className="text-xs font-bold uppercase tracking-widest" style={{ color: "rgba(255,255,255,0.65)" }}>
            {state.overline}
          </p>
        )}

        <h1
          className={`font-extrabold leading-tight text-white ${compact ? "text-3xl" : "text-4xl md:text-5xl"}`}
        >
          {state.headline}
        </h1>

        {state.subheadline && (
          <p className={`${compact ? "text-base" : "text-lg"} leading-relaxed max-w-xl`}
            style={{ color: "rgba(255,255,255,0.75)" }}>
            {state.subheadline}
          </p>
        )}

        <div className="flex flex-wrap gap-3 justify-center">
          {state.primaryCtaLabel && (
            <a href={state.primaryCtaHref}
              className="inline-block px-6 py-3 rounded-xl text-sm font-bold text-white shadow-lg"
              style={{ background: TEAL }}>
              {state.primaryCtaLabel}
            </a>
          )}
          {state.secondaryCtaLabel && (
            <a href={state.secondaryCtaHref}
              className="inline-block px-6 py-3 rounded-xl text-sm font-bold border-2"
              style={{ borderColor: "rgba(255,255,255,0.4)", color: "#ffffff" }}>
              {state.secondaryCtaLabel}
            </a>
          )}
        </div>

        {state.showTrustBadge && state.trustText && (
          <p className="text-xs font-medium mt-2" style={{ color: "rgba(255,255,255,0.45)" }}>
            {state.trustText}
          </p>
        )}
      </div>
    </section>
  );
}

export function HeroCenteredEditor({
  state, onChange,
}: { state: HeroCenteredState; onChange: (u: Partial<HeroCenteredState>) => void }) {
  return (
    <div className="flex flex-col gap-4 px-4 pb-4 pt-1">
      <div>
        <label className={LABEL}>Badge text (top pill)</label>
        <input type="text" value={state.badgeText} onChange={(e) => onChange({ badgeText: e.target.value })} className={INPUT} placeholder="Now Open & Taking Patients" />
      </div>
      <div>
        <label className={LABEL}>Overline (small text above headline)</label>
        <input type="text" value={state.overline} onChange={(e) => onChange({ overline: e.target.value })} className={INPUT} placeholder="Board-Certified Specialists" />
      </div>
      <div>
        <label className={LABEL}>Headline</label>
        <textarea value={state.headline} onChange={(e) => onChange({ headline: e.target.value })} rows={2} className={TEXTAREA} placeholder="Your main headline" />
      </div>
      <div>
        <label className={LABEL}>Subheadline</label>
        <textarea value={state.subheadline} onChange={(e) => onChange({ subheadline: e.target.value })} rows={3} className={TEXTAREA} placeholder="Supporting statement…" />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={LABEL}>Primary CTA label</label>
          <input type="text" value={state.primaryCtaLabel} onChange={(e) => onChange({ primaryCtaLabel: e.target.value })} className={INPUT} placeholder="Book an Appointment" />
        </div>
        <div>
          <label className={LABEL}>Primary CTA link</label>
          <input type="text" value={state.primaryCtaHref} onChange={(e) => onChange({ primaryCtaHref: e.target.value })} className={INPUT} placeholder="#" />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={LABEL}>Secondary CTA label</label>
          <input type="text" value={state.secondaryCtaLabel} onChange={(e) => onChange({ secondaryCtaLabel: e.target.value })} className={INPUT} placeholder="Explore Services" />
        </div>
        <div>
          <label className={LABEL}>Secondary CTA link</label>
          <input type="text" value={state.secondaryCtaHref} onChange={(e) => onChange({ secondaryCtaHref: e.target.value })} className={INPUT} placeholder="#" />
        </div>
      </div>
      <div>
        <label className={LABEL}>Background image URL</label>
        <input type="text" value={state.backgroundImageUrl} onChange={(e) => onChange({ backgroundImageUrl: e.target.value })} className={INPUT} placeholder="https://…" />
      </div>
      <div>
        <label className={LABEL}>Overlay darkness: {state.overlayDarkness}%</label>
        <input type="range" min={0} max={90} value={state.overlayDarkness} onChange={(e) => onChange({ overlayDarkness: Number(e.target.value) })} className="w-full accent-teal-600" />
      </div>
      <div>
        <label className={LABEL}>Section height</label>
        <select value={state.minHeight} onChange={(e) => onChange({ minHeight: e.target.value as HeroCenteredState["minHeight"] })} className={INPUT}>
          <option value="sm">Small (320px)</option>
          <option value="md">Medium (480px)</option>
          <option value="lg">Large (600px)</option>
          <option value="screen">Full screen</option>
        </select>
      </div>
      <div>
        <label className={LABEL}>Trust badge text (shown below CTAs)</label>
        <input type="text" value={state.trustText} onChange={(e) => onChange({ trustText: e.target.value })} className={INPUT} placeholder="AAHA Accredited · Fear Free Certified" />
      </div>
      <div className="flex items-center gap-2">
        <input type="checkbox" id="show-trust" checked={state.showTrustBadge} onChange={(e) => onChange({ showTrustBadge: e.target.checked })} className="rounded" />
        <label htmlFor="show-trust" className="text-xs text-gray-600">Show trust badge</label>
      </div>
    </div>
  );
}

export function HeroCenteredThumbnail() {
  return (
    <div className="relative h-full w-full overflow-hidden">
      <img
        src="https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=200&h=80&fit=crop&q=70"
        alt="" className="absolute inset-0 w-full h-full object-cover"
      />
      <div className="absolute inset-0" style={{ background: "rgba(15,23,42,0.68)" }} />
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-[3px] px-2">
        <span className="text-[4.5px] font-bold uppercase tracking-widest" style={{ color: "#6ee7b7" }}>Now Open · Taking Patients</span>
        <span className="text-[8px] font-black text-white leading-tight text-center">Advanced Care for the Pets You Love</span>
        <div className="flex gap-1 mt-1">
          <span className="text-[5px] font-bold rounded-full px-2 py-[2px] bg-white" style={{ color: "#0f766e" }}>Book Now</span>
          <span className="text-[5px] font-medium text-white rounded-full px-2 py-[2px] border" style={{ borderColor: "rgba(255,255,255,0.4)" }}>Learn More</span>
        </div>
      </div>
    </div>
  );
}

// ─── HeroSplitSection ─────────────────────────────────────────────────────────

export interface HeroSplitState {
  overline: string;
  headline: string;
  subheadline: string;
  primaryCtaLabel: string;
  primaryCtaHref: string;
  secondaryCtaLabel: string;
  secondaryCtaHref: string;
  imageUrl: string;
  imageAlt: string;
  imagePosition: "right" | "left";
  bgStyle: "white" | "light" | "navy" | "dark";
  trustItems: string; // comma-separated short trust chips
}

export function createDefaultHeroSplit(): HeroSplitState {
  return {
    overline: "24/7 Specialty Care",
    headline: "Your Pet Deserves the Best Care Available",
    subheadline: "Our board-certified specialists bring hospital-level expertise to every patient — from routine diagnostics to life-saving emergency procedures.",
    primaryCtaLabel: "Book an Appointment",
    primaryCtaHref: "#",
    secondaryCtaLabel: "Our Specialties",
    secondaryCtaHref: "#",
    imageUrl: "https://images.unsplash.com/photo-1548767797-d8c844163c4c?w=800&auto=format&fit=crop&q=80",
    imageAlt: "Happy pet at the clinic",
    imagePosition: "right",
    bgStyle: "white",
    trustItems: "AAHA Accredited, Fear Free Certified, 24/7 Emergency",
  };
}

export function HeroSplitSectionRenderer({
  state, isDark, compact,
}: { state: HeroSplitState; isDark: boolean; compact: boolean }) {
  const dark = isDark || state.bgStyle === "navy" || state.bgStyle === "dark";
  const bg =
    isDark ? (state.bgStyle === "navy" ? "#0b1628" : "#0f172a") :
    state.bgStyle === "navy" ? NAVY :
    state.bgStyle === "dark" ? "#1e293b" :
    state.bgStyle === "light" ? "#f8f9fb" : "#ffffff";

  const isImageLeft = state.imagePosition === "left";
  const trustChips = state.trustItems.split(",").map(s => s.trim()).filter(Boolean);

  return (
    <section
      className="px-6 py-14"
      style={{ background: bg, borderTop: `1px solid ${dark ? "rgba(255,255,255,0.06)" : "#f0f0f2"}` }}
      aria-label="Hero Split"
    >
      <div className="max-w-5xl mx-auto">
        <div
          className={`flex gap-12 ${compact ? "flex-col" : "flex-row"} items-center`}
          style={!compact ? { flexDirection: isImageLeft ? "row-reverse" : "row" } : {}}
        >
          {/* Text side */}
          <div className="flex-1 flex flex-col gap-5">
            {state.overline && (
              <p className="text-xs font-bold uppercase tracking-widest" style={{ color: AMBER }}>
                {state.overline}
              </p>
            )}
            <h1
              className={`font-extrabold leading-tight ${compact ? "text-3xl" : "text-4xl"}`}
              style={{ color: dark ? "#f1f5f9" : "#111827" }}
            >
              {state.headline}
            </h1>
            {state.subheadline && (
              <p className="text-base leading-relaxed" style={{ color: dark ? "#94a3b8" : "#374151" }}>
                {state.subheadline}
              </p>
            )}
            <div className="flex flex-wrap gap-3">
              {state.primaryCtaLabel && (
                <a href={state.primaryCtaHref}
                  className="inline-block px-6 py-3 rounded-xl text-sm font-bold text-white"
                  style={{ background: dark ? TEAL : NAVY }}>
                  {state.primaryCtaLabel}
                </a>
              )}
              {state.secondaryCtaLabel && (
                <a href={state.secondaryCtaHref}
                  className="inline-block px-6 py-3 rounded-xl text-sm font-bold border-2"
                  style={{ borderColor: dark ? "rgba(255,255,255,0.25)" : "#d1d5db", color: dark ? "#e2e8f0" : "#374151" }}>
                  {state.secondaryCtaLabel}
                </a>
              )}
            </div>
            {trustChips.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {trustChips.map((chip, i) => (
                  <span key={i} className="text-xs font-medium px-2.5 py-1 rounded-full"
                    style={{
                      background: dark ? "rgba(255,255,255,0.06)" : "#f3f4f6",
                      color: dark ? "#94a3b8" : "#6b7280",
                    }}>
                    ✓ {chip}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Image side */}
          <div className="flex-1 rounded-2xl overflow-hidden shrink-0"
            style={{ maxWidth: compact ? "100%" : "48%", aspectRatio: "4/3", background: dark ? "#1e293b" : "#e5e7eb" }}>
            {state.imageUrl && (
              <img src={state.imageUrl} alt={state.imageAlt} className="w-full h-full object-cover"
                loading="lazy"
                onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }} />
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

export function HeroSplitEditor({
  state, onChange,
}: { state: HeroSplitState; onChange: (u: Partial<HeroSplitState>) => void }) {
  return (
    <div className="flex flex-col gap-4 px-4 pb-4 pt-1">
      <div>
        <label className={LABEL}>Overline</label>
        <input type="text" value={state.overline} onChange={(e) => onChange({ overline: e.target.value })} className={INPUT} placeholder="24/7 Specialty Care" />
      </div>
      <div>
        <label className={LABEL}>Headline</label>
        <textarea value={state.headline} onChange={(e) => onChange({ headline: e.target.value })} rows={2} className={TEXTAREA} placeholder="Main headline" />
      </div>
      <div>
        <label className={LABEL}>Subheadline</label>
        <textarea value={state.subheadline} onChange={(e) => onChange({ subheadline: e.target.value })} rows={3} className={TEXTAREA} placeholder="Supporting text…" />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={LABEL}>Primary CTA label</label>
          <input type="text" value={state.primaryCtaLabel} onChange={(e) => onChange({ primaryCtaLabel: e.target.value })} className={INPUT} placeholder="Book an Appointment" />
        </div>
        <div>
          <label className={LABEL}>Primary CTA link</label>
          <input type="text" value={state.primaryCtaHref} onChange={(e) => onChange({ primaryCtaHref: e.target.value })} className={INPUT} placeholder="#" />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={LABEL}>Secondary CTA label</label>
          <input type="text" value={state.secondaryCtaLabel} onChange={(e) => onChange({ secondaryCtaLabel: e.target.value })} className={INPUT} placeholder="Optional" />
        </div>
        <div>
          <label className={LABEL}>Secondary CTA link</label>
          <input type="text" value={state.secondaryCtaHref} onChange={(e) => onChange({ secondaryCtaHref: e.target.value })} className={INPUT} placeholder="#" />
        </div>
      </div>
      <div>
        <label className={LABEL}>Image URL</label>
        <input type="text" value={state.imageUrl} onChange={(e) => onChange({ imageUrl: e.target.value })} className={INPUT} placeholder="https://…" />
      </div>
      <div>
        <label className={LABEL}>Image alt text</label>
        <input type="text" value={state.imageAlt} onChange={(e) => onChange({ imageAlt: e.target.value })} className={INPUT} placeholder="Image description" />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={LABEL}>Image side</label>
          <select value={state.imagePosition} onChange={(e) => onChange({ imagePosition: e.target.value as HeroSplitState["imagePosition"] })} className={INPUT}>
            <option value="right">Image right</option>
            <option value="left">Image left</option>
          </select>
        </div>
        <div>
          <label className={LABEL}>Background</label>
          <select value={state.bgStyle} onChange={(e) => onChange({ bgStyle: e.target.value as HeroSplitState["bgStyle"] })} className={INPUT}>
            <option value="white">White</option>
            <option value="light">Light gray</option>
            <option value="navy">Navy</option>
            <option value="dark">Dark</option>
          </select>
        </div>
      </div>
      <div>
        <label className={LABEL}>Trust chips (comma-separated)</label>
        <input type="text" value={state.trustItems} onChange={(e) => onChange({ trustItems: e.target.value })} className={INPUT} placeholder="AAHA Accredited, Fear Free Certified" />
      </div>
    </div>
  );
}

export function HeroSplitThumbnail() {
  return (
    <div className="flex h-full overflow-hidden bg-white">
      <div className="flex-1 flex flex-col justify-center gap-[2.5px] px-1.5 py-1">
        <span className="text-[4.5px] font-bold uppercase tracking-wider" style={{ color: "#0d9488" }}>24/7 Specialty Care</span>
        <span className="text-[7.5px] font-extrabold leading-tight" style={{ color: NAVY }}>Expert Vets. Happier Pets.</span>
        <div className="h-[1.5px] bg-gray-200 rounded w-full" />
        <div className="h-[1.5px] bg-gray-200 rounded w-4/5" />
        <div className="flex gap-[3px] mt-1">
          <span className="text-[5px] font-bold rounded-full px-1.5 py-[2px] text-white" style={{ background: "#0d9488" }}>Book Now</span>
          <span className="text-[5px] font-medium rounded-full px-1.5 py-[2px] border border-gray-300 text-gray-600">More</span>
        </div>
      </div>
      <div className="w-[42%] overflow-hidden shrink-0">
        <img src="https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=80&h=80&fit=crop&q=70" alt="" className="w-full h-full object-cover" />
      </div>
    </div>
  );
}
