/**
 * Group Clinic Page
 * Left rail: clinic groups | Right: member clinics table
 * Design system: SiteStatusBadge, Badge, SearchInput, RowActionMenu, ConfirmDialog, Toast
 */

import React, { useState } from "react";
import {
  Plus, ArrowUp, ArrowDown, ArrowUpDown,
  Building2, Users, CheckCircle2, Edit2, Trash2,
  Globe, ChevronDown,
} from "lucide-react";
import { SiteStatusBadge, Badge, SearchInput } from "../ui";
import { ConfirmDialog, type ConfirmState } from "../ui/ConfirmDialog";
import { ToastContainer, useToast } from "../ui/Toast";
import { RowActionMenu, type RowAction } from "../ui/RowActionMenu";

/* ── Types ─────────────────────────────────────────────────────────────────── */

type ClinicStatus = "published" | "scheduled" | "draft" | "live_domain";

interface MemberClinic {
  id: string;
  name: string;
  memberType: "Primary" | "Member";
  hospitalType: string;
  city: string;
  state: string;
  status: ClinicStatus;
}

interface ClinicGroup {
  id: string;
  name: string;
  members: MemberClinic[];
}

/* ── Data ───────────────────────────────────────────────────────────────────── */

const GROUPS: ClinicGroup[] = [
  {
    id: "g1", name: "PawsCare Network",
    members: [
      { id: "c1",  name: "PawsCare Austin Central",      memberType: "Primary", hospitalType: "General Practitioner", city: "Austin",        state: "Texas",       status: "live_domain" },
      { id: "c2",  name: "PawsCare Dallas Uptown",        memberType: "Member",  hospitalType: "General Practitioner", city: "Dallas",        state: "Texas",       status: "published"   },
      { id: "c3",  name: "PawsCare Houston Heights",      memberType: "Member",  hospitalType: "General Practitioner", city: "Houston",       state: "Texas",       status: "published"   },
      { id: "c4",  name: "PawsCare San Antonio Loop",     memberType: "Member",  hospitalType: "General Practitioner", city: "San Antonio",   state: "Texas",       status: "scheduled"   },
      { id: "c5",  name: "PawsCare Fort Worth",           memberType: "Member",  hospitalType: "General Practitioner", city: "Fort Worth",    state: "Texas",       status: "draft"       },
    ],
  },
  {
    id: "g2", name: "Urban Veterinary Alliance",
    members: [
      { id: "c6",  name: "Urban Vet Manhattan",           memberType: "Primary", hospitalType: "Specialty Referral",   city: "Manhattan",     state: "New York",    status: "live_domain" },
      { id: "c7",  name: "Urban Vet Brooklyn",            memberType: "Member",  hospitalType: "General Practitioner", city: "Brooklyn",      state: "New York",    status: "published"   },
      { id: "c8",  name: "Urban Vet Chicago River North", memberType: "Member",  hospitalType: "General Practitioner", city: "Chicago",       state: "Illinois",    status: "published"   },
      { id: "c9",  name: "Urban Vet Los Angeles Midtown", memberType: "Member",  hospitalType: "Specialty Referral",   city: "Los Angeles",   state: "California",  status: "scheduled"   },
    ],
  },
  {
    id: "g3", name: "Coastal Veterinary Group",
    members: [
      { id: "c10", name: "Coastal San Diego Bay",         memberType: "Primary", hospitalType: "General Practitioner", city: "San Diego",     state: "California",  status: "live_domain" },
      { id: "c11", name: "Coastal Los Angeles Westside",  memberType: "Member",  hospitalType: "General Practitioner", city: "Los Angeles",   state: "California",  status: "published"   },
      { id: "c12", name: "Coastal San Francisco Marina",  memberType: "Member",  hospitalType: "General Practitioner", city: "San Francisco", state: "California",  status: "published"   },
      { id: "c13", name: "Coastal Santa Barbara",         memberType: "Member",  hospitalType: "General Practitioner", city: "Santa Barbara", state: "California",  status: "draft"       },
      { id: "c14", name: "Coastal Seattle Waterfront",    memberType: "Member",  hospitalType: "Emergency",            city: "Seattle",       state: "Washington",  status: "scheduled"   },
    ],
  },
  {
    id: "g4", name: "Parkside Pet Care",
    members: [
      { id: "c15", name: "Parkside Denver Central",       memberType: "Primary", hospitalType: "General Practitioner", city: "Denver",        state: "Colorado",    status: "published"   },
      { id: "c16", name: "Parkside Boulder",              memberType: "Member",  hospitalType: "General Practitioner", city: "Boulder",       state: "Colorado",    status: "published"   },
      { id: "c17", name: "Parkside Aurora",               memberType: "Member",  hospitalType: "General Practitioner", city: "Aurora",        state: "Colorado",    status: "draft"       },
    ],
  },
  {
    id: "g5", name: "Illinois Veterinary Network",
    members: [
      { id: "c18", name: "IVN Chicago North Shore",       memberType: "Primary", hospitalType: "Emergency",            city: "Chicago",       state: "Illinois",    status: "live_domain" },
      { id: "c19", name: "IVN Evanston",                  memberType: "Member",  hospitalType: "General Practitioner", city: "Evanston",      state: "Illinois",    status: "published"   },
      { id: "c20", name: "IVN Naperville",                memberType: "Member",  hospitalType: "General Practitioner", city: "Naperville",    state: "Illinois",    status: "published"   },
      { id: "c21", name: "IVN Schaumburg",                memberType: "Member",  hospitalType: "General Practitioner", city: "Schaumburg",    state: "Illinois",    status: "scheduled"   },
    ],
  },
  {
    id: "g6", name: "Sunshine Pet Care Associates",
    members: [
      { id: "c22", name: "Sunshine Miami Brickell",       memberType: "Primary", hospitalType: "General Practitioner", city: "Miami",         state: "Florida",     status: "published"   },
      { id: "c23", name: "Sunshine Orlando Downtown",     memberType: "Member",  hospitalType: "General Practitioner", city: "Orlando",       state: "Florida",     status: "published"   },
      { id: "c24", name: "Sunshine Tampa Bay",            memberType: "Member",  hospitalType: "General Practitioner", city: "Tampa",         state: "Florida",     status: "draft"       },
    ],
  },
  {
    id: "g7", name: "Bay Area Veterinary Group",
    members: [
      { id: "c25", name: "BAVG San Francisco Castro",     memberType: "Primary", hospitalType: "General Practitioner", city: "San Francisco", state: "California",  status: "live_domain" },
      { id: "c26", name: "BAVG Oakland Piedmont",         memberType: "Member",  hospitalType: "General Practitioner", city: "Oakland",       state: "California",  status: "published"   },
      { id: "c27", name: "BAVG San Jose",                 memberType: "Member",  hospitalType: "Specialty Referral",   city: "San Jose",      state: "California",  status: "published"   },
      { id: "c28", name: "BAVG Palo Alto",                memberType: "Member",  hospitalType: "Exotic Animal",        city: "Palo Alto",     state: "California",  status: "scheduled"   },
    ],
  },
  {
    id: "g8", name: "Arizona Veterinary Associates",
    members: [
      { id: "c29", name: "AVA Phoenix Scottsdale Rd",     memberType: "Primary", hospitalType: "General Practitioner", city: "Phoenix",       state: "Arizona",     status: "published"   },
      { id: "c30", name: "AVA Scottsdale Old Town",       memberType: "Member",  hospitalType: "General Practitioner", city: "Scottsdale",    state: "Arizona",     status: "published"   },
      { id: "c31", name: "AVA Mesa",                      memberType: "Member",  hospitalType: "General Practitioner", city: "Mesa",          state: "Arizona",     status: "draft"       },
    ],
  },
  {
    id: "g9", name: "NYC Pet Healthcare Network",
    members: [
      { id: "c32", name: "NYC Pet Manhattan Midtown",     memberType: "Primary", hospitalType: "Specialty Referral",   city: "Manhattan",     state: "New York",    status: "live_domain" },
      { id: "c33", name: "NYC Pet Upper West Side",       memberType: "Member",  hospitalType: "General Practitioner", city: "Manhattan",     state: "New York",    status: "published"   },
      { id: "c34", name: "NYC Pet Brooklyn Heights",      memberType: "Member",  hospitalType: "General Practitioner", city: "Brooklyn",      state: "New York",    status: "published"   },
      { id: "c35", name: "NYC Pet Queens",                memberType: "Member",  hospitalType: "General Practitioner", city: "Queens",        state: "New York",    status: "scheduled"   },
      { id: "c36", name: "NYC Pet Hoboken",               memberType: "Member",  hospitalType: "Emergency",            city: "Hoboken",       state: "New Jersey",  status: "draft"       },
    ],
  },
  {
    id: "g10", name: "West Coast Vet Specialists",
    members: [
      { id: "c37", name: "WCVS Los Angeles Westside",     memberType: "Primary", hospitalType: "Exotic Animal",        city: "Los Angeles",   state: "California",  status: "live_domain" },
      { id: "c38", name: "WCVS San Diego Mission Hills",  memberType: "Member",  hospitalType: "Specialty Referral",   city: "San Diego",     state: "California",  status: "published"   },
      { id: "c39", name: "WCVS Portland Pearl District",  memberType: "Member",  hospitalType: "General Practitioner", city: "Portland",      state: "Oregon",      status: "published"   },
      { id: "c40", name: "WCVS Seattle Capitol Hill",     memberType: "Member",  hospitalType: "Specialty Referral",   city: "Seattle",       state: "Washington",  status: "draft"       },
    ],
  },
];

