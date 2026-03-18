import { useState, useCallback } from "react";
import {
  Pencil, Globe, GripVertical, Eye, EyeOff, ChevronDown,
  Sparkles, Link2, LayoutGrid, MapPin, Trophy, Users, MessageSquare,
  Briefcase, HelpCircle, Mail, Layout, Settings2,
  Image as ImageIcon, Trash2, Zap, RefreshCw, Tag,
  CheckCircle2, XCircle,
} from "lucide-react";
import { HeroEditor } from "./editors/HeroEditor";
import { ServicesEditor } from "./editors/ServicesEditor";
import { TeamsEditor } from "./editors/TeamsEditor";
import { AITextField, AITextarea } from "./ai/AITextField";
import type {
  OpenBlock, SectionId,
  HeroEditorState, ServicesEditorState, TeamsEditorState,
  LocationsEditorState, TestimonialsEditorState, JoinTeamEditorState,
  FAQEditorState, NewsletterEditorState, SEOState,
} from "./WebsiteEditorPage";
import type { ClinicWebsite } from "../../types/clinic";
import type { DynamicSectionRegistry, DynamicSectionState } from "./sections";
import {
  StatsEditor, CtaBandEditor, GalleryEditor, ContactInfoEditor, TeamSpotlightEditor,
  HeadingEditor, ParagraphEditor, TextBlockEditor, BlockQuoteEditor, RichTextEditor,
  EmptyEditor, TwoColEditor, ThreeColEditor,
  CardGridEditor, TeamCardsEditor,
  HeroCenteredEditor, HeroSplitEditor,
  ContactSplitEditor,
  EmailCaptureEditor,
  SplitContentEditor,
  FeatureGridEditor,
  isDynamicSection, getTypeFromInstanceId, DYNAMIC_SECTION_META,
} from "./sections";
import {
  generateSEO,
  buildSEOContentInput,
  computeDetailedSEOChecks,
  type KeywordHit,
} from "./ai/seoGenerator";

// ─── Shared styles ─────────────────────────────────────────────────────────────

const INPUT =
  "w-full h-8 px-2.5 text-sm text-gray-900 bg-white border border-gray-200 rounded-md " +
  "placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#003459] " +
  "focus:border-[#003459] transition-colors";

const LABEL = "block text-xs font-medium text-gray-600 mb-1";

// ─── Greyscale open-state palette (single consistent tone) ────────────────────

const OPEN_COLORS = {
  accent: "#374151",   // gray-700 — left border bar + icon
  bg:     "#f9fafb",   // gray-50  — section background when open
  iconBg: "#f3f4f6",   // gray-100 — icon background when open
};

const SECTION_CATEGORY: Record<string, string> = {
  hero: "HEADER", quicklinks: "HEADER",
  services: "CONTENT", locations: "CONTENT", awards: "TRUST",
  teams: "TRUST", testimonials: "TRUST",
  jointeam: "ENGAGE", newsletter: "ENGAGE",
  faq: "INFO", footer: "INFO",
};

// ─── MiniToggle ────────────────────────────────────────────────────────────────

function MiniToggle({
  label, checked, onChange,
}: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="flex items-center justify-between py-1">
      <span className="text-xs text-gray-600">{label}</span>
      <button
        type="button" role="switch" aria-checked={checked} aria-label={label}
        onClick={() => onChange(!checked)}
        className={`relative inline-flex h-4 w-7 rounded-full border-2 border-transparent transition-colors
          focus:outline-none focus-visible:ring-2 focus-visible:ring-[#003459]
          ${checked ? "bg-[#003459]" : "bg-gray-200"}`}
      >
        <span className={`inline-block h-3 w-3 rounded-full bg-white shadow transform transition-transform
          ${checked ? "translate-x-3" : "translate-x-0"}`} />
      </button>
    </div>
  );
}

// ─── InfoBox ──────────────────────────────────────────────────────────────────

function InfoBox({ Icon, title, body }: { Icon: React.ElementType; title: string; body: string }) {
  return (
    <div className="flex gap-2.5 p-3.5 rounded-xl border border-dashed border-gray-200 bg-gray-50/80">
      <span className="w-7 h-7 rounded-lg bg-white border border-gray-200 flex items-center justify-center shrink-0 shadow-sm">
        <Icon className="w-3.5 h-3.5 text-gray-400" aria-hidden="true" />
      </span>
      <div>
        <p className="text-xs font-semibold text-gray-700 leading-snug">{title}</p>
        <p className="text-[10px] text-gray-400 mt-0.5 leading-relaxed">{body}</p>
      </div>
    </div>
  );
}

// ─── Inline editors ───────────────────────────────────────────────────────────

function QuickLinksEditorInline() {
  return (
    <div className="px-4 pb-4 pt-1">
      <InfoBox Icon={Link2} title="Auto-generated from Navigation"
        body="Quick link buttons are auto-generated from your site navigation. Edit links in Hospital Details." />
    </div>
  );
}

function LocationsEditorInline({
  state, onChange,
}: { state: LocationsEditorState; onChange: (u: Partial<LocationsEditorState>) => void }) {
  return (
    <div className="flex flex-col gap-4 px-4 pb-4 pt-1">
      <div className="flex flex-col gap-1 p-3 bg-gray-50 rounded-xl border border-gray-100">
        <MiniToggle label="Show animals we see" checked={state.showAnimals} onChange={(v) => onChange({ showAnimals: v })} />
        <MiniToggle label="Show map" checked={state.showMap} onChange={(v) => onChange({ showMap: v })} />
        <MiniToggle label="Show booking widget" checked={state.showBookingWidget} onChange={(v) => onChange({ showBookingWidget: v })} />
      </div>
      <div>
        <label className={LABEL}>Next available appointment</label>
        <input type="text" value={state.nextAvailable}
          onChange={(e) => onChange({ nextAvailable: e.target.value })}
          className={INPUT} placeholder="Today, 3:00 PM" />
      </div>
    </div>
  );
}

function AwardsEditorInline() {
  return (
    <div className="px-4 pb-4 pt-1">
      <InfoBox Icon={Trophy} title="Certifications from Hospital Details"
        body="AAHA accreditation badges and certifications are managed in Hospital Details under Certifications." />
    </div>
  );
}

function TestimonialsEditorInline({
  state, onChange,
}: { state: TestimonialsEditorState; onChange: (u: Partial<TestimonialsEditorState>) => void }) {
  return (
    <div className="flex flex-col gap-4 px-4 pb-4 pt-1">
      <div>
        <label className={LABEL}>Section heading</label>
        <AITextField
          value={state.sectionTitle}
          onChange={(v) => onChange({ sectionTitle: v })}
          fieldKey="testimonials.title"
          placeholder="Hear From Happy Pet Owners"
        />
      </div>
      <div>
        <label className={LABEL}>Subtitle</label>
        <AITextarea
          value={state.subtitle}
          onChange={(v) => onChange({ subtitle: v })}
          fieldKey="testimonials.subtitle"
          rows={2}
        />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={LABEL}>Total reviews</label>
          <input type="text" value={state.totalReviews}
            onChange={(e) => onChange({ totalReviews: e.target.value })}
            className={INPUT} placeholder="100" />
        </div>
        <div>
          <label className={LABEL}>Avg. rating</label>
          <input type="text" value={state.rating}
            onChange={(e) => onChange({ rating: e.target.value })}
            className={INPUT} placeholder="4.7" />
        </div>
      </div>
    </div>
  );
}

