import { useState, useRef, useEffect } from "react";
import { Plus, X, ChevronDown, Copy, Sun } from "lucide-react";
import { Toggle } from "./Toggle";

// ─── Types ────────────────────────────────────────────────────────────────────

export type TimeSlot = { open: string; close: string };

export interface DayConfig {
  isClosed: boolean;
  is24Hours: boolean;
  slots: TimeSlot[];
}

export type DayKey =
  | "monday" | "tuesday" | "wednesday" | "thursday"
  | "friday" | "saturday" | "sunday";

export type WeekSchedule = Record<DayKey, DayConfig>;

// ─── Constants ────────────────────────────────────────────────────────────────

const DAYS: DayKey[] = [
  "monday", "tuesday", "wednesday", "thursday",
  "friday", "saturday", "sunday",
];

const DAY_LABELS: Record<DayKey, { short: string; long: string }> = {
  monday:    { short: "Mon", long: "Monday" },
  tuesday:   { short: "Tue", long: "Tuesday" },
  wednesday: { short: "Wed", long: "Wednesday" },
  thursday:  { short: "Thu", long: "Thursday" },
  friday:    { short: "Fri", long: "Friday" },
  saturday:  { short: "Sat", long: "Saturday" },
  sunday:    { short: "Sun", long: "Sunday" },
};

const DEFAULT_OPEN_DAY: DayConfig = {
  isClosed: false,
  is24Hours: false,
  slots: [{ open: "09:00", close: "17:00" }],
};

export const DEFAULT_WEEK_SCHEDULE: WeekSchedule = {
  monday:    { isClosed: false, is24Hours: false, slots: [{ open: "09:00", close: "17:00" }] },
  tuesday:   { isClosed: false, is24Hours: false, slots: [{ open: "09:00", close: "17:00" }] },
  wednesday: { isClosed: false, is24Hours: false, slots: [{ open: "09:00", close: "17:00" }] },
  thursday:  { isClosed: false, is24Hours: false, slots: [{ open: "09:00", close: "17:00" }] },
  friday:    { isClosed: false, is24Hours: false, slots: [{ open: "09:00", close: "17:00" }] },
  saturday:  { isClosed: false, is24Hours: false, slots: [{ open: "10:00", close: "14:00" }] },
  sunday:    { isClosed: true,  is24Hours: false, slots: [{ open: "10:00", close: "14:00" }] },
};

// Presets
type PresetKey = "business" | "extended" | "emergency" | "clear";

function buildPreset(key: PresetKey): WeekSchedule {
  const closed: DayConfig = {
    isClosed: true, is24Hours: false,
    slots: [{ open: "09:00", close: "17:00" }],
  };
  const open9to5: DayConfig = {
    isClosed: false, is24Hours: false,
    slots: [{ open: "09:00", close: "17:00" }],
  };
  const open8to7: DayConfig = {
    isClosed: false, is24Hours: false,
    slots: [{ open: "08:00", close: "19:00" }],
  };
  const allDay: DayConfig = {
    isClosed: false, is24Hours: true, slots: [],
  };

  const PRESETS: Record<PresetKey, WeekSchedule> = {
    business: {
      monday: open9to5, tuesday: open9to5, wednesday: open9to5,
      thursday: open9to5, friday: open9to5,
      saturday: closed, sunday: closed,
    },
    extended: {
      monday: open8to7, tuesday: open8to7, wednesday: open8to7,
      thursday: open8to7, friday: open8to7, saturday: open8to7,
      sunday: closed,
    },
    emergency: DAYS.reduce(
      (acc, d) => ({ ...acc, [d]: allDay }), {} as WeekSchedule
    ),
    clear: DAYS.reduce(
      (acc, d) => ({ ...acc, [d]: closed }), {} as WeekSchedule
    ),
  };
  return PRESETS[key];
}

// ─── Time input helper ─────────────────────────────────────────────────────────

const INPUT_CLS =
  "h-8 px-2.5 text-sm border border-gray-300 rounded-lg bg-white " +
  "focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 " +
  "transition-colors tabular-nums";

// ─── DayRow ───────────────────────────────────────────────────────────────────

interface DayRowProps {
  day: DayKey;
  config: DayConfig;
  onToggleClosed: () => void;
  onToggle24Hours: () => void;
  onUpdateSlot: (i: number, f: "open" | "close", v: string) => void;
  onAddSlot: () => void;
  onRemoveSlot: (i: number) => void;
  onCopyToWeekdays?: () => void;
}

