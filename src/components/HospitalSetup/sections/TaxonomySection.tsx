import { Tags } from "lucide-react";
import { FormField } from "../ui/FormField";
import { PetTypeBadgeSelector } from "../ui/PetTypeBadgeSelector";
import type { PetType } from "../../../types/clinic";

import { surface } from "../../../lib/styles/tokens";

const CARD = surface.section;

export interface TaxonomyData {
  petTypes: PetType[];
}

interface Props {
  data: TaxonomyData;
  onChange: (updates: Partial<TaxonomyData>) => void;
}

export function TaxonomySection({ data, onChange }: Props) {
  return (
    <div className={CARD}>
      <div className="flex items-start gap-3 pb-4 border-b border-gray-100">
        <span className="p-2 rounded-lg bg-gray-50 border border-gray-200 text-gray-500 shrink-0">
          <Tags className="w-4 h-4" aria-hidden="true" />
        </span>
        <div>
          <h3 className="text-sm font-semibold text-gray-900">
            Specialisations & Focus Areas
          </h3>
          <p className="mt-0.5 text-xs text-gray-500">
            Select every category your business serves. This powers directory
            search filters and the Services page.
          </p>
        </div>
      </div>

      <FormField
        label="Service Categories"
        hint="Click to select. You can choose multiple."
        required
      >
        <PetTypeBadgeSelector
          name="petTypes"
          value={data.petTypes}
          onChange={(petTypes) => onChange({ petTypes })}
        />
      </FormField>

      {/* Informational callout */}
      {data.petTypes.length === 0 && (
        <div className="flex items-start gap-2.5 p-3 bg-amber-50 border border-amber-200 rounded-lg">
          <span className="text-amber-500 text-base leading-none" aria-hidden="true">⚠</span>
          <p className="text-xs text-amber-700">
            Select at least one category before publishing. This is required to
            appear in the directory.
          </p>
        </div>
      )}
    </div>
  );
}
