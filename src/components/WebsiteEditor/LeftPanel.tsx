import { useState } from "react";
import {
  ChevronDown, ChevronRight, Search,
  PanelLeftClose, PanelLeftOpen, Plus,
  Home, FileText, PlayCircle, HelpCircle,
  Users, Briefcase, CalendarCheck, Download,
  MessageSquare, CreditCard, Newspaper,
} from "lucide-react";
import type { AddableSectionType } from "./sections";
import { ADDABLE_SECTION_DEFS } from "./sections";

// ─── Page tree ────────────────────────────────────────────────────────────────

type PageItem = {
  id: string;
  label: string;
  icon: React.ElementType;
  children?: PageItem[];
};

const PAGES: PageItem[] = [
  { id: "home",               label: "Home",                icon: Home },
  { id: "blog",               label: "Blog",                icon: FileText },
  { id: "news",               label: "News",                icon: Newspaper },
  { id: "videos",             label: "Videos",              icon: PlayCircle },
  { id: "faqs",               label: "FAQs",                icon: HelpCircle },
  {
    id: "about-us", label: "About Us", icon: Users,
    children: [
      { id: "teams",    label: "Teams",    icon: Users },
      { id: "careers",  label: "Careers",  icon: Briefcase },
    ],
  },
  { id: "book-appointment",   label: "Book Appointment",    icon: CalendarCheck },
  { id: "app-download",       label: "App Download",        icon: Download },
  { id: "forums",             label: "Forums",              icon: MessageSquare },
  { id: "payment-insurance",  label: "Payment & Insurance", icon: CreditCard },
];

// ─── Template thumbnails ──────────────────────────────────────────────────────

function HeadingThumb() {
  return (
    <div className="p-2 flex flex-col justify-center h-full">
      <span className="text-[13px] font-extrabold text-gray-800 leading-none">Heading</span>
      <div className="mt-1.5 flex flex-col gap-0.5">
        <div className="h-1 bg-gray-200 rounded w-full" />
        <div className="h-1 bg-gray-200 rounded w-3/4" />
      </div>
    </div>
  );
}

function ParagraphThumb() {
  return (
    <div className="p-2 flex flex-col gap-0.5 justify-center h-full">
      {[100, 100, 80, 100, 65].map((w, i) => (
        <div key={i} className="h-[3px] bg-gray-400 rounded" style={{ width: `${w}%` }} />
      ))}
    </div>
  );
}

function TextLinkThumb() {
  return (
    <div className="flex items-center justify-center h-full">
      <span className="text-[11px] font-semibold text-[#003459] underline underline-offset-2">Text link</span>
    </div>
  );
}

function TextBlockThumb() {
  return (
    <div className="m-1.5 border border-gray-200 rounded-sm p-1 h-[calc(100%-12px)] flex flex-col gap-0.5 justify-center">
      {[100, 100, 75].map((w, i) => (
        <div key={i} className="h-[3px] bg-gray-300 rounded" style={{ width: `${w}%` }} />
      ))}
    </div>
  );
}

function BlockQuoteThumb() {
  return (
    <div className="flex h-full p-2 gap-1.5">
      <div className="w-0.5 bg-gray-400 rounded shrink-0" />
      <div className="flex flex-col gap-0.5 justify-center flex-1">
        {[100, 100, 65].map((w, i) => (
          <div key={i} className="h-[3px] bg-gray-300 rounded" style={{ width: `${w}%` }} />
        ))}
      </div>
    </div>
  );
}

function RichTextThumb() {
  return (
    <div className="p-2 flex flex-col gap-1 justify-center h-full">
      <div className="h-2 bg-gray-700 rounded w-1/2" />
      <div className="h-[3px] bg-gray-300 rounded w-full" />
      <div className="h-[3px] bg-gray-300 rounded w-4/5" />
      <div className="h-[3px] bg-[#003459]/30 rounded w-1/3" />
    </div>
  );
}

function HeroThumb() {
  return (
    <div className="relative h-full w-full overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-[#003459] to-slate-700" />
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-1 p-1">
        <div className="h-2 bg-white/70 rounded w-3/4" />
        <div className="h-1 bg-white/40 rounded w-1/2" />
        <div className="h-4 border border-white/40 rounded-full w-1/3 mt-1" />
      </div>
    </div>
  );
}

