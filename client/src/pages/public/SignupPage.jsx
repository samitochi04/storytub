import { useTranslation } from "react-i18next";
import SEOHead from "@/components/layout/SEOHead";
import { SignupForm } from "@/components/auth";

export default function SignupPage() {
  const { t } = useTranslation();

  return (
    <>
      <SEOHead
        title="Sign Up"
        description="Create your StoryTub account and start generating videos."
      />
      <div className="mx-auto max-w-[400px] px-[var(--space-4)] py-[var(--space-16)]">
        <h1 className="text-[24px] font-bold text-[var(--color-text-primary)] text-center mb-[var(--space-8)]">
          {t("auth.signup")}
        </h1>
        <SignupForm />
      </div>
    </>
  );
}
