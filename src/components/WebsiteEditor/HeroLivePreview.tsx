import { ArrowRight, ChevronRight } from "lucide-react";
import type { HeroEditorState } from "./WebsiteEditorPage";
import type { ClinicWebsite } from "../../types/clinic";
import type { PreviewTheme } from "./LivePreviewPane";

function hexToRgba(hex: string, alpha: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

interface Props {
  state: HeroEditorState;
  clinic: ClinicWebsite;
  /** Compact mode reduces min-height and font sizes for mobile viewport */
  compact?: boolean;
  /** Theme 1 = light/brand, Theme 2 = dark/deep */
  theme?: PreviewTheme;
}

export function HeroLivePreview({ state, clinic, compact = false, theme = "1" }: Props) {
  const { primaryColor, secondaryColor } = clinic.general;
  const hasImage = state.backgroundValue.trim().length > 0;

  // Theme 1: brand gradient using primaryColor
  // Theme 2: deep dark gradient with a warm accent — evokes a premium, after-hours feel
  const fallbackGradient =
    theme === "2"
      ? `linear-gradient(135deg, #0d0d1a 0%, #1a0a00 50%, ${secondaryColor ?? "#F59E0B"}33 100%)`
      : `linear-gradient(135deg, ${primaryColor} 0%, #0c4a6e 100%)`;

  const bgStyle: React.CSSProperties = hasImage
    ? {
        backgroundImage: `url(${state.backgroundValue})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }
    : { background: fallbackGradient };

  // Theme 2 adds a deeper overlay for a more dramatic, high-contrast look
  const overlayOpacity = theme === "2"
    ? Math.min(state.overlayOpacity + 0.15, 0.85)
    : state.overlayOpacity;
  const overlayColor = hexToRgba("#0f172a", overlayOpacity);

  const isLeft = state.layout === "left_aligned";
  const isSplit = state.layout === "split_image_right";

  const contentAlign = isLeft || isSplit ? "items-start text-left" : "items-center text-center";
  const maxW = isSplit ? "max-w-lg" : "max-w-2xl";

  return (
    <section
      className="relative w-full overflow-hidden"
      style={{ minHeight: compact ? "320px" : "500px", ...bgStyle }}
      aria-label="Hero section preview"
    >
      {/* Overlay */}
      <div
        className="absolute inset-0"
        style={{ backgroundColor: overlayColor }}
        aria-hidden="true"
      />

      {/* Subtle dot-grid texture */}
      <div
        className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage:
            "radial-gradient(circle, white 1px, transparent 1px)",
          backgroundSize: "24px 24px",
        }}
        aria-hidden="true"
      />

      <div
        className={`relative z-10 flex flex-col ${contentAlign} gap-4 px-6 py-16`}
      >
        {/* Badge */}
        {state.badgeText && (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-white/15 text-white border border-white/25 backdrop-blur-sm w-fit">
            {state.badgeText}
          </span>
        )}

        {/* Headline — empty state */}
        <h1
          className={[
            "font-extrabold text-white leading-tight tracking-tight",
            maxW,
            compact ? "text-2xl sm:text-3xl" : "text-3xl sm:text-4xl lg:text-5xl",
            !state.headline ? "opacity-30 italic" : "",
          ].join(" ")}
        >
          {state.headline || "Your headline goes here"}
        </h1>

        {/* Subheadline */}
        {(state.subheadline || true) && (
          <p
            className={[
              "text-white/80 leading-relaxed",
              maxW,
              compact ? "text-sm" : "text-base sm:text-lg",
              !state.subheadline ? "opacity-30 italic" : "",
            ].join(" ")}
          >
            {state.subheadline || "Your subheading goes here…"}
          </p>
        )}

        {/* CTAs */}
        {(state.primaryCta.enabled || state.secondaryCta.enabled) && (
          <div className="flex flex-wrap gap-3 mt-1">
            {state.primaryCta.enabled && (
              <span
                className={[
                  "inline-flex items-center gap-1.5 rounded-xl font-semibold text-white shadow-lg",
                  compact ? "px-4 py-2 text-xs" : "px-5 py-2.5 text-sm",
                ].join(" ")}
                style={{ backgroundColor: primaryColor }}
              >
                {state.primaryCta.label || "Button"}
                <ArrowRight
                  className={compact ? "w-3 h-3" : "w-4 h-4"}
                  aria-hidden="true"
                />
              </span>
            )}
            {state.secondaryCta.enabled && (
              <span
                className={[
                  "inline-flex items-center gap-1.5 rounded-xl font-semibold text-white",
                  "bg-white/10 border border-white/30 backdrop-blur-sm",
                  compact ? "px-4 py-2 text-xs" : "px-5 py-2.5 text-sm",
                ].join(" ")}
              >
                {state.secondaryCta.label || "Button"}
                <ChevronRight
                  className={compact ? "w-3 h-3" : "w-4 h-4"}
                  aria-hidden="true"
                />
              </span>
            )}
          </div>
        )}

        {/* Trust signals — static */}
        {!compact && (
          <div className="flex flex-wrap gap-5 mt-2 text-white/60 text-xs">
            {[
              "Board-Certified Specialists",
              "24/7 Emergency Access",
              "State-of-the-Art Imaging",
            ].map((s) => (
              <span key={s} className="flex items-center gap-1.5">
                <span
                  className="w-1.5 h-1.5 rounded-full bg-green-400 inline-block"
                  aria-hidden="true"
                />
                {s}
              </span>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
