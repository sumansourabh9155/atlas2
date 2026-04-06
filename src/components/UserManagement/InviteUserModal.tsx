/**
 * InviteUserModal — 4-step slide-over panel for inviting platform users.
 *
 * Step 1: Basic info + Role selection (Admin / Manager / Custom)
 * Step 2: Location assignment
 * Step 3: Permission review (read-only for Admin/Manager, editable for Custom)
 * Step 4: Review summary → Send Invitation
 */

import React, { useState, useEffect } from "react";
import {
  X, ChevronRight, ChevronLeft, Check, Shield, MapPin,
  AlertTriangle, Send, Building2, Users, UserCog,
  Eye, Edit3, Plus, Trash2, BarChart2, Settings,
} from "lucide-react";

/* ─── Types ──────────────────────────────────────────────────────────────── */

type UserRole = "admin" | "manager" | "custom";
type PermVal  = boolean | string[];

interface FormState {
  firstName:   string;
  lastName:    string;
  email:       string;
  role:        UserRole | null;
  locationIds: string[];
  permissions: Record<string, PermVal>;
}

/* ─── Permission Definitions ─────────────────────────────────────────────── */

interface PermDef {
  id:               string;
  label:            string;
  subtitle?:        string;
  type:             "toggle" | "actions";
  availableActions?: string[];
  needsApproval?:   boolean; // Custom role only
  defaults: {
    admin:   PermVal;
    manager: PermVal;
    custom:  PermVal;
  };
}

const PERM_DEFS: PermDef[] = [
  {
    id: "dashboard", label: "Dashboard", type: "toggle",
    defaults: { admin: true, manager: true, custom: false },
  },
  {
    id: "createClinic", label: "Create Clinic", type: "toggle",
    defaults: { admin: true, manager: false, custom: false },
  },
  {
    id: "locationDetail",
    label: "Location Detail",
    subtitle: "Name, Logo, Location, Contact, Operation Hours, Integration & Footer",
    type: "actions", availableActions: ["View", "Edit"],
    defaults: { admin: ["View", "Edit"], manager: ["View", "Edit"], custom: ["View"] },
  },
  {
    id: "linkServices",
    label: "Link Services + Team + Operation Hours",
    type: "actions", availableActions: ["View", "Edit"],
    needsApproval: true,
    defaults: { admin: ["View", "Edit"], manager: ["View", "Edit"], custom: ["View", "Edit"] },
  },
  {
    id: "navigation", label: "Navigation",
    type: "actions", availableActions: ["View", "Edit"],
    defaults: { admin: ["View", "Edit"], manager: ["View", "Edit"], custom: ["View"] },
  },
  {
    id: "websiteContent",
    label: "Website Content",
    subtitle: "All pages except 3 important pages",
    type: "actions", availableActions: ["View", "Edit"],
    defaults: { admin: ["View", "Edit"], manager: ["View", "Edit"], custom: ["View", "Edit"] },
  },
  {
    id: "websiteImportantContent",
    label: "Website Important Content",
    subtitle: "Landing Page, Book Appointment, Referral Page",
    type: "actions", availableActions: ["View", "Edit"],
    needsApproval: true,
    defaults: { admin: ["View", "Edit"], manager: ["View", "Edit"], custom: ["View", "Edit"] },
  },
  {
    id: "seo", label: "SEO",
    type: "actions", availableActions: ["View", "Edit"],
    defaults: { admin: ["View", "Edit"], manager: ["View", "Edit"], custom: ["View", "Edit"] },
  },
  {
    id: "mediaLibrary", label: "Media Library",
    type: "actions", availableActions: ["View", "Create", "Edit", "Delete"],
    needsApproval: true,
    defaults: { admin: ["View", "Create", "Edit", "Delete"], manager: ["View", "Create", "Edit", "Delete"], custom: ["View", "Create", "Edit"] },
  },
  {
    id: "contentManager", label: "Content Manager",
    type: "actions", availableActions: ["View", "Create", "Edit", "Delete"],
    defaults: { admin: ["View", "Create", "Edit", "Delete"], manager: ["View", "Create", "Edit", "Delete"], custom: ["View", "Create", "Edit"] },
  },
  {
    id: "bannerManagement", label: "Banner Management",
    type: "actions", availableActions: ["View", "Create", "Edit", "Delete"],
    needsApproval: true,
    defaults: { admin: ["View", "Create", "Edit", "Delete"], manager: ["View", "Create", "Edit", "Delete"], custom: ["View", "Create", "Edit"] },
  },
  {
    id: "auditReport", label: "Audit Report", type: "toggle",
    defaults: { admin: true, manager: true, custom: false },
  },
  {
    id: "platformSetting", label: "Platform Setting",
    type: "actions", availableActions: ["View"],
    defaults: { admin: ["View"], manager: [], custom: ["View"] },
  },
];

