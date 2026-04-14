/**
 * Settings Page
 * Account, notifications, billing, integrations, and team preferences.
 */

import React, { useState } from "react";
import {
  User, Bell, CreditCard, Plug, Shield, Palette,
  Globe, ChevronRight, Check,
} from "lucide-react";
import { surface } from "../../lib/styles/tokens";

/* ── Types ──────────────────────────────────────────────────────────────── */

interface SettingsSection {
  id:       string;
  label:    string;
  icon:     React.ElementType;
  badge?:   string;
}

/* ── Sections ────────────────────────────────────────────────────────────── */

const SECTIONS: SettingsSection[] = [
  { id: "profile",       label: "Profile",          icon: User      },
  { id: "notifications", label: "Notifications",    icon: Bell      },
  { id: "billing",       label: "Billing & Plan",   icon: CreditCard, badge: "Pro" },
  { id: "integrations",  label: "Integrations",     icon: Plug      },
  { id: "security",      label: "Security",         icon: Shield    },
  { id: "appearance",    label: "Appearance",       icon: Palette   },
  { id: "localization",  label: "Localization",     icon: Globe     },
];

/* ── Toggle helper ───────────────────────────────────────────────────────── */

function Toggle({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
}) {
  return (
    <button
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-teal-600 focus:ring-offset-2 ${
        checked ? "bg-teal-600" : "bg-gray-200"
      }`}
    >
      <span
        className={`inline-block h-3.5 w-3.5 rounded-full bg-white shadow transition-transform ${
          checked ? "translate-x-4.5" : "translate-x-0.5"
        }`}
      />
    </button>
  );
}

/* ── Section panels ──────────────────────────────────────────────────────── */

function ProfilePanel() {
  const [name,  setName]  = useState("Alex Johnson");
  const [email, setEmail] = useState("alex@pawscarenetwork.com");
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const INPUT = "w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-600 focus:border-transparent bg-white";

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-base font-bold text-gray-900">Profile</h2>
        <p className="text-sm text-gray-500 mt-0.5">Manage your personal account details.</p>
      </div>

      {/* Avatar */}
      <div className="flex items-center gap-4">
        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center text-white text-xl font-bold select-none">
          {name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()}
        </div>
        <div>
          <button className="text-sm font-medium text-teal-600 hover:text-teal-700 transition-colors">
            Upload photo
          </button>
          <p className="text-xs text-gray-400 mt-0.5">JPG, PNG · Max 2 MB</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 max-w-md">
        <div>
          <label htmlFor="settings-name" className="block text-xs font-semibold text-gray-600 mb-1.5">
            Full Name
          </label>
          <input
            id="settings-name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className={INPUT}
          />
        </div>
        <div>
          <label htmlFor="settings-email" className="block text-xs font-semibold text-gray-600 mb-1.5">
            Email Address
          </label>
          <input
            id="settings-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={INPUT}
          />
        </div>
      </div>

      <button
        onClick={handleSave}
        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
          saved
            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
            : "bg-teal-600 text-white hover:bg-teal-700"
        }`}
      >
        {saved ? <><Check size={14} /> Saved</> : "Save Changes"}
      </button>
    </div>
  );
}

