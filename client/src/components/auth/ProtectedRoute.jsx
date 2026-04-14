import { Navigate, useLocation } from "react-router-dom";
import useAuthStore from "@/stores/authStore";
import { Spinner } from "@/components/ui";

export default function ProtectedRoute({ children }) {
  const location = useLocation();
  const { user, loading } = useAuthStore();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[var(--color-bg-page)]">
        <Spinner size={28} />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
}