function DayRow({
  day, config,
  onToggleClosed, onToggle24Hours,
  onUpdateSlot, onAddSlot, onRemoveSlot,
  onCopyToWeekdays,
}: DayRowProps) {
  const isOpen = !config.isClosed;
  const { short, long } = DAY_LABELS[day];

  return (
    <div
      className={[
        "grid gap-x-3 gap-y-2 py-3.5 px-4",
        "border-b border-gray-100 last:border-0",
        config.isClosed ? "opacity-60" : "",
      ].join(" ")}
      style={{ gridTemplateColumns: "3rem 5.5rem 1fr auto" }}
    >
      {/* Day label */}
      <span className="self-center text-sm font-semibold text-gray-700">
        {short}
      </span>

      {/* Open / Closed toggle */}
      <div className="flex items-center gap-2 self-center">
        <Toggle
          checked={isOpen}
          onChange={onToggleClosed}
          label={`Toggle ${long} ${isOpen ? "closed" : "open"}`}
        />
        <span
          className={`text-xs font-medium w-10 ${
            isOpen ? "text-gray-800" : "text-gray-400"
          }`}
        >
          {isOpen ? "Open" : "Closed"}
        </span>
      </div>

      {/* Time configuration */}
      <div className="col-span-2">
        {isOpen && (
          <div className="flex flex-col gap-2">
            {/* 24h toggle */}
            <label className="inline-flex items-center gap-2 cursor-pointer self-start">
              <input
                type="checkbox"
                checked={config.is24Hours}
                onChange={onToggle24Hours}
                className="h-3.5 w-3.5 rounded border-gray-300 text-teal-600 focus:ring-teal-500 cursor-pointer"
                aria-label={`${long}: open 24 hours`}
              />
              <span className="text-xs text-gray-600 select-none">All day (24 hrs)</span>
            </label>

            {/* 24h indicator */}
            {config.is24Hours && (
              <span className="inline-flex items-center gap-1.5 text-xs font-medium text-teal-700 bg-teal-50 border border-teal-100 px-2.5 py-1 rounded-lg self-start">
                <Sun className="w-3 h-3" aria-hidden="true" />
                Open 24 hours
              </span>
            )}

            {/* Time slots */}
            {!config.is24Hours && (
              <div className="flex flex-col gap-1.5">
                {config.slots.map((slot, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <input
                      type="time"
                      value={slot.open}
                      onChange={(e) => onUpdateSlot(i, "open", e.target.value)}
                      className={INPUT_CLS}
                      aria-label={`${long} open time, slot ${i + 1}`}
                    />
                    <span className="text-gray-400 text-sm select-none" aria-hidden="true">
                      —
                    </span>
                    <input
                      type="time"
                      value={slot.close}
                      onChange={(e) => onUpdateSlot(i, "close", e.target.value)}
                      className={INPUT_CLS}
                      aria-label={`${long} close time, slot ${i + 1}`}
                    />
                    {config.slots.length > 1 && (
                      <button
                        type="button"
                        onClick={() => onRemoveSlot(i)}
                        className="p-1 rounded-md text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                        aria-label={`Remove time slot ${i + 1} for ${long}`}
                      >
                        <X className="w-3.5 h-3.5" aria-hidden="true" />
                      </button>
                    )}
                  </div>
                ))}

                {config.slots.length < 3 && (
                  <button
                    type="button"
                    onClick={onAddSlot}
                    className="inline-flex items-center gap-1 text-xs font-medium text-teal-600 hover:text-teal-700 self-start mt-0.5 focus:outline-none focus-visible:underline"
                  >
                    <Plus className="w-3.5 h-3.5" aria-hidden="true" />
                    Add time slot
                  </button>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Copy-to-weekdays action (Monday only) */}
      {day === "monday" && isOpen && onCopyToWeekdays && (
        <div className="col-start-3 col-span-2 mt-1">
          <button
            type="button"
            onClick={onCopyToWeekdays}
            className="inline-flex items-center gap-1 text-xs text-gray-400 hover:text-teal-600 transition-colors focus:outline-none focus-visible:underline"
          >
            <Copy className="w-3 h-3" aria-hidden="true" />
            Apply to Tue–Fri
          </button>
        </div>
      )}
    </div>
  );
}

// ─── QuickSetMenu ─────────────────────────────────────────────────────────────

const PRESETS: { id: PresetKey; label: string }[] = [
  { id: "business",  label: "Business hours (Mon–Fri, 9–5)" },
  { id: "extended",  label: "Extended hours (Mon–Sat, 8–7)" },
  { id: "emergency", label: "24/7 Emergency (all days)" },
  { id: "clear",     label: "Close all days" },
];

interface QuickSetMenuProps {
  onApply: (preset: PresetKey) => void;
}

function QuickSetMenu({ onApply }: QuickSetMenuProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="menu"
        aria-expanded={open}
        className={[
          "inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg border",
          "bg-white text-gray-600 border-gray-200 hover:bg-gray-50 hover:border-gray-300",
          "transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-500",
        ].join(" ")}
      >
        Quick set
        <ChevronDown
          className={`w-3.5 h-3.5 transition-transform ${open ? "rotate-180" : ""}`}
          aria-hidden="true"
        />
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 top-full mt-1.5 w-56 bg-white border border-gray-200 rounded-xl shadow-lg z-20 py-1 overflow-hidden"
        >
          {PRESETS.map(({ id, label }) => (
            <button
              key={id}
              type="button"
              role="menuitem"
              onClick={() => { onApply(id); setOpen(false); }}
              className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
            >
              {label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── OperatingHoursEditor (public API) ────────────────────────────────────────

interface Props {
  value?: WeekSchedule;
  onChange?: (schedule: WeekSchedule) => void;
  /** name prefix for hidden inputs, for native form / RHF compat */
  name?: string;
}

export function OperatingHoursEditor({ value, onChange, name = "businessHours" }: Props) {
  const [schedule, setSchedule] = useState<WeekSchedule>(
    value ?? DEFAULT_WEEK_SCHEDULE
  );

  function commit(next: WeekSchedule) {
    setSchedule(next);
    onChange?.(next);
  }

  function toggleClosed(day: DayKey) {
    commit({ ...schedule, [day]: { ...schedule[day], isClosed: !schedule[day].isClosed } });
  }

  function toggle24Hours(day: DayKey) {
    commit({ ...schedule, [day]: { ...schedule[day], is24Hours: !schedule[day].is24Hours } });
  }

  function updateSlot(day: DayKey, i: number, field: "open" | "close", val: string) {
    const slots = schedule[day].slots.map((s, idx) =>
      idx === i ? { ...s, [field]: val } : s
    );
    commit({ ...schedule, [day]: { ...schedule[day], slots } });
  }

  function addSlot(day: DayKey) {
    const slots = [...schedule[day].slots, { open: "09:00", close: "17:00" }];
    commit({ ...schedule, [day]: { ...schedule[day], slots } });
  }

  function removeSlot(day: DayKey, i: number) {
    const slots = schedule[day].slots.filter((_, idx) => idx !== i);
    commit({ ...schedule, [day]: { ...schedule[day], slots } });
  }

  function copyMonToWeekdays() {
    const monCfg = schedule.monday;
    const weekdays: DayKey[] = ["tuesday", "wednesday", "thursday", "friday"];
    const next = { ...schedule };
    weekdays.forEach((d) => {
      next[d] = { ...monCfg, slots: monCfg.slots.map((s) => ({ ...s })) };
    });
    commit(next);
  }

  return (
    <div className="flex flex-col gap-3">
      {/* Toolbar */}
      <div className="flex items-center justify-between">
        <p className="text-xs text-gray-500">
          Toggle each day and configure time slots. Max 3 slots per day.
        </p>
        <QuickSetMenu onApply={(preset) => commit(buildPreset(preset))} />
      </div>

      {/* Day rows */}
      <div className="border border-gray-200 rounded-xl overflow-hidden bg-white">
        {DAYS.map((day) => (
          <DayRow
            key={day}
            day={day}
            config={schedule[day]}
            onToggleClosed={() => toggleClosed(day)}
            onToggle24Hours={() => toggle24Hours(day)}
            onUpdateSlot={(i, f, v) => updateSlot(day, i, f, v)}
            onAddSlot={() => addSlot(day)}
            onRemoveSlot={(i) => removeSlot(day, i)}
            onCopyToWeekdays={day === "monday" ? copyMonToWeekdays : undefined}
          />
        ))}
      </div>

      {/* Hidden serialised value for native form submission */}
      <input
        type="hidden"
        name={name}
        value={JSON.stringify(schedule)}
        readOnly
        aria-hidden="true"
      />
    </div>
  );
}
