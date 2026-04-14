import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Button, Input } from "@/components/ui";
import useAuth from "@/hooks/useAuth";
import OAuthButtons from "./OAuthButtons";

export default function SignupForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const { signup } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      setError(t("auth.fillAllFields"));
      return;
    }

    if (password.length < 8) {
      setError(t("auth.passwordMin"));
      return;
    }

    setLoading(true);
    try {
      const { user } = await signup(email, password, {
        full_name: fullName || undefined,
      });

      // If email confirmation is required, user won't have a session yet
      if (user && !user.confirmed_at) {
        setSuccess(true);
      } else {
        navigate("/dashboard", { replace: true });
      }
    } catch (err) {
      setError(err.message || t("auth.signupFailed"));
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="flex flex-col items-center gap-[var(--space-4)] text-center">
        <div className="w-[48px] h-[48px] rounded-full bg-[var(--color-success)] flex items-center justify-center">
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="white"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>
        <h2 className="text-[18px] font-bold text-[var(--color-text-primary)]">
          {t("auth.checkEmail")}
        </h2>
        <p className="text-[13px] text-[var(--color-text-secondary)] max-w-[300px]">
          {t("auth.confirmationSent")}{" "}
          <strong className="text-[var(--color-text-primary)]">{email}</strong>.{" "}
          {t("auth.clickToActivate")}
        </p>
        <Link
          to="/login"
          className="text-[12px] text-[var(--color-brand-blue)] hover:underline mt-[var(--space-4)]"
        >
          {t("auth.backToLogin")}
        </Link>
      </div>
    );
  }

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
          label={t("auth.fullName")}
          type="text"
          placeholder={t("auth.fullNamePlaceholder")}
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          autoComplete="name"
        />
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
          placeholder={t("auth.passwordMinPlaceholder")}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="new-password"
          required
        />

        {error && (
          <p className="text-[12px] text-[var(--color-error)]">{error}</p>
        )}

        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? t("auth.creatingAccount") : t("auth.signup")}
        </Button>
      </form>

      <p className="text-[12px] text-[var(--color-text-secondary)] text-center">
        {t("auth.hasAccount")}{" "}
        <Link
          to="/login"
          className="text-[var(--color-brand-blue)] hover:underline"
        >
          {t("auth.login")}
        </Link>
      </p>

      <p className="text-[11px] text-[var(--color-text-tertiary)] text-center">
        {t("auth.agreePrefix")}{" "}
        <Link
          to="/terms"
          className="underline hover:text-[var(--color-text-secondary)]"
        >
          {t("footer.terms")}
        </Link>{" "}
        {t("auth.and")}{" "}
        <Link
          to="/privacy"
          className="underline hover:text-[var(--color-text-secondary)]"
        >
          {t("footer.privacy")}
        </Link>
        .
      </p>
    </div>
  );
}
