/**
 * TopBar — Universal top bar for Nexio.
 *
 * Reads the current URL via useLocation() and looks up the matching
 * RouteConfig to derive the page label and optional CTA button.
 * No manual prop drilling needed — just update routes.config.ts.
 *
 * Layout: [NX logo + Nexio] | [page label] | [CTA button?]
 */

import React from "react";
import { useLocation } from "react-router-dom";
import { findRouteByPath } from "../../config/routes.config";

interface TopBarProps {
  /** Called when the user clicks the CTA button */
  onCTAClick: (action: string) => void;
}

export function TopBar({ onCTAClick }: TopBarProps) {
  const { pathname } = useLocation();
  const route = findRouteByPath(pathname);

  const pageLabel = route?.label ?? "";
  const cta       = route?.cta;

  return (
    <div className="h-14 shrink-0 bg-white border-b border-gray-200 flex items-center justify-between px-6 z-50 gap-4">
      {/* Left: Brand */}
      <div className="flex items-center gap-2 w-56 flex-shrink-0">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-teal-600 to-teal-700 flex items-center justify-center shadow-sm flex-shrink-0">
          <span className="text-white text-sm font-bold select-none">NX</span>
        </div>
        <p className="text-sm font-semibold text-gray-900 truncate">Nexio</p>
      </div>

      {/* Center: Page label */}
      <h1 className="text-sm font-semibold text-gray-900 flex-1">{pageLabel}</h1>

      {/* Right: CTA */}
      {cta && (
        <button
          type="button"
          onClick={() => onCTAClick(cta.action)}
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-sm font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-md transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-600 focus-visible:ring-offset-1 flex-shrink-0"
          title={cta.label}
          aria-label={cta.label}
        >
          <cta.icon size={14} aria-hidden="true" />
          {cta.label}
        </button>
      )}
    </div>
  );
}
