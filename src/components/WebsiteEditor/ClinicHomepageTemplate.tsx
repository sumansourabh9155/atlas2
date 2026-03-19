import { useState, Fragment, createContext, useContext } from "react";
import {
  Phone, MapPin, Clock, ChevronDown, ChevronRight, ChevronUp, Star,
  Globe, Calendar, Monitor, FileText, CreditCard,
  Download, Mail, Pill, Facebook, ArrowRight,
  Home, Building2,
} from "lucide-react";
import type { ClinicWebsite, NavigationBlock } from "../../types/clinic";
import { INITIAL_SECTION_ORDER } from "./WebsiteEditorPage";
import type {
  HeroEditorState, TeamsEditorState,
  ServicesEditorState, LocationsEditorState,
  TestimonialsEditorState, JoinTeamEditorState,
  FAQEditorState, NewsletterEditorState,
  SectionId,
} from "./WebsiteEditorPage";
import type { PreviewTheme } from "./LivePreviewPane";
import type { AddableSectionType, DynamicSectionRegistry } from "./sections";
import { DYNAMIC_SECTION_META } from "./sections";
import {
  StatsSectionRenderer,
  CtaBandSectionRenderer,
  GallerySectionRenderer,
  ContactInfoSectionRenderer,
  TeamSpotlightSectionRenderer,
  HeadingSectionRenderer,
  ParagraphSectionRenderer,
  TextBlockSectionRenderer,
  BlockQuoteSectionRenderer,
  RichTextSectionRenderer,
  EmptySectionRenderer,
  TwoColSectionRenderer,
  ThreeColSectionRenderer,
  CardGridSectionRenderer,
  TeamCardsSectionRenderer,
  HeroCenteredSectionRenderer,
  HeroSplitSectionRenderer,
  ContactSplitSectionRenderer,
  EmailCaptureSectionRenderer,
  SplitContentSectionRenderer,
  FeatureGridSectionRenderer,
} from "./sections";

// ─── Helpers ──────────────────────────────────────────────────────────────────

export function hexToRgba(hex: string, alpha: number) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}

// ─── Template color context ───────────────────────────────────────────────────
// Provides primaryColor + secondaryColor to all sub-components without prop-drilling.

export interface TemplateColors { primary: string; secondary: string }
export const TemplateColorsCtx = createContext<TemplateColors>({ primary: "#1B2B4B", secondary: "#C1121F" });
export const useColors = () => useContext(TemplateColorsCtx);

// ─── TopBanner ────────────────────────────────────────────────────────────────

export function TopBanner() {
  const { primary, secondary } = useColors();
  return (
    <div
      className="flex items-center justify-center gap-2 px-4 py-2 text-xs"
      style={{ background: primary, color: "rgba(255,255,255,0.85)" }}
    >
      <span
        className="w-2 h-2 rounded-full shrink-0"
        style={{ background: secondary }}
        aria-hidden="true"
      />
      <span>Now Open &amp; Taking Patients</span>
      <a
        href="#"
        className="font-semibold underline underline-offset-2 ml-1 text-white"
        aria-label="Terms Apply"
      >
        Terms Apply
      </a>
    </div>
  );
}

// ─── Navbar ───────────────────────────────────────────────────────────────────

export function Navbar({
  clinic, isDark, navBlock,
}: { clinic: ClinicWebsite; isDark: boolean; navBlock: NavigationBlock | undefined }) {
  const { primary, secondary } = useColors();
  const name = clinic.general.name;
  const firstWord = name.split(" ")[0].toUpperCase();

  // Derive colours from navBlock.colorScheme — fall back to isDark for theme compat
  const scheme   = navBlock?.colorScheme ?? (isDark ? "dark" : "light");
  const isNavDark  = scheme === "dark" || scheme === "brand";
  const navBg =
    scheme === "brand" ? primary :
    scheme === "dark"  ? "#0f172a" : "#ffffff";
  const navBorder =
    scheme === "dark"  ? "rgba(255,255,255,0.08)" :
    scheme === "brand" ? "rgba(255,255,255,0.15)" : "#e5e7eb";
  const linkColor = isNavDark ? "#cbd5e1" : "#374151";
  const subBg     = scheme === "dark" ? "#1e293b" : scheme === "brand" ? "#002d4a" : "#ffffff";

  // Use live links from context (fallback to a sensible default)
  const navLinks = navBlock?.links ?? [];
  const ctaLabel = navBlock?.ctaButton?.label ?? "Book Appointment";
  const showCta  = !!(navBlock?.ctaButton?.href ?? true);

  return (
    <header className={navBlock?.isSticky ? "sticky top-0 z-50" : ""}>
      {/* Main nav row */}
      <div
        className="px-5 h-14 flex items-center justify-between gap-4"
        style={{ background: navBg, borderBottom: `1px solid ${navBorder}` }}
      >
        {/* Logo / Brand */}
        <div className="flex items-center gap-1.5 shrink-0">
          {clinic.general.logoUrl ? (
            <img src={clinic.general.logoUrl} alt={name} className="h-8 w-auto object-contain" />
          ) : (
            <div
              className="w-7 h-7 flex items-center justify-center rounded-sm shrink-0"
              style={{ background: secondary }}
              aria-hidden="true"
            >
              <span className="text-white font-black text-xs">{firstWord[0] ?? "V"}</span>
            </div>
          )}
          {(navBlock?.showClinicName !== false) && (
            <div className="leading-none">
              <p className="text-[11px] font-black tracking-tight" style={{ color: isNavDark ? "#f1f5f9" : primary }}>
                {firstWord}
              </p>
              <p className="text-[7px] font-semibold tracking-widest uppercase" style={{ color: isNavDark ? "#475569" : "#9ca3af" }}>
                Veterinary Hospital
              </p>
            </div>
          )}
        </div>

        {/* Nav links — driven by context */}
        <nav className="hidden md:flex items-center gap-5 flex-1 justify-center" aria-label="Main navigation">
          {navLinks.map((link) => (
            <a
              key={link.label}
              href={link.href ?? "#"}
              target={link.openInNewTab ? "_blank" : undefined}
              rel={link.openInNewTab ? "noopener noreferrer" : undefined}
              className="text-xs font-medium whitespace-nowrap hover:opacity-70 transition-opacity"
              style={{ color: linkColor }}
            >
              {link.label}
            </a>
          ))}
          {navLinks.length === 0 && (
            /* Fallback placeholder when no pages are in nav */
            ["Services", "About Us", "Contact"].map(l => (
              <a key={l} href="#" className="text-xs font-medium whitespace-nowrap opacity-50" style={{ color: linkColor }}>
                {l}
              </a>
            ))
          )}
        </nav>

        {/* CTA */}
        <div className="flex items-center gap-2 shrink-0">
          {clinic.contact?.emergencyPhone && (
            <button
              className="px-3.5 py-1.5 rounded-md text-xs font-bold border-2 transition-colors"
              style={{ borderColor: secondary, color: isNavDark ? "#fff" : secondary, background: "transparent" }}
            >
              Emergency
            </button>
          )}
          {showCta && (
            <button
              className="px-3.5 py-1.5 rounded-md text-xs font-bold text-white"
              style={{ background: secondary }}
            >
              {ctaLabel}
            </button>
          )}
        </div>
      </div>

      {/* Sub-bar: next available */}
      <div
        className="h-8 flex items-center justify-center gap-2 text-xs border-b"
        style={{
          background: subBg,
          borderColor: isNavDark ? "rgba(255,255,255,0.06)" : "#e5e7eb",
          color: isNavDark ? "#94a3b8" : "#374151",
        }}
      >
        <Calendar className="w-3.5 h-3.5 shrink-0" style={{ color: isNavDark ? "#64748b" : primary }} aria-hidden="true" />
        <span>
          Next available:{" "}
          <strong style={{ color: isNavDark ? "#e2e8f0" : primary }}>Today, 3:00 PM</strong>
        </span>
        <button
          className="w-4 h-4 rounded-full border flex items-center justify-center text-[8px] font-bold shrink-0"
          style={{ borderColor: isNavDark ? "#475569" : "#d1d5db", color: isNavDark ? "#64748b" : "#9ca3af" }}
          aria-label="More info"
        >
          i
        </button>
      </div>
    </header>
  );
}

