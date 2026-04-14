import SEOHead from "@/components/layout/SEOHead";

export default function AdminMonitoringPage() {
  return (
    <>
      <SEOHead title="Admin Monitoring" noindex />
      <div>
        <h1 className="text-[24px] font-bold text-[var(--color-text-primary)]">
          System Monitoring
        </h1>
        <p className="mt-[var(--space-4)] text-[14px] text-[var(--color-text-secondary)]">
          Health and audit logs coming in Step 9.
        </p>
      </div>
    </>
  );
}
