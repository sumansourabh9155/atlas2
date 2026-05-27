/**
 * DraftPanel — Popup modal diff viewer with inline editing.
 *
 * Opens as a centred modal overlay when the admin clicks "Draft" on a
 * submission card.  Shows every field change in a document-style diff:
 *   ┤ old value (struck-through, red) ├  →  ✏ editable new value (green/blue)
 *
 * The "After" column is editable for scalar fields (string, color, boolean).
 * Complex types (arrays, objects, reorder strings) stay read-only.
 * All edits are tracked in `localEdits` and passed to `onApprove`.
 */

import { useState, useEffect, useMemo } from "react";
import {
  X, CheckCircle2, AlertCircle, ChevronDown,
  MapPin, Globe, Tag, ExternalLink, Pencil, RotateCcw, XCircle,
} from "lucide-react";
import type { FieldChange } from "../../lib/approval/diffGenerator";

// ─── Types ────────────────────────────────────────────────────────────────────

export type LocalEdits = Record<string, unknown>;

export interface DraftPanelProps {
  fieldChanges:    FieldChange[];
  clinicName:      string;
  submittedBy:     string;
  submittedAt:     string;
  primaryColor?:   string;
  clinicType?:     string;
  clinicLocation?: string;
  clinicSlug?:     string;
  petTypes?:       string[];
  onApprove:          (localEdits: LocalEdits) => void;
  onRequestChanges:   (feedback: string) => void;  // soft — clinic revises & resubmits
  onReject:           (reason: string) => void;    // hard — permanent rejection
  onReviewInEditor:   () => void;
  onClose:            () => void;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const HOSPITAL_TYPE_LABELS: Record<string, string> = {
  general_practice:         "General Practice",
  specialty_referral:       "Specialty & Referral",
  emergency_critical_care:  "Emergency & Critical Care",
  exotic_animal:            "Exotic Animal",
  rehabilitation:           "Rehabilitation",
  mobile_clinic:            "Mobile Clinic",
};

const PET_LABELS: Record<string, string> = {
  dog: "Dog", cat: "Cat", bird: "Bird", rabbit: "Rabbit",
  reptile: "Reptile", fish: "Fish", small_mammal: "Small Mammal",
  large_animal: "Large Animal", exotic: "Exotic",
};

const SECTION_ORDER = [
  "General Info", "Business Type", "Location & Contact", "Operating Hours",
  "Services", "Team Members", "Navigation", "SEO", "Footer", "Integrations",
  "Page Content", "Other",
];

const SECTION_LABEL_MAP: Record<FieldChange["section"], string> = {
  general: "General Info", taxonomy: "Business Type", contact: "Location & Contact",
  services: "Services", veterinarians: "Team Members", blocks: "Page Content", other: "",
};

function deriveSectionLabel(fc: FieldChange): string {
  if (fc.section !== "other") return SECTION_LABEL_MAP[fc.section] || "Other";
  const p = fc.path;
  if (p.startsWith("seo"))            return "SEO";
  if (p.startsWith("navLinks") || p.startsWith("navConfig")) return "Navigation";
  if (p.startsWith("hours"))          return "Operating Hours";
  if (p.startsWith("servicesConfig")) return "Services";
  if (p.startsWith("vetsConfig"))     return "Team Members";
  if (p.startsWith("integrations"))   return "Integrations";
  if (p.startsWith("footerConfig"))   return "Footer";
  return "Other";
}

// ─── Value type helpers ───────────────────────────────────────────────────────

function isHexColor(val: unknown): val is string {
  return typeof val === "string" && /^#[0-9A-Fa-f]{3,8}$/.test(val.trim());
}

/** True for values we can't edit inline (arrays, objects, reorder strings, hours) */
function isComplexValue(val: unknown, path: string): boolean {
  if (path === "hours" || path === "blocks.order" || path === "navLinks.order") return true;
  if (path.startsWith("blocks.") && !path.includes(".isVisible")) return true;
  if (Array.isArray(val)) return true;
  if (val !== null && typeof val === "object") return true;
  // Arrow-separated reorder strings
  if (typeof val === "string" && val.includes(" → ")) return true;
  return false;
}

// ─── Read-only value renderer ─────────────────────────────────────────────────

function ColorSwatch({ color }: { color: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 font-mono text-xs">
      <span
        className="w-3.5 h-3.5 rounded-full border border-black/10 shrink-0 inline-block"
        style={{ backgroundColor: color }}
        aria-hidden="true"
      />
      {color}
    </span>
  );
}

function renderValue(val: unknown, path: string): React.ReactNode {
  if (val === "" || val === null || val === undefined)
    return <span className="italic text-gray-400 text-xs">—</span>;
  if (isHexColor(val)) return <ColorSwatch color={val} />;
  if (typeof val === "boolean")
    return <span className={`text-xs font-semibold ${val ? "text-green-700" : "text-gray-500"}`}>{val ? "Enabled" : "Disabled"}</span>;
  if (Array.isArray(val)) {
    if (val.length === 0) return <span className="italic text-gray-400 text-xs">none</span>;
    return (
      <span className="flex flex-wrap gap-1">
        {val.map((item, i) => (
          <span key={i} className="px-1.5 py-0.5 bg-white/70 border border-gray-200 rounded text-[10px] font-medium text-gray-700">
            {typeof item === "string" ? (PET_LABELS[item] ?? item) : JSON.stringify(item)}
          </span>
        ))}
      </span>
    );
  }
  if (typeof val === "object") {
    if (path === "hours") return <span className="text-xs text-gray-500 italic">Updated schedule</span>;
    const str = JSON.stringify(val);
    return <span className="font-mono text-[10px] text-gray-600">{str.length > 80 ? str.slice(0, 80) + "…" : str}</span>;
  }
  const str = String(val);
  if (path.startsWith("navLinks.") && str.includes("  ")) {
    const [label, href] = str.split("  ");
    return (
      <span className="flex items-center gap-2 flex-wrap">
        <span className="text-xs font-semibold text-gray-800">{label}</span>
        <span className="font-mono text-[10px] text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded">{href}</span>
      </span>
    );
  }
  if ((str as string).includes(" → ") && !isHexColor(str)) {
    const parts = (str as string).split(" → ");
    return (
      <span className="flex items-center gap-1 flex-wrap text-xs text-gray-700">
        {parts.map((p: string, i: number) => (
          <span key={i} className="flex items-center gap-1">
            {i > 0 && <span className="text-gray-300">→</span>}
            <span className="px-1.5 py-0.5 bg-white border border-gray-200 rounded text-[10px] font-medium">{p}</span>
          </span>
        ))}
      </span>
    );
  }
  if (str === "Updated" || str === "enabled")
    return <span className="text-xs font-medium text-gray-700">{str}</span>;
  if (str.length > 120)
    return <span className="text-xs text-gray-800">{str.slice(0, 120)}<span className="text-gray-400">…</span></span>;
  return <span className="text-xs text-gray-800">{str}</span>;
}

// ─── EditableAfterValue ───────────────────────────────────────────────────────

interface EditableAfterProps {
  value:       unknown;   // original submitted value
  path:        string;
  editedValue: unknown;   // undefined = not yet edited; anything else = edited
  onEdit:      (v: unknown) => void;
  onClear:     () => void;
}

function EditableAfterValue({ value, path, editedValue, onEdit, onClear }: EditableAfterProps) {
  const isEdited  = editedValue !== undefined;
  const display   = isEdited ? editedValue : value;
  const isComplex = isComplexValue(value, path);
  const isColor   = isHexColor(value) || isHexColor(editedValue);
  const isBool    = typeof value === "boolean";
  const isLong    = typeof value === "string" && (value as string).length > 60;

  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft]         = useState(String(display ?? ""));

