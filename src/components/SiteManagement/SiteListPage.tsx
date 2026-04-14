/**
 * Site List Page — All sites table.
 *
 * Fixed:
 *  - Status / State / Type filter dropdowns are now functional
 *  - Column sorting (all 5 data columns) — click header to toggle asc/desc
 *  - Bulk action toolbar appears when rows are selected (Publish / Archive / Delete)
 *  - Row action menu (⋮) — Edit, View Site, Archive, Delete per row
 *  - "Showing X–Y of Z sites" in pagination
 *  - "Assign To Group" replaces vague "Allocate To"
 */

import React, { useState, useRef, useEffect } from "react";
import {
  ChevronDown, ArrowUp, ArrowDown, ArrowUpDown,
  Building2, CheckCircle2, Clock, FileText, Globe,
  Edit2, Eye, Archive, Trash2, Globe2, Users,
} from "lucide-react";
import { KpiCard }        from "../ui/KpiCard";
import { SearchInput }    from "../ui/Input";
import { Button }         from "../ui/Button";
import { SiteStatusBadge } from "../ui/StatusBadge";
import { Table }          from "../ui/Table";
import { RowActionMenu }  from "../ui/RowActionMenu";
import { ConfirmDialog, type ConfirmState } from "../ui/ConfirmDialog";
import { ToastContainer, useToast } from "../ui/Toast";
import type { LucideIcon } from "lucide-react";
import type { KpiColor }  from "../ui/KpiCard";

/* ── Types ────────────────────────────────────────────────────────── */

type SiteStatusType = "published" | "scheduled" | "draft" | "live_domain";

interface Site {
  id:           string;
  name:         string;
  businessType: string;
  city:         string;
  state:        string;
  groupName:    string | null;
  statusType:   SiteStatusType;
}

type SortKey = "name" | "businessType" | "city" | "state" | "statusType";

/* ── Data ─────────────────────────────────────────────────────────── */

const DUMMY_SITES: Site[] = [
  { id: "1",  name: "The Golden Roast Café",            businessType: "Restaurant & Café",     city: "Denver",        state: "Colorado",       groupName: "Roast & Co. Group",          statusType: "published"   },
  { id: "2",  name: "Luminary Salon & Spa",             businessType: "Hair & Beauty Salon",   city: "Austin",        state: "Texas",          groupName: null,                         statusType: "published"   },
  { id: "3",  name: "Summit Realty Partners",           businessType: "Real Estate Agency",    city: "San Diego",     state: "California",     groupName: "Pacific Coast Realty Group", statusType: "draft"       },
  { id: "4",  name: "Midtown Family Health Center",     businessType: "Healthcare Clinic",     city: "Manhattan",     state: "New York",        groupName: "NYC Wellness Network",       statusType: "live_domain" },
  { id: "5",  name: "Bright Minds Learning Academy",   businessType: "Education & Training",  city: "Seattle",       state: "Washington",     groupName: null,                         statusType: "scheduled"   },
  { id: "6",  name: "Harbor City Auto Care",            businessType: "Automotive Services",   city: "Chicago",       state: "Illinois",       groupName: "Midwest Auto Network",       statusType: "published"   },
  { id: "7",  name: "Pawsome Pet Boarding & Grooming", businessType: "Pet Services",          city: "Miami",         state: "Florida",        groupName: "Sunshine Pet Care",          statusType: "published"   },
  { id: "8",  name: "Blue Ridge Outdoor & Apparel",    businessType: "Retail Store",          city: "Charlotte",     state: "North Carolina", groupName: null,                         statusType: "draft"       },
  { id: "9",  name: "Pacific Freight & Fulfillment",   businessType: "Warehouse & Logistics", city: "Los Angeles",   state: "California",     groupName: "West Coast Logistics Hub",   statusType: "live_domain" },
  { id: "10", name: "Apex Consulting Group",            businessType: "Professional Services", city: "Phoenix",       state: "Arizona",        groupName: "Arizona Business Alliance",  statusType: "scheduled"   },
  { id: "11", name: "Bellwood Bistro & Bar",            businessType: "Restaurant & Café",     city: "San Francisco", state: "California",     groupName: "Roast & Co. Group",          statusType: "published"   },
];

