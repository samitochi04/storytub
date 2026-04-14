import { Navigate } from "react-router-dom";
import useAuthStore from "@/stores/authStore";
import { Spinner } from "@/components/ui";

const ROLE_LEVEL = {
  agent: 1,
  manager: 2,
  admin: 3,
};

export default function StaffRoute({ children, minRole = "agent" }) {
  const { user, profile, loading } = useAuthStore();
  const requiredLevel = ROLE_LEVEL[minRole] || 1;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[var(--color-bg-page)]">
        <Spinner size={28} />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const userLevel = ROLE_LEVEL[profile?.role] || 0;
  if (userLevel < requiredLevel) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}
