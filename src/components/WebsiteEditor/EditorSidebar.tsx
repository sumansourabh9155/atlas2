import { useState } from "react";
import {
  GripVertical, ChevronDown, Eye, EyeOff,
  Sparkles, LayoutGrid, Users, Plus,
} from "lucide-react";
import { HeroEditor } from "./editors/HeroEditor";
import { ServicesEditor } from "./editors/ServicesEditor";
import { TeamsEditor } from "./editors/TeamsEditor";
import { AICopilotBar } from "./AICopilotBar";
import type {
  OpenBlock, HeroEditorState, ServicesEditorState, TeamsEditorState,
} from "./WebsiteEditorPage";
import type { ClinicWebsite } from "../../types/clinic";

// ─── Block config ─────────────────────────────────────────────────────────────

const BLOCK_CONFIG: {
  id: OpenBlock & string;
  label: string;
  Icon: React.ElementType;
  getPreview: (h: HeroEditorState, s: ServicesEditorState, t: TeamsEditorState) => string;
}[] = [
  {
    id: "hero",
    label: "Hero Section",
    Icon: Sparkles,
    getPreview: (h) =>
      h.headline.slice(0, 40) + (h.headline.length > 40 ? "…" : "") || "No headline",
  },
  {
    id: "services",
    label: "Services",
    Icon: LayoutGrid,
    getPreview: (_h, s) => s.sectionTitle || "Services",
  },
  {
    id: "teams",
    label: "Our Team",
    Icon: Users,
    getPreview: (_h, _s, t) => t.sectionTitle || "Meet Our Team",
  },
];

// ─── AccordionItem ────────────────────────────────────────────────────────────

interface AccordionItemProps {
  id: string;
  label: string;
  preview: string;
  Icon: React.ElementType;
  isOpen: boolean;
  onToggle: () => void;
  children: React.ReactNode;
  primaryColor: string;
}

function AccordionItem({
  id, label, preview, Icon, isOpen, onToggle, children, primaryColor,
}: AccordionItemProps) {
  const [isVisible, setIsVisible] = useState(true);

  return (
    <div
      className={[
        "border-b border-gray-100 last:border-0 transition-colors",
        isOpen ? "bg-white" : "bg-white hover:bg-gray-50/60",
      ].join(" ")}
    >
      {/* Header */}
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={isOpen}
        aria-controls={`accordion-${id}`}
        className={[
          "w-full flex items-center gap-2 px-3 py-3 text-left",
          "focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#003459]",
          "group transition-colors",
        ].join(" ")}
      >
        {/* Drag handle */}
        <GripVertical
          className="w-3.5 h-3.5 text-gray-300 group-hover:text-gray-400 shrink-0 cursor-grab"
          aria-hidden="true"
        />

        {/* Block icon */}
        <span
          className="w-6 h-6 rounded-md flex items-center justify-center shrink-0 transition-colors"
          style={isOpen ? { backgroundColor: `${primaryColor}18`, color: primaryColor } : undefined}
        >
          <Icon
            className={`w-3.5 h-3.5 transition-colors ${isOpen ? "" : "text-gray-400"}`}
            aria-hidden="true"
          />
        </span>

        {/* Label + preview */}
        <div className="flex-1 overflow-hidden">
          <p className={`text-xs font-semibold leading-none ${isOpen ? "text-gray-900" : "text-gray-700"}`}>
            {label}
          </p>
          {!isOpen && (
            <p className="mt-0.5 text-[10px] text-gray-400 truncate leading-none">
              {preview}
            </p>
          )}
        </div>

        {/* Right side: visibility + chevron */}
        <div
          className="flex items-center gap-1.5 shrink-0"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); setIsVisible((v) => !v); }}
            aria-label={isVisible ? `Hide ${label}` : `Show ${label}`}
            className="p-1 rounded-md text-gray-300 hover:text-gray-500 hover:bg-gray-100 transition-colors focus:outline-none"
          >
            {isVisible
              ? <Eye className="w-3.5 h-3.5" aria-hidden="true" />
              : <EyeOff className="w-3.5 h-3.5" aria-hidden="true" />
            }
          </button>
        </div>

        <ChevronDown
          className={`w-3.5 h-3.5 text-gray-400 shrink-0 transition-transform duration-200
            ${isOpen ? "rotate-180" : ""}`}
          aria-hidden="true"
        />
      </button>

      {/* Expandable body */}
      <div
        id={`accordion-${id}`}
        role="region"
        aria-labelledby={`accordion-header-${id}`}
        className="overflow-hidden transition-[max-height] duration-300 ease-in-out"
        style={{ maxHeight: isOpen ? "1200px" : "0" }}
      >
        {/* Left accent bar */}
        <div className="relative">
          <div
            className="absolute left-0 top-0 bottom-0 w-0.5 rounded-r"
            style={{ backgroundColor: primaryColor }}
            aria-hidden="true"
          />
          {children}
        </div>
      </div>
    </div>
  );
}

