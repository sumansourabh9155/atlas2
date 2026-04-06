/**
 * InviteUserPage — Full-page invite flow.
 *
 * Layout:
 *  - Sticky top bar: back button + title + Send Invitation CTA
 *  - Section 1: Basic info (name, email)
 *  - Section 2: Role & Permissions comparison table
 *      · All 3 roles shown side-by-side (Admin / Manager / Custom)
 *      · Click a role header to select it (column highlights teal)
 *      · Custom column always shows dropdowns for granular control
 *      · Admin & Manager columns show read-only preset values
 *  - Section 3: Location access
 */

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft, Send, Shield, Users, UserCog,
  Check, MapPin, Building2, AlertTriangle, Search,
  ChevronDown,
} from "lucide-react";

/* ─── Types ──────────────────────────────────────────────────────────────── */

type UserRole = "admin" | "manager" | "custom";

interface PermOption { label: string; value: string[] | boolean }

interface PermDef {
  id:              string;
  label:           string;
  subtitle?:       string;
  controlType:      "dropdown" | "checkboxes"; // Custom column control
  options?:         PermOption[];             // dropdown options (dropdown type only)
  availableActions?: string[];               // checkbox labels (checkboxes type only)
  adminDisplay:    string;                    // static text for Admin column
  managerDisplay:  string;                    // static text for Manager column
  needsApproval?:  boolean;                  // Custom only — system constraint
}

/* ─── Permission Definitions ─────────────────────────────────────────────── */

const OPT_BOOL: PermOption[] = [{ label: "No Access", value: false }, { label: "Yes", value: true }];
// OPT_BOOL kept for type-compat; used only for dropdown controlType rows

const OPT_VIEW: PermOption[] = [
  { label: "No Access",  value: []             },
  { label: "View Only",  value: ["View"]       },
  { label: "Edit & View",value: ["View","Edit"]},
];

const OPT_CRUD: PermOption[] = [
  { label: "No Access",    value: []                              },
  { label: "View Only",    value: ["View"]                        },
  { label: "Create & Edit",value: ["View", "Create", "Edit"]     },
  { label: "Full Access",  value: ["View", "Create", "Edit", "Delete"] },
];

const OPT_PLATFORM: PermOption[] = [
  { label: "No Access", value: []       },
  { label: "View Only", value: ["View"] },
];

const PERM_DEFS: PermDef[] = [
  { id: "dashboard",               label: "Dashboard",                controlType: "dropdown",   options: OPT_BOOL, adminDisplay: "Yes",         managerDisplay: "Yes"         },
  { id: "createClinic",            label: "Create Clinic",            controlType: "dropdown",   options: OPT_BOOL, adminDisplay: "Yes",         managerDisplay: "No Access"   },
  { id: "locationDetail",          label: "Location Detail",          subtitle: "Name, Logo, Location, Contact, Operation Hours, Integration & Footer",
                                                                       controlType: "dropdown",   options: OPT_VIEW, adminDisplay: "Full Access", managerDisplay: "Edit & View" },
  { id: "linkServices",            label: "Link Services + Team + Hrs",
                                                                       controlType: "dropdown",   options: OPT_VIEW, adminDisplay: "Full Access", managerDisplay: "Edit & View", needsApproval: true },
  { id: "navigation",              label: "Navigation",               controlType: "dropdown",   options: OPT_VIEW, adminDisplay: "Full Access", managerDisplay: "Edit & View" },
  { id: "websiteContent",          label: "Website Content",          subtitle: "All pages except 3 important pages",
                                                                       controlType: "dropdown",   options: OPT_VIEW, adminDisplay: "Full Access", managerDisplay: "Edit & View" },
  { id: "websiteImportantContent", label: "Website Important Content", subtitle: "Landing Page, Book Appointment, Referral Page",
                                                                       controlType: "dropdown",   options: OPT_VIEW, adminDisplay: "Full Access", managerDisplay: "Edit & View", needsApproval: true },
  { id: "seo",                     label: "SEO",                      controlType: "dropdown",   options: OPT_VIEW, adminDisplay: "Full Access", managerDisplay: "Edit & View" },
  { id: "mediaLibrary",            label: "Media Library",            controlType: "dropdown",   options: OPT_CRUD, adminDisplay: "Full Access", managerDisplay: "Full Access", needsApproval: true },
  { id: "contentManager",          label: "Content Manager",          controlType: "dropdown",   options: OPT_CRUD, adminDisplay: "Full Access", managerDisplay: "Full Access" },
  { id: "bannerManagement",        label: "Banner Management",        controlType: "dropdown",   options: OPT_CRUD, adminDisplay: "Full Access", managerDisplay: "Full Access", needsApproval: true },
  { id: "auditReport",             label: "Audit Report",             controlType: "dropdown",   options: OPT_BOOL, adminDisplay: "Yes",         managerDisplay: "Yes"         },
  { id: "platformSetting",         label: "Platform Setting",         controlType: "dropdown",   options: OPT_PLATFORM, adminDisplay: "Full Access", managerDisplay: "No Access" },
  { id: "domainManagement",        label: "Domain Management",        subtitle: "Add, verify, and manage custom domains across locations",
                                                                       controlType: "dropdown",   options: OPT_VIEW, adminDisplay: "Full Access", managerDisplay: "No Access" },
];

