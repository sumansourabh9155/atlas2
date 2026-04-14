/**
 * Multi-site Clinic Page
 * Left rail: multi-site networks | Right: locations table
 * Design system: SiteStatusBadge, Badge, SearchInput, RowActionMenu, ConfirmDialog, Toast
 */

import React, { useState } from "react";
import {
  Plus, ArrowUp, ArrowDown, ArrowUpDown,
  CheckCircle2, Globe, Building2, MapPin,
  Edit2, Trash2, ChevronDown,
} from "lucide-react";
import { SiteStatusBadge, Badge, SearchInput } from "../ui";
import { ConfirmDialog, type ConfirmState } from "../ui/ConfirmDialog";
import { ToastContainer, useToast } from "../ui/Toast";
import { RowActionMenu, type RowAction } from "../ui/RowActionMenu";

/* ── Types ─────────────────────────────────────────────────────────────────── */

type LocationStatus = "published" | "scheduled" | "draft" | "live_domain";

interface Location {
  id: string;
  name: string;
  role: "Parent" | "Child";
  hospitalType: string;
  city: string;
  state: string;
  status: LocationStatus;
}

interface MultiSiteNetwork {
  id: string;
  name: string;
  locations: Location[];
}

/* ── Data ───────────────────────────────────────────────────────────────────── */

