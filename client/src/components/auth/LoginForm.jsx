import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
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
  const { t } = useTranslation();

  const from = location.state?.from?.pathname || "/dashboard";

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      setError(t("auth.fillAllFields"));
      return;
    }

    setLoading(true);
    try {
      await login(email, password);
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.message || t("auth.loginFailed"));
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
          {t("auth.or")}
        </span>
        <div className="flex-1 h-px bg-[var(--color-border-default)]" />
      </div>

      <form
        onSubmit={handleSubmit}
        className="flex flex-col gap-[var(--space-4)]"
      >
        <Input
          label={t("auth.email")}
          type="email"
          placeholder={t("auth.emailPlaceholder")}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="email"
          required
        />
        <Input
          label={t("auth.password")}
          type="password"
          placeholder={t("auth.passwordPlaceholder")}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="current-password"
          required
        />

        {error && (
          <p className="text-[12px] text-[var(--color-error)]">{error}</p>
        )}

        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? t("auth.loggingIn") : t("auth.login")}
        </Button>
      </form>

      <div className="flex flex-col items-center gap-[var(--space-2)]">
        <Link
          to="/forgot-password"
          className="text-[12px] text-[var(--color-text-secondary)] hover:text-[var(--color-brand-blue)] transition-colors duration-150"
        >
          {t("auth.forgotPassword")}
        </Link>
        <p className="text-[12px] text-[var(--color-text-secondary)]">
          {t("auth.noAccount")}{" "}
          <Link
            to="/signup"
            className="text-[var(--color-brand-blue)] hover:underline"
          >
            {t("auth.signup")}
          </Link>
        </p>
      </div>
    </div>
  );
}
