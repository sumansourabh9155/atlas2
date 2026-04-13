/**
 * Groups Page
 * Left rail: business groups | Right: member sites table
 */

import React, { useState } from "react";
import {
  Plus, Search, ChevronDown, ArrowUpDown, MoreVertical,
  Building2, Users, CheckCircle2,
} from "lucide-react";
import { SiteStatusBadge } from "../ui/StatusBadge";
import { IconButton } from "../ui/Button";
import { Badge } from "../ui/Badge";

/* ── State abbreviations ─────────────────────────────────────────────────── */
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
const abbr = (state: string) => STATE_ABBR[state] ?? state;

/* ── Types ─────────────────────────────────────────────────────────────────── */

type SiteStatus = "published" | "scheduled" | "draft" | "live_domain";

interface Member {
  id: string;
  name: string;
  memberType: "Primary" | "Member";
  businessType: string;
  city: string;
  state: string;
  status: SiteStatus;
}

interface BusinessGroup {
  id: string;
  name: string;
  members: Member[];
}

/* ── Data ───────────────────────────────────────────────────────────────────── */

const GROUPS: BusinessGroup[] = [
  {
    id: "g1", name: "Starbucks Reserve",
    members: [
      { id: "m1",  name: "Starbucks Reserve Roastery Chicago",  memberType: "Primary", businessType: "Restaurant & Café",  city: "Chicago",       state: "Illinois",    status: "live_domain" },
      { id: "m2",  name: "Starbucks Reserve New York",           memberType: "Member",  businessType: "Restaurant & Café",  city: "New York",      state: "New York",    status: "published"   },
      { id: "m3",  name: "Starbucks Reserve Seattle",            memberType: "Member",  businessType: "Restaurant & Café",  city: "Seattle",       state: "Washington",  status: "published"   },
      { id: "m4",  name: "Starbucks Reserve Los Angeles",        memberType: "Member",  businessType: "Restaurant & Café",  city: "Los Angeles",   state: "California",  status: "scheduled"   },
    ],
  },
  {
    id: "g2", name: "Planet Fitness Network",
    members: [
      { id: "m5",  name: "Planet Fitness Austin Central",        memberType: "Primary", businessType: "Healthcare Clinic",  city: "Austin",        state: "Texas",       status: "live_domain" },
      { id: "m6",  name: "Planet Fitness Dallas Uptown",          memberType: "Member",  businessType: "Healthcare Clinic",  city: "Dallas",        state: "Texas",       status: "published"   },
      { id: "m7",  name: "Planet Fitness Houston Heights",        memberType: "Member",  businessType: "Healthcare Clinic",  city: "Houston",       state: "Texas",       status: "published"   },
      { id: "m8",  name: "Planet Fitness San Antonio",            memberType: "Member",  businessType: "Healthcare Clinic",  city: "San Antonio",   state: "Texas",       status: "draft"       },
    ],
  },
  {
    id: "g3", name: "RE/MAX Properties",
    members: [
      { id: "m9",  name: "RE/MAX San Diego Bay",                 memberType: "Primary", businessType: "Real Estate Agency", city: "San Diego",     state: "California",  status: "live_domain" },
      { id: "m10", name: "RE/MAX Los Angeles Westside",          memberType: "Member",  businessType: "Real Estate Agency", city: "Los Angeles",   state: "California",  status: "published"   },
      { id: "m11", name: "RE/MAX San Francisco Marina",          memberType: "Member",  businessType: "Real Estate Agency", city: "San Francisco", state: "California",  status: "published"   },
      { id: "m12", name: "RE/MAX Santa Barbara",                 memberType: "Member",  businessType: "Real Estate Agency", city: "Santa Barbara", state: "California",  status: "draft"       },
      { id: "m13", name: "RE/MAX Seattle Waterfront",            memberType: "Member",  businessType: "Real Estate Agency", city: "Seattle",       state: "Washington",  status: "scheduled"   },
    ],
  },
  {
    id: "g4", name: "H&R Block Alliance",
    members: [
      { id: "m14", name: "H&R Block Denver Central",             memberType: "Primary", businessType: "Professional Services", city: "Denver",     state: "Colorado",    status: "published"   },
      { id: "m15", name: "H&R Block Boulder",                    memberType: "Member",  businessType: "Professional Services", city: "Boulder",    state: "Colorado",    status: "published"   },
      { id: "m16", name: "H&R Block Aurora",                     memberType: "Member",  businessType: "Professional Services", city: "Aurora",     state: "Colorado",    status: "draft"       },
    ],
  },
  {
    id: "g5", name: "Supercuts Group",
    members: [
      { id: "m17", name: "Supercuts Chicago North Shore",        memberType: "Primary", businessType: "Hair & Beauty Salon", city: "Chicago",       state: "Illinois",    status: "live_domain" },
      { id: "m18", name: "Supercuts Evanston",                   memberType: "Member",  businessType: "Hair & Beauty Salon", city: "Evanston",      state: "Illinois",    status: "published"   },
      { id: "m19", name: "Supercuts Naperville",                 memberType: "Member",  businessType: "Hair & Beauty Salon", city: "Naperville",    state: "Illinois",    status: "published"   },
      { id: "m20", name: "Supercuts Schaumburg",                 memberType: "Member",  businessType: "Hair & Beauty Salon", city: "Schaumburg",    state: "Illinois",    status: "scheduled"   },
    ],
  },
  {
    id: "g6", name: "Jiffy Lube Centers",
    members: [
      { id: "m21", name: "Jiffy Lube Miami Brickell",            memberType: "Primary", businessType: "Automotive Services", city: "Miami",         state: "Florida",     status: "published"   },
      { id: "m22", name: "Jiffy Lube Orlando Downtown",          memberType: "Member",  businessType: "Automotive Services", city: "Orlando",       state: "Florida",     status: "published"   },
      { id: "m23", name: "Jiffy Lube Tampa Bay",                 memberType: "Member",  businessType: "Automotive Services", city: "Tampa",         state: "Florida",     status: "draft"       },
    ],
  },
  {
    id: "g7", name: "Anytime Fitness",
    members: [
      { id: "m24", name: "Anytime Fitness San Francisco Castro",  memberType: "Primary", businessType: "Healthcare Clinic",  city: "San Francisco", state: "California",  status: "live_domain" },
      { id: "m25", name: "Anytime Fitness Oakland Piedmont",      memberType: "Member",  businessType: "Healthcare Clinic",  city: "Oakland",       state: "California",  status: "published"   },
      { id: "m26", name: "Anytime Fitness San Jose",              memberType: "Member",  businessType: "Healthcare Clinic",  city: "San Jose",      state: "California",  status: "published"   },
      { id: "m27", name: "Anytime Fitness Palo Alto",             memberType: "Member",  businessType: "Healthcare Clinic",  city: "Palo Alto",     state: "California",  status: "scheduled"   },
    ],
  },
  {
    id: "g8", name: "Holiday Inn Express",
    members: [
      { id: "m28", name: "Holiday Inn Express Phoenix Center",    memberType: "Primary", businessType: "Professional Services", city: "Phoenix",    state: "Arizona",     status: "published"   },
      { id: "m29", name: "Holiday Inn Express Scottsdale",        memberType: "Member",  businessType: "Professional Services", city: "Scottsdale", state: "Arizona",     status: "published"   },
      { id: "m30", name: "Holiday Inn Express Mesa",              memberType: "Member",  businessType: "Professional Services", city: "Mesa",       state: "Arizona",     status: "draft"       },
    ],
  },
  {
    id: "g9", name: "UPS Store Network",
    members: [
      { id: "m31", name: "UPS Store Manhattan Midtown",           memberType: "Primary", businessType: "Warehouse & Logistics", city: "Manhattan",  state: "New York",    status: "live_domain" },
      { id: "m32", name: "UPS Store Upper West Side",             memberType: "Member",  businessType: "Warehouse & Logistics", city: "Manhattan",  state: "New York",    status: "published"   },
      { id: "m33", name: "UPS Store Brooklyn Heights",            memberType: "Member",  businessType: "Warehouse & Logistics", city: "Brooklyn",   state: "New York",    status: "published"   },
      { id: "m34", name: "UPS Store Queens",                      memberType: "Member",  businessType: "Warehouse & Logistics", city: "Queens",     state: "New York",    status: "scheduled"   },
      { id: "m35", name: "UPS Store Hoboken",                     memberType: "Member",  businessType: "Warehouse & Logistics", city: "Hoboken",    state: "New Jersey",  status: "draft"       },
    ],
  },
  {
    id: "g10", name: "Century 21 Partners",
    members: [
      { id: "m36", name: "Century 21 Los Angeles Westside",       memberType: "Primary", businessType: "Real Estate Agency", city: "Los Angeles",   state: "California",  status: "live_domain" },
      { id: "m37", name: "Century 21 San Diego Mission Hills",    memberType: "Member",  businessType: "Real Estate Agency", city: "San Diego",     state: "California",  status: "published"   },
      { id: "m38", name: "Century 21 Portland Pearl District",    memberType: "Member",  businessType: "Real Estate Agency", city: "Portland",      state: "Oregon",      status: "published"   },
      { id: "m39", name: "Century 21 Seattle Capitol Hill",       memberType: "Member",  businessType: "Real Estate Agency", city: "Seattle",       state: "Washington",  status: "draft"       },
    ],
  },
];


