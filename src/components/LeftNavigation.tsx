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
 * User profile sits at the bottom with a sub-menu (role switcher, Log out):
 *   - Expanded: click avatar row → accordion slides in above it.
 *   - Collapsed: hover avatar → flyout panel to the right.
 */

import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  ChevronDown, ChevronLeft, ChevronRight,
  Menu, X, LogOut,
  Shield, Users, UserCog, Check,
} from "lucide-react";
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

interface UserFlyoutState {
  top:  number;
  left: number;
}

/* ── Props ──────────────────────────────────────────────────────────────── */

type DemoRole = "admin" | "manager" | "custom";

interface LeftNavigationProps {
  approvalCount?:      number;
  mySubmissionsCount?: number;   // amber badge for custom-role rejected submissions
  userRole?:           DemoRole;
  userName?:           string;
  userEmail?:          string;
  onLogout?:           () => void;
  onRoleChange?:       (role: DemoRole) => void;
}

/* ── Styles ─────────────────────────────────────────────────────────────── */

const S = {
  itemBase: "w-full flex items-center py-1.5 rounded-md text-xs font-medium transition-all duration-150 outline-none focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:ring-offset-1",
  active:   "bg-teal-50 text-teal-700",
  inactive: "text-gray-600 hover:bg-gray-100 hover:text-gray-900",
  sub:      "w-full text-left px-3 py-1.5 text-xs font-medium rounded-md transition-all duration-150 outline-none focus-visible:ring-2 focus-visible:ring-teal-500",
};

/* ── Component ──────────────────────────────────────────────────────────── */

/* ── Role switcher config ────────────────────────────────────────────────── */

const ROLE_OPTIONS: {
  id:      DemoRole;
  label:   string;
  icon:    React.ElementType;
  color:   string;   // avatar bg
  badge:   string;   // pill classes
}[] = [
  { id: "admin",   label: "Admin",   icon: Shield,  color: "from-violet-500 to-violet-700", badge: "bg-violet-50 text-violet-700" },
  { id: "manager", label: "Manager", icon: Users,   color: "from-blue-400   to-blue-600",   badge: "bg-blue-50   text-blue-700"   },
  { id: "custom",  label: "Custom",  icon: UserCog, color: "from-teal-500   to-teal-700",   badge: "bg-teal-50   text-teal-700"   },
];

/* ── User lookup (demo personas) ─────────────────────────────────────────── */

const ROLE_PERSONAS: Record<DemoRole, { name: string; email: string; avatarGradient: string }> = {
  admin:   { name: "Admin User",   email: "admin@atlas.com",   avatarGradient: "from-violet-500 to-violet-700" },
  manager: { name: "Manager User", email: "manager@atlas.com", avatarGradient: "from-blue-400   to-blue-600"   },
  custom:  { name: "Custom User",  email: "custom@atlas.com",  avatarGradient: "from-teal-500   to-teal-700"   },
};

