import { useState } from "react";
import { ChevronDown, ChevronUp, Info, Plus, Trash2 } from "lucide-react";
import { Toggle } from "../ui/Toggle";
import { DualPanelPicker } from "../ui/DualPanelPicker";
import type { ClinicServicesConfig, ServiceGroup } from "../../../context/ClinicContext";
import { SERVICE_PICKER_ITEMS } from "../../../data/catalogue";

// ─── ServicesSection ──────────────────────────────────────────────────────────

interface Props {
  data: ClinicServicesConfig;
  onChange: (patch: Partial<ClinicServicesConfig>) => void;
}

export function ServicesSection({ data, onChange }: Props) {
  // Track which groups are expanded (all open by default)
  const [expandedIds, setExpandedIds] = useState<Set<string>>(
    () => new Set(data.serviceGroups.map((g) => g.id))
  );

  function toggleExpand(id: string) {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function updateGroup(id: string, patch: Partial<ServiceGroup>) {
    onChange({
      serviceGroups: data.serviceGroups.map((g) =>
        g.id === id ? { ...g, ...patch } : g
      ),
    });
  }

  function addGroup() {
    const newGroup: ServiceGroup = {
      id: `grp-${Date.now()}`,
      enabled: true,
      name: "",
      selectedServiceIds: [],
    };
    onChange({ serviceGroups: [...data.serviceGroups, newGroup] });
    setExpandedIds((prev) => new Set([...prev, newGroup.id]));
  }

  function removeGroup(id: string) {
    onChange({ serviceGroups: data.serviceGroups.filter((g) => g.id !== id) });
    setExpandedIds((prev) => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
  }

  return (
    <div className="flex flex-col gap-4">

      {/* ── Pricing document URL ── */}
      <div className="flex items-center gap-3 px-4 py-3 bg-blue-50 border border-blue-100 rounded-xl">
        <Info className="w-4 h-4 text-blue-400 shrink-0" aria-hidden="true" />
        <input
          type="url"
          value={data.pricingUrl}
          onChange={(e) => onChange({ pricingUrl: e.target.value })}
          placeholder="PDF file or link that contains location pricing information"
          className="flex-1 text-sm text-blue-900 bg-transparent focus:outline-none placeholder:text-blue-400/70 min-w-0"
        />
      </div>

      {/* ── Service Pricing toggle ── */}
      <div className="bg-white border border-gray-200 rounded-xl px-5 py-4 flex items-center justify-between">
        <p className="text-sm font-medium text-gray-900">Service Pricing</p>
        <Toggle
          checked={data.pricingEnabled}
          onChange={(v) => onChange({ pricingEnabled: v })}
          label="Service Pricing"
        />
      </div>

      {/* ── Service groups ── */}
      {data.serviceGroups.map((group, idx) => {
        const isExpanded = expandedIds.has(group.id);
        const selectedCount = group.selectedServiceIds.length;

        return (
          <div
            key={group.id}
            className="bg-white border border-gray-200 rounded-xl overflow-hidden"
          >
            {/* Group header row */}
            <div className="flex items-center gap-3 px-4 py-3.5">
              <Toggle
                checked={group.enabled}
                onChange={(v) => updateGroup(group.id, { enabled: v })}
                label={`Service group ${idx + 1}`}
              />

              <span className="text-sm font-semibold text-gray-600 shrink-0 select-none">
                Service-{idx + 1}:
              </span>

              <input
                type="text"
                value={group.name}
                onChange={(e) => updateGroup(group.id, { name: e.target.value })}
                placeholder="Group name  (e.g. Specialty)"
                className="flex-1 h-8 px-3 text-sm text-gray-900 bg-gray-50 border border-gray-200 rounded-lg placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500/60 focus:border-teal-500 transition-colors min-w-0"
              />

              {/* Service count badge */}
              {selectedCount > 0 && (
                <span className="shrink-0 px-2 py-0.5 rounded-full bg-teal-50 border border-teal-200 text-[10px] font-semibold text-teal-700 whitespace-nowrap">
                  {selectedCount} services
                </span>
              )}

              {/* Delete group (only if more than 1 group) */}
              {data.serviceGroups.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeGroup(group.id)}
                  className="shrink-0 w-7 h-7 rounded-md flex items-center justify-center text-gray-300 hover:text-red-500 hover:bg-red-50 transition-colors"
                  aria-label="Remove service group"
                >
                  <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
                </button>
              )}

              {/* Expand / collapse */}
              <button
                type="button"
                onClick={() => toggleExpand(group.id)}
                className="shrink-0 w-7 h-7 rounded-md flex items-center justify-center text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
                aria-label={isExpanded ? "Collapse" : "Expand"}
              >
                {isExpanded
                  ? <ChevronUp   className="w-4 h-4" aria-hidden="true" />
                  : <ChevronDown className="w-4 h-4" aria-hidden="true" />
                }
              </button>
            </div>

            {/* Dual-panel picker (collapsible) */}
            {isExpanded && (
              <div className="border-t border-gray-100">
                <DualPanelPicker
                  items={SERVICE_PICKER_ITEMS}
                  selectedIds={group.selectedServiceIds}
                  onChange={(ids) => updateGroup(group.id, { selectedServiceIds: ids })}
                  searchPlaceholder="Search for Service"
                  columnLabel="Service Name"
                />
              </div>
            )}
          </div>
        );
      })}

      {/* ── Add service group ── */}
      <button
        type="button"
        onClick={addGroup}
        className="flex items-center justify-center gap-2 py-3.5 border border-dashed border-gray-300 rounded-xl text-sm font-medium text-gray-500 hover:text-teal-600 hover:border-teal-400 hover:bg-teal-50/30 transition-all"
      >
        <Plus className="w-4 h-4" aria-hidden="true" />
        Add Service Group
      </button>
    </div>
  );
}