// ─── HeroSection ──────────────────────────────────────────────────────────────

function HeroSection({
  clinic, heroState, primaryColor, isDark, compact,
}: {
  clinic: ClinicWebsite;
  heroState: HeroEditorState;
  primaryColor: string;
  isDark: boolean;
  compact: boolean;
}) {
  const { primary, secondary } = useColors();
  const name      = clinic.general.name;
  const firstWord = name.split(" ")[0].toUpperCase();
  const address   = clinic.contact?.address;
  const phone     = clinic.contact?.phone;
  const emergency = clinic.contact?.emergencyPhone;
  const hasImage  = heroState.backgroundValue?.trim().length > 0;

  // Hero left panel uses primary color darkened for contrast
  const HERO_BG = isDark ? "#060e1e" : primary;

  return (
    <section aria-label="Hero">
      {/* Split hero */}
      <div className="flex" style={{ minHeight: compact ? "200px" : "320px" }}>
        {/* Left — always dark */}
        <div
          className="flex-1 flex flex-col justify-center px-8 py-10"
          style={{ background: HERO_BG }}
        >
          {/* Brand mark */}
          <div className="flex items-center gap-2 mb-5">
            <div
              className="w-5 h-5 flex items-center justify-center rounded-sm shrink-0"
              style={{ background: secondary }}
              aria-hidden="true"
            >
              <span className="text-white font-black text-[9px]">{firstWord[0] ?? "V"}</span>
            </div>
            <span className="text-[10px] font-black tracking-widest" style={{ color: secondary }}>
              {firstWord}
            </span>
            <span className="text-[10px]" style={{ color: "rgba(255,255,255,0.3)" }}>· · ·</span>
          </div>

          <h1
            data-ai-section="hero"
            data-ai-field="headline"
            title="Click to edit headline"
            className={`font-extrabold leading-tight mb-3 text-white ${compact ? "text-xl" : "text-[26px]"}`}
          >
            {heroState.headline || `Advanced Specialty Care for the Pets You Love`}
          </h1>

          <p
            data-ai-section="hero"
            data-ai-field="subheadline"
            title="Click to edit subheadline"
            className={`leading-relaxed mb-7 max-w-md ${compact ? "text-xs" : "text-sm"}`}
            style={{ color: "rgba(255,255,255,0.60)" }}
          >
            {heroState.subheadline ||
              `${name}'s only 24/7 specialty & emergency center staffed by board-certified specialists in internal medicine, surgery, and critical care.`}
          </p>

          {/* Carousel dots */}
          <div className="flex items-center gap-1.5" aria-hidden="true">
            {[0, 1, 2, 3].map(i => (
              <div
                key={i}
                className="rounded-full transition-all"
                style={{
                  width:  i === 0 ? "22px" : "7px",
                  height: "7px",
                  background: i === 0 ? secondary : "rgba(255,255,255,0.22)",
                }}
              />
            ))}
          </div>
        </div>

        {/* Right — team photo */}
        <div
          className="relative overflow-hidden"
          style={{ width: compact ? "140px" : "48%", background: isDark ? "#1e293b" : "#2d4a6e" }}
        >
          {hasImage ? (
            <img
              src={heroState.backgroundValue}
              alt="Veterinary team"
              className="w-full h-full object-cover object-center"
            />
          ) : (
            <img
              src="https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=700&auto=format&fit=crop&q=80"
              alt="Veterinary team"
              className="w-full h-full object-cover object-center"
              onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }}
            />
          )}
        </div>
      </div>

      {/* Location cards row — dark strip */}
      {!compact && (
        <div
          className="grid grid-cols-2"
          style={{ background: isDark ? "#060e1e" : "#111827" }}
        >
          {[
            {
              label: `${firstWord} Seymour Clinic`,
              addr:  `18 Westfield Ave, ${address?.city ?? "Ansonia"}, CT`,
              phone: phone     ?? "+1 (512) 555-0199",
              emerg: emergency ?? "+1 (512) 555-0199",
            },
            {
              label: `${firstWord} Westfield Clinic`,
              addr:  `12 Commerce Blvd, ${address?.city ?? "Derby"}, CT`,
              phone: phone     ?? "+1 (512) 555-0345",
              emerg: emergency ?? "+1 (512) 555-0345",
            },
          ].map((loc, i) => (
            <div
              key={i}
              className="flex items-start gap-3 px-5 py-4"
              style={{ borderRight: i === 0 ? "1px solid rgba(255,255,255,0.08)" : undefined }}
            >
              {/* Building thumbnail */}
              <div
                className="w-16 h-16 rounded-lg shrink-0 overflow-hidden flex items-center justify-center"
                style={{ background: isDark ? "#1e3a5f" : "#1e3a5f" }}
                aria-hidden="true"
              >
                <Building2 className="w-7 h-7 text-white/25" />
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <p className="text-[11px] font-bold text-white mb-1.5">{loc.label}</p>
                <div className="flex items-start gap-1 mb-0.5">
                  <MapPin className="w-2.5 h-2.5 shrink-0 mt-0.5 text-white/40" aria-hidden="true" />
                  <span className="text-[10px] text-white/55">{loc.addr}</span>
                </div>
                <p className="text-[10px] text-white/45 mb-0.5 pl-3.5">Surgery • Dentistry • Emergency</p>
                <p className="text-[10px] font-semibold pl-3.5 mb-0.5" style={{ color: "#22c55e" }}>Open Now</p>
                <div className="flex items-center gap-1 pl-3.5">
                  <Phone className="w-2.5 h-2.5 shrink-0 text-white/40" aria-hidden="true" />
                  <span className="text-[10px] text-white/55">{loc.phone}</span>
                </div>
              </div>

              {/* Icon buttons */}
              <div className="flex flex-col gap-1.5 shrink-0">
                {[Phone, ArrowRight].map((Icon, j) => (
                  <button
                    key={j}
                    className="w-8 h-8 rounded-lg flex items-center justify-center border transition-colors"
                    style={{ borderColor: "rgba(255,255,255,0.2)", color: "rgba(255,255,255,0.65)" }}
                    aria-label={j === 0 ? "Call" : "Directions"}
                  >
                    <Icon className="w-3.5 h-3.5" aria-hidden="true" />
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

// ─── QuickLinks ───────────────────────────────────────────────────────────────

const QUICK_LINKS = [
  { label: "Consult Online", Icon: Monitor   },
  { label: "Pharma Rx",      Icon: Pill      },
  { label: "Pet Portal",     Icon: Globe     },
  { label: "Forms",          Icon: FileText  },
  { label: "Billing",        Icon: CreditCard },
  { label: "Download App",   Icon: Download  },
];

function QuickLinks({ isDark }: { isDark: boolean }) {
  const { secondary } = useColors();
  return (
    <div
      className="px-6 py-4"
      style={{ background: isDark ? "#0d1117" : "#f8f9fb" }}
    >
      <div
        className="max-w-3xl mx-auto flex items-center justify-around px-6 py-4 rounded-2xl"
        style={{
          background: isDark ? "#1e293b" : "#ffffff",
          boxShadow: isDark ? "none" : "0 2px 16px rgba(0,0,0,0.08)",
          border: `1px solid ${isDark ? "rgba(255,255,255,0.08)" : "#f0f0f2"}`,
        }}
        role="navigation"
        aria-label="Quick links"
      >
        {QUICK_LINKS.map(({ label, Icon }) => (
          <button
            key={label}
            className="flex flex-col items-center gap-1.5"
          >
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ background: hexToRgba(secondary, isDark ? 0.12 : 0.08) }}
            >
              <Icon className="w-4.5 h-4.5" style={{ color: secondary }} aria-hidden="true" />
            </div>
            <span
              className="text-[10px] font-medium flex items-center gap-0.5 whitespace-nowrap"
              style={{ color: isDark ? "#94a3b8" : "#374151" }}
            >
              {label}
              <ChevronRight className="w-2.5 h-2.5" style={{ color: isDark ? "#64748b" : "#9ca3af" }} aria-hidden="true" />
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── ServicesSection ──────────────────────────────────────────────────────────

const SERVICE_CARDS = [
  "Compassionate team that knows your pet by name",
  "Modern equipment and full-service care",
  "Convenient hours and flexible appointments",
  "Trusted by hundreds of families nearby",
];

function ServicesSection({
  clinic, secondaryColor, isDark, compact,
  sectionTitle, sectionSubtitle, gridColumns,
}: {
  clinic: ClinicWebsite;
  secondaryColor: string;
  isDark: boolean;
  compact: boolean;
  sectionTitle?: string;
  sectionSubtitle?: string;
  gridColumns?: number;
}) {
  const city      = clinic.contact?.address?.city ?? "your area";
  const { secondary } = useColors();
  const iconColor = secondaryColor || secondary;
  const visibleServices = clinic.services.filter(s => s.isVisible).sort((a, b) => a.order - b.order);
  const cols = compact ? 2 : (gridColumns ?? 4);

  return (
    <section
      className="px-6 py-12"
      style={{ background: isDark ? "#0f172a" : "#f8f9fb" }}
      aria-label="Services"
    >
      <div className="max-w-4xl mx-auto">
        <h2
          data-ai-section="services"
          data-ai-field="services.title"
          title="Click to edit section title"
          className={`font-extrabold mb-2 ${compact ? "text-xl" : "text-2xl"}`}
          style={{ color: isDark ? "#f1f5f9" : "#111827" }}
        >
          {sectionTitle || `Complete Veterinary Services in ${city}`}
        </h2>
        <p
          data-ai-section="services"
          data-ai-field="services.subtitle"
          title="Click to edit section subtitle"
          className="text-sm mb-8 max-w-xl leading-relaxed"
          style={{ color: isDark ? "#64748b" : "#6b7280" }}
        >
          {sectionSubtitle || `At ${clinic.general.name}, you can trust that your pets are in great hands. Our compassionate, skillful staff is here to help when you need us most.`}
        </p>

        <div
          className="grid gap-4"
          style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}
        >
          {visibleServices.map(service => (
            <div
              key={service.id}
              className="flex flex-col gap-4 p-5 rounded-xl border"
              style={{
                background: isDark ? "#1e293b" : "#ffffff",
                borderColor: isDark ? "rgba(255,255,255,0.08)" : "#e5e7eb",
              }}
            >
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
                style={{ background: hexToRgba(iconColor, 0.12) }}
              >
                <Home className="w-5 h-5" style={{ color: iconColor }} aria-hidden="true" />
              </div>
              <div className="flex flex-col gap-1">
                <p
                  className="text-sm font-semibold leading-snug"
                  style={{ color: isDark ? "#e2e8f0" : "#111827" }}
                >
                  {service.name}
                </p>
                {service.description && (
                  <p
                    className="text-xs leading-relaxed line-clamp-2"
                    style={{ color: isDark ? "#64748b" : "#6b7280" }}
                  >
                    {service.description}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── LocationsMap ─────────────────────────────────────────────────────────────

const PET_PILLS = ["Dog", "Cat", "Dog", "Cat", "Dog", "Cat"];

function LocationsMap({
  clinic, isDark, compact,
  showAnimals, showMap, showBookingWidget, nextAvailable,
}: {
  clinic: ClinicWebsite;
  isDark: boolean;
  compact: boolean;
  showAnimals?: boolean;
  showMap?: boolean;
  showBookingWidget?: boolean;
  nextAvailable?: string;
}) {
  const { secondary } = useColors();
  const city  = clinic.contact?.address?.city ?? "Ansonia";
  const phone = clinic.contact?.phone ?? "812-283-4910";
  const email = clinic.contact?.email ?? "info@company.com";

  return (
    <section
      className="px-6 py-12"
      style={{
        background: isDark ? "#0d1117" : "#ffffff",
        borderTop: `1px solid ${isDark ? "rgba(255,255,255,0.06)" : "#f0f0f2"}`,
      }}
      aria-label="Locations"
    >
      <div className="max-w-4xl mx-auto">
        <h2
          className={`font-extrabold mb-6 ${compact ? "text-xl" : "text-2xl"}`}
          style={{ color: isDark ? "#f1f5f9" : "#111827" }}
        >
          Wherever You Are, We're Nearby
        </h2>

        {/* Animals We See row */}
        {showAnimals !== false && (
          <div className="flex items-center gap-2 mb-5 flex-wrap">
            <span className="text-xs font-semibold shrink-0" style={{ color: isDark ? "#94a3b8" : "#374151" }}>
              Animals We See :
            </span>
            {PET_PILLS.map((pet, i) => (
              <span
                key={i}
                className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium border"
                style={{
                  borderColor: isDark ? "rgba(255,255,255,0.15)" : "#e5e7eb",
                  color: isDark ? "#94a3b8" : "#374151",
                  background: isDark ? "rgba(255,255,255,0.04)" : "#f9fafb",
                }}
              >
                {pet === "Dog" ? "🐾" : "🐱"} {pet}
              </span>
            ))}
          </div>
        )}

        {/* Location info row */}
        <div className="flex items-center gap-5 mb-5 flex-wrap">
          <span className="text-xs font-semibold shrink-0" style={{ color: isDark ? "#94a3b8" : "#374151" }}>
            Our Locations :
          </span>
          <span className="flex items-center gap-1.5 text-xs" style={{ color: isDark ? "#94a3b8" : "#374151" }}>
            <MapPin className="w-3 h-3 shrink-0" style={{ color: isDark ? "#64748b" : "#6b7280" }} />
            <span>
              <strong>Address:</strong>{" "}
              {clinic.contact?.address?.street ?? "10 Westfield Ave"} {city}, CT {clinic.contact?.address?.zip ?? "06401"}
            </span>
          </span>
          <span className="flex items-center gap-1.5 text-xs" style={{ color: isDark ? "#94a3b8" : "#374151" }}>
            <Building2 className="w-3 h-3 shrink-0" style={{ color: isDark ? "#64748b" : "#6b7280" }} />
            <span><strong>Services:</strong> Surgery • Dentistry • Emergency</span>
          </span>
          <span className="flex items-center gap-1.5 text-xs" style={{ color: isDark ? "#94a3b8" : "#374151" }}>
            <Clock className="w-3 h-3 shrink-0" style={{ color: isDark ? "#64748b" : "#6b7280" }} />
            <span><strong>Next Visit:</strong> {nextAvailable || "Daily, 9 AM - 6PM"}</span>
          </span>
        </div>

        <div
          className="flex gap-6"
          style={{ flexDirection: compact ? "column" : "row", alignItems: "flex-start" }}
        >
          {/* Left: map */}
          <div className="flex-1">
            <div
              className="w-full rounded-xl overflow-hidden relative"
              style={{
                height: compact ? "220px" : "320px",
                background: isDark ? "#1a2b3c" : "#dde8dd",
              }}
              aria-label="Map showing service area"
            >
              {/* Road grid lines */}
              {Array.from({ length: 9 }).map((_, i) => (
                <div
                  key={`h${i}`}
                  className="absolute w-full"
                  style={{
                    top: `${10 + i * 10}%`, height: "1px",
                    background: isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.1)",
                  }}
                />
              ))}
              {Array.from({ length: 11 }).map((_, i) => (
                <div
                  key={`v${i}`}
                  className="absolute h-full"
                  style={{
                    left: `${i * 10}%`, width: "1px",
                    background: isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.1)",
                  }}
                />
              ))}
              {/* Service area circle */}
              <div
                className="absolute rounded-full"
                style={{
                  width: "200px", height: "200px",
                  top: "50%", left: "50%",
                  transform: "translate(-35%, -50%)",
                  background: "rgba(37,99,235,0.12)",
                  border: "2px solid rgba(37,99,235,0.35)",
                }}
                aria-hidden="true"
              />
              {/* Zoom +/- */}
              <div className="absolute right-3 top-1/2 -translate-y-1/2 flex flex-col gap-0.5" aria-hidden="true">
                {["+", "−"].map(s => (
                  <div
                    key={s}
                    className="w-6 h-6 rounded flex items-center justify-center text-sm font-bold cursor-pointer shadow"
                    style={{ background: isDark ? "#1e293b" : "#ffffff", color: isDark ? "#f1f5f9" : "#374151" }}
                  >
                    {s}
                  </div>
                ))}
              </div>
              {/* Green location pin */}
              <div
                className="absolute flex flex-col items-center"
                style={{ top: "45%", left: "47%", transform: "translate(-50%, -100%)" }}
                aria-hidden="true"
              >
                <div
                  className="w-8 h-8 rounded-full shadow-lg flex items-center justify-center text-white"
                  style={{ background: "#16a34a" }}
                >
                  <MapPin className="w-4 h-4" />
                </div>
              </div>
              {/* City label */}
              <div
                className="absolute bottom-4 left-1/2 -translate-x-1/2 text-sm font-bold"
                style={{ color: isDark ? "#f1f5f9" : "#111827" }}
                aria-hidden="true"
              >
                {city}
              </div>
            </div>
          </div>

          {/* Right: booking widget */}
          {!compact && (
            <div className="w-64 shrink-0">
              <div
                className="p-5 rounded-xl border"
                style={{
                  background: isDark ? "#1e293b" : "#ffffff",
                  borderColor: isDark ? "rgba(255,255,255,0.08)" : "#e5e7eb",
                }}
              >
                {/* Postcode checker */}
                <p className="text-xs font-bold mb-2" style={{ color: isDark ? "#f1f5f9" : "#111827" }}>
                  Do we come to your area?
                </p>
                <input
                  readOnly
                  placeholder="Enter your Postcode"
                  className="w-full text-xs h-9 px-3 rounded-lg border mb-1.5"
                  style={{
                    background: isDark ? "#0f172a" : "#ffffff",
                    borderColor: isDark ? "rgba(255,255,255,0.1)" : "#e5e7eb",
                    color: isDark ? "#94a3b8" : "#374151",
                  }}
                />
                <p className="text-[10px] mb-4 leading-relaxed" style={{ color: isDark ? "#64748b" : "#9ca3af" }}>
                  We'll show whether we can visit your address and available dates.
                </p>

                <div style={{ borderTop: `1px solid ${isDark ? "rgba(255,255,255,0.06)" : "#f0f0f2"}` }} className="mb-3 pt-3">
                  <p className="text-xs font-bold mb-3" style={{ color: isDark ? "#f1f5f9" : "#111827" }}>
                    Book Appointment
                  </p>
                  <div className="flex flex-col gap-2">
                    {[
                      { Icon: Phone,    text: phone },
                      { Icon: Mail,     text: email },
                      { Icon: Facebook, text: "Facebook Messenger" },
                    ].map(({ Icon, text }) => (
                      <div key={text} className="flex items-center gap-2">
                        <div
                          className="w-6 h-6 rounded-full flex items-center justify-center shrink-0"
                          style={{ background: hexToRgba(secondary, 0.15) }}
                        >
                          <Icon className="w-3 h-3" style={{ color: secondary }} aria-hidden="true" />
                        </div>
                        <a href="#" className="text-[11px] underline" style={{ color: isDark ? "#94a3b8" : "#374151" }}>
                          {text}
                        </a>
                      </div>
                    ))}
                  </div>
                </div>

                <div style={{ borderTop: `1px solid ${isDark ? "rgba(255,255,255,0.06)" : "#f0f0f2"}` }} className="pt-3">
                  <p className="text-xs font-bold mb-2.5" style={{ color: isDark ? "#f1f5f9" : "#111827" }}>
                    Hours
                  </p>
                  {[
                    { day: "Mon - Fri:", hrs: "24 hour" },
                    { day: "Sat - Sun:", hrs: "24 hour" },
                  ].map(({ day, hrs }) => (
                    <div key={day} className="flex items-center justify-between mb-1.5">
                      <span className="text-[11px] font-medium" style={{ color: secondary }}>{day}</span>
                      <span className="text-[11px]" style={{ color: isDark ? "#94a3b8" : "#374151" }}>{hrs}</span>
                    </div>
                  ))}
                  <div
                    className="px-3 py-1.5 rounded-lg text-center text-[11px] font-bold mt-2"
                    style={{
                      background: hexToRgba(secondary, 0.18),
                      color: isDark ? secondary : "#92400e",
                    }}
                  >
                    24/7 + Including Holidays
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

// ─── AwardsSection ────────────────────────────────────────────────────────────

function AwardsSection({ isDark }: { isDark: boolean }) {
  const { secondary } = useColors();
  return (
    <section
      className="px-6 py-10"
      style={{
        background: isDark ? "#0f172a" : "#ffffff",
        borderTop: `1px solid ${isDark ? "rgba(255,255,255,0.06)" : "#f0f0f2"}`,
      }}
      aria-label="Awards and recognition"
    >
      <div className="max-w-4xl mx-auto flex items-start gap-10">
        <div className="flex-1">
          <h2 className="text-xl font-extrabold mb-3" style={{ color: isDark ? "#f1f5f9" : "#111827" }}>
            Recognized by the Best
          </h2>
          <p className="text-sm max-w-lg leading-relaxed" style={{ color: isDark ? "#64748b" : "#6b7280" }}>
            Our clinic meets the highest standards of veterinary excellence, proudly accredited by the American Animal Hospital Association (AAHA) and certified as a Fear Free practice. These recognitions reflect our ongoing commitment to safe, compassionate, and stress-free care for every patient who walks through our doors.
          </p>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          {[0, 1].map(i => (
            <div
              key={i}
              className="w-20 h-20 rounded-xl flex flex-col items-center justify-center gap-1.5 text-center p-2"
              style={{ background: secondary }}
            >
              <p className="text-white font-black text-[8px] tracking-widest leading-tight">
                AAHA<br />ACCREDITED
              </p>
              <div style={{ width: "32px", height: "1px", background: "rgba(255,255,255,0.4)" }} />
              <p className="text-white/70 leading-tight text-center" style={{ fontSize: "6px" }}>
                The Standard of<br />Veterinary Excellence
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── TeamSection ──────────────────────────────────────────────────────────────

function TeamSection({
  clinic, primaryColor, isDark, compact, sectionTitle, sectionSubtitle,
}: {
  clinic: ClinicWebsite;
  primaryColor: string;
  isDark: boolean;
  compact: boolean;
  sectionTitle?: string;
  sectionSubtitle?: string;
}) {
  const { primary } = useColors();
  const vets = clinic.veterinarians.filter(v => v.isVisible).sort((a, b) => a.order - b.order);
  const displayed = vets.length < 8
    ? [...vets, ...vets, ...vets, ...vets].slice(0, 8)
    : vets.slice(0, 8);

  return (
    <section
      className="px-6 py-12"
      style={{
        background: isDark ? "#0d1117" : "#f8f9fb",
        borderTop: `1px solid ${isDark ? "rgba(255,255,255,0.06)" : "#f0f0f2"}`,
      }}
      aria-label="Team"
    >
      <div className="max-w-4xl mx-auto">
        {/* Header row */}
        <div className="flex items-start justify-between mb-2">
          <div className="flex-1 pr-6">
            <h2
              data-ai-section="teams"
              data-ai-field="teams.title"
              title="Click to edit section title"
              className={`font-extrabold ${compact ? "text-xl" : "text-2xl"}`}
              style={{ color: isDark ? "#f1f5f9" : "#111827" }}
            >
              {sectionTitle || "Meet our caring veterinary team"}
            </h2>
            <p
              data-ai-section="teams"
              data-ai-field="teams.subtitle"
              title="Click to edit section subtitle"
              className="text-sm mt-2 max-w-2xl leading-relaxed"
              style={{ color: isDark ? "#64748b" : "#6b7280" }}
            >
              {sectionSubtitle || `The professional and courteous staff at ${clinic.general.name} seeks to provide the best possible medical care, surgical care, and dental care for their highly-valued patients.`}
            </p>
          </div>
          <button
            className="shrink-0 px-4 py-2 rounded-lg text-xs font-bold text-white shadow-sm"
            style={{ background: primary }}
          >
            View Full Team
          </button>
        </div>

        {/* Grid — borderless matching reference */}
        <div
          className="mt-8 grid gap-x-5 gap-y-7"
          style={{ gridTemplateColumns: compact ? "1fr 1fr" : "repeat(4, 1fr)" }}
        >
          {displayed.map((vet, idx) => {
            const initials = vet.name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase();
            return (
              <div key={`${vet.id}-${idx}`}>
                {/* Photo */}
                <div
                  className="w-full rounded-lg overflow-hidden mb-3"
                  style={{ height: "190px", background: isDark ? "#111827" : "#e5e7eb" }}
                >
                  {vet.photoUrl ? (
                    <img
                      src={vet.photoUrl}
                      alt={vet.name}
                      className="w-full h-full object-cover object-top"
                      loading="lazy"
                    />
                  ) : (
                    <div
                      className="w-full h-full flex items-center justify-center text-2xl font-extrabold text-white"
                      style={{ background: primaryColor }}
                    >
                      {initials}
                    </div>
                  )}
                </div>
                {/* Info — no border */}
                <p className="text-sm font-bold leading-snug" style={{ color: isDark ? "#f1f5f9" : "#111827" }}>
                  {vet.name}
                </p>
                {vet.title && (
                  <p className="text-xs mt-0.5 mb-1.5" style={{ color: isDark ? "#64748b" : "#6b7280" }}>
                    {vet.title}
                  </p>
                )}
                {vet.bio && (
                  <p
                    className="text-xs leading-relaxed"
                    style={{
                      color: isDark ? "#475569" : "#6b7280",
                      display: "-webkit-box",
                      WebkitLineClamp: 3,
                      WebkitBoxOrient: "vertical",
                      overflow: "hidden",
                    } as React.CSSProperties}
                  >
                    {vet.bio}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

// ─── Google Logo ──────────────────────────────────────────────────────────────

function GoogleLogo() {
  return (
    <span className="text-xs font-black leading-none" aria-label="Google">
      <span style={{ color: "#4285F4" }}>G</span>
      <span style={{ color: "#EA4335" }}>o</span>
      <span style={{ color: "#FBBC05" }}>o</span>
      <span style={{ color: "#4285F4" }}>g</span>
      <span style={{ color: "#34A853" }}>l</span>
      <span style={{ color: "#EA4335" }}>e</span>
    </span>
  );
}

// ─── TestimonialsSection ──────────────────────────────────────────────────────

const MOCK_REVIEWS = [
  {
    name: "James Carter", date: "September 2025", rating: 5,
    text: "When designing the multi-location template for the Mobile Clinic, the primary goal is to ensure that the experience remains simple, intuitive, and scalable, while still reflecting the sophistication.",
  },
  {
    name: "James Carter", date: "September 2025", rating: 5,
    text: "When designing the multi-location template for the Mobile Clinic, the primary goal is to ensure that the experience remains simple, intuitive, and scalable, while still reflecting the sophistication.",
  },
  {
    name: "James Carter", date: "September 2025", rating: 5,
    text: "When designing the multi-location template for the Mobile Clinic, the primary goal is to ensure that the experience remains simple, intuitive, and scalable, while still reflecting the sophistication. how is this id",
  },
];

function TestimonialsSection({
  isDark, compact,
  sectionTitle, subtitle, totalReviews, rating,
}: {
  isDark: boolean;
  compact: boolean;
  sectionTitle?: string;
  subtitle?: string;
  totalReviews?: string;
  rating?: string;
}) {
  const { secondary } = useColors();
  const ratingNum = parseFloat(rating ?? "4.7");
  const filledStars = Math.round(ratingNum);

  return (
    <section
      className="px-6 py-12"
      style={{
        background: isDark ? "#0f172a" : "#ffffff",
        borderTop: `1px solid ${isDark ? "rgba(255,255,255,0.06)" : "#f0f0f2"}`,
      }}
      aria-label="Testimonials"
    >
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div>
            <h2
              data-ai-section="testimonials"
              data-ai-field="testimonials.title"
              title="Click to edit section title"
              className={`font-extrabold ${compact ? "text-xl" : "text-2xl"}`}
              style={{ color: isDark ? "#f1f5f9" : "#111827" }}
            >
              {sectionTitle || "Hear From Happy Pet Owners"}
            </h2>
          </div>
          <div className="shrink-0 text-right">
            <p className="text-sm font-bold" style={{ color: isDark ? "#f1f5f9" : "#111827" }}>
              {totalReviews || "100"} Total Reviews
            </p>
            <div className="flex items-center gap-0.5 mt-1 justify-end">
              {[0, 1, 2, 3, 4].map(i => (
                <Star key={i} className="w-3.5 h-3.5 fill-current" style={{ color: i < filledStars ? secondary : "#e5e7eb" }} aria-hidden="true" />
              ))}
              <span className="text-sm font-bold ml-1" style={{ color: isDark ? "#f1f5f9" : "#111827" }}>{rating || "4.7"}</span>
            </div>
          </div>
        </div>
        <p
          data-ai-section="testimonials"
          data-ai-field="testimonials.subtitle"
          title="Click to edit subtitle"
          className="text-sm mb-8 leading-relaxed"
          style={{ color: isDark ? "#64748b" : "#6b7280" }}
        >
          {subtitle || "Real stories from our valued clients—because your trust means everything to us. See why pet parents love our care!"}
        </p>

        <div
          className="grid gap-4"
          style={{ gridTemplateColumns: compact ? "1fr" : "repeat(3, 1fr)" }}
        >
          {MOCK_REVIEWS.map((r, i) => (
            <div
              key={i}
              className="p-4 rounded-xl flex flex-col gap-3"
              style={{
                background: isDark ? "#1e293b" : "#f5f3ef",
                border: `1px solid ${isDark ? "rgba(255,255,255,0.06)" : "transparent"}`,
              }}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold" style={{ color: isDark ? "#f1f5f9" : "#111827" }}>
                    {r.name}
                  </span>
                  <span className="text-xs" style={{ color: isDark ? "#64748b" : "#9ca3af" }}>{r.date}</span>
                </div>
                <div className="flex gap-0.5">
                  {Array.from({ length: r.rating }).map((_, j) => (
                    <Star key={j} className="w-3 h-3 fill-current" style={{ color: secondary }} aria-hidden="true" />
                  ))}
                </div>
              </div>
              <p
                className="text-xs leading-relaxed flex-1"
                style={{
                  color: isDark ? "#64748b" : "#4b5563",
                  display: "-webkit-box",
                  WebkitLineClamp: 4,
                  WebkitBoxOrient: "vertical",
                  overflow: "hidden",
                } as React.CSSProperties}
              >
                {r.text}
              </p>
              <div className="flex items-center justify-between">
                <a
                  href="#"
                  className="text-xs font-semibold underline"
                  style={{ color: isDark ? "#94a3b8" : "#111827" }}
                >
                  Read More
                </a>
                <GoogleLogo />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── JoinTeamSection ──────────────────────────────────────────────────────────

function JoinTeamSection({
  clinic, isDark, compact,
  heading, description, ctaLabel,
}: {
  clinic: ClinicWebsite;
  isDark: boolean;
  compact: boolean;
  heading?: string;
  description?: string;
  ctaLabel?: string;
}) {
  const { primary } = useColors();
  return (
    <section
      style={{ borderTop: `1px solid ${isDark ? "rgba(255,255,255,0.06)" : "#f0f0f2"}` }}
      aria-label="Careers"
    >
      <div
        className="flex"
        style={{ flexDirection: compact ? "column" : "row", minHeight: "280px" }}
      >
        {/* Left text */}
        <div
          className="flex-1 flex flex-col justify-center px-10 py-12"
          style={{ background: isDark ? "#0f172a" : "#f8f9fb" }}
        >
          <h2
            data-ai-section="jointeam"
            data-ai-field="jointeam.heading"
            title="Click to edit heading"
            className="font-extrabold mb-3"
            style={{ fontSize: "22px", color: isDark ? "#f1f5f9" : "#111827" }}
          >
            {heading || "Join Our Team"}
          </h2>
          <p
            data-ai-section="jointeam"
            data-ai-field="jointeam.description"
            title="Click to edit description"
            className="text-sm leading-relaxed mb-6 max-w-sm"
            style={{ color: isDark ? "#64748b" : "#4b5563" }}
          >
            {description || "This isn't just a job for us, it's our way of life! We're always looking for outstanding people to join our team. If you're passionate about pets, people, and fun, we welcome you to browse our current openings and apply."}
          </p>
          <button
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-bold text-white w-fit"
            style={{ background: primary }}
          >
            {ctaLabel || "View Careers"}
          </button>
        </div>

        {/* Right image */}
        <div
          className="flex-1 relative overflow-hidden"
          style={{
            minHeight: compact ? "200px" : undefined,
            background: isDark ? "#1e293b" : "#c7d7e8",
          }}
        >
          <img
            src="https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=800&auto=format&fit=crop&q=80"
            alt="Veterinary staff caring for an animal"
            className="w-full h-full object-cover object-center"
            onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }}
          />
        </div>
      </div>
    </section>
  );
}

// ─── FAQSection ───────────────────────────────────────────────────────────────

const FAQS = [
  {
    q: "What services do you offer at different clinics?",
    a: "We provide comprehensive veterinary care, including wellness exams, vaccinations, dental care, surgery, emergency services, and pet boarding. Our team is dedicated to ensuring your pet's long-term health.",
  },
  {
    q: "How do I book an appointment?",
    a: "You can book online through our website, call us directly, or use our mobile app. We also accept walk-ins for urgent care situations.",
  },
  {
    q: "Do all clinics accept emergencies?",
    a: "Yes, our emergency line is available 24/7 including holidays. Please call the emergency number listed on our contact page.",
  },
  {
    q: "How can I join the network?",
    a: "Visit our Careers page to explore current openings. We're always looking for passionate veterinary professionals to join our team.",
  },
  {
    q: "What types of roles are available?",
    a: "We hire veterinarians, veterinary technicians, receptionists, and administrative staff. All positions are listed on our Careers page.",
  },
];

function FAQSection({
  isDark, compact, sectionTitle, subtitle,
}: {
  isDark: boolean;
  compact: boolean;
  sectionTitle?: string;
  subtitle?: string;
}) {
  const { secondary } = useColors();
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section
      className="px-6 py-12"
      style={{
        background: isDark ? "#0f172a" : "#ffffff",
        borderTop: `1px solid ${isDark ? "rgba(255,255,255,0.06)" : "#f0f0f2"}`,
      }}
      aria-label="FAQ"
    >
      <div className="max-w-4xl mx-auto">
        <h2
          data-ai-section="faq"
          data-ai-field="faq.title"
          title="Click to edit section title"
          className={`font-extrabold mb-2 ${compact ? "text-xl" : "text-2xl"}`}
          style={{ color: isDark ? "#f1f5f9" : "#111827" }}
        >
          {sectionTitle || "Your Questions, Answered"}
        </h2>
        <p
          data-ai-section="faq"
          data-ai-field="faq.subtitle"
          title="Click to edit subtitle"
          className="text-sm mb-8 max-w-2xl leading-relaxed"
          style={{ color: isDark ? "#64748b" : "#6b7280" }}
        >
          {subtitle || "We've compiled answers to the questions we get asked most by pet owners, clinic partners, and team members. Find quick guidance on appointments, services, partnerships, and careers — all in one place."}
        </p>

        <div
          className="flex gap-10"
          style={{ flexDirection: compact ? "column" : "row", alignItems: "flex-start" }}
        >
          {/* Accordion */}
          <div className="flex-1 flex flex-col gap-2">
            {FAQS.map((faq, i) => (
              <div
                key={i}
                className="rounded-xl border overflow-hidden"
                style={{
                  borderColor: isDark ? "rgba(255,255,255,0.08)" : "#e5e7eb",
                  background: isDark ? "#0f172a" : "#ffffff",
                }}
              >
                <button
                  type="button"
                  onClick={() => setOpen(open === i ? null : i)}
                  className="w-full flex items-center justify-between px-4 py-3.5 text-left"
                  style={{
                    background: open === i
                      ? isDark ? "#1e293b" : "#f8f9fb"
                      : "transparent",
                  }}
                >
                  <span
                    className="text-xs font-semibold pr-4 leading-snug"
                    style={{ color: isDark ? "#e2e8f0" : "#111827" }}
                  >
                    {faq.q}
                  </span>
                  {open === i ? (
                    <ChevronUp
                      className="w-4 h-4 shrink-0"
                      style={{ color: secondary }}
                      aria-hidden="true"
                    />
                  ) : (
                    <ChevronDown
                      className="w-4 h-4 shrink-0"
                      style={{ color: isDark ? "#64748b" : "#9ca3af" }}
                      aria-hidden="true"
                    />
                  )}
                </button>
                {open === i && (
                  <div
                    className="px-4 pb-4"
                    style={{ background: isDark ? "#1e293b" : "#f8f9fb" }}
                  >
                    <p className="text-xs leading-relaxed" style={{ color: isDark ? "#64748b" : "#6b7280" }}>
                      {faq.a}
                    </p>
                  </div>
                )}
              </div>
            ))}
            <div className="pt-1">
              <a
                href="#"
                className="text-xs font-semibold underline underline-offset-2"
                style={{ color: isDark ? "#94a3b8" : "#111827" }}
              >
                View All FAQ
              </a>
            </div>
          </div>

          {/* Side image */}
          {!compact && (
            <div
              className="w-72 shrink-0 rounded-2xl overflow-hidden"
              style={{ minHeight: "340px", background: isDark ? "#1e293b" : "#d1e3cc" }}
            >
              <img
                src="https://images.unsplash.com/photo-1534361960057-19f4434a337d?w=600&auto=format&fit=crop&q=80"
                alt="Happy child with pet dog"
                className="w-full h-full object-cover"
                onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }}
              />
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

// ─── NewsletterSection ────────────────────────────────────────────────────────

function NewsletterSection({
  clinic, isDark, promptText, ctaLabel,
}: {
  clinic: ClinicWebsite;
  isDark: boolean;
  promptText?: string;
  ctaLabel?: string;
}) {
  const { primary } = useColors();
  return (
    <section
      className="px-6 py-8"
      style={{
        background: isDark ? "#1e293b" : "#f1f4f8",
        borderTop: `1px solid ${isDark ? "rgba(255,255,255,0.06)" : "#e5e7eb"}`,
      }}
      aria-label="Newsletter"
    >
      <div className="max-w-4xl mx-auto flex items-center justify-between gap-6 flex-wrap">
        <p
          data-ai-section="newsletter"
          data-ai-field="newsletter.promptText"
          title="Click to edit prompt text"
          className="text-sm font-bold"
          style={{ color: isDark ? "#f1f5f9" : "#111827" }}
        >
          {promptText || "Subscribe Now To Receive Updates From"} {clinic.general.name}
        </p>
        <div className="flex items-center gap-2">
          <input
            readOnly
            placeholder="Enter your Email"
            className="h-10 px-4 text-sm rounded-lg border"
            style={{
              width: "260px",
              background: isDark ? "#0f172a" : "#ffffff",
              borderColor: isDark ? "rgba(255,255,255,0.1)" : "#d1d5db",
              color: isDark ? "#94a3b8" : "#374151",
            }}
          />
          <button
            className="h-10 px-5 rounded-lg text-sm font-bold text-white shrink-0"
            style={{ background: primary }}
          >
            {ctaLabel || "Subscribe Now"}
          </button>
        </div>
      </div>
    </section>
  );
}

// ─── Footer ───────────────────────────────────────────────────────────────────

export function Footer({
  clinic, isDark,
}: { clinic: ClinicWebsite; isDark: boolean }) {
  const { primary, secondary } = useColors();
  const { name } = clinic.general;
  const addr  = clinic.contact?.address;
  const phone = clinic.contact?.phone  ?? "812-283-4910";
  const email = clinic.contact?.email  ?? "info@company.com";

  return (
    <footer
      style={{
        background: isDark ? "#020617" : "#ffffff",
        borderTop: `1px solid ${isDark ? "rgba(255,255,255,0.06)" : "#e5e7eb"}`,
      }}
      aria-label="Footer"
    >
      <div className="px-6 py-10">
        <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8">

          {/* Col 1: Brand */}
          <div>
            <p className="text-sm font-bold mb-3" style={{ color: secondary }}>
              {name}
            </p>
            {addr && (
              <p className="text-xs leading-relaxed" style={{ color: isDark ? "#64748b" : "#6b7280" }}>
                {addr.street}<br />
                {addr.city}, {addr.state}<br />
                {addr.zip}
              </p>
            )}
          </div>

          {/* Col 2: Book Appointment */}
          <div>
            <p className="text-xs font-bold mb-3" style={{ color: isDark ? "#f1f5f9" : "#111827" }}>
              Book Appointment
            </p>
            <div className="flex flex-col gap-2.5">
              {[
                { Icon: Phone,    text: phone },
                { Icon: Mail,     text: email },
                { Icon: Facebook, text: "Facebook" },
              ].map(({ Icon, text }) => (
                <div key={text} className="flex items-center gap-1.5">
                  <Icon className="w-3 h-3 shrink-0" style={{ color: secondary }} aria-hidden="true" />
                  <a
                    href="#"
                    className="text-xs underline"
                    style={{ color: isDark ? "#64748b" : "#6b7280" }}
                  >
                    {text}
                  </a>
                </div>
              ))}
            </div>
          </div>

          {/* Col 3: Hours */}
          <div>
            <p className="text-xs font-bold mb-3" style={{ color: isDark ? "#f1f5f9" : "#111827" }}>
              Hours
            </p>
            {[
              { day: "Mon - Fri:", hrs: "7:00 am - 6:00 pm" },
              { day: "Sat - Sun:", hrs: "Closed" },
            ].map(({ day, hrs }) => (
              <div key={day} className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium" style={{ color: secondary }}>{day}</span>
                <span className="text-xs" style={{ color: isDark ? "#64748b" : "#6b7280" }}>{hrs}</span>
              </div>
            ))}
            <div
              className="px-3 py-1.5 rounded-lg text-xs font-bold text-center mt-2 w-fit"
              style={{
                background: hexToRgba(secondary, 0.18),
                color: isDark ? secondary : "#92400e",
              }}
            >
              24/7 + Including Holidays
            </div>
          </div>

          {/* Col 4: Links */}
          <div>
            <p className="text-xs font-bold mb-3" style={{ color: isDark ? "#f1f5f9" : "#111827" }}>
              Links
            </p>
            {["About us", "Customers"].map(link => (
              <a
                key={link}
                href="#"
                className="block text-xs mb-2"
                style={{ color: isDark ? "#64748b" : "#6b7280" }}
              >
                {link}
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div
        className="px-6 py-3 flex flex-wrap items-center justify-between gap-2 text-xs"
        style={{
          background: isDark ? "rgba(0,0,0,0.3)" : "#f8f9fb",
          borderTop: `1px solid ${isDark ? "rgba(255,255,255,0.06)" : "#e5e7eb"}`,
          color: isDark ? "rgba(255,255,255,0.35)" : "#9ca3af",
        }}
      >
        <span>© 2025 AMERIVET. All rights reserved.</span>
        <div className="flex gap-5">
          {["Terms of Service", "Privacy Policy", "Cookies", "Cookie Settings"].map(t => (
            <a key={t} href="#" className="hover:underline transition-colors">{t}</a>
          ))}
        </div>
      </div>
    </footer>
  );
}

// ─── ClinicHomepageTemplate ───────────────────────────────────────────────────

interface Props {
  clinic: ClinicWebsite;
  heroState: HeroEditorState;
  teamsState: TeamsEditorState;
  servicesState?: ServicesEditorState;
  locationsState?: LocationsEditorState;
  testimonialsState?: TestimonialsEditorState;
  joinTeamState?: JoinTeamEditorState;
  faqState?: FAQEditorState;
  newsletterState?: NewsletterEditorState;
  compact?: boolean;
  theme?: PreviewTheme;
  /** DnD order from RightPanel — drives section render order */
  sectionOrder?: string[];
  /** Visibility map from RightPanel — hidden sections are not rendered */
  sectionVisibility?: Record<string, boolean>;
  /** Currently open section in the right panel — highlighted with a ring in preview */
  activeBlock?: string | null;
  /** Dynamic sections added via Section Templates */
  dynamicSections?: DynamicSectionRegistry;
  /** Non-null while user is dragging a template card from LeftPanel */
  draggingTemplateType?: AddableSectionType | null;
  /** Called when user drops a template between sections */
  onTemplateDrop?: (type: AddableSectionType, afterIndex: number) => void;
}

// ─── DropZone ─────────────────────────────────────────────────────────────────

function DropZone({
  afterIndex, isActive, draggingType, onDrop,
}: {
  afterIndex: number;
  isActive: boolean;
  draggingType?: AddableSectionType | null;
  onDrop?: (type: AddableSectionType, afterIndex: number) => void;
}) {
  const [isOver, setIsOver] = useState(false);

  if (!isActive && !isOver) return <div style={{ height: 0 }} />;

  const label = draggingType
    ? `Insert ${DYNAMIC_SECTION_META[draggingType]?.label ?? draggingType}`
    : "Drop section here";

  return (
    // Outer: tall hit area so it's easy to target while dragging
    <div
      className="relative flex items-center justify-center"
      style={{
        height: isOver ? 60 : 28,
        transition: "height 120ms ease",
        cursor: "copy",
        zIndex: 10,
      }}
      onDragOver={(e) => {
        if (e.dataTransfer.types.includes("application/cms-template-type")) {
          e.preventDefault();
          e.dataTransfer.dropEffect = "copy";
          if (!isOver) setIsOver(true);
        }
      }}
      onDragLeave={(e) => {
        // Only clear when leaving the zone itself (not a child element)
        if (!e.currentTarget.contains(e.relatedTarget as Node)) {
          setIsOver(false);
        }
      }}
      onDrop={(e) => {
        const type = e.dataTransfer.getData("application/cms-template-type") as AddableSectionType;
        if (type && onDrop) onDrop(type, afterIndex);
        setIsOver(false);
      }}
    >
      {/* Visual insertion line */}
      <div
        className="absolute inset-x-0 rounded-full transition-all duration-100"
        style={{
          height: isOver ? 3 : 2,
          background: isOver ? "#6366f1" : "rgba(99,102,241,0.4)",
          top: "50%",
          transform: "translateY(-50%)",
        }}
      />
      {/* End-cap circles on the line */}
      {!isOver && (
        <>
          <div
            className="absolute w-2 h-2 rounded-full bg-white border-2 transition-colors"
            style={{ left: 6, top: "50%", transform: "translateY(-50%)", borderColor: "rgba(99,102,241,0.5)" }}
          />
          <div
            className="absolute w-2 h-2 rounded-full bg-white border-2 transition-colors"
            style={{ right: 6, top: "50%", transform: "translateY(-50%)", borderColor: "rgba(99,102,241,0.5)" }}
          />
        </>
      )}
      {/* Drop badge — shows specific section type */}
      {isOver && (
        <div
          className="relative z-10 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold text-white shadow-lg select-none"
          style={{ background: "#6366f1", boxShadow: "0 4px 14px rgba(99,102,241,0.45)" }}
        >
          <span className="text-sm leading-none">+</span>
          <span>{label}</span>
        </div>
      )}
    </div>
  );
}

// ─── ClinicHomepageTemplate ───────────────────────────────────────────────────

export function ClinicHomepageTemplate({
  clinic, heroState, teamsState, compact = false, theme = "1",
  servicesState, locationsState, testimonialsState,
  joinTeamState, faqState, newsletterState,
  sectionOrder, sectionVisibility, activeBlock,
  dynamicSections, draggingTemplateType, onTemplateDrop,
}: Props) {
  const primaryColor   = clinic.general.primaryColor   ?? "#0F766E";
  const secondaryColor = clinic.general.secondaryColor ?? "#F59E0B";
  const isDark = theme === "2";

  // Extract the live nav block injected by WebsiteEditorPage
  const navBlock = clinic.blocks?.find(
    (b): b is NavigationBlock => b.type === "navigation"
  );

  // ── Section renderer map ──────────────────────────────────────────────────
  // Each key maps to its JSX. Keyed Fragment lets React preserve component
  // state (e.g. FAQ accordion open state) when sections are reordered.

  const renderers: Record<SectionId, React.ReactNode> = {
    hero: (
      <HeroSection
        clinic={clinic}
        heroState={heroState}
        primaryColor={primaryColor}
        isDark={isDark}
        compact={compact}
      />
    ),
    quicklinks: <QuickLinks isDark={isDark} />,
    services: (
      <ServicesSection
        clinic={clinic}
        secondaryColor={secondaryColor}
        isDark={isDark}
        compact={compact}
        sectionTitle={servicesState?.sectionTitle}
        sectionSubtitle={servicesState?.sectionSubtitle}
        gridColumns={servicesState?.gridColumns}
      />
    ),
    locations: (
      <LocationsMap
        clinic={clinic}
        isDark={isDark}
        compact={compact}
        showAnimals={locationsState?.showAnimals}
        showMap={locationsState?.showMap}
        showBookingWidget={locationsState?.showBookingWidget}
        nextAvailable={locationsState?.nextAvailable}
      />
    ),
    awards: <AwardsSection isDark={isDark} />,
    teams: (
      <TeamSection
        clinic={clinic}
        primaryColor={primaryColor}
        isDark={isDark}
        compact={compact}
        sectionTitle={teamsState.sectionTitle}
        sectionSubtitle={teamsState.sectionSubtitle}
      />
    ),
    testimonials: (
      <TestimonialsSection
        isDark={isDark}
        compact={compact}
        sectionTitle={testimonialsState?.sectionTitle}
        subtitle={testimonialsState?.subtitle}
        totalReviews={testimonialsState?.totalReviews}
        rating={testimonialsState?.rating}
      />
    ),
    jointeam: (
      <JoinTeamSection
        clinic={clinic}
        isDark={isDark}
        compact={compact}
        heading={joinTeamState?.heading}
        description={joinTeamState?.description}
        ctaLabel={joinTeamState?.ctaLabel}
      />
    ),
    faq: (
      <FAQSection
        isDark={isDark}
        compact={compact}
        sectionTitle={faqState?.sectionTitle}
        subtitle={faqState?.subtitle}
      />
    ),
    newsletter: (
      <NewsletterSection
        clinic={clinic}
        isDark={isDark}
        promptText={newsletterState?.promptText}
        ctaLabel={newsletterState?.ctaLabel}
      />
    ),
    footer: <Footer clinic={clinic} isDark={isDark} />,
  };

  const order = sectionOrder ?? INITIAL_SECTION_ORDER;
  const isDragging = !!draggingTemplateType;

  /** Renders either a core section or a dynamic section by id. */
  function renderSectionById(id: string): React.ReactNode {
    // Try core section first
    if (id in renderers) return renderers[id as SectionId];
    // Try dynamic section
    const ds = dynamicSections?.[id];
    if (!ds) return null;
    const p = { isDark, compact };
    switch (ds.type) {
      // ── Existing ──
      case "stats":         return <StatsSectionRenderer         state={ds.state} {...p} />;
      case "ctaband":       return <CtaBandSectionRenderer       state={ds.state} {...p} />;
      case "gallery":       return <GallerySectionRenderer       state={ds.state} {...p} />;
      case "contactinfo":   return <ContactInfoSectionRenderer   state={ds.state} {...p} />;
      case "teamspotlight": return <TeamSpotlightSectionRenderer state={ds.state} {...p} />;
      // ── Typography ──
      case "heading":       return <HeadingSectionRenderer       state={ds.state} {...p} />;
      case "paragraph":     return <ParagraphSectionRenderer     state={ds.state} {...p} />;
      case "textblock":     return <TextBlockSectionRenderer     state={ds.state} {...p} />;
      case "blockquote":    return <BlockQuoteSectionRenderer    state={ds.state} {...p} />;
      case "richtext":      return <RichTextSectionRenderer      state={ds.state} {...p} />;
      // ── Layout ──
      case "empty":         return <EmptySectionRenderer         state={ds.state} {...p} />;
      case "twocol":        return <TwoColSectionRenderer        state={ds.state} {...p} />;
      case "threecol":      return <ThreeColSectionRenderer      state={ds.state} {...p} />;
      // ── Cards ──
      case "cardgrid2":     return <CardGridSectionRenderer      state={ds.state} {...p} />;
      case "cardgrid3":     return <CardGridSectionRenderer      state={ds.state} {...p} />;
      case "teamcards":     return <TeamCardsSectionRenderer     state={ds.state} {...p} />;
      // ── Hero ──
      case "herocentered":  return <HeroCenteredSectionRenderer  state={ds.state} {...p} />;
      case "herosplit":     return <HeroSplitSectionRenderer     state={ds.state} {...p} />;
      // ── Contact ──
      case "contactsplit":  return <ContactSplitSectionRenderer  state={ds.state} {...p} />;
      // ── Marketing ──
      case "emailcapture":  return <EmailCaptureSectionRenderer  state={ds.state} {...p} />;
      case "splitcontent":  return <SplitContentSectionRenderer  state={ds.state} {...p} />;
      case "featuregrid":   return <FeatureGridSectionRenderer   state={ds.state} {...p} />;
      default:              return null;
    }
  }

  const dType = draggingTemplateType ?? undefined;

  return (
    <TemplateColorsCtx.Provider value={{ primary: primaryColor, secondary: secondaryColor }}>
    <div style={{ fontFamily: "'Inter', system-ui, sans-serif", color: isDark ? "#e2e8f0" : "#1a1a1a" }}>
      <TopBanner />
      <Navbar clinic={clinic} isDark={isDark} navBlock={navBlock} />

      {/* Canvas drag hint — sticky banner when a template is being dragged */}
      {isDragging && (
        <div
          className="sticky top-0 z-50 flex items-center justify-center gap-2 py-2 text-xs font-semibold text-white select-none"
          style={{ background: "#6366f1", boxShadow: "0 2px 12px rgba(99,102,241,0.4)" }}
        >
          <span>Drop between sections to place</span>
          {draggingTemplateType && (
            <span
              className="bg-white/20 rounded-full px-2 py-0.5 text-white"
              style={{ fontSize: 11 }}
            >
              {DYNAMIC_SECTION_META[draggingTemplateType]?.emoji} {DYNAMIC_SECTION_META[draggingTemplateType]?.label}
            </span>
          )}
        </div>
      )}

      {/* DropZone before the very first section */}
      <DropZone afterIndex={-1} isActive={isDragging} draggingType={dType} onDrop={onTemplateDrop} />

      {order.map((id, idx) => {
        // Respect visibility — hidden sections are simply not rendered
        if (sectionVisibility && sectionVisibility[id] === false) {
          // Still render the drop zone so there's no gap in the drop targets
          return (
            <Fragment key={id}>
              <DropZone afterIndex={idx} isActive={isDragging} draggingType={dType} onDrop={onTemplateDrop} />
            </Fragment>
          );
        }
        const isActive = activeBlock === id;
        return (
          <Fragment key={id}>
            {/* Active-section ring: thin indigo outline mirrors the open accordion item */}
            <div
              style={{
                outline: isActive ? "2px solid rgba(99,102,241,0.35)" : "none",
                outlineOffset: "-2px",
                transition: "outline 200ms ease",
              }}
            >
              {renderSectionById(id)}
            </div>
            {/* DropZone after this section */}
            <DropZone afterIndex={idx} isActive={isDragging} draggingType={dType} onDrop={onTemplateDrop} />
          </Fragment>
        );
      })}
    </div>
    </TemplateColorsCtx.Provider>
  );
}
