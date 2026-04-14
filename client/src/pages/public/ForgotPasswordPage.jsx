import SEOHead from "@/components/layout/SEOHead";
import { ForgotPasswordForm } from "@/components/auth";

export default function ForgotPasswordPage() {
  return (
    <>
      <SEOHead
        title="Reset Password"
        description="Reset your StoryTub password."
      />
      <div className="mx-auto max-w-[400px] px-[var(--space-4)] py-[var(--space-16)]">
        <h1 className="text-[24px] font-bold text-[var(--color-text-primary)] text-center mb-[var(--space-8)]">
          Reset password
        </h1>
        <ForgotPasswordForm />
      </div>
    </>
  );
}
