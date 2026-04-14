/**
 * Clinic List Page — Clinic management table.
 *
 * Migrated to design system:
 *  - KpiCard, SearchInput, Button, SiteStatusBadge, Table.*, IconButton
 * New:
 *  - Working status / state / type filters
 *  - Column sorting
 *  - Bulk action toolbar
 *  - Row action menu (⋮)
 *  - "Showing X–Y of Z" in pagination via Table.Pagination
 */

import React, { useState, useRef, useEffect } from "react";
import {
  ChevronDown, ArrowUp, ArrowDown, ArrowUpDown,
  Building2, CheckCircle2, Clock, FileText, Globe,
  Edit2, Eye, Archive, Trash2, Globe2, Users,
} from "lucide-react";
import { KpiCard }         from "../ui/KpiCard";
import { SearchInput }     from "../ui/Input";
import { Button }          from "../ui/Button";
import { SiteStatusBadge } from "../ui/StatusBadge";
import { Table }           from "../ui/Table";
import { RowActionMenu }   from "../ui/RowActionMenu";
import { ConfirmDialog, type ConfirmState } from "../ui/ConfirmDialog";
import { ToastContainer, useToast } from "../ui/Toast";
import type { LucideIcon } from "lucide-react";
import type { KpiColor }   from "../ui/KpiCard";

/* ── Types ────────────────────────────────────────────────────────── */

type ClinicStatus = "published" | "scheduled" | "draft" | "live_domain";

interface Clinic {
  id:           string;
  name:         string;
  hospitalType: string;
  city:         string;
  state:        string;
  groupName:    string | null;
  statusType:   ClinicStatus;
}

type SortKey = "name" | "hospitalType" | "city" | "state" | "statusType";

/* ── Data ─────────────────────────────────────────────────────────── */

const DUMMY_CLINICS: Clinic[] = [
  { id: "1",  name: "Lakeside Veterinary Hospital",       hospitalType: "General Practice",   city: "Denver",        state: "Colorado",       groupName: "Parkside Pet Care",                statusType: "published"   },
  { id: "2",  name: "Emergency Pet Hospital Austin",      hospitalType: "Emergency",          city: "Austin",        state: "Texas",          groupName: null,                               statusType: "published"   },
  { id: "3",  name: "Riverside Animal Clinic",            hospitalType: "General Practice",   city: "San Diego",     state: "California",     groupName: "Coastal Veterinary Group",         statusType: "draft"       },
  { id: "4",  name: "Metropolitan Specialty Veterinary",  hospitalType: "Specialty Referral", city: "Manhattan",     state: "New York",       groupName: "NYC Pet Healthcare Network",       statusType: "live_domain" },
  { id: "5",  name: "Harbor View Vet Clinic",             hospitalType: "General Practice",   city: "Seattle",       state: "Washington",     groupName: null,                               statusType: "scheduled"   },
  { id: "6",  name: "North Shore Emergency Clinic",       hospitalType: "Emergency",          city: "Chicago",       state: "Illinois",       groupName: "Illinois Veterinary Network",      statusType: "published"   },
  { id: "7",  name: "Sunshine Veterinary Hospital",       hospitalType: "General Practice",   city: "Miami",         state: "Florida",        groupName: "Sunshine Pet Care Associates",     statusType: "published"   },
  { id: "8",  name: "Blue Ridge Animal Hospital",         hospitalType: "General Practice",   city: "Charlotte",     state: "North Carolina", groupName: null,                               statusType: "draft"       },
  { id: "9",  name: "Westside Exotic & Specialty",        hospitalType: "Exotic Animal",      city: "Los Angeles",   state: "California",     groupName: "West Coast Veterinary Specialists",statusType: "live_domain" },
  { id: "10", name: "Valley View Equine & Pet Center",    hospitalType: "Large Animal",       city: "Phoenix",       state: "Arizona",        groupName: "Arizona Veterinary Associates",    statusType: "scheduled"   },
  { id: "11", name: "Golden Gate Pet Hospital",           hospitalType: "General Practice",   city: "San Francisco", state: "California",     groupName: "Bay Area Veterinary Group",        statusType: "published"   },
];

const STATS: { label: string; value: number; icon: LucideIcon; color: KpiColor }[] = [
  { label: "Published",    value: 75, icon: CheckCircle2, color: "teal"  },
  { label: "Scheduled",   value: 0,  icon: Clock,         color: "amber" },
  { label: "Draft",       value: 70, icon: FileText,       color: "gray"  },
  { label: "Live Domains",value: 9,  icon: Globe,          color: "blue"  },
];

