/**
 * routes.config.ts — Single source of truth for all routes.
 *
 * This config drives:
 *  - React Router <Route> definitions (in App.tsx)
 *  - Left nav rendering (LeftNavigation.tsx)
 *  - TopBar label + CTA (TopBar.tsx)
 *
 * To add a new page: add one entry here, one <Route> in App.tsx, done.
 */

import type { LucideIcon } from "lucide-react";
import {
  LayoutDashboard, Building2, Database, Image,
  Megaphone, CheckCircle, Users, Settings, HelpCircle,
  Plus, FolderPlus, MapPin, Upload, ImagePlus, UserPlus, ClipboardList,
  GitBranch, TrendingDown,
} from "lucide-react";

/* ── Types ──────────────────────────────────────────────────────────────── */

export interface CtaConfig {
  label: string;
  action: string;
  icon: LucideIcon;
}

export interface RouteConfig {
  /** URL path — used by React Router and for active-state detection */
  path: string;
  /** Stable string id — used in nav matching logic */
  id: string;
  /** Human-readable page label — used in TopBar and nav items */
  label: string;
  /** Which nav section this appears in (omit for hidden routes) */
  navSection?: "home" | "sites" | "analytics" | "management" | "bottom";
  /** Lucide icon for nav item */
  icon?: LucideIcon;
  /** True if this nav item has a collapsible submenu */
  submenu?: boolean;
  /** Id of the parent submenu item (for sub-nav entries) */
  parentId?: string;
  /** CTA button shown in the TopBar when this page is active */
  cta?: CtaConfig;
  /** True = exists in the router but never rendered in the nav sidebar */
  hideFromNav?: boolean;
}

/* ── Route Definitions ──────────────────────────────────────────────────── */

export const ROUTES: RouteConfig[] = [
  // ─── HOME ────────────────────────────────────────────────────────────────
  {
    path: "/dashboard",
    id: "dashboard",
    label: "Dashboard",
    navSection: "home",
    icon: LayoutDashboard,
    cta: { label: "New Site", action: "new-site", icon: Plus },
  },

  // ─── SITES ───────────────────────────────────────────────────────────────
  // Parent nav item (submenu toggle)
  {
    path: "/sites",
    id: "site-management",
    label: "Site Management",
    navSection: "sites",
    icon: Building2,
    submenu: true,
    cta: { label: "New Site", action: "new-site", icon: Plus },
  },
  // Sub-routes (rendered inside the Site Management submenu)
  {
    path: "/sites/all",
    id: "sites",
    label: "All Sites",
    parentId: "site-management",
    cta: { label: "New Site", action: "new-site", icon: Plus },
  },
  {
    path: "/sites/groups",
    id: "groups",
    label: "Groups",
    parentId: "site-management",
    cta: { label: "New Group", action: "new-group", icon: FolderPlus },
  },
  {
    path: "/sites/multi-location",
    id: "multi-location",
    label: "Multi-Location",
    parentId: "site-management",
    cta: { label: "Add Location", action: "add-location", icon: MapPin },
  },
  // Other site-section items
  {
    path: "/data-collection",
    id: "data-collection",
    label: "Data Collection",
    navSection: "sites",
    icon: Database,
    cta: { label: "Import Data", action: "import-data", icon: Upload },
  },
  {
    path: "/media-library",
    id: "media-library",
    label: "Media Library",
    navSection: "sites",
    icon: Image,
    cta: { label: "Upload Media", action: "upload-media", icon: Upload },
  },

  // ─── ANALYTICS ───────────────────────────────────────────────────────────
  {
    path: "/insights/ab-testing",
    id: "insights-ab-testing",
    label: "A/B Testing",
    navSection: "analytics",
    icon: GitBranch,
  },
  {
    path: "/insights/funnels",
    id: "insights-funnels",
    label: "Funnels",
    navSection: "analytics",
    icon: TrendingDown,
  },
  // ─── MANAGEMENT ──────────────────────────────────────────────────────────
  {
    path: "/banners",
    id: "banner-management",
    label: "Banner Management",
    navSection: "management",
    icon: Megaphone,
    cta: { label: "Create Banner", action: "create-banner", icon: ImagePlus },
  },
  {
    path: "/approvals",
    id: "approval-flow",
    label: "Approval Flow",
    navSection: "management",
    icon: CheckCircle,
    // no CTA — approval flow is read-only from the nav
  },
  {
    path: "/users",
    id: "user-management",
    label: "User Management",
    navSection: "management",
    icon: Users,
    cta: { label: "Invite User", action: "invite-user", icon: UserPlus },
  },

  // ─── SETTINGS / HELP — shown in user profile submenu, not in sidebar nav ─
  {
    path: "/settings",
    id: "settings",
    label: "Settings",
    hideFromNav: true,
    icon: Settings,
  },
  {
    path: "/help",
    id: "help",
    label: "Get Help",
    hideFromNav: true,
    icon: HelpCircle,
  },

  // ─── HIDDEN ROUTES (exist in the router, never shown in the nav) ─────────
  {
    path: "/sites/new",
    id: "new-site",
    label: "New Site",
    hideFromNav: true,
  },
];

/* ── Helpers ─────────────────────────────────────────────────────────────── */

/** Return the best-matching route for a given pathname */
export function findRouteByPath(pathname: string): RouteConfig | undefined {
  // Exact match first
  const exact = ROUTES.find((r) => r.path === pathname);
  if (exact) return exact;
  // Then prefix match (longest wins)
  return ROUTES.filter(
    (r) => !r.hideFromNav && r.path !== "/" && pathname.startsWith(r.path + "/"),
  ).sort((a, b) => b.path.length - a.path.length)[0];
}

/** Return all direct children of a submenu parent */
export function getSubmenuChildren(parentId: string): RouteConfig[] {
  return ROUTES.filter((r) => r.parentId === parentId);
}

/** Return all routes for a given nav section (top-level only, no sub-items) */
export function getNavSection(section: RouteConfig["navSection"]): RouteConfig[] {
  return ROUTES.filter((r) => r.navSection === section && !r.parentId);
}
