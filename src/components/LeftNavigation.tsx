/**
 * LeftNavigation — Config-driven collapsible sidebar.
 *
 * Expanded (w-56): icons + labels + section headings.
 * Collapsed (w-14 / 56px): Webflow-style icon-only rail.
 *   · Submenu parents show a flyout panel on hover so children remain accessible.
 *   · Flyout is rendered as a fixed-position sibling (outside the aside) so it
 *     is never clipped by the aside's overflow-hidden.
 *   · Native title tooltips for all non-submenu icon items.
 *
 * Collapse state lives in LayoutContext (persisted to localStorage).
 * Mobile: always full-width drawer, unaffected by collapse state.
 *
 * Toggle button sits at the bottom of the nav, below "Get Help".
 */

import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { ChevronDown, ChevronLeft, ChevronRight, Menu, X, LogOut } from "lucide-react";
import {
  ROUTES,
  getNavSection,
  getSubmenuChildren,
  type RouteConfig,
} from "../config/routes.config";
import { useLayout } from "../context/LayoutContext";

/* ── Types ──────────────────────────────────────────────────────────────── */

interface FlyoutState {
  id:       string;
  label:    string;
  top:      number;
  children: RouteConfig[];
}

/* ── Props ──────────────────────────────────────────────────────────────── */

interface LeftNavigationProps {
  approvalCount?: number;
  userRole?:      string;
  userName?:      string;
  userEmail?:     string;
  onLogout?:      () => void;
}

/* ── Styles ─────────────────────────────────────────────────────────────── */

const S = {
  // px and gap are intentionally omitted — added per-state to avoid Tailwind conflicts
  itemBase: "w-full flex items-center py-2 rounded-md text-sm font-medium transition-all duration-150 outline-none focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:ring-offset-1",
  active:   "bg-teal-50 text-teal-700",
  inactive: "text-gray-600 hover:bg-gray-100 hover:text-gray-900",
  sub:      "w-full text-left px-3 py-2 text-sm font-medium rounded-md transition-all duration-150 outline-none focus-visible:ring-2 focus-visible:ring-teal-500",
};

/* ── Component ──────────────────────────────────────────────────────────── */