/* ── Local UI helpers ───────────────────────────────────────────────────────── */

type FilterVal = "all" | string;

interface FilterDropdownProps {
  label: string;
  value: FilterVal;
  options: { value: string; label: string }[];
  onChange: (v: FilterVal) => void;
}

function FilterDropdown({ label, value, options, onChange }: FilterDropdownProps) {
  const [open, setOpen] = React.useState(false);
  const ref = React.useRef<HTMLDivElement>(null);
  React.useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);
  const active = value !== "all";
  const selectedLabel = active ? options.find((o) => o.value === value)?.label ?? label : label;
  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={`px-3 py-2 border rounded-lg text-sm font-medium flex items-center gap-1.5 transition-colors ${
          active
            ? "border-teal-500 bg-teal-50 text-teal-700"
            : "border-gray-200 bg-white text-gray-700 hover:bg-gray-50"
        }`}
      >
        {selectedLabel}
        <ChevronDown size={13} className={active ? "text-teal-500" : "text-gray-400"} />
      </button>
      {open && (
        <div className="absolute left-0 top-full mt-1 z-40 min-w-[148px] bg-white border border-gray-200 rounded-xl shadow-lg py-1.5">
          <button
            className={`w-full text-left px-3.5 py-2 text-sm transition-colors ${value === "all" ? "font-semibold text-teal-700 bg-teal-50" : "text-gray-700 hover:bg-gray-50"}`}
            onClick={() => { onChange("all"); setOpen(false); }}
          >
            {label}
          </button>
          {options.map((opt) => (
            <button
              key={opt.value}
              className={`w-full text-left px-3.5 py-2 text-sm transition-colors ${value === opt.value ? "font-semibold text-teal-700 bg-teal-50" : "text-gray-700 hover:bg-gray-50"}`}
              onClick={() => { onChange(opt.value); setOpen(false); }}
            >
              {opt.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

interface SortHeaderProps {
  label: string;
  col: keyof MemberClinic;
  sortCol: keyof MemberClinic;
  sortAsc: boolean;
  onSort: (col: keyof MemberClinic) => void;
}
function SortHeader({ label, col, sortCol, sortAsc, onSort }: SortHeaderProps) {
  const active = sortCol === col;
  const Icon = active ? (sortAsc ? ArrowUp : ArrowDown) : ArrowUpDown;
  return (
    <button
      onClick={() => onSort(col)}
      className="inline-flex items-center gap-1 hover:text-gray-900 transition-colors"
    >
      {label}
      <Icon size={11} className={active ? "text-teal-600" : "text-gray-300"} />
    </button>
  );
}

/* ── Component ───────────────────────────────────────────────────────────── */

export function GroupClinicPage() {
  const [selectedId, setSelectedId]     = useState("g1");
  const [searchQuery, setSearchQuery]   = useState("");
  const [filterStatus, setFilterStatus] = useState<FilterVal>("all");
  const [filterType,   setFilterType]   = useState<FilterVal>("all");
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());
  const [currentPage, setCurrentPage]   = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(8);
  const [sortCol, setSortCol]           = useState<keyof MemberClinic>("name");
  const [sortAsc, setSortAsc]           = useState(true);
  const [confirm,    setConfirm]        = useState<ConfirmState | null>(null);
  const { toasts, toast, dismiss }      = useToast();

  const group = GROUPS.find((g) => g.id === selectedId)!;

  const primaryCount = group.members.filter((m) => m.memberType === "Primary").length;
  const liveCount    = group.members.filter((m) => m.status === "live_domain" || m.status === "published").length;

  /* Unique filter options derived from current group */
  const statusOptions = [
    { value: "published",   label: "Published"   },
    { value: "scheduled",   label: "Scheduled"   },
    { value: "draft",       label: "Draft"       },
    { value: "live_domain", label: "Live Domain" },
  ];
  const typeOptions = Array.from(new Set(group.members.map((m) => m.hospitalType))).sort()
    .map((t) => ({ value: t, label: t }));

  /* Filter + sort */
  const filtered = group.members
    .filter((m) => {
      const q = searchQuery.toLowerCase();
      return (
        (m.name.toLowerCase().includes(q) || m.city.toLowerCase().includes(q) || m.state.toLowerCase().includes(q)) &&
        (filterStatus === "all" || m.status === filterStatus) &&
        (filterType   === "all" || m.hospitalType === filterType)
      );
    })
    .sort((a, b) => {
      const av = String(a[sortCol]).toLowerCase();
      const bv = String(b[sortCol]).toLowerCase();
      return sortAsc ? av.localeCompare(bv) : bv.localeCompare(av);
    });

  const totalPages = Math.max(1, Math.ceil(filtered.length / itemsPerPage));
  const paginated  = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handleSort = (col: keyof MemberClinic) => {
    if (sortCol === col) setSortAsc(!sortAsc);
    else { setSortCol(col); setSortAsc(true); }
  };

  const toggleRow = (id: string) => {
    const next = new Set(selectedRows);
    next.has(id) ? next.delete(id) : next.add(id);
    setSelectedRows(next);
  };

  const toggleAll = () => {
    setSelectedRows(
      selectedRows.size === paginated.length && paginated.length > 0
        ? new Set()
        : new Set(paginated.map((m) => m.id))
    );
  };

  const switchGroup = (id: string) => {
    setSelectedId(id);
    setCurrentPage(1);
    setSearchQuery("");
    setSelectedRows(new Set());
    setFilterStatus("all");
    setFilterType("all");
  };

  const rowActions = (m: MemberClinic): RowAction[] => [
    { label: "Edit",   icon: Edit2,  onClick: () => toast.success(`Editing ${m.name}`) },
    { label: "View Live", icon: Globe, onClick: () => toast.success(`Opening ${m.name}`) },
    { label: "Delete", icon: Trash2, onClick: () => setConfirm({
        title:       `Remove "${m.name}"?`,
        message:     "This clinic will be removed from the group.",
        confirmLabel: "Remove",
        variant:     "danger",
        onConfirm: () => toast.success(`"${m.name}" removed from group`),
      }), variant: "danger" },
  ];

  const COLS: { key: keyof MemberClinic; label: string }[] = [
    { key: "name",         label: "Hospital Name" },
    { key: "status",       label: "Status"        },
    { key: "memberType",   label: "Member Type"   },
    { key: "hospitalType", label: "Hospital Type" },
    { key: "city",         label: "City"          },
    { key: "state",        label: "State"         },
  ];

  return (
    <div className="flex-1 flex overflow-hidden bg-white">

      {/* ── Left Rail ─────────────────────────────────────────────────────── */}
      <div className="w-64 flex-shrink-0 border-r border-gray-200 flex flex-col overflow-hidden bg-white">

        <div className="px-4 py-4 border-b border-gray-100">
          <button className="w-full flex items-center justify-center gap-2 px-3 py-2 text-sm font-semibold text-teal-700 bg-teal-50 border border-teal-200 rounded-lg hover:bg-teal-100 transition-colors">
            <Plus size={15} />
            Create Group
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          {GROUPS.map((g) => {
            const active = g.id === selectedId;
            return (
              <div
                key={g.id}
                role="button"
                tabIndex={0}
                aria-pressed={active}
                onClick={() => switchGroup(g.id)}
                onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") switchGroup(g.id); }}
                className={`w-full flex items-center justify-between px-5 py-4 cursor-pointer border-b border-gray-100 transition-colors select-none ${
                  active ? "bg-teal-50 border-l-2 border-l-teal-600" : "hover:bg-gray-50"
                }`}
              >
                <span className={`text-sm font-semibold truncate pr-2 leading-snug ${active ? "text-teal-800" : "text-gray-800"}`}>
                  {g.name}
                </span>
                <span className={`min-w-[26px] h-[26px] flex items-center justify-center rounded-full text-xs font-bold px-1.5 flex-shrink-0 ${
                  active ? "bg-teal-200 text-teal-800" : "bg-gray-100 text-gray-600"
                }`}>
                  {g.members.length}
                </span>
              </div>
            );
          })}
        </div>

        <div className="px-4 py-3 border-t border-gray-100 bg-gray-50/60">
          <p className="text-xs text-gray-500">
            {GROUPS.length} groups · {GROUPS.reduce((s, g) => s + g.members.length, 0)} clinics
          </p>
        </div>
      </div>

      {/* ── Right Panel ───────────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col overflow-hidden">

        {/* Group Summary Bar */}
        <div className="px-6 pt-5 pb-4 flex-shrink-0 border-b border-gray-100 bg-white">
          <h2 className="text-base font-bold text-gray-900">{group.name}</h2>
          <div className="flex items-center gap-4 mt-1">
            <span className="flex items-center gap-1.5 text-xs text-gray-500">
              <Building2 size={12} className="text-teal-500" />
              {group.members.length} clinics
            </span>
            <span className="flex items-center gap-1.5 text-xs text-gray-500">
              <CheckCircle2 size={12} className="text-teal-500" />
              {primaryCount} primary
            </span>
            <span className="flex items-center gap-1.5 text-xs text-gray-500">
              <Users size={12} className="text-teal-500" />
              {liveCount} live
            </span>
          </div>
        </div>

        {/* Bulk toolbar */}
        {selectedRows.size > 0 && (
          <div className="px-6 py-2.5 bg-teal-50 border-b border-teal-200 flex items-center gap-3 flex-shrink-0">
            <span className="text-sm font-semibold text-teal-800">
              {selectedRows.size} selected
            </span>
            <div className="h-4 w-px bg-teal-300" />
            <button
              onClick={() => {
                setConfirm({
                  title:       `Remove ${selectedRows.size} clinics?`,
                  message:     "These clinics will be removed from the group.",
                  confirmLabel: "Remove All",
                  variant:     "danger",
                  onConfirm:   () => { toast.success(`${selectedRows.size} clinics removed`); setSelectedRows(new Set()); },
                });
              }}
              className="text-sm font-medium text-red-600 hover:text-red-700 transition-colors"
            >
              Remove from Group
            </button>
            <button
              onClick={() => setSelectedRows(new Set())}
              className="ml-auto text-xs text-teal-600 hover:text-teal-800 transition-colors"
            >
              Deselect all
            </button>
          </div>
        )}

        {/* Toolbar */}
        <div className="px-6 py-3 flex items-center gap-3 flex-shrink-0 flex-wrap">
          <SearchInput
            value={searchQuery}
            onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
            placeholder="Search clinics…"
            className="flex-1 max-w-xs"
          />
          <FilterDropdown
            label="All Status"
            value={filterStatus}
            options={statusOptions}
            onChange={(v) => { setFilterStatus(v); setCurrentPage(1); }}
          />
          <FilterDropdown
            label="All Types"
            value={filterType}
            options={typeOptions}
            onChange={(v) => { setFilterType(v); setCurrentPage(1); }}
          />
        </div>

        {/* Table Card */}
        <div className="px-6 pb-6 flex-1 flex flex-col min-h-0">
          <div className="border border-gray-200 rounded-xl overflow-hidden flex flex-col flex-1 min-h-0">

            <div className="flex-1 overflow-auto min-h-0">
              <table className="w-full text-sm table-fixed border-collapse">
                <colgroup>
                  <col style={{ width: "44px" }} />
                  <col style={{ width: "22%" }} />
                  <col style={{ width: "13%" }} />
                  <col style={{ width: "9%" }} />
                  <col style={{ width: "20%" }} />
                  <col style={{ width: "13%" }} />
                  <col style={{ width: "8%" }} />
                  <col style={{ width: "80px" }} />
                </colgroup>

                <thead className="sticky top-0 z-10">
                  <tr style={{ height: "41px" }} className="bg-gray-50 border-b border-gray-200">
                    <th className="px-4 py-3 text-left">
                      <input
                        type="checkbox"
                        aria-label="Select all on this page"
                        checked={selectedRows.size === paginated.length && paginated.length > 0}
                        disabled={paginated.length === 0}
                        onChange={toggleAll}
                        className="w-4 h-4 rounded border-gray-300 text-teal-600 focus:ring-teal-600 disabled:opacity-40 disabled:cursor-not-allowed"
                      />
                    </th>
                    {COLS.map(({ key, label }) => (
                      <th key={key} className="px-4 py-3 text-left text-xs font-semibold text-gray-600 whitespace-nowrap">
                        <SortHeader label={label} col={key} sortCol={sortCol} sortAsc={sortAsc} onSort={handleSort} />
                      </th>
                    ))}
                    <th className="px-4 py-3 pr-6 text-right text-xs font-semibold text-gray-600">Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {paginated.length > 0 ? paginated.map((m, idx) => (
                    <tr
                      key={m.id}
                      style={{ height: "55px" }}
                      className={`border-b border-gray-100 hover:bg-teal-50/30 transition-colors ${
                        idx % 2 === 0 ? "bg-white" : "bg-gray-50/30"
                      }`}
                    >
                      <td className="px-4 py-3.5">
                        <input
                          type="checkbox"
                          aria-label={`Select ${m.name}`}
                          checked={selectedRows.has(m.id)}
                          onChange={() => toggleRow(m.id)}
                          className="w-4 h-4 rounded border-gray-300 text-teal-600 focus:ring-teal-600"
                        />
                      </td>
                      <td className="px-4 py-3.5 font-medium text-gray-900 truncate">{m.name}</td>
                      <td className="px-4 py-3.5">
                        <SiteStatusBadge status={m.status} />
                      </td>
                      <td className="px-4 py-3.5">
                        <Badge
                          variant={m.memberType === "Primary" ? "primary" : "neutral"}
                          bordered={m.memberType === "Primary"}
                        >
                          {m.memberType}
                        </Badge>
                      </td>
                      <td className="px-4 py-3.5 text-gray-600 truncate">{m.hospitalType}</td>
                      <td className="px-4 py-3.5 text-gray-600">{m.city}</td>
                      <td className="px-4 py-3.5 text-gray-600">{m.state}</td>
                      <td className="px-4 py-3.5 pr-6 text-right">
                        <RowActionMenu items={rowActions(m)} label={`Actions for ${m.name}`} />
                      </td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan={8} className="py-16 text-center">
                        <Building2 size={32} className="mx-auto mb-3 text-gray-200" />
                        <p className="text-sm text-gray-400">
                          {group.members.length === 0
                            ? "No clinics in this group yet."
                            : "No clinics match your filters."}
                        </p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="px-5 py-3 border-t border-gray-200 bg-white flex items-center justify-between flex-shrink-0">
              <p className="text-xs text-gray-500">
                {filtered.length > 0
                  ? <>{(currentPage - 1) * itemsPerPage + 1}–{Math.min(currentPage * itemsPerPage, filtered.length)} of {filtered.length} clinics</>
                  : "No clinics"}
              </p>
              <div className="flex items-center gap-1.5">
                <span className="text-xs text-gray-500 mr-2">
                  Rows:
                  <select
                    className="ml-1.5 text-xs font-medium text-gray-700 border border-gray-200 rounded-md px-1.5 py-0.5 bg-white focus:outline-none focus:ring-1 focus:ring-teal-500"
                    value={itemsPerPage}
                    onChange={(e) => { setItemsPerPage(Number(e.target.value)); setCurrentPage(1); }}
                  >
                    <option>8</option><option>10</option><option>20</option>
                  </select>
                </span>
                {[
                  { label: "«", title: "First page",    action: () => setCurrentPage(1),                            disabled: currentPage === 1 },
                  { label: "‹", title: "Previous page", action: () => setCurrentPage(Math.max(1, currentPage - 1)), disabled: currentPage === 1 },
                ].map(({ label, title, action, disabled }) => (
                  <button key={label} onClick={action} disabled={disabled} aria-label={title}
                    className="w-7 h-7 flex items-center justify-center rounded-md border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition text-xs">
                    {label}
                  </button>
                ))}
                {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => i + 1).map((p) => (
                  <button key={p} onClick={() => setCurrentPage(p)} aria-current={p === currentPage ? "page" : undefined}
                    className={`w-7 h-7 flex items-center justify-center rounded-md text-xs font-medium transition ${
                      p === currentPage ? "bg-teal-600 text-white border border-teal-600" : "border border-gray-200 text-gray-600 hover:bg-gray-50"
                    }`}>
                    {p}
                  </button>
                ))}
                {[
                  { label: "›", title: "Next page",  action: () => setCurrentPage(Math.min(totalPages, currentPage + 1)), disabled: currentPage === totalPages },
                  { label: "»", title: "Last page",  action: () => setCurrentPage(totalPages),                            disabled: currentPage === totalPages },
                ].map(({ label, title, action, disabled }) => (
                  <button key={label} onClick={action} disabled={disabled} aria-label={title}
                    className="w-7 h-7 flex items-center justify-center rounded-md border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition text-xs">
                    {label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <ConfirmDialog state={confirm} onClose={() => setConfirm(null)} />
      <ToastContainer toasts={toasts} onDismiss={dismiss} />
    </div>
  );
}