function HeroSplitThumb() {
  return (
    <div className="flex h-full overflow-hidden">
      <div className="flex-1 bg-gray-50 flex flex-col justify-center p-1.5 gap-0.5">
        <div className="h-2 bg-gray-700 rounded w-full" />
        <div className="h-1 bg-gray-400 rounded w-3/4" />
        <div className="h-3 bg-[#003459]/80 rounded w-2/3 mt-1" />
      </div>
      <div className="flex-1 bg-gray-200" />
    </div>
  );
}

function CardGridThumb({ cols = 2 }: { cols?: number }) {
  return (
    <div className="p-1 grid gap-1 h-full" style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}>
      {Array.from({ length: cols }).map((_, i) => (
        <div key={i} className="bg-white border border-gray-200 rounded-sm p-0.5 flex flex-col gap-0.5">
          <div className="h-4 bg-gray-200 rounded-sm" />
          <div className="h-1 bg-gray-300 rounded w-full" />
          <div className="h-1 bg-gray-200 rounded w-3/4" />
        </div>
      ))}
    </div>
  );
}

function TeamThumb() {
  return (
    <div className="flex items-center justify-center gap-2 h-full p-1.5">
      {[0, 1, 2].map(i => (
        <div key={i} className="flex flex-col items-center gap-0.5 flex-1">
          <div className="w-6 h-6 rounded-full bg-gray-300" />
          <div className="h-1 bg-gray-400 rounded w-full" />
          <div className="h-1 bg-gray-200 rounded w-3/4" />
        </div>
      ))}
    </div>
  );
}

function StatsThumb() {
  return (
    <div className="flex items-center justify-center gap-2 h-full p-1.5">
      {["47k", "98%", "24/7"].map((n, i) => (
        <div key={i} className="flex flex-col items-center gap-0.5 flex-1">
          <span className="text-[9px] font-extrabold text-gray-700">{n}</span>
          <div className="h-1 bg-gray-200 rounded w-3/4" />
        </div>
      ))}
    </div>
  );
}

function EmptyThumb() {
  return (
    <div className="flex items-center justify-center h-full border-2 border-dashed border-gray-300 rounded-sm m-1.5">
      <div className="text-[10px] text-gray-400 font-medium">+ Empty</div>
    </div>
  );
}

function LayoutColsThumb({ cols }: { cols: number }) {
  return (
    <div className="flex gap-1 h-full p-1.5">
      {Array.from({ length: cols }).map((_, i) => (
        <div key={i} className="flex-1 bg-gray-100 border border-gray-200 rounded-sm flex items-center justify-center">
          <div className="w-2 h-2 border border-dashed border-gray-300 rounded-sm" />
        </div>
      ))}
    </div>
  );
}

function ContactThumb() {
  return (
    <div className="flex gap-1 h-full p-1.5">
      <div className="flex-1 bg-gray-100 rounded-sm flex flex-col gap-0.5 p-0.5 justify-center">
        {[80, 60, 90].map((w, i) => (
          <div key={i} className="h-[3px] bg-gray-400 rounded" style={{ width: `${w}%` }} />
        ))}
      </div>
      <div className="w-8 bg-gray-200 rounded-sm" />
    </div>
  );
}

type TemplateItem = { id: string; label: string; thumb: React.ReactNode };
type TemplateCategory = { id: string; label: string; items: TemplateItem[] };

// TEMPLATE_CATEGORIES is now derived from ADDABLE_SECTION_DEFS grouped by category.
// All items are real draggable section types — no placeholder stubs.

// ─── Sentinel ────────────────────────────────────────────────────────────────
export const ADDABLE_SECTION_CATEGORY_ID = "addable-sections";

// ─── Category order + labels for the LeftPanel ───────────────────────────────
const CATEGORY_ORDER = ["Sections", "Typography", "Layout", "Cards", "Hero", "Contact"] as const;
type CategoryLabel = typeof CATEGORY_ORDER[number];

// Map section-registry category labels to LeftPanel display metadata
const CATEGORY_META: Record<CategoryLabel, { label: string; accent: boolean }> = {
  Sections:   { label: "Sections",    accent: true  },
  Typography: { label: "Typography",  accent: false },
  Layout:     { label: "Layout",      accent: false },
  Cards:      { label: "Cards",       accent: false },
  Hero:       { label: "Hero Sections", accent: false },
  Contact:    { label: "Contact",     accent: false },
};

