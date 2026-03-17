import { useState, useCallback } from "react";
import {
  ChevronDown, Search,
  PanelLeftClose, PanelLeftOpen,
  Home, FileText, PlayCircle, HelpCircle,
  Users, Briefcase, CalendarCheck, Download,
  MessageSquare, CreditCard, Newspaper,
  Mail, Map as MapIcon, Star, MoreVertical, EyeOff,
  Phone, Camera, Navigation2,
} from "lucide-react";
import type { AddableSectionType } from "./sections";
import { ADDABLE_SECTION_DEFS } from "./sections";
import {
  PageSettingsMenu,
  type ManagedPage,
  type NavMode,
} from "./PageSettingsMenu";
import {
  NavigationManager,
  pagesToNavTree,
  type NavItem,
} from "./NavigationManager";

// ─── Initial page state ────────────────────────────────────────────────────────

const INITIAL_PAGES: ManagedPage[] = [
  { id: "home",              label: "Home",               slug: "/",       icon: Home,         navMode: "top" },
  { id: "about-us",         label: "About Us",           slug: "/about",  icon: Users,        navMode: "top" },
  { id: "teams",            label: "Our Team",           slug: "/teams",  icon: Users,        navMode: "sub", parentId: "about-us" },
  { id: "careers",          label: "Careers",            slug: "/careers", icon: Briefcase,   navMode: "sub", parentId: "about-us" },
  { id: "services",         label: "Services",           slug: "/services", icon: Briefcase,  navMode: "top" },
  { id: "book-appointment", label: "Book Appointment",   slug: "/book",   icon: CalendarCheck, navMode: "top" },
  { id: "blog",             label: "Blog",               slug: "/blog",   icon: FileText,     navMode: "top" },
  { id: "faqs",             label: "FAQs",               slug: "/faqs",   icon: HelpCircle,   navMode: "top" },
  { id: "payment-insurance", label: "Payment & Insurance", slug: "/payment", icon: CreditCard, navMode: "hidden" },
  { id: "forums",           label: "Forums",             slug: "/forums", icon: MessageSquare, navMode: "top" },
];

// ─── Tree builder ─────────────────────────────────────────────────────────────

interface PageTreeNode extends ManagedPage {
  children: PageTreeNode[];
}

function buildPageTree(pages: ManagedPage[]): PageTreeNode[] {
  const topAndHidden = pages.filter(p => p.navMode !== "sub" || !p.parentId);
  return topAndHidden.map(p => ({
    ...p,
    children: pages
      .filter(c => c.navMode === "sub" && c.parentId === p.id)
      .map(c => ({ ...c, children: [] })),
  }));
}

// ─── PagesTab ─────────────────────────────────────────────────────────────────

interface PagesTabProps {
  selectedPage: string;
  onPageSelect: (id: string) => void;
}