const STATE_ABBR: Record<string, string> = {
  "Alabama":"AL","Alaska":"AK","Arizona":"AZ","Arkansas":"AR","California":"CA",
  "Colorado":"CO","Connecticut":"CT","Delaware":"DE","Florida":"FL","Georgia":"GA",
  "Hawaii":"HI","Idaho":"ID","Illinois":"IL","Indiana":"IN","Iowa":"IA",
  "Kansas":"KS","Kentucky":"KY","Louisiana":"LA","Maine":"ME","Maryland":"MD",
  "Massachusetts":"MA","Michigan":"MI","Minnesota":"MN","Mississippi":"MS","Missouri":"MO",
  "Montana":"MT","Nebraska":"NE","Nevada":"NV","New Hampshire":"NH","New Jersey":"NJ",
  "New Mexico":"NM","New York":"NY","North Carolina":"NC","North Dakota":"ND","Ohio":"OH",
  "Oklahoma":"OK","Oregon":"OR","Pennsylvania":"PA","Rhode Island":"RI","South Carolina":"SC",
  "South Dakota":"SD","Tennessee":"TN","Texas":"TX","Utah":"UT","Vermont":"VT",
  "Virginia":"VA","Washington":"WA","West Virginia":"WV","Wisconsin":"WI","Wyoming":"WY",
};
const abbr = (s: string) => STATE_ABBR[s] ?? s;

const STATS: { label: string; value: number; icon: LucideIcon; color: KpiColor }[] = [
  { label: "Published",    value: 75, icon: CheckCircle2, color: "teal"  },
  { label: "Scheduled",   value: 0,  icon: Clock,         color: "amber" },
  { label: "Draft",       value: 70, icon: FileText,       color: "gray"  },
  { label: "Live Domains",value: 9,  icon: Globe,          color: "blue"  },
];

const ALL_STATES    = [...new Set(DUMMY_SITES.map((s) => s.state))].sort();
const ALL_TYPES     = [...new Set(DUMMY_SITES.map((s) => s.businessType))].sort();
const STATUS_LABELS: Record<SiteStatusType, string> = {
  published:   "Published",
  scheduled:   "Scheduled",
  draft:       "Draft",
  live_domain: "Live Domain",
};

/* ── Filter Dropdown ──────────────────────────────────────────────── */

