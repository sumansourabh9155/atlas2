/**
 * rolePermissions.ts — Centralised role-based access rules.
 *
 * Consumed by:
 *  - RoleGuard.tsx  → blocks route access
 *  - App.tsx        → redirects on role change
 *  - LeftNavigation → hides nav items
 *  - TopBar         → gates CTA buttons
 */

export type DemoRole = "admin" | "manager" | "custom";

/**
 * Route path prefixes each role is blocked from.
 * Matching is prefix-based: "/approvals" blocks "/approvals/review" too.
 */
export const ROLE_BLOCKED_PATHS: Record<DemoRole, string[]> = {
  admin:   ["/my-submissions"],
  manager: ["/my-submissions"],
  custom:  ["/approvals", "/users"],
};

/**
 * Route IDs hidden from the sidebar nav for each role.
 * Kept as Sets for O(1) lookup in LeftNavigation's render loop.
 */
export const ROLE_HIDDEN_NAV_IDS: Record<DemoRole, Set<string>> = {
  admin:   new Set(["my-submissions"]),
  manager: new Set(["my-submissions"]),
  custom:  new Set(["approval-flow", "user-management"]),
};

/** Returns true if the given pathname is blocked for the given role. */
export function isPathBlockedForRole(pathname: string, role: DemoRole): boolean {
  return ROLE_BLOCKED_PATHS[role].some(
    (blocked) => pathname === blocked || pathname.startsWith(blocked + "/"),
  );
}
