import { useTranslation } from "react-i18next";
import { Film } from "lucide-react";
import { SkeletonCard } from "@/components/ui";
import VideoCard from "./VideoCard";

export default function VideoList({ videos, loading }) {
  const { t } = useTranslation();

  if (loading) {
    return (
      <div className="grid grid-cols-1 gap-[var(--space-4)] sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    );
  }

  if (!videos || videos.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-[var(--space-16)] text-center">
        <Film
          size={40}
          strokeWidth={1.5}
          className="mb-[var(--space-4)] text-[var(--color-text-tertiary)]"
        />
        <p className="text-[14px] text-[var(--color-text-secondary)]">
          {t("videos.emptyTitle")}
        </p>
        <p className="mt-[var(--space-1)] text-[12px] text-[var(--color-text-tertiary)]">
          {t("videos.emptyDescription")}
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-[var(--space-4)] sm:grid-cols-2 lg:grid-cols-3">
      {videos.map((video) => (
        <VideoCard key={video.id} video={video} />
      ))}
    </div>
  );
}