const STATUS_LABELS: Record<ClinicStatus, string> = {
  published:   "Published",
  scheduled:   "Scheduled",
  draft:       "Draft",
  live_domain: "Live Domain",
};

const ALL_STATES = [...new Set(DUMMY_CLINICS.map((c) => c.state))].sort();
const ALL_TYPES  = [...new Set(DUMMY_CLINICS.map((c) => c.hospitalType))].sort();

/* ── Filter Dropdown ──────────────────────────────────────────────── */

function FilterDropdown({ label, value, options, onChange }: {
  label:    string;
  value:    string;
  options:  { value: string; label: string }[];
  onChange: (v: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const h = (e: MouseEvent) => { if (!ref.current?.contains(e.target as Node)) setOpen(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, [open]);

  const selectedLabel = options.find((o) => o.value === value)?.label ?? label;

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-lg border text-sm font-medium transition-colors ${
          value ? "border-teal-400 bg-teal-50 text-teal-700" : "border-gray-200 bg-white text-gray-700 hover:bg-gray-50"
        }`}
      >
        {selectedLabel}
        <ChevronDown size={14} className={`transition-transform ${open ? "rotate-180" : ""}`} aria-hidden="true" />
      </button>
      {open && (
        <div className="absolute top-full left-0 mt-1 z-40 min-w-[180px] bg-white border border-gray-200 rounded-xl shadow-lg py-1.5">
          <button className="w-full text-left px-3.5 py-2 text-sm text-gray-500 hover:bg-gray-50 transition-colors"
            onClick={() => { onChange(""); setOpen(false); }}>
            {label} <span className="text-xs text-gray-400">(all)</span>
          </button>
          <div className="border-t border-gray-100 my-1" />
          {options.map((opt) => (
            <button key={opt.value}
              className={`w-full text-left px-3.5 py-2 text-sm transition-colors ${
                value === opt.value ? "text-teal-700 bg-teal-50 font-medium" : "text-gray-700 hover:bg-gray-50"
              }`}
              onClick={() => { onChange(opt.value); setOpen(false); }}>
              {opt.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/* ── Sort header ──────────────────────────────────────────────────── */

function SortHeader({ label, col, sortCol, sortAsc, onSort }: {
  label:   string;
  col:     SortKey;
  sortCol: SortKey;
  sortAsc: boolean;
  onSort:  (col: SortKey) => void;
}) {
  const active = sortCol === col;
  const Icon   = active ? (sortAsc ? ArrowUp : ArrowDown) : ArrowUpDown;
  return (
    <button onClick={() => onSort(col)}
      className="inline-flex items-center gap-1 hover:text-gray-900 transition-colors">
      {label}
      <Icon size={11} className={active ? "text-teal-600" : "text-gray-300"} aria-hidden="true" />
    </button>
  );
}

/* ── Component ────────────────────────────────────────────────────── */

export function ClinicListPage() {
  const [clinics, setClinics]       = useState<Clinic[]>(DUMMY_CLINICS);
  const [search,      setSearch]    = useState("");
  const [filterStatus, setFilterStatus] = useState<ClinicStatus | "">("");
  const [filterState,  setFilterState]  = useState("");
  const [filterType,   setFilterType]   = useState("");
  const [sortCol,  setSortCol]      = useState<SortKey>("name");
  const [sortAsc,  setSortAsc]      = useState(true);
  const [selected, setSelected]     = useState<Set<string>>(new Set());
  const [page,     setPage]         = useState(1);
  const [perPage,  setPerPage]      = useState(8);
  const [confirm,  setConfirm]      = useState<ConfirmState | null>(null);
  const { toasts, toast, dismiss }  = useToast();

  const filtered = clinics
    .filter((c) => {
      const q = search.toLowerCase();
      return (
        (c.name.toLowerCase().includes(q) || c.city.toLowerCase().includes(q) || c.state.toLowerCase().includes(q)) &&
        (!filterStatus || c.statusType    === filterStatus) &&
        (!filterState  || c.state         === filterState)  &&
        (!filterType   || c.hospitalType  === filterType)
      );
    })
    .sort((a, b) => {
      const av = String(a[sortCol]).toLowerCase();
      const bv = String(b[sortCol]).toLowerCase();
      return sortAsc ? av.localeCompare(bv) : bv.localeCompare(av);
    });

  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage));
  const paginated  = filtered.slice((page - 1) * perPage, page * perPage);
  const activeFilters = [filterStatus, filterState, filterType].filter(Boolean).length;

  const handleSort = (col: SortKey) => {
    if (sortCol === col) setSortAsc((v) => !v); else { setSortCol(col); setSortAsc(true); }
    setPage(1);
  };

  const toggleRow = (id: string) =>
    setSelected((prev) => { const next = new Set(prev); next.has(id) ? next.delete(id) : next.add(id); return next; });

  const toggleAll = () =>
    setSelected(selected.size === paginated.length && paginated.length > 0
      ? new Set() : new Set(paginated.map((c) => c.id)));

  const bulkPublish = () => {
    const n = selected.size;
    setClinics((prev) => prev.map((c) => selected.has(c.id) ? { ...c, statusType: "published" as ClinicStatus } : c));
    setSelected(new Set()); toast.success(`${n} clinic${n !== 1 ? "s" : ""} published`);
  };
  const bulkArchive = () => {
    const n = selected.size;
    setClinics((prev) => prev.map((c) => selected.has(c.id) ? { ...c, statusType: "draft" as ClinicStatus } : c));
    setSelected(new Set()); toast.success(`${n} clinic${n !== 1 ? "s" : ""} archived`);
  };
  const bulkDelete = () => {
    const n = selected.size;
    setConfirm({
      title: `Delete ${n} clinic${n !== 1 ? "s" : ""}?`, message: "This will permanently remove the selected clinics.",
      confirmLabel: `Delete ${n}`, variant: "danger",
      onConfirm: () => { setClinics((prev) => prev.filter((c) => !selected.has(c.id))); setSelected(new Set()); toast.success(`${n} deleted`); },
    });
  };

  const rowActions = (clinic: Clinic) => [
    { label: "Edit",          icon: Edit2,    onClick: () => toast.info(`Editing ${clinic.name}`) },
    { label: "View Clinic",   icon: Eye,      onClick: () => toast.info(`Opening ${clinic.name}`) },
    { label: "Assign to Group", icon: Users,  onClick: () => toast.info("Group assignment coming soon") },
    { label: "Archive",       icon: Archive,  onClick: () => {
      setClinics((prev) => prev.map((c) => c.id === clinic.id ? { ...c, statusType: "draft" as ClinicStatus } : c));
      toast.success(`"${clinic.name}" archived`);
    }},
    { label: "Delete",        icon: Trash2,   variant: "danger" as const, onClick: () =>
      setConfirm({
        title: `Delete "${clinic.name}"?`, message: "This will permanently remove the clinic.",
        confirmLabel: "Delete", variant: "danger",
        onConfirm: () => { setClinics((prev) => prev.filter((c) => c.id !== clinic.id)); toast.success(`"${clinic.name}" deleted`); },
      })
    },
  ];

  return (
    <div className="flex-1 bg-white flex flex-col overflow-hidden">

      <div className="px-8 pt-8 pb-4 flex-shrink-0 space-y-5">

        {/* KPI cards */}
        <div className="grid grid-cols-4 gap-4">
          {STATS.map((s) => <KpiCard key={s.label} label={s.label} value={s.value} icon={s.icon} color={s.color} tinted />)}
        </div>

        {/* Toolbar */}
        <div className="flex items-center gap-3 flex-wrap">
          <SearchInput
            placeholder="Search clinics…"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            wrapperClassName="max-w-xs"
          />
          <FilterDropdown label="All Statuses" value={filterStatus}
            onChange={(v) => { setFilterStatus(v as ClinicStatus | ""); setPage(1); }}
            options={(Object.keys(STATUS_LABELS) as ClinicStatus[]).map((k) => ({ value: k, label: STATUS_LABELS[k] }))} />
          <FilterDropdown label="All States" value={filterState}
            onChange={(v) => { setFilterState(v); setPage(1); }}
            options={ALL_STATES.map((s) => ({ value: s, label: s }))} />
          <FilterDropdown label="All Types" value={filterType}
            onChange={(v) => { setFilterType(v); setPage(1); }}
            options={ALL_TYPES.map((t) => ({ value: t, label: t }))} />
          {activeFilters > 0 && (
            <button onClick={() => { setFilterStatus(""); setFilterState(""); setFilterType(""); setPage(1); }}
              className="text-xs font-medium text-teal-600 hover:text-teal-800 transition-colors">
              Clear {activeFilters} filter{activeFilters !== 1 ? "s" : ""}
            </button>
          )}
          <Button variant="secondary" iconRight={ChevronDown} className="ml-auto">Assign to Group</Button>
        </div>

        {/* Bulk toolbar */}
        {selected.size > 0 && (
          <div className="flex items-center gap-3 px-4 py-2.5 bg-teal-50 border border-teal-200 rounded-xl">
            <span className="text-sm font-semibold text-teal-800 flex-shrink-0">
              {selected.size} clinic{selected.size !== 1 ? "s" : ""} selected
            </span>
            <div className="flex gap-2 ml-auto">
              <Button variant="secondary" size="sm" icon={Globe2}  onClick={bulkPublish}>Publish</Button>
              <Button variant="secondary" size="sm" icon={Archive} onClick={bulkArchive}>Archive</Button>
              <Button variant="danger"    size="sm" icon={Trash2}  onClick={bulkDelete}>Delete</Button>
            </div>
          </div>
        )}
      </div>

      {/* Table */}
      <div className="px-8 pb-8">
        <Table.Wrapper>
          <div className="overflow-auto" style={{ height: "486px" }}>
            <Table.Root className="min-w-[760px] table-fixed">
              <colgroup>
                <col style={{ width: "44px" }} />
                <col style={{ width: "22%" }} />
                <col style={{ width: "12%" }} />
                <col style={{ width: "15%" }} />
                <col style={{ width: "10%" }} />
                <col style={{ width: "12%" }} />
                <col style={{ width: "20%" }} />
                <col style={{ width: "80px" }} />
              </colgroup>
              <Table.Header sticky>
                <Table.HeaderCell className="px-4">
                  <input type="checkbox"
                    checked={selected.size === paginated.length && paginated.length > 0}
                    disabled={paginated.length === 0}
                    onChange={toggleAll}
                    className="w-4 h-4 rounded border-gray-300 text-teal-600 focus:ring-teal-600 disabled:opacity-40"
                    aria-label="Select all clinics" />
                </Table.HeaderCell>
                <Table.HeaderCell><SortHeader label="Hospital Name"  col="name"         sortCol={sortCol} sortAsc={sortAsc} onSort={handleSort} /></Table.HeaderCell>
                <Table.HeaderCell><SortHeader label="Status"         col="statusType"   sortCol={sortCol} sortAsc={sortAsc} onSort={handleSort} /></Table.HeaderCell>
                <Table.HeaderCell><SortHeader label="Hospital Type"  col="hospitalType" sortCol={sortCol} sortAsc={sortAsc} onSort={handleSort} /></Table.HeaderCell>
                <Table.HeaderCell><SortHeader label="City"           col="city"         sortCol={sortCol} sortAsc={sortAsc} onSort={handleSort} /></Table.HeaderCell>
                <Table.HeaderCell><SortHeader label="State"          col="state"        sortCol={sortCol} sortAsc={sortAsc} onSort={handleSort} /></Table.HeaderCell>
                <Table.HeaderCell>Group Name</Table.HeaderCell>
                <Table.HeaderCell align="right">Actions</Table.HeaderCell>
              </Table.Header>
              <Table.Body>
                {paginated.length === 0 ? (
                  <Table.EmptyState colSpan={8} icon={Building2}
                    title="No clinics found"
                    subtitle={activeFilters > 0 || search ? "Try clearing filters or adjusting your search." : "Add your first clinic to get started."} />
                ) : paginated.map((clinic, idx) => (
                  <Table.Row key={clinic.id} index={idx} style={{ height: "55px" }}>
                    <Table.Cell className="px-4">
                      <input type="checkbox" checked={selected.has(clinic.id)} onChange={() => toggleRow(clinic.id)}
                        className="w-4 h-4 rounded border-gray-300 text-teal-600 focus:ring-teal-600"
                        aria-label={`Select ${clinic.name}`} />
                    </Table.Cell>
                    <Table.Cell className="font-medium text-gray-900 truncate">{clinic.name}</Table.Cell>
                    <Table.Cell><SiteStatusBadge status={clinic.statusType} /></Table.Cell>
                    <Table.Cell className="text-gray-600 truncate">{clinic.hospitalType}</Table.Cell>
                    <Table.Cell className="text-gray-600 truncate">{clinic.city}</Table.Cell>
                    <Table.Cell className="text-gray-600">{clinic.state}</Table.Cell>
                    <Table.Cell className="text-gray-500 truncate">{clinic.groupName ?? "—"}</Table.Cell>
                    <Table.Cell align="right">
                      <RowActionMenu label={`Actions for ${clinic.name}`} items={rowActions(clinic)} />
                    </Table.Cell>
                  </Table.Row>
                ))}
              </Table.Body>
            </Table.Root>
          </div>
          <Table.Pagination
            currentPage={page} totalPages={totalPages}
            totalItems={filtered.length} itemsPerPage={perPage}
            onPageChange={setPage}
            onItemsPerPageChange={(n) => { setPerPage(n); setPage(1); }} />
        </Table.Wrapper>
      </div>

      <ConfirmDialog state={confirm} onClose={() => setConfirm(null)} />
      <ToastContainer toasts={toasts} onDismiss={dismiss} />
    </div>
  );
}