export function LeftNavigation({
  approvalCount      = 0,
  mySubmissionsCount = 0,
  userRole           = "admin",
  userName,
  userEmail,
  onLogout,
  onRoleChange,
}: LeftNavigationProps) {
  // Derive persona from role (props override if explicitly provided)
  const persona     = ROLE_PERSONAS[userRole];
  const resolvedName  = userName  ?? persona.name;
  const resolvedEmail = userEmail ?? persona.email;
  const navigate                    = useNavigate();
  const { pathname }                = useLocation();
  const { navCollapsed, toggleNav } = useLayout();

  const [mobileOpen,    setMobileOpen]    = useState(false);
  const [openSubmenu,   setOpenSubmenu]   = useState<string | null>(null);
  const [flyout,        setFlyout]        = useState<FlyoutState | null>(null);
  const [userFlyout,    setUserFlyout]    = useState<UserFlyoutState | null>(null);

  const flyoutTimer     = useRef<ReturnType<typeof setTimeout> | null>(null);
  const userFlyoutTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const avatarRef       = useRef<HTMLDivElement | null>(null);

  /* ── Close menus when collapsing ─────────────────────────────────────── */
  useEffect(() => {
    if (navCollapsed) {
      setOpenSubmenu(null);
      setFlyout(null);
      setUserFlyout(null);
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

  /* ── Nav flyout helpers ──────────────────────────────────────────────── */
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

  /* ── User flyout helpers (hover dropdown) ────────────────────────────── */
  const openUserFlyout = () => {
    if (userFlyoutTimer.current) clearTimeout(userFlyoutTimer.current);
    setUserFlyout({ top: 0, left: 0 });   // position is computed in CSS (bottom + left)
  };
  const closeUserFlyoutDelayed = () => {
    userFlyoutTimer.current = setTimeout(() => setUserFlyout(null), 120);
  };
  const keepUserFlyout = () => {
    if (userFlyoutTimer.current) clearTimeout(userFlyoutTimer.current);
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
    setUserFlyout(null);
  };

  /* ── NavItem ─────────────────────────────────────────────────────────── */
  const NavItem = ({ route }: { route: RouteConfig }) => {
    const Icon            = route.icon;
    const active          = isActive(route);
    const isApprovals     = route.id === "approval-flow";
    const isMySubmissions = route.id === "my-submissions";

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
          {Icon && <Icon size={15} className="flex-shrink-0" aria-hidden="true" />}
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
            className={`${S.itemBase} px-2.5 gap-2 ${active ? S.active : S.inactive}`}
          >
            {Icon && <Icon size={15} className="flex-shrink-0" aria-hidden="true" />}
            <span className="flex-1 text-left">{route.label}</span>
            <ChevronDown
              size={13}
              aria-hidden="true"
              className={`flex-shrink-0 transition-transform duration-200 ${expanded ? "rotate-180" : ""}`}
            />
          </button>

          {expanded && children.length > 0 && (
            <div className="mt-0.5 ml-3 pl-2.5 border-l-2 border-gray-200 space-y-0.5">
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
        className={`${S.itemBase} ${active ? S.active : S.inactive} ${navCollapsed ? "justify-center" : "px-2.5 gap-2"}`}
      >
        {Icon && <Icon size={18} className="flex-shrink-0" aria-hidden="true" />}

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

        {isMySubmissions && mySubmissionsCount > 0 && !navCollapsed && (
          <span className="inline-flex items-center justify-center px-2 py-0.5 text-xs font-bold text-white bg-amber-500 rounded-full flex-shrink-0">
            {mySubmissionsCount > 99 ? "99+" : mySubmissionsCount}
          </span>
        )}
      </button>
    );
  };

  /* ── Role-based nav visibility ────────────────────────────────────────── */
  // Routes each role should NOT see in the sidebar
  const HIDDEN_BY_ROLE: Record<DemoRole, Set<string>> = {
    admin:   new Set(["my-submissions"]),                                     // Admin doesn't submit — they approve
    manager: new Set(["my-submissions", "settings"]),                         // Manager doesn't submit; no settings access
    custom:  new Set(["approval-flow", "user-management", "settings", "insights-ab-testing", "insights-funnels", ]),  // Custom: no approvals, users, settings, or analytics
  };

  /* ── Section ─────────────────────────────────────────────────────────── */
  const Section = ({
    title,
    section,
  }: {
    title:   string;
    section: RouteConfig["navSection"];
  }) => {
    const hidden = HIDDEN_BY_ROLE[userRole];
    let items = getNavSection(section);
    items = items.filter((r) => !hidden.has(r.id));
    if (!items.length) return null;
    return (
      <div className="space-y-0.5">
        {/* Heading fades to a thin rule when collapsed */}
        <div
          className="overflow-hidden transition-all duration-200 ease-in-out"
          style={{ maxHeight: navCollapsed ? 0 : 28, opacity: navCollapsed ? 0 : 1 }}
        >
          <h3 className="px-3 pb-0.5 pt-2 text-[10px] font-semibold text-gray-400 uppercase tracking-wider whitespace-nowrap">
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

  /* ── User sub-menu items ──────────────────────────────────────────────── */
  const userMenuItems = [
    {
      label:   "Log out",
      icon:    LogOut,
      path:    null,
      danger:  true,
      action:  () => { setUserFlyout(null); onLogout?.(); },
    },
  ] as const;

  /* ── Shared NavContent ───────────────────────────────────────────────── */
  const NavContent = ({ showToggle = false }: { showToggle?: boolean }) => (
    <div className="flex flex-col h-full">

      {/* Nav sections */}
      <nav
        className="flex-1 overflow-y-auto overscroll-contain px-2 py-2 space-y-1.5"
        aria-label="Main navigation"
      >
        <Section title="Home"       section="home"       />
        <Section title="Sites"      section="sites"      />
        <Section title="Analytics"  section="analytics"  />
        <Section title="Management" section="management" />
        <Section title="Support"    section="support"    />
      </nav>

      {/* Collapse toggle */}
      {showToggle && (
        <div className="shrink-0 border-t border-gray-200 px-2 py-2">
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
        </div>
      )}

      {/* ── User profile — hover triggers floating dropdown ─────────────── */}
      <div
        className="shrink-0 border-t border-gray-200"
        onMouseEnter={openUserFlyout}
        onMouseLeave={closeUserFlyoutDelayed}
      >
        <div className="p-3">
          {navCollapsed ? (
            /* ── Collapsed: avatar-only ── */
            <div
              ref={avatarRef}
              aria-label={`${resolvedName} — open user menu`}
              className="w-full flex justify-center p-1 rounded-md hover:bg-gray-100 transition-colors cursor-pointer"
            >
              <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${persona.avatarGradient} flex-shrink-0 flex items-center justify-center shadow-sm`}>
                <span className="text-white text-xs font-bold select-none">
                  {resolvedName.substring(0, 2).toUpperCase()}
                </span>
              </div>
            </div>
          ) : (
            /* ── Expanded: full avatar row ── */
            <div
              ref={avatarRef}
              aria-label="Open user menu"
              className="w-full flex items-center gap-3 px-2 py-2 rounded-md hover:bg-gray-100 transition-colors cursor-pointer"
            >
              <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${persona.avatarGradient} flex-shrink-0 flex items-center justify-center shadow-sm`}>
                <span className="text-white text-xs font-bold select-none">
                  {resolvedName.substring(0, 2).toUpperCase()}
                </span>
              </div>
              <div className="flex-1 min-w-0 text-left">
                <p className="text-sm font-medium text-gray-900 truncate leading-tight">{resolvedName}</p>
                <p className="text-xs text-gray-500 truncate leading-tight capitalize">{userRole}</p>
              </div>
            </div>
          )}
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

      {/* ── Nav flyout panel — fixed so it escapes the aside's overflow clip */}
      {navCollapsed && flyout && (
        <div
          className="hidden md:block fixed z-50"
          style={{ top: flyout.top - 4, left: 58 }}
          onMouseEnter={keepFlyout}
          onMouseLeave={closeFlyoutDelayed}
        >
          <div className="bg-white border border-gray-200 rounded-lg shadow-xl overflow-hidden min-w-[180px]">
            <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider bg-gray-50 border-b border-gray-100">
              {flyout.label}
            </div>
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

      {/* ── User floating dropdown (both collapsed + expanded) ──────────── */}
      {userFlyout && (
        <div
          className="hidden md:block fixed z-50"
          style={{
            bottom: 12,
            left: navCollapsed ? 58 : 228,
          }}
          onMouseEnter={keepUserFlyout}
          onMouseLeave={closeUserFlyoutDelayed}
        >
          <div className="bg-white border border-gray-200 rounded-lg shadow-xl overflow-hidden min-w-[220px]">
            {/* User header */}
            <div className="px-4 py-3 bg-gray-50 border-b border-gray-100">
              <p className="text-sm font-semibold text-gray-900 truncate">{resolvedName}</p>
              <p className="text-xs text-gray-500 truncate mt-0.5">{resolvedEmail}</p>
            </div>

            {/* ── Role switcher ── */}
            <div className="px-2 pt-2 pb-1">
              <p className="px-2 pb-1 text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
                Switch Role
              </p>
              {ROLE_OPTIONS.map(({ id, label, icon: RoleIcon }) => {
                const active = userRole === id;
                return (
                  <button
                    key={id}
                    onClick={() => { onRoleChange?.(id); setUserFlyout(null); }}
                    className={`
                      w-full flex items-center gap-2.5 px-3 py-2 rounded-md mb-0.5
                      text-[13px] font-medium transition-colors duration-150
                      ${active
                        ? "bg-gray-100 text-gray-900"
                        : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                      }
                    `}
                  >
                    <RoleIcon size={14} strokeWidth={1.75} className="flex-shrink-0 text-gray-500" aria-hidden="true" />
                    <span className="flex-1 text-left">{label}</span>
                    {active && <Check size={12} className="text-teal-600 flex-shrink-0" aria-hidden="true" />}
                  </button>
                );
              })}
            </div>

            {/* ── Divider + log out ── */}
            <div className="border-t border-gray-100 mx-2 mb-1" />
            <div className="px-2 pb-2">
              {userMenuItems.map(({ label, icon: Icon, action, danger }) => (
                <button
                  key={label}
                  onClick={action}
                  className={`
                    w-full flex items-center gap-3 px-3 py-2.5 rounded-md
                    text-[13px] font-medium transition-colors duration-150
                    ${danger
                      ? "text-red-600 hover:bg-red-50"
                      : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                    }
                  `}
                >
                  <Icon size={16} strokeWidth={1.75} className="flex-shrink-0" aria-hidden="true" />
                  <span>{label}</span>
                </button>
              ))}
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
