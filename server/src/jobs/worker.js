import { Worker } from "bullmq";
import redis from "../config/redis.js";
import supabase from "../config/supabase.js";
import logger from "../lib/logger.js";
import { runPipeline } from "../services/video.service.js";

/**
 * Video generation worker.
 * Picks jobs from the "video-generation" queue and runs the full pipeline.
 */
const videoWorker = new Worker(
  "video-generation",
  async (job) => {
    const { videoId } = job.data;
    logger.info(
      { jobId: job.id, videoId, attempt: job.attemptsMade + 1 },
      "Worker: processing video",
    );

    // Fetch video record
    const { data: video, error } = await supabase
      .from("videos")
      .select("*")
      .eq("id", videoId)
      .single();

    if (error || !video) {
      logger.error({ error, videoId }, "Worker: video not found");
      throw new Error(`Video ${videoId} not found`);
    }

    // Update job_id reference
    await supabase.from("videos").update({ job_id: job.id }).eq("id", videoId);

    await runPipeline(video);
  },
  {
    connection: redis,
    concurrency: 2,
    limiter: { max: 5, duration: 60_000 }, // max 5 jobs per minute
  },
);

videoWorker.on("completed", (job) => {
  logger.info(
    { jobId: job.id, videoId: job.data.videoId },
    "Worker: video completed",
  );
});

videoWorker.on("failed", (job, err) => {
  logger.error(
    {
      jobId: job?.id,
      videoId: job?.data?.videoId,
      err: err.message,
      attempts: job?.attemptsMade,
    },
    "Worker: video failed",
  );
});

videoWorker.on("error", (err) => {
  logger.error({ err }, "Worker: connection error");
});

logger.info("Video worker started");

export default videoWorker;
