// ─── Contact Split Section ────────────────────────────────────────────────────
// Left: contact info + hours | Right: contact form

const NAVY = "#1B2B4B";
const AMBER = "#F59E0B";
const TEAL = "#0F766E";

const INPUT =
  "w-full h-8 px-2.5 text-sm text-gray-900 bg-white border border-gray-200 rounded-md " +
  "placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-600 " +
  "focus:border-teal-600 transition-colors";

const TEXTAREA =
  "w-full px-2.5 py-1.5 text-sm text-gray-900 bg-white border border-gray-200 rounded-md " +
  "placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-600 " +
  "focus:border-teal-600 transition-colors resize-none";

const LABEL = "block text-xs font-medium text-gray-600 mb-1";

export interface ContactFormField {
  id: string;
  label: string;
  type: "text" | "email" | "tel" | "textarea" | "select";
  placeholder: string;
  required: boolean;
  options?: string; // comma-separated, for select type
}

export interface ContactSplitState {
  heading: string;
  subtext: string;
  phone: string;
  email: string;
  address: string;
  hours: string;
  emergencyNote: string;
  formHeading: string;
  submitLabel: string;
  formFields: ContactFormField[];
  accentColor: "navy" | "teal" | "amber";
  bgStyle: "white" | "light" | "dark" | "navy";
  formPosition: "right" | "left";
}

const DEFAULT_FIELDS: ContactFormField[] = [
  { id: "name",    label: "Full name",     type: "text",     placeholder: "Dr. Jane Smith",          required: true  },
  { id: "email",   label: "Email address", type: "email",    placeholder: "jane@example.com",        required: true  },
  { id: "phone",   label: "Phone number",  type: "tel",      placeholder: "(512) 555-0100",          required: false },
  { id: "pet",     label: "Pet type",      type: "select",   placeholder: "Select one",              required: false, options: "Dog, Cat, Bird, Rabbit, Other" },
  { id: "message", label: "Message",       type: "textarea", placeholder: "How can we help you?",   required: true  },
];

export function createDefaultContactSplit(): ContactSplitState {
  return {
    heading: "Get in Touch",
    subtext: "We're here to help. Reach out via phone, email, or the form — our team typically responds within 2 hours.",
    phone: "(512) 555-0100",
    email: "hello@austinpaws.vet",
    address: "1234 Paws Boulevard\nAustin, TX 78701",
    hours: "Mon – Fri: 7:00 AM – 7:00 PM\nSat – Sun: 8:00 AM – 5:00 PM",
    emergencyNote: "Emergency line available 24/7",
    formHeading: "Send Us a Message",
    submitLabel: "Send Message",
    formFields: DEFAULT_FIELDS,
    accentColor: "teal",
    bgStyle: "light",
    formPosition: "right",
  };
}

function getBg(bgStyle: string, isDark: boolean): string {
  if (isDark) return bgStyle === "navy" ? "#0b1628" : bgStyle === "dark" ? "#0f172a" : "#1e293b";
  switch (bgStyle) {
    case "white": return "#ffffff";
    case "light": return "#f8f9fb";
    case "dark":  return "#1e293b";
    case "navy":  return NAVY;
    default:      return "#f8f9fb";
  }
}

function isDarkBg(bgStyle: string, isDark: boolean): boolean {
  return isDark || bgStyle === "dark" || bgStyle === "navy";
}

const ACCENT_MAP: Record<ContactSplitState["accentColor"], string> = {
  navy: NAVY,
  teal: TEAL,
  amber: AMBER,
};

// ─── Renderer ──────────────────────────────────────────────────────────────────