function PagesTab({ selectedPage, onPageSelect }: PagesTabProps) {
  const [pages, setPages] = useState<ManagedPage[]>(INITIAL_PAGES);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [menuAnchor, setMenuAnchor] = useState<DOMRect | null>(null);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [navManagerOpen, setNavManagerOpen] = useState(false);

  const tree = buildPageTree(pages);
  const topPages = pages.filter(p => p.navMode === "top");

  // ── Page mutations ──────────────────────────────────────────────────────────

  const updatePage = useCallback((id: string, updates: Partial<ManagedPage>) => {
    setPages(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p));
  }, []);

  const duplicatePage = useCallback((id: string) => {
    const page = pages.find(p => p.id === id);
    if (!page) return;
    const copy: ManagedPage = {
      ...page,
      id: `${id}-copy-${Date.now()}`,
      label: `${page.label} (copy)`,
      slug: `${page.slug}-copy`,
    };
    setPages(prev => [...prev, copy]);
  }, [pages]);

  const deletePage = useCallback((id: string) => {
    // Also remove children of this page
    setPages(prev => prev.filter(p => p.id !== id && p.parentId !== id));
    if (selectedPage === id) onPageSelect("home");
  }, [selectedPage, onPageSelect]);

  /** Sync pages[] navMode/parentId from the NavItem tree returned by NavigationManager. */
  const handleNavSave = useCallback((navItems: NavItem[]) => {
    const updates = new Map<string, { navMode: NavMode; parentId?: string }>();
    function process(items: NavItem[], parentId?: string) {
      items.forEach(item => {
        updates.set(item.id, { navMode: parentId ? "sub" : "top", parentId });
        process(item.children, item.id);
      });
    }
    process(navItems);

    setPages(prev => prev.map(p => {
      const u = updates.get(p.id);
      if (u) return { ...p, ...u };
      // Page not in nav tree → mark hidden (but keep it in the site)
      return { ...p, navMode: "hidden", parentId: undefined };
    }));
  }, []);

  // ── Menu helpers ────────────────────────────────────────────────────────────

  function openMenu(e: React.MouseEvent, pageId: string) {
    e.stopPropagation();
    setMenuAnchor((e.currentTarget as HTMLElement).getBoundingClientRect());
    setOpenMenuId(pageId);
  }

  function closeMenu() {
    setOpenMenuId(null);
    setMenuAnchor(null);
  }

  // ── Page row renderer ───────────────────────────────────────────────────────

  function renderPage(node: PageTreeNode, depth = 0): React.ReactNode {
    const Icon = node.icon;
    const isSelected = selectedPage === node.id;
    const isMenuOpen = openMenuId === node.id;

    return (
      <div
        key={node.id}
        onMouseEnter={() => setHoveredId(node.id)}
        onMouseLeave={() => setHoveredId(null)}
      >
        {/* Row */}
        <div
          className={[
            "group flex items-center rounded-md transition-colors",
            isSelected ? "bg-blue-50" : "hover:bg-gray-50",
          ].join(" ")}
          style={{ paddingLeft: `${depth * 20}px` }}
        >
          {/* Connector line for children */}
          {depth > 0 && (
            <div className="w-3 h-px bg-gray-200 shrink-0 ml-3" aria-hidden />
          )}

          {/* Page button */}
          <button
            type="button"
            onClick={() => onPageSelect(node.id)}
            className={[
              "flex-1 flex items-center gap-2 py-1.5 pl-3 pr-1 text-left min-w-0",
              "focus:outline-none focus-visible:ring-2 focus-visible:ring-[#003459] rounded-md",
            ].join(" ")}
          >
            <Icon
              className={[
                "shrink-0",
                depth === 0 ? "w-4 h-4" : "w-3.5 h-3.5 text-gray-400",
                isSelected ? "text-[#003459]" : "text-[#003459]/60",
              ].join(" ")}
            />

            <span
              className={[
                "flex-1 truncate",
                depth === 0 ? "text-sm font-medium" : "text-xs font-medium",
                isSelected ? "text-[#003459]" : "text-gray-700",
              ].join(" ")}
            >
              {node.label}
            </span>

            {/* Hidden indicator */}
            {node.navMode === "hidden" && (
              <EyeOff className="w-3 h-3 text-gray-300 shrink-0" />
            )}

            {/* Children badge */}
            {node.children.length > 0 && (
              <span className="text-[9px] font-bold text-[#003459] bg-blue-50 border border-blue-100 px-1 py-0.5 rounded-full leading-none shrink-0">
                {node.children.length}
              </span>
            )}
          </button>

          {/* ··· menu trigger */}
          <button
            type="button"
            onClick={e => openMenu(e, node.id)}
            className={[
              "p-1 mr-1 rounded text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-all shrink-0",
              hoveredId === node.id || isMenuOpen
                ? "opacity-100"
                : "opacity-0 group-hover:opacity-100",
            ].join(" ")}
            title="Page settings"
          >
            <MoreVertical className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Sub-nav children */}
        {node.children.length > 0 && (
          <div className="relative ml-3">
            <div
              className="absolute top-0 bottom-0 w-px bg-gray-100"
              style={{ left: `${depth * 20 + 20}px` }}
              aria-hidden
            />
            {node.children.map(child => renderPage(child, depth + 1))}
          </div>
        )}

        {/* Settings menu for this page */}
        {isMenuOpen && menuAnchor && (
          <PageSettingsMenu
            page={node}
            topPages={topPages.filter(p => p.id !== node.id)}
            anchorRect={menuAnchor}
            onUpdate={updates => updatePage(node.id, updates)}
            onDuplicate={() => duplicatePage(node.id)}
            onDelete={() => deletePage(node.id)}
            onClose={closeMenu}
          />
        )}
      </div>
    );
  }

  // ── Nav summary pill ────────────────────────────────────────────────────────
  const visibleCount = pages.filter(p => p.navMode !== "hidden").length;
  const hiddenCount  = pages.filter(p => p.navMode === "hidden").length;

  return (
    <div className="flex-1 flex flex-col overflow-hidden relative">
      {/* Sub-header: counts + action buttons */}
      <div className="px-3 py-2 border-b border-gray-100 flex items-center justify-between shrink-0 gap-1.5">
        <div className="flex items-center gap-1.5 min-w-0">
          <span className="text-xs text-gray-500 font-medium whitespace-nowrap">{pages.length} pages</span>
          {hiddenCount > 0 && (
            <span className="text-[10px] text-gray-400 flex items-center gap-0.5 shrink-0">
              · <EyeOff className="w-3 h-3" /> {hiddenCount}
            </span>
          )}
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <button
            type="button"
            onClick={() => setNavManagerOpen(true)}
            title="Manage navigation structure"
            className="inline-flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 border border-blue-200 hover:border-blue-400 bg-blue-50/50 rounded-md px-2 py-1 transition-colors focus:outline-none"
          >
            <Navigation2 className="w-3 h-3" />
            Nav
          </button>
        </div>
      </div>

      {/* Nav legend */}
      <div className="px-4 py-2 border-b border-gray-50 flex items-center gap-3 shrink-0">
        <span className="text-[10px] text-gray-400 uppercase tracking-wider font-bold">Navigation Hierarchy</span>
        <div className="flex items-center gap-2 ml-auto">
          <span className="flex items-center gap-1 text-[9px] text-gray-400">
            <span className="w-1.5 h-1.5 rounded-full bg-[#003459]/60 inline-block" />
            {visibleCount} visible
          </span>
        </div>
      </div>

      {/* Page tree */}
      <div className="flex-1 overflow-y-auto px-2 py-2">
        <div className="flex flex-col gap-0.5">
          {tree.map(node => renderPage(node, 0))}
        </div>

        {pages.length === 0 && (
          <div className="text-center py-8">
            <p className="text-xs text-gray-400">No pages yet.</p>
            <p className="text-xs text-gray-400 mt-1">Use Nav → to add pages.</p>
          </div>
        )}
      </div>

      {/* Navigation Manager modal — rendered outside the overflow:hidden container via portal-like fixed positioning */}
      {navManagerOpen && (
        <NavigationManager
          sitePages={pages}
          initialLinked={pagesToNavTree(pages)}
          onSave={handleNavSave}
          onClose={() => setNavManagerOpen(false)}
        />
      )}
    </div>
  );
}

