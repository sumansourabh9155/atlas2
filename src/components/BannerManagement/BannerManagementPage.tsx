/**
 * Banner Management Page
 * Manage ads/banners for the website — location, timing, and placement.
 *
 * Fixes:
 *  - ConfirmDialog replaces window.confirm() for delete
 *  - Toast feedback on create, update, delete
 *  - Cancel button in form
 *  - Red border on invalid required inputs (inline validation)
 *  - Button / IconButton from design system
 *  - EmptyState component for no-banners state
 */

import React, { useState } from "react";
import {
  Plus, Edit2, Trash2, Eye, Clock, MapPin, LayoutTemplate,
  ToggleLeft, ToggleRight, Megaphone,
} from "lucide-react";
import { Button } from "../ui/Button";
import { EmptyState } from "../ui/EmptyState";
import { ConfirmDialog, type ConfirmState } from "../ui/ConfirmDialog";
import { ToastContainer, useToast } from "../ui/Toast";
import { surface } from "../../lib/styles/tokens";

/* ── Types ───────────────────────────────────────────────────────────────── */

interface Banner {
  id: string;
  name: string;
  location: "header" | "footer" | "sidebar" | "popup" | "banner-top" | "banner-bottom";
  placement: "before-content" | "after-content" | "overlay" | "side-panel";
  startDate: string;
  endDate: string;
  startTime?: string;
  endTime?: string;
  imageUrl?: string;
  content: string;
  isActive: boolean;
  createdAt: string;
}

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
  { id: "overlay",        label: "Overlay",        description: "Floats over content"           },
  { id: "side-panel",     label: "Side Panel",     description: "Fixed position side panel"    },
];

const EMPTY_FORM: Partial<Banner> = {
  name: "", location: "header", placement: "before-content",
  startDate: "", endDate: "", startTime: "", endTime: "", content: "", isActive: true,
};

/* ── Input styling helpers ───────────────────────────────────────────────── */

const baseInput = "w-full px-4 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-colors";
const inputCls  = (invalid: boolean) =>
  `${baseInput} ${invalid ? "border-red-400 bg-red-50" : "border-gray-300"}`;

/* ── Component ───────────────────────────────────────────────────────────── */

