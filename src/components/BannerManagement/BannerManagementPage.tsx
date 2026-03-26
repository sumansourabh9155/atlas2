/**
 * Banner Management Page
 * Manage ads/banners for the website - location, timing, and placement
 */

import React, { useState } from "react";
import {
  Plus,
  Edit2,
  Trash2,
  Eye,
  Clock,
  MapPin,
  LayoutTemplate,
  ToggleLeft,
  ToggleRight,
  AlertCircle,
} from "lucide-react";

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
  { id: "header", label: "Header", icon: "🔝" },
  { id: "footer", label: "Footer", icon: "🔻" },
  { id: "sidebar", label: "Sidebar", icon: "◀️" },
  { id: "popup", label: "Popup Modal", icon: "📦" },
  { id: "banner-top", label: "Top Banner", icon: "📢" },
  { id: "banner-bottom", label: "Bottom Banner", icon: "📣" },
];

const PLACEMENT_OPTIONS = [
  { id: "before-content", label: "Before Content", description: "Appears before main content" },
  { id: "after-content", label: "After Content", description: "Appears after main content" },
  { id: "overlay", label: "Overlay", description: "Floats over content" },
  { id: "side-panel", label: "Side Panel", description: "Fixed position side panel" },
];

export function BannerManagementPage() {
  const [banners, setBanners] = useState<Banner[]>([
    {
      id: "1",
      name: "Summer Promotion",
      location: "header",
      placement: "before-content",
      startDate: "2026-03-25",
      endDate: "2026-06-25",
      startTime: "08:00",
      endTime: "20:00",
      content: "Summer special offer - 20% off all services!",
      isActive: true,
      createdAt: "2026-03-20",
    },
    {
      id: "2",
      name: "Newsletter Signup",
      location: "popup",
      placement: "overlay",
      startDate: "2026-03-25",
      endDate: "2026-12-31",
      content: "Subscribe to our newsletter for updates",
      isActive: true,
      createdAt: "2026-03-19",
    },
  ]);

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<Banner>>({
    name: "",
    location: "header",
    placement: "before-content",
    startDate: "",
    endDate: "",
    startTime: "",
    endTime: "",
    content: "",
    isActive: true,
  });

  // Handle Escape key to close form
  React.useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setShowForm(false);
      }
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, []);

  const handleAddNew = () => {
    setEditingId(null);
    setFormData({
      name: "",
      location: "header",
      placement: "before-content",
      startDate: "",
      endDate: "",
      startTime: "",
      endTime: "",
      content: "",
      isActive: true,
    });
    setShowForm(true);
  };

  const handleEdit = (banner: Banner) => {
    setEditingId(banner.id);
    setFormData(banner);
    setShowForm(true);
  };

  const handleSave = () => {
    if (!formData.name || !formData.startDate || !formData.endDate) {
      alert("Please fill in all required fields");
      return;
    }

    if (editingId) {
      setBanners(
        banners.map((b) =>
          b.id === editingId ? { ...b, ...formData, id: editingId } : b
        )
      );
    } else {
      setBanners([
        ...banners,
        {
          ...formData,
          id: `${Date.now()}`,
          createdAt: new Date().toISOString().split("T")[0],
        } as Banner,
      ]);
    }
    setShowForm(false);
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this banner?")) {
      setBanners(banners.filter((b) => b.id !== id));
    }
  };

  const toggleBannerStatus = (id: string) => {
    setBanners(
      banners.map((b) =>
        b.id === id ? { ...b, isActive: !b.isActive } : b
      )
    );
  };

  const getLocationLabel = (id: string) =>
    LOCATION_OPTIONS.find((l) => l.id === id)?.label || id;

  const getPlacementLabel = (id: string) =>
    PLACEMENT_OPTIONS.find((p) => p.id === id)?.label || id;

  return (
    <div className="flex-1 overflow-hidden bg-white flex flex-col">
      <div className="p-10 overflow-y-auto flex-1">
        {/* Add Banner Button */}
        {!showForm && (
          <button
            onClick={handleAddNew}
            className="mb-8 inline-flex items-center gap-2 px-4 py-2 bg-teal-600 text-white text-sm font-medium rounded-lg hover:bg-teal-700 transition"
          >
            <Plus size={18} />
            Create New Banner
          </button>
        )}

        {/* Form */}
        {showForm && (
          <div className="mb-8 bg-gray-50 border border-gray-200 rounded-lg overflow-hidden flex flex-col max-h-[85vh]">
            {/* Sticky Header */}
            <div className="sticky top-0 bg-gray-50 border-b border-gray-200 p-6 z-10 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">
                {editingId ? "Edit Banner" : "Create New Banner"}
              </h2>
              <button
                onClick={() => setShowForm(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-900 font-medium text-sm rounded-lg hover:bg-white transition"
                title="Close form (Esc)"
              >
                ✕ Close
              </button>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto p-6">
              <div className="space-y-6">
                {/* Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Banner Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name || ""}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Summer Promotion, Newsletter Signup"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                />
              </div>

              {/* Location Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
                  <MapPin size={16} />
                  Banner Location <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {LOCATION_OPTIONS.map((loc) => (
                    <button
                      key={loc.id}
                      onClick={() =>
                        setFormData({ ...formData, location: loc.id as any })
                      }
                      className={`p-3 border-2 rounded-lg text-center transition ${
                        formData.location === loc.id
                          ? "border-teal-600 bg-teal-50"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <div className="text-2xl mb-2">{loc.icon}</div>
                      <div className="text-xs font-medium text-gray-900">
                        {loc.label}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Placement */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
                  <LayoutTemplate size={16} />
                  Content Placement <span className="text-red-500">*</span>
                </label>
                <div className="space-y-2">
                  {PLACEMENT_OPTIONS.map((placement) => (
                    <label
                      key={placement.id}
                      className={`flex items-start gap-3 p-3 border rounded-lg cursor-pointer transition ${
                        formData.placement === placement.id
                          ? "border-teal-600 bg-teal-50"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <input
                        type="radio"
                        name="placement"
                        value={placement.id}
                        checked={formData.placement === placement.id}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            placement: e.target.value as any,
                          })
                        }
                        className="mt-1 text-teal-600"
                      />
                      <div>
                        <div className="font-medium text-gray-900">
                          {placement.label}
                        </div>
                        <div className="text-xs text-gray-600">
                          {placement.description}
                        </div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Date & Time */}
              <div className="grid grid-cols-2 gap-6">
                {/* Start Date */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                    <Clock size={16} />
                    Start Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={formData.startDate || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, startDate: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>

                {/* End Date */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                    <Clock size={16} />
                    End Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={formData.endDate || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, endDate: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>
              </div>

              {/* Time Range (Optional) */}
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Start Time (Optional)
                  </label>
                  <input
                    type="time"
                    value={formData.startTime || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, startTime: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Banner will display between these times
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    End Time (Optional)
                  </label>
                  <input
                    type="time"
                    value={formData.endTime || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, endTime: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>
              </div>

              {/* Content */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Banner Content <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={formData.content || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, content: e.target.value })
                  }
                  placeholder="Enter banner text, HTML, or describe the content"
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>

              {/* Image URL (Optional) */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Image URL (Optional)
                </label>
                <input
                  type="url"
                  value={formData.imageUrl || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, imageUrl: e.target.value })
                  }
                  placeholder="https://example.com/banner.jpg"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>

                {/* Buttons */}
                <div className="flex gap-3 pt-4">
                  <button
                    onClick={handleSave}
                    className="px-6 py-2 bg-teal-600 text-white text-sm font-medium rounded-lg hover:bg-teal-700 transition"
                  >
                    {editingId ? "Update Banner" : "Create Banner"}
                  </button>
                </div>
              </div>
            </div>

            {/* Sticky Footer */}
            <div className="sticky bottom-0 bg-white border-t border-gray-200 px-6 py-4 flex justify-end">
              <p className="text-xs text-gray-500">Press <kbd className="px-2 py-1 bg-gray-100 rounded">Esc</kbd> to close</p>
            </div>
          </div>
        )}

        {/* Banners List */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-gray-900">Active Banners</h2>
          {banners.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
              <AlertCircle size={32} className="mx-auto mb-3 text-gray-400" />
              <p className="text-gray-600 text-sm">No banners created yet</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {banners.map((banner) => (
                <div
                  key={banner.id}
                  className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition"
                >
                  {/* Header Row */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {banner.name}
                        </h3>
                        <span
                          className={`inline-flex px-2 py-1 rounded text-xs font-medium ${
                            banner.isActive
                              ? "bg-green-50 text-green-700"
                              : "bg-gray-100 text-gray-600"
                          }`}
                        >
                          {banner.isActive ? "✓ Active" : "○ Inactive"}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">
                        {banner.content}
                      </p>
                    </div>
                    <button
                      onClick={() => toggleBannerStatus(banner.id)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      {banner.isActive ? (
                        <ToggleRight size={24} className="text-teal-600" />
                      ) : (
                        <ToggleLeft size={24} />
                      )}
                    </button>
                  </div>

                  {/* Details Grid */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4 p-4 bg-gray-50 rounded-lg">
                    <div>
                      <p className="text-xs font-medium text-gray-600 uppercase">
                        Location
                      </p>
                      <p className="text-sm text-gray-900 font-medium mt-1">
                        {getLocationLabel(banner.location)}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-gray-600 uppercase">
                        Placement
                      </p>
                      <p className="text-sm text-gray-900 font-medium mt-1">
                        {getPlacementLabel(banner.placement)}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-gray-600 uppercase">
                        Schedule
                      </p>
                      <p className="text-sm text-gray-900 font-medium mt-1">
                        {banner.startDate} → {banner.endDate}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-gray-600 uppercase">
                        Time
                      </p>
                      <p className="text-sm text-gray-900 font-medium mt-1">
                        {banner.startTime ? `${banner.startTime}-${banner.endTime || "23:59"}` : "All day"}
                      </p>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2 justify-end">
                    <button
                      onClick={() => handleEdit(banner)}
                      className="inline-flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                    >
                      <Edit2 size={16} />
                      Edit
                    </button>
                    <button
                      className="inline-flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                    >
                      <Eye size={16} />
                      Preview
                    </button>
                    <button
                      onClick={() => handleDelete(banner.id)}
                      className="inline-flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-red-700 bg-red-50 border border-red-300 rounded-lg hover:bg-red-100 transition"
                    >
                      <Trash2 size={16} />
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
