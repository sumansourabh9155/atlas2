import { X } from "lucide-react";
import type { PetType } from "../../../types/clinic";

const ALL_PET_TYPES: { value: PetType; label: string; emoji: string }[] = [
  { value: "dog",          label: "Dogs",         emoji: "🐕" },
  { value: "cat",          label: "Cats",         emoji: "🐈" },
  { value: "bird",         label: "Birds",        emoji: "🦜" },
  { value: "rabbit",       label: "Rabbits",      emoji: "🐇" },
  { value: "reptile",      label: "Reptiles",     emoji: "🦎" },
  { value: "fish",         label: "Fish",         emoji: "🐟" },
  { value: "small_mammal", label: "Small Mammals",emoji: "🐹" },
  { value: "large_animal", label: "Large Animals",emoji: "🐴" },
  { value: "exotic",       label: "Exotics",      emoji: "🦔" },
];

interface Props {
  /** Controlled value — array of selected PetType strings */
  value: PetType[];
  onChange: (value: PetType[]) => void;
  /** Passed through as name attr for RHF compatibility */
  name?: string;
  error?: string;
}

export function PetTypeBadgeSelector({ value, onChange, name, error }: Props) {
  function toggle(petType: PetType) {
    if (value.includes(petType)) {
      onChange(value.filter((v) => v !== petType));
    } else {
      onChange([...value, petType]);
    }
  }

  return (
    <div className="flex flex-col gap-3">
      {/* Hidden input for native form / RHF compatibility */}
      <input type="hidden" name={name} value={value.join(",")} readOnly />

      {/* Badge chips */}
      <div
        className="flex flex-wrap gap-2"
        role="group"
        aria-label="Select pet types"
      >
        {ALL_PET_TYPES.map(({ value: petType, label, emoji }) => {
          const isSelected = value.includes(petType);
          return (
            <button
              key={petType}
              type="button"
              onClick={() => toggle(petType)}
              aria-pressed={isSelected}
              className={[
                "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium",
                "border transition-all duration-150 focus:outline-none",
                "focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:ring-offset-1",
                isSelected
                  ? "bg-teal-600 border-teal-600 text-white shadow-sm"
                  : "bg-white border-gray-300 text-gray-600 hover:border-teal-400 hover:text-teal-700 hover:bg-teal-50",
              ].join(" ")}
            >
              <span aria-hidden="true">{emoji}</span>
              {label}
              {isSelected && (
                <X
                  className="w-3.5 h-3.5 opacity-70"
                  aria-hidden="true"
                />
              )}
            </button>
          );
        })}
      </div>

      {/* Selected count + clear */}
      {value.length > 0 && (
        <div className="flex items-center justify-between">
          <p className="text-xs text-gray-500">
            {value.length} type{value.length !== 1 ? "s" : ""} selected
          </p>
          <button
            type="button"
            onClick={() => onChange([])}
            className="text-xs text-gray-400 hover:text-red-500 transition-colors underline-offset-2 hover:underline"
          >
            Clear all
          </button>
        </div>
      )}

      {error && (
        <p className="text-xs text-red-500" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
