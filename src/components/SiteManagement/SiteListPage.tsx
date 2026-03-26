/**
 * Site List Page
 * Professional table view for managing sites across all business types
 */

import React, { useState } from "react";
import { Search, ChevronDown, MoreVertical, ArrowUpDown, CheckCircle2, Clock, FileText, Globe } from "lucide-react";

interface Site {
  id: string;
  name: string;
  businessType: string;
  city: string;
  state: string;
  groupName: string | null;
  status: "online" | "offline";
  statusType: "published" | "scheduled" | "draft" | "live_domain";
}

const DUMMY_SITES: Site[] = [
  { id: "1",  name: "The Golden Roast Café",            businessType: "Restaurant & Café",          city: "Denver",        state: "Colorado",       groupName: "Roast & Co. Group",           status: "online", statusType: "published"   },
  { id: "2",  name: "Luminary Salon & Spa",             businessType: "Hair & Beauty Salon",        city: "Austin",        state: "Texas",          groupName: null,                          status: "online", statusType: "published"   },
  { id: "3",  name: "Summit Realty Partners",           businessType: "Real Estate Agency",         city: "San Diego",     state: "California",     groupName: "Pacific Coast Realty Group",  status: "online", statusType: "draft"       },
  { id: "4",  name: "Midtown Family Health Center",     businessType: "Healthcare Clinic",          city: "Manhattan",     state: "New York",        groupName: "NYC Wellness Network",        status: "online", statusType: "live_domain" },
  { id: "5",  name: "Bright Minds Learning Academy",   businessType: "Education & Training",       city: "Seattle",       state: "Washington",     groupName: null,                          status: "online", statusType: "scheduled"   },
  { id: "6",  name: "Harbor City Auto Care",            businessType: "Automotive Services",        city: "Chicago",       state: "Illinois",       groupName: "Midwest Auto Network",        status: "online", statusType: "published"   },
  { id: "7",  name: "Pawsome Pet Boarding & Grooming", businessType: "Pet Services",               city: "Miami",         state: "Florida",        groupName: "Sunshine Pet Care",           status: "online", statusType: "published"   },
  { id: "8",  name: "Blue Ridge Outdoor & Apparel",    businessType: "Retail Store",               city: "Charlotte",     state: "North Carolina", groupName: null,                          status: "online", statusType: "draft"       },
  { id: "9",  name: "Pacific Freight & Fulfillment",   businessType: "Warehouse & Logistics",      city: "Los Angeles",   state: "California",     groupName: "West Coast Logistics Hub",    status: "online", statusType: "live_domain" },
  { id: "10", name: "Apex Consulting Group",            businessType: "Professional Services",      city: "Phoenix",       state: "Arizona",        groupName: "Arizona Business Alliance",   status: "online", statusType: "scheduled"   },
  { id: "11", name: "Bellwood Bistro & Bar",            businessType: "Restaurant & Café",          city: "San Francisco", state: "California",     groupName: "Roast & Co. Group",           status: "online", statusType: "published"   },
];

const STATS = [
  { label: "Published",    value: 75, icon: CheckCircle2, color: "teal"  },
  { label: "Scheduled",   value: 0,  icon: Clock,         color: "amber" },
  { label: "Draft",       value: 70, icon: FileText,       color: "gray"  },
  { label: "Live Domains",value: 9,  icon: Globe,          color: "blue"  },
];

