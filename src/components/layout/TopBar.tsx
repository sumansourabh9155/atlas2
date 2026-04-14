/**
 * TopBar — Universal top bar for Atlas.
 *
 * Left brand section width is kept in sync with the LeftNavigation width via
 * LayoutContext — both animate together on collapse/expand.
 *
 * Content area layout:
 *  - Sub-page (route.backTo set):  [← Label / Page Title]  |  [CTA?]
 *  - Top-level page:               [Icon?  Page Title]       |  [CTA?]
 */

import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { findRouteByPath } from "../../config/routes.config";
import { useLayout } from "../../context/LayoutContext";
import type { DemoRole } from "../../config/rolePermissions";

interface TopBarProps {
  /** Called when the user clicks the CTA button */
  onCTAClick: (action: string) => void;
  /** Current user role — used to gate role-restricted CTAs */
  activeRole: DemoRole;
}

export function TopBar({ onCTAClick, activeRole }: TopBarProps) {
  const { pathname }     = useLocation();
  const navigate         = useNavigate();
  const { navCollapsed } = useLayout();
  const route            = findRouteByPath(pathname);

  const pageLabel = route?.label ?? "";
  const cta       = route?.cta;
  const backTo    = route?.backTo;
  const RouteIcon = route?.icon;

  return (
    <div className="h-14 shrink-0 bg-white border-b border-gray-200 flex items-center z-50 overflow-hidden">

      {/* ── Brand section — mirrors nav width with smooth transition ── */}
      <div
        className={`
          flex items-center flex-shrink-0 border-r border-gray-200 h-full
          transition-all duration-300 ease-in-out overflow-hidden
          ${navCollapsed ? "w-14" : "w-56"}
        `}
      >
        <div
          className={`
            flex items-center gap-2 w-full px-4
            ${navCollapsed ? "justify-center px-0" : ""}
          `}
        >
          {/* NX logo mark — always visible */}
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-teal-600 to-teal-700 flex items-center justify-center shadow-sm flex-shrink-0">
            <span className="text-white text-sm font-bold select-none">AT</span>
          </div>

          {/* "Atlas" wordmark — fades out before the container finishes collapsing */}
          <p
            className="text-sm font-semibold text-gray-900 truncate whitespace-nowrap overflow-hidden transition-all duration-200 ease-in-out"
            style={{
              maxWidth:  navCollapsed ? 0   : 120,
              opacity:   navCollapsed ? 0   : 1,
              marginLeft: navCollapsed ? 0  : undefined,
            }}
          >
            Atlas
          </p>
        </div>
      </div>

      {/* ── Page label + CTA ── */}
      <div className="flex flex-1 items-center justify-between px-6 gap-4 min-w-0">

        {/* Left: breadcrumb (sub-page) OR icon+title (top-level) */}
        {backTo ? (
          /* Sub-page breadcrumb: ← Users / Invite User */
          <div className="flex items-center gap-1.5 min-w-0">
            <button
              type="button"
              onClick={() => navigate(backTo.path)}
              className="flex items-center gap-1 text-sm text-gray-400 hover:text-gray-700 transition-colors group"
            >
              <ArrowLeft size={13} className="flex-shrink-0 transition-transform group-hover:-translate-x-0.5" aria-hidden="true" />
              <span className="font-medium">{backTo.label}</span>
            </button>
            <span className="text-gray-200 select-none">/</span>
            <span className="text-sm font-semibold text-gray-900 truncate">{pageLabel}</span>
          </div>
        ) : (
          /* Top-level: optional icon + page title */
          <div className="flex items-center gap-2 min-w-0">
            {RouteIcon && (
              <RouteIcon size={15} className="text-gray-400 flex-shrink-0" aria-hidden="true" />
            )}
            <h1 className="text-sm font-semibold text-gray-900 truncate">{pageLabel}</h1>
          </div>
        )}

        {/* Right: CTA button (hidden when role not in allowedRoles) */}
        {cta && (!cta.allowedRoles || cta.allowedRoles.includes(activeRole)) && (
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
    </div>
  );
}
