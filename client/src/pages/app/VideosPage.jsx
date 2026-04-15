import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Sparkles } from "lucide-react";
import SEOHead from "@/components/layout/SEOHead";
import { Button } from "@/components/ui";
import VideoList from "@/components/dashboard/VideoList";
import { listVideos } from "@/services/video.service";

export default function VideosPage() {
  const { t } = useTranslation();
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    listVideos()
      .then((data) => {
        if (!cancelled) setVideos(data.videos || data || []);
      })
      .catch(() => {
        if (!cancelled) setVideos([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <>
      <SEOHead title="Videos" noindex />
      <div className="mx-auto max-w-[900px] px-[var(--space-4)] py-[var(--space-8)]">
        <div className="mb-[var(--space-6)] flex items-center justify-between">
          <h1 className="text-[24px] font-bold text-[var(--color-text-primary)]">
            {t("videos.title")}
          </h1>
          <Button as={Link} to="/generate" size="sm">
            <Sparkles size={14} strokeWidth={1.5} />
            {t("videos.newVideo")}
          </Button>
        </div>
        <VideoList videos={videos} loading={loading} />
      </div>
    </>
  );
}
