import supabase from "../config/supabase.js";
import logger from "../lib/logger.js";
import { generateScript } from "./ai.service.js";
import { fetchSceneImages } from "./image.service.js";
import { generateAllSceneAudio } from "./tts.service.js";
import { extractAllTimestamps } from "./whisper.service.js";
import { renderVideo, uploadToStorage } from "./render.service.js";
import { refundCredits } from "./credit.service.js";
import { queueTemplateEmail } from "./email.service.js";
import { createNotification } from "./notification.service.js";

/**
 * Update video status in DB.
 */
async function updateVideoStatus(videoId, status, extra = {}) {
  const update = { status, ...extra };
  if (status === "completed") update.completed_at = new Date().toISOString();

  const { error } = await supabase
    .from("videos")
    .update(update)
    .eq("id", videoId);

  if (error)
    logger.error({ error, videoId, status }, "Failed to update video status");
}

/**
 * Run the full video generation pipeline.
 *
 * Steps:
 *   1. Generate script (Gemini)
 *   2. Fetch images (Pixabay / Unsplash)
 *   3. Generate TTS audio per scene (Kokoro)
 *   4. Extract word-level timestamps (faster-whisper)
 *   5. Render video (Remotion)
 *   6. Upload to Supabase Storage
 *   7. Update DB record → completed
 *
 * On failure → status = 'failed', refund credits if applicable.
 *
 * @param {object} video - Video DB row
 */
export async function runPipeline(video) {
  const { id: videoId, user_id: userId } = video;

  try {
    // ── Step 1: AI Script ───────────────────────────────────────
    await updateVideoStatus(videoId, "generating");

    const script = await generateScript(
      video.topic,
      video.language,
      video.template_id,
      video.target_duration,
    );

    await supabase
      .from("videos")
      .update({ script, title: script.title || video.title })
      .eq("id", videoId);

    // ── Step 2: Fetch Images ────────────────────────────────────
    let scenes = await fetchSceneImages(script.scenes, video.language);

    // ── Step 3: Generate TTS ────────────────────────────────────
    scenes = await generateAllSceneAudio(
      scenes,
      video.voice_id,
      video.language,
    );

    // ── Step 4: Extract Timestamps ──────────────────────────────
    scenes = await extractAllTimestamps(scenes);

    // ── Step 5–6: Render + Upload ───────────────────────────────
    await updateVideoStatus(videoId, "rendering");

    const rendered = await renderVideo({
      videoId,
      templateId: video.template_id,
      resolution: video.resolution,
      scenes,
      language: video.language,
    });

    const { videoUrl, thumbnailUrl, previewUrl } = await uploadToStorage(
      rendered.fileBuffer,
      videoId,
      userId ?? "guest",
      rendered.thumbBuffer,
      rendered.previewBuffer,
    );

    // ── Step 7: Mark Complete ───────────────────────────────────
    await updateVideoStatus(videoId, "completed", {
      video_url: videoUrl,
      thumbnail_url: thumbnailUrl,
      preview_url: previewUrl,
      duration_seconds: Math.round(rendered.durationSeconds),
      file_size_bytes: rendered.fileSizeBytes,
    });

    if (userId) {
      try {
        await queueTemplateEmail({
          userId,
          templateId: "video_ready",
          emailType: "notification",
          variables: {
            video_title: video.title,
            video_url: videoUrl,
          },
        });
      } catch (emailError) {
        logger.error(
          { err: emailError, videoId, userId },
          "Failed to queue video-ready email",
        );
      }

      await createNotification(userId, {
        title: "Video ready",
        message: `Your video "${video.title}" has been generated successfully.`,
        type: "success",
        link: `/videos/${videoId}`,
      });
    }

    logger.info({ videoId }, "Video pipeline completed");
  } catch (err) {
    logger.error({ err, videoId }, "Video pipeline failed");

    await updateVideoStatus(videoId, "failed", {
      error_message: "Video generation failed. Please try again later.",
    });

    // Refund credits if a logged-in user was charged
    if (userId && video.credits_charged > 0) {
      try {
        await refundCredits(userId, video.credits_charged, videoId);
        logger.info(
          { videoId, credits: video.credits_charged },
          "Credits refunded",
        );

        await createNotification(userId, {
          title: "Video generation failed",
          message: `Your video "${video.title}" could not be generated. ${video.credits_charged} credits have been refunded.`,
          type: "error",
          link: `/videos/${videoId}`,
        });
      } catch (refundErr) {
        logger.error({ err: refundErr, videoId }, "Credit refund failed");
      }
    } else if (userId) {
      await createNotification(userId, {
        title: "Video generation failed",
        message: `Your video "${video.title}" could not be generated. Please try again later.`,
        type: "error",
        link: `/videos/${videoId}`,
      });
    }

    throw err; // re-throw so BullMQ can retry
  }
}