const NETWORKS: MultiSiteNetwork[] = [
  {
    id: "n1", name: "Banfield Pet Hospital",
    locations: [
      { id: "l1",  name: "Banfield Austin Flagship",     role: "Parent", hospitalType: "General Practitioner", city: "Austin",       state: "Texas",      status: "live_domain" },
      { id: "l2",  name: "Banfield Austin North",         role: "Child",  hospitalType: "General Practitioner", city: "Austin",       state: "Texas",      status: "published"   },
      { id: "l3",  name: "Banfield Austin Cedar Park",    role: "Child",  hospitalType: "General Practitioner", city: "Cedar Park",   state: "Texas",      status: "published"   },
      { id: "l4",  name: "Banfield Dallas Uptown",        role: "Child",  hospitalType: "General Practitioner", city: "Dallas",       state: "Texas",      status: "scheduled"   },
      { id: "l5",  name: "Banfield Houston Midtown",      role: "Child",  hospitalType: "General Practitioner", city: "Houston",      state: "Texas",      status: "draft"       },
      { id: "l6",  name: "Banfield San Antonio",          role: "Child",  hospitalType: "General Practitioner", city: "San Antonio",  state: "Texas",      status: "published"   },
    ],
  },
  {
    id: "n2", name: "VCA Animal Hospitals",
    locations: [
      { id: "l7",  name: "VCA West Los Angeles",          role: "Parent", hospitalType: "Specialty Referral",   city: "Los Angeles",  state: "California", status: "live_domain" },
      { id: "l8",  name: "VCA Santa Monica",              role: "Child",  hospitalType: "General Practitioner", city: "Santa Monica", state: "California", status: "published"   },
      { id: "l9",  name: "VCA Pasadena",                  role: "Child",  hospitalType: "General Practitioner", city: "Pasadena",     state: "California", status: "published"   },
      { id: "l10", name: "VCA Long Beach",                role: "Child",  hospitalType: "Emergency",            city: "Long Beach",   state: "California", status: "scheduled"   },
      { id: "l11", name: "VCA San Diego Bay",             role: "Child",  hospitalType: "General Practitioner", city: "San Diego",    state: "California", status: "draft"       },
    ],
  },
  {
    id: "n3", name: "BluePearl Veterinary",
    locations: [
      { id: "l12", name: "BluePearl Tampa",               role: "Parent", hospitalType: "Emergency",            city: "Tampa",        state: "Florida",    status: "live_domain" },
      { id: "l13", name: "BluePearl Orlando",             role: "Child",  hospitalType: "Emergency",            city: "Orlando",      state: "Florida",    status: "published"   },
      { id: "l14", name: "BluePearl Miami",               role: "Child",  hospitalType: "Specialty Referral",   city: "Miami",        state: "Florida",    status: "published"   },
      { id: "l15", name: "BluePearl Jacksonville",        role: "Child",  hospitalType: "Emergency",            city: "Jacksonville", state: "Florida",    status: "draft"       },
    ],
  },
  {
    id: "n4", name: "Thrive Affordable Vet",
    locations: [
      { id: "l16", name: "Thrive Denver Central",        role: "Parent", hospitalType: "General Practitioner", city: "Denver",       state: "Colorado",   status: "published"   },
      { id: "l17", name: "Thrive Aurora",                role: "Child",  hospitalType: "General Practitioner", city: "Aurora",       state: "Colorado",   status: "published"   },
      { id: "l18", name: "Thrive Colorado Springs",      role: "Child",  hospitalType: "General Practitioner", city: "Colorado Spgs",state: "Colorado",   status: "scheduled"   },
    ],
  },
  {
    id: "n5", name: "National Vet Associates",
    locations: [
      { id: "l19", name: "NVA Chicago Lake View",        role: "Parent", hospitalType: "General Practitioner", city: "Chicago",      state: "Illinois",   status: "live_domain" },
      { id: "l20", name: "NVA Chicago Lincoln Park",     role: "Child",  hospitalType: "General Practitioner", city: "Chicago",      state: "Illinois",   status: "published"   },
      { id: "l21", name: "NVA Evanston",                 role: "Child",  hospitalType: "General Practitioner", city: "Evanston",     state: "Illinois",   status: "published"   },
      { id: "l22", name: "NVA Naperville",               role: "Child",  hospitalType: "General Practitioner", city: "Naperville",   state: "Illinois",   status: "draft"       },
      { id: "l23", name: "NVA Oak Park",                 role: "Child",  hospitalType: "Exotic Animal",        city: "Oak Park",     state: "Illinois",   status: "published"   },
      { id: "l24", name: "NVA Schaumburg",               role: "Child",  hospitalType: "General Practitioner", city: "Schaumburg",   state: "Illinois",   status: "scheduled"   },
      { id: "l25", name: "NVA Joliet",                   role: "Child",  hospitalType: "General Practitioner", city: "Joliet",       state: "Illinois",   status: "draft"       },
    ],
  },
  {
    id: "n6", name: "Mission Vet Partners",
    locations: [
      { id: "l26", name: "Mission Vet Seattle",          role: "Parent", hospitalType: "General Practitioner", city: "Seattle",      state: "Washington", status: "published"   },
      { id: "l27", name: "Mission Vet Bellevue",         role: "Child",  hospitalType: "General Practitioner", city: "Bellevue",     state: "Washington", status: "published"   },
      { id: "l28", name: "Mission Vet Tacoma",           role: "Child",  hospitalType: "Emergency",            city: "Tacoma",       state: "Washington", status: "draft"       },
    ],
  },
  {
    id: "n7", name: "Southern Vet Partners",
    locations: [
      { id: "l29", name: "SVP Charlotte Main",           role: "Parent", hospitalType: "General Practitioner", city: "Charlotte",    state: "N. Carolina", status: "live_domain" },
      { id: "l30", name: "SVP Charlotte North",          role: "Child",  hospitalType: "General Practitioner", city: "Charlotte",    state: "N. Carolina", status: "published"   },
      { id: "l31", name: "SVP Raleigh",                  role: "Child",  hospitalType: "General Practitioner", city: "Raleigh",      state: "N. Carolina", status: "published"   },
      { id: "l32", name: "SVP Durham",                   role: "Child",  hospitalType: "Specialty Referral",   city: "Durham",       state: "N. Carolina", status: "scheduled"   },
      { id: "l33", name: "SVP Greensboro",               role: "Child",  hospitalType: "General Practitioner", city: "Greensboro",   state: "N. Carolina", status: "draft"       },
    ],
  },
  {
    id: "n8", name: "Pathway Vet Alliance",
    locations: [
      { id: "l34", name: "Pathway Phoenix Central",      role: "Parent", hospitalType: "General Practitioner", city: "Phoenix",      state: "Arizona",    status: "published"   },
      { id: "l35", name: "Pathway Scottsdale",           role: "Child",  hospitalType: "General Practitioner", city: "Scottsdale",   state: "Arizona",    status: "published"   },
      { id: "l36", name: "Pathway Tempe",                role: "Child",  hospitalType: "General Practitioner", city: "Tempe",        state: "Arizona",    status: "draft"       },
      { id: "l37", name: "Pathway Mesa",                 role: "Child",  hospitalType: "General Practitioner", city: "Mesa",         state: "Arizona",    status: "scheduled"   },
    ],
  },
  {
    id: "n9", name: "Heartland Vet Partners",
    locations: [
      { id: "l38", name: "Heartland Kansas City",        role: "Parent", hospitalType: "General Practitioner", city: "Kansas City",  state: "Missouri",   status: "published"   },
      { id: "l39", name: "Heartland St. Louis",          role: "Child",  hospitalType: "General Practitioner", city: "St. Louis",    state: "Missouri",   status: "published"   },
    ],
  },
  {
    id: "n10", name: "PetVet Care Centers",
    locations: [
      { id: "l40", name: "PetVet Portland",              role: "Parent", hospitalType: "General Practitioner", city: "Portland",     state: "Oregon",     status: "live_domain" },
      { id: "l41", name: "PetVet Beaverton",             role: "Child",  hospitalType: "General Practitioner", city: "Beaverton",    state: "Oregon",     status: "published"   },
      { id: "l42", name: "PetVet Salem",                 role: "Child",  hospitalType: "General Practitioner", city: "Salem",        state: "Oregon",     status: "published"   },
      { id: "l43", name: "PetVet Eugene",                role: "Child",  hospitalType: "General Practitioner", city: "Eugene",       state: "Oregon",     status: "draft"       },
      { id: "l44", name: "PetVet Bend",                  role: "Child",  hospitalType: "Large Animal",         city: "Bend",         state: "Oregon",     status: "scheduled"   },
      { id: "l45", name: "PetVet Medford",               role: "Child",  hospitalType: "General Practitioner", city: "Medford",      state: "Oregon",     status: "draft"       },
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
  col: keyof Location;
  sortCol: keyof Location;
  sortAsc: boolean;
  onSort: (col: keyof Location) => void;
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

export function MultisiteClinicPage() {
  const [selectedId,   setSelectedId]   = useState("n1");
  const [searchQuery,  setSearchQuery]  = useState("");
  const [filterStatus, setFilterStatus] = useState<FilterVal>("all");
  const [filterType,   setFilterType]   = useState<FilterVal>("all");
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());
  const [currentPage,  setCurrentPage]  = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(8);
  const [sortCol,      setSortCol]      = useState<keyof Location>("name");
  const [sortAsc,      setSortAsc]      = useState(true);
  const [confirm,      setConfirm]      = useState<ConfirmState | null>(null);
  const { toasts, toast, dismiss }      = useToast();

  const network = NETWORKS.find((n) => n.id === selectedId)!;

  const parentCount = network.locations.filter((l) => l.role === "Parent").length;
  const liveCount   = network.locations.filter((l) => l.status === "live_domain" || l.status === "published").length;

  const statusOptions = [
    { value: "published",   label: "Published"   },
    { value: "scheduled",   label: "Scheduled"   },
    { value: "draft",       label: "Draft"       },
    { value: "live_domain", label: "Live Domain" },
  ];
  const typeOptions = Array.from(new Set(network.locations.map((l) => l.hospitalType))).sort()
    .map((t) => ({ value: t, label: t }));

  const filtered = network.locations
    .filter((l) => {
      const q = searchQuery.toLowerCase();
      return (
        (l.name.toLowerCase().includes(q) || l.city.toLowerCase().includes(q) || l.state.toLowerCase().includes(q)) &&
        (filterStatus === "all" || l.status === filterStatus) &&
        (filterType   === "all" || l.hospitalType === filterType)
      );
    })
    .sort((a, b) => {
      const av = String(a[sortCol]).toLowerCase();
      const bv = String(b[sortCol]).toLowerCase();
      return sortAsc ? av.localeCompare(bv) : bv.localeCompare(av);
    });

  const totalPages  = Math.max(1, Math.ceil(filtered.length / itemsPerPage));
  const paginated   = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handleSort = (col: keyof Location) => {
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
        : new Set(paginated.map((l) => l.id))
    );
  };

  const switchNetwork = (id: string) => {
    setSelectedId(id);
    setCurrentPage(1);
    setSearchQuery("");
    setSelectedRows(new Set());
    setFilterStatus("all");
    setFilterType("all");
  };

  const rowActions = (loc: Location): RowAction[] => [
    { label: "Edit",      icon: Edit2,  onClick: () => toast.success(`Editing ${loc.name}`) },
    { label: "View Live", icon: Globe,  onClick: () => toast.success(`Opening ${loc.name}`) },
    { label: "Delete",    icon: Trash2, onClick: () => setConfirm({
        title:       `Remove "${loc.name}"?`,
        message:     "This location will be removed from the network.",
        confirmLabel: "Remove",
        variant:     "danger",
        onConfirm:   () => toast.success(`"${loc.name}" removed`),
      }), variant: "danger" },
  ];

  const COLS: { key: keyof Location; label: string }[] = [
    { key: "name",         label: "Hospital Name" },
    { key: "status",       label: "Status"        },
    { key: "role",         label: "Role"          },
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
            Create Multi-Site
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          {NETWORKS.map((net) => {
            const active = net.id === selectedId;
            return (
              <div
                key={net.id}
                role="button"
                tabIndex={0}
                aria-pressed={active}
                onClick={() => switchNetwork(net.id)}
                onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") switchNetwork(net.id); }}
                className={`w-full flex items-center justify-between px-5 py-4 cursor-pointer border-b border-gray-100 transition-colors select-none ${
                  active ? "bg-teal-50 border-l-2 border-l-teal-600" : "hover:bg-gray-50"
                }`}
              >
                <span className={`text-sm font-semibold truncate pr-2 leading-snug ${active ? "text-teal-800" : "text-gray-800"}`}>
                  {net.name}
                </span>
                <span className={`min-w-[26px] h-[26px] flex items-center justify-center rounded-full text-xs font-bold px-1.5 flex-shrink-0 ${
                  active ? "bg-teal-200 text-teal-800" : "bg-gray-100 text-gray-600"
                }`}>
                  {net.locations.length}
                </span>
              </div>
            );
          })}
        </div>

        <div className="px-4 py-3 border-t border-gray-100 bg-gray-50/60">
          <p className="text-xs text-gray-500">
            {NETWORKS.length} networks · {NETWORKS.reduce((s, n) => s + n.locations.length, 0)} locations
          </p>
        </div>
      </div>

      {/* ── Right Panel ───────────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col overflow-hidden">

        {/* Network Summary Bar */}
        <div className="px-6 pt-5 pb-4 flex-shrink-0 border-b border-gray-100 bg-white">
          <h2 className="text-base font-bold text-gray-900">{network.name}</h2>
          <div className="flex items-center gap-4 mt-1">
            <span className="flex items-center gap-1.5 text-xs text-gray-500">
              <MapPin size={12} className="text-teal-500" />
              {network.locations.length} locations
            </span>
            <span className="flex items-center gap-1.5 text-xs text-gray-500">
              <Building2 size={12} className="text-teal-500" />
              {parentCount} parent
            </span>
            <span className="flex items-center gap-1.5 text-xs text-gray-500">
              <Globe size={12} className="text-teal-500" />
              {liveCount} live
            </span>
            <span className="flex items-center gap-1.5 text-xs text-gray-500">
              <CheckCircle2 size={12} className="text-teal-500" />
              {network.locations.filter((l) => l.status === "published" || l.status === "live_domain").length} published
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
                  title:       `Remove ${selectedRows.size} locations?`,
                  message:     "These locations will be removed from the network.",
                  confirmLabel: "Remove All",
                  variant:     "danger",
                  onConfirm:   () => { toast.success(`${selectedRows.size} locations removed`); setSelectedRows(new Set()); },
                });
              }}
              className="text-sm font-medium text-red-600 hover:text-red-700 transition-colors"
            >
              Remove from Network
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
            placeholder="Search locations…"
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
                  <col style={{ width: "7%" }} />
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
                  {paginated.length > 0 ? paginated.map((loc, idx) => (
                    <tr
                      key={loc.id}
                      style={{ height: "55px" }}
                      className={`border-b border-gray-100 hover:bg-teal-50/30 transition-colors ${
                        idx % 2 === 0 ? "bg-white" : "bg-gray-50/30"
                      }`}
                    >
                      <td className="px-4 py-3.5">
                        <input
                          type="checkbox"
                          aria-label={`Select ${loc.name}`}
                          checked={selectedRows.has(loc.id)}
                          onChange={() => toggleRow(loc.id)}
                          className="w-4 h-4 rounded border-gray-300 text-teal-600 focus:ring-teal-600"
                        />
                      </td>
                      <td className="px-4 py-3.5 font-medium text-gray-900 truncate">{loc.name}</td>
                      <td className="px-4 py-3.5">
                        <SiteStatusBadge status={loc.status} />
                      </td>
                      <td className="px-4 py-3.5">
                        <Badge
                          variant={loc.role === "Parent" ? "primary" : "neutral"}
                          bordered={loc.role === "Parent"}
                        >
                          {loc.role}
                        </Badge>
                      </td>
                      <td className="px-4 py-3.5 text-gray-600 truncate">{loc.hospitalType}</td>
                      <td className="px-4 py-3.5 text-gray-600">{loc.city}</td>
                      <td className="px-4 py-3.5 text-gray-600">{loc.state}</td>
                      <td className="px-4 py-3.5 pr-6 text-right">
                        <RowActionMenu items={rowActions(loc)} label={`Actions for ${loc.name}`} />
                      </td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan={8} className="py-16 text-center">
                        <MapPin size={32} className="mx-auto mb-3 text-gray-200" />
                        <p className="text-sm text-gray-400">
                          {network.locations.length === 0
                            ? "No locations yet — add the first one."
                            : "No locations match your filters."}
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
                  ? <>{(currentPage - 1) * itemsPerPage + 1}–{Math.min(currentPage * itemsPerPage, filtered.length)} of {filtered.length} locations</>
                  : "No locations"}
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
                  { label: "›", title: "Next page", action: () => setCurrentPage(Math.min(totalPages, currentPage + 1)), disabled: currentPage === totalPages },
                  { label: "»", title: "Last page", action: () => setCurrentPage(totalPages),                            disabled: currentPage === totalPages },
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