function JoinTeamEditorInline({
  state, onChange,
}: { state: JoinTeamEditorState; onChange: (u: Partial<JoinTeamEditorState>) => void }) {
  return (
    <div className="flex flex-col gap-4 px-4 pb-4 pt-1">
      <div>
        <label className={LABEL}>Heading</label>
        <AITextField
          value={state.heading}
          onChange={(v) => onChange({ heading: v })}
          fieldKey="jointeam.heading"
          placeholder="Join Our Team"
        />
      </div>
      <div>
        <label className={LABEL}>Description</label>
        <AITextarea
          value={state.description}
          onChange={(v) => onChange({ description: v })}
          fieldKey="jointeam.description"
          rows={3}
        />
      </div>
      <div>
        <label className={LABEL}>Button label</label>
        <AITextField
          value={state.ctaLabel}
          onChange={(v) => onChange({ ctaLabel: v })}
          fieldKey="jointeam.ctaLabel"
          placeholder="View Careers"
        />
      </div>
    </div>
  );
}

function FAQEditorInline({
  state, onChange,
}: { state: FAQEditorState; onChange: (u: Partial<FAQEditorState>) => void }) {
  return (
    <div className="flex flex-col gap-4 px-4 pb-4 pt-1">
      <div>
        <label className={LABEL}>Section heading</label>
        <AITextField
          value={state.sectionTitle}
          onChange={(v) => onChange({ sectionTitle: v })}
          fieldKey="faq.title"
          placeholder="Your Questions, Answered"
        />
      </div>
      <div>
        <label className={LABEL}>Subtitle</label>
        <AITextarea
          value={state.subtitle}
          onChange={(v) => onChange({ subtitle: v })}
          fieldKey="faq.subtitle"
          rows={2}
        />
      </div>
      <InfoBox Icon={HelpCircle} title="FAQ items from Hospital Details"
        body="Individual questions and answers are managed in Hospital Details." />
    </div>
  );
}

function NewsletterEditorInline({
  state, onChange,
}: { state: NewsletterEditorState; onChange: (u: Partial<NewsletterEditorState>) => void }) {
  return (
    <div className="flex flex-col gap-4 px-4 pb-4 pt-1">
      <div>
        <label className={LABEL}>Prompt text</label>
        <AITextField
          value={state.promptText}
          onChange={(v) => onChange({ promptText: v })}
          fieldKey="newsletter.promptText"
          placeholder="Subscribe Now To Receive Updates From"
        />
      </div>
      <div>
        <label className={LABEL}>Button label</label>
        <AITextField
          value={state.ctaLabel}
          onChange={(v) => onChange({ ctaLabel: v })}
          fieldKey="newsletter.ctaLabel"
          placeholder="Subscribe Now"
        />
      </div>
    </div>
  );
}

function FooterEditorInline() {
  return (
    <div className="px-4 pb-4 pt-1">
      <InfoBox Icon={Layout} title="Footer content from Hospital Details"
        body="Links, social profiles, business hours, and contact info are pulled from Hospital Details." />
    </div>
  );
}

// ─── Section config ────────────────────────────────────────────────────────────

const SECTIONS: {
  id: SectionId;
  label: string;
  Icon: React.ElementType;
  desc: string;
}[] = [
  { id: "hero",         label: "Hero",          Icon: Sparkles,      desc: "Main headline and CTA"      },
  { id: "quicklinks",   label: "Quick Links",   Icon: Link2,         desc: "Fast navigation shortcuts"  },
  { id: "services",     label: "Services",      Icon: LayoutGrid,    desc: "Service cards and layout"   },
  { id: "locations",    label: "Locations",     Icon: MapPin,        desc: "Map and booking widget"     },
  { id: "awards",       label: "Awards",        Icon: Trophy,        desc: "AAHA and certifications"    },
  { id: "teams",        label: "Our Team",      Icon: Users,         desc: "Veterinarians and staff"    },
  { id: "testimonials", label: "Testimonials",  Icon: MessageSquare, desc: "Client reviews and ratings" },
  { id: "jointeam",     label: "Join Our Team", Icon: Briefcase,     desc: "Careers section"            },
  { id: "faq",          label: "FAQ",           Icon: HelpCircle,    desc: "Frequently asked questions" },
  { id: "newsletter",   label: "Newsletter",    Icon: Mail,          desc: "Email subscription"         },
  { id: "footer",       label: "Footer",        Icon: Layout,        desc: "Footer links and info"      },
];

const SECTION_MAP = Object.fromEntries(SECTIONS.map(s => [s.id, s]));

// ─── Data preview helper (shows real state values in collapsed desc) ────────────

interface DataPreviewProps {
  id: string;
  heroState: HeroEditorState;
  servicesState: ServicesEditorState;
  teamsState: TeamsEditorState;
  locationsState: LocationsEditorState;
  testimonialsState: TestimonialsEditorState;
  joinTeamState: JoinTeamEditorState;
  faqState: FAQEditorState;
  newsletterState: NewsletterEditorState;
}

function getDataPreview(props: DataPreviewProps): string {
  const {
    id, heroState, servicesState, teamsState,
    locationsState, testimonialsState, joinTeamState,
    faqState, newsletterState,
  } = props;

  switch (id) {
    case "hero":
      return heroState.headline
        ? heroState.headline.length > 36 ? heroState.headline.slice(0, 34) + "…" : heroState.headline
        : "Set headline…";
    case "services":
      return servicesState.sectionTitle || "Specialty Services";
    case "locations":
      return `Next: ${locationsState.nextAvailable || "Today, 3:00 PM"}`;
    case "teams":
      return teamsState.sectionTitle || "Meet Our Specialists";
    case "testimonials":
      return `${testimonialsState.rating || "4.7"} ★ · ${testimonialsState.totalReviews || "100"} reviews`;
    case "jointeam":
      return joinTeamState.heading || "Join Our Team";
    case "faq":
      return faqState.sectionTitle || "Your Questions, Answered";
    case "newsletter":
      return newsletterState.ctaLabel || "Subscribe Now";
    default:
      return SECTION_MAP[id]?.desc ?? "";
  }
}

// ─── DropIndicator ─────────────────────────────────────────────────────────────

