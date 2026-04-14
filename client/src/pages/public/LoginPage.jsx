import { useTranslation } from "react-i18next";
import SEOHead from "@/components/layout/SEOHead";
import { LoginForm } from "@/components/auth";

export default function LoginPage() {
  const { t } = useTranslation();

  return (
    <>
      <SEOHead title="Login" description="Log in to your StoryTub account." />
      <div className="mx-auto max-w-[400px] px-[var(--space-4)] py-[var(--space-16)]">
        <h1 className="text-[24px] font-bold text-[var(--color-text-primary)] text-center mb-[var(--space-8)]">
          {t("auth.login")}
        </h1>
        <LoginForm />
      </div>
    </>
  );
}