  // Keep draft in sync when edit is cleared externally
  useEffect(() => {
    if (!isEditing) setDraft(String(display ?? ""));
  }, [display, isEditing]);

  function commitEdit() {
    let parsed: unknown = draft;
    if (isBool) parsed = draft === "true";
    onEdit(parsed);
    setIsEditing(false);
  }

  function handleKey(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !isLong) { e.preventDefault(); commitEdit(); }
    if (e.key === "Escape") { setDraft(String(display ?? "")); setIsEditing(false); }
  }

  // ── Read-only complex types ──
  if (isComplex) {
    return (
      <div className="flex-1 min-w-0 px-3 py-2 bg-green-50 border border-green-100 rounded-lg">
        <div className="flex items-center justify-between mb-1">
          <p className="text-[10px] font-semibold text-green-500 uppercase tracking-wider">After</p>
          <span className="text-[9px] text-gray-400 italic">Edit in Editor</span>
        </div>
        <div className="text-green-800 font-medium">{renderValue(value, path)}</div>
      </div>
    );
  }

  // ── Editing mode ──
  if (isEditing) {
    return (
      <div className="flex-1 min-w-0 px-3 py-2 bg-blue-50 border-2 border-blue-400 rounded-lg">
        <p className="text-[10px] font-semibold text-blue-600 uppercase tracking-wider mb-1.5">Editing</p>

        {isColor ? (
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={isHexColor(draft) ? draft : "#000000"}
              onChange={e => setDraft(e.target.value)}
              className="w-8 h-7 cursor-pointer border-0 rounded p-0 bg-transparent"
            />
            <input
              value={draft}
              onChange={e => setDraft(e.target.value)}
              onKeyDown={handleKey}
              className="flex-1 text-xs font-mono px-2 py-1 border border-blue-200 rounded bg-white focus:outline-none focus:ring-1 focus:ring-blue-400"
              spellCheck={false}
              autoFocus
            />
          </div>
        ) : isBool ? (
          <select
            value={String(draft)}
            onChange={e => setDraft(e.target.value)}
            className="w-full text-xs px-2 py-1.5 border border-blue-200 rounded bg-white focus:outline-none focus:ring-1 focus:ring-blue-400"
            autoFocus
          >
            <option value="true">Enabled</option>
            <option value="false">Disabled</option>
          </select>
        ) : isLong ? (
          <textarea
            value={draft}
            onChange={e => setDraft(e.target.value)}
            onKeyDown={handleKey}
            rows={3}
            className="w-full text-xs px-2 py-1.5 border border-blue-200 rounded bg-white resize-none focus:outline-none focus:ring-1 focus:ring-blue-400"
            autoFocus
          />
        ) : (
          <input
            value={draft}
            onChange={e => setDraft(e.target.value)}
            onKeyDown={handleKey}
            className="w-full text-xs px-2 py-1.5 border border-blue-200 rounded bg-white focus:outline-none focus:ring-1 focus:ring-blue-400"
            autoFocus
          />
        )}

        <div className="flex gap-1.5 mt-2 justify-end">
          <button
            type="button"
            onClick={() => { setDraft(String(display ?? "")); setIsEditing(false); }}
            className="text-[10px] px-2.5 py-1 text-gray-500 bg-white border border-gray-200 rounded-md hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={commitEdit}
            className="text-[10px] px-2.5 py-1 bg-blue-500 text-white font-semibold rounded-md hover:bg-blue-600 transition-colors"
          >
            Save
          </button>
        </div>
      </div>
    );
  }

  // ── View mode (hover reveals edit affordance) ──
  return (
    <div
      className={[
        "flex-1 min-w-0 px-3 py-2 rounded-lg border group cursor-pointer transition-colors",
        isEdited
          ? "bg-blue-50 border-blue-200 hover:border-blue-300"
          : "bg-green-50 border-green-100 hover:border-blue-200 hover:bg-blue-50/40",
      ].join(" ")}
      onClick={() => { setDraft(String(display ?? "")); setIsEditing(true); }}
      role="button"
      tabIndex={0}
      onKeyDown={e => e.key === "Enter" && setIsEditing(true)}
      title="Click to edit"
    >
      <div className="flex items-center justify-between mb-1">
        <p className={`text-[10px] font-semibold uppercase tracking-wider ${isEdited ? "text-blue-500" : "text-green-500"}`}>
          {isEdited ? "Edited" : "After"}
        </p>
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          {isEdited && (
            <button
              type="button"
              onClick={e => { e.stopPropagation(); onClear(); }}
              className="p-0.5 text-gray-400 hover:text-red-500 transition-colors rounded"
              title="Revert to original"
            >
              <RotateCcw className="w-2.5 h-2.5" aria-hidden="true" />
            </button>
          )}
          <Pencil className="w-2.5 h-2.5 text-blue-400" aria-hidden="true" />
        </div>
      </div>
      <div className={isEdited ? "text-blue-700 font-medium" : "text-green-800 font-medium"}>
        {renderValue(display, path)}
      </div>
    </div>
  );
}