// ─── EditorSidebar ────────────────────────────────────────────────────────────

interface Props {
  openBlock: OpenBlock;
  onToggleBlock: (id: OpenBlock) => void;
  heroState: HeroEditorState;
  onHeroChange: (u: Partial<HeroEditorState>) => void;
  servicesState: ServicesEditorState;
  onServicesChange: (u: Partial<ServicesEditorState>) => void;
  teamsState: TeamsEditorState;
  onTeamsChange: (u: Partial<TeamsEditorState>) => void;
  clinic: ClinicWebsite;
  isGenerating: boolean;
  onGenerate: (prompt: string) => void;
  onNavigateToSetup: () => void;
}

export function EditorSidebar({
  openBlock, onToggleBlock,
  heroState, onHeroChange,
  servicesState, onServicesChange,
  teamsState, onTeamsChange,
  clinic,
  isGenerating,
  onGenerate,
  onNavigateToSetup,
}: Props) {
  const primaryColor = clinic.general.primaryColor;

  return (
    <aside
      className="w-[30%] min-w-[260px] max-w-[360px] bg-white border-r border-gray-200 flex flex-col overflow-hidden shrink-0"
      aria-label="Page block editor"
    >
      {/* AI Copilot bar */}
      <AICopilotBar isGenerating={isGenerating} onGenerate={onGenerate} />

      {/* Sidebar header */}
      <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between shrink-0">
        <div>
          <h2 className="text-xs font-semibold text-gray-700">
            Page Blocks
          </h2>
          <p className="text-[10px] text-gray-400 mt-0.5">
            {BLOCK_CONFIG.length} sections
          </p>
        </div>
        <button
          type="button"
          className="inline-flex items-center gap-1 text-xs text-gray-500 hover:text-gray-800 border border-gray-200 rounded-md px-2.5 py-1 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#003459] hover:border-gray-300 bg-white"
          aria-label="Add new section"
        >
          <Plus className="w-3 h-3" aria-hidden="true" />
          Add
        </button>
      </div>

      {/* Accordion list */}
      <div className="flex-1 overflow-y-auto">
        {BLOCK_CONFIG.map(({ id, label, Icon, getPreview }) => (
          <AccordionItem
            key={id}
            id={id}
            label={label}
            Icon={Icon}
            preview={getPreview(heroState, servicesState, teamsState)}
            isOpen={openBlock === id}
            onToggle={() => onToggleBlock(id as OpenBlock)}
            primaryColor={primaryColor}
          >
            {id === "hero" && (
              <HeroEditor
                state={heroState}
                onChange={onHeroChange}
                primaryColor={primaryColor}
              />
            )}
            {id === "services" && (
              <ServicesEditor
                state={servicesState}
                onChange={onServicesChange}
                clinic={clinic}
              />
            )}
            {id === "teams" && (
              <TeamsEditor
                state={teamsState}
                onChange={onTeamsChange}
                clinic={clinic}
                onNavigateToSetup={onNavigateToSetup}
              />
            )}
          </AccordionItem>
        ))}
      </div>

      {/* Sidebar footer */}
      <div className="px-4 py-3 border-t border-gray-100 shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <span
              className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse shrink-0"
              aria-hidden="true"
            />
            <p className="text-[10px] text-gray-400">Live preview connected</p>
          </div>
          <button
            type="button"
            className="text-[10px] text-gray-400 hover:text-[#003459] transition-colors focus:outline-none"
          >
            Save draft
          </button>
        </div>
      </div>
    </aside>
  );
}
