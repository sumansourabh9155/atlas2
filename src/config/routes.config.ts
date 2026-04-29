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
import type { DemoRole } from "./rolePermissions";
import {
  LayoutDashboard, Building2, Database, Image,
  Megaphone, CheckCircle, Users, Settings, HelpCircle,
  Plus, FolderPlus, MapPin, Upload, ImagePlus, UserPlus, ClipboardList,
  GitBranch, TrendingDown, Star, RefreshCw,
} from "lucide-react";

/* ── Types ──────────────────────────────────────────────────────────────── */

export interface CtaConfig {
  label: string;
  action: string;
  icon: LucideIcon;
  /** When set, CTA is hidden for roles not in this list */
  allowedRoles?: DemoRole[];
}

export interface RouteConfig {
  /** URL path — used by React Router and for active-state detection */
  path: string;
  /** Stable string id — used in nav matching logic */
  id: string;
  /** Human-readable page label — used in TopBar and nav items */
  label: string;
  /** Which nav section this appears in (omit for hidden routes) */
  navSection?: "home" | "sites" | "analytics" | "management" | "support" | "bottom";
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
  /**
   * When set, the TopBar renders a breadcrumb back-button instead of a plain title.
   * e.g. { label: "Users", path: "/users" } → "← Users  /  Invite User"
   */
  backTo?: { label: string; path: string };
  /**
   * Optional subtitle shown below the page title in the TopBar.
   * Use for pages that benefit from a brief context line.
   */
  subtitle?: string;
  /**
   * When set, findRouteByPath matches any pathname that starts with this prefix.
   * Used for parameterised sub-pages (e.g. /reviews/:locationId) so the TopBar
   * can show the correct label + backTo without needing a static path per param.
   */
  matchPrefix?: string;
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
  // ─── REVIEWS ─────────────────────────────────────────────────────────────
  {
    path: "/reviews",
    id: "reviews",
    label: "Google Reviews",
    navSection: "management",
    icon: Star,
    subtitle: "Curate and feature the best reviews for each location's website.",
    cta: { label: "Sync All", action: "sync-all-reviews", icon: RefreshCw },
  },
  // Location-level detail — matches /reviews/:locationId via matchPrefix
  {
    path: "/reviews/detail",
    id: "reviews-detail",
    label: "Location Reviews",
    hideFromNav: true,
    matchPrefix: "/reviews/",
    backTo: { label: "Google Reviews", path: "/reviews" },
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
    path: "/my-submissions",
    id: "my-submissions",
    label: "My Submissions",
    navSection: "management",
    icon: ClipboardList,
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
    cta: { label: "Invite User", action: "invite-user", icon: UserPlus, allowedRoles: ["admin", "manager"] },
  },

  // ─── SUPPORT — Settings + Help, below Management in the sidebar ──────────
  {
    path: "/settings",
    id: "settings",
    label: "Settings",
    navSection: "support",
    icon: Settings,
  },
  {
    path: "/help",
    id: "help",
    label: "Get Help",
    navSection: "support",
    icon: HelpCircle,
  },

  // ─── HIDDEN ROUTES (exist in the router, never shown in the nav) ─────────
  {
    path: "/sites/new",
    id: "new-site",
    label: "New Site",
    hideFromNav: true,
  },
  {
    path: "/users/invite",
    id: "invite-user-page",
    label: "Invite User",
    hideFromNav: true,
    backTo: { label: "Users", path: "/users" },
  },
  // Approval review routes — distraction-free, no nav
  {
    path: "/approvals/review",
    id: "approval-review",
    label: "Review Changes",
    hideFromNav: true,
    backTo: { label: "Approval Flow", path: "/approvals" },
  },
  {
    path: "/my-submissions/revise",
    id: "my-submissions-revise",
    label: "Revise Submission",
    hideFromNav: true,
    backTo: { label: "My Submissions", path: "/my-submissions" },
  },
];

/* ── Helpers ─────────────────────────────────────────────────────────────── */

/** Return the best-matching route for a given pathname */
export function findRouteByPath(pathname: string): RouteConfig | undefined {
  // 1. Exact match
  const exact = ROUTES.find((r) => r.path === pathname);
  if (exact) return exact;

  // 2. matchPrefix — for parameterised sub-pages (e.g. /reviews/:locationId)
  //    Hidden routes that declare matchPrefix take priority over generic prefix match.
  const prefixed = ROUTES.find((r) => !!r.matchPrefix && pathname.startsWith(r.matchPrefix));
  if (prefixed) return prefixed;

  // 3. Prefix match (longest wins, non-hidden nav routes only)
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
