import { Navigate } from "react-router-dom";

/**
 * Restricts access to staff members (agent, manager, admin).
 * Optional `minRole` prop can require a specific minimum role level.
 *
 * Role hierarchy: agent < manager < admin
 * Auth + profile store will be wired in Step 3.
 */

const ROLE_LEVEL = {
  agent: 1,
  manager: 2,
  admin: 3,
};

export default function StaffRoute({ children, minRole = "agent" }) {
  // Minimum required role level for this route
  const requiredLevel = ROLE_LEVEL[minRole] || 1;

  // Temporary: check for Supabase session + profile role
  // Will be replaced by authStore in Step 3
  const hasSession = (() => {
    try {
      const key = Object.keys(localStorage).find(
        (k) => k.startsWith("sb-") && k.endsWith("-auth-token"),
      );
      if (!key) return false;
      const data = JSON.parse(localStorage.getItem(key));
      return !!data?.access_token;
    } catch {
      return false;
    }
  })();

  if (!hasSession) {
    return <Navigate to="/login" replace />;
  }

  // TODO Step 3: Check profile.role level >= requiredLevel using authStore
  // For now, allow access if authenticated (staff check comes with auth store)
  void requiredLevel;

  return children;
}
