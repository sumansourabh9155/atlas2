import { useState, useRef } from "react";
import { Monitor, Tablet, Smartphone, Wifi, Battery, Sparkles } from "lucide-react";
import { HeroLivePreview } from "./HeroLivePreview";
import { TeamsLivePreview } from "./TeamsLivePreview";
import { ClinicHomepageTemplate } from "./ClinicHomepageTemplate";
import { AICopilotBar } from "./AICopilotBar";
import type {
  ViewportMode, HeroEditorState, ServicesEditorState,
  TeamsEditorState, OpenBlock,
  LocationsEditorState, TestimonialsEditorState,
  JoinTeamEditorState, FAQEditorState, NewsletterEditorState,
} from "./WebsiteEditorPage";
import type { ClinicWebsite } from "../../types/clinic";
import type { TonePreset } from "./ai/mockAI";
import type { AddableSectionType, DynamicSectionRegistry } from "./sections";

export type PreviewTheme = "1" | "2";

// ─── Viewport config ──────────────────────────────────────────────────────────

const VIEWPORTS: { mode: ViewportMode; label: string; Icon: React.ElementType }[] = [
  { mode: "desktop", label: "Desktop", Icon: Monitor    },
  { mode: "tablet",  label: "Tablet",  Icon: Tablet     },
  { mode: "mobile",  label: "Mobile",  Icon: Smartphone },
];

// ─── Device frames ────────────────────────────────────────────────────────────

function BrowserChrome({ slug }: { slug: string }) {
  return (
    <div className="h-9 bg-gray-100 border-b border-gray-200 flex items-center gap-3 px-3 shrink-0">
      <div className="flex items-center gap-1.5" aria-hidden="true">
        <div className="w-3 h-3 rounded-full bg-red-400" />
        <div className="w-3 h-3 rounded-full bg-yellow-400" />
        <div className="w-3 h-3 rounded-full bg-green-400" />
      </div>
      <div className="flex-1 flex items-center gap-1.5 bg-white border border-gray-200 rounded-md h-5 px-2">
        <div className="w-2 h-2 rounded-full bg-gray-300 shrink-0" aria-hidden="true" />
        <span className="text-[10px] text-gray-400 truncate font-mono">
          yourclinic.com/{slug}
        </span>
      </div>
    </div>
  );
}

function TabletFrame({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-gray-800 rounded-[28px] px-3 pt-4 pb-5 shadow-2xl ring-1 ring-black/20 w-[768px] shrink-0">
      <div className="flex items-center justify-center mb-2" aria-hidden="true">
        <div className="w-10 h-1 bg-gray-600 rounded-full" />
      </div>
      <div className="overflow-hidden rounded-[16px] bg-white">
        {children}
      </div>
      <div className="flex items-center justify-center mt-3" aria-hidden="true">
        <div className="w-7 h-7 rounded-full border-[1.5px] border-gray-600" />
      </div>
    </div>
  );
}

function PhoneFrame({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-gray-900 rounded-[44px] p-3 shadow-2xl ring-1 ring-black/30 w-[375px] shrink-0">
      <div className="h-9 flex items-center justify-between px-4 mb-0.5">
        <span className="text-white/80 text-[11px] font-semibold">9:41</span>
        <div className="absolute left-1/2 -translate-x-1/2 w-24 h-5 bg-gray-900 rounded-full" aria-hidden="true" />
        <div className="flex items-center gap-1.5" aria-hidden="true">
          <Wifi className="w-3 h-3 text-white/70" />
          <Battery className="w-3.5 h-3.5 text-white/70" />
        </div>
      </div>
      <div className="overflow-hidden rounded-[32px] bg-white">{children}</div>
      <div className="flex justify-center mt-3" aria-hidden="true">
        <div className="w-24 h-1 bg-white/30 rounded-full" />
      </div>
    </div>
  );
}

// ─── GeneratingOverlay ────────────────────────────────────────────────────────