/* Default Custom permission values */
const CUSTOM_DEFAULTS: Record<string, string[] | boolean> = {
  dashboard:               false,
  createClinic:            false,
  locationDetail:          ["View"],
  linkServices:            ["View", "Edit"],
  navigation:              ["View"],
  websiteContent:          ["View", "Edit"],
  websiteImportantContent: ["View", "Edit"],
  seo:                     ["View", "Edit"],
  mediaLibrary:            ["View", "Create", "Edit"],
  contentManager:          ["View", "Create", "Edit"],
  bannerManagement:        ["View", "Create", "Edit"],
  auditReport:             false,
  platformSetting:         ["View"],
  domainManagement:        [],
};

/* ─── Locations ──────────────────────────────────────────────────────────── */

const LOCATIONS = [
  { id: "l1", name: "Luminary Salon & Spa",         city: "Austin, TX"         },
  { id: "l2", name: "Bellwood Bistro & Bar",         city: "Portland, OR"       },
  { id: "l3", name: "Summit Realty Partners",        city: "Denver, CO"         },
  { id: "l4", name: "Harbor City Auto Care",         city: "Seattle, WA"        },
  { id: "l5", name: "Midtown Family Health Center",  city: "New York, NY"       },
  { id: "l6", name: "Blue Ridge Outdoor & Apparel",  city: "Asheville, NC"      },
  { id: "l7", name: "Pawsome Pet Boarding",          city: "Chicago, IL"        },
  { id: "l8", name: "Apex Consulting Group",         city: "San Francisco, CA"  },
  { id: "l9", name: "Bright Minds Academy",          city: "Boston, MA"         },
];

/* ─── Role meta ──────────────────────────────────────────────────────────── */

const ROLE_META = {
  admin: {
    icon:    Shield,
    label:   "Admin",
    desc:    "Full system access. Manages all settings, content, templates, users, and locations.",
    selBg:   "bg-violet-600",
    selText: "text-white",
    ringBg:  "bg-violet-50",
    ring:    "ring-2 ring-violet-500",
    badge:   "bg-violet-100 text-violet-700",
    col:     "bg-violet-50/40",
  },
  manager: {
    icon:    Users,
    label:   "Manager",
    desc:    "High-level operational access. Manages content, users (non-Admin), and assigned clinic settings.",
    selBg:   "bg-blue-600",
    selText: "text-white",
    ringBg:  "bg-blue-50",
    ring:    "ring-2 ring-blue-500",
    badge:   "bg-blue-100 text-blue-700",
    col:     "bg-blue-50/40",
  },
  custom: {
    icon:    UserCog,
    label:   "Custom",
    desc:    "Restricted access to assigned clinics only. Important content requires approval to publish.",
    selBg:   "bg-teal-600",
    selText: "text-white",
    ringBg:  "bg-teal-50",
    ring:    "ring-2 ring-teal-500",
    badge:   "bg-teal-100 text-teal-700",
    col:     "bg-teal-50/40",
  },
} as const;

/* ─── Helpers ────────────────────────────────────────────────────────────── */

function displayValue(val: string[] | boolean | undefined): string {
  if (val === true)  return "Yes";
  if (val === false) return "No Access";
  if (!val || (Array.isArray(val) && val.length === 0)) return "No Access";
  const arr = val as string[];
  if (arr.includes("Delete"))                      return "Full Access";
  if (arr.includes("Create"))                      return "Create & Edit";
  if (arr.includes("Edit"))                        return "Edit & View";
  if (arr.includes("View"))                        return "View Only";
  return "No Access";
}


const INPUT = "w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 bg-white";

/* ─── Component ──────────────────────────────────────────────────────────── */

