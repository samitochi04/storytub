import { Link } from "react-router-dom";
import SEOHead from "@/components/layout/SEOHead";
import { Button } from "@/components/ui";

export default function NotFoundPage() {
  return (
    <>
      <SEOHead title="Page Not Found" noindex />
      <div className="mx-auto max-w-[500px] px-[var(--space-4)] py-[var(--space-16)] text-center">
        <p className="text-[64px] font-bold text-[var(--color-brand-blue)]">
          404
        </p>
        <h1 className="text-[24px] font-bold text-[var(--color-text-primary)] mt-[var(--space-4)]">
          Page not found
        </h1>
        <p className="mt-[var(--space-3)] text-[14px] text-[var(--color-text-secondary)]">
          The page you are looking for does not exist or has been moved.
        </p>
        <Link to="/" className="inline-block mt-[var(--space-6)]">
          <Button variant="primary">Go home</Button>
        </Link>
      </div>
    </>
  );
}
