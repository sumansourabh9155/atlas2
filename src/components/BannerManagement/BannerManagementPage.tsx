/**
 * Banner Management Page
 *
 * Platform-aligned redesign:
 *  - TopBar CTA ("Create Banner") wired via router state → opens right slide-over drawer
 *  - No inline form in page body (no duplicate CTA, no layout jank)
 *  - Right-side slide-over drawer for create and edit
 *  - Full-width content (no max-w constraint)
 *  - Proper Badge for Active/Inactive status
 *  - Proper accessible Toggle switch
 *  - Search + FilterPill row (All / Active / Inactive)
 *  - RowActionMenu for row actions (Edit / Preview / Delete)
 *  - ConfirmDialog + Toast feedback
 *  - Unsaved-changes guard on drawer close
 */

import React, { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Edit2, Trash2, Eye, Clock, MapPin, LayoutTemplate,
  Megaphone, X, ImagePlus, ArrowRight,
} from "lucide-react";
import { Badge, SearchInput, FilterPill } from "../ui";
import { Button } from "../ui/Button";
import { EmptyState } from "../ui/EmptyState";
import { ConfirmDialog, type ConfirmState } from "../ui/ConfirmDialog";
import { ToastContainer, useToast } from "../ui/Toast";
import { RowActionMenu, type RowAction } from "../ui/RowActionMenu";
import { surface } from "../../lib/styles/tokens";

/* ── Types ───────────────────────────────────────────────────────────────── */

interface Banner {
  id:        string;
  name:      string;
  location:  "header" | "footer" | "sidebar" | "popup" | "banner-top" | "banner-bottom";
  placement: "before-content" | "after-content" | "overlay" | "side-panel";
  startDate: string;
  endDate:   string;
  startTime?: string;
  endTime?:   string;
  imageUrl?:  string;
  content:   string;
  isActive:  boolean;
  createdAt: string;
}

/* ── Static config ────────────────────────────────────────────────────────── */

const LOCATION_OPTIONS = [
  { id: "header",        label: "Header",        icon: "🔝" },
  { id: "footer",        label: "Footer",        icon: "🔻" },
  { id: "sidebar",       label: "Sidebar",       icon: "◀️" },
  { id: "popup",         label: "Popup Modal",   icon: "📦" },
  { id: "banner-top",    label: "Top Banner",    icon: "📢" },
  { id: "banner-bottom", label: "Bottom Banner", icon: "📣" },
];

const PLACEMENT_OPTIONS = [
  { id: "before-content", label: "Before Content", description: "Appears before main content"  },
  { id: "after-content",  label: "After Content",  description: "Appears after main content"   },
  { id: "overlay",        label: "Overlay",        description: "Floats over page content"      },
  { id: "side-panel",     label: "Side Panel",     description: "Fixed-position side panel"     },
];

const EMPTY_FORM: Partial<Banner> = {
  name: "", location: "header", placement: "before-content",
  startDate: "", endDate: "", startTime: "", endTime: "", content: "", isActive: true,
};

const SEED_BANNERS: Banner[] = [
  {
    id: "1", name: "Summer Promotion",
    location: "header", placement: "before-content",
    startDate: "2026-03-25", endDate: "2026-06-25",
    startTime: "08:00",      endTime:  "20:00",
    content: "Summer special offer — 20% off all services!",
    isActive: true, createdAt: "2026-03-20",
  },
  {
    id: "2", name: "Newsletter Signup",
    location: "popup",  placement: "overlay",
    startDate: "2026-03-25", endDate: "2026-12-31",
    content: "Subscribe to our newsletter for updates",
    isActive: true, createdAt: "2026-03-19",
  },
  {
    id: "3", name: "Holiday Closed Notice",
    location: "banner-top", placement: "before-content",
    startDate: "2026-12-24", endDate: "2026-12-26",
    content: "We are closed for the holidays. Happy New Year!",
    isActive: false, createdAt: "2026-04-01",
  },
];

/* ── Input styling helper ─────────────────────────────────────────────────── */

const baseInput = "w-full px-3.5 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-colors bg-white";
const inputCls  = (invalid: boolean) =>
  `${baseInput} ${invalid ? "border-red-400 bg-red-50" : "border-gray-200"}`;

/* ── Toggle component ─────────────────────────────────────────────────────── */

