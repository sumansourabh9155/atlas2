/**
 * Site List Page
 * Professional table view for managing sites across all business types
 */

import React, { useState } from "react";
import { ChevronDown, MoreVertical, ArrowUpDown, Building2 } from "lucide-react";
import { KpiCard } from "../ui/KpiCard";
import { SearchInput } from "../ui/Input";
import { Button, IconButton } from "../ui/Button";
import { SiteStatusBadge } from "../ui/StatusBadge";
import { Table } from "../ui/Table";
import { CheckCircle2, Clock, FileText, Globe } from "lucide-react";
import type { KpiColor } from "../ui/KpiCard";

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

import type { LucideIcon } from "lucide-react";

const STATS: { label: string; value: number; icon: LucideIcon; color: KpiColor }[] = [
  { label: "Published",    value: 75, icon: CheckCircle2, color: "teal"  },
  { label: "Scheduled",   value: 0,  icon: Clock,         color: "amber" },
  { label: "Draft",       value: 70, icon: FileText,       color: "gray"  },
  { label: "Live Domains",value: 9,  icon: Globe,          color: "blue"  },
];

const HEADERS = ["Business Name", "Status", "Business Type", "City", "State", "Group / Chain"];

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

  const toggleRow = (id: string) => {
    const next = new Set(selectedRows);
    next.has(id) ? next.delete(id) : next.add(id);
    setSelectedRows(next);
  };

  const toggleAll = () => {
    setSelectedRows(
      selectedRows.size === paginatedSites.length
        ? new Set()
        : new Set(paginatedSites.map((s) => s.id))
    );
  };

  return (
    <div className="flex-1 bg-white flex flex-col overflow-hidden">
      {/* Header — Fixed */}
      <div className="px-8 pt-8 pb-4 flex-shrink-0">
        {/* Stats Row */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          {STATS.map((stat) => (
            <KpiCard key={stat.label} label={stat.label} value={stat.value} icon={stat.icon} color={stat.color} tinted />
          ))}
        </div>

        {/* Search & Filters */}
        <div className="flex gap-4">
          <SearchInput
            placeholder="Search for Sites"
            value={searchQuery}
            onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
            wrapperClassName="flex-1 max-w-xs"
          />
          {["All Templates", "All States", "All Industries"].map((label) => (
            <Button key={label} variant="secondary" size="lg" iconRight={ChevronDown}>
              {label}
            </Button>
          ))}
          <Button variant="secondary" size="lg" iconRight={ChevronDown} className="ml-auto text-gray-400">
            Allocate To
          </Button>
        </div>
      </div>

      {/* Table + Pagination */}
      <div className="px-8 pb-8">
        <Table.Wrapper>
          <div className="overflow-auto" style={{ height: "486px" }}>
            <Table.Root className="min-w-[760px] table-fixed">
              <colgroup>
                <col style={{ width: "40px" }} />
                <col style={{ width: "190px" }} />
                <col style={{ width: "110px" }} />
                <col style={{ width: "130px" }} />
                <col style={{ width: "90px" }} />
                <col style={{ width: "48px" }} />
                <col style={{ width: "150px" }} />
                <col style={{ width: "60px" }} />
              </colgroup>

              <Table.Header sticky>
                <Table.HeaderCell width="40px" className="px-4">
                  <input
                    type="checkbox"
                    checked={selectedRows.size === paginatedSites.length && paginatedSites.length > 0}
                    disabled={paginatedSites.length === 0}
                    onChange={toggleAll}
                    className="w-4 h-4 rounded border-gray-300 text-teal-600 focus:ring-teal-600 disabled:opacity-40 disabled:cursor-not-allowed"
                    aria-label="Select all sites"
                  />
                </Table.HeaderCell>
                {HEADERS.map((label) => (
                  <Table.HeaderCell key={label}>
                    <button className="inline-flex items-center gap-1 hover:text-gray-900 transition-colors">
                      {label} <ArrowUpDown size={11} className="text-gray-400" />
                    </button>
                  </Table.HeaderCell>
                ))}
                <Table.HeaderCell align="right">Actions</Table.HeaderCell>
              </Table.Header>

              <Table.Body>
                {paginatedSites.length === 0 ? (
                  <Table.EmptyState
                    colSpan={8}
                    icon={Building2}
                    title="No sites found"
                    subtitle="Try adjusting your search or filters."
                  />
                ) : paginatedSites.map((site, idx) => (
                  <Table.Row key={site.id} index={idx} style={{ height: "55px" }}>
                    <Table.Cell className="px-4">
                      <input
                        type="checkbox"
                        checked={selectedRows.has(site.id)}
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
                    <Table.Cell className="text-gray-600 truncate">{site.groupName || "---"}</Table.Cell>
                    <Table.Cell align="right">
                      <IconButton icon={MoreVertical} label={`Actions for ${site.name}`} />
                    </Table.Cell>
                  </Table.Row>
                ))}
              </Table.Body>
            </Table.Root>
          </div>

          <Table.Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={filteredSites.length}
            itemsPerPage={itemsPerPage}
            onPageChange={setCurrentPage}
            onItemsPerPageChange={(n) => { setItemsPerPage(n); setCurrentPage(1); }}
          />
        </Table.Wrapper>
      </div>
    </div>
  );
}
