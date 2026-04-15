import supabase from "../config/supabase.js";
import { Errors } from "../lib/errors.js";
import {
  calculateCredits,
  deductCredits,
  refundCredits,
} from "../services/credit.service.js";
import { getVideoQueue } from "../jobs/queues.js";

/** JSON schema for POST /videos/generate */
const generateSchema = {
  body: {
    type: "object",
    required: [
      "topic",
      "language",
      "template_id",
      "voice_id",
      "target_duration",
    ],
    properties: {
      topic: { type: "string", minLength: 3, maxLength: 1100 },
      language: { type: "string", enum: ["en", "fr"] },
      template_id: { type: "string", minLength: 1 },
      voice_id: { type: "string", minLength: 1 },
      target_duration: { type: "integer", minimum: 15, maximum: 100 },
    },
  },
};

/** JSON schema for POST /videos/:id/retry */
const retrySchema = {
  params: {
    type: "object",
    required: ["id"],
    properties: {
      id: { type: "string", format: "uuid" },
    },
  },
};

export default async function videoRoutes(app) {
  /**
   * POST /videos/generate
   * Start video generation for an authenticated user.
   * Deducts credits atomically, then enqueues the job.
   */
  app.post(
    "/generate",
    { schema: generateSchema, preHandler: [app.verifyUser] },
    async (request, reply) => {
      const userId = request.user.id;
      const {
        topic,
        language,
        template_id: templateId,
        voice_id: voiceId,
        target_duration: targetDuration,
      } = request.body;

      // Calculate and deduct credits
      const credits = calculateCredits(targetDuration);

      // Create video record first (need the ID for deduction reference)
      const { data: video, error: insertErr } = await supabase
        .from("videos")
        .insert({
          user_id: userId,
          title: topic.slice(0, 100),
          topic,
          prompt: topic,
          language,
          template_id: templateId,
          voice_id: voiceId,
          target_duration: targetDuration,
          credits_charged: credits,
          has_watermark: false,
          status: "pending",
        })
        .select("id, status, credits_charged, created_at")
        .single();

      if (insertErr) {
        request.log.error(
          { error: insertErr },
          "Failed to create video record",
        );
        throw Errors.badRequest("Could not start video generation");
      }

      // Atomic credit deduction
      const deducted = await deductCredits(userId, credits, video.id);
      if (!deducted) {
        // Roll back the video record
        await supabase.from("videos").delete().eq("id", video.id);
        throw Errors.insufficientCredits(
          `Not enough credits. Need ${credits}, check your balance.`,
        );
      }

      // Enqueue video job (graceful when Redis is unavailable)
      const queue = getVideoQueue();
      if (queue) {
        try {
          await queue.add("generate", { videoId: video.id }, { priority: 1 });
        } catch (queueErr) {
          request.log.warn(
            { err: queueErr },
            "Failed to enqueue video job — Redis may be down",
          );
        }
      } else {
        request.log.warn(
          { videoId: video.id },
          "Redis unavailable — video queued in DB but not in BullMQ",
        );
      }

      return reply.status(202).send({
        video_id: video.id,
        status: "pending",
        credits_charged: credits,
        message: "Video generation started",
      });
    },
  );

  /**
   * POST /videos/:id/retry
   * Retry a failed video. Re-charges credits.
   */
  app.post(
    "/:id/retry",
    { schema: retrySchema, preHandler: [app.verifyUser] },
    async (request, reply) => {
      const userId = request.user.id;
      const videoId = request.params.id;

      // Fetch the video
      const { data: video, error } = await supabase
        .from("videos")
        .select("*")
        .eq("id", videoId)
        .eq("user_id", userId)
        .single();

      if (error || !video) throw Errors.notFound("Video not found");
      if (video.status !== "failed") {
        throw Errors.badRequest("Only failed videos can be retried");
      }
      if (video.retry_count >= 3) {
        throw Errors.badRequest("Maximum retries reached for this video");
      }

      // Re-deduct credits (refund was given on failure)
      const deducted = await deductCredits(
        userId,
        video.credits_charged,
        videoId,
      );
      if (!deducted) {
        throw Errors.insufficientCredits("Not enough credits to retry");
      }

      // Reset status and increment retry
      await supabase
        .from("videos")
        .update({
          status: "pending",
          error_message: null,
          retry_count: video.retry_count + 1,
        })
        .eq("id", videoId);

      // Re-enqueue (graceful when Redis is unavailable)
      const retryQueue = getVideoQueue();
      if (retryQueue) {
        try {
          await retryQueue.add("generate", { videoId }, { priority: 1 });
        } catch (queueErr) {
          request.log.warn({ err: queueErr }, "Failed to enqueue retry job");
        }
      }

      return reply.status(202).send({
        video_id: videoId,
        status: "pending",
        retry_count: video.retry_count + 1,
        message: "Video retry started",
      });
    },
  );
}
