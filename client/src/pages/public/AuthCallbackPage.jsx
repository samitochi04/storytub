import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/config/supabase";
import { Spinner } from "@/components/ui";

export default function AuthCallbackPage() {
  const navigate = useNavigate();

  useEffect(() => {
    const handleCallback = async () => {
      const { error } = await supabase.auth.getSession();
      if (error) {
        navigate("/login", { replace: true });
        return;
      }
      // Session is set by onAuthStateChange listener in main.jsx
      navigate("/dashboard", { replace: true });
    };

    handleCallback();
  }, [navigate]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-[var(--color-bg-page)]">
      <div className="flex flex-col items-center gap-[var(--space-4)]">
        <Spinner size={28} />
        <p className="text-[13px] text-[var(--color-text-secondary)]">
          Completing sign in...
        </p>
      </div>
    </div>
  );
}