// ─── ChangeRow ────────────────────────────────────────────────────────────────

interface ChangeRowProps {
  change:      FieldChange;
  editedValue: unknown;
  onEdit:      (v: unknown) => void;
  onClearEdit: () => void;
}

function ChangeRow({ change, editedValue, onEdit, onClearEdit }: ChangeRowProps) {
  const isAdded   = change.changeType === "created";
  const isRemoved = change.changeType === "deleted";
  const isUpdated = change.changeType === "updated" || change.changeType === "reordered";

  const badge =
    isAdded   ? { label: "Added",     cls: "bg-green-100 text-green-700 border-green-200" } :
    isRemoved ? { label: "Removed",   cls: "bg-red-100 text-red-700 border-red-200"       } :
    change.changeType === "reordered"
              ? { label: "Reordered", cls: "bg-purple-100 text-purple-700 border-purple-200" } :
                { label: "Changed",   cls: "bg-amber-100 text-amber-700 border-amber-200"    };

  return (
    <div className="px-5 py-3.5 border-b border-gray-100 last:border-0">
      <div className="flex items-center gap-2 mb-2.5">
        <span className="text-xs font-semibold text-gray-800">{change.label}</span>
        <span className={`text-[9px] font-bold uppercase tracking-widest px-1.5 py-0.5 rounded border ${badge.cls}`}>
          {badge.label}
        </span>
        {editedValue !== undefined && (
          <span className="text-[9px] font-bold uppercase tracking-widest px-1.5 py-0.5 rounded border bg-blue-100 text-blue-700 border-blue-200">
            Edited
          </span>
        )}
      </div>

      <div className="flex items-start gap-2.5">

        {/* Before — shown for updated + deleted */}
        {(isUpdated || isRemoved) && (
          <div className="flex-1 min-w-0 px-3 py-2 bg-red-50 border border-red-100 rounded-lg">
            <p className="text-[10px] font-semibold text-red-400 uppercase tracking-wider mb-1">Before</p>
            <div className="line-through decoration-red-400 text-red-600">
              {renderValue(change.previousValue, change.path)}
            </div>
          </div>
        )}

        {/* Arrow */}
        {isUpdated && (
          <div className="shrink-0 mt-6 text-gray-300 font-bold text-sm select-none">→</div>
        )}

        {/* After — editable for updated + created */}
        {(isUpdated || isAdded) && (
          <EditableAfterValue
            value={change.updatedValue}
            path={change.path}
            editedValue={editedValue}
            onEdit={onEdit}
            onClear={onClearEdit}
          />
        )}

      </div>
    </div>
  );
}

