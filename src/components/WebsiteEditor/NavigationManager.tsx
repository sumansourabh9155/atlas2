// ─── NavigationManager — "Page Navigation Updates" modal ─────────────────────
// Two-panel layout matching the reference design:
//   Left:  Available pages not yet in the navigation
//   Right: Linked pages — drag-reorder, nesting, eye toggle, delete
// Saves back to the parent as a flat ManagedPage[] with updated navMode/parentId.

import { useState, useCallback } from "react";
import { createPortal } from "react-dom";
import {
  X, Search, Plus, Eye, EyeOff, Trash2,
  ChevronRight, ChevronDown, GripVertical,
  ArrowRight, FileText, ExternalLink,
} from "lucide-react";
import type { ManagedPage } from "./PageSettingsMenu";

// ─── Nav item tree type ───────────────────────────────────────────────────────

export interface NavItem {
  id: string;
  label: string;
  slug: string;
  icon: React.ElementType;
  isVisible: boolean;
  isCustom?: boolean;
  children: NavItem[];
}

// ─── Tree helpers ─────────────────────────────────────────────────────────────

function flattenNav(items: NavItem[]): NavItem[] {
  return items.flatMap(item => [item, ...flattenNav(item.children)]);
}

/** Remove an item by id from any depth of the tree. Returns [newTree, removedItem]. */
function removeFromTree(items: NavItem[], id: string): [NavItem[], NavItem | null] {
  let removed: NavItem | null = null;
  const next = items.reduce<NavItem[]>((acc, item) => {
    if (item.id === id) { removed = item; return acc; }
    const [newChildren, found] = removeFromTree(item.children, id);
    if (found) removed = found;
    acc.push({ ...item, children: newChildren });
    return acc;
  }, []);
  return [next, removed];
}

type DropPosition = "before" | "inside" | "after";

/** Insert an item relative to a target item. */
function insertIntoTree(
  items: NavItem[],
  item: NavItem,
  targetId: string,
  position: DropPosition,
): NavItem[] {
  if (position === "inside") {
    return items.map(i =>
      i.id === targetId
        ? { ...i, children: [...i.children, { ...item, children: [] }] }
        : { ...i, children: insertIntoTree(i.children, item, targetId, position) }
    );
  }
  const result: NavItem[] = [];
  let inserted = false;
  for (const i of items) {
    if (i.id === targetId && position === "before") { result.push(item); inserted = true; }
    if (i.id === targetId) {
      result.push(i);
    } else {
      const newChildren = insertIntoTree(i.children, item, targetId, position);
      result.push({ ...i, children: newChildren });
      if (newChildren !== i.children) inserted = true;
    }
    if (i.id === targetId && position === "after") { result.push(item); inserted = true; }
  }
  return result;
}

function toggleInTree(items: NavItem[], id: string): NavItem[] {
  return items.map(item =>
    item.id === id
      ? { ...item, isVisible: !item.isVisible }
      : { ...item, children: toggleInTree(item.children, id) }
  );
}

// ─── Convert ManagedPage[] → NavItem tree ────────────────────────────────────

export function pagesToNavTree(pages: ManagedPage[]): NavItem[] {
  const tops = pages.filter(p => p.navMode !== "hidden" && p.navMode !== "sub");
  return tops.map(p => ({
    id: p.id,
    label: p.label,
    slug: p.slug,
    icon: p.icon,
    isVisible: true,
    children: pages
      .filter(c => c.navMode === "sub" && c.parentId === p.id)
      .map(c => ({ id: c.id, label: c.label, slug: c.slug, icon: c.icon, isVisible: true, children: [] })),
  }));
}

// ─── NavigationManager ────────────────────────────────────────────────────────

interface NavigationManagerProps {
  /** All site pages (flat). Left panel shows those not yet in nav. */
  sitePages: ManagedPage[];
  /** Initial linked-pages tree. */
  initialLinked: NavItem[];
  onSave: (linked: NavItem[]) => void;
  onClose: () => void;
}

