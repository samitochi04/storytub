import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Button, Input } from "@/components/ui";
import useAuth from "@/hooks/useAuth";

export default function ResetPasswordForm() {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { resetPassword } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!password || !confirm) {
      setError(t("auth.fillBothFields"));
      return;
    }

    if (password.length < 8) {
      setError(t("auth.passwordMin"));
      return;
    }

    if (password !== confirm) {
      setError(t("auth.passwordsMismatch"));
      return;
    }

    setLoading(true);
    try {
      await resetPassword(password);
      navigate("/dashboard", { replace: true });
    } catch (err) {
      setError(err.message || t("auth.resetPasswordFailed"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-[var(--space-6)]">
      <p className="text-[13px] text-[var(--color-text-secondary)] text-center">
        {t("auth.newPasswordDescription")}
      </p>

      <form
        onSubmit={handleSubmit}
        className="flex flex-col gap-[var(--space-4)]"
      >
        <Input
          label={t("auth.newPassword")}
          type="password"
          placeholder={t("auth.passwordMinPlaceholder")}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="new-password"
          required
        />
        <Input
          label={t("auth.confirmPassword")}
          type="password"
          placeholder={t("auth.confirmPlaceholder")}
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          autoComplete="new-password"
          required
        />

        {error && (
          <p className="text-[12px] text-[var(--color-error)]">{error}</p>
        )}

        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? t("auth.updating") : t("auth.setNewPassword")}
        </Button>
      </form>
    </div>
  );
}
