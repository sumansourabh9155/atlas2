import { Clock } from "lucide-react";
import { OperatingHoursEditor, type WeekSchedule } from "../ui/OperatingHoursEditor";
import { useReviewMode } from "../../../context/ReviewModeContext";
import { FieldReviewHint } from "../../ui/FieldReviewHint";

interface Props {
  value?: WeekSchedule;
  onChange?: (schedule: WeekSchedule) => void;
}

export function OperatingHoursSection({ value, onChange }: Props) {
  const reviewMode = useReviewMode();
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6 flex flex-col gap-5">
      {/* Header */}
      <div className="flex items-start gap-3 pb-4 border-b border-gray-100">
        <span className="p-2 rounded-lg bg-gray-50 border border-gray-200 text-gray-500 shrink-0">
          <Clock className="w-4 h-4" aria-hidden="true" />
        </span>
        <div>
          <h3 className="text-sm font-semibold text-gray-900">
            Operating Hours
          </h3>
          <p className="mt-0.5 text-xs text-gray-500">
            Set your availability. These hours appear on your contact page and
            in Google Business structured data.
          </p>
        </div>
      </div>

      <div className={reviewMode.getFieldHighlightClass("contact.businessHours")}>
        <OperatingHoursEditor
          value={value}
          onChange={onChange}
          name="businessHours"
        />
      </div>
      <FieldReviewHint path="contact.businessHours" />

      {/* Tip */}
      <div className="flex items-start gap-2.5 p-3 bg-blue-50 border border-blue-100 rounded-lg">
        <span className="text-blue-500 text-sm leading-none mt-0.5" aria-hidden="true">ℹ</span>
        <p className="text-xs text-blue-700">
          If your clinic has a dedicated emergency line, mark every day as{" "}
          <strong>Open 24 hours</strong> or add an after-hours note in your{" "}
          contact section.
        </p>
      </div>
    </div>
  );
}