export function NavigationManager({
  sitePages, initialLinked, onSave, onClose,
}: NavigationManagerProps) {
  const [linked, setLinked]             = useState<NavItem[]>(initialLinked);
  const [expanded, setExpanded]         = useState<Set<string>>(() => {
    // Default-expand parents that have children
    const ids = new Set<string>();
    function collect(items: NavItem[]) {
      items.forEach(i => { if (i.children.length) { ids.add(i.id); collect(i.children); } });
    }
    collect(initialLinked);
    return ids;
  });
  const [leftSearch,  setLeftSearch]    = useState("");
  const [rightSearch, setRightSearch]   = useState("");
  const [draggingId,  setDraggingId]    = useState<string | null>(null);
  const [dropTarget,  setDropTarget]    = useState<{ id: string; position: DropPosition } | null>(null);
  const [showCustom,  setShowCustom]    = useState(false);
  const [customLabel, setCustomLabel]   = useState("");
  const [customHref,  setCustomHref]    = useState("");

  // ── Derived ────────────────────────────────────────────────────────────────

  const linkedIds = new Set(flattenNav(linked).map(n => n.id));

  const availablePages = sitePages.filter(
    p => !linkedIds.has(p.id) &&
    (!leftSearch || p.label.toLowerCase().includes(leftSearch.toLowerCase()))
  );

  // ── Mutations ──────────────────────────────────────────────────────────────

  const addPage = useCallback((page: ManagedPage) => {
    setLinked(prev => [
      ...prev,
      { id: page.id, label: page.label, slug: page.slug, icon: page.icon, isVisible: true, children: [] },
    ]);
  }, []);

  const removePage = useCallback((id: string) => {
    setLinked(prev => { const [next] = removeFromTree(prev, id); return next; });
  }, []);

  const toggleVisibility = useCallback((id: string) => {
    setLinked(prev => toggleInTree(prev, id));
  }, []);

  const toggleExpanded = useCallback((id: string) => {
    setExpanded(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }, []);

  const addCustomLink = useCallback(() => {
    if (!customLabel.trim()) return;
    const id = `custom-${Date.now()}`;
    setLinked(prev => [
      ...prev,
      {
        id, label: customLabel.trim(), slug: customHref || "#",
        icon: ExternalLink, isVisible: true, isCustom: true, children: [],
      },
    ]);
    setCustomLabel(""); setCustomHref(""); setShowCustom(false);
  }, [customLabel, customHref]);

  // ── Drag & drop (within linked panel) ────────────────────────────────────

  function handleDragStart(e: React.DragEvent, id: string) {
    e.dataTransfer.effectAllowed = "move";
    setDraggingId(id);
  }

  function handleDragOver(e: React.DragEvent, targetId: string) {
    e.preventDefault();
    if (!draggingId || draggingId === targetId) return;
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const ratio = (e.clientY - rect.top) / rect.height;
    const position: DropPosition = ratio < 0.28 ? "before" : ratio > 0.72 ? "after" : "inside";
    e.dataTransfer.dropEffect = "move";
    setDropTarget({ id: targetId, position });
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    if (!draggingId || !dropTarget) { cleanup(); return; }
    setLinked(prev => {
      const [withoutDrag, dragged] = removeFromTree(prev, draggingId!);
      if (!dragged) return prev;
      return insertIntoTree(withoutDrag, dragged, dropTarget!.id, dropTarget!.position);
    });
    cleanup();
  }

  function cleanup() { setDraggingId(null); setDropTarget(null); }

  // ── Render a linked page row ───────────────────────────────────────────────

  function renderRow(item: NavItem, depth = 0): React.ReactNode {
    const Icon = item.icon;
    const isExpanded   = expanded.has(item.id);
    const hasChildren  = item.children.length > 0;
    const isDragging   = draggingId === item.id;
    const dt           = dropTarget;
    const matchSearch  = !rightSearch || item.label.toLowerCase().includes(rightSearch.toLowerCase());

    if (rightSearch && !matchSearch && !item.children.some(c => c.label.toLowerCase().includes(rightSearch.toLowerCase()))) {
      return null;
    }

    return (
      <div key={item.id}>
        {/* Drop indicator — before */}
        {dt?.id === item.id && dt.position === "before" && (
          <div className="mx-4 h-0.5 bg-blue-500 rounded-full my-0.5" />
        )}

        <div
          draggable
          onDragStart={e => handleDragStart(e, item.id)}
          onDragOver={e => handleDragOver(e, item.id)}
          onDragEnd={cleanup}
          onDrop={handleDrop}
          className={[
            "flex items-center gap-2 py-2 pr-3 group select-none transition-colors",
            isDragging
              ? "opacity-40 bg-blue-50"
              : dt?.id === item.id && dt.position === "inside"
                ? "bg-blue-50/70"
                : "hover:bg-gray-50/80",
          ].join(" ")}
          style={{ paddingLeft: `${12 + depth * 20}px` }}
        >
          {/* Drag handle */}
          <div className="cursor-grab active:cursor-grabbing text-gray-300 hover:text-gray-500 shrink-0">
            <GripVertical className="w-4 h-4" />
          </div>

          {/* Expand chevron / spacer */}
          {hasChildren ? (
            <button
              type="button"
              onClick={() => toggleExpanded(item.id)}
              className="text-gray-400 hover:text-gray-700 shrink-0 transition-colors"
            >
              {isExpanded
                ? <ChevronDown  className="w-4 h-4" />
                : <ChevronRight className="w-4 h-4" />}
            </button>
          ) : (
            <div className="w-4 shrink-0" />
          )}

          {/* Page icon */}
          <Icon className={`w-4 h-4 shrink-0 transition-colors ${item.isVisible ? "text-gray-500" : "text-gray-300"}`} />

          {/* Label */}
          <span className={[
            "flex-1 text-sm font-medium truncate",
            item.isVisible ? "text-gray-800" : "text-gray-400",
          ].join(" ")}>
            {item.label}
            {item.isCustom && (
              <span className="ml-1.5 text-[9px] font-bold text-blue-400 bg-blue-50 border border-blue-100 px-1.5 py-0.5 rounded-full">
                LINK
              </span>
            )}
          </span>

          {/* Actions (show on hover) */}
          <button
            type="button"
            onClick={() => toggleVisibility(item.id)}
            title={item.isVisible ? "Hide from nav" : "Show in nav"}
            className="p-1 rounded text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-all opacity-0 group-hover:opacity-100"
          >
            {item.isVisible
              ? <Eye    className="w-4 h-4" />
              : <EyeOff className="w-4 h-4 text-gray-300" />}
          </button>

          <button
            type="button"
            onClick={() => removePage(item.id)}
            title="Remove from navigation"
            className="p-1 rounded text-red-400 hover:text-red-600 hover:bg-red-50 transition-all opacity-0 group-hover:opacity-100"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>

        {/* Nesting drop indicator */}
        {dt?.id === item.id && dt.position === "inside" && (
          <div className="mx-10 h-0.5 bg-blue-400/50 rounded-full my-0.5" />
        )}

        {/* Children */}
        {hasChildren && isExpanded && (
          <div className="relative">
            {/* Indent guide line */}
            <div
              className="absolute top-0 bottom-0 w-px bg-gray-100"
              style={{ left: `${12 + depth * 20 + 20}px` }}
              aria-hidden
            />
            {item.children.map(child => renderRow(child, depth + 1))}
          </div>
        )}

        {/* Drop indicator — after */}
        {dt?.id === item.id && dt.position === "after" && (
          <div className="mx-4 h-0.5 bg-blue-500 rounded-full my-0.5" />
        )}
      </div>
    );
  }

  // ── Render ────────────────────────────────────────────────────────────────

  return createPortal(
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-[200] bg-black/25 backdrop-blur-[2px]"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed z-[201] inset-x-4 top-[10%] bottom-[6%] max-w-[780px] mx-auto bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-gray-200/60">

        {/* ── Header ────────────────────────────────────────────────────── */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 shrink-0">
          <div>
            <h2 className="text-[15px] font-semibold text-gray-900">Page Navigation Updates</h2>
            <p className="text-[11px] text-gray-400 mt-0.5">
              Drag pages into the linked panel, then reorder by dragging the grip handle.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* ── Two-panel body ───────────────────────────────────────────── */}
        <div className="flex flex-1 min-h-0">

          {/* Left: Available Pages */}
          <div className="w-auto border-r border-gray-100 flex flex-1 flex-col">
            <div className="px-4 pt-3 pb-2 shrink-0">
              <p className="text-xs font-bold text-gray-700">Available Pages</p>
              <p className="text-[10px] text-gray-400 mt-0.5">Drag to menus or root in Linked Pages</p>
            </div>

            {/* Left search */}
            <div className="px-3 pb-2 shrink-0">
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
                <input
                  type="text"
                  value={leftSearch}
                  onChange={e => setLeftSearch(e.target.value)}
                  placeholder="Search for Pages"
                  className="w-full h-8 pl-8 pr-3 text-xs bg-gray-50 border border-gray-200 rounded-lg placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                />
              </div>
            </div>

            {/* Available list */}
            <div className="flex-1 overflow-y-auto border-t border-gray-50">
              {availablePages.length === 0 && (
                <p className="text-xs text-gray-400 text-center py-8 px-4">
                  {leftSearch ? "No pages match your search." : "All pages are already in the navigation."}
                </p>
              )}
              {availablePages.map(page => {
                const Icon = page.icon;
                return (
                  <div
                    key={page.id}
                    className="flex items-center gap-2.5 px-4 py-2.5 group hover:bg-gray-50 transition-colors border-b border-gray-50"
                  >
                    <GripVertical className="w-4 h-4 text-gray-300 group-hover:text-gray-400 shrink-0" />
                    <Icon className="w-4 h-4 text-gray-400 shrink-0" />
                    <span className="flex-1 text-sm text-gray-700 font-medium truncate">
                      {page.label}
                    </span>
                    <button
                      type="button"
                      onClick={() => addPage(page)}
                      title="Add to navigation"
                      className="p-1 rounded text-blue-500 hover:text-blue-700 hover:bg-blue-50 transition-all opacity-0 group-hover:opacity-100"
                    >
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right: Linked Pages */}
          <div className="flex-1 flex flex-col ">
            {/* Right header + Add New Menu */}
            <div className="flex items-center justify-between px-4 py-3 shrink-0">
              <p className="text-xs font-bold text-gray-700">Linked Pages</p>
              <button
                type="button"
                onClick={() => setShowCustom(p => !p)}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:text-blue-800 border border-blue-200 hover:border-blue-400 bg-blue-50/50 hover:bg-blue-50 rounded-md px-2.5 py-1 transition-colors"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                Add New Menu
              </button>
            </div>

            {/* Custom link form */}
            {showCustom && (
              <div className="mx-4 mb-2 p-3 bg-blue-50/60 border border-blue-100 rounded-xl shrink-0">
                <p className="text-[10px] font-bold text-blue-500 uppercase tracking-wider mb-2">
                  Custom Link
                </p>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={customLabel}
                    onChange={e => setCustomLabel(e.target.value)}
                    placeholder="Menu label…"
                    autoFocus
                    className="flex-1 h-7 px-2.5 text-xs border border-gray-200 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <input
                    type="text"
                    value={customHref}
                    onChange={e => setCustomHref(e.target.value)}
                    placeholder="URL or /path"
                    className="flex-1 h-7 px-2.5 text-xs border border-gray-200 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="flex gap-1.5">
                  <button
                    type="button"
                    onClick={addCustomLink}
                    disabled={!customLabel.trim()}
                    className="text-[11px] font-semibold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-40 rounded-md px-3 py-1 transition-colors"
                  >
                    Add
                  </button>
                  <button
                    type="button"
                    onClick={() => { setShowCustom(false); setCustomLabel(""); setCustomHref(""); }}
                    className="text-[11px] font-semibold text-gray-500 bg-white border border-gray-200 hover:border-gray-300 rounded-md px-3 py-1 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {/* Right search */}
            <div className="px-3 pb-2 shrink-0">
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
                <input
                  type="text"
                  value={rightSearch}
                  onChange={e => setRightSearch(e.target.value)}
                  placeholder="Search for Pages"
                  className="w-full h-8 pl-8 pr-3 text-xs bg-gray-50 border border-gray-200 rounded-lg placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                />
              </div>
            </div>

            {/* Linked list */}
            <div
              className="flex-1 overflow-y-auto border-t border-gray-100"
              onDragOver={e => e.preventDefault()}
            >
              {linked.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center py-10">
                  <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center mb-3">
                    <FileText className="w-5 h-5 text-gray-400" />
                  </div>
                  <p className="text-sm font-semibold text-gray-500">Navigation is empty</p>
                  <p className="text-xs text-gray-400 mt-1">Click → on any page to add it here</p>
                </div>
              ) : (
                linked.map(item => renderRow(item, 0))
              )}
            </div>
          </div>
        </div>

        {/* ── Footer ────────────────────────────────────────────────────── */}
        <div className="flex items-center justify-end gap-3 px-5 py-3 border-t border-gray-100 bg-gray-50/60 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 hover:border-gray-300 rounded-lg transition-colors"
          >
            Discard Changes
          </button>
          <button
            type="button"
            onClick={() => { onSave(linked); onClose(); }}
            className="px-4 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition-colors"
          >
            Save & Update Navigation
          </button>
        </div>
      </div>
    </>,
    document.body
  );
}