export function BannerManagementPage() {
  const [banners,    setBanners]    = useState<Banner[]>([
    { id: "1", name: "Summer Promotion",   location: "header", placement: "before-content", startDate: "2026-03-25", endDate: "2026-06-25", startTime: "08:00", endTime: "20:00", content: "Summer special offer — 20% off all services!", isActive: true,  createdAt: "2026-03-20" },
    { id: "2", name: "Newsletter Signup",  location: "popup",  placement: "overlay",        startDate: "2026-03-25", endDate: "2026-12-31", content: "Subscribe to our newsletter for updates",                                                     isActive: true,  createdAt: "2026-03-19" },
  ]);
  const [showForm,   setShowForm]   = useState(false);
  const [editingId,  setEditingId]  = useState<string | null>(null);
  const [formData,   setFormData]   = useState<Partial<Banner>>(EMPTY_FORM);
  const [touched,    setTouched]    = useState(false);
  const [confirm,    setConfirm]    = useState<ConfirmState | null>(null);
  const { toasts, toast, dismiss }  = useToast();

  /* Escape key closes form */
  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") closeForm(); };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  const closeForm = () => { setShowForm(false); setTouched(false); };

  const openAdd = () => {
    setEditingId(null);
    setFormData(EMPTY_FORM);
    setTouched(false);
    setShowForm(true);
  };

  const openEdit = (banner: Banner) => {
    setEditingId(banner.id);
    setFormData(banner);
    setTouched(false);
    setShowForm(true);
  };

  const patch = (partial: Partial<Banner>) => setFormData((f) => ({ ...f, ...partial }));

  const handleSave = () => {
    setTouched(true);
    if (!formData.name || !formData.startDate || !formData.endDate || !formData.content) return;

    if (editingId) {
      setBanners((prev) => prev.map((b) => b.id === editingId ? { ...b, ...formData, id: editingId } as Banner : b));
      toast.success("Banner updated");
    } else {
      setBanners((prev) => [...prev, { ...formData, id: `${Date.now()}`, createdAt: new Date().toISOString().split("T")[0] } as Banner]);
      toast.success("Banner created");
    }
    closeForm();
  };

  const handleDelete = (banner: Banner) => {
    setConfirm({
      title:       `Delete "${banner.name}"?`,
      message:     "This banner will be permanently removed.",
      confirmLabel: "Delete",
      variant:     "danger",
      onConfirm: () => {
        setBanners((prev) => prev.filter((b) => b.id !== banner.id));
        toast.success(`"${banner.name}" deleted`);
      },
    });
  };

  const toggleStatus = (id: string) => {
    setBanners((prev) => prev.map((b) => b.id === id ? { ...b, isActive: !b.isActive } : b));
  };

  const getLocationLabel = (id: string) => LOCATION_OPTIONS.find((l) => l.id === id)?.label ?? id;
  const getPlacementLabel = (id: string) => PLACEMENT_OPTIONS.find((p) => p.id === id)?.label ?? id;

  /* Validation */
  const invalid = (field: keyof Banner) => touched && !formData[field];

  return (
    <div className={`${surface.page} overflow-y-auto`}>
      <div className="p-8 space-y-6 max-w-4xl">

        {/* Add button (hidden while form is open) */}
        {!showForm && (
          <Button variant="primary" icon={Plus} onClick={openAdd}>
            Create New Banner
          </Button>
        )}

        {/* ── Form ── */}
        {showForm && (
          <div className="bg-gray-50 border border-gray-200 rounded-xl overflow-hidden flex flex-col max-h-[85vh]">

            {/* Sticky header */}
            <div className="sticky top-0 bg-gray-50 border-b border-gray-200 px-6 py-4 z-10 flex items-center justify-between">
              <h2 className="text-base font-semibold text-gray-900">
                {editingId ? "Edit Banner" : "Create New Banner"}
              </h2>
              <button
                onClick={closeForm}
                aria-label="Close form"
                className="text-gray-400 hover:text-gray-700 text-lg leading-none transition-colors"
              >
                ✕
              </button>
            </div>

            {/* Scrollable body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">

              {/* Name */}
              <div>
                <label htmlFor="banner-name" className="block text-sm font-medium text-gray-700 mb-1.5">
                  Banner Name <span className="text-red-500">*</span>
                </label>
                <input
                  id="banner-name"
                  type="text"
                  value={formData.name ?? ""}
                  onChange={(e) => patch({ name: e.target.value })}
                  placeholder="e.g., Summer Promotion, Newsletter Signup"
                  className={inputCls(invalid("name"))}
                />
                {invalid("name") && <p className="mt-1 text-xs text-red-500">Banner name is required.</p>}
              </div>

              {/* Location */}
              <div>
                <p className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-1.5">
                  <MapPin size={14} aria-hidden="true" />
                  Banner Location <span className="text-red-500">*</span>
                </p>
                <div className="grid grid-cols-3 gap-3">
                  {LOCATION_OPTIONS.map((loc) => (
                    <button
                      key={loc.id}
                      type="button"
                      onClick={() => patch({ location: loc.id as Banner["location"] })}
                      className={`p-3 border-2 rounded-lg text-center transition ${
                        formData.location === loc.id
                          ? "border-teal-600 bg-teal-50"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <div className="text-2xl mb-1">{loc.icon}</div>
                      <div className="text-xs font-medium text-gray-900">{loc.label}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Placement */}
              <div>
                <p className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-1.5">
                  <LayoutTemplate size={14} aria-hidden="true" />
                  Content Placement <span className="text-red-500">*</span>
                </p>
                <div className="space-y-2">
                  {PLACEMENT_OPTIONS.map((pl) => (
                    <label
                      key={pl.id}
                      className={`flex items-start gap-3 p-3 border rounded-lg cursor-pointer transition ${
                        formData.placement === pl.id
                          ? "border-teal-600 bg-teal-50"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <input
                        type="radio"
                        name="placement"
                        value={pl.id}
                        checked={formData.placement === pl.id}
                        onChange={(e) => patch({ placement: e.target.value as Banner["placement"] })}
                        className="mt-1 text-teal-600"
                      />
                      <div>
                        <p className="text-sm font-medium text-gray-900">{pl.label}</p>
                        <p className="text-xs text-gray-500">{pl.description}</p>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Dates */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="banner-start-date" className="block text-sm font-medium text-gray-700 mb-1.5 flex items-center gap-1.5">
                    <Clock size={14} aria-hidden="true" />
                    Start Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="banner-start-date"
                    type="date"
                    value={formData.startDate ?? ""}
                    onChange={(e) => patch({ startDate: e.target.value })}
                    className={inputCls(invalid("startDate"))}
                  />
                  {invalid("startDate") && <p className="mt-1 text-xs text-red-500">Start date is required.</p>}
                </div>
                <div>
                  <label htmlFor="banner-end-date" className="block text-sm font-medium text-gray-700 mb-1.5 flex items-center gap-1.5">
                    <Clock size={14} aria-hidden="true" />
                    End Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="banner-end-date"
                    type="date"
                    value={formData.endDate ?? ""}
                    onChange={(e) => patch({ endDate: e.target.value })}
                    className={inputCls(invalid("endDate"))}
                  />
                  {invalid("endDate") && <p className="mt-1 text-xs text-red-500">End date is required.</p>}
                </div>
              </div>

              {/* Times (optional) */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="banner-start-time" className="block text-sm font-medium text-gray-700 mb-1.5">
                    Start Time <span className="text-xs font-normal text-gray-400">(optional)</span>
                  </label>
                  <input
                    id="banner-start-time"
                    type="time"
                    value={formData.startTime ?? ""}
                    onChange={(e) => patch({ startTime: e.target.value })}
                    className={`${baseInput} border-gray-300`}
                  />
                  <p className="mt-1 text-xs text-gray-400">Banner shows between these times each day</p>
                </div>
                <div>
                  <label htmlFor="banner-end-time" className="block text-sm font-medium text-gray-700 mb-1.5">
                    End Time <span className="text-xs font-normal text-gray-400">(optional)</span>
                  </label>
                  <input
                    id="banner-end-time"
                    type="time"
                    value={formData.endTime ?? ""}
                    onChange={(e) => patch({ endTime: e.target.value })}
                    className={`${baseInput} border-gray-300`}
                  />
                </div>
              </div>

              {/* Content */}
              <div>
                <label htmlFor="banner-content" className="block text-sm font-medium text-gray-700 mb-1.5">
                  Banner Content <span className="text-red-500">*</span>
                </label>
                <textarea
                  id="banner-content"
                  value={formData.content ?? ""}
                  onChange={(e) => patch({ content: e.target.value })}
                  placeholder="Enter banner text, HTML, or describe the content"
                  rows={4}
                  className={inputCls(invalid("content"))}
                />
                {invalid("content") && <p className="mt-1 text-xs text-red-500">Banner content is required.</p>}
              </div>

              {/* Image URL */}
              <div>
                <label htmlFor="banner-image-url" className="block text-sm font-medium text-gray-700 mb-1.5">
                  Image URL <span className="text-xs font-normal text-gray-400">(optional)</span>
                </label>
                <input
                  id="banner-image-url"
                  type="url"
                  value={formData.imageUrl ?? ""}
                  onChange={(e) => patch({ imageUrl: e.target.value })}
                  placeholder="https://example.com/banner.jpg"
                  className={`${baseInput} border-gray-300`}
                />
              </div>
            </div>

            {/* Sticky footer */}
            <div className="sticky bottom-0 bg-white border-t border-gray-200 px-6 py-4 flex items-center gap-3 justify-between">
              <p className="text-xs text-gray-400">
                Press <kbd className="px-1.5 py-0.5 bg-gray-100 rounded text-gray-600">Esc</kbd> to close
              </p>
              <div className="flex gap-3">
                <Button variant="secondary" onClick={closeForm}>Cancel</Button>
                <Button variant="primary" onClick={handleSave}>
                  {editingId ? "Update Banner" : "Create Banner"}
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* ── Banners List ── */}
        <div className="space-y-4">
          <h2 className="text-base font-semibold text-gray-900">All Banners</h2>

          {banners.length === 0 ? (
            <EmptyState
              icon={Megaphone}
              title="No banners yet"
              subtitle="Create your first banner to get started."
              action={{ label: "Create Banner", variant: "primary", icon: Plus, onClick: openAdd }}
            />
          ) : (
            <div className="grid gap-4">
              {banners.map((banner) => (
                <div
                  key={banner.id}
                  className="border border-gray-200 rounded-xl p-5 hover:shadow-sm transition-shadow bg-white"
                >
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2.5">
                        <h3 className="text-sm font-semibold text-gray-900 truncate">{banner.name}</h3>
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                          banner.isActive ? "bg-emerald-50 text-emerald-700" : "bg-gray-100 text-gray-500"
                        }`}>
                          {banner.isActive ? "Active" : "Inactive"}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 mt-0.5 truncate">{banner.content}</p>
                    </div>
                    <button
                      onClick={() => toggleStatus(banner.id)}
                      aria-label={banner.isActive ? `Deactivate ${banner.name}` : `Activate ${banner.name}`}
                      className="ml-3 text-gray-400 hover:text-gray-600 transition-colors flex-shrink-0"
                    >
                      {banner.isActive
                        ? <ToggleRight size={24} className="text-teal-600" />
                        : <ToggleLeft  size={24} />
                      }
                    </button>
                  </div>

                  {/* Details */}
                  <div className="grid grid-cols-4 gap-3 mb-4 p-3 bg-gray-50 rounded-lg">
                    {[
                      { label: "Location",  value: getLocationLabel(banner.location)  },
                      { label: "Placement", value: getPlacementLabel(banner.placement) },
                      { label: "Schedule",  value: `${banner.startDate} → ${banner.endDate}` },
                      { label: "Time",      value: banner.startTime ? `${banner.startTime}–${banner.endTime ?? "23:59"}` : "All day" },
                    ].map(({ label, value }) => (
                      <div key={label}>
                        <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide">{label}</p>
                        <p className="text-xs font-medium text-gray-800 mt-0.5 truncate">{value}</p>
                      </div>
                    ))}
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 justify-end">
                    <Button variant="secondary" size="sm" icon={Edit2} onClick={() => openEdit(banner)}>
                      Edit
                    </Button>
                    <Button variant="secondary" size="sm" icon={Eye}>
                      Preview
                    </Button>
                    <Button variant="danger" size="sm" icon={Trash2} onClick={() => handleDelete(banner)}>
                      Delete
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <ConfirmDialog state={confirm} onClose={() => setConfirm(null)} />
      <ToastContainer toasts={toasts} onDismiss={dismiss} />
    </div>
  );
}
