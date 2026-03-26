/**
 * LeftNavigation — Config-driven sidebar.
 *
 * Reads its structure entirely from routes.config.ts — no hardcoded nav arrays.
 * Uses React Router's useNavigate + useLocation for navigation and active states.
 *
 * To add a new nav item: add a RouteConfig entry with the right navSection.
 * To add a new submenu child: set parentId to the parent's id.
 * Nothing here needs to change.
 */

import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { ChevronDown, Menu, X, LogOut } from "lucide-react";
import {
  ROUTES,
  getNavSection,
  getSubmenuChildren,
  type RouteConfig,
} from "../config/routes.config";

/* ── Props ─────────────────────────────────────────────────────────────── */

interface LeftNavigationProps {
  approvalCount?: number;
  userRole?: string;
  userName?: string;
  userEmail?: string;
  onLogout?: () => void;
}

/* ── Styles ─────────────────────────────────────────────────────────────── */

const S = {
  item:    "w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-all duration-150 outline-none focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:ring-offset-1",
  active:  "bg-teal-50 text-teal-700",
  inactive:"text-gray-700 hover:bg-gray-100",
  sub:     "w-full text-left px-3 py-2 text-sm font-medium rounded-md transition-all duration-150 outline-none focus-visible:ring-2 focus-visible:ring-teal-500",
};

/* ── Component ─────────────────────────────────────────────────────────── */

export function LeftNavigation({
  approvalCount = 0,
  userRole      = "admin",
  userName      = "Admin",
  userEmail     = "admin@nexio.com",
  onLogout,
}: LeftNavigationProps) {
  const navigate       = useNavigate();
  const { pathname }   = useLocation();
  const [mobileOpen,  setMobileOpen]  = useState(false);
  const [openSubmenu, setOpenSubmenu] = useState<string | null>(null);

  // Auto-expand the submenu containing the current route
  useEffect(() => {
    const active = ROUTES.find(
      (r) => pathname === r.path || pathname.startsWith(r.path + "/"),
    );
    if (active?.parentId)   setOpenSubmenu(active.parentId);
    else if (active?.submenu) setOpenSubmenu(active.id);
  }, [pathname]);

  const isActive = (route: RouteConfig): boolean => {
    if (route.submenu) {
      return getSubmenuChildren(route.id).some(
        (c) => pathname === c.path || pathname.startsWith(c.path + "/"),
      );
    }
    return pathname === route.path || pathname.startsWith(route.path + "/");
  };

  const go = (path: string) => { navigate(path); setMobileOpen(false); };

  /* ── Single nav item ── */
  const NavItem = ({ route }: { route: RouteConfig }) => {
    const Icon   = route.icon;
    const active = isActive(route);
    const isApprovals = route.id === "approval-flow";

    if (route.submenu) {
      const children = getSubmenuChildren(route.id);
      const expanded  = openSubmenu === route.id;
      return (
        <div>
          <button
            onClick={() => {
              if (!active) go(route.path);
              setOpenSubmenu(expanded ? null : route.id);
            }}
            aria-expanded={expanded}
            className={`${S.item} ${active ? S.active : S.inactive}`}
          >
            {Icon && <Icon size={18} className="flex-shrink-0" aria-hidden="true" />}
            <span className="flex-1 text-left">{route.label}</span>
            <ChevronDown
              size={16}
              aria-hidden="true"
              className={`flex-shrink-0 transition-transform duration-200 ${expanded ? "rotate-180" : ""}`}
            />
          </button>

          {expanded && children.length > 0 && (
            <div className="mt-1 ml-3 pl-3 border-l-2 border-gray-200 space-y-1">
              {children.map((child) => {
                const childActive = pathname === child.path || pathname.startsWith(child.path + "/");
                return (
                  <button
                    key={child.id}
                    onClick={() => go(child.path)}
                    aria-current={childActive ? "page" : undefined}
                    className={`${S.sub} ${childActive ? S.active : S.inactive}`}
                  >
                    {child.label}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      );
    }

    return (
      <button
        onClick={() => go(route.path)}
        aria-current={active ? "page" : undefined}
        className={`${S.item} ${active ? S.active : S.inactive}`}
      >
        {Icon && <Icon size={18} className="flex-shrink-0" aria-hidden="true" />}
        <span className="flex-1 text-left truncate">{route.label}</span>
        {isApprovals && approvalCount > 0 && (
          <span className="inline-flex items-center justify-center px-2 py-0.5 text-xs font-bold text-white bg-red-500 rounded-full flex-shrink-0">
            {approvalCount > 99 ? "99+" : approvalCount}
          </span>
        )}
      </button>
    );
  };

  /* ── Named nav section ── */
  const Section = ({ title, section }: { title: string; section: RouteConfig["navSection"] }) => {
    const items = getNavSection(section);
    if (!items.length) return null;
    return (
      <div className="space-y-1">
        <h3 className="px-3 py-1.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">
          {title}
        </h3>
        {items.map((r) => <NavItem key={r.id} route={r} />)}
      </div>
    );
  };

  /* ── Content shared by desktop + mobile ── */
  const NavContent = () => (
    <div className="flex flex-col h-full">
      <nav className="flex-1 overflow-y-auto overscroll-contain px-2 py-3 space-y-4">
        <Section title="Home"       section="home"       />
        <Section title="Sites"      section="sites"      />
        <Section title="Management" section="management" />
      </nav>

      <div className="shrink-0 border-t border-gray-200 px-2 py-2 space-y-1">
        {getNavSection("bottom").map((r) => <NavItem key={r.id} route={r} />)}
      </div>

      <div className="shrink-0 border-t border-gray-200 p-3">
        <div className="flex items-center gap-3 px-2 py-2 rounded-md hover:bg-gray-100 transition-colors">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-400 to-blue-600 flex-shrink-0 flex items-center justify-center shadow-sm">
            <span className="text-white text-xs font-bold select-none">
              {userName.substring(0, 2).toUpperCase()}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">{userName}</p>
            <p className="text-xs text-gray-500 truncate">{userRole}</p>
          </div>
          <button
            onClick={(e) => { e.stopPropagation(); onLogout?.(); }}
            className="p-1.5 hover:bg-gray-200 rounded transition-colors flex-shrink-0"
            title="Logout"
            aria-label="Logout"
          >
            <LogOut size={16} className="text-gray-500" aria-hidden="true" />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop */}
      <aside
        className="hidden md:flex md:flex-col w-56 bg-white border-r border-gray-200 overflow-hidden flex-shrink-0"
        role="navigation"
        aria-label="Main navigation"
      >
        <NavContent />
      </aside>

      {/* Mobile */}
      <div className="md:hidden">
        {!mobileOpen && (
          <button
            onClick={() => setMobileOpen(true)}
            className="fixed bottom-6 right-6 z-40 p-3 bg-teal-600 text-white rounded-full shadow-lg hover:bg-teal-700 transition-colors"
            aria-label="Open navigation"
          >
            <Menu size={24} aria-hidden="true" />
          </button>
        )}
        {mobileOpen && (
          <>
            <div className="fixed inset-0 z-30 bg-black/40 backdrop-blur-sm" onClick={() => setMobileOpen(false)} aria-hidden="true" />
            <aside className="fixed left-0 top-0 z-40 w-56 h-screen bg-white overflow-hidden flex flex-col shadow-2xl" role="navigation">
              <button onClick={() => setMobileOpen(false)} className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-lg transition-colors" aria-label="Close navigation">
                <X size={20} className="text-gray-600" aria-hidden="true" />
              </button>
              <NavContent />
            </aside>
          </>
        )}
      </div>
    </>
  );
}
