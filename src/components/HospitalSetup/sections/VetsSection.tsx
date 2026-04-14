import { DualPanelPicker } from "../ui/DualPanelPicker";
import type { ClinicVetsConfig } from "../../../context/ClinicContext";
import { VET_PICKER_ITEMS } from "../../../data/catalogue";
import { useReviewMode } from "../../../context/ReviewModeContext";
import { FieldReviewHint } from "../../ui/FieldReviewHint";

// ─── VetsSection ──────────────────────────────────────────────────────────────

interface Props {
  data: ClinicVetsConfig;
  onChange: (patch: Partial<ClinicVetsConfig>) => void;
}

export function VetsSection({ data, onChange }: Props) {
  const reviewMode = useReviewMode();
  return (
    <>
      <div className={reviewMode.getFieldHighlightClass("veterinarians")}>
        <DualPanelPicker
          items={VET_PICKER_ITEMS}
          selectedIds={data.selectedVetIds}
          onChange={(ids) => onChange({ selectedVetIds: ids })}
          searchPlaceholder="Search team members"
          columnLabel="Team Member Name"
        />
      </div>
      <FieldReviewHint path="veterinarians" />
    </>
  );
}
