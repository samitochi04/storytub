import SEOHead from "@/components/layout/SEOHead";

export default function AdminAnalyticsPage() {
  return (
    <>
      <SEOHead title="Admin Analytics" noindex />
      <div>
        <h1 className="text-[24px] font-bold text-[var(--color-text-primary)]">
          Analytics
        </h1>
        <p className="mt-[var(--space-4)] text-[14px] text-[var(--color-text-secondary)]">
          Full analytics coming in Step 9.
        </p>
      </div>
    </>
  );
}