/* ── Component ───────────────────────────────────────────────────────────── */

export function GroupsPage() {
  const [selectedId, setSelectedId]     = useState("g1");
  const [searchQuery, setSearchQuery]   = useState("");
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());
  const [currentPage, setCurrentPage]   = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(8);
  const [sortCol, setSortCol]           = useState<keyof Member>("name");
  const [sortAsc, setSortAsc]           = useState(true);

  const group = GROUPS.find((g) => g.id === selectedId)!;

  const primaryCount = group.members.filter((m) => m.memberType === "Primary").length;
  const liveCount    = group.members.filter((m) => m.status === "live_domain" || m.status === "published").length;

  const filtered = group.members
    .filter((m) =>
      m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.state.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => {
      const av = String(a[sortCol]).toLowerCase();
      const bv = String(b[sortCol]).toLowerCase();
      return sortAsc ? av.localeCompare(bv) : bv.localeCompare(av);
    });

  const totalPages = Math.max(1, Math.ceil(filtered.length / itemsPerPage));
  const paginated  = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handleSort = (col: keyof Member) => {
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
  };

  const COLS: { key: keyof Member; label: string }[] = [
    { key: "name",         label: "Business Name"  },
    { key: "status",       label: "Status"         },
    { key: "memberType",   label: "Member Type"    },
    { key: "businessType", label: "Business Type"  },
    { key: "city",         label: "City"           },
    { key: "state",        label: "State"          },
  ];

  return (
    <div className="flex-1 flex overflow-hidden bg-white">

      {/* ── Left Rail ─────────────────────────────────────────────────────── */}
      <div className="w-64 flex-shrink-0 border-r border-gray-200 flex flex-col overflow-hidden bg-white">

        {/* Rail Header */}
        <div className="px-4 py-4 border-b border-gray-100">
          <button className="w-full flex items-center justify-center gap-2 px-3 py-2 text-sm font-semibold text-teal-700 bg-teal-50 border border-teal-200 rounded-lg hover:bg-teal-100 transition-colors">
            <Plus size={15} />
            Create Group
          </button>
        </div>

        {/* Group List */}
        <div className="flex-1 overflow-y-auto">
          {GROUPS.map((g) => {
            const active = g.id === selectedId;
            return (
              <div
                key={g.id}
                onClick={() => switchGroup(g.id)}
                className={`w-full flex items-center justify-between px-5 py-4 cursor-pointer border-b border-gray-100 transition-colors select-none ${
                  active ? "bg-teal-50 border-l-2 border-l-teal-600" : "hover:bg-gray-50"
                }`}
              >
                <span className={`text-sm font-semibold truncate pr-2 leading-snug ${active ? "text-teal-800" : "text-gray-800"}`}>
                  {g.name}
                </span>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className={`min-w-[26px] h-[26px] flex items-center justify-center rounded-full text-xs font-bold px-1.5 ${
                    active ? "bg-teal-200 text-teal-800" : "bg-gray-100 text-gray-600"
                  }`}>
                    {g.members.length}
                  </span>
                  <button
                    onClick={(e) => e.stopPropagation()}
                    className="w-6 h-6 flex items-center justify-center rounded hover:bg-gray-200 transition text-gray-400"
                  >
                    <MoreVertical size={14} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Rail Footer */}
        <div className="px-4 py-3 border-t border-gray-100 bg-gray-50/60">
          <p className="text-xs text-gray-500">
            {GROUPS.length} groups · {GROUPS.reduce((s, g) => s + g.members.length, 0)} sites
          </p>
        </div>
      </div>

      {/* ── Right Panel ───────────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col overflow-hidden">

        {/* Group Summary Bar */}
        <div className="px-6 pt-5 pb-4 flex-shrink-0 border-b border-gray-100 bg-white">
          <div>
            <h2 className="text-base font-bold text-gray-900">{group.name}</h2>
            <div className="flex items-center gap-4 mt-1">
              <span className="flex items-center gap-1.5 text-xs text-gray-500">
                <Building2 size={12} className="text-teal-500" />
                {group.members.length} sites
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
        </div>

        {/* Toolbar */}
        <div className="px-6 py-3 flex items-center gap-3 flex-shrink-0">
          <div className="relative flex-1 max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={15} />
            <input
              type="text"
              placeholder="Search sites…"
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
              className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-600 focus:border-transparent"
            />
          </div>
          <button className="px-3 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition flex items-center gap-1.5">
            All States <ChevronDown size={14} className="text-gray-400" />
          </button>
          <button className="px-3 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition flex items-center gap-1.5">
            All Types <ChevronDown size={14} className="text-gray-400" />
          </button>
          <button className="px-3 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition flex items-center gap-1.5">
            All Status <ChevronDown size={14} className="text-gray-400" />
          </button>
          {selectedRows.size > 0 && (
            <span className="ml-auto text-xs text-teal-700 font-medium bg-teal-50 border border-teal-200 rounded-md px-2.5 py-1">
              {selectedRows.size} selected
            </span>
          )}
        </div>

        {/* Table Card */}
        <div className="px-6 pb-6 flex-1 flex flex-col min-h-0">
          <div className="border border-gray-200 rounded-xl overflow-hidden flex flex-col flex-1 min-h-0">

            {/* Scrollable Table */}
            <div className="flex-1 overflow-auto min-h-0">
              <table className="w-full min-w-[680px] text-sm table-fixed border-collapse">
                <colgroup>
                  <col style={{ width: "40px" }} />
                  <col style={{ width: "180px" }} />
                  <col style={{ width: "115px" }} />
                  <col style={{ width: "84px" }} />
                  <col style={{ width: "135px" }} />
                  <col style={{ width: "90px" }} />
                  <col style={{ width: "50px" }} />
                  <col style={{ width: "60px" }} />
                </colgroup>

                <thead className="sticky top-0 z-10">
                  <tr style={{ height: "41px" }} className="bg-gray-50 border-b border-gray-200">
                    <th className="px-4 py-3 text-left">
                      <input
                        type="checkbox"
                        checked={selectedRows.size === paginated.length && paginated.length > 0}
                        disabled={paginated.length === 0}
                        onChange={toggleAll}
                        className="w-4 h-4 rounded border-gray-300 text-teal-600 focus:ring-teal-600 disabled:opacity-40 disabled:cursor-not-allowed"
                        aria-label="Select all sites"
                      />
                    </th>
                    {COLS.map(({ key, label }) => (
                      <th key={key} className="px-4 py-3 text-left text-xs font-semibold text-gray-600 whitespace-nowrap">
                        <button
                          onClick={() => handleSort(key)}
                          className="inline-flex items-center gap-1 hover:text-gray-900 transition-colors"
                        >
                          {label}
                          <ArrowUpDown size={11} className={sortCol === key ? "text-teal-600" : "text-gray-300"} />
                        </button>
                      </th>
                    ))}
                    <th className="px-4 py-3 pr-6 text-right text-xs font-semibold text-gray-600">Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {paginated.length > 0 ? paginated.map((m, idx) => {
                    return (
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
                            checked={selectedRows.has(m.id)}
                            onChange={() => toggleRow(m.id)}
                            className="w-4 h-4 rounded border-gray-300 text-teal-600 focus:ring-teal-600"
                            aria-label={`Select ${m.name}`}
                          />
                        </td>
                        <td className="px-4 py-3.5 font-medium text-gray-900 truncate">{m.name}</td>
                        <td className="px-4 py-3.5">
                          <SiteStatusBadge status={m.status} />
                        </td>
                        <td className="px-4 py-3.5">
                          <Badge variant={m.memberType === "Primary" ? "primary" : "neutral"} bordered>
                            {m.memberType}
                          </Badge>
                        </td>
                        <td className="px-4 py-3.5 text-gray-600 truncate">{m.businessType}</td>
                        <td className="px-4 py-3.5 text-gray-600 truncate">{m.city}</td>
                        <td className="px-4 py-3.5 text-gray-600 font-medium">{abbr(m.state)}</td>
                        <td className="px-4 py-3.5 pr-6 text-right">
                          <IconButton icon={MoreVertical} label={`Actions for ${m.name}`} />
                        </td>
                      </tr>
                    );
                  }) : (
                    <tr>
                      <td colSpan={8} className="py-16 text-center text-sm text-gray-400">
                        <Building2 size={28} className="mx-auto mb-2 text-gray-300" aria-hidden="true" />
                        {group.members.length === 0
                          ? "No sites in this group yet."
                          : "No sites match your search."}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination — inside card border */}
            <div className="px-5 py-3 border-t border-gray-200 bg-white flex items-center justify-between flex-shrink-0">
              <p className="text-xs text-gray-500">
                Page <span className="font-semibold text-gray-700">{currentPage}</span> of{" "}
                <span className="font-semibold text-gray-700">{totalPages}</span>
                <span className="mx-2 text-gray-300">·</span>
                {(currentPage - 1) * itemsPerPage + 1}–{Math.min(currentPage * itemsPerPage, filtered.length)} of {filtered.length} sites
              </p>
              <div className="flex items-center gap-1.5">
                <span className="text-xs text-gray-500 mr-2">
                  Rows per page:
                  <select
                    className="ml-1.5 text-xs font-medium text-gray-700 border border-gray-200 rounded-md px-1.5 py-0.5 bg-white focus:outline-none focus:ring-1 focus:ring-teal-500"
                    value={itemsPerPage}
                    onChange={(e) => { setItemsPerPage(Number(e.target.value)); setCurrentPage(1); }}
                  >
                    <option>8</option><option>10</option><option>20</option>
                  </select>
                </span>
                {[
                  { label: "«", ariaLabel: "First page",    action: () => setCurrentPage(1),                            disabled: currentPage === 1 },
                  { label: "‹", ariaLabel: "Previous page", action: () => setCurrentPage(Math.max(1, currentPage - 1)), disabled: currentPage === 1 },
                ].map(({ label, ariaLabel, action, disabled }) => (
                  <button key={label} onClick={action} disabled={disabled} aria-label={ariaLabel}
                    className="w-7 h-7 flex items-center justify-center rounded-md border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition text-xs">
                    {label}
                  </button>
                ))}
                {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => i + 1).map((p) => (
                  <button key={p} onClick={() => setCurrentPage(p)} aria-label={`Page ${p}`} aria-current={p === currentPage ? "page" : undefined}
                    className={`w-7 h-7 flex items-center justify-center rounded-md text-xs font-medium transition ${
                      p === currentPage ? "bg-teal-600 text-white border border-teal-600" : "border border-gray-200 text-gray-600 hover:bg-gray-50"
                    }`}>
                    {p}
                  </button>
                ))}
                {[
                  { label: "›", ariaLabel: "Next page",  action: () => setCurrentPage(Math.min(totalPages, currentPage + 1)), disabled: currentPage === totalPages },
                  { label: "»", ariaLabel: "Last page",  action: () => setCurrentPage(totalPages),                            disabled: currentPage === totalPages },
                ].map(({ label, ariaLabel, action, disabled }) => (
                  <button key={label} onClick={action} disabled={disabled} aria-label={ariaLabel}
                    className="w-7 h-7 flex items-center justify-center rounded-md border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition text-xs">
                    {label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
