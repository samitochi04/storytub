import SEOHead from "@/components/layout/SEOHead";

export default function AdminCouponsPage() {
  return (
    <>
      <SEOHead title="Admin Coupons" noindex />
      <div>
        <h1 className="text-[24px] font-bold text-[var(--color-text-primary)]">
          Coupon Management
        </h1>
        <p className="mt-[var(--space-4)] text-[14px] text-[var(--color-text-secondary)]">
          Coupon manager coming in Step 9.
        </p>
      </div>
    </>
  );
}