/* ─── Role Definitions ───────────────────────────────────────────────────── */

const ROLE_DEFS = [
  {
    role:    "admin" as UserRole,
    label:   "Admin",
    icon:    Shield,
    desc:    "Full system access. Can manage all settings, content, templates, users, and locations.",
    color:   "border-violet-500 bg-violet-50",
    iconBg:  "bg-violet-100",
    iconClr: "text-violet-600",
    badge:   "bg-violet-100 text-violet-700",
  },
  {
    role:    "manager" as UserRole,
    label:   "Manager",
    icon:    Users,
    desc:    "High-level operational access. Can manage content, users (non-Admin), and clinic settings across assigned locations.",
    color:   "border-blue-500 bg-blue-50",
    iconBg:  "bg-blue-100",
    iconClr: "text-blue-600",
    badge:   "bg-blue-100 text-blue-700",
  },
  {
    role:    "custom" as UserRole,
    label:   "Custom",
    icon:    UserCog,
    desc:    "Restricted to assigned clinics. Can manage team members for specific locations. Requires approval for important content.",
    color:   "border-teal-500 bg-teal-50",
    iconBg:  "bg-teal-100",
    iconClr: "text-teal-600",
    badge:   "bg-teal-100 text-teal-700",
  },
] as const;

/* ─── Location Mock Data ─────────────────────────────────────────────────── */

const MOCK_LOCATIONS = [
  { id: "l1", name: "Luminary Salon & Spa",         city: "Austin, TX" },
  { id: "l2", name: "Bellwood Bistro & Bar",         city: "Portland, OR" },
  { id: "l3", name: "Summit Realty Partners",        city: "Denver, CO" },
  { id: "l4", name: "Harbor City Auto Care",         city: "Seattle, WA" },
  { id: "l5", name: "Midtown Family Health Center",  city: "New York, NY" },
  { id: "l6", name: "Blue Ridge Outdoor & Apparel",  city: "Asheville, NC" },
  { id: "l7", name: "Pawsome Pet Boarding",          city: "Chicago, IL" },
  { id: "l8", name: "Apex Consulting Group",         city: "San Francisco, CA" },
  { id: "l9", name: "Bright Minds Academy",          city: "Boston, MA" },
];

/* ─── Helpers ────────────────────────────────────────────────────────────── */

function buildDefaultPermissions(role: UserRole): Record<string, PermVal> {
  return Object.fromEntries(PERM_DEFS.map((d) => [d.id, d.defaults[role]]));
}

const EMPTY_FORM: FormState = {
  firstName: "", lastName: "", email: "",
  role: null, locationIds: [], permissions: {},
};

const ACTION_ICONS: Record<string, React.ElementType> = {
  View: Eye, Edit: Edit3, Create: Plus, Delete: Trash2,
};

function ActionChip({ action }: { action: string }) {
  const Icon = ACTION_ICONS[action] ?? Check;
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-gray-100 text-gray-700">
      <Icon size={10} aria-hidden="true" /> {action}
    </span>
  );
}

function NeedsApprovalBadge() {
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-200 whitespace-nowrap">
      <AlertTriangle size={10} aria-hidden="true" /> Need Approval
    </span>
  );
}