// ─── SectionTemplatesTab ──────────────────────────────────────────────────────
// (unchanged — template drag-and-drop stays the same)

interface SectionTemplatesTabProps {
  onTemplateDragStart?: (type: AddableSectionType) => void;
  onTemplateDragEnd?:   () => void;
  onAddSection?:        (type: AddableSectionType) => void;
}

const CATEGORY_ORDER_TPL = ["Sections", "Typography", "Layout", "Cards", "Hero", "Contact"] as const;
type CategoryLabel = typeof CATEGORY_ORDER_TPL[number];

const CATEGORY_META: Record<CategoryLabel, { label: string; accent: boolean }> = {
  Sections:   { label: "Sections",      accent: true  },
  Typography: { label: "Typography",    accent: false },
  Layout:     { label: "Layout",        accent: false },
  Cards:      { label: "Cards",         accent: false },
  Hero:       { label: "Hero Sections", accent: false },
  Contact:    { label: "Contact",       accent: false },
};

function SectionTemplatesTab({ onTemplateDragStart, onTemplateDragEnd, onAddSection }: SectionTemplatesTabProps) {
  const [search, setSearch] = useState("");
  const [expandedCats, setExpandedCats] = useState<Set<string>>(new Set(CATEGORY_ORDER_TPL));

  function toggleCat(id: string) {
    setExpandedCats(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  const grouped = CATEGORY_ORDER_TPL.map(catKey => {
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
                {isAccent ? (
                  <span className="ml-1 text-[9px] font-bold text-indigo-400 bg-indigo-50 border border-indigo-100 rounded-full px-1.5 py-0.5 leading-none">
                    DRAG TO ADD
                  </span>
                ) : (
                  <span className="ml-auto text-[9px] font-semibold text-gray-400 bg-gray-100 rounded-full px-1.5 py-0.5 leading-none">
                    {defs.length}
                  </span>
                )}
              </button>

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
                        const plus = document.createElement("span");
                        plus.style.fontSize = "14px";
                        plus.textContent = "+";
                        const lbl = document.createElement("span");
                        lbl.textContent = def.label;
                        ghost.appendChild(plus);
                        ghost.appendChild(lbl);
                        document.body.appendChild(ghost);
                        e.dataTransfer.setDragImage(ghost, ghost.offsetWidth / 2, ghost.offsetHeight / 2);
                        requestAnimationFrame(() => { if (ghost.parentNode) document.body.removeChild(ghost); });
                        onTemplateDragStart?.(def.type);
                      }}
                      onDragEnd={() => onTemplateDragEnd?.()}
                      onClick={() => onAddSection?.(def.type)}
                      className="group relative flex flex-col items-center gap-1 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 rounded-md cursor-grab active:cursor-grabbing"
                    >
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

export const ADDABLE_SECTION_CATEGORY_ID = "addable-sections";

interface LeftPanelProps {
  selectedPage: string;
  onPageSelect: (id: string) => void;
  isCollapsed?:         boolean;
  onCollapsedChange?:   (v: boolean) => void;
  onTemplateDragStart?: (type: AddableSectionType) => void;
  onTemplateDragEnd?:   () => void;
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
      {/* Tab bar */}
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
