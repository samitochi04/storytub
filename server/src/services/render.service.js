import supabase from "../config/supabase.js";
import logger from "../lib/logger.js";
import { randomUUID } from "node:crypto";

/**
 * Trigger a Remotion server-side render.
 *
 * In production this calls the Remotion rendering service (e.g. @remotion/lambda
 * or a self-hosted Remotion render process). For now, this is the integration point
 * that the rendering worker will call.
 *
 * Expected contract: POST to a Remotion render endpoint OR call renderMedia() directly
 * in the same process if running co-located. The actual Remotion setup (React compositions,
 * FFmpeg, Chromium) will live in a separate renderer package.
 *
 * @param {object} params
 * @param {string} params.videoId
 * @param {string} params.templateId
 * @param {string} params.resolution
 * @param {Array}  params.scenes - Scenes with image_url, audio_buffer, word_timestamps
 * @param {'en'|'fr'} params.language
 * @returns {{ filePath: string, durationSeconds: number, fileSizeBytes: number }}
 */
export async function renderVideo({
  videoId,
  templateId,
  resolution,
  scenes,
  language,
}) {
  logger.info(
    { videoId, templateId, sceneCount: scenes.length },
    "Render: starting",
  );

  // ── Prepare scene data for Remotion (strip buffers, keep metadata) ──
  const renderScenes = scenes.map((s) => ({
    scene_number: s.scene_number,
    text: s.text,
    image_url: s.image_url,
    word_timestamps: s.word_timestamps,
    estimated_duration_seconds: s.estimated_duration_seconds,
  }));

  //
  // TODO: Replace with actual Remotion renderMedia() call.
  // This is the integration point where the Remotion rendering package
  // will be called. For now, we log and throw so the worker retries
  // don't silently succeed without a real render.
  //
  // Example integration:
  //   import { bundle } from '@remotion/bundler';
  //   import { renderMedia } from '@remotion/renderer';
  //   const bundled = await bundle(path.resolve('remotion/index.ts'));
  //   await renderMedia({
  //     composition,
  //     serveUrl: bundled,
  //     codec: 'h264',
  //     outputLocation: outputPath,
  //     inputProps: { scenes: renderScenes, language },
  //   });
  //
  throw new Error(
    "RENDER_NOT_IMPLEMENTED: Remotion rendering package not yet integrated",
  );
}

/**
 * Upload a rendered video file to Supabase Storage.
 * @param {Buffer} fileBuffer - MP4 file contents
 * @param {string} videoId
 * @param {string} userId - User or "guest"
 * @returns {{ videoUrl: string, thumbnailUrl: string | null }}
 */
export async function uploadToStorage(fileBuffer, videoId, userId) {
  const path = `${userId}/${videoId}.mp4`;

  logger.info({ path, bytes: fileBuffer.length }, "Uploading video to storage");

  const { error } = await supabase.storage
    .from("videos")
    .upload(path, fileBuffer, {
      contentType: "video/mp4",
      upsert: true,
    });

  if (error) {
    logger.error({ error, path }, "Storage upload failed");
    throw error;
  }

  const {
    data: { publicUrl },
  } = supabase.storage.from("videos").getPublicUrl(path);

  return { videoUrl: publicUrl, thumbnailUrl: null };
}