function DropIndicator() {
  return (
    <div className="relative h-0.5 mx-3 z-10 pointer-events-none">
      <div
        className="absolute inset-0 rounded-full"
        style={{ background: "linear-gradient(90deg, transparent, #4f46e5 20%, #4f46e5 80%, transparent)" }}
      />
      <div
        className="absolute left-0 -top-1 w-2 h-2 rounded-full border-2 border-indigo-500 bg-white"
        style={{ boxShadow: "0 0 0 2px rgba(79,70,229,0.2)" }}
      />
    </div>
  );
}

// ─── AccordionSection ──────────────────────────────────────────────────────────

interface AccordionSectionProps {
  id: string;
  label: string;
  dataPreview: string | null;
  Icon: React.ElementType;
  isOpen: boolean;
  isVisible: boolean;
  onToggle: () => void;
  onToggleVisible: () => void;
  isDragging: boolean;
  isDragOver: boolean;
  dragOverPos: "before" | "after";
  onDragStart: () => void;
  onDragOver: (e: React.DragEvent) => void;
  onDragLeave: () => void;
  onDrop: (e: React.DragEvent) => void;
  onDragEnd: () => void;
  children: React.ReactNode;
  /** Optional action button rendered next to the eye toggle (e.g. delete for dynamic sections) */
  extraAction?: React.ReactNode;
}