function GeneratingOverlay() {
  return (
    <div
      className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-5"
      style={{ backdropFilter: "blur(6px)", backgroundColor: "rgba(10,10,20,0.65)" }}
      aria-live="polite"
      role="status"
    >
      <div className="relative flex items-center justify-center">
        <span
          className="absolute w-20 h-20 rounded-full animate-ping opacity-20"
          style={{ background: "linear-gradient(135deg, #7c3aed, #3b82f6)" }}
          aria-hidden="true"
        />
        <span
          className="w-14 h-14 rounded-full flex items-center justify-center shadow-2xl"
          style={{ background: "linear-gradient(135deg, #7c3aed, #3b82f6)" }}
          aria-hidden="true"
        >
          <Sparkles className="w-6 h-6 text-white animate-pulse" />
        </span>
      </div>
      <div className="text-center flex flex-col items-center gap-1.5">
        <p className="text-white font-semibold text-sm tracking-wide">AI is generating your page…</p>
        <p className="text-white/40 text-xs">Sit tight, this takes just a moment</p>
      </div>
      <div className="flex items-center gap-2" aria-hidden="true">
        {[0, 1, 2].map(i => (
          <span
            key={i}
            className="w-1.5 h-1.5 rounded-full bg-violet-400"
            style={{ animation: `gpBounce 1.2s ease-in-out ${i * 0.2}s infinite` }}
          />
        ))}
      </div>
      <style>{`
        @keyframes gpBounce {
          0%, 80%, 100% { transform: translateY(0); opacity: 0.4; }
          40% { transform: translateY(-6px); opacity: 1; }
        }
      `}</style>
    </div>
  );
}

// ─── ClickableColorSwatch ─────────────────────────────────────────────────────

function ClickableColorSwatch({
  color, onChange, title,
}: {
  color: string;
  onChange?: (c: string) => void;
  title: string;
}) {
  const ref = useRef<HTMLInputElement>(null);

  return (
    <div className="relative">
      <button
        type="button"
        title={`${title}: ${color}`}
        aria-label={`${title}: ${color}. Click to change.`}
        onClick={() => onChange && ref.current?.click()}
        className={[
          "w-5 h-5 rounded-md transition-transform",
          onChange ? "cursor-pointer hover:scale-110 active:scale-95" : "cursor-default",
        ].join(" ")}
        style={{
          backgroundColor: color,
          boxShadow: "inset 0 0 0 1px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.06)",
        }}
      />
      {onChange && (
        <input
          ref={ref}
          type="color"
          value={color}
          onChange={(e) => onChange(e.target.value)}
          className="sr-only"
          aria-hidden="true"
          tabIndex={-1}
        />
      )}
    </div>
  );
}

// ─── LivePreviewPane ──────────────────────────────────────────────────────────

interface Props {
  viewport: ViewportMode;
  onViewportChange: (v: ViewportMode) => void;
  heroState: HeroEditorState;
  servicesState: ServicesEditorState;
  teamsState: TeamsEditorState;
  locationsState: LocationsEditorState;
  testimonialsState: TestimonialsEditorState;
  joinTeamState: JoinTeamEditorState;
  faqState: FAQEditorState;
  newsletterState: NewsletterEditorState;
  clinic: ClinicWebsite;
  activeBlock: OpenBlock;
  onBlockClick: (id: OpenBlock) => void;
  isGenerating: boolean;
  onGenerate: (prompt: string) => void;
  selectedPage: string;
  theme: PreviewTheme;
  onThemeChange: (t: PreviewTheme) => void;
  primaryColor: string;
  secondaryColor: string;
  onPrimaryColorChange: (c: string) => void;
  onSecondaryColorChange: (c: string) => void;
  sectionOrder: string[];
  sectionVisibility: Record<string, boolean>;
  /** Called when the user clicks an editable text element in the preview */
  onFieldClick?:       (sectionId: OpenBlock, fieldKey: string) => void;
  onOpenWizard?:       () => void;
  onCheckConsistency?: () => void;
  onTonePreset?:       (tone: TonePreset) => void;
  isToneLoading?:      boolean;
  activeTone?:         TonePreset | null;
  // Section Templates props
  dynamicSections?:        DynamicSectionRegistry;
  draggingTemplateType?:   AddableSectionType | null;
  onTemplateDrop?:         (type: AddableSectionType, afterIndex: number) => void;
}

// ─── Editable-field hover CSS (injected once when onFieldClick is wired up) ────