export function InviteUserPage() {
  const navigate = useNavigate();

  /* Form state */
  const [firstName,   setFirstName]   = useState("");
  const [lastName,    setLastName]    = useState("");
  const [email,       setEmail]       = useState("");
  const [role,        setRole]        = useState<UserRole>("manager");
  const [customPerms, setCustomPerms] = useState<Record<string, string[] | boolean>>(CUSTOM_DEFAULTS);
  const [locationIds, setLocationIds] = useState<string[]>([]);
  const [locSearch,   setLocSearch]   = useState("");
  const [errors,      setErrors]      = useState<Record<string, string>>({});
  const [sending,     setSending]     = useState(false);

  const handleRoleChange = (r: UserRole) => {
    setRole(r);
    if (r === "admin") setLocationIds(LOCATIONS.map((l) => l.id));
    else if (r !== role) setLocationIds([]);
  };

const toggleLocation = (id: string) => {
    if (role === "admin") return;
    setLocationIds((prev) =>
      prev.includes(id) ? prev.filter((l) => l !== id) : [...prev, id],
    );
  };

  const validate = () => {
    const e: Record<string, string> = {};
    if (!firstName.trim()) e.firstName = "Required";
    if (!lastName.trim())  e.lastName  = "Required";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) e.email = "Enter a valid email";
    if (role !== "admin" && locationIds.length === 0) e.locations = "Select at least one location";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSend = async () => {
    if (!validate()) return;
    setSending(true);
    await new Promise((r) => setTimeout(r, 900));
    setSending(false);
    navigate("/users", { state: { invited: `${firstName} ${lastName}` } });
  };

  const filteredLocs = LOCATIONS.filter(
    (l) =>
      l.name.toLowerCase().includes(locSearch.toLowerCase()) ||
      l.city.toLowerCase().includes(locSearch.toLowerCase()),
  );

  const roles: UserRole[] = ["admin", "manager", "custom"];

  /* ── Render ── */
  return (
    <div className="flex-1 overflow-y-auto bg-gray-50 flex flex-col">

      {/* ── Sticky top bar ── */}
      <div className="sticky top-0 z-20 bg-white border-b border-gray-200 px-6 h-14 flex items-center justify-between flex-shrink-0">
        <button
          onClick={() => navigate("/users")}
          className="flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft size={16} aria-hidden="true" />
          Back to Users
        </button>

        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            {firstName || lastName
              ? <p className="text-sm font-medium text-gray-900">{firstName} {lastName}</p>
              : <p className="text-sm text-gray-400">Enter name & email below</p>}
            {role && (
              <p className="text-xs text-gray-400">
                {ROLE_META[role].label} · {role === "admin" ? "All locations" : `${locationIds.length} location${locationIds.length !== 1 ? "s" : ""}`}
              </p>
            )}
          </div>

          <button
            onClick={handleSend}
            disabled={sending}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-lg transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {sending ? (
              <>
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" aria-hidden="true" />
                Sending…
              </>
            ) : (
              <><Send size={14} aria-hidden="true" /> Send Invitation</>
            )}
          </button>
        </div>
      </div>

      {/* ── Page content ── */}
      <div className="flex-1 px-6 py-6 max-w-6xl mx-auto w-full space-y-5">

        {/* ── Section 1: Basic Info ── */}
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100">
            <h2 className="text-sm font-semibold text-gray-900">Basic Information</h2>
            <p className="text-xs text-gray-400 mt-0.5">The invitation will be sent to this email address</p>
          </div>
          <div className="px-6 py-5 grid grid-cols-3 gap-4">
            {/* First name */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                First Name <span className="text-red-500">*</span>
              </label>
              <input
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="Sarah"
                className={`${INPUT} ${errors.firstName ? "border-red-400 bg-red-50" : ""}`}
              />
              {errors.firstName && <p className="mt-1 text-xs text-red-500">{errors.firstName}</p>}
            </div>
            {/* Last name */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                Last Name <span className="text-red-500">*</span>
              </label>
              <input
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="Johnson"
                className={`${INPUT} ${errors.lastName ? "border-red-400 bg-red-50" : ""}`}
              />
              {errors.lastName && <p className="mt-1 text-xs text-red-500">{errors.lastName}</p>}
            </div>
            {/* Email */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                Email Address <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="sarah@company.com"
                className={`${INPUT} ${errors.email ? "border-red-400 bg-red-50" : ""}`}
              />
              {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email}</p>}
            </div>
          </div>
        </div>

        {/* ── Section 2: Role & Permissions table ── */}
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100">
            <h2 className="text-sm font-semibold text-gray-900">Role & Permissions</h2>
            <p className="text-xs text-gray-400 mt-0.5">
              Select a role — all three are shown side by side so you can see exactly what each level can do
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse">

              {/* ── Column headers = role selector cards ── */}
              <thead>
                <tr>
                  {/* Permission label column */}
                  <th className="w-[240px] text-left px-5 py-4 bg-gray-50 border-b border-r border-gray-200 align-bottom">
                    <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Permission</span>
                  </th>

                  {roles.map((r) => {
                    const meta     = ROLE_META[r];
                    const Icon     = meta.icon;
                    const selected = role === r;
                    return (
                      <th
                        key={r}
                        className={`text-left px-5 py-0 border-b border-gray-200 ${r !== "custom" ? "border-r" : ""} cursor-pointer transition-colors ${selected ? meta.col : "bg-gray-50 hover:bg-gray-100/60"}`}
                        onClick={() => handleRoleChange(r)}
                      >
                        <div className="py-4">
                          {/* Role card */}
                          <div className={`rounded-xl p-4 transition-all ${selected ? `${meta.selBg} shadow-sm` : "bg-white border border-gray-200 hover:border-gray-300"}`}>
                            <div className="flex items-center gap-2 mb-2">
                              <Icon size={16} className={selected ? "text-white" : "text-gray-500"} aria-hidden="true" />
                              <span className={`text-sm font-bold ${selected ? "text-white" : "text-gray-800"}`}>{meta.label}</span>
                              {selected && (
                                <span className="ml-auto text-[10px] font-semibold bg-white/20 text-white px-2 py-0.5 rounded-full">
                                  Selected
                                </span>
                              )}
                            </div>
                            <p className={`text-[11px] leading-relaxed ${selected ? "text-white/80" : "text-gray-400"}`}>{meta.desc}</p>
                          </div>
                          {!selected && (
                            <button
                              onClick={(e) => { e.stopPropagation(); handleRoleChange(r); }}
                              className="mt-2.5 w-full py-1.5 text-xs font-semibold text-teal-600 border border-teal-200 rounded-lg hover:bg-teal-50 transition-colors bg-white"
                            >
                              Select role
                            </button>
                          )}
                        </div>
                      </th>
                    );
                  })}
                </tr>
              </thead>

              {/* ── Permission rows ── */}
              <tbody>
                {PERM_DEFS.map((def, i) => {
                  const isEven = i % 2 === 0;
                  const rowBg  = isEven ? "" : "bg-gray-50/50";
                  const curCustomVal = customPerms[def.id];

                  return (
                    <tr key={def.id} className={`${rowBg} border-b border-gray-100 last:border-0`}>

                      {/* Permission name */}
                      <td className="px-5 py-3.5 border-r border-gray-100 align-top">
                        <p className="text-xs font-semibold text-gray-800 leading-snug">{def.label}</p>
                        {def.subtitle && (
                          <p className="text-[10px] text-gray-400 mt-0.5 leading-snug">{def.subtitle}</p>
                        )}
                      </td>

                      {/* Admin column */}
                      <td className={`px-5 py-3.5 border-r border-gray-100 align-top transition-colors ${role === "admin" ? ROLE_META.admin.col : ""}`}>
                        <span className="text-xs font-semibold text-emerald-600">{def.adminDisplay}</span>
                      </td>

                      {/* Manager column */}
                      <td className={`px-5 py-3.5 border-r border-gray-100 align-top transition-colors ${role === "manager" ? ROLE_META.manager.col : ""}`}>
                        <span className={`text-xs font-semibold ${def.managerDisplay === "No Access" ? "text-gray-400" : "text-gray-700"}`}>
                          {def.managerDisplay}
                        </span>
                      </td>

                      {/* Custom column — dropdown for boolean, checkboxes for actions */}
                      <td className={`px-5 py-3.5 align-top transition-colors ${role === "custom" ? ROLE_META.custom.col : ""}`}>
                        <div className="relative">
                          <select
                            value={def.options!.findIndex((o) => {
                              if (typeof o.value === "boolean") return o.value === curCustomVal;
                              if (typeof curCustomVal === "boolean") return false;
                              return [...(o.value as string[])].sort().join() === [...(curCustomVal as string[])].sort().join();
                            })}
                            onChange={(e) => {
                              const opt = def.options![Number(e.target.value)];
                              setCustomPerms((p) => ({ ...p, [def.id]: opt.value }));
                            }}
                            disabled={role !== "custom"}
                            className={`w-full appearance-none pl-3 pr-8 py-1.5 text-xs font-medium rounded-lg border transition-colors outline-none
                              ${role === "custom"
                                ? "border-gray-300 bg-white text-gray-800 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 cursor-pointer"
                                : "border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed"
                              }`}
                          >
                            {def.options!.map((opt, idx) => (
                              <option key={idx} value={idx}>{opt.label}</option>
                            ))}
                          </select>
                          <ChevronDown
                            size={12}
                            className={`absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none ${role === "custom" ? "text-gray-500" : "text-gray-300"}`}
                            aria-hidden="true"
                          />
                        </div>
                        {def.needsApproval && role === "custom" && (
                          <div className="flex items-center gap-1 mt-1.5">
                            <AlertTriangle size={10} className="text-amber-500 flex-shrink-0" aria-hidden="true" />
                            <span className="text-[10px] text-amber-600 font-medium">Requires approval</span>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* ── Section 3: Location Access ── */}
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-semibold text-gray-900">Location Access</h2>
              <p className="text-xs text-gray-400 mt-0.5">
                {role === "admin"
                  ? "Admins automatically have access to all locations"
                  : "Choose which locations this user can manage"}
              </p>
            </div>
            {role !== "admin" && (
              <div className="flex items-center gap-3">
                <span className="text-xs text-gray-400">{locationIds.length}/{LOCATIONS.length} selected</span>
                <button onClick={() => setLocationIds(LOCATIONS.map((l) => l.id))} className="text-xs text-teal-600 hover:text-teal-700 font-medium">Select all</button>
                <button onClick={() => setLocationIds([])} className="text-xs text-gray-400 hover:text-gray-600 font-medium">Clear</button>
              </div>
            )}
          </div>

          <div className="p-5">
            {role === "admin" ? (
              <div className="grid grid-cols-3 gap-2">
                {LOCATIONS.map((loc) => (
                  <div key={loc.id} className="flex items-center gap-2.5 px-3 py-2.5 bg-teal-50 border border-teal-100 rounded-lg">
                    <Check size={13} className="text-teal-600 flex-shrink-0" aria-hidden="true" />
                    <div className="min-w-0">
                      <p className="text-xs font-medium text-gray-800 truncate">{loc.name}</p>
                      <p className="text-[10px] text-gray-400">{loc.city}</p>
                    </div>
                  </div>
                ))}
                <div className="flex items-center justify-center px-3 py-2.5 bg-gray-50 border border-dashed border-gray-200 rounded-lg">
                  <span className="text-[10px] text-gray-400">+ future locations</span>
                </div>
              </div>
            ) : (
              <>
                <div className="relative mb-3">
                  <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" aria-hidden="true" />
                  <input
                    value={locSearch}
                    onChange={(e) => setLocSearch(e.target.value)}
                    placeholder="Search locations…"
                    className="w-full pl-8 pr-4 py-2 text-sm border border-gray-200 rounded-lg bg-white outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                  />
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {filteredLocs.map((loc) => {
                    const checked = locationIds.includes(loc.id);
                    return (
                      <button
                        key={loc.id}
                        type="button"
                        onClick={() => toggleLocation(loc.id)}
                        className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg border text-left transition-all ${
                          checked ? "border-teal-300 bg-teal-50" : "border-gray-200 bg-white hover:border-gray-300"
                        }`}
                      >
                        <div className={`w-4 h-4 rounded border-2 flex-shrink-0 flex items-center justify-center transition-colors ${
                          checked ? "bg-teal-600 border-teal-600" : "border-gray-300"
                        }`}>
                          {checked && <Check size={9} className="text-white" aria-hidden="true" />}
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-medium text-gray-800 truncate">{loc.name}</p>
                          <p className="text-[10px] text-gray-400">{loc.city}</p>
                        </div>
                        <Building2 size={12} className="text-gray-200 flex-shrink-0 ml-auto" aria-hidden="true" />
                      </button>
                    );
                  })}
                </div>
                {errors.locations && (
                  <p className="mt-2 text-xs text-red-500">{errors.locations}</p>
                )}
              </>
            )}
          </div>
        </div>

        {/* Bottom send button */}
        <div className="flex justify-end pb-6">
          <button
            onClick={handleSend}
            disabled={sending}
            className="inline-flex items-center gap-2 px-6 py-2.5 text-sm font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-lg transition-colors shadow-sm disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {sending ? (
              <>
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" aria-hidden="true" />
                Sending Invitation…
              </>
            ) : (
              <><Send size={14} aria-hidden="true" /> Send Invitation</>
            )}
          </button>
        </div>

      </div>
    </div>
  );
}