function AccordionSection({
  id, label, dataPreview, Icon,
  isOpen, isVisible, onToggle, onToggleVisible,
  isDragging, isDragOver, dragOverPos,
  onDragStart, onDragOver, onDragLeave, onDrop, onDragEnd,
  children, extraAction,
}: AccordionSectionProps) {
  return (
    <>
      {/* Drop indicator ABOVE */}
      {isDragOver && dragOverPos === "before" && <DropIndicator />}

      <div
        draggable
        onDragStart={onDragStart}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        onDragEnd={onDragEnd}
        className={[
          "relative border-b border-gray-100 last:border-b-0 transition-all duration-150",
          !isVisible ? "opacity-40" : "",
          isDragging ? "opacity-30 scale-[0.98]" : "",
          isOpen ? "" : "hover:bg-gray-50/60",
        ].join(" ")}
        style={isOpen ? { background: OPEN_COLORS.bg } : undefined}
      >
        {/* Left accent bar — gray when open */}
        {isOpen && (
          <div
            className="absolute left-0 w-0.5 rounded-r-full"
            style={{
              backgroundColor: OPEN_COLORS.accent,
              top: "0",
              bottom: "0",
              height: "100%",
            }}
          />
        )}

        {/* Header row */}
        <div
          className="relative flex items-center gap-2 px-3 py-2.5 cursor-pointer select-none"
          onClick={onToggle}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === "Enter" && onToggle()}
          aria-expanded={isOpen}
        >
          {/* Drag handle */}
          <div
            className="shrink-0 cursor-grab active:cursor-grabbing p-0.5 -ml-0.5 rounded hover:bg-gray-100 transition-colors"
            onMouseDown={(e) => e.stopPropagation()}
            aria-hidden="true"
            title="Drag to reorder"
          >
            <GripVertical className="w-3.5 h-3.5 text-gray-300 hover:text-gray-400" />
          </div>

          {/* Icon — gray-100 bg, gray-600 icon when open; gray-100 bg, gray-400 when closed */}
          <span
            className="w-6 h-6 rounded-md flex items-center justify-center shrink-0 transition-colors"
            style={{
              backgroundColor: OPEN_COLORS.iconBg,
              color: isOpen ? OPEN_COLORS.accent : "#9ca3af",
              boxShadow: isOpen ? `0 0 0 1px #d1d5db` : undefined,
            }}
          >
            <Icon className="w-3.5 h-3.5" aria-hidden="true" />
          </span>

          {/* Text */}
          <div className="flex-1 min-w-0">
            <p className={`text-xs font-semibold leading-tight ${isOpen ? "text-gray-900" : "text-gray-700"}`}>
              {label}
            </p>
            {!isOpen && (
              <p className="text-[10px] text-gray-400 leading-tight mt-0.5 truncate">
                {dataPreview}
              </p>
            )}
          </div>

          {/* Extra action (e.g. delete dynamic section) */}
          {extraAction && (
            <div onClick={(e) => e.stopPropagation()} className="shrink-0">
              {extraAction}
            </div>
          )}

          {/* Visibility toggle */}
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onToggleVisible(); }}
            aria-label={isVisible ? `Hide ${label}` : `Show ${label}`}
            className="p-1 rounded-md text-gray-300 hover:text-gray-500 hover:bg-gray-100 transition-colors focus:outline-none focus-visible:ring-1 focus-visible:ring-[#003459]"
          >
            {isVisible ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
          </button>

          {/* Chevron */}
          <ChevronDown
            className={`w-3.5 h-3.5 text-gray-400 shrink-0 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
            aria-hidden="true"
          />
        </div>

        {/* Animated body */}
        <div style={{
          display: "grid",
          gridTemplateRows: isOpen ? "1fr" : "0fr",
          transition: "grid-template-rows 0.22s cubic-bezier(0.4,0,0.2,1)",
        }}>
          <div className="overflow-hidden">{children}</div>
        </div>
      </div>

      {/* Drop indicator BELOW */}
      {isDragOver && dragOverPos === "after" && <DropIndicator />}
    </>
  );
}

// ─── SEO helpers ──────────────────────────────────────────────────────────────

function CharProgress({ value, max }: { value: number; max: number }) {
  const pct  = Math.min((value / max) * 100, 100);
  const over = value > max;
  const near = value > max * 0.85;
  const color = over ? "#ef4444" : near ? "#f59e0b" : value > 0 ? "#10b981" : "#e5e7eb";
  return (
    <div className="w-full h-1 bg-gray-100 rounded-full mt-1.5 overflow-hidden" aria-hidden="true">
      <div className="h-full rounded-full transition-all duration-300" style={{ width: `${pct}%`, backgroundColor: color }} />
    </div>
  );
}

// ─── Circular SEO score gauge ─────────────────────────────────────────────────

function ScoreRing({ score, color }: { score: number; color: string }) {
  const r  = 26;
  const cx = 32;
  const cy = 32;
  const circumference = 2 * Math.PI * r;
  const dash = (score / 100) * circumference;
  return (
    <svg width={64} height={64} viewBox="0 0 64 64" className="shrink-0" aria-hidden="true">
      {/* Track */}
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="#f3f4f6" strokeWidth={6} />
      {/* Fill */}
      <circle
        cx={cx} cy={cy} r={r} fill="none"
        stroke={color} strokeWidth={6}
        strokeLinecap="round"
        strokeDasharray={`${dash} ${circumference - dash}`}
        strokeDashoffset={circumference / 4}
        style={{ transition: "stroke-dasharray 0.6s cubic-bezier(0.4,0,0.2,1)" }}
      />
      {/* Score label */}
      <text x={cx} y={cy + 1} textAnchor="middle" dominantBaseline="middle"
        fontSize={13} fontWeight={700} fill={color} fontFamily="Inter,system-ui,sans-serif">
        {score}
      </text>
    </svg>
  );
}

// ─── SEO tab ──────────────────────────────────────────────────────────────────

interface SEOTabProps {
  state:           SEOState;
  onChange:        (u: Partial<SEOState>) => void;
  clinicName:      string;
  clinic:          ClinicWebsite;
  heroState:       HeroEditorState;
  servicesState:   ServicesEditorState;
}

function SEOTab({ state, onChange, clinicName, clinic, heroState, servicesState }: SEOTabProps) {
  const [previewMode, setPreviewMode]     = useState<"google" | "social">("google");
  const [generating,  setGenerating]      = useState(false);
  const [generated,   setGenerated]       = useState(false);
  const [keywords,    setKeywords]        = useState<KeywordHit[]>([]);
  const [showChecks,  setShowChecks]      = useState(false);

  const displayTitle = state.metaTitle      || `${clinicName} — Specialty & Emergency Vet Care`;
  const displayDesc  = state.metaDescription || "Board-certified specialists in internal medicine, surgery, and critical care.";
  const displayUrl   = (state.canonicalUrl || "yourclinic.vet").replace(/https?:\/\//, "").replace(/\/$/, "");

  // Build detailed checks (10 checks)
  const checks = computeDetailedSEOChecks(
    state.metaTitle,
    state.metaDescription,
    state.ogImageUrl,
    state.canonicalUrl,
    state.focusKeyword,
    state.robots,
    {
      clinicName: clinic.general.name,
      clinicSlug: clinic.general.slug,
      city: clinic.contact.address?.city ?? "",
    },
  );
  const passedCount = checks.filter(c => c.ok).length;
  const score       = Math.round((passedCount / checks.length) * 100);
  const scoreColor  = score === 100 ? "#10b981" : score >= 70 ? "#10b981" : score >= 40 ? "#f59e0b" : "#ef4444";
  const scoreLabel  = score === 100 ? "Perfect" : score >= 70 ? "Good" : score >= 40 ? "Needs work" : "Incomplete";

  const titleLen = state.metaTitle.length;
  const descLen  = state.metaDescription.length;

  // ── AI Generate handler ──────────────────────────────────────────────────────
  const handleGenerate = useCallback(async () => {
    setGenerating(true);
    setGenerated(false);
    try {
      const input = buildSEOContentInput(
        clinic,
        heroState,
        servicesState,
        state.ogImageUrl,
        state.canonicalUrl,
      );
      const result = await generateSEO(input);
      onChange({
        metaTitle:       result.metaTitle,
        metaDescription: result.metaDescription,
        ogImageUrl:      result.ogImageUrl,
        canonicalUrl:    result.canonicalUrl,
        focusKeyword:    result.focusKeyword,
      });
      setKeywords(result.detectedKeywords);
      setGenerated(true);
      // Auto-reset checkmark after 3 s
      setTimeout(() => setGenerated(false), 3000);
    } finally {
      setGenerating(false);
    }
  }, [clinic, heroState, servicesState, state.ogImageUrl, state.canonicalUrl, onChange]);

  return (
    <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-4">

      {/* ── AI Generate CTA ── */}
      <button
        type="button"
        onClick={handleGenerate}
        disabled={generating}
        className={[
          "w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-sm font-semibold",
          "transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
          "focus-visible:ring-[#003459] shadow-sm",
          generating
            ? "bg-gray-100 text-gray-400 cursor-not-allowed"
            : generated
            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
            : "bg-[#003459] text-white hover:bg-[#00253f] active:scale-[0.98]",
        ].join(" ")}
        aria-label="Generate SEO fields with AI"
      >
        {generating ? (
          <>
            <RefreshCw className="w-4 h-4 animate-spin" aria-hidden="true" />
            Analysing your content…
          </>
        ) : generated ? (
          <>
            <CheckCircle2 className="w-4 h-4" aria-hidden="true" />
            SEO Generated — 100% Score
          </>
        ) : (
          <>
            <Zap className="w-4 h-4" aria-hidden="true" />
            Generate SEO with AI
          </>
        )}
      </button>

      {/* ── SEO Score card ── */}
      <div className="p-3.5 rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="flex items-center gap-3 mb-3">
          <ScoreRing score={score} color={scoreColor} />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 mb-0.5">
              <p className="text-xs font-semibold text-gray-800">SEO Score</p>
              <span
                className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full"
                style={{ background: scoreColor + "20", color: scoreColor }}
              >
                {scoreLabel}
              </span>
            </div>
            <p className="text-[10px] text-gray-400">
              {passedCount}/{checks.length} checks passed
            </p>
            {/* Score bar */}
            <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden mt-2">
              <div
                className="h-full rounded-full transition-all duration-700"
                style={{ width: `${score}%`, backgroundColor: scoreColor }}
              />
            </div>
          </div>
        </div>

        {/* Check list (collapsible) */}
        <button
          type="button"
          onClick={() => setShowChecks((v) => !v)}
          className="flex items-center gap-1.5 text-[10px] font-medium text-gray-500 hover:text-gray-800 transition-colors focus:outline-none w-full"
        >
          <ChevronDown
            className="w-3 h-3 transition-transform duration-200"
            style={{ transform: showChecks ? "rotate(180deg)" : "rotate(0deg)" }}
            aria-hidden="true"
          />
          {showChecks ? "Hide" : "Show"} all {checks.length} checks
        </button>

        {showChecks && (
          <div className="mt-2.5 flex flex-col gap-1.5">
            {checks.map(({ id, label, ok, fix }) => (
              <div key={id} className="flex items-start gap-2">
                <span className="shrink-0 mt-0.5">
                  {ok
                    ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" aria-hidden="true" />
                    : <XCircle      className="w-3.5 h-3.5 text-red-400"     aria-hidden="true" />
                  }
                </span>
                <div className="min-w-0">
                  <p className={`text-[10px] font-medium leading-snug ${ok ? "text-gray-700" : "text-gray-500"}`}>{label}</p>
                  {!ok && fix && (
                    <p className="text-[9px] text-amber-600 leading-snug mt-0.5">{fix}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Preview ── */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <p className={LABEL}>Preview</p>
          <div className="flex items-center gap-0.5 p-0.5 rounded-lg bg-gray-100">
            {(["google", "social"] as const).map((m) => (
              <button
                key={m} type="button"
                onClick={() => setPreviewMode(m)}
                className={[
                  "px-2.5 py-1 rounded-md text-[10px] font-medium transition-all focus:outline-none",
                  previewMode === m ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700",
                ].join(" ")}
              >
                {m === "google" ? "🔍 Google" : "📱 Social"}
              </button>
            ))}
          </div>
        </div>

        {previewMode === "google" && (
          <div className="p-3.5 bg-white rounded-xl border border-gray-200 shadow-sm">
            <div className="flex items-center gap-1.5 mb-1.5">
              <div className="w-4 h-4 rounded-sm bg-[#4285f4] flex items-center justify-center shrink-0">
                <span className="text-[7px] text-white font-bold">G</span>
              </div>
              <span className="text-[11px] text-gray-500 truncate">{displayUrl} › home</span>
            </div>
            <p className="text-sm leading-snug mb-0.5 truncate" style={{ color: "#1a0dab" }}>
              {displayTitle.length > 60 ? `${displayTitle.slice(0, 57)}…` : displayTitle}
            </p>
            <p className="text-[11px] text-gray-600 leading-snug" style={{
              display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" as const, overflow: "hidden",
            }}>
              {displayDesc}
            </p>
          </div>
        )}

        {previewMode === "social" && (
          <div className="rounded-xl overflow-hidden border border-gray-200 shadow-sm bg-white">
            <div className="h-28 bg-gray-100 flex items-center justify-center">
              {state.ogImageUrl
                ? <img src={state.ogImageUrl} alt="OG preview" className="w-full h-full object-cover" onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
                : (
                  <div className="flex flex-col items-center gap-1.5 text-gray-300">
                    <ImageIcon className="w-7 h-7" aria-hidden="true" />
                    <span className="text-[10px]">No OG image set — click Generate to auto-fill</span>
                  </div>
                )
              }
            </div>
            <div className="p-3 border-t border-gray-200">
              <p className="text-[10px] uppercase tracking-wide text-gray-400 mb-0.5">{displayUrl}</p>
              <p className="text-xs font-semibold text-gray-900 leading-snug line-clamp-1">{displayTitle}</p>
              <p className="text-[11px] text-gray-500 leading-snug line-clamp-2 mt-0.5">{displayDesc}</p>
            </div>
          </div>
        )}
      </div>

      {/* ── Focus keyword ── */}
      <div>
        <div className="flex items-center gap-1.5 mb-1">
          <label className={LABEL} style={{ marginBottom: 0 }}>Focus Keyword</label>
          <span className="text-[9px] text-gray-400 bg-gray-100 rounded px-1 py-0.5">Primary SEO target</span>
        </div>
        <input
          type="text"
          value={state.focusKeyword}
          onChange={(e) => onChange({ focusKeyword: e.target.value })}
          className={INPUT}
          placeholder="e.g. emergency vet Austin"
        />
        <p className="text-[10px] text-gray-400 mt-1.5">
          The phrase you most want to rank for — should appear in title &amp; description.
        </p>
      </div>

      {/* ── Meta title ── */}
      <div>
        <div className="flex items-baseline justify-between mb-1">
          <label className={LABEL}>Meta Title</label>
          <span className={`text-[10px] font-medium tabular-nums ${titleLen > 60 ? "text-red-500" : titleLen > 50 ? "text-amber-500" : titleLen > 0 ? "text-emerald-600" : "text-gray-400"}`}>
            {titleLen}/60
          </span>
        </div>
        <input
          type="text"
          value={state.metaTitle}
          onChange={(e) => onChange({ metaTitle: e.target.value })}
          className={INPUT}
          placeholder={`${clinicName} — Advanced Specialty & Emergency Care`}
        />
        <CharProgress value={titleLen} max={60} />
        {titleLen === 0 && <p className="text-[10px] text-gray-400 mt-1.5">💡 Include clinic name + primary service + city</p>}
        {titleLen > 60 && <p className="text-[10px] text-red-500 mt-1.5">⚠ Too long — Google truncates at ~60 chars</p>}
        {titleLen > 0 && titleLen <= 60 && <p className="text-[10px] text-emerald-600 mt-1.5">✓ Perfect length</p>}
      </div>

      {/* ── Meta description ── */}
      <div>
        <div className="flex items-baseline justify-between mb-1">
          <label className={LABEL}>Meta Description</label>
          <span className={`text-[10px] font-medium tabular-nums ${descLen > 160 ? "text-red-500" : descLen > 140 ? "text-amber-500" : descLen > 0 ? "text-emerald-600" : "text-gray-400"}`}>
            {descLen}/160
          </span>
        </div>
        <textarea
          rows={3}
          value={state.metaDescription}
          onChange={(e) => onChange({ metaDescription: e.target.value })}
          className={`${INPUT} h-auto py-2 resize-none`}
          placeholder="Board-certified specialists in internal medicine, surgery, and critical care for the Austin area."
        />
        <CharProgress value={descLen} max={160} />
        {descLen === 0 && <p className="text-[10px] text-gray-400 mt-1.5">💡 Include services, location, and a call to action</p>}
        {descLen > 160 && <p className="text-[10px] text-red-500 mt-1.5">⚠ Too long — keep under 160 chars</p>}
        {descLen > 0 && descLen <= 160 && <p className="text-[10px] text-emerald-600 mt-1.5">✓ Perfect length</p>}
      </div>

      {/* ── OG image ── */}
      <div>
        <div className="flex items-baseline justify-between mb-1">
          <label className={LABEL}>OG / Social Image URL</label>
          {state.ogImageUrl && (
            <button type="button" onClick={() => setPreviewMode("social")}
              className="text-[10px] text-[#003459] hover:underline focus:outline-none">
              Preview →
            </button>
          )}
        </div>
        <input
          type="url"
          value={state.ogImageUrl}
          onChange={(e) => onChange({ ogImageUrl: e.target.value })}
          className={`${INPUT} font-mono text-xs`}
          placeholder="https://yourdomain.com/og-image.jpg"
        />
        <p className="text-[10px] text-gray-400 mt-1.5">Recommended: 1200×630px · used by Facebook, X (Twitter), LinkedIn</p>
      </div>

      {/* ── Canonical URL ── */}
      <div>
        <label className={LABEL}>Canonical URL</label>
        <input
          type="url"
          value={state.canonicalUrl}
          onChange={(e) => onChange({ canonicalUrl: e.target.value })}
          className={`${INPUT} font-mono text-xs`}
          placeholder="https://yourclinic.vet/"
        />
        <p className="text-[10px] text-gray-400 mt-1.5">Prevents duplicate-content penalties — set to your live domain.</p>
      </div>

      {/* ── Robots ── */}
      <div>
        <label className={LABEL}>Robots directive</label>
        <select value={state.robots} onChange={(e) => onChange({ robots: e.target.value })} className={INPUT}>
          <option value="index,follow">index, follow — visible to all search engines ✓</option>
          <option value="noindex,follow">noindex, follow — hide from search results</option>
          <option value="index,nofollow">index, nofollow — don't follow links</option>
          <option value="noindex,nofollow">noindex, nofollow — completely hidden</option>
        </select>
      </div>

      {/* ── Keyword analysis ── */}
      {keywords.length > 0 && (
        <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
          <div className="flex items-center gap-2 px-3.5 py-2.5 border-b border-gray-100 bg-gray-50 rounded-t-xl">
            <Tag className="w-3.5 h-3.5 text-gray-400" aria-hidden="true" />
            <p className="text-xs font-semibold text-gray-700">Detected Keywords</p>
            <span className="ml-auto text-[10px] text-gray-400">{keywords.length} terms</span>
          </div>
          <div className="p-3 flex flex-wrap gap-1.5">
            {keywords.map(({ keyword, score: kwScore, sources }) => (
              <span
                key={keyword}
                title={`Sources: ${sources.join(", ")}`}
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium cursor-default"
                style={{
                  background: kwScore === 3 ? "#dbeafe" : kwScore === 2 ? "#f0fdf4" : "#f9fafb",
                  color:      kwScore === 3 ? "#1e40af" : kwScore === 2 ? "#166534" : "#6b7280",
                  border:     `1px solid ${kwScore === 3 ? "#bfdbfe" : kwScore === 2 ? "#bbf7d0" : "#e5e7eb"}`,
                }}
              >
                {kwScore === 3 && "★ "}
                {keyword}
              </span>
            ))}
          </div>
          <p className="text-[9px] text-gray-400 px-3.5 pb-2.5">★ High priority · hover for source section</p>
        </div>
      )}

      {/* ── Structured data ── */}
      <div className="p-3.5 bg-blue-50 border border-blue-100 rounded-xl">
        <p className="text-xs font-semibold text-[#003459] mb-1">Structured Data — Auto-generated</p>
        <p className="text-[10px] text-gray-500 leading-relaxed">
          <strong className="font-semibold">LocalBusiness</strong>, <strong className="font-semibold">VetOrVeterinaryCare</strong>, and <strong className="font-semibold">OpeningHoursSpecification</strong> JSON-LD schemas are auto-generated from your Hospital Details and injected into the page <code>&lt;head&gt;</code> at publish time.
        </p>
      </div>

    </div>
  );
}

// ─── Category separator ────────────────────────────────────────────────────────

function CategorySeparator({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 border-b border-gray-100">
      <span className="text-[9px] font-bold tracking-widest text-gray-400 uppercase select-none">
        {label}
      </span>
      <div className="flex-1 h-px bg-gray-200" />
    </div>
  );
}

// ─── RightPanelProps ──────────────────────────────────────────────────────────

interface RightPanelProps {
  activeSection: OpenBlock;
  onSectionChange: (id: OpenBlock) => void;
  heroState: HeroEditorState;         onHeroChange: (u: Partial<HeroEditorState>) => void;
  servicesState: ServicesEditorState; onServicesChange: (u: Partial<ServicesEditorState>) => void;
  teamsState: TeamsEditorState;       onTeamsChange: (u: Partial<TeamsEditorState>) => void;
  locationsState: LocationsEditorState;     onLocationsChange: (u: Partial<LocationsEditorState>) => void;
  testimonialsState: TestimonialsEditorState; onTestimonialsChange: (u: Partial<TestimonialsEditorState>) => void;
  joinTeamState: JoinTeamEditorState;   onJoinTeamChange: (u: Partial<JoinTeamEditorState>) => void;
  faqState: FAQEditorState;             onFaqChange: (u: Partial<FAQEditorState>) => void;
  newsletterState: NewsletterEditorState; onNewsletterChange: (u: Partial<NewsletterEditorState>) => void;
  seoState: SEOState;                   onSeoChange: (u: Partial<SEOState>) => void;
  clinic: ClinicWebsite;
  onNavigateToSetup: () => void;
  primaryColor: string;
  // Lifted DnD state — drives live preview ordering
  sectionOrder: string[];
  onSectionOrderChange: (order: string[]) => void;
  sectionVisibility: Record<string, boolean>;
  onSectionVisibilityChange: (vis: Record<string, boolean>) => void;
  // Dynamic sections added via Section Templates
  dynamicSections: DynamicSectionRegistry;
  onUpdateDynamic: (instanceId: string, ds: DynamicSectionState) => void;
  onRemoveDynamic: (instanceId: string) => void;
  // Generative Site Builder
  onOpenSmartModes?: () => void;
}

// ─── RightPanel ───────────────────────────────────────────────────────────────

export function RightPanel({
  activeSection, onSectionChange,
  heroState, onHeroChange,
  servicesState, onServicesChange,
  teamsState, onTeamsChange,
  locationsState, onLocationsChange,
  testimonialsState, onTestimonialsChange,
  joinTeamState, onJoinTeamChange,
  faqState, onFaqChange,
  newsletterState, onNewsletterChange,
  seoState, onSeoChange,
  clinic, onNavigateToSetup,
  primaryColor,
  sectionOrder, onSectionOrderChange,
  sectionVisibility, onSectionVisibilityChange,
  dynamicSections, onUpdateDynamic, onRemoveDynamic,
  onOpenSmartModes,
}: RightPanelProps) {
  const [tab, setTab] = useState<"editor" | "seo">("editor");

  // ── Local DnD drag state (ephemeral — not needed outside this panel) ─────────
  const [dragSrc, setDragSrc]       = useState<string | null>(null);
  const [dragOverId, setDragOverId] = useState<string | null>(null);
  const [dragOverPos, setDragOverPos] = useState<"before" | "after">("before");

  const allSectionIds = [...sectionOrder];
  const visibleCount = allSectionIds.filter(id => sectionVisibility[id] !== false).length;

  function toggleVisible(id: string) {
    onSectionVisibilityChange({ ...sectionVisibility, [id]: !sectionVisibility[id] });
  }

  function toggleSection(id: string) {
    onSectionChange(activeSection === id ? null : id);
  }

  function toggleAllVisible() {
    const allOn = allSectionIds.every((id) => sectionVisibility[id] !== false);
    onSectionVisibilityChange(Object.fromEntries(allSectionIds.map((id) => [id, !allOn])));
  }

  // ── DnD handlers ────────────────────────────────────────────────────────────

  function handleDragStart(id: string) {
    setDragSrc(id);
  }

  function handleDragOver(e: React.DragEvent, id: string) {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    if (id === dragSrc) return;
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const midY = rect.top + rect.height / 2;
    setDragOverPos(e.clientY < midY ? "before" : "after");
    setDragOverId(id);
  }

  function handleDragLeave() {
    setDragOverId(null);
  }

  function handleDrop(e: React.DragEvent, targetId: string) {
    e.preventDefault();
    if (!dragSrc || dragSrc === targetId) {
      setDragSrc(null);
      setDragOverId(null);
      return;
    }
    const newOrder = sectionOrder.filter(id => id !== dragSrc);
    const targetIdx = newOrder.indexOf(targetId);
    const insertAt = dragOverPos === "after" ? targetIdx + 1 : targetIdx;
    newOrder.splice(insertAt, 0, dragSrc);
    onSectionOrderChange(newOrder);
    setDragSrc(null);
    setDragOverId(null);
  }

  function handleDragEnd() {
    setDragSrc(null);
    setDragOverId(null);
  }

  // ── Build ordered list — core + dynamic sections ──────────────────────────

  type CoreItem   = { kind: "core";    id: SectionId;  section: typeof SECTIONS[0] };
  type DynItem    = { kind: "dynamic"; id: string;     ds: DynamicSectionState };
  type ListItem   = { kind: "section"; item: CoreItem | DynItem } | { kind: "divider"; label: string };

  const orderedItems: Array<CoreItem | DynItem> = sectionOrder
    .map((id): CoreItem | DynItem | null => {
      if (SECTION_MAP[id as SectionId]) {
        return { kind: "core", id: id as SectionId, section: SECTION_MAP[id as SectionId] };
      }
      const ds = dynamicSections[id];
      return ds ? { kind: "dynamic", id, ds } : null;
    })
    .filter((x): x is CoreItem | DynItem => x !== null);

  // Inject category dividers (core sections only get category headers)
  const listItems: ListItem[] = [];
  let lastCat = "";
  for (const item of orderedItems) {
    if (item.kind === "core") {
      const cat = SECTION_CATEGORY[item.id] ?? "OTHER";
      if (cat !== lastCat) {
        listItems.push({ kind: "divider", label: cat });
        lastCat = cat;
      }
    } else if (lastCat !== "ADDED") {
      listItems.push({ kind: "divider", label: "ADDED SECTIONS" });
      lastCat = "ADDED";
    }
    listItems.push({ kind: "section", item });
  }

  const dataPreviewProps: DataPreviewProps = {
    id: "hero", // will be overridden per section
    heroState, servicesState, teamsState,
    locationsState, testimonialsState, joinTeamState,
    faqState, newsletterState,
  };

  const TABS: { id: "editor" | "seo"; Icon: React.ElementType; label: string }[] = [
    { id: "editor", Icon: Pencil, label: "Content" },
    { id: "seo",    Icon: Globe,  label: "SEO"     },
  ];

  return (
    <aside
      className="w-[300px] shrink-0 bg-white border-l border-gray-200 flex flex-col overflow-hidden"
      aria-label="Content editor panel"
    >
      {/* ── 2-tab bar ── */}
      <div className="flex items-stretch border-b border-gray-200 h-11 shrink-0 bg-gray-50/50">
        {TABS.map(({ id, Icon, label }) => (
          <button
            key={id} type="button" onClick={() => setTab(id)}
            className={[
              "flex-1 flex items-center justify-center gap-1.5 text-xs font-medium border-b-2 transition-colors",
              "focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#003459]",
              tab === id ? "border-[#003459] text-[#003459] bg-white" : "border-transparent text-gray-500 hover:text-gray-700",
            ].join(" ")}
          >
            <Icon className="w-3.5 h-3.5" aria-hidden="true" />
            {label}
          </button>
        ))}
      </div>

      {/* ── SEO tab ── */}
      {tab === "seo" && (
        <SEOTab
          state={seoState}
          onChange={onSeoChange}
          clinicName={clinic.general.name}
          clinic={clinic}
          heroState={heroState}
          servicesState={servicesState}
        />
      )}

      {/* ── Content Editor tab ── */}
      {tab === "editor" && (
        <div className="flex-1 flex flex-col overflow-hidden">

          {/* Sticky status bar */}
          <div className="shrink-0 flex items-center justify-between px-3 py-2 border-b border-gray-100 bg-gray-50/80">
            <div className="flex items-center gap-1.5">
              <Settings2 className="w-3 h-3 text-gray-400" aria-hidden="true" />
              <span className="text-[10px] text-gray-500">
                <span className="font-semibold text-gray-700">{allSectionIds.length}</span> sections ·{" "}
                <span className="font-semibold" style={{ color: visibleCount < SECTIONS.length ? "#f59e0b" : "#10b981" }}>
                  {visibleCount}
                </span>{" "}
                visible
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[9px] text-gray-400 hidden sm:block">Drag to reorder</span>
              <button
                type="button" onClick={toggleAllVisible}
                className="text-[10px] font-medium text-[#003459] hover:underline focus:outline-none"
              >
                {SECTIONS.every((s) => sectionVisibility[s.id]) ? "Hide all" : "Show all"}
              </button>
            </div>
          </div>

          {/* Smart Modes trigger — shown when onOpenSmartModes is wired up */}
          {onOpenSmartModes && (
            <div className="shrink-0 px-3 py-1.5 border-b border-gray-100">
              <button
                type="button"
                onClick={onOpenSmartModes}
                className={[
                  "w-full flex items-center justify-between px-3 py-2 rounded-lg",
                  "bg-amber-50 border border-amber-200 text-xs font-semibold text-amber-700",
                  "hover:bg-amber-100 hover:border-amber-300 transition-all",
                  "focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400",
                ].join(" ")}
              >
                <span className="flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5" aria-hidden="true" />
                  Smart Modes
                </span>
                <ChevronDown className="w-3.5 h-3.5 opacity-50" aria-hidden="true" />
              </button>
            </div>
          )}

          {/* Accordion list */}
          <div className="flex-1 overflow-y-auto relative">
            {listItems.map((listItem, idx) => {
              if (listItem.kind === "divider") {
                return <CategorySeparator key={`div-${listItem.label}-${idx}`} label={listItem.label} />;
              }

              const { item } = listItem;

              // ── Dynamic section accordion row ─────────────────────────────
              if (item.kind === "dynamic") {
                const { id, ds } = item;
                const meta = DYNAMIC_SECTION_META[ds.type];

                return (
                  <AccordionSection
                    key={id}
                    id={id}
                    label={meta.label}
                    dataPreview={null}
                    Icon={Layout}
                    isOpen={activeSection === id}
                    isVisible={sectionVisibility[id] ?? true}
                    onToggle={() => toggleSection(id)}
                    onToggleVisible={() => toggleVisible(id)}
                    isDragging={dragSrc === id}
                    isDragOver={dragOverId === id}
                    dragOverPos={dragOverPos}
                    onDragStart={() => handleDragStart(id)}
                    onDragOver={(e) => handleDragOver(e, id)}
                    onDragLeave={handleDragLeave}
                    onDrop={(e) => handleDrop(e, id)}
                    onDragEnd={handleDragEnd}
                    extraAction={
                      <button
                        type="button"
                        title="Remove section"
                        onClick={(e) => { e.stopPropagation(); onRemoveDynamic(id); }}
                        className="p-1 rounded text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors focus:outline-none"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    }
                  >
                    {/* ── Existing sections ── */}
                    {ds.type === "stats"         && <StatsEditor         state={ds.state} onChange={(u) => onUpdateDynamic(id, { type: "stats",         state: { ...ds.state, ...u } })} />}
                    {ds.type === "ctaband"       && <CtaBandEditor       state={ds.state} onChange={(u) => onUpdateDynamic(id, { type: "ctaband",       state: { ...ds.state, ...u } })} />}
                    {ds.type === "gallery"       && <GalleryEditor       state={ds.state} onChange={(u) => onUpdateDynamic(id, { type: "gallery",       state: { ...ds.state, ...u } })} />}
                    {ds.type === "contactinfo"   && <ContactInfoEditor   state={ds.state} onChange={(u) => onUpdateDynamic(id, { type: "contactinfo",   state: { ...ds.state, ...u } })} />}
                    {ds.type === "teamspotlight" && <TeamSpotlightEditor state={ds.state} onChange={(u) => onUpdateDynamic(id, { type: "teamspotlight", state: { ...ds.state, ...u } })} />}
                    {/* ── Typography ── */}
                    {ds.type === "heading"       && <HeadingEditor       state={ds.state} onChange={(u) => onUpdateDynamic(id, { type: "heading",       state: { ...ds.state, ...u } })} />}
                    {ds.type === "paragraph"     && <ParagraphEditor     state={ds.state} onChange={(u) => onUpdateDynamic(id, { type: "paragraph",     state: { ...ds.state, ...u } })} />}
                    {ds.type === "textblock"     && <TextBlockEditor     state={ds.state} onChange={(u) => onUpdateDynamic(id, { type: "textblock",     state: { ...ds.state, ...u } })} />}
                    {ds.type === "blockquote"    && <BlockQuoteEditor    state={ds.state} onChange={(u) => onUpdateDynamic(id, { type: "blockquote",    state: { ...ds.state, ...u } })} />}
                    {ds.type === "richtext"      && <RichTextEditor      state={ds.state} onChange={(u) => onUpdateDynamic(id, { type: "richtext",      state: { ...ds.state, ...u } })} />}
                    {/* ── Layout ── */}
                    {ds.type === "empty"         && <EmptyEditor         state={ds.state} onChange={(u) => onUpdateDynamic(id, { type: "empty",         state: { ...ds.state, ...u } })} />}
                    {ds.type === "twocol"        && <TwoColEditor        state={ds.state} onChange={(u) => onUpdateDynamic(id, { type: "twocol",        state: { ...ds.state, ...u } })} />}
                    {ds.type === "threecol"      && <ThreeColEditor      state={ds.state} onChange={(u) => onUpdateDynamic(id, { type: "threecol",      state: { ...ds.state, ...u } })} />}
                    {/* ── Cards ── */}
                    {ds.type === "cardgrid2"     && <CardGridEditor      state={ds.state} onChange={(u) => onUpdateDynamic(id, { type: "cardgrid2",     state: { ...ds.state, ...u } })} />}
                    {ds.type === "cardgrid3"     && <CardGridEditor      state={ds.state} onChange={(u) => onUpdateDynamic(id, { type: "cardgrid3",     state: { ...ds.state, ...u } })} />}
                    {ds.type === "teamcards"     && <TeamCardsEditor     state={ds.state} onChange={(u) => onUpdateDynamic(id, { type: "teamcards",     state: { ...ds.state, ...u } })} />}
                    {/* ── Hero ── */}
                    {ds.type === "herocentered"  && <HeroCenteredEditor  state={ds.state} onChange={(u) => onUpdateDynamic(id, { type: "herocentered",  state: { ...ds.state, ...u } })} />}
                    {ds.type === "herosplit"     && <HeroSplitEditor     state={ds.state} onChange={(u) => onUpdateDynamic(id, { type: "herosplit",     state: { ...ds.state, ...u } })} />}
                    {/* ── Contact ── */}
                    {ds.type === "contactsplit"  && <ContactSplitEditor  state={ds.state} onChange={(u) => onUpdateDynamic(id, { type: "contactsplit",  state: { ...ds.state, ...u } })} />}
                    {/* ── Marketing ── */}
                    {ds.type === "emailcapture"  && <EmailCaptureEditor  state={ds.state} onChange={(u) => onUpdateDynamic(id, { type: "emailcapture",  state: { ...ds.state, ...u } })} />}
                    {ds.type === "splitcontent"  && <SplitContentEditor  state={ds.state} onChange={(u) => onUpdateDynamic(id, { type: "splitcontent",  state: { ...ds.state, ...u } })} />}
                    {ds.type === "featuregrid"   && <FeatureGridEditor   state={ds.state} onChange={(u) => onUpdateDynamic(id, { type: "featuregrid",   state: { ...ds.state, ...u } })} />}
                  </AccordionSection>
                );
              }

              // ── Core section accordion row ────────────────────────────────
              const { id, section } = item;
              const { label, Icon } = section;

              return (
                <AccordionSection
                  key={id}
                  id={id}
                  label={label}
                  dataPreview={getDataPreview({ ...dataPreviewProps, id })}
                  Icon={Icon}
                  isOpen={activeSection === id}
                  isVisible={sectionVisibility[id] ?? true}
                  onToggle={() => toggleSection(id)}
                  onToggleVisible={() => toggleVisible(id)}
                  isDragging={dragSrc === id}
                  isDragOver={dragOverId === id}
                  dragOverPos={dragOverPos}
                  onDragStart={() => handleDragStart(id)}
                  onDragOver={(e) => handleDragOver(e, id)}
                  onDragLeave={handleDragLeave}
                  onDrop={(e) => handleDrop(e, id)}
                  onDragEnd={handleDragEnd}
                >
                  {id === "hero" && (
                    <HeroEditor state={heroState} onChange={onHeroChange} primaryColor={primaryColor} />
                  )}
                  {id === "quicklinks" && <QuickLinksEditorInline />}
                  {id === "services" && (
                    <ServicesEditor state={servicesState} onChange={onServicesChange} clinic={clinic} />
                  )}
                  {id === "locations" && (
                    <LocationsEditorInline state={locationsState} onChange={onLocationsChange} />
                  )}
                  {id === "awards" && <AwardsEditorInline />}
                  {id === "teams" && (
                    <TeamsEditor state={teamsState} onChange={onTeamsChange} clinic={clinic} onNavigateToSetup={onNavigateToSetup} />
                  )}
                  {id === "testimonials" && (
                    <TestimonialsEditorInline state={testimonialsState} onChange={onTestimonialsChange} />
                  )}
                  {id === "jointeam" && (
                    <JoinTeamEditorInline state={joinTeamState} onChange={onJoinTeamChange} />
                  )}
                  {id === "faq" && (
                    <FAQEditorInline state={faqState} onChange={onFaqChange} />
                  )}
                  {id === "newsletter" && (
                    <NewsletterEditorInline state={newsletterState} onChange={onNewsletterChange} />
                  )}
                  {id === "footer" && <FooterEditorInline />}
                </AccordionSection>
              );
            })}
            <div className="h-4" />
          </div>
        </div>
      )}
    </aside>
  );
}