export function LeftNavigation({
  approvalCount = 0,
  userRole      = "admin",
  userName      = "Admin",
  userEmail     = "admin@nexio.com",
  onLogout,
}: LeftNavigationProps) {
  const navigate                    = useNavigate();
  const { pathname }                = useLocation();
  const { navCollapsed, toggleNav } = useLayout();

  const [mobileOpen,  setMobileOpen]  = useState(false);
  const [openSubmenu, setOpenSubmenu] = useState<string | null>(null);
  const [flyout,      setFlyout]      = useState<FlyoutState | null>(null);
  const flyoutTimer                   = useRef<ReturnType<typeof setTimeout> | null>(null);

  /* ── Close submenu + flyout when collapsing ─────────────────────────── */
  useEffect(() => {
    if (navCollapsed) {
      setOpenSubmenu(null);
      setFlyout(null);
    }
  }, [navCollapsed]);

  /* ── Auto-expand submenu for current route (expanded only) ──────────── */
  useEffect(() => {
    if (navCollapsed) return;
    const active = ROUTES.find(
      (r) => pathname === r.path || pathname.startsWith(r.path + "/"),
    );
    if (active?.parentId)    setOpenSubmenu(active.parentId);
    else if (active?.submenu) setOpenSubmenu(active.id);
  }, [pathname, navCollapsed]);

  /* ── Flyout helpers (hover with grace period) ────────────────────────── */
  const openFlyout = (state: FlyoutState) => {
    if (flyoutTimer.current) clearTimeout(flyoutTimer.current);
    setFlyout(state);
  };

  const closeFlyoutDelayed = () => {
    flyoutTimer.current = setTimeout(() => setFlyout(null), 120);
  };

  const keepFlyout = () => {
    if (flyoutTimer.current) clearTimeout(flyoutTimer.current);
  };

  /* ── Utilities ───────────────────────────────────────────────────────── */
  const isActive = (route: RouteConfig): boolean => {
    if (route.submenu) {
      return getSubmenuChildren(route.id).some(
        (c) => pathname === c.path || pathname.startsWith(c.path + "/"),
      );
    }
    return pathname === route.path || pathname.startsWith(route.path + "/");
  };

  const go = (path: string) => {
    navigate(path);
    setMobileOpen(false);
    setFlyout(null);
  };

  /* ── NavItem ─────────────────────────────────────────────────────────── */
  const NavItem = ({ route }: { route: RouteConfig }) => {
    const Icon        = route.icon;
    const active      = isActive(route);
    const isApprovals = route.id === "approval-flow";

    /* ── Collapsed submenu parent → flyout trigger ── */
    if (route.submenu && navCollapsed) {
      const children = getSubmenuChildren(route.id);
      return (
        <button
          onClick={() => go(route.path)}
          onMouseEnter={(e) => {
            const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
            openFlyout({ id: route.id, label: route.label, top: rect.top, children });
          }}
          onMouseLeave={closeFlyoutDelayed}
          aria-label={route.label}
          title={route.label}
          className={`${S.itemBase} ${active ? S.active : S.inactive} justify-center`}
        >
          {Icon && <Icon size={18} className="flex-shrink-0" aria-hidden="true" />}
        </button>
      );
    }

    /* ── Expanded submenu parent → inline accordion ── */
    if (route.submenu && !navCollapsed) {
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
            className={`${S.itemBase} px-3 gap-3 ${active ? S.active : S.inactive}`}
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
                const childActive =
                  pathname === child.path || pathname.startsWith(child.path + "/");
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

    /* ── Regular item ── */
    return (
      <button
        onClick={() => go(route.path)}
        aria-current={active ? "page" : undefined}
        title={navCollapsed ? route.label : undefined}
        aria-label={navCollapsed ? route.label : undefined}
        className={`${S.itemBase} ${active ? S.active : S.inactive} ${navCollapsed ? "justify-center" : "px-3 gap-3"}`}
      >
        {Icon && <Icon size={18} className="flex-shrink-0" aria-hidden="true" />}

        {/* Label only rendered when expanded — avoids ghost gap in flex layout */}
        {!navCollapsed && (
          <span className="flex-1 text-left truncate whitespace-nowrap overflow-hidden">
            {route.label}
          </span>
        )}

        {isApprovals && approvalCount > 0 && !navCollapsed && (
          <span className="inline-flex items-center justify-center px-2 py-0.5 text-xs font-bold text-white bg-red-500 rounded-full flex-shrink-0">
            {approvalCount > 99 ? "99+" : approvalCount}
          </span>
        )}
      </button>
    );
  };

  /* ── Section ─────────────────────────────────────────────────────────── */
  const Section = ({
    title,
    section,
  }: {
    title:   string;
    section: RouteConfig["navSection"];
  }) => {
    const items = getNavSection(section);
    if (!items.length) return null;
    return (
      <div className="space-y-0.5">
        {/* Heading fades to a thin rule when collapsed */}
        <div
          className="overflow-hidden transition-all duration-200 ease-in-out"
          style={{ maxHeight: navCollapsed ? 0 : 28, opacity: navCollapsed ? 0 : 1 }}
        >
          <h3 className="px-3 pb-1 pt-2 text-xs font-medium text-gray-400 uppercase tracking-wider whitespace-nowrap">
            {title}
          </h3>
        </div>
        {navCollapsed && (
          <div className="mx-3 mb-1 border-t border-gray-100" aria-hidden="true" />
        )}
        {items.map((r) => (
          <NavItem key={r.id} route={r} />
        ))}
      </div>
    );
  };

  /* ── Shared NavContent ───────────────────────────────────────────────── */
  const NavContent = ({ showToggle = false }: { showToggle?: boolean }) => (
    <div className="flex flex-col h-full">

      {/* Nav items */}
      <nav
        className="flex-1 overflow-y-auto overscroll-contain px-2 py-3 space-y-3"
        aria-label="Main navigation"
      >
        <Section title="Home"       section="home"       />
        <Section title="Sites"      section="sites"      />
        <Section title="Management" section="management" />
      </nav>

      {/* Bottom utility links — Settings, Get Help — then collapse toggle */}
      <div className="shrink-0 border-t border-gray-200 px-2 py-2 space-y-0.5">
        {getNavSection("bottom").map((r) => (
          <NavItem key={r.id} route={r} />
        ))}

        {/* Collapse / expand toggle — positioned below Get Help */}
        {showToggle && (
          <button
            onClick={toggleNav}
            title={navCollapsed ? "Expand navigation" : "Collapse navigation"}
            aria-label={navCollapsed ? "Expand navigation" : "Collapse navigation"}
            className={`${S.itemBase} ${S.inactive} ${navCollapsed ? "justify-center" : "px-3 gap-3"}`}
          >
            {navCollapsed
              ? <ChevronRight size={18} className="flex-shrink-0" aria-hidden="true" />
              : <ChevronLeft  size={18} className="flex-shrink-0" aria-hidden="true" />
            }
            {!navCollapsed && (
              <span className="flex-1 text-left">Collapse</span>
            )}
          </button>
        )}
      </div>

      {/* User profile */}
      <div className="shrink-0 border-t border-gray-200 p-3">
        <div
          className={`flex items-center rounded-md hover:bg-gray-100 transition-colors ${
            navCollapsed ? "justify-center p-2" : "gap-3 px-2 py-2"
          }`}
          title={navCollapsed ? `${userName} · ${userRole}` : undefined}
        >
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-400 to-blue-600 flex-shrink-0 flex items-center justify-center shadow-sm">
            <span className="text-white text-xs font-bold select-none">
              {userName.substring(0, 2).toUpperCase()}
            </span>
          </div>
          <div
            className="flex flex-1 items-center gap-1 min-w-0 overflow-hidden transition-all duration-200 ease-in-out"
            style={{ maxWidth: navCollapsed ? 0 : 400, opacity: navCollapsed ? 0 : 1 }}
            aria-hidden={navCollapsed}
          >
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
    </div>
  );

  /* ── Render ──────────────────────────────────────────────────────────── */
  return (
    <>
      {/* ── Desktop sidebar ─────────────────────────────────────────────── */}
      <aside
        className={`
          hidden md:flex md:flex-col
          bg-white border-r border-gray-200
          overflow-hidden flex-shrink-0
          transition-all duration-300 ease-in-out
          ${navCollapsed ? "w-14" : "w-56"}
        `}
        role="navigation"
        aria-label="Main navigation"
      >
        <NavContent showToggle />
      </aside>

      {/* ── Flyout panel — fixed so it escapes the aside's overflow clip ─── */}
      {navCollapsed && flyout && (
        <div
          className="hidden md:block fixed z-50"
          style={{ top: flyout.top - 4, left: 58 }}
          onMouseEnter={keepFlyout}
          onMouseLeave={closeFlyoutDelayed}
        >
          <div className="bg-white border border-gray-200 rounded-lg shadow-xl overflow-hidden min-w-[180px]">
            {/* Section label */}
            <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider bg-gray-50 border-b border-gray-100">
              {flyout.label}
            </div>
            {/* Children */}
            <div className="py-1">
              {flyout.children.map((child) => {
                const childActive =
                  pathname === child.path ||
                  pathname.startsWith(child.path + "/");
                return (
                  <button
                    key={child.id}
                    onClick={() => go(child.path)}
                    className={`w-full text-left px-4 py-2 text-sm transition-colors ${
                      childActive
                        ? "bg-teal-50 text-teal-700 font-medium"
                        : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                    }`}
                  >
                    {child.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ── Mobile: FAB + slide-over drawer ─────────────────────────────── */}
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
            <div
              className="fixed inset-0 z-30 bg-black/40 backdrop-blur-sm"
              onClick={() => setMobileOpen(false)}
              aria-hidden="true"
            />
            <aside
              className="fixed left-0 top-0 z-40 w-56 h-screen bg-white overflow-hidden flex flex-col shadow-2xl"
              role="navigation"
              aria-label="Main navigation"
            >
              <button
                onClick={() => setMobileOpen(false)}
                className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-lg transition-colors"
                aria-label="Close navigation"
              >
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