function roleMeta(role: UserRole) {
  return ROLE_DEFS.find((r) => r.role === role)!;
}

/* ─── Props ──────────────────────────────────────────────────────────────── */

interface InviteUserModalProps {
  open:      boolean;
  onClose:   () => void;
  onInvited: (name: string, email: string, role: UserRole) => void;
}

/* ─── Component ──────────────────────────────────────────────────────────── */

export function InviteUserModal({ open, onClose, onInvited }: InviteUserModalProps) {
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [locSearch, setLocSearch] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [sending, setSending] = useState(false);

  /* Reset on open */
  useEffect(() => {
    if (open) { setStep(1); setForm(EMPTY_FORM); setErrors({}); setLocSearch(""); }
  }, [open]);

  /* When role changes, rebuild default permissions */
  const setRole = (role: UserRole) => {
    setForm((f) => ({
      ...f, role,
      locationIds: role === "admin" ? MOCK_LOCATIONS.map((l) => l.id) : [],
      permissions: buildDefaultPermissions(role),
    }));
  };

  /* ── Validation ── */
  const validateStep1 = () => {
    const e: Record<string, string> = {};
    if (!form.firstName.trim()) e.firstName = "Required";
    if (!form.lastName.trim())  e.lastName  = "Required";
    const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email);
    if (!emailOk) e.email = "Enter a valid email";
    if (!form.role) e.role = "Select a role";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const validateStep2 = () => {
    if (form.role === "admin") return true;
    if (form.locationIds.length === 0) {
      setErrors({ locations: "Select at least one location" });
      return false;
    }
    return true;
  };

  const next = () => {
    setErrors({});
    if (step === 1 && !validateStep1()) return;
    if (step === 2 && !validateStep2()) return;
    setStep((s) => Math.min(s + 1, 4) as 1 | 2 | 3 | 4);
  };

  const back = () => setStep((s) => Math.max(s - 1, 1) as 1 | 2 | 3 | 4);

  const sendInvite = async () => {
    setSending(true);
    await new Promise((r) => setTimeout(r, 900));
    setSending(false);
    onInvited(`${form.firstName} ${form.lastName}`, form.email, form.role!);
    onClose();
  };

  /* ── Permission toggle helpers (Custom only) ── */
  const toggleAction = (permId: string, action: string) => {
    setForm((f) => {
      const cur = f.permissions[permId] as string[];
      const next = cur.includes(action) ? cur.filter((a) => a !== action) : [...cur, action];
      return { ...f, permissions: { ...f.permissions, [permId]: next } };
    });
  };

  const toggleBool = (permId: string) => {
    setForm((f) => ({
      ...f,
      permissions: { ...f.permissions, [permId]: !f.permissions[permId] },
    }));
  };

  /* ── Location helpers ── */
  const toggleLocation = (id: string) => {
    setForm((f) => ({
      ...f,
      locationIds: f.locationIds.includes(id)
        ? f.locationIds.filter((l) => l !== id)
        : [...f.locationIds, id],
    }));
  };

  const filteredLocs = MOCK_LOCATIONS.filter((l) =>
    l.name.toLowerCase().includes(locSearch.toLowerCase()) ||
    l.city.toLowerCase().includes(locSearch.toLowerCase()),
  );

  if (!open) return null;

  const STEPS = ["Basic Info", "Locations", "Permissions", "Review"];

  /* ─────────────────────────────────────────────────────────────────────────
     STEP 1 — Basic Info + Role
  ───────────────────────────────────────────────────────────────────────── */
  const renderStep1 = () => (
    <div className="space-y-6">
      {/* Name row */}
      <div className="grid grid-cols-2 gap-4">
        {(["firstName", "lastName"] as const).map((field) => (
          <div key={field}>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5">
              {field === "firstName" ? "First Name" : "Last Name"} <span className="text-red-500">*</span>
            </label>
            <input
              value={form[field]}
              onChange={(e) => setForm((f) => ({ ...f, [field]: e.target.value }))}
              placeholder={field === "firstName" ? "Sarah" : "Johnson"}
              className={`w-full px-3 py-2.5 text-sm border rounded-lg outline-none transition
                focus:ring-2 focus:ring-teal-500 focus:border-teal-500
                ${errors[field] ? "border-red-400 bg-red-50" : "border-gray-200 bg-white"}`}
            />
            {errors[field] && <p className="mt-1 text-xs text-red-500">{errors[field]}</p>}
          </div>
        ))}
      </div>

      {/* Email */}
      <div>
        <label className="block text-xs font-semibold text-gray-700 mb-1.5">
          Email Address <span className="text-red-500">*</span>
        </label>
        <input
          type="email"
          value={form.email}
          onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
          placeholder="sarah@yourcompany.com"
          className={`w-full px-3 py-2.5 text-sm border rounded-lg outline-none transition
            focus:ring-2 focus:ring-teal-500 focus:border-teal-500
            ${errors.email ? "border-red-400 bg-red-50" : "border-gray-200 bg-white"}`}
        />
        {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email}</p>}
      </div>

      {/* Role selection */}
      <div>
        <label className="block text-xs font-semibold text-gray-700 mb-3">
          User Role <span className="text-red-500">*</span>
        </label>
        <div className="space-y-3">
          {ROLE_DEFS.map((rd) => {
            const Icon     = rd.icon;
            const selected = form.role === rd.role;
            return (
              <button
                key={rd.role}
                type="button"
                onClick={() => setRole(rd.role)}
                className={`w-full flex items-start gap-4 p-4 rounded-xl border-2 text-left transition-all ${
                  selected ? rd.color : "border-gray-200 bg-white hover:border-gray-300"
                }`}
              >
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${
                  selected ? rd.iconBg : "bg-gray-100"
                }`}>
                  <Icon size={18} className={selected ? rd.iconClr : "text-gray-500"} aria-hidden="true" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className={`text-sm font-semibold ${selected ? "text-gray-900" : "text-gray-700"}`}>
                      {rd.label}
                    </p>
                    {selected && (
                      <span className="w-4 h-4 rounded-full bg-teal-600 flex items-center justify-center flex-shrink-0">
                        <Check size={10} className="text-white" aria-hidden="true" />
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{rd.desc}</p>
                </div>
              </button>
            );
          })}
        </div>
        {errors.role && <p className="mt-2 text-xs text-red-500">{errors.role}</p>}
      </div>
    </div>
  );

  /* ─────────────────────────────────────────────────────────────────────────
     STEP 2 — Location Access
  ───────────────────────────────────────────────────────────────────────── */
  const renderStep2 = () => {
    const isAdmin = form.role === "admin";
    return (
      <div className="space-y-4">
        <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
          <div className="flex items-center gap-2 mb-1">
            <MapPin size={14} className="text-teal-600" aria-hidden="true" />
            <p className="text-xs font-semibold text-gray-700">
              {isAdmin ? "Location Count: All" : "Location Count: Multiple / One"}
            </p>
          </div>
          <p className="text-xs text-gray-500 ml-5">
            {isAdmin
              ? "Admins have access to all current and future locations automatically."
              : "Select which locations this user should manage."}
          </p>
        </div>

        {isAdmin ? (
          <div className="space-y-2">
            {MOCK_LOCATIONS.map((loc) => (
              <div key={loc.id} className="flex items-center gap-3 px-4 py-3 bg-teal-50 border border-teal-100 rounded-lg">
                <Check size={14} className="text-teal-600 flex-shrink-0" aria-hidden="true" />
                <div>
                  <p className="text-sm font-medium text-gray-800">{loc.name}</p>
                  <p className="text-xs text-gray-500">{loc.city}</p>
                </div>
              </div>
            ))}
            <p className="text-xs text-gray-400 text-center pt-1">All locations included automatically</p>
          </div>
        ) : (
          <>
            {/* Header + select all */}
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold text-gray-700">
                {form.locationIds.length}/{MOCK_LOCATIONS.length} selected
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setForm((f) => ({ ...f, locationIds: MOCK_LOCATIONS.map((l) => l.id) }))}
                  className="text-xs text-teal-600 hover:text-teal-700 font-medium"
                >
                  Select all
                </button>
                <span className="text-gray-300">·</span>
                <button
                  onClick={() => setForm((f) => ({ ...f, locationIds: [] }))}
                  className="text-xs text-gray-400 hover:text-gray-600 font-medium"
                >
                  Clear
                </button>
              </div>
            </div>

            {/* Search */}
            <input
              value={locSearch}
              onChange={(e) => setLocSearch(e.target.value)}
              placeholder="Search locations…"
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
            />

            {/* Location list */}
            <div className="space-y-1.5 max-h-72 overflow-y-auto pr-1">
              {filteredLocs.map((loc) => {
                const checked = form.locationIds.includes(loc.id);
                return (
                  <button
                    key={loc.id}
                    type="button"
                    onClick={() => toggleLocation(loc.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg border transition-all text-left ${
                      checked
                        ? "border-teal-300 bg-teal-50"
                        : "border-gray-200 bg-white hover:border-gray-300"
                    }`}
                  >
                    <div className={`w-4 h-4 rounded border-2 flex-shrink-0 flex items-center justify-center transition-colors ${
                      checked ? "bg-teal-600 border-teal-600" : "border-gray-300"
                    }`}>
                      {checked && <Check size={10} className="text-white" aria-hidden="true" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-800 truncate">{loc.name}</p>
                      <p className="text-xs text-gray-500">{loc.city}</p>
                    </div>
                    <Building2 size={14} className="text-gray-300 flex-shrink-0" aria-hidden="true" />
                  </button>
                );
              })}
            </div>

            {errors.locations && (
              <p className="text-xs text-red-500">{errors.locations}</p>
            )}
          </>
        )}
      </div>
    );
  };

  /* ─────────────────────────────────────────────────────────────────────────
     STEP 3 — Permissions
  ───────────────────────────────────────────────────────────────────────── */
  const renderStep3 = () => {
    const role     = form.role!;
    const isCustom = role === "custom";

    return (
      <div className="space-y-3">
        {!isCustom && (
          <div className="bg-blue-50 border border-blue-100 rounded-lg px-4 py-3 text-xs text-blue-700 flex items-start gap-2">
            <Shield size={14} className="flex-shrink-0 mt-0.5" aria-hidden="true" />
            <span>Permissions for <strong>{roleMeta(role).label}</strong> are pre-configured. They cannot be changed at invite time.</span>
          </div>
        )}
        {isCustom && (
          <div className="bg-amber-50 border border-amber-100 rounded-lg px-4 py-3 text-xs text-amber-800 flex items-start gap-2">
            <AlertTriangle size={14} className="flex-shrink-0 mt-0.5" aria-hidden="true" />
            <span>Items marked <strong>Need Approval</strong> will require an admin to approve before changes go live.</span>
          </div>
        )}

        <div className="divide-y divide-gray-100 border border-gray-200 rounded-xl overflow-hidden">
          {PERM_DEFS.map((def) => {
            const val        = form.permissions[def.id];
            const showApproval = isCustom && def.needsApproval;

            return (
              <div key={def.id} className="px-4 py-3 flex items-start gap-3 bg-white hover:bg-gray-50/60 transition-colors">

                {/* Label */}
                <div className="flex-1 min-w-0 pt-0.5">
                  <p className="text-xs font-semibold text-gray-800">{def.label}</p>
                  {def.subtitle && (
                    <p className="text-[11px] text-gray-400 mt-0.5 leading-snug">{def.subtitle}</p>
                  )}
                  {showApproval && (
                    <div className="mt-1.5">
                      <NeedsApprovalBadge />
                    </div>
                  )}
                </div>

                {/* Value */}
                <div className="flex-shrink-0 flex items-start pt-0.5">
                  {def.type === "toggle" ? (
                    isCustom ? (
                      /* Editable toggle */
                      <button
                        type="button"
                        onClick={() => toggleBool(def.id)}
                        className={`relative inline-flex w-9 h-5 rounded-full transition-colors flex-shrink-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 ${
                          val ? "bg-teal-600" : "bg-gray-200"
                        }`}
                        aria-checked={!!val}
                        role="switch"
                      >
                        <span className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${val ? "translate-x-4" : ""}`} />
                      </button>
                    ) : (
                      /* Read-only */
                      val
                        ? <span className="text-xs font-semibold text-emerald-600 flex items-center gap-1"><Check size={13} /> Yes</span>
                        : <span className="text-xs font-semibold text-gray-400">No</span>
                    )
                  ) : (
                    /* Actions — read-only for Admin/Manager, editable for Custom */
                    role === "admin" ? (
                      <span className="text-xs font-semibold text-emerald-600 flex items-center gap-1"><Check size={13} /> Full access</span>
                    ) : (
                      <div className="flex flex-wrap gap-1 justify-end">
                        {def.availableActions!.map((action) => {
                          const actions  = val as string[];
                          const selected = actions.includes(action);

                          if (isCustom) {
                            return (
                              <button
                                key={action}
                                type="button"
                                onClick={() => toggleAction(def.id, action)}
                                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium transition-colors ${
                                  selected
                                    ? "bg-teal-600 text-white"
                                    : "bg-gray-100 text-gray-400 hover:bg-gray-200"
                                }`}
                              >
                                {React.createElement(ACTION_ICONS[action] ?? Check, { size: 9, "aria-hidden": true })}
                                {action}
                              </button>
                            );
                          }

                          /* Manager read-only */
                          return selected ? <ActionChip key={action} action={action} /> : null;
                        })}
                        {(val as string[]).length === 0 && !isCustom && (
                          <span className="text-xs text-gray-400">No access</span>
                        )}
                      </div>
                    )
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  /* ─────────────────────────────────────────────────────────────────────────
     STEP 4 — Review & Send
  ───────────────────────────────────────────────────────────────────────── */
  const renderStep4 = () => {
    const role = form.role!;
    const meta = roleMeta(role);
    const Icon = meta.icon;

    const selectedLocs = MOCK_LOCATIONS.filter((l) => form.locationIds.includes(l.id));

    const enabledPerms = PERM_DEFS.filter((def) => {
      const val = form.permissions[def.id];
      if (typeof val === "boolean") return val;
      return (val as string[]).length > 0;
    });

    return (
      <div className="space-y-4">

        {/* User card */}
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center flex-shrink-0 shadow-sm">
              <span className="text-white text-sm font-bold select-none">
                {form.firstName.charAt(0).toUpperCase()}{form.lastName.charAt(0).toUpperCase()}
              </span>
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-900">{form.firstName} {form.lastName}</p>
              <p className="text-xs text-gray-500">{form.email}</p>
            </div>
            <span className={`ml-auto inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${meta.badge}`}>
              <Icon size={12} aria-hidden="true" /> {meta.label}
            </span>
          </div>
        </div>

        {/* Locations */}
        <div className="border border-gray-200 rounded-xl overflow-hidden">
          <div className="px-4 py-2.5 bg-gray-50 border-b border-gray-100 flex items-center gap-2">
            <MapPin size={13} className="text-gray-500" aria-hidden="true" />
            <p className="text-xs font-semibold text-gray-700">
              Locations ({role === "admin" ? "All" : selectedLocs.length})
            </p>
          </div>
          <div className="px-4 py-3 flex flex-wrap gap-2">
            {role === "admin"
              ? <span className="text-xs text-emerald-600 font-medium flex items-center gap-1"><Check size={12} /> All locations</span>
              : selectedLocs.map((l) => (
                  <span key={l.id} className="px-2.5 py-1 bg-blue-50 text-blue-700 text-xs font-medium rounded-full">
                    {l.name}
                  </span>
                ))
            }
          </div>
        </div>

        {/* Permissions summary */}
        <div className="border border-gray-200 rounded-xl overflow-hidden">
          <div className="px-4 py-2.5 bg-gray-50 border-b border-gray-100 flex items-center gap-2">
            <Shield size={13} className="text-gray-500" aria-hidden="true" />
            <p className="text-xs font-semibold text-gray-700">
              Permissions ({enabledPerms.length}/{PERM_DEFS.length} enabled)
            </p>
          </div>
          <div className="px-4 py-3 grid grid-cols-2 gap-x-4 gap-y-2">
            {enabledPerms.map((def) => (
              <div key={def.id} className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-teal-500 flex-shrink-0" />
                <span className="text-xs text-gray-700 truncate">{def.label}</span>
                {def.needsApproval && role === "custom" && (
                  <AlertTriangle size={10} className="text-amber-500 flex-shrink-0" aria-hidden="true" />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Invite notice */}
        <div className="bg-teal-50 border border-teal-100 rounded-xl px-4 py-3 text-xs text-teal-800 flex items-start gap-2">
          <Send size={13} className="flex-shrink-0 mt-0.5" aria-hidden="true" />
          <span>
            An invitation email will be sent to <strong>{form.email}</strong>. They'll set their password on first login.
          </span>
        </div>
      </div>
    );
  };

  /* ─────────────────────────────────────────────────────────────────────────
     Render
  ───────────────────────────────────────────────────────────────────────── */
  return (
    <div className="fixed inset-0 z-50 flex">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Panel — slides in from right */}
      <div className="absolute right-0 top-0 h-full w-full max-w-[580px] bg-white shadow-2xl flex flex-col">

        {/* ── Header ── */}
        <div className="px-6 pt-5 pb-4 border-b border-gray-100 flex-shrink-0">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-semibold text-gray-900">Invite User</h2>
              <p className="text-xs text-gray-400 mt-0.5">Step {step} of {STEPS.length}</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              aria-label="Close"
            >
              <X size={18} className="text-gray-500" aria-hidden="true" />
            </button>
          </div>

          {/* Step progress */}
          <div className="flex items-center gap-2">
            {STEPS.map((label, i) => {
              const n       = i + 1;
              const done    = n < step;
              const current = n === step;
              return (
                <React.Fragment key={label}>
                  <div className="flex items-center gap-1.5">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold flex-shrink-0 transition-colors ${
                      done    ? "bg-teal-600 text-white"
                      : current ? "bg-teal-600 text-white ring-4 ring-teal-100"
                      : "bg-gray-100 text-gray-400"
                    }`}>
                      {done ? <Check size={12} aria-hidden="true" /> : n}
                    </div>
                    <span className={`text-[11px] font-medium whitespace-nowrap ${current ? "text-teal-700" : "text-gray-400"}`}>
                      {label}
                    </span>
                  </div>
                  {i < STEPS.length - 1 && (
                    <div className={`flex-1 h-px transition-colors ${done ? "bg-teal-400" : "bg-gray-200"}`} />
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>

        {/* ── Scrollable content ── */}
        <div className="flex-1 overflow-y-auto px-6 py-5">
          {step === 1 && renderStep1()}
          {step === 2 && renderStep2()}
          {step === 3 && renderStep3()}
          {step === 4 && renderStep4()}
        </div>

        {/* ── Footer buttons ── */}
        <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between flex-shrink-0 bg-white">
          <button
            onClick={step === 1 ? onClose : back}
            className="flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
          >
            {step === 1 ? (
              "Cancel"
            ) : (
              <><ChevronLeft size={15} aria-hidden="true" /> Back</>
            )}
          </button>

          {step < 4 ? (
            <button
              onClick={next}
              className="flex items-center gap-1.5 px-5 py-2.5 text-sm font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-lg transition-colors"
            >
              Continue <ChevronRight size={15} aria-hidden="true" />
            </button>
          ) : (
            <button
              onClick={sendInvite}
              disabled={sending}
              className="flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-lg transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {sending ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin flex-shrink-0" aria-hidden="true" />
                  Sending…
                </>
              ) : (
                <><Send size={14} aria-hidden="true" /> Send Invitation</>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
