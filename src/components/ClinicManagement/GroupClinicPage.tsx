/**
 * Group Clinic Page
 * Left rail: clinic groups | Right: member clinics table (matches ClinicListPage design)
 */

import React, { useState } from "react";
import {
  Plus, Search, ChevronDown, ArrowUpDown, MoreVertical,
  Building2, Users, CheckCircle2,
} from "lucide-react";

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

// v2
/* ── Status badge config — matches ClinicListPage exactly ─────────────────── */

const STATUS_STYLES: Record<ClinicStatus, { badge: string; dot: string; label: string }> = {
  published:   { badge: "bg-teal-50 text-teal-700",   dot: "bg-emerald-400", label: "Published"   },
  scheduled:   { badge: "bg-amber-50 text-amber-700", dot: "bg-orange-400",  label: "Scheduled"   },
  draft:       { badge: "bg-red-50 text-red-600",     dot: "bg-red-400",     label: "Draft"       },
  live_domain: { badge: "bg-blue-50 text-blue-700",   dot: "bg-blue-400",    label: "Live Domain" },
};

/* ── Component ───────────────────────────────────────────────────────────── */

export function GroupClinicPage() {
  const [selectedId, setSelectedId]     = useState("g1");
  const [searchQuery, setSearchQuery]   = useState("");
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());
  const [currentPage, setCurrentPage]   = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(8);
  const [sortCol, setSortCol]           = useState<keyof MemberClinic>("name");
  const [sortAsc, setSortAsc]           = useState(true);

  const group = GROUPS.find((g) => g.id === selectedId)!;

  // Summary counts
  const primaryCount  = group.members.filter((m) => m.memberType === "Primary").length;
  const liveCount     = group.members.filter((m) => m.status === "live_domain" || m.status === "published").length;

  // Filter + sort
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
  };

  const COLS: { key: keyof MemberClinic; label: string }[] = [
    { key: "name",         label: "Hospital Name"  },
    { key: "status",       label: "Status"         },
    { key: "memberType",   label: "Member Type"    },
    { key: "hospitalType", label: "Hospital Type"  },
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
            {GROUPS.length} groups · {GROUPS.reduce((s, g) => s + g.members.length, 0)} clinics
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
        </div>

        {/* Toolbar */}
        <div className="px-6 py-3 flex items-center gap-3 flex-shrink-0">
          <div className="relative flex-1 max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={15} />
            <input
              type="text"
              placeholder="Search clinics…"
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
              <table className="w-full text-sm table-fixed border-collapse">
                <colgroup>
                  <col style={{ width: "44px" }} />
                  <col style={{ width: "22%" }} />
                  <col style={{ width: "12%" }} />
                  <col style={{ width: "9%" }} />
                  <col style={{ width: "20%" }} />
                  <col style={{ width: "14%" }} />
                  <col style={{ width: "8%" }} />
                  <col style={{ width: "80px" }} />
                </colgroup>

                <thead className="sticky top-0 z-10">
                  <tr style={{ height: "41px" }} className="bg-gray-50 border-b border-gray-200">
                    <th className="px-4 py-3 text-left">
                      <input
                        type="checkbox"
                        checked={selectedRows.size === paginated.length && paginated.length > 0}
                        onChange={toggleAll}
                        className="w-4 h-4 rounded border-gray-300 text-teal-600 focus:ring-teal-600"
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
                    const s = STATUS_STYLES[m.status];
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
                          />
                        </td>
                        <td className="px-4 py-3.5 font-medium text-gray-900 truncate">{m.name}</td>
                        <td className="px-4 py-3.5">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium whitespace-nowrap ${s.badge}`}>
                            <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${s.dot}`} />
                            {s.label}
                          </span>
                        </td>
                        <td className="px-4 py-3.5">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                            m.memberType === "Primary"
                              ? "bg-teal-50 text-teal-700 border border-teal-200"
                              : "bg-gray-100 text-gray-600"
                          }`}>
                            {m.memberType}
                          </span>
                        </td>
                        <td className="px-4 py-3.5 text-gray-600">{m.hospitalType}</td>
                        <td className="px-4 py-3.5 text-gray-600">{m.city}</td>
                        <td className="px-4 py-3.5 text-gray-600">{m.state}</td>
                        <td className="px-4 py-3.5 pr-6 text-right">
                          <button className="p-1.5 hover:bg-gray-200 rounded-md transition-colors">
                            <MoreVertical size={14} className="text-gray-400" />
                          </button>
                        </td>
                      </tr>
                    );
                  }) : (
                    <tr>
                      <td colSpan={8} className="py-16 text-center text-sm text-gray-400">
                        {group.members.length === 0
                          ? "No clinics in this group yet — click \"Add Clinic\" to get started."
                          : "No clinics match your search."}
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
                {(currentPage - 1) * itemsPerPage + 1}–{Math.min(currentPage * itemsPerPage, filtered.length)} of {filtered.length} clinics
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
                  { label: "«", action: () => setCurrentPage(1),                            disabled: currentPage === 1 },
                  { label: "‹", action: () => setCurrentPage(Math.max(1, currentPage - 1)), disabled: currentPage === 1 },
                ].map(({ label, action, disabled }) => (
                  <button key={label} onClick={action} disabled={disabled}
                    className="w-7 h-7 flex items-center justify-center rounded-md border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition text-xs">
                    {label}
                  </button>
                ))}
                {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => i + 1).map((p) => (
                  <button key={p} onClick={() => setCurrentPage(p)}
                    className={`w-7 h-7 flex items-center justify-center rounded-md text-xs font-medium transition ${
                      p === currentPage ? "bg-teal-600 text-white border border-teal-600" : "border border-gray-200 text-gray-600 hover:bg-gray-50"
                    }`}>
                    {p}
                  </button>
                ))}
                {[
                  { label: "›", action: () => setCurrentPage(Math.min(totalPages, currentPage + 1)), disabled: currentPage === totalPages },
                  { label: "»", action: () => setCurrentPage(totalPages),                            disabled: currentPage === totalPages },
                ].map(({ label, action, disabled }) => (
                  <button key={label} onClick={action} disabled={disabled}
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
