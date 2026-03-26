// ─── Contact Info Section ─────────────────────────────────────────────────────
// Three cards: Address | Phone & Email | Hours. Light gray background.

const NAVY = "#1B2B4B";
const AMBER = "#F59E0B";

const INPUT =
  "w-full h-8 px-2.5 text-sm text-gray-900 bg-white border border-gray-200 rounded-md " +
  "placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-600 " +
  "focus:border-teal-600 transition-colors";

const LABEL = "block text-xs font-medium text-gray-600 mb-1";

// ─── State ────────────────────────────────────────────────────────────────────

export interface ContactInfoState {
  heading: string;
  address: string;
  phone: string;
  email: string;
  hoursWeekday: string;
  hoursWeekend: string;
  emergencyNote: string;
}

export function createDefaultContactInfo(): ContactInfoState {
  return {
    heading: "Find Us & Get in Touch",
    address: "1234 Paws Boulevard\nAustin, TX 78701",
    phone: "(512) 555-0100",
    email: "hello@austinpaws.vet",
    hoursWeekday: "Mon – Fri: 7:00 AM – 7:00 PM",
    hoursWeekend: "Sat – Sun: 8:00 AM – 5:00 PM",
    emergencyNote: "24/7 Emergency line available",
  };
}

// ─── Renderer ─────────────────────────────────────────────────────────────────

function InfoCard({
  icon, title, lines, isDark, accent,
}: {
  icon: string;
  title: string;
  lines: string[];
  isDark: boolean;
  accent?: boolean;
}) {
  return (
    <div
      className="flex flex-col gap-3 p-5 rounded-2xl"
      style={{
        background: isDark ? "#1e293b" : "#ffffff",
        border: `1px solid ${isDark ? "rgba(255,255,255,0.07)" : "#e5e7eb"}`,
      }}
    >
      {/* Icon circle */}
      <div
        className="w-10 h-10 rounded-xl flex items-center justify-center text-lg"
        style={{ background: accent ? AMBER : (isDark ? "rgba(255,255,255,0.06)" : "#f3f4f6") }}
      >
        {icon}
      </div>
      <div>
        <p className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: isDark ? "#64748b" : "#9ca3af" }}>
          {title}
        </p>
        {lines.map((line, i) => line.trim() && (
          <p
            key={i}
            className="text-sm leading-relaxed"
            style={{ color: isDark ? "#e2e8f0" : "#374151" }}
          >
            {line}
          </p>
        ))}
      </div>
    </div>
  );
}

export function ContactInfoSectionRenderer({
  state, isDark, compact,
}: { state: ContactInfoState; isDark: boolean; compact: boolean }) {
  return (
    <section
      className="px-6 py-12"
      style={{
        background: isDark ? "#0d1117" : "#f8f9fb",
        borderTop: `1px solid ${isDark ? "rgba(255,255,255,0.06)" : "#f0f0f2"}`,
      }}
      aria-label="Contact Info"
    >
      <div className="max-w-4xl mx-auto">
        {state.heading && (
          <h2
            className={`font-extrabold text-center mb-8 ${compact ? "text-xl" : "text-2xl"}`}
            style={{ color: isDark ? "#f1f5f9" : "#111827" }}
          >
            {state.heading}
          </h2>
        )}

        <div
          className="grid gap-4"
          style={{ gridTemplateColumns: compact ? "1fr" : "repeat(3, 1fr)" }}
        >
          <InfoCard
            icon="📍"
            title="Location"
            lines={state.address.split("\n")}
            isDark={isDark}
          />
          <InfoCard
            icon="📞"
            title="Contact"
            lines={[state.phone, state.email]}
            isDark={isDark}
          />
          <InfoCard
            icon="🕐"
            title="Hours"
            lines={[state.hoursWeekday, state.hoursWeekend, state.emergencyNote]}
            isDark={isDark}
            accent
          />
        </div>
      </div>
    </section>
  );
}

// ─── Editor ───────────────────────────────────────────────────────────────────

export function ContactInfoEditor({
  state, onChange,
}: { state: ContactInfoState; onChange: (u: Partial<ContactInfoState>) => void }) {
  return (
    <div className="flex flex-col gap-4 px-4 pb-4 pt-1">
      <div>
        <label className={LABEL}>Section heading</label>
        <input
          type="text"
          value={state.heading}
          onChange={(e) => onChange({ heading: e.target.value })}
          className={INPUT}
          placeholder="Find Us & Get in Touch"
        />
      </div>

      <div>
        <label className={LABEL}>Address (line breaks OK)</label>
        <textarea
          value={state.address}
          onChange={(e) => onChange({ address: e.target.value })}
          rows={2}
          className="w-full px-2.5 py-1.5 text-sm text-gray-900 bg-white border border-gray-200 rounded-md placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-600 focus:border-teal-600 transition-colors resize-none"
          placeholder="123 Main St&#10;Austin, TX 78701"
        />
      </div>

      <div>
        <label className={LABEL}>Phone</label>
        <input
          type="text"
          value={state.phone}
          onChange={(e) => onChange({ phone: e.target.value })}
          className={INPUT}
          placeholder="(512) 555-0100"
        />
      </div>

      <div>
        <label className={LABEL}>Email</label>
        <input
          type="email"
          value={state.email}
          onChange={(e) => onChange({ email: e.target.value })}
          className={INPUT}
          placeholder="hello@clinic.vet"
        />
      </div>

      <div>
        <label className={LABEL}>Weekday hours</label>
        <input
          type="text"
          value={state.hoursWeekday}
          onChange={(e) => onChange({ hoursWeekday: e.target.value })}
          className={INPUT}
          placeholder="Mon – Fri: 7:00 AM – 7:00 PM"
        />
      </div>

      <div>
        <label className={LABEL}>Weekend hours</label>
        <input
          type="text"
          value={state.hoursWeekend}
          onChange={(e) => onChange({ hoursWeekend: e.target.value })}
          className={INPUT}
          placeholder="Sat – Sun: 8:00 AM – 5:00 PM"
        />
      </div>

      <div>
        <label className={LABEL}>Emergency note</label>
        <input
          type="text"
          value={state.emergencyNote}
          onChange={(e) => onChange({ emergencyNote: e.target.value })}
          className={INPUT}
          placeholder="24/7 Emergency line available"
        />
      </div>
    </div>
  );
}

// ─── Thumbnail ─────────────────────────────────────────────────────────────────

export function ContactInfoThumbnail() {
  return (
    <div className="flex gap-[3px] p-1 h-full bg-gray-50">
      {/* Map thumbnail */}
      <div className="flex-1 relative overflow-hidden rounded-sm">
        <img
          src="https://images.unsplash.com/photo-1524661135-423995f22d0b?w=120&h=80&fit=crop&q=70"
          alt="" className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-2.5 h-2.5 rounded-full border-2 border-white shadow" style={{ background: "#ef4444" }} />
        </div>
      </div>
      {/* Info list */}
      <div className="flex-1 flex flex-col justify-center gap-[3px] py-0.5">
        {[["📍","4820 Burnet Rd"],["📞","(512) 555-0100"],["✉","hello@clinic.vet"],["🕐","Mon–Fri 7am–7pm"]].map(([icon, text], i) => (
          <div key={i} className="flex items-center gap-0.5">
            <span className="text-[6px] leading-none">{icon}</span>
            <span className="text-[5px] text-gray-600 leading-none truncate">{text}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
