import { useState, useRef } from "react";
import { Search, GripVertical, X, Plus } from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface PickerItem {
  id: string;
  name: string;
  tag?: string;
  secondTag?: string;
  avatarUrl?: string;
}

interface Props {
  items: PickerItem[];
  selectedIds: string[];
  onChange: (newIds: string[]) => void;
  searchPlaceholder?: string;
  columnLabel?: string;
}

// ─── DualPanelPicker ──────────────────────────────────────────────────────────

export function DualPanelPicker({
  items,
  selectedIds,
  onChange,
  searchPlaceholder = "Search...",
  columnLabel = "Name",
}: Props) {
  const [leftSearch, setLeftSearch]   = useState("");
  const [rightSearch, setRightSearch] = useState("");
  const dragIdx     = useRef<number | null>(null);
  const dragOverIdx = useRef<number | null>(null);

  // Derive panels
  const selectedItems = selectedIds
    .map((id) => items.find((i) => i.id === id))
    .filter(Boolean) as PickerItem[];

  const filteredAvailable = items
    .filter((i) => !selectedIds.includes(i.id))
    .filter((i) => i.name.toLowerCase().includes(leftSearch.toLowerCase()));

  const filteredSelected = selectedItems.filter((i) =>
    i.name.toLowerCase().includes(rightSearch.toLowerCase())
  );

  // ── Mutations ──────────────────────────────────────────────────────────────

  const addItem    = (id: string) => onChange([...selectedIds, id]);
  const removeItem = (id: string) => onChange(selectedIds.filter((s) => s !== id));

  const selectAll = () => {
    const addable = filteredAvailable.map((i) => i.id);
    onChange([...selectedIds, ...addable]);
  };

  const clearAll = () => onChange([]);

  // ── Drag-and-drop reorder (selected panel only) ───────────────────────────

  const onDragStart = (idx: number) => { dragIdx.current = idx; };

  const onDragOver = (e: React.DragEvent, idx: number) => {
    e.preventDefault();
    dragOverIdx.current = idx;
  };

  const onDrop = () => {
    const from = dragIdx.current;
    const to   = dragOverIdx.current;
    if (from === null || to === null || from === to) return;
    const next = [...selectedIds];
    const [moved] = next.splice(from, 1);
    next.splice(to, 0, moved);
    onChange(next);
    dragIdx.current     = null;
    dragOverIdx.current = null;
  };

  // ── Avatar ─────────────────────────────────────────────────────────────────

  function ItemAvatar({ item }: { item: PickerItem }) {
    if (item.avatarUrl) {
      return (
        <img
          src={item.avatarUrl}
          alt=""
          className="w-7 h-7 rounded-full object-cover shrink-0 border border-gray-200"
        />
      );
    }
    return (
      <span className="w-7 h-7 rounded-full bg-teal-50 border border-teal-100 text-teal-700 text-[10px] font-bold flex items-center justify-center shrink-0 select-none">
        {item.name.slice(0, 2).toUpperCase()}
      </span>
    );
  }

  function TagPill({ label }: { label: string }) {
    return (
      <span className="px-2 py-0.5 rounded-full border border-gray-200 bg-gray-50 text-[10px] text-gray-500 whitespace-nowrap shrink-0">
        {label}
      </span>
    );
  }

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="grid grid-cols-2 rounded-xl border border-gray-200 overflow-hidden bg-white">

      {/* ── Left — Available ── */}
      <div className="border-r border-gray-200 flex flex-col min-h-0">

        {/* Search */}
        <div className="px-3 pt-3 pb-2 border-b border-gray-100">
          <div className="flex items-center gap-2 px-2.5 py-1.5 bg-gray-50 border border-gray-200 rounded-lg">
            <Search className="w-3.5 h-3.5 text-gray-400 shrink-0" aria-hidden="true" />
            <input
              type="text"
              value={leftSearch}
              onChange={(e) => setLeftSearch(e.target.value)}
              placeholder={searchPlaceholder}
              className="flex-1 text-xs bg-transparent focus:outline-none text-gray-700 placeholder:text-gray-400 min-w-0"
            />
          </div>
        </div>

        {/* Count + Select all */}
        <div className="flex items-center justify-between px-4 py-2 border-b border-gray-100">
          <span className="text-xs text-gray-500">{filteredAvailable.length} Available</span>
          <button
            type="button"
            onClick={selectAll}
            className="text-xs font-semibold text-teal-600 hover:underline"
          >
            Select all
          </button>
        </div>

        {/* Column label */}
        <div className="px-4 py-2 border-b border-gray-100">
          <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
            {columnLabel}
          </span>
        </div>

        {/* Items */}
        <div className="overflow-y-auto" style={{ maxHeight: 300 }}>
          {filteredAvailable.length === 0 ? (
            <p className="text-xs text-gray-400 italic text-center py-8">
              {leftSearch ? "No matches found" : "All items selected"}
            </p>
          ) : (
            filteredAvailable.map((item) => (
              <div
                key={item.id}
                className="flex items-center gap-2.5 px-3 py-2.5 border-b border-gray-50 last:border-0 hover:bg-gray-50/60 transition-colors"
              >
                <ItemAvatar item={item} />
                <span className="flex-1 text-xs text-gray-800 truncate min-w-0">
                  {item.name}
                </span>
                <div className="flex flex-col gap-0.5 shrink-0">
                  {item.tag      && <TagPill label={item.tag} />}
                  {item.secondTag && <TagPill label={item.secondTag} />}
                </div>
                <button
                  type="button"
                  onClick={() => addItem(item.id)}
                  className="shrink-0 w-7 h-7 rounded-md border border-gray-200 flex items-center justify-center text-teal-600 hover:bg-teal-600/10 hover:border-teal-600/30 transition-colors"
                  aria-label={`Add ${item.name}`}
                >
                  <Plus className="w-3.5 h-3.5" aria-hidden="true" />
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      {/* ── Right — Selected ── */}
      <div className="flex flex-col min-h-0">

        {/* Search */}
        <div className="px-3 pt-3 pb-2 border-b border-gray-100">
          <div className="flex items-center gap-2 px-2.5 py-1.5 bg-gray-50 border border-gray-200 rounded-lg">
            <Search className="w-3.5 h-3.5 text-gray-400 shrink-0" aria-hidden="true" />
            <input
              type="text"
              value={rightSearch}
              onChange={(e) => setRightSearch(e.target.value)}
              placeholder={searchPlaceholder}
              className="flex-1 text-xs bg-transparent focus:outline-none text-gray-700 placeholder:text-gray-400 min-w-0"
            />
          </div>
        </div>

        {/* Count + Clear */}
        <div className="flex items-center justify-between px-4 py-2 border-b border-gray-100">
          <span className="text-xs text-gray-500">{selectedIds.length} Selected</span>
          <button
            type="button"
            onClick={clearAll}
            className="text-xs font-semibold text-teal-600 hover:underline"
          >
            Clear Selected
          </button>
        </div>

        {/* Column label */}
        <div className="px-4 py-2 border-b border-gray-100">
          <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
            {columnLabel}
          </span>
        </div>

        {/* Selected items (draggable) */}
        <div className="overflow-y-auto" style={{ maxHeight: 300 }}>
          {filteredSelected.length === 0 ? (
            <p className="text-xs text-gray-400 italic text-center py-8">
              {rightSearch ? "No matches found" : "No items selected yet"}
            </p>
          ) : (
            filteredSelected.map((item) => {
              const realIdx = selectedIds.indexOf(item.id);
              return (
                <div
                  key={item.id}
                  draggable
                  onDragStart={() => onDragStart(realIdx)}
                  onDragOver={(e) => onDragOver(e, realIdx)}
                  onDrop={onDrop}
                  className="flex items-center gap-2 px-3 py-2.5 border-b border-gray-50 last:border-0 hover:bg-gray-50/60 transition-colors cursor-grab active:cursor-grabbing"
                >
                  <GripVertical className="w-3.5 h-3.5 text-gray-300 shrink-0" aria-hidden="true" />
                  <ItemAvatar item={item} />
                  <span className="flex-1 text-xs text-gray-800 truncate min-w-0">
                    {item.name}
                  </span>
                  <div className="flex flex-col gap-0.5 shrink-0">
                    {item.tag      && <TagPill label={item.tag} />}
                    {item.secondTag && <TagPill label={item.secondTag} />}
                  </div>
                  <button
                    type="button"
                    onClick={() => removeItem(item.id)}
                    className="shrink-0 w-6 h-6 rounded-md flex items-center justify-center text-red-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                    aria-label={`Remove ${item.name}`}
                  >
                    <X className="w-3.5 h-3.5" aria-hidden="true" />
                  </button>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