// ─── SectionGroup (controlled) ────────────────────────────────────────────────

interface SectionGroupProps {
  label:       string;
  changes:     FieldChange[];
  open:        boolean;
  onToggle:    () => void;
  localEdits:  LocalEdits;
  onEdit:      (path: string, v: unknown) => void;
  onClearEdit: (path: string) => void;
}

function SectionGroup({ label, changes, open, onToggle, localEdits, onEdit, onClearEdit }: SectionGroupProps) {
  const pending  = changes.filter(c => c.status === "pending").length;
  const rejected = changes.filter(c => c.status === "rejected").length;
  const edited   = changes.filter(c => localEdits[c.path] !== undefined).length;

  const countCls =
    rejected > 0 ? "bg-red-50 text-red-600 border-red-200" :
    pending  > 0 ? "bg-amber-50 text-amber-600 border-amber-200" :
                   "bg-green-50 text-green-700 border-green-200";

  return (
    <div className="border-b border-gray-100 last:border-0">
      <button
        type="button"
        onClick={onToggle}
        className="w-full flex items-center gap-3 px-5 py-3 bg-gray-50 hover:bg-gray-100/80 transition-colors text-left focus:outline-none"
      >
        <ChevronDown
          className={`w-3.5 h-3.5 text-gray-400 transition-transform duration-200 ${open ? "" : "-rotate-90"}`}
          aria-hidden="true"
        />
        <span className="text-[11px] font-bold text-gray-600 uppercase tracking-widest flex-1">{label}</span>
        {edited > 0 && (
          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full border bg-blue-50 text-blue-600 border-blue-200">
            {edited} edited
          </span>
        )}
        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${countCls}`}>
          {changes.length} {changes.length === 1 ? "change" : "changes"}
        </span>
      </button>

      {open && (
        <div>
          {changes.map(fc => (
            <ChangeRow
              key={fc.id}
              change={fc}
              editedValue={localEdits[fc.path]}
              onEdit={v => onEdit(fc.path, v)}
              onClearEdit={() => onClearEdit(fc.path)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ─── DraftPanel ───────────────────────────────────────────────────────────────

export function DraftPanel({
  fieldChanges,
  clinicName,
  submittedBy,
  submittedAt,
  primaryColor   = "#0F766E",
  clinicType,
  clinicLocation,
  clinicSlug,
  petTypes,
  onApprove,
  onRequestChanges,
  onReject,
  onReviewInEditor,
  onClose,
}: DraftPanelProps) {

  const [openSections,   setOpenSections]   = useState<Set<string>>(new Set());
  const [requestOpen,    setRequestOpen]    = useState(false);
  const [rejectOpen,     setRejectOpen]     = useState(false);
  const [feedbackText,   setFeedbackText]   = useState("");
  const [rejectReason,   setRejectReason]   = useState("");
  const [confirmApprove, setConfirmApprove] = useState(false);
  const [localEdits,     setLocalEdits]     = useState<LocalEdits>({});

  const grouped = useMemo(() => {
    const map = new Map<string, FieldChange[]>();
    for (const fc of fieldChanges) {
      const label = deriveSectionLabel(fc);
      if (!map.has(label)) map.set(label, []);
      map.get(label)!.push(fc);
    }
    return SECTION_ORDER.filter(s => map.has(s)).map(s => ({ label: s, changes: map.get(s)! }));
  }, [fieldChanges]);

  const totalChanges = fieldChanges.length;
  const editCount    = Object.keys(localEdits).length;
  const allExpanded  = grouped.length > 0 && openSections.size === grouped.length;

  function toggleSection(label: string) {
    setOpenSections(prev => {
      const next = new Set(prev);
      next.has(label) ? next.delete(label) : next.add(label);
      return next;
    });
  }

  function handleToggleAll() {
    if (allExpanded) {
      setOpenSections(new Set());
    } else {
      setOpenSections(new Set(grouped.map(g => g.label)));
    }
  }

  function handleEdit(path: string, value: unknown) {
    setLocalEdits(prev => ({ ...prev, [path]: value }));
  }

  function handleClearEdit(path: string) {
    setLocalEdits(prev => {
      const next = { ...prev };
      delete next[path];
      return next;
    });
  }

  const initials = clinicName.split(/\s+/).slice(0, 2).map(w => w[0]?.toUpperCase() ?? "").join("");

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
      role="dialog"
      aria-modal="true"
      aria-label={`Draft changes for ${clinicName}`}
    >
      <div className="relative w-full max-w-4xl max-h-[92vh] flex flex-col rounded-2xl border border-teal-200 bg-white shadow-2xl overflow-hidden">

        {/* ── Header ── */}
        <div className="px-5 py-4 bg-gradient-to-r from-gray-50 to-white border-b border-gray-100 shrink-0">
          <div className="flex items-start gap-3.5">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center text-white text-sm font-bold shrink-0 shadow-sm"
              style={{ backgroundColor: primaryColor }}
              aria-hidden="true"
            >
              {initials}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <h3 className="text-sm font-bold text-gray-900">{clinicName}</h3>
                <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-amber-100 text-amber-700 border border-amber-200 uppercase tracking-wider">
                  Pending Review
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-gray-500">
                {clinicType && (
                  <span className="flex items-center gap-1">
                    <Tag className="w-3 h-3 text-gray-400" />
                    {HOSPITAL_TYPE_LABELS[clinicType] ?? clinicType}
                  </span>
                )}
                {clinicLocation && (
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-gray-400" />
                    {clinicLocation}
                  </span>
                )}
                {clinicSlug && (
                  <span className="flex items-center gap-1">
                    <Globe className="w-3 h-3 text-gray-400" />
                    <span className="font-mono">{clinicSlug}.vetcms.io</span>
                  </span>
                )}
                {petTypes && petTypes.length > 0 && (
                  <span>
                    {petTypes.slice(0, 5).map(p => PET_LABELS[p] ?? p).join(" · ")}
                    {petTypes.length > 5 && <span className="text-gray-400 ml-1">+{petTypes.length - 5} more</span>}
                  </span>
                )}
              </div>
            </div>

            <div className="text-right shrink-0 flex flex-col items-end gap-1">
              <button
                type="button"
                onClick={onClose}
                className="inline-flex items-center justify-center w-7 h-7 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors focus:outline-none"
                aria-label="Close draft"
              >
                <X className="w-4 h-4" />
              </button>
              <div className="text-[11px] text-gray-500">
                by <span className="font-semibold text-gray-700">{submittedBy}</span>
              </div>
              <div className="text-[10px] text-gray-400">{submittedAt}</div>
            </div>
          </div>

          {/* Summary strip */}
          <div className="mt-3 pt-3 border-t border-gray-100 flex items-center gap-1.5 text-[11px] text-gray-500">
            <span className="font-semibold text-gray-700">{totalChanges}</span>
            {" "}field change{totalChanges !== 1 ? "s" : ""} across
            <span className="font-semibold text-gray-700 ml-0.5">{grouped.length}</span>
            {" "}section{grouped.length !== 1 ? "s" : ""}
            {editCount > 0 && (
              <span className="ml-1 flex items-center gap-1 text-[10px] font-bold text-blue-600 bg-blue-50 border border-blue-200 rounded-full px-1.5 py-0.5">
                <Pencil className="w-2.5 h-2.5" />
                {editCount} edited
              </span>
            )}
            <span className="ml-2 flex items-center gap-2 text-[10px]">
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-300 inline-block" />Before</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-green-400 inline-block" />After</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-blue-400 inline-block" />Edited</span>
            </span>
            <button
              type="button"
              onClick={handleToggleAll}
              className="ml-auto text-[11px] font-semibold text-teal-600 hover:text-teal-700 transition-colors focus:outline-none"
            >
              {allExpanded ? "Collapse all" : "Expand all"}
            </button>
          </div>
        </div>

        {/* ── Change groups (scrollable) ── */}
        <div className="divide-y divide-gray-100 overflow-y-auto flex-1">
          {grouped.length === 0 ? (
            <div className="px-5 py-10 text-center">
              <p className="text-sm text-gray-400">No field changes to display.</p>
            </div>
          ) : (
            grouped.map(({ label, changes }) => (
              <SectionGroup
                key={label}
                label={label}
                changes={changes}
                open={openSections.has(label)}
                onToggle={() => toggleSection(label)}
                localEdits={localEdits}
                onEdit={handleEdit}
                onClearEdit={handleClearEdit}
              />
            ))
          )}
        </div>

        {/* ── Footer actions ── */}
        <div className="px-5 py-4 border-t border-gray-100 bg-gray-50/60 shrink-0">

          {/* ── Approve confirmation ── */}
          {confirmApprove && (
            <div className="mb-3 p-4 rounded-xl bg-teal-50 border border-teal-200">
              <p className="text-xs font-semibold text-teal-900 mb-1">
                Approve {editCount > 0 ? `with ${editCount} edit${editCount !== 1 ? "s" : ""}` : "all changes"}?
              </p>
              <p className="text-xs text-teal-700 mb-3">
                {editCount > 0
                  ? "Your edits will be applied along with the original changes."
                  : "This will mark the submission as approved. The clinic will be notified."}
              </p>
              <div className="flex gap-2 justify-end">
                <button type="button" onClick={() => setConfirmApprove(false)}
                  className="px-3 py-1.5 text-xs font-semibold text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                  Cancel
                </button>
                <button type="button" onClick={() => { onApprove(localEdits); setConfirmApprove(false); }}
                  className="px-3 py-1.5 text-xs font-semibold text-white bg-teal-600 rounded-lg hover:bg-teal-700 transition-colors">
                  Yes, Approve
                </button>
              </div>
            </div>
          )}

          {/* ── Request Changes panel (soft — clinic revises & resubmits) ── */}
          {requestOpen && (
            <div className="mb-3 p-4 rounded-xl bg-amber-50 border border-amber-200">
              <div className="flex items-center gap-2 mb-1">
                <AlertCircle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                <p className="text-xs font-semibold text-amber-900">Request revision</p>
              </div>
              <p className="text-[11px] text-amber-700 mb-2.5">
                The clinic will receive your feedback and can make changes to resubmit.
              </p>
              <textarea
                value={feedbackText}
                onChange={e => setFeedbackText(e.target.value)}
                placeholder="e.g. The emergency phone number needs a country code. Please also double-check the address."
                className="w-full text-xs px-3 py-2.5 border border-amber-200 rounded-lg resize-none bg-white text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-400"
                rows={3}
                maxLength={500}
                autoFocus
              />
              <div className="flex items-center justify-between mt-2">
                <span className="text-[10px] text-gray-400">{feedbackText.length} / 500</span>
                <div className="flex gap-2">
                  <button type="button" onClick={() => { setRequestOpen(false); setFeedbackText(""); }}
                    className="px-3 py-1.5 text-xs font-semibold text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                    Cancel
                  </button>
                  <button type="button"
                    disabled={!feedbackText.trim()}
                    onClick={() => { onRequestChanges(feedbackText.trim()); setRequestOpen(false); setFeedbackText(""); }}
                    className="px-3 py-1.5 text-xs font-semibold text-white bg-amber-500 rounded-lg hover:bg-amber-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
                    Send for Revision
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ── Reject panel (hard — permanent) ── */}
          {rejectOpen && (
            <div className="mb-3 p-4 rounded-xl bg-red-50 border border-red-200">
              <div className="flex items-start gap-2 mb-2">
                <XCircle className="w-4 h-4 text-red-500 shrink-0 mt-px" />
                <div>
                  <p className="text-xs font-semibold text-red-900">Reject this submission?</p>
                  <p className="text-[11px] text-red-600 mt-0.5">
                    This is permanent — the clinic will be notified their submission was rejected and cannot resubmit this version.
                  </p>
                </div>
              </div>
              <label className="block text-[11px] font-semibold text-red-800 mb-1 mt-2.5">
                Reason <span className="text-red-400 font-normal">(optional)</span>
              </label>
              <textarea
                value={rejectReason}
                onChange={e => setRejectReason(e.target.value)}
                placeholder="e.g. This submission contains duplicate information from a previous version."
                className="w-full text-xs px-3 py-2.5 border border-red-200 rounded-lg resize-none bg-white text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-400"
                rows={2}
                maxLength={500}
                autoFocus
              />
              <div className="flex items-center justify-between mt-2">
                <span className="text-[10px] text-gray-400">{rejectReason.length} / 500</span>
                <div className="flex gap-2">
                  <button type="button" onClick={() => { setRejectOpen(false); setRejectReason(""); }}
                    className="px-3 py-1.5 text-xs font-semibold text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                    Cancel
                  </button>
                  <button type="button"
                    onClick={() => { onReject(rejectReason.trim()); setRejectOpen(false); setRejectReason(""); }}
                    className="px-3 py-1.5 text-xs font-semibold text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors">
                    Reject Submission
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ── Action bar ── */}
          {!requestOpen && !rejectOpen && !confirmApprove && (
            <div className="flex items-center gap-2 flex-wrap">
              <button type="button" onClick={onReviewInEditor}
                className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-gray-300 transition-colors">
                <ExternalLink className="w-3.5 h-3.5" />
                Review in Editor
              </button>

              <div className="flex-1" />

              <button type="button" onClick={() => setRequestOpen(true)}
                className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-amber-700 bg-amber-50 border border-amber-200 rounded-lg hover:bg-amber-100 transition-colors">
                <AlertCircle className="w-3.5 h-3.5" />
                Request Changes
              </button>

              <button type="button" onClick={() => setRejectOpen(true)}
                className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-red-600 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 transition-colors">
                <XCircle className="w-3.5 h-3.5" />
                Reject
              </button>

              <button type="button" onClick={() => setConfirmApprove(true)}
                className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-teal-600 rounded-lg hover:bg-teal-700 transition-colors shadow-sm">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Approve{editCount > 0 ? ` (${editCount} edit${editCount !== 1 ? "s" : ""})` : ""}
              </button>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