export function SiteListPage() {
  const [searchQuery, setSearchQuery]   = useState("");
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());
  const [currentPage, setCurrentPage]   = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(8);

  const filteredSites = DUMMY_SITES.filter((site) =>
    site.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    site.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
    site.state.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalPages    = Math.ceil(filteredSites.length / itemsPerPage);
  const paginatedSites = filteredSites.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const toggleRowSelection = (id: string) => {
    const newSelected = new Set(selectedRows);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedRows(newSelected);
  };

  const toggleAllSelection = () => {
    if (selectedRows.size === paginatedSites.length) {
      setSelectedRows(new Set());
    } else {
      setSelectedRows(new Set(paginatedSites.map((s) => s.id)));
    }
  };

  const getColorClasses = (color: string) => {
    const colors: Record<string, { bg: string; icon: string; badge: string }> = {
      teal:  { bg: "bg-teal-50",  icon: "text-teal-600",  badge: "bg-teal-100"  },
      amber: { bg: "bg-amber-50", icon: "text-amber-600", badge: "bg-amber-100" },
      gray:  { bg: "bg-gray-50",  icon: "text-gray-600",  badge: "bg-gray-100"  },
      blue:  { bg: "bg-blue-50",  icon: "text-blue-600",  badge: "bg-blue-100"  },
    };
    return colors[color] || colors.gray;
  };

  return (
    <div className="flex-1 bg-white flex flex-col overflow-hidden">
      {/* Header Section - Fixed */}
      <div className="px-8 pt-8 pb-4 flex-shrink-0">
        {/* Stats Row */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          {STATS.map((stat) => {
            const colors = getColorClasses(stat.color);
            const Icon = stat.icon;
            return (
              <div key={stat.label} className={`${colors.bg} rounded-lg border border-gray-200 p-5 hover:border-gray-300 transition`}>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide">{stat.label}</p>
                    <p className="text-3xl font-bold text-gray-900 mt-2">{stat.value}</p>
                  </div>
                  <div className={`${colors.badge} rounded-lg p-2.5 flex-shrink-0`}>
                    <Icon className={`${colors.icon} w-5 h-5`} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Search & Filters */}
        <div className="flex gap-4">
          {/* Search */}
          <div className="relative flex-1 max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input
              type="text"
              placeholder="Search for Sites"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-600 focus:border-transparent"
            />
          </div>

          {/* Filter Dropdowns */}
          <button className="px-4 py-2.5 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition flex items-center gap-2">
            All Templates
            <ChevronDown size={16} className="text-gray-400" />
          </button>
          <button className="px-4 py-2.5 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition flex items-center gap-2">
            All States
            <ChevronDown size={16} className="text-gray-400" />
          </button>
          <button className="px-4 py-2.5 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition flex items-center gap-2">
            All Industries
            <ChevronDown size={16} className="text-gray-400" />
          </button>
          <button className="px-4 py-2.5 border border-gray-200 rounded-lg text-sm font-medium text-gray-400 hover:bg-gray-50 transition flex items-center gap-2 ml-auto">
            Allocate To
            <ChevronDown size={16} className="text-gray-400" />
          </button>
        </div>
      </div>

      {/* Table + Pagination — all inside one bordered card */}
      <div className="px-8 pb-8">
        <div className="border border-gray-200 rounded-xl overflow-hidden">

          {/* Table — fixed height = header (45.5px) + 8 rows (55px × 8 = 440px) = 486px */}
          <div className="overflow-auto" style={{ height: "486px" }}>
            <table className="w-full text-sm table-fixed border-collapse">
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

              <thead className="sticky top-0 z-10">
                <tr style={{ height: "41px" }} className="bg-gray-50 border-b border-gray-200">
                  <th className="px-4 py-3 text-left">
                    <input
                      type="checkbox"
                      checked={selectedRows.size === paginatedSites.length && paginatedSites.length > 0}
                      onChange={toggleAllSelection}
                      className="w-4 h-4 rounded border-gray-300 text-teal-600 focus:ring-teal-600"
                    />
                  </th>
                  {[
                    "Business Name", "Status", "Business Type", "City",
                    "State", "Group / Chain",
                  ].map((label) => (
                    <th key={label} className="px-4 py-3 text-left text-xs font-semibold text-gray-600 whitespace-nowrap">
                      <button className="inline-flex items-center gap-1 hover:text-gray-900 transition-colors">
                        {label} <ArrowUpDown size={11} className="text-gray-400" />
                      </button>
                    </th>
                  ))}
                  <th className="px-4 py-3 pr-6 text-right text-xs font-semibold text-gray-600">Actions</th>
                </tr>
              </thead>

              <tbody>
                {paginatedSites.map((site, idx) => (
                  <tr
                    key={site.id}
                    style={{ height: "55px" }}
                    className={`border-b border-gray-100 hover:bg-gray-50/70 transition-colors ${idx % 2 === 0 ? "bg-white" : "bg-gray-50/30"}`}
                  >
                    <td className="px-4 py-3.5">
                      <input
                        type="checkbox"
                        checked={selectedRows.has(site.id)}
                        onChange={() => toggleRowSelection(site.id)}
                        className="w-4 h-4 rounded border-gray-300 text-teal-600 focus:ring-teal-600"
                      />
                    </td>
                    <td className="px-4 py-3.5 font-medium text-gray-900 truncate">{site.name}</td>
                    <td className="px-4 py-3.5">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium whitespace-nowrap ${
                        site.statusType === "published" ? "bg-teal-50 text-teal-700"
                        : site.statusType === "scheduled" ? "bg-amber-50 text-amber-700"
                        : site.statusType === "draft" ? "bg-red-50 text-red-600"
                        : "bg-blue-50 text-blue-700"
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${
                          site.statusType === "scheduled" ? "bg-orange-400"
                          : site.statusType === "draft" ? "bg-red-400"
                          : site.status === "online" ? "bg-emerald-400"
                          : "bg-red-400"
                        }`} />
                        {site.statusType === "published" ? "Published"
                          : site.statusType === "scheduled" ? "Scheduled"
                          : site.statusType === "draft" ? "Draft"
                          : "Live Domain"}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-gray-600 truncate">{site.businessType}</td>
                    <td className="px-4 py-3.5 text-gray-600">{site.city}</td>
                    <td className="px-4 py-3.5 text-gray-600">{site.state}</td>
                    <td className="px-4 py-3.5 text-gray-600 truncate">{site.groupName || "---"}</td>
                    <td className="px-4 py-3.5 pr-6 text-right">
                      <button className="p-1.5 hover:bg-gray-200 rounded-md transition-colors">
                        <MoreVertical size={14} className="text-gray-400" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination — inside the card border */}
          <div className="px-5 py-3 border-t border-gray-200 bg-white flex items-center justify-between flex-shrink-0">
            <p className="text-xs text-gray-500">
              Page <span className="font-semibold text-gray-700">{currentPage}</span> of <span className="font-semibold text-gray-700">{totalPages}</span> pages
              <span className="ml-3 text-gray-400">·</span>
              <span className="ml-3">{(currentPage - 1) * itemsPerPage + 1}–{Math.min(currentPage * itemsPerPage, filteredSites.length)} of {filteredSites.length} results</span>
            </p>
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-gray-500 mr-2">Rows per page:
                <select
                  className="ml-1.5 text-xs font-medium text-gray-700 border border-gray-200 rounded-md px-1.5 py-0.5 bg-white focus:outline-none focus:ring-1 focus:ring-teal-500"
                  value={itemsPerPage}
                  onChange={(e) => { setItemsPerPage(Number(e.target.value)); setCurrentPage(1); }}
                >
                  <option>8</option>
                  <option>10</option>
                  <option>20</option>
                </select>
              </span>
              <button onClick={() => setCurrentPage(1)} disabled={currentPage === 1}
                className="w-7 h-7 flex items-center justify-center rounded-md border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition text-xs">
                «
              </button>
              <button onClick={() => setCurrentPage(Math.max(1, currentPage - 1))} disabled={currentPage === 1}
                className="w-7 h-7 flex items-center justify-center rounded-md border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition text-xs">
                ‹
              </button>
              {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => i + 1).map((page) => (
                <button key={page} onClick={() => setCurrentPage(page)}
                  className={`w-7 h-7 flex items-center justify-center rounded-md text-xs font-medium transition ${
                    page === currentPage
                      ? "bg-teal-600 text-white border border-teal-600"
                      : "border border-gray-200 text-gray-600 hover:bg-gray-50"
                  }`}>
                  {page}
                </button>
              ))}
              <button onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))} disabled={currentPage === totalPages}
                className="w-7 h-7 flex items-center justify-center rounded-md border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition text-xs">
                ›
              </button>
              <button onClick={() => setCurrentPage(totalPages)} disabled={currentPage === totalPages}
                className="w-7 h-7 flex items-center justify-center rounded-md border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition text-xs">
                »
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