export function ContactSplitSectionRenderer({
  state, isDark, compact,
}: { state: ContactSplitState; isDark: boolean; compact: boolean }) {
  const bg = getBg(state.bgStyle, isDark);
  const dark = isDarkBg(state.bgStyle, isDark);
  const accent = ACCENT_MAP[state.accentColor];
  const isFormLeft = state.formPosition === "left";

  const cardBg = dark ? "#1e293b" : "#ffffff";
  const cardBorder = dark ? "rgba(255,255,255,0.07)" : "#e5e7eb";
  const inputStyle = {
    background: dark ? "#0f172a" : "#f9fafb",
    border: `1px solid ${dark ? "rgba(255,255,255,0.1)" : "#d1d5db"}`,
    color: dark ? "#e2e8f0" : "#111827",
  };

  const infoBlock = (
    <div className="flex flex-col gap-6">
      {(state.heading || state.subtext) && (
        <div>
          {state.heading && (
            <h2 className={`font-extrabold ${compact ? "text-xl" : "text-2xl"} mb-2`}
              style={{ color: dark ? "#f1f5f9" : "#111827" }}>
              {state.heading}
            </h2>
          )}
          {state.subtext && (
            <p className="text-sm leading-relaxed" style={{ color: dark ? "#94a3b8" : "#6b7280" }}>
              {state.subtext}
            </p>
          )}
        </div>
      )}

      {/* Contact details */}
      {[
        { icon: "📞", lines: [state.phone] },
        { icon: "✉️",  lines: [state.email] },
        { icon: "📍", lines: state.address.split("\n").filter(Boolean) },
        { icon: "🕐", lines: [...state.hours.split("\n").filter(Boolean), state.emergencyNote].filter(Boolean) },
      ].filter(item => item.lines.some(Boolean)).map((item, i) => (
        <div key={i} className="flex gap-3">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center text-lg shrink-0"
            style={{ background: dark ? "rgba(255,255,255,0.06)" : "#f3f4f6" }}
          >
            {item.icon}
          </div>
          <div className="flex flex-col justify-center">
            {item.lines.map((line, j) => (
              <p key={j} className={`text-sm ${j === 0 ? "font-medium" : ""} leading-relaxed`}
                style={{ color: dark ? (j === 0 ? "#e2e8f0" : "#64748b") : (j === 0 ? "#374151" : "#9ca3af") }}>
                {line}
              </p>
            ))}
          </div>
        </div>
      ))}
    </div>
  );

  const formBlock = (
    <div
      className="rounded-2xl p-6 flex flex-col gap-4"
      style={{ background: cardBg, border: `1px solid ${cardBorder}` }}
    >
      {state.formHeading && (
        <h3 className="font-bold text-lg mb-1" style={{ color: dark ? "#f1f5f9" : "#111827" }}>
          {state.formHeading}
        </h3>
      )}
      {state.formFields.map((field) => (
        <div key={field.id}>
          <label className="block text-xs font-medium mb-1" style={{ color: dark ? "#94a3b8" : "#6b7280" }}>
            {field.label}{field.required && <span className="text-red-400 ml-0.5">*</span>}
          </label>
          {field.type === "textarea" ? (
            <textarea
              placeholder={field.placeholder}
              rows={4}
              disabled
              className="w-full px-3 py-2 rounded-lg text-sm resize-none"
              style={{ ...inputStyle, opacity: 0.8 }}
            />
          ) : field.type === "select" ? (
            <select
              disabled
              className="w-full h-9 px-3 rounded-lg text-sm"
              style={{ ...inputStyle, opacity: 0.8 }}
            >
              <option>{field.placeholder}</option>
              {(field.options || "").split(",").map(o => (
                <option key={o.trim()}>{o.trim()}</option>
              ))}
            </select>
          ) : (
            <input
              type={field.type}
              placeholder={field.placeholder}
              disabled
              className="w-full h-9 px-3 rounded-lg text-sm"
              style={{ ...inputStyle, opacity: 0.8 }}
            />
          )}
        </div>
      ))}
      <button
        type="button"
        disabled
        className="w-full py-2.5 rounded-xl text-sm font-bold text-white mt-1"
        style={{ background: accent }}
      >
        {state.submitLabel}
      </button>
    </div>
  );

  return (
    <section
      className="px-6 py-14"
      style={{ background: bg, borderTop: `1px solid ${dark ? "rgba(255,255,255,0.06)" : "#f0f0f2"}` }}
      aria-label="Contact Split"
    >
      <div className="max-w-5xl mx-auto">
        <div
          className={`grid gap-10 ${compact ? "grid-cols-1" : "grid-cols-2"}`}
        >
          {isFormLeft ? (
            <>
              <div>{formBlock}</div>
              <div className="flex items-start">{infoBlock}</div>
            </>
          ) : (
            <>
              <div className="flex items-start">{infoBlock}</div>
              <div>{formBlock}</div>
            </>
          )}
        </div>
      </div>
    </section>
  );
}

