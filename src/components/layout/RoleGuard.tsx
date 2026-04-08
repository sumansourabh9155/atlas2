/**
 * RoleGuard — Wraps restricted route groups.
 *
 * Usage in App.tsx:
 *   <Route element={<RoleGuard activeRole={role} allowed={["admin","manager"]} />}>
 *     <Route path="/approvals" ... />
 *   </Route>
 *
 * If the current role is NOT in `allowed`, the user is silently redirected
 * to /dashboard. The route never renders.
 */

import { Navigate, Outlet } from "react-router-dom";
import type { DemoRole } from "../../config/rolePermissions";

interface RoleGuardProps {
  activeRole:   DemoRole;
  allowed:      DemoRole[];
}

export function RoleGuard({ activeRole, allowed }: RoleGuardProps) {
  if (!allowed.includes(activeRole)) {
    return <Navigate to="/dashboard" replace />;
  }
  return <Outlet />;
}