const EDITABLE_FIELD_CSS = `
  [data-ai-field] {
    cursor: pointer;
    border-radius: 3px;
    transition: outline 120ms ease, background-color 120ms ease;
  }
  [data-ai-field]:hover {
    outline: 2px dashed rgba(99,102,241,0.55);
    outline-offset: 4px;
    background-color: rgba(99,102,241,0.04);
  }
`;

export function LivePreviewPane({
  viewport, onViewportChange,
  heroState, servicesState, teamsState,
  locationsState, testimonialsState, joinTeamState, faqState, newsletterState,
  clinic, activeBlock, onBlockClick,
  isGenerating, onGenerate,
  selectedPage,
  theme, onThemeChange,
  primaryColor, secondaryColor,
  onPrimaryColorChange, onSecondaryColorChange,
  sectionOrder, sectionVisibility,
  onFieldClick,
  onOpenWizard, onCheckConsistency, onTonePreset, isToneLoading, activeTone,
  dynamicSections, draggingTemplateType, onTemplateDrop,
}: Props) {
  const isTablet  = viewport === "tablet";
  const isMobile  = viewport === "mobile";
  const isDesktop = viewport === "desktop";
  const slug      = clinic.general.slug;

  const [aiExpanded, setAiExpanded] = useState(false);

  const compact = isMobile || isTablet;

  // ── Event delegation: single handler reads data-ai-* attrs from any click ───
  function handlePreviewClick(e: React.MouseEvent<HTMLDivElement>) {
    if (!onFieldClick) return;
    const el = (e.target as HTMLElement).closest("[data-ai-field]") as HTMLElement | null;
    if (!el) return;
    const sectionId = el.getAttribute("data-ai-section") as OpenBlock;
    const fieldKey  = el.getAttribute("data-ai-field") ?? "";
    if (sectionId && fieldKey) onFieldClick(sectionId, fieldKey);
  }

  // Home page → full clinic website template
  // Other pages → individual section renderers
  const pageContent = selectedPage === "home" ? (
    <ClinicHomepageTemplate
      clinic={clinic}
      heroState={heroState}
      teamsState={teamsState}
      servicesState={servicesState}
      locationsState={locationsState}
      testimonialsState={testimonialsState}
      joinTeamState={joinTeamState}
      faqState={faqState}
      newsletterState={newsletterState}
      compact={compact}
      theme={theme}
      sectionOrder={sectionOrder}
      sectionVisibility={sectionVisibility}
      activeBlock={activeBlock}
      dynamicSections={dynamicSections}
      draggingTemplateType={draggingTemplateType}
      onTemplateDrop={onTemplateDrop}
    />
  ) : (
    <>
      <HeroLivePreview  state={heroState}  clinic={clinic} compact={compact} theme={theme} />
      <TeamsLivePreview state={teamsState} clinic={clinic} compact={compact} theme={theme} />
    </>
  );

  return (
    <div className="flex-1 flex flex-col overflow-hidden pt-2 min-w-0">
      {/* Hover highlight for data-ai-field elements — only injected when targeting is enabled */}
      {onFieldClick && <style>{EDITABLE_FIELD_CSS}</style>}

      {/* ── Top toolbar: Theme | Palette | Viewport ── */}
      <div className="h-12 flex items-center px-5 shrink-0 gap-3">

        {/* LEFT — Theme toggles */}
        <div className="flex-1 flex items-center">
          <div
            className="inline-flex items-center gap-0.5 p-0.5 rounded-xl"
            style={{ background: "#e2e2e5" }}
            role="group"
            aria-label="Select theme"
          >
            {(["1", "2"] as const).map(t => (
              <button
                key={t}
                type="button"
                onClick={() => onThemeChange(t)}
                aria-pressed={theme === t}
                className={[
                  "px-3.5 py-1.5 rounded-[10px] text-xs font-medium transition-all",
                  "focus:outline-none focus-visible:ring-2 focus-visible:ring-[#003459]",
                  theme === t
                    ? "bg-white text-gray-900 shadow-sm"
                    : "text-gray-500 hover:text-gray-600",
                ].join(" ")}
              >
                Theme {t}
              </button>
            ))}
          </div>
        </div>

        {/* CENTER — Clickable color palette */}
        <div className="flex-1 flex items-center justify-center">
          <div
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl"
            style={{ background: "#e2e2e5" }}
            aria-label="Brand color palette"
          >
            <ClickableColorSwatch
              color={primaryColor}
              onChange={onPrimaryColorChange}
              title="Primary color"
            />
            <ClickableColorSwatch
              color={secondaryColor}
              onChange={onSecondaryColorChange}
              title="Accent color"
            />
            <ClickableColorSwatch
              color="#ffffff"
              title="White"
            />
            <span className="text-[10px] text-gray-400 font-medium select-none">Colors</span>
          </div>
        </div>

        {/* RIGHT — Viewport toggles */}
        <div className="flex-1 flex items-center justify-end">
          <div
            className="inline-flex items-center gap-0.5 p-0.5 rounded-xl"
            style={{ background: "#e2e2e5" }}
            role="group"
            aria-label="Switch viewport"
          >
            {VIEWPORTS.map(({ mode, label, Icon }) => (
              <button
                key={mode}
                type="button"
                onClick={() => onViewportChange(mode)}
                aria-pressed={viewport === mode}
                title={label}
                className={[
                  "p-1.5 rounded-[10px] transition-all",
                  "focus:outline-none focus-visible:ring-2 focus-visible:ring-[#003459]",
                  viewport === mode
                    ? "bg-white text-gray-900 shadow-sm"
                    : "text-gray-500 hover:text-gray-600",
                ].join(" ")}
              >
                <Icon className="w-4 h-4" aria-hidden="true" />
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Preview area ── */}
      <div className="flex-1 relative overflow-hidden">
        <div
          className={[
            "absolute inset-0 overflow-none flex items-start justify-center p-8 transition-all duration-300",
            aiExpanded ? "pb-52" : "pb-28",
          ].join(" ")}
        >
          {isGenerating && <GeneratingOverlay />}

          {/* Desktop — full-width browser frame */}
          {isDesktop && (
            <div className="w-full max-w-3xl bg-white rounded-xl shadow-sm overflow-hidden border border-gray-200">
              <BrowserChrome slug={slug} />
              <div
                className="overflow-auto"
                style={{ maxHeight: "calc(100vh - 200px)" }}
                onClick={handlePreviewClick}
              >
                {pageContent}
              </div>
            </div>
          )}

          {/* Tablet — iPad frame at 768px */}
          {isTablet && (
            <TabletFrame>
              <div
                className="overflow-auto"
                style={{ maxHeight: "calc(100vh - 260px)" }}
                onClick={handlePreviewClick}
              >
                {pageContent}
              </div>
            </TabletFrame>
          )}

          {/* Mobile — phone frame */}
          {isMobile && (
            <PhoneFrame>
              <div
                className="overflow-auto"
                style={{ maxHeight: "calc(100vh - 300px)" }}
                onClick={handlePreviewClick}
              >
                {pageContent}
              </div>
            </PhoneFrame>
          )}
        </div>

        {/* ── Floating AI Copilot ── */}
        <div className="absolute bottom-3 left-32 right-32 z-20">
          <AICopilotBar
            isGenerating={isGenerating}
            onGenerate={onGenerate}
            onExpandChange={setAiExpanded}
            onOpenWizard={onOpenWizard}
            onCheckConsistency={onCheckConsistency}
            onTonePreset={onTonePreset}
            isToneLoading={isToneLoading}
            activeTone={activeTone}
          />
        </div>
      </div>

      {/* ── Bottom status bar ── */}
      {/* <div className="h-6 bg-white border-t border-gray-100 flex items-center justify-between px-5 shrink-0">
        <span className="text-[10px] text-gray-400 font-mono">
          {isMobile ? "375px" : isTablet ? "768px" : "100%"}
        </span>
        <span className="text-[10px] text-gray-400">
          {isGenerating ? "AI generating…" : `${activeBlock ?? "overview"} — live preview`}
        </span>
        <span className={`text-[10px] font-medium ${isGenerating ? "text-violet-500" : "text-green-500"}`}>
          {isGenerating ? "✦ Generating" : "● Connected"}
        </span>
      </div> */}
    </div>
  );
}