// ─── Editor ───────────────────────────────────────────────────────────────────

export function ContactSplitEditor({
  state, onChange,
}: { state: ContactSplitState; onChange: (u: Partial<ContactSplitState>) => void }) {
  function updateField(idx: number, key: keyof ContactFormField, val: string | boolean) {
    const next = state.formFields.map((f, i) => i === idx ? { ...f, [key]: val } : f);
    onChange({ formFields: next });
  }

  function addField() {
    const newField: ContactFormField = {
      id: `field-${Date.now()}`,
      label: "New Field",
      type: "text",
      placeholder: "Enter value",
      required: false,
    };
    onChange({ formFields: [...state.formFields, newField] });
  }

  function removeField(idx: number) {
    if (state.formFields.length <= 1) return;
    onChange({ formFields: state.formFields.filter((_, i) => i !== idx) });
  }

  return (
    <div className="flex flex-col gap-4 px-4 pb-4 pt-1">
      {/* Info side */}
      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Info Side</p>
      <div>
        <label className={LABEL}>Heading</label>
        <input type="text" value={state.heading} onChange={(e) => onChange({ heading: e.target.value })} className={INPUT} placeholder="Get in Touch" />
      </div>
      <div>
        <label className={LABEL}>Subtext</label>
        <textarea value={state.subtext} onChange={(e) => onChange({ subtext: e.target.value })} rows={2} className={TEXTAREA} placeholder="Brief intro…" />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={LABEL}>Phone</label>
          <input type="text" value={state.phone} onChange={(e) => onChange({ phone: e.target.value })} className={INPUT} placeholder="(512) 555-0100" />
        </div>
        <div>
          <label className={LABEL}>Email</label>
          <input type="text" value={state.email} onChange={(e) => onChange({ email: e.target.value })} className={INPUT} placeholder="hello@clinic.vet" />
        </div>
      </div>
      <div>
        <label className={LABEL}>Address (line breaks OK)</label>
        <textarea value={state.address} onChange={(e) => onChange({ address: e.target.value })} rows={2} className={TEXTAREA} placeholder="123 Main St&#10;Austin, TX 78701" />
      </div>
      <div>
        <label className={LABEL}>Hours (line breaks OK)</label>
        <textarea value={state.hours} onChange={(e) => onChange({ hours: e.target.value })} rows={2} className={TEXTAREA} placeholder="Mon–Fri: 9am–5pm" />
      </div>
      <div>
        <label className={LABEL}>Emergency note</label>
        <input type="text" value={state.emergencyNote} onChange={(e) => onChange({ emergencyNote: e.target.value })} className={INPUT} placeholder="24/7 Emergency line available" />
      </div>

      {/* Form side */}
      <div className="mt-2 pt-3 border-t border-gray-100">
        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">Form Side</p>
        <div>
          <label className={LABEL}>Form heading</label>
          <input type="text" value={state.formHeading} onChange={(e) => onChange({ formHeading: e.target.value })} className={INPUT} placeholder="Send Us a Message" />
        </div>
      </div>

      <div>
        <label className={LABEL}>Submit button label</label>
        <input type="text" value={state.submitLabel} onChange={(e) => onChange({ submitLabel: e.target.value })} className={INPUT} placeholder="Send Message" />
      </div>

      {/* Form fields */}
      {state.formFields.map((field, idx) => (
        <div key={field.id} className="border border-gray-200 rounded-lg p-3 flex flex-col gap-2">
          <div className="flex items-center justify-between mb-1">
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">{field.label || `Field ${idx + 1}`}</p>
            {state.formFields.length > 1 && (
              <button type="button" onClick={() => removeField(idx)} className="text-xs text-red-400 hover:text-red-600">Remove</button>
            )}
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className={LABEL}>Label</label>
              <input type="text" value={field.label} onChange={(e) => updateField(idx, "label", e.target.value)} className={INPUT} placeholder="Field label" />
            </div>
            <div>
              <label className={LABEL}>Type</label>
              <select value={field.type} onChange={(e) => updateField(idx, "type", e.target.value)} className={INPUT}>
                <option value="text">Text</option>
                <option value="email">Email</option>
                <option value="tel">Phone</option>
                <option value="select">Dropdown</option>
                <option value="textarea">Textarea</option>
              </select>
            </div>
          </div>
          <div>
            <label className={LABEL}>Placeholder</label>
            <input type="text" value={field.placeholder} onChange={(e) => updateField(idx, "placeholder", e.target.value)} className={INPUT} placeholder="Placeholder text" />
          </div>
          {field.type === "select" && (
            <div>
              <label className={LABEL}>Options (comma-separated)</label>
              <input type="text" value={field.options || ""} onChange={(e) => updateField(idx, "options", e.target.value)} className={INPUT} placeholder="Option 1, Option 2" />
            </div>
          )}
          <div className="flex items-center gap-2">
            <input type="checkbox" checked={field.required} onChange={(e) => updateField(idx, "required", e.target.checked)} className="rounded" />
            <label className="text-xs text-gray-600">Required field</label>
          </div>
        </div>
      ))}

      <button
        type="button"
        onClick={addField}
        className="w-full h-8 border border-dashed border-gray-300 text-xs text-gray-400 hover:text-gray-600 hover:border-gray-400 rounded-lg transition-colors"
      >
        + Add form field
      </button>

      {/* Layout */}
      <div className="mt-2 pt-3 border-t border-gray-100">
        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">Layout & Style</p>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={LABEL}>Form position</label>
            <select value={state.formPosition} onChange={(e) => onChange({ formPosition: e.target.value as ContactSplitState["formPosition"] })} className={INPUT}>
              <option value="right">Form right</option>
              <option value="left">Form left</option>
            </select>
          </div>
          <div>
            <label className={LABEL}>Accent color</label>
            <select value={state.accentColor} onChange={(e) => onChange({ accentColor: e.target.value as ContactSplitState["accentColor"] })} className={INPUT}>
              <option value="navy">Navy</option>
              <option value="teal">Teal</option>
              <option value="amber">Amber</option>
            </select>
          </div>
        </div>
        <div className="mt-3">
          <label className={LABEL}>Background</label>
          <select value={state.bgStyle} onChange={(e) => onChange({ bgStyle: e.target.value as ContactSplitState["bgStyle"] })} className={INPUT}>
            <option value="white">White</option>
            <option value="light">Light gray</option>
            <option value="dark">Dark</option>
            <option value="navy">Navy</option>
          </select>
        </div>
      </div>
    </div>
  );
}

