import { useParams } from "react-router-dom";
import SEOHead from "@/components/layout/SEOHead";

export default function VideoDetailPage() {
  const { id } = useParams();

  return (
    <>
      <SEOHead title="Video" noindex />
      <div className="mx-auto max-w-[900px] px-[var(--space-4)] py-[var(--space-8)]">
        <h1 className="text-[24px] font-bold text-[var(--color-text-primary)]">
          Video Detail
        </h1>
        <p className="mt-[var(--space-4)] text-[14px] text-[var(--color-text-secondary)]">
          Video player and details coming in Step 6. ID: {id}
        </p>
      </div>
    </>
  );
}