function Toggle({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-teal-600 focus:ring-offset-2 ${
        checked ? "bg-teal-600" : "bg-gray-300"
      }`}
    >
      <span
        className={`inline-block h-3.5 w-3.5 rounded-full bg-white shadow-sm transition-transform ${
          checked ? "translate-x-[18px]" : "translate-x-[3px]"
        }`}
      />
    </button>
  );
}

/* ── Helpers ──────────────────────────────────────────────────────────────── */

function formatDate(d: string) {
  if (!d) return "—";
  return new Date(d + "T00:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function getLocationLabel(id: string) {
  return LOCATION_OPTIONS.find((l) => l.id === id)?.label ?? id;
}
function getPlacementLabel(id: string) {
  return PLACEMENT_OPTIONS.find((p) => p.id === id)?.label ?? id;
}

/* ── Main Component ───────────────────────────────────────────────────────── */

export function BannerManagementPage() {
  const location = useLocation();
  const navigate  = useNavigate();

  const [banners,    setBanners]    = useState<Banner[]>(SEED_BANNERS);
  const [drawOpen,   setDrawOpen]   = useState(false);
  const [editingId,  setEditingId]  = useState<string | null>(null);
  const [formData,   setFormData]   = useState<Partial<Banner>>(EMPTY_FORM);
  const [touched,    setTouched]    = useState(false);
  const [confirm,    setConfirm]    = useState<ConfirmState | null>(null);
  const [filter,     setFilter]     = useState<"all" | "active" | "inactive">("all");
  const [search,     setSearch]     = useState("");
  const { toasts, toast, dismiss }  = useToast();
  const isDirty = useRef(false);

  /* ── Open drawer from TopBar CTA (router state) ──
     Runs whenever location.state changes so it fires even when the user
     is already on /banners (no remount → [] would miss the update).        */
  useEffect(() => {
    if ((location.state as { openCreate?: boolean } | null)?.openCreate) {
      setEditingId(null);
      setFormData(EMPTY_FORM);
      setTouched(false);
      isDirty.current = false;
      setDrawOpen(true);
      navigate("/banners", { replace: true, state: {} });
    }
  }, [location.state, navigate]);

  /* ── Escape key closes drawer (with dirty check) ── */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && drawOpen) attemptClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [drawOpen]);

  const openAdd = () => {
    setEditingId(null);
    setFormData(EMPTY_FORM);
    setTouched(false);
    isDirty.current = false;
    setDrawOpen(true);
  };

  const openEdit = (banner: Banner) => {
    setEditingId(banner.id);
    setFormData({ ...banner });
    setTouched(false);
    isDirty.current = false;
    setDrawOpen(true);
  };

  const attemptClose = () => {
    if (isDirty.current) {
      setConfirm({
        title:       "Discard changes?",
        message:     "You have unsaved changes. They will be lost if you close now.",
        confirmLabel: "Discard",
        variant:     "danger",
        onConfirm:   () => { setDrawOpen(false); isDirty.current = false; },
      });
    } else {
      setDrawOpen(false);
    }
  };

  const patch = (partial: Partial<Banner>) => {
    isDirty.current = true;
    setFormData((f) => ({ ...f, ...partial }));
  };

  const handleSave = () => {
    setTouched(true);
    if (!formData.name?.trim() || !formData.startDate || !formData.endDate || !formData.content?.trim()) return;

    if (editingId) {
      setBanners((prev) =>
        prev.map((b) => b.id === editingId ? { ...b, ...formData, id: editingId } as Banner : b)
      );
      toast.success("Banner updated successfully");
    } else {
      const newBanner: Banner = {
        ...EMPTY_FORM,
        ...formData,
        id:        `${Date.now()}`,
        createdAt: new Date().toISOString().split("T")[0],
      } as Banner;
      setBanners((prev) => [newBanner, ...prev]);
      toast.success("Banner created");
    }
    setDrawOpen(false);
    isDirty.current = false;
  };

  const handleDelete = (banner: Banner) => {
    setConfirm({
      title:       `Delete "${banner.name}"?`,
      message:     "This banner will be permanently removed and cannot be recovered.",
      confirmLabel: "Delete",
      variant:     "danger",
      onConfirm: () => {
        setBanners((prev) => prev.filter((b) => b.id !== banner.id));
        toast.success(`"${banner.name}" deleted`);
      },
    });
  };

  const toggleStatus = (id: string) => {
    setBanners((prev) => prev.map((b) =>
      b.id === id ? { ...b, isActive: !b.isActive } : b
    ));
    const banner = banners.find((b) => b.id === id);
    if (banner) {
      toast.success(`"${banner.name}" ${banner.isActive ? "deactivated" : "activated"}`);
    }
  };

  const invalid = (field: keyof Banner) =>
    touched && !formData[field];

  /* ── Filtered list ── */
  const visible = banners.filter((b) => {
    const matchSearch = b.name.toLowerCase().includes(search.toLowerCase()) ||
      b.content.toLowerCase().includes(search.toLowerCase());
    const matchFilter =
      filter === "all" ? true :
      filter === "active" ? b.isActive :
      !b.isActive;
    return matchSearch && matchFilter;
  });

  const activeCount   = banners.filter((b) => b.isActive).length;
  const inactiveCount = banners.filter((b) => !b.isActive).length;

  /* ── Row actions ── */
  const rowActions = (banner: Banner): RowAction[] => [
    { label: "Edit",    icon: Edit2,  onClick: () => openEdit(banner) },
    { label: "Preview", icon: Eye,    onClick: () => toast.success(`Preview for "${banner.name}" coming soon`) },
    { label: "Delete",  icon: Trash2, onClick: () => handleDelete(banner), variant: "danger" },
  ];

  return (
    <div className={`${surface.page} relative`}>

      {/* ── Page body ── */}
      <div className="p-8 space-y-6 h-full overflow-y-auto">

        {/* ── Toolbar: search + filters + count ── */}
        <div className="flex items-center gap-3 flex-wrap">
          <SearchInput
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search banners…"
            className="flex-1 max-w-xs"
          />
          <div className="flex gap-1.5" role="group" aria-label="Filter by status">
            <FilterPill active={filter === "all"}      onClick={() => setFilter("all")}>
              All <span className="ml-1 text-xs opacity-60">{banners.length}</span>
            </FilterPill>
            <FilterPill active={filter === "active"}   onClick={() => setFilter("active")}>
              Active <span className="ml-1 text-xs opacity-60">{activeCount}</span>
            </FilterPill>
            <FilterPill active={filter === "inactive"} onClick={() => setFilter("inactive")}>
              Inactive <span className="ml-1 text-xs opacity-60">{inactiveCount}</span>
            </FilterPill>
          </div>
          <span className="ml-auto text-xs text-gray-400">
            {visible.length} banner{visible.length !== 1 ? "s" : ""}
          </span>
        </div>

        {/* ── Banner list ── */}
        {visible.length === 0 ? (
          <EmptyState
            icon={Megaphone}
            title={search || filter !== "all" ? "No banners match your filters" : "No banners yet"}
            subtitle={
              search || filter !== "all"
                ? "Try clearing your search or selecting a different filter."
                : "Use the \"Create Banner\" button in the top bar to add your first banner."
            }
          />
        ) : (
          <div className="space-y-3">
            {visible.map((banner) => (
              <div
                key={banner.id}
                className={`border rounded-xl bg-white transition-all hover:shadow-sm ${
                  banner.isActive ? "border-gray-200" : "border-gray-200 opacity-70"
                }`}
              >
                {/* Card body */}
                <div className="p-6">
                  <div className="flex items-start justify-between gap-4">

                    {/* Left: icon + info */}
                    <div className="flex items-start gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-lg bg-teal-50 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Megaphone size={17} className="text-teal-600" aria-hidden="true" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="text-sm font-semibold text-gray-900 truncate">{banner.name}</h3>
                          <Badge variant={banner.isActive ? "success" : "neutral"} dot>
                            {banner.isActive ? "Active" : "Inactive"}
                          </Badge>
                        </div>
                        <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">{banner.content}</p>
                      </div>
                    </div>

                    {/* Right: toggle + menu */}
                    <div className="flex items-center gap-3 flex-shrink-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-400">{banner.isActive ? "On" : "Off"}</span>
                        <Toggle
                          checked={banner.isActive}
                          onChange={() => toggleStatus(banner.id)}
                          label={banner.isActive ? `Deactivate ${banner.name}` : `Activate ${banner.name}`}
                        />
                      </div>
                      <RowActionMenu items={rowActions(banner)} label={`Actions for ${banner.name}`} />
                    </div>
                  </div>

                  {/* Meta strip */}
                  <div className="mt-4 grid grid-cols-4 gap-3 px-4 py-3 bg-gray-50 rounded-lg">
                    {[
                      { label: "Location",  value: getLocationLabel(banner.location)                                          },
                      { label: "Placement", value: getPlacementLabel(banner.placement)                                        },
                      { label: "Schedule",  value: `${formatDate(banner.startDate)} → ${formatDate(banner.endDate)}`          },
                      { label: "Time",      value: banner.startTime ? `${banner.startTime} – ${banner.endTime ?? "23:59"}` : "All day" },
                    ].map(({ label, value }) => (
                      <div key={label}>
                        <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide">{label}</p>
                        <p className="text-xs font-medium text-gray-700 mt-0.5 truncate">{value}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Slide-over Drawer ── */}
      {drawOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/20 z-40"
            onClick={attemptClose}
            aria-hidden="true"
          />

          {/* Drawer panel */}
          <div
            role="dialog"
            aria-modal="true"
            aria-label={editingId ? "Edit Banner" : "Create Banner"}
            className="fixed right-0 top-16 bottom-0 w-[480px] bg-white border-l border-gray-200 z-50 flex flex-col shadow-2xl"
          >
            {/* Drawer header */}
            <div className="flex items-center justify-between px-8 py-5 border-b border-gray-200 flex-shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-teal-50 flex items-center justify-center">
                  <ImagePlus size={14} className="text-teal-600" aria-hidden="true" />
                </div>
                <h2 className="text-sm font-bold text-gray-900">
                  {editingId ? "Edit Banner" : "Create Banner"}
                </h2>
              </div>
              <button
                type="button"
                onClick={attemptClose}
                aria-label="Close drawer"
                className="p-1.5 rounded-md text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
              >
                <X size={15} aria-hidden="true" />
              </button>
            </div>

            {/* Drawer body (scrollable) */}
            <div className="flex-1 overflow-y-auto px-8 py-6 space-y-6">

              {/* Name */}
              <div>
                <label htmlFor="banner-name" className="block text-xs font-semibold text-gray-600 mb-1.5">
                  Banner Name <span className="text-red-500">*</span>
                </label>
                <input
                  id="banner-name"
                  type="text"
                  value={formData.name ?? ""}
                  onChange={(e) => patch({ name: e.target.value })}
                  placeholder="e.g., Summer Promotion"
                  className={inputCls(invalid("name"))}
                />
                {invalid("name") && (
                  <p className="mt-1 text-xs text-red-500">Banner name is required.</p>
                )}
              </div>

              {/* Active toggle */}
              <div className="flex items-center justify-between p-3.5 bg-gray-50 rounded-lg">
                <div>
                  <p className="text-xs font-semibold text-gray-700">Banner Active</p>
                  <p className="text-xs text-gray-400 mt-0.5">Banner will {formData.isActive ? "" : "not "}be shown to visitors</p>
                </div>
                <Toggle
                  checked={formData.isActive ?? true}
                  onChange={(v) => patch({ isActive: v })}
                  label="Banner active"
                />
              </div>

              {/* Location */}
              <div>
                <p className="text-xs font-semibold text-gray-600 mb-2 flex items-center gap-1.5">
                  <MapPin size={12} aria-hidden="true" />
                  Banner Location <span className="text-red-500">*</span>
                </p>
                <div className="grid grid-cols-3 gap-2">
                  {LOCATION_OPTIONS.map((loc) => (
                    <button
                      key={loc.id}
                      type="button"
                      onClick={() => patch({ location: loc.id as Banner["location"] })}
                      className={`p-3 border-2 rounded-lg text-center transition-colors ${
                        formData.location === loc.id
                          ? "border-teal-600 bg-teal-50"
                          : "border-gray-200 hover:border-gray-300 bg-white"
                      }`}
                    >
                      <div className="text-xl mb-1">{loc.icon}</div>
                      <div className="text-xs font-medium text-gray-800">{loc.label}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Placement */}
              <div>
                <p className="text-xs font-semibold text-gray-600 mb-2 flex items-center gap-1.5">
                  <LayoutTemplate size={12} aria-hidden="true" />
                  Content Placement <span className="text-red-500">*</span>
                </p>
                <div className="space-y-2">
                  {PLACEMENT_OPTIONS.map((pl) => (
                    <label
                      key={pl.id}
                      className={`flex items-start gap-3 p-3 border rounded-lg cursor-pointer transition-colors ${
                        formData.placement === pl.id
                          ? "border-teal-600 bg-teal-50"
                          : "border-gray-200 hover:border-gray-300 bg-white"
                      }`}
                    >
                      <input
                        type="radio"
                        name="placement"
                        value={pl.id}
                        checked={formData.placement === pl.id}
                        onChange={(e) => patch({ placement: e.target.value as Banner["placement"] })}
                        className="mt-0.5 accent-teal-600"
                      />
                      <div>
                        <p className="text-xs font-semibold text-gray-800">{pl.label}</p>
                        <p className="text-xs text-gray-400">{pl.description}</p>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Date range */}
              <div>
                <p className="text-xs font-semibold text-gray-600 mb-2 flex items-center gap-1.5">
                  <Clock size={12} aria-hidden="true" />
                  Active Date Range <span className="text-red-500">*</span>
                </p>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label htmlFor="banner-start-date" className="block text-xs text-gray-500 mb-1">
                      Start Date
                    </label>
                    <input
                      id="banner-start-date"
                      type="date"
                      value={formData.startDate ?? ""}
                      onChange={(e) => patch({ startDate: e.target.value })}
                      className={inputCls(invalid("startDate"))}
                    />
                    {invalid("startDate") && <p className="mt-1 text-xs text-red-500">Required</p>}
                  </div>
                  <div>
                    <label htmlFor="banner-end-date" className="block text-xs text-gray-500 mb-1">
                      End Date
                    </label>
                    <input
                      id="banner-end-date"
                      type="date"
                      value={formData.endDate ?? ""}
                      onChange={(e) => patch({ endDate: e.target.value })}
                      className={inputCls(invalid("endDate"))}
                    />
                    {invalid("endDate") && <p className="mt-1 text-xs text-red-500">Required</p>}
                  </div>
                </div>
              </div>

              {/* Time window (optional) */}
              <div>
                <p className="text-xs font-semibold text-gray-600 mb-2">
                  Daily Time Window <span className="text-xs font-normal text-gray-400">(optional)</span>
                </p>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label htmlFor="banner-start-time" className="block text-xs text-gray-500 mb-1">Start Time</label>
                    <input
                      id="banner-start-time"
                      type="time"
                      value={formData.startTime ?? ""}
                      onChange={(e) => patch({ startTime: e.target.value })}
                      className={`${baseInput} border-gray-200`}
                    />
                  </div>
                  <div>
                    <label htmlFor="banner-end-time" className="block text-xs text-gray-500 mb-1">End Time</label>
                    <input
                      id="banner-end-time"
                      type="time"
                      value={formData.endTime ?? ""}
                      onChange={(e) => patch({ endTime: e.target.value })}
                      className={`${baseInput} border-gray-200`}
                    />
                  </div>
                </div>
                <p className="mt-1.5 text-xs text-gray-400">Leave blank to show all day</p>
              </div>

              {/* Content */}
              <div>
                <label htmlFor="banner-content" className="block text-xs font-semibold text-gray-600 mb-1.5">
                  Banner Content <span className="text-red-500">*</span>
                </label>
                <textarea
                  id="banner-content"
                  value={formData.content ?? ""}
                  onChange={(e) => patch({ content: e.target.value })}
                  placeholder="Enter the banner message, HTML, or descriptive text…"
                  rows={4}
                  className={inputCls(invalid("content"))}
                />
                {invalid("content") && (
                  <p className="mt-1 text-xs text-red-500">Banner content is required.</p>
                )}
              </div>

              {/* Image URL */}
              <div>
                <label htmlFor="banner-image-url" className="block text-xs font-semibold text-gray-600 mb-1.5">
                  Image URL <span className="text-xs font-normal text-gray-400">(optional)</span>
                </label>
                <input
                  id="banner-image-url"
                  type="url"
                  value={formData.imageUrl ?? ""}
                  onChange={(e) => patch({ imageUrl: e.target.value })}
                  placeholder="https://example.com/banner.jpg"
                  className={`${baseInput} border-gray-200`}
                />
              </div>

            </div>

            {/* Drawer footer */}
            <div className="flex-shrink-0 border-t border-gray-200 px-8 py-5 flex items-center justify-between bg-white">
              <button
                type="button"
                onClick={attemptClose}
                className="text-sm font-medium text-gray-500 hover:text-gray-700 transition-colors"
              >
                Cancel
              </button>
              <Button
                variant="primary"
                icon={editingId ? Edit2 : ArrowRight}
                onClick={handleSave}
              >
                {editingId ? "Update Banner" : "Create Banner"}
              </Button>
            </div>
          </div>
        </>
      )}

      <ConfirmDialog state={confirm} onClose={() => setConfirm(null)} />
      <ToastContainer toasts={toasts} onDismiss={dismiss} />
    </div>
  );
}
