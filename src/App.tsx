/**
 * App.tsx — root with a mode toggle between Setup, Editor, and Preview.
 */

import { useState } from "react";
import { Settings2, Globe, PanelLeft } from "lucide-react";
import { HospitalSetupPage } from "./components/HospitalSetup/HospitalSetupPage";
import { WebsiteEditorPage } from "./components/WebsiteEditor/WebsiteEditorPage";
import { DomainManagementPage } from "./components/WebsiteEditor/DomainManagementPage";

type Mode = "setup" | "editor" | "domain";

const MODES: { id: Mode; label: string; Icon: React.ElementType }[] = [
  { id: "setup",  label: "Hospital Details",   Icon: Settings2 },
  { id: "editor", label: "Website Editor",     Icon: PanelLeft },
  { id: "domain", label: "Domain Management",  Icon: Globe     },
];

export default function App() {
  const [mode, setMode] = useState<Mode>("editor");

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      {/* ── Top bar ── */}
      <div className="h-12 shrink-0 bg-white border-b border-gray-200 flex items-center justify-between px-5 z-50">
        {/* Left: Brand */}
        <div className="flex items-center gap-2 w-44">
          <div className="w-6 h-6 rounded bg-[#003459] flex items-center justify-center shrink-0" aria-hidden="true">
            <span className="text-white text-[10px] font-bold">V</span>
          </div>
          <span className="text-sm font-semibold text-gray-900 tracking-tight">Vet CMS</span>
          <span className="ml-1 inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-medium bg-amber-50 text-amber-700 border border-amber-200">
            <span className="w-1 h-1 rounded-full bg-amber-500" aria-hidden="true" />
            Draft
          </span>
        </div>

        {/* Centre: Segmented control */}
        <div
          role="tablist"
          aria-label="Switch mode"
          className="flex items-center gap-0.5 bg-gray-100 rounded-lg p-1"
        >
          {MODES.map(({ id, label, Icon }) => (
            <button
              key={id}
              type="button"
              role="tab"
              onClick={() => setMode(id)}
              aria-selected={mode === id}
              className={[
                "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-all duration-150",
                "focus:outline-none focus-visible:ring-2 focus-visible:ring-[#003459] focus-visible:ring-offset-1 focus-visible:ring-offset-gray-100",
                mode === id
                  ? "bg-white text-[#003459] shadow-sm shadow-black/8 ring-1 ring-black/[0.06]"
                  : "text-gray-500 hover:text-gray-700",
              ].join(" ")}
            >
              <Icon className="w-3.5 h-3.5" aria-hidden="true" />
              {label}
            </button>
          ))}
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2  justify-end">
          <button
            type="button"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-gray-600 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#003459]"
          >
            Save as Draft
          </button>
          <button
            type="button"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-semibold text-white bg-[#003459] rounded-md hover:bg-[#002845] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#003459] focus-visible:ring-offset-1"
          >
            Publish
          </button>
        </div>
      </div>

      {/* ── Content ── */}
      <div className="flex-1 overflow-hidden">
        {mode === "setup"  && <HospitalSetupPage />}
        {mode === "editor" && <WebsiteEditorPage onNavigateToSetup={() => setMode("setup")} />}
        {mode === "domain" && <DomainManagementPage />}
      </div>
    </div>
  );
}