function NotificationsPanel() {
  const [prefs, setPrefs] = useState({
    approvalSubmitted:  true,
    approvalDecision:   true,
    weeklyDigest:       false,
    systemAlerts:       true,
    marketingEmails:    false,
  });

  const toggle = (key: keyof typeof prefs) =>
    setPrefs((p) => ({ ...p, [key]: !p[key] }));

  const items = [
    { key: "approvalSubmitted" as const,  label: "Approval submitted",   desc: "When a custom user submits a new approval request"       },
    { key: "approvalDecision" as const,   label: "Approval decision",    desc: "When your submission is approved or rejected"            },
    { key: "weeklyDigest" as const,       label: "Weekly digest",        desc: "Summary of activity across all your clinics"             },
    { key: "systemAlerts" as const,       label: "System alerts",        desc: "Downtime, maintenance windows, and critical updates"     },
    { key: "marketingEmails" as const,    label: "Product updates",      desc: "New features, tips, and announcements from the team"     },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-base font-bold text-gray-900">Notifications</h2>
        <p className="text-sm text-gray-500 mt-0.5">Choose what you hear about and when.</p>
      </div>
      <div className="divide-y divide-gray-100 border border-gray-200 rounded-xl overflow-hidden">
        {items.map(({ key, label, desc }) => (
          <div key={key} className="flex items-center justify-between px-6 py-5 bg-white">
            <div>
              <p className="text-sm font-medium text-gray-800">{label}</p>
              <p className="text-xs text-gray-400 mt-0.5">{desc}</p>
            </div>
            <Toggle checked={prefs[key]} onChange={() => toggle(key)} label={label} />
          </div>
        ))}
      </div>
    </div>
  );
}

function GenericPanel({ title, description }: { title: string; description: string }) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-base font-bold text-gray-900">{title}</h2>
        <p className="text-sm text-gray-500 mt-0.5">{description}</p>
      </div>
      <div className="border border-dashed border-gray-300 rounded-xl p-12 text-center bg-gray-50/50">
        <p className="text-sm text-gray-400">Coming soon</p>
      </div>
    </div>
  );
}

/* ── Main component ──────────────────────────────────────────────────────── */

export function SettingsPage() {
  const [activeSection, setActiveSection] = useState("profile");

  const renderPanel = () => {
    switch (activeSection) {
      case "profile":       return <ProfilePanel />;
      case "notifications": return <NotificationsPanel />;
      case "billing":       return <GenericPanel title="Billing & Plan" description="Manage your subscription, invoices, and payment methods." />;
      case "integrations":  return <GenericPanel title="Integrations" description="Connect third-party tools — EHR systems, Google Business, and more." />;
      case "security":      return <GenericPanel title="Security" description="Password, two-factor authentication, and active sessions." />;
      case "appearance":    return <GenericPanel title="Appearance" description="Theme, density, and display preferences." />;
      case "localization":  return <GenericPanel title="Localization" description="Language, time zone, date format, and currency." />;
      default:              return null;
    }
  };

  return (
    <div className={surface.page}>
      <div className="flex h-full">

        {/* ── Left nav ── */}
        <div className="w-56 flex-shrink-0 border-r border-gray-200 py-6 overflow-y-auto">
          <p className="px-4 pb-2 text-xs font-semibold text-gray-400 uppercase tracking-wide">
            Settings
          </p>
          <nav aria-label="Settings sections">
            {SECTIONS.map(({ id, label, icon: Icon, badge }) => {
              const active = id === activeSection;
              return (
                <button
                  key={id}
                  onClick={() => setActiveSection(id)}
                  aria-current={active ? "page" : undefined}
                  className={`w-full flex items-center justify-between px-5 py-3 text-sm transition-colors ${
                    active
                      ? "bg-teal-50 text-teal-700 font-semibold"
                      : "text-gray-600 hover:bg-gray-50 font-medium"
                  }`}
                >
                  <span className="flex items-center gap-2.5">
                    <Icon size={15} className={active ? "text-teal-600" : "text-gray-400"} aria-hidden="true" />
                    {label}
                  </span>
                  <span className="flex items-center gap-1.5">
                    {badge && (
                      <span className="text-xs font-semibold px-1.5 py-0.5 rounded-md bg-violet-100 text-violet-700">
                        {badge}
                      </span>
                    )}
                    {active && <ChevronRight size={13} className="text-teal-500" />}
                  </span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* ── Panel content ── */}
        <div className="flex-1 overflow-y-auto p-10">
          {renderPanel()}
        </div>

      </div>
    </div>
  );
}