// ─── PagesTab ─────────────────────────────────────────────────────────────────

function PagesTab({
  selectedPage,
  onPageSelect,
}: {
  selectedPage: string;
  onPageSelect: (id: string) => void;
}) {
  const [expanded, setExpanded] = useState(new Set(["about-us"]));

  function toggle(id: string) {
    setExpanded(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  function renderPage(page: PageItem, depth = 0): React.ReactNode {
    const hasChildren = !!page.children?.length;
    const isExpanded = expanded.has(page.id);
    const isSelected = selectedPage === page.id;
    const Icon = page.icon;

    return (
      <div key={page.id}>
        <button
          type="button"
          onClick={() => { onPageSelect(page.id); if (hasChildren) toggle(page.id); }}
          className={[
            "w-full flex items-center gap-2 py-2 text-left transition-colors rounded-md",
            "focus:outline-none focus-visible:ring-2 focus-visible:ring-[#003459]",
            isSelected ? "bg-blue-50 text-[#003459]" : "text-gray-700 hover:bg-gray-50",
          ].join(" ")}
          style={{ paddingLeft: `${12 + depth * 20}px`, paddingRight: "8px" }}
        >
          {depth > 0 && (
            <div className="w-3 h-px bg-gray-200 shrink-0" aria-hidden="true" />
          )}

          <Icon
            className={`shrink-0 ${
              depth === 0 ? "w-4 h-4 text-[#003459]/70" : "w-3.5 h-3.5 text-gray-400"
            }`}
          />

          <span className={`flex-1 truncate ${depth === 0 ? "text-sm font-medium" : "text-xs font-medium"}`}>
            {page.label}
          </span>

          {hasChildren && (
            <div className="flex items-center gap-1.5 shrink-0">
              <span className="text-[10px] font-bold text-[#003459] bg-blue-50 border border-blue-100 px-1.5 py-0.5 rounded-full leading-none">
                {page.children!.length}
              </span>
              {isExpanded
                ? <ChevronDown className="w-3 h-3 text-gray-400" />
                : <ChevronRight className="w-3 h-3 text-gray-400" />
              }
            </div>
          )}
        </button>

        {hasChildren && isExpanded && (
          <div className="relative">
            <div
              className="absolute top-0 bottom-0 w-px bg-gray-100"
              style={{ left: `${20 + depth * 20}px` }}
              aria-hidden="true"
            />
            {page.children!.map(child => renderPage(child, depth + 1))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="px-3 pt-4 pb-3">
        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3 px-1">
          Navigation Hierarchy
        </p>
        <div className="flex flex-col gap-0.5">
          {PAGES.map(page => renderPage(page))}
        </div>
      </div>
    </div>
  );
}

// ─── SectionTemplatesTab ──────────────────────────────────────────────────────

interface SectionTemplatesTabProps {
  onTemplateDragStart?: (type: AddableSectionType) => void;
  onTemplateDragEnd?:   () => void;
  onAddSection?:        (type: AddableSectionType) => void;
}

function SectionTemplatesTab({
  onTemplateDragStart, onTemplateDragEnd, onAddSection,
}: SectionTemplatesTabProps) {
  const [search, setSearch] = useState("");
  const [expandedCats, setExpandedCats] = useState<Set<string>>(
    new Set(CATEGORY_ORDER)
  );

  function toggleCat(id: string) {
    setExpandedCats(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  // Group ADDABLE_SECTION_DEFS by category, filtered by search
  const grouped = CATEGORY_ORDER.map(catKey => {
    const meta = CATEGORY_META[catKey];
    const defs = ADDABLE_SECTION_DEFS.filter(d =>
      d.category === catKey &&
      (!search || d.label.toLowerCase().includes(search.toLowerCase()))
    );
    return { catKey, meta, defs };
  }).filter(g => g.defs.length > 0);

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Search */}
      <div className="px-3 py-3 border-b border-gray-100 shrink-0">
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search for Sections"
            className="w-full h-8 pl-8 pr-3 text-sm bg-gray-50 border border-gray-200 rounded-md placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#003459] focus:border-[#003459] transition-colors"
          />
        </div>
      </div>

      {/* Categories */}
      <div className="flex-1 overflow-y-auto px-3 py-4 flex flex-col gap-5">
        {grouped.map(({ catKey, meta, defs }) => {
          const isOpen = expandedCats.has(catKey);
          const isAccent = meta.accent;

          return (
            <div key={catKey}>
              {/* Category header */}
              <button
                type="button"
                onClick={() => toggleCat(catKey)}
                className="w-full flex items-center gap-1.5 py-0.5 text-left focus:outline-none group"
              >
                <ChevronDown
                  className={[
                    "w-3.5 h-3.5 transition-transform duration-200",
                    isAccent ? "text-indigo-400" : "text-gray-400",
                    isOpen ? "" : "-rotate-90",
                  ].join(" ")}
                />
                <span className={[
                  "text-xs font-bold transition-colors",
                  isAccent
                    ? "text-indigo-600 group-hover:text-indigo-700"
                    : "text-gray-700 group-hover:text-gray-900",
                ].join(" ")}>
                  {meta.label}
                </span>
                {isAccent && (
                  <span className="ml-1 text-[9px] font-bold text-indigo-400 bg-indigo-50 border border-indigo-100 rounded-full px-1.5 py-0.5 leading-none">
                    DRAG TO ADD
                  </span>
                )}
                {!isAccent && (
                  <span className="ml-auto text-[9px] font-semibold text-gray-400 bg-gray-100 rounded-full px-1.5 py-0.5 leading-none">
                    {defs.length}
                  </span>
                )}
              </button>

              {/* Grid of section cards */}
              {isOpen && (
                <div className="mt-2 grid grid-cols-2 gap-2">
                  {defs.map(def => (
                    <button
                      key={def.type}
                      type="button"
                      draggable
                      title={`Drag to canvas or click to add — ${def.label}`}
                      onDragStart={(e) => {
                        e.dataTransfer.setData("application/cms-template-type", def.type);
                        e.dataTransfer.effectAllowed = "copy";
                        // Custom drag ghost — pill badge showing section name
                        const ghost = document.createElement("div");
                        ghost.style.cssText = [
                          "position:fixed;top:-1000px;left:-1000px;",
                          "background:#6366f1;color:#fff;",
                          "padding:6px 14px;border-radius:999px;",
                          "font-size:12px;font-weight:600;",
                          "white-space:nowrap;letter-spacing:0.01em;",
                          "box-shadow:0 6px 20px rgba(99,102,241,0.45);",
                          "display:flex;align-items:center;gap:6px;",
                          "pointer-events:none;font-family:Inter,system-ui,sans-serif;",
                        ].join("");
                        ghost.innerHTML = `<span style="font-size:14px">+</span><span>${def.label}</span>`;
                        document.body.appendChild(ghost);
                        e.dataTransfer.setDragImage(ghost, ghost.offsetWidth / 2, ghost.offsetHeight / 2);
                        requestAnimationFrame(() => { if (ghost.parentNode) document.body.removeChild(ghost); });
                        onTemplateDragStart?.(def.type);
                      }}
                      onDragEnd={() => onTemplateDragEnd?.()}
                      onClick={() => onAddSection?.(def.type)}
                      className="group relative flex flex-col items-center gap-1 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 rounded-md cursor-grab active:cursor-grabbing"
                    >
                      {/* Grip dots — visible on hover */}
                      <div
                        className="absolute top-1 right-1 z-10 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
                        aria-hidden
                      >
                        <svg width="8" height="12" viewBox="0 0 8 12" fill="rgba(99,102,241,0.7)">
                          <circle cx="2" cy="2" r="1.3"/><circle cx="6" cy="2" r="1.3"/>
                          <circle cx="2" cy="6" r="1.3"/><circle cx="6" cy="6" r="1.3"/>
                          <circle cx="2" cy="10" r="1.3"/><circle cx="6" cy="10" r="1.3"/>
                        </svg>
                      </div>
                      <div
                        className="w-full h-14 border rounded-md overflow-hidden transition-all group-hover:shadow-md"
                        style={{
                          borderColor: isAccent ? "rgba(99,102,241,0.25)" : "rgba(203,213,225,0.8)",
                          background: "#ffffff",
                        }}
                        onMouseEnter={(e) => {
                          (e.currentTarget as HTMLElement).style.borderColor = isAccent
                            ? "rgba(99,102,241,0.6)"
                            : "rgba(0,52,89,0.4)";
                        }}
                        onMouseLeave={(e) => {
                          (e.currentTarget as HTMLElement).style.borderColor = isAccent
                            ? "rgba(99,102,241,0.25)"
                            : "rgba(203,213,225,0.8)";
                        }}
                      >
                        {def.thumb}
                      </div>
                      <span className={[
                        "text-[10px] font-semibold transition-colors",
                        isAccent
                          ? "text-indigo-500 group-hover:text-indigo-700"
                          : "text-gray-500 group-hover:text-[#003459]",
                      ].join(" ")}>
                        {def.label}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── LeftPanel ────────────────────────────────────────────────────────────────

interface LeftPanelProps {
  selectedPage: string;
  onPageSelect: (id: string) => void;
  /** Optionally lift collapse state to parent (enables dynamic spacer sizing) */
  isCollapsed?:       boolean;
  onCollapsedChange?: (v: boolean) => void;
  /** Called when user starts dragging a template card — lets parent show drop zones */
  onTemplateDragStart?: (type: AddableSectionType) => void;
  onTemplateDragEnd?:   () => void;
  /** Called when user clicks a template card (adds to end of page) */
  onAddSection?:        (type: AddableSectionType) => void;
}

export function LeftPanel({
  selectedPage, onPageSelect,
  isCollapsed: isCollapsedProp,
  onCollapsedChange,
  onTemplateDragStart, onTemplateDragEnd, onAddSection,
}: LeftPanelProps) {
  const [tab, setTab] = useState<"pages" | "templates">("pages");
  const [isCollapsedInternal, setIsCollapsedInternal] = useState(false);

  // Controlled when parent passes the prop, uncontrolled otherwise
  const isCollapsed = isCollapsedProp !== undefined ? isCollapsedProp : isCollapsedInternal;
  const setIsCollapsed = (v: boolean) => {
    if (onCollapsedChange) onCollapsedChange(v);
    else setIsCollapsedInternal(v);
  };

  if (isCollapsed) {
    return (
      <div className="w-9 shrink-0 bg-white border-r border-gray-200 flex flex-col items-center pt-3">
        <button
          type="button"
          onClick={() => setIsCollapsed(false)}
          className="p-1.5 rounded-md text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors focus:outline-none"
          title="Expand panel"
        >
          <PanelLeftOpen className="w-4 h-4" />
        </button>
      </div>
    );
  }

  return (
    <aside
      className="w-[260px] shrink-0 bg-white border-r border-gray-200 flex flex-col overflow-hidden"
      aria-label="Page navigation and templates"
    >
      {/* Tab bar — underline style matching RightPanel */}
      <div className="flex items-stretch border-b border-gray-200 h-11 shrink-0">
        {(["pages", "templates"] as const).map(t => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={[
              "flex-1 flex items-center justify-center text-xs font-medium border-b-2 transition-colors",
              "focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#003459]",
              tab === t
                ? "border-[#003459] text-[#003459]"
                : "border-transparent text-gray-500 hover:text-gray-700",
            ].join(" ")}
          >
            {t === "pages" ? "Pages" : "Section Templates"}
          </button>
        ))}

        <button
          type="button"
          onClick={() => setIsCollapsed(true)}
          className="px-2.5 text-gray-400 hover:text-gray-700 hover:bg-gray-50 transition-colors focus:outline-none border-b-2 border-transparent"
          title="Collapse panel"
        >
          <PanelLeftClose className="w-4 h-4" />
        </button>
      </div>

      {/* Sub-header: page count + add button (pages tab only) */}
      {tab === "pages" && (
        <div className="px-3 py-2.5 border-b border-gray-100 flex items-center justify-between shrink-0">
          <span className="text-xs text-gray-400">{PAGES.length} pages</span>
          <button
            type="button"
            className="inline-flex items-center gap-1 text-xs text-gray-500 hover:text-[#003459] border border-gray-200 hover:border-[#003459]/40 rounded-md px-2 py-1 transition-colors focus:outline-none"
          >
            <Plus className="w-3 h-3" />
            New Page
          </button>
        </div>
      )}

      {/* Content */}
      {tab === "pages"
        ? <PagesTab selectedPage={selectedPage} onPageSelect={onPageSelect} />
        : (
          <SectionTemplatesTab
            onTemplateDragStart={onTemplateDragStart}
            onTemplateDragEnd={onTemplateDragEnd}
            onAddSection={onAddSection}
          />
        )
      }
    </aside>
  );
}
