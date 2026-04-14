import SEOHead from "@/components/layout/SEOHead";

export default function SignupPage() {
  return (
    <>
      <SEOHead
        title="Sign Up"
        description="Create your StoryTub account and start generating videos."
      />
      <div className="mx-auto max-w-[400px] px-[var(--space-4)] py-[var(--space-16)]">
        <h1 className="text-[24px] font-bold text-[var(--color-text-primary)] text-center">
          Sign up
        </h1>
        <p className="mt-[var(--space-4)] text-[14px] text-[var(--color-text-secondary)] text-center">
          Signup form coming in Step 3.
        </p>
      </div>
    </>
  );
}
