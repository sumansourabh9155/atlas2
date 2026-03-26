import { DualPanelPicker } from "../ui/DualPanelPicker";
import type { ClinicVetsConfig } from "../../../context/ClinicContext";
import { VET_PICKER_ITEMS } from "../../../data/catalogue";

// ─── VetsSection ──────────────────────────────────────────────────────────────

interface Props {
  data: ClinicVetsConfig;
  onChange: (patch: Partial<ClinicVetsConfig>) => void;
}

export function VetsSection({ data, onChange }: Props) {
  return (
    <DualPanelPicker
      items={VET_PICKER_ITEMS}
      selectedIds={data.selectedVetIds}
      onChange={(ids) => onChange({ selectedVetIds: ids })}
      searchPlaceholder="Search team members"
      columnLabel="Team Member Name"
    />
  );
}
