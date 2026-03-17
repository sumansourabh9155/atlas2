import { ArrowRight, ChevronRight } from "lucide-react";
import type { HeroBlock, ClinicGeneralDetails } from "../../types/clinic";

interface Props {
  block: HeroBlock;
  general: ClinicGeneralDetails;
}

/** Converts a hex color to an rgba string */
function hexToRgba(hex: string, alpha: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

export function HeroRenderer({ block, general }: Props) {
  const isImage =
    block.backgroundType === "image" && block.backgroundValue;

  const isSplit =
    block.layout === "split_image_right" ||
    block.layout === "split_image_left";

  const contentAlign =
    block.layout === "centered"
      ? "items-center text-center"
      : block.layout === "left_aligned"
      ? "items-start text-left"
      : "items-start text-left";

  /* ── Background styles ── */
  const bgStyle: React.CSSProperties = isImage
    ? {
        backgroundImage: `url(${block.backgroundValue})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }
    : block.backgroundType === "gradient"
    ? { background: block.backgroundValue ?? `linear-gradient(135deg, ${general.primaryColor} 0%, #1e293b 100%)` }
    : block.backgroundType === "solid"
    ? { backgroundColor: block.backgroundValue ?? general.primaryColor }
    : { backgroundColor: general.primaryColor };

  /* ── Overlay ── */
  const overlayColor = hexToRgba("#0f172a", block.overlayOpacity ?? 0.5);

  return (
    <section
      id="hero"
      className="relative w-full overflow-hidden"
      style={{ minHeight: isSplit ? "560px" : "640px", ...bgStyle }}
      aria-labelledby="hero-headline"
    >
      {/* Dark overlay for contrast / WCAG AA */}
      {(isImage || block.backgroundType === "gradient") && (
        <div
          className="absolute inset-0"
          style={{ backgroundColor: overlayColor }}
          aria-hidden="true"
        />
      )}

      {/* Subtle SVG pattern overlay — adds texture on solid backgrounds */}
      {!isImage && (
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
          aria-hidden="true"
        />
      )}

      {/* Content */}
      <div
        className={`relative z-10 max-w-7xl mx-auto px-6 py-24 flex flex-col ${contentAlign} gap-6`}
      >
        {/* Badge */}
        {block.badgeText && (
          <span
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-white/15 text-white border border-white/25 backdrop-blur-sm w-fit"
            role="note"
          >
            {block.badgeText}
          </span>
        )}

        {/* Headline */}
        <h1
          id="hero-headline"
          className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white leading-[1.1] tracking-tight max-w-3xl"
        >
          {block.headline}
        </h1>

        {/* Subheadline */}
        {block.subheadline && (
          <p className="text-lg sm:text-xl text-white/85 max-w-2xl leading-relaxed">
            {block.subheadline}
          </p>
        )}

        {/* CTAs */}
        {(block.primaryCta || block.secondaryCta) && (
          <div className="flex flex-wrap gap-4 mt-2">
            {block.primaryCta && (
              <a
                href={block.primaryCta.href}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-white text-sm shadow-lg hover:opacity-90 transition-all hover:scale-[1.02] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
                style={{ backgroundColor: general.primaryColor }}
              >
                {block.primaryCta.label}
                <ArrowRight className="w-4 h-4" aria-hidden="true" />
              </a>
            )}
            {block.secondaryCta && (
              <a
                href={block.secondaryCta.href}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-white text-sm border border-white/40 bg-white/10 backdrop-blur-sm hover:bg-white/20 transition-all focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
              >
                {block.secondaryCta.label}
                <ChevronRight className="w-4 h-4" aria-hidden="true" />
              </a>
            )}
          </div>
        )}

        {/* Trust signals */}
        <div
          className="flex flex-wrap gap-6 mt-4 text-white/70 text-sm"
          aria-label="Trust indicators"
        >
          {[
            "Board-Certified Specialists",
            "24/7 Emergency Access",
            "State-of-the-Art Imaging",
          ].map((signal) => (
            <span key={signal} className="flex items-center gap-1.5">
              <span
                className="w-1.5 h-1.5 rounded-full bg-green-400 inline-block"
                aria-hidden="true"
              />
              {signal}
            </span>
          ))}
        </div>
      </div>

      {/* Bottom fade for smooth section transition */}
      <div
        className="absolute bottom-0 left-0 right-0 h-24 pointer-events-none"
        style={{
          background:
            "linear-gradient(to bottom, transparent, rgba(255,255,255,0.06))",
        }}
        aria-hidden="true"
      />
    </section>
  );
}
