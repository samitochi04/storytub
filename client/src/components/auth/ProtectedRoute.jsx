import { Navigate, useLocation } from "react-router-dom";

/**
 * Redirects unauthenticated users to /login.
 * Wraps authenticated app routes.
 *
 * Auth store will be wired in Step 3. For now, checks
 * supabase session from localStorage as a temporary fallback.
 */
export default function ProtectedRoute({ children }) {
  const location = useLocation();

  // Temporary: check for Supabase session in localStorage
  // Will be replaced by authStore.user in Step 3
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
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
}
