import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Button, Input } from "@/components/ui";
import useAuth from "@/hooks/useAuth";
import OAuthButtons from "./OAuthButtons";

export default function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || "/dashboard";

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      setError("Please fill in all fields.");
      return;
    }

    setLoading(true);
    try {
      await login(email, password);
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.message || "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-[var(--space-6)]">
      <OAuthButtons />

      {/* Divider */}
      <div className="flex items-center gap-[var(--space-4)]">
        <div className="flex-1 h-px bg-[var(--color-border-default)]" />
        <span className="text-[11px] text-[var(--color-text-tertiary)]">
          or
        </span>
        <div className="flex-1 h-px bg-[var(--color-border-default)]" />
      </div>

      <form
        onSubmit={handleSubmit}
        className="flex flex-col gap-[var(--space-4)]"
      >
        <Input
          label="Email"
          type="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="email"
          required
        />
        <Input
          label="Password"
          type="password"
          placeholder="Your password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="current-password"
          required
        />

        {error && (
          <p className="text-[12px] text-[var(--color-error)]">{error}</p>
        )}

        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "Logging in..." : "Log in"}
        </Button>
      </form>

      <div className="flex flex-col items-center gap-[var(--space-2)]">
        <Link
          to="/forgot-password"
          className="text-[12px] text-[var(--color-text-secondary)] hover:text-[var(--color-brand-blue)] transition-colors duration-150"
        >
          Forgot password?
        </Link>
        <p className="text-[12px] text-[var(--color-text-secondary)]">
          No account?{" "}
          <Link
            to="/signup"
            className="text-[var(--color-brand-blue)] hover:underline"
          >
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}
