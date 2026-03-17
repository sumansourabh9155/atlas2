/**
 * App.tsx — root with a mode toggle between Setup, Editor, and Preview.
 */

import { useState } from "react";
import { Settings2, Globe, PanelLeft, Check } from "lucide-react";
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

        {/* Centre: Step-progress tabs */}
        <div role="tablist" aria-label="Switch mode" className="flex items-center">
          {MODES.map(({ id, label }, i) => {
            const activeIdx = MODES.findIndex(m => m.id === mode);
            const active = mode === id;
            const past   = i < activeIdx;
            return (
              <div key={id} className="flex items-center">
                <button
                  type="button"
                  role="tab"
                  onClick={() => setMode(id)}
                  aria-selected={active}
                  className="group flex items-center gap-2 px-2 py-1 rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-[#003459]"
                >
                  {/* Step bubble */}
                  <div className={[
                    "w-6 h-6 rounded-full flex items-center justify-center shrink-0 text-[11px] font-bold border-2 transition-all duration-200",
                    active ? "bg-[#003459] border-[#003459] text-white shadow-sm"
                           : past ? "bg-[#003459]/10 border-[#003459]/40 text-[#003459]"
                                  : "bg-white border-gray-300 text-gray-400 group-hover:border-gray-400",
                  ].join(" ")}>
                    {past ? <Check className="w-3 h-3" /> : i + 1}
                  </div>
                  {/* Label */}
                  <span className={[
                    "text-sm font-medium transition-colors whitespace-nowrap",
                    active ? "text-[#003459]"
                           : past ? "text-gray-500"
                                  : "text-gray-400 group-hover:text-gray-600",
                  ].join(" ")}>
                    {label}
                  </span>
                </button>
                {/* Connector */}
                {i < MODES.length - 1 && (
                  <div className="w-10 h-px mx-1 shrink-0 relative">
                    <div className="absolute inset-0 bg-gray-200 rounded-full" />
                    {past && <div className="absolute inset-0 bg-[#003459]/30 rounded-full transition-all duration-300" />}
                  </div>
                )}
              </div>
            );
          })}
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
