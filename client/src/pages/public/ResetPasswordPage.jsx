import { useTranslation } from "react-i18next";
import SEOHead from "@/components/layout/SEOHead";
import { ResetPasswordForm } from "@/components/auth";

export default function ResetPasswordPage() {
  const { t } = useTranslation();

  return (
    <>
      <SEOHead
        title="New Password"
        description="Set a new password for your StoryTub account."
      />
      <div className="mx-auto max-w-[400px] px-[var(--space-4)] py-[var(--space-16)]">
        <h1 className="text-[24px] font-bold text-[var(--color-text-primary)] text-center mb-[var(--space-8)]">
          {t("auth.newPassword")}
        </h1>
        <ResetPasswordForm />
      </div>
    </>
  );
}
