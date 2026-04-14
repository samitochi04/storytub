import SEOHead from "@/components/layout/SEOHead";

export default function ResetPasswordPage() {
  return (
    <>
      <SEOHead
        title="New Password"
        description="Set a new password for your StoryTub account."
      />
      <div className="mx-auto max-w-[400px] px-[var(--space-4)] py-[var(--space-16)]">
        <h1 className="text-[24px] font-bold text-[var(--color-text-primary)] text-center">
          New password
        </h1>
        <p className="mt-[var(--space-4)] text-[14px] text-[var(--color-text-secondary)] text-center">
          Password reset form coming in Step 3.
        </p>
      </div>
    </>
  );
}