// ─── Thumbnail ─────────────────────────────────────────────────────────────────

export function ContactSplitThumbnail() {
  return (
    <div className="flex h-full">
      {/* Info side — dark */}
      <div className="flex-1 flex flex-col justify-center gap-[2.5px] px-1.5 py-1" style={{ background: NAVY }}>
        <span className="text-[6.5px] font-extrabold text-white leading-none">Get in Touch</span>
        <span className="text-[4px] leading-tight" style={{ color: "rgba(255,255,255,0.5)" }}>We're here to help anytime.</span>
        {[["📍","4820 Burnet Rd"],["📞","(512) 555-0100"],["🕐","Mon–Fri 7am–7pm"]].map(([icon, text], i) => (
          <div key={i} className="flex items-center gap-[2px]">
            <span className="text-[5px] leading-none">{icon}</span>
            <span className="text-[4px] leading-none" style={{ color: "rgba(255,255,255,0.65)" }}>{text}</span>
          </div>
        ))}
      </div>
      {/* Form side */}
      <div className="flex-1 flex flex-col justify-center gap-[3px] px-1.5 py-1 bg-white">
        <span className="text-[5.5px] font-bold text-gray-800 leading-none">Send a Message</span>
        {["Name", "Email", "Pet type"].map((label, i) => (
          <div key={i} className="border border-gray-200 rounded px-1 py-[2px]">
            <span className="text-[3.5px] text-gray-400">{label}</span>
          </div>
        ))}
        <div className="rounded py-[3px] text-center mt-0.5" style={{ background: "#0d9488" }}>
          <span className="text-[4.5px] font-semibold text-white">Send Message</span>
        </div>
      </div>
    </div>
  );
}
