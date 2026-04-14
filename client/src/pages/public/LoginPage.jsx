import SEOHead from "@/components/layout/SEOHead";

export default function LoginPage() {
  return (
    <>
      <SEOHead title="Login" description="Log in to your StoryTub account." />
      <div className="mx-auto max-w-[400px] px-[var(--space-4)] py-[var(--space-16)]">
        <h1 className="text-[24px] font-bold text-[var(--color-text-primary)] text-center">
          Log in
        </h1>
        <p className="mt-[var(--space-4)] text-[14px] text-[var(--color-text-secondary)] text-center">
          Login form coming in Step 3.
        </p>
      </div>
    </>
  );
}