function FilterDropdown({
  label, value, options, onChange,
}: {
  label:    string;
  value:    string;
  options:  { value: string; label: string }[];
  onChange: (v: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const active = !!value;

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
          active
            ? "border-teal-400 bg-teal-50 text-teal-700"
            : "border-gray-200 bg-white text-gray-700 hover:bg-gray-50"
        }`}
      >
        {selectedLabel}
        <ChevronDown size={14} className={`transition-transform ${open ? "rotate-180" : ""}`} aria-hidden="true" />
      </button>

      {open && (
        <div className="absolute top-full left-0 mt-1 z-40 min-w-[180px] bg-white border border-gray-200 rounded-xl shadow-lg py-1.5">
          <button
            className="w-full text-left px-3.5 py-2 text-sm text-gray-500 hover:bg-gray-50 transition-colors"
            onClick={() => { onChange(""); setOpen(false); }}
          >
            {label} <span className="text-xs text-gray-400">(all)</span>
          </button>
          <div className="border-t border-gray-100 my-1" />
          {options.map((opt) => (
            <button
              key={opt.value}
              className={`w-full text-left px-3.5 py-2 text-sm transition-colors ${
                value === opt.value
                  ? "text-teal-700 bg-teal-50 font-medium"
                  : "text-gray-700 hover:bg-gray-50"
              }`}
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

/* ── Sort header cell ─────────────────────────────────────────────── */

function SortHeader({
  label, col, sortCol, sortAsc, onSort,
}: {
  label:   string;
  col:     SortKey;
  sortCol: SortKey;
  sortAsc: boolean;
  onSort:  (col: SortKey) => void;
}) {
  const active = sortCol === col;
  const Icon   = active ? (sortAsc ? ArrowUp : ArrowDown) : ArrowUpDown;
  return (
    <button
      onClick={() => onSort(col)}
      className="inline-flex items-center gap-1 hover:text-gray-900 transition-colors"
    >
      {label}
      <Icon size={11} className={active ? "text-teal-600" : "text-gray-300"} aria-hidden="true" />
    </button>
  );
}

/* ── Component ────────────────────────────────────────────────────── */

export function SiteListPage() {
  const [sites, setSites]           = useState<Site[]>(DUMMY_SITES);
  const [search,      setSearch]    = useState("");
  const [filterStatus, setFilterStatus] = useState<SiteStatusType | "">("");
  const [filterState,  setFilterState]  = useState("");
  const [filterType,   setFilterType]   = useState("");
  const [sortCol,     setSortCol]   = useState<SortKey>("name");
  const [sortAsc,     setSortAsc]   = useState(true);
  const [selected,    setSelected]  = useState<Set<string>>(new Set());
  const [currentPage, setPage]      = useState(1);
  const [perPage,     setPerPage]   = useState(8);
  const [confirm,     setConfirm]   = useState<ConfirmState | null>(null);
  const { toasts, toast, dismiss }  = useToast();

  /* ── Derived ── */
  const filtered = sites
    .filter((s) => {
      const q = search.toLowerCase();
      return (
        (s.name.toLowerCase().includes(q) || s.city.toLowerCase().includes(q) || s.state.toLowerCase().includes(q)) &&
        (!filterStatus || s.statusType === filterStatus) &&
        (!filterState  || s.state      === filterState)  &&
        (!filterType   || s.businessType === filterType)
      );
    })
    .sort((a, b) => {
      const av = String(a[sortCol]).toLowerCase();
      const bv = String(b[sortCol]).toLowerCase();
      return sortAsc ? av.localeCompare(bv) : bv.localeCompare(av);
    });

  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage));
  const paginated  = filtered.slice((currentPage - 1) * perPage, currentPage * perPage);

  const handleSort = (col: SortKey) => {
    if (sortCol === col) setSortAsc((v) => !v);
    else { setSortCol(col); setSortAsc(true); }
    setPage(1);
  };

  const toggleRow = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };
  const toggleAll = () => {
    setSelected(
      selected.size === paginated.length && paginated.length > 0
        ? new Set()
        : new Set(paginated.map((s) => s.id))
    );
  };

  const changeSearch = (q: string) => { setSearch(q); setPage(1); };
  const activeFilters = [filterStatus, filterState, filterType].filter(Boolean).length;

  /* ── Bulk actions ── */
  const bulkArchive = () => {
    const n = selected.size;
    setSites((prev) => prev.map((s) => selected.has(s.id) ? { ...s, statusType: "draft" as SiteStatusType } : s));
    setSelected(new Set());
    toast.success(`${n} site${n !== 1 ? "s" : ""} archived`);
  };

  const bulkPublish = () => {
    const n = selected.size;
    setSites((prev) => prev.map((s) => selected.has(s.id) ? { ...s, statusType: "published" as SiteStatusType } : s));
    setSelected(new Set());
    toast.success(`${n} site${n !== 1 ? "s" : ""} published`);
  };

  const bulkDelete = () => {
    const n = selected.size;
    setConfirm({
      title:       `Delete ${n} site${n !== 1 ? "s" : ""}?`,
      message:     "This will permanently remove the selected sites.",
      confirmLabel: `Delete ${n}`,
      variant:     "danger",
      onConfirm: () => {
        setSites((prev) => prev.filter((s) => !selected.has(s.id)));
        setSelected(new Set());
        toast.success(`${n} site${n !== 1 ? "s" : ""} deleted`);
      },
    });
  };

  /* ── Row actions ── */
  const rowActions = (site: Site) => [
    { label: "Edit",       icon: Edit2,    onClick: () => toast.info(`Editing ${site.name}`) },
    { label: "View Site",  icon: Eye,      onClick: () => toast.info(`Opening ${site.name}`) },
    { label: "Assign to Group", icon: Users, onClick: () => toast.info("Group assignment coming soon") },
    { label: "Archive",    icon: Archive,  onClick: () => {
      setSites((prev) => prev.map((s) => s.id === site.id ? { ...s, statusType: "draft" as SiteStatusType } : s));
      toast.success(`"${site.name}" archived`);
    }},
    { label: "Delete",     icon: Trash2,   variant: "danger" as const, onClick: () => {
      setConfirm({
        title:       `Delete "${site.name}"?`,
        message:     "This will permanently remove the site and all its content.",
        confirmLabel: "Delete Site",
        variant:     "danger",
        onConfirm: () => {
          setSites((prev) => prev.filter((s) => s.id !== site.id));
          toast.success(`"${site.name}" deleted`);
        },
      });
    }},
  ];

  return (
    <div className="flex-1 bg-white flex flex-col overflow-hidden">

      {/* ── Fixed header ── */}
      <div className="px-10 pt-10 pb-6 flex-shrink-0 space-y-5">

        {/* KPI cards */}
        <div className="grid grid-cols-4 gap-6">
          {STATS.map((s) => (
            <KpiCard key={s.label} label={s.label} value={s.value} icon={s.icon} color={s.color} tinted />
          ))}
        </div>

        {/* Search + filters */}
        <div className="flex items-center gap-3 flex-wrap">
          <SearchInput
            placeholder="Search sites…"
            value={search}
            onChange={(e) => changeSearch(e.target.value)}
            wrapperClassName="max-w-xs"
          />

          <FilterDropdown
            label="All Statuses"
            value={filterStatus}
            onChange={(v) => { setFilterStatus(v as SiteStatusType | ""); setPage(1); }}
            options={(Object.keys(STATUS_LABELS) as SiteStatusType[]).map((k) => ({ value: k, label: STATUS_LABELS[k] }))}
          />
          <FilterDropdown
            label="All States"
            value={filterState}
            onChange={(v) => { setFilterState(v); setPage(1); }}
            options={ALL_STATES.map((s) => ({ value: s, label: s }))}
          />
          <FilterDropdown
            label="All Industries"
            value={filterType}
            onChange={(v) => { setFilterType(v); setPage(1); }}
            options={ALL_TYPES.map((t) => ({ value: t, label: t }))}
          />

          {activeFilters > 0 && (
            <button
              onClick={() => { setFilterStatus(""); setFilterState(""); setFilterType(""); setPage(1); }}
              className="text-xs font-medium text-teal-600 hover:text-teal-800 transition-colors"
            >
              Clear {activeFilters} filter{activeFilters !== 1 ? "s" : ""}
            </button>
          )}

          <Button variant="secondary" iconRight={ChevronDown} className="ml-auto">
            Assign to Group
          </Button>
        </div>

        {/* Bulk action toolbar — appears when rows selected */}
        {selected.size > 0 && (
          <div className="flex items-center gap-3 px-4 py-2.5 bg-teal-50 border border-teal-200 rounded-xl">
            <span className="text-sm font-semibold text-teal-800 flex-shrink-0">
              {selected.size} site{selected.size !== 1 ? "s" : ""} selected
            </span>
            <div className="flex gap-2 ml-auto">
              <Button variant="secondary" size="sm" icon={Globe2} onClick={bulkPublish}>Publish</Button>
              <Button variant="secondary" size="sm" icon={Archive} onClick={bulkArchive}>Archive</Button>
              <Button variant="danger"    size="sm" icon={Trash2}  onClick={bulkDelete}>Delete</Button>
            </div>
          </div>
        )}
      </div>

      {/* ── Table ── */}
      <div className="px-8 pb-8">
        <Table.Wrapper>
          <div className="overflow-auto" style={{ height: "486px" }}>
            <Table.Root className="min-w-[780px] table-fixed">
              <colgroup>
                <col style={{ width: "40px" }} />
                <col style={{ width: "195px" }} />
                <col style={{ width: "110px" }} />
                <col style={{ width: "135px" }} />
                <col style={{ width: "95px" }} />
                <col style={{ width: "48px" }} />
                <col style={{ width: "150px" }} />
                <col style={{ width: "60px" }} />
              </colgroup>

              <Table.Header sticky>
                <Table.HeaderCell width="40px" className="px-4">
                  <input
                    type="checkbox"
                    checked={selected.size === paginated.length && paginated.length > 0}
                    disabled={paginated.length === 0}
                    onChange={toggleAll}
                    className="w-4 h-4 rounded border-gray-300 text-teal-600 focus:ring-teal-600 disabled:opacity-40"
                    aria-label="Select all sites on this page"
                  />
                </Table.HeaderCell>
                <Table.HeaderCell>
                  <SortHeader label="Business Name" col="name"         sortCol={sortCol} sortAsc={sortAsc} onSort={handleSort} />
                </Table.HeaderCell>
                <Table.HeaderCell>
                  <SortHeader label="Status"        col="statusType"   sortCol={sortCol} sortAsc={sortAsc} onSort={handleSort} />
                </Table.HeaderCell>
                <Table.HeaderCell>
                  <SortHeader label="Business Type" col="businessType" sortCol={sortCol} sortAsc={sortAsc} onSort={handleSort} />
                </Table.HeaderCell>
                <Table.HeaderCell>
                  <SortHeader label="City"          col="city"         sortCol={sortCol} sortAsc={sortAsc} onSort={handleSort} />
                </Table.HeaderCell>
                <Table.HeaderCell>
                  <SortHeader label="State"         col="state"        sortCol={sortCol} sortAsc={sortAsc} onSort={handleSort} />
                </Table.HeaderCell>
                <Table.HeaderCell>Group / Chain</Table.HeaderCell>
                <Table.HeaderCell align="right">Actions</Table.HeaderCell>
              </Table.Header>

              <Table.Body>
                {paginated.length === 0 ? (
                  <Table.EmptyState
                    colSpan={8}
                    icon={Building2}
                    title="No sites found"
                    subtitle={activeFilters > 0 || search ? "Try clearing filters or adjusting your search." : "Create your first site to get started."}
                  />
                ) : paginated.map((site, idx) => (
                  <Table.Row key={site.id} index={idx} style={{ height: "55px" }}>
                    <Table.Cell className="px-4">
                      <input
                        type="checkbox"
                        checked={selected.has(site.id)}
                        onChange={() => toggleRow(site.id)}
                        className="w-4 h-4 rounded border-gray-300 text-teal-600 focus:ring-teal-600"
                        aria-label={`Select ${site.name}`}
                      />
                    </Table.Cell>
                    <Table.Cell className="font-medium text-gray-900 truncate">{site.name}</Table.Cell>
                    <Table.Cell><SiteStatusBadge status={site.statusType} /></Table.Cell>
                    <Table.Cell className="text-gray-600 truncate">{site.businessType}</Table.Cell>
                    <Table.Cell className="text-gray-600 truncate">{site.city}</Table.Cell>
                    <Table.Cell className="text-gray-600 font-medium">{abbr(site.state)}</Table.Cell>
                    <Table.Cell className="text-gray-500 truncate">{site.groupName ?? "—"}</Table.Cell>
                    <Table.Cell align="right">
                      <RowActionMenu label={`Actions for ${site.name}`} items={rowActions(site)} />
                    </Table.Cell>
                  </Table.Row>
                ))}
              </Table.Body>
            </Table.Root>
          </div>

          <Table.Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={filtered.length}
            itemsPerPage={perPage}
            onPageChange={setPage}
            onItemsPerPageChange={(n) => { setPerPage(n); setPage(1); }}
          />
        </Table.Wrapper>
      </div>

      <ConfirmDialog state={confirm} onClose={() => setConfirm(null)} />
      <ToastContainer toasts={toasts} onDismiss={dismiss} />
    </div>
  );
}
