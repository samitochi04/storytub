import { spawn } from "node:child_process";
import { writeFile, readFile, mkdir, rm } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";
import ffmpegPath from "@ffmpeg-installer/ffmpeg";
import ffprobePath from "@ffprobe-installer/ffprobe";
import supabase from "../config/supabase.js";
import logger from "../lib/logger.js";

const FFMPEG = ffmpegPath.path;
const FFPROBE = ffprobePath.path;
const WIDTH = 1080;
const HEIGHT = 1920;
const FPS = 30;

/**
 * Run an FFmpeg/FFprobe command and return stdout.
 */
function runCmd(bin, args) {
  return new Promise((resolve, reject) => {
    const proc = spawn(bin, args, { stdio: ["pipe", "pipe", "pipe"] });
    const chunks = [];
    const errChunks = [];
    proc.stdout.on("data", (d) => chunks.push(d));
    proc.stderr.on("data", (d) => errChunks.push(d));
    proc.on("close", (code) => {
      if (code !== 0) {
        const stderr = Buffer.concat(errChunks).toString().slice(-1000);
        reject(new Error(`${bin} exited with code ${code}: ${stderr}`));
      } else {
        resolve(Buffer.concat(chunks));
      }
    });
    proc.on("error", reject);
  });
}

/**
 * Get audio duration in seconds via ffprobe.
 */
async function getAudioDuration(filePath) {
  const out = await runCmd(FFPROBE, [
    "-v",
    "quiet",
    "-show_entries",
    "format=duration",
    "-of",
    "csv=p=0",
    filePath,
  ]);
  return parseFloat(out.toString().trim());
}

/**
 * Download a file from URL to local path.
 */
async function downloadFile(url, destPath) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to download ${url}: ${res.status}`);
  const buffer = Buffer.from(await res.arrayBuffer());
  await writeFile(destPath, buffer);
}

/**
 * Generate ASS subtitle file from word timestamps.
 * Uses karaoke-style word highlighting for professional captions.
 */
function generateASS(scenes, sceneOffsets) {
  const header = `[Script Info]
Title: StoryTub Captions
ScriptType: v4.00+
PlayResX: ${WIDTH}
PlayResY: ${HEIGHT}
WrapStyle: 0

[V4+ Styles]
Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding
Style: Default,Arial,72,&H00FFFFFF,&H0000FFFF,&H00000000,&H80000000,-1,0,0,0,100,100,0,0,1,4,2,2,40,40,180,1
Style: Highlight,Arial,76,&H0000FFFF,&H00FFFFFF,&H00000000,&H80000000,-1,0,0,0,100,100,0,0,1,4,2,2,40,40,180,1

[Events]
Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text
`;

  const lines = [];

  for (let i = 0; i < scenes.length; i++) {
    const scene = scenes[i];
    const offset = sceneOffsets[i];
    const words = scene.word_timestamps || [];

    if (words.length === 0) continue;

    // Group words into chunks of 3-4 for display
    const chunks = [];
    for (let w = 0; w < words.length; w += 3) {
      chunks.push(words.slice(w, w + 3));
    }

    for (const chunk of chunks) {
      const chunkStart = offset + chunk[0].start;
      const chunkEnd = offset + chunk[chunk.length - 1].end + 0.1;

      // Build karaoke text with \k tags
      let karaText = "";
      for (const word of chunk) {
        const durCs = Math.round((word.end - word.start) * 100);
        const cleanWord = word.word.trim();
        if (!cleanWord) continue;
        karaText += `{\\kf${durCs}}${cleanWord} `;
      }

      const startTS = formatASSTime(chunkStart);
      const endTS = formatASSTime(chunkEnd);
      lines.push(
        `Dialogue: 0,${startTS},${endTS},Default,,0,0,0,,${karaText.trim()}`,
      );
    }
  }

  return header + lines.join("\n") + "\n";
}

/**
 * Format seconds to ASS timestamp (H:MM:SS.CC).
 */
function formatASSTime(seconds) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  return `${h}:${String(m).padStart(2, "0")}:${s.toFixed(2).padStart(5, "0")}`;
}

/**
 * Render a single scene: image + Ken Burns effect + audio → .ts clip.
 */
async function renderSceneClip(scene, workDir, sceneIdx) {
  const imgPath = join(workDir, `scene_${sceneIdx}.jpg`);
  const audioPath = join(workDir, `scene_${sceneIdx}.wav`);
  const clipPath = join(workDir, `clip_${sceneIdx}.ts`);

  // Get audio duration to set video length
  const duration = await getAudioDuration(audioPath);
  const frames = Math.ceil(duration * FPS);

  // Alternate between zoom-in and zoom-out Ken Burns effect
  const zoomIn = sceneIdx % 2 === 0;
  const zoomFilter = zoomIn
    ? `zoompan=z='min(zoom+0.0008,1.3)':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':d=${frames}:s=${WIDTH}x${HEIGHT}:fps=${FPS}`
    : `zoompan=z='if(eq(on,1),1.3,max(zoom-0.0008,1.0))':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':d=${frames}:s=${WIDTH}x${HEIGHT}:fps=${FPS}`;

  const args = [
    "-y",
    "-loop",
    "1",
    "-t",
    String(duration),
    "-i",
    imgPath,
    "-i",
    audioPath,
    "-filter_complex",
    `[0]scale=${WIDTH * 2}:${HEIGHT * 2}:force_original_aspect_ratio=increase,crop=${WIDTH * 2}:${HEIGHT * 2},${zoomFilter}[v]`,
    "-map",
    "[v]",
    "-map",
    "1:a",
    "-c:v",
    "libx264",
    "-preset",
    "fast",
    "-crf",
    "23",
    "-c:a",
    "aac",
    "-b:a",
    "128k",
    "-t",
    String(duration),
    "-f",
    "mpegts",
    clipPath,
  ];

  await runCmd(FFMPEG, args);
  return { clipPath, duration };
}

/**
 * Render the full video: all scenes → Ken Burns clips → concatenate → burn captions.
 *
 * @param {object} params
 * @param {string} params.videoId
 * @param {string} params.templateId
 * @param {string} params.resolution
 * @param {Array}  params.scenes - Scenes with image_url, audio_buffer, word_timestamps
 * @param {'en'|'fr'} params.language
 * @returns {{ fileBuffer: Buffer, durationSeconds: number, fileSizeBytes: number }}
 */
export async function renderVideo({
  videoId,
  templateId,
  resolution,
  scenes,
  language,
}) {
  const workDir = join(tmpdir(), `storytub-render-${videoId}`);
  await mkdir(workDir, { recursive: true });

  logger.info(
    { videoId, templateId, sceneCount: scenes.length, workDir },
    "Render: starting FFmpeg pipeline",
  );

  try {
    // ── 1. Download images & save audio files ──
    await Promise.all(
      scenes.map(async (scene, i) => {
        const imgPath = join(workDir, `scene_${i}.jpg`);
        const audioPath = join(workDir, `scene_${i}.wav`);

        await downloadFile(scene.image_url, imgPath);
        await writeFile(audioPath, scene.audio_buffer);
      }),
    );

    logger.info({ videoId }, "Render: assets downloaded");

    // ── 2. Render per-scene clips in parallel (max 3 at a time) ──
    const sceneDurations = [];
    const clipPaths = [];

    // Process 3 scenes at a time to limit CPU usage
    for (let batch = 0; batch < scenes.length; batch += 3) {
      const batchScenes = scenes.slice(batch, batch + 3);
      const results = await Promise.all(
        batchScenes.map((scene, j) =>
          renderSceneClip(scene, workDir, batch + j),
        ),
      );
      for (const r of results) {
        clipPaths.push(r.clipPath);
        sceneDurations.push(r.duration);
      }
    }

    logger.info(
      { videoId, clips: clipPaths.length },
      "Render: scene clips created",
    );

    // ── 3. Calculate offsets for subtitle timing using actual clip durations ──
    const sceneOffsets = [];
    let cumulative = 0;
    for (const clipPath of clipPaths) {
      sceneOffsets.push(cumulative);
      const clipDur = await getAudioDuration(clipPath);
      cumulative += clipDur;
    }

    // ── 4. Generate ASS subtitles ──
    const assPath = join(workDir, "captions.ass");
    const assContent = generateASS(scenes, sceneOffsets);
    await writeFile(assPath, assContent);

    // ── 5. Create concat list ──
    const concatListPath = join(workDir, "concat.txt");
    const concatContent = clipPaths
      .map((p) => `file '${p.replace(/\\/g, "/")}'`)
      .join("\n");
    await writeFile(concatListPath, concatContent);

    // ── 6. Final render: concatenate + burn subtitles ──
    const outputPath = join(workDir, `${videoId}.mp4`);

    // Escape backslashes for ASS filter path on Windows
    const assFilterPath = assPath.replace(/\\/g, "/").replace(/:/g, "\\:");

    await runCmd(FFMPEG, [
      "-y",
      "-f",
      "concat",
      "-safe",
      "0",
      "-i",
      concatListPath,
      "-vf",
      `ass='${assFilterPath}'`,
      "-c:v",
      "libx264",
      "-preset",
      "medium",
      "-crf",
      "23",
      "-c:a",
      "aac",
      "-b:a",
      "128k",
      "-movflags",
      "+faststart",
      outputPath,
    ]);

    logger.info({ videoId }, "Render: final video encoded");

    // ── 7. Extract thumbnail from first scene image ──
    const thumbPath = join(workDir, `${videoId}_thumb.jpg`);
    // Take the first scene image and resize it for thumbnail
    const firstImgPath = join(workDir, "scene_0.jpg");
    await runCmd(FFMPEG, [
      "-y",
      "-i",
      firstImgPath,
      "-vframes",
      "1",
      "-vf",
      `scale=480:-1`,
      "-q:v",
      "4",
      thumbPath,
    ]);

    const thumbBuffer = await readFile(thumbPath);

    const fileBuffer = await readFile(outputPath);

    // Read original first scene image for preview
    const previewBuffer = await readFile(firstImgPath);

    // Get accurate duration from the final rendered file
    const actualDuration = await getAudioDuration(outputPath);

    return {
      fileBuffer,
      thumbBuffer,
      previewBuffer,
      durationSeconds: Math.round(actualDuration),
      fileSizeBytes: fileBuffer.length,
    };
  } finally {
    // Cleanup temp directory
    await rm(workDir, { recursive: true, force: true }).catch(() => {});
  }
}

/**
 * Upload a rendered video file and thumbnail to Supabase Storage.
 * @param {Buffer} fileBuffer - MP4 file contents
 * @param {string} videoId
 * @param {string} userId - User or "guest"
 * @param {Buffer} [thumbBuffer] - JPEG thumbnail
 * @returns {{ videoUrl: string, thumbnailUrl: string | null }}
 */
export async function uploadToStorage(
  fileBuffer,
  videoId,
  userId,
  thumbBuffer,
  previewBuffer,
) {
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

  // Upload thumbnail
  let thumbnailUrl = null;
  if (thumbBuffer) {
    const thumbPath = `${userId}/${videoId}_thumb.jpg`;
    const { error: thumbErr } = await supabase.storage
      .from("videos")
      .upload(thumbPath, thumbBuffer, {
        contentType: "image/jpeg",
        upsert: true,
      });

    if (!thumbErr) {
      const { data: thumbSigned } = await supabase.storage
        .from("videos")
        .createSignedUrl(thumbPath, 365 * 24 * 60 * 60);
      thumbnailUrl = thumbSigned?.signedUrl || null;

      if (!thumbnailUrl) {
        const {
          data: { publicUrl: thumbPublic },
        } = supabase.storage.from("videos").getPublicUrl(thumbPath);
        thumbnailUrl = thumbPublic;
      }
    } else {
      logger.warn({ error: thumbErr }, "Thumbnail upload failed, skipping");
    }
  }

  // Upload preview image (full-resolution first scene)
  let previewUrl = null;
  if (previewBuffer) {
    const previewPath = `${userId}/${videoId}_preview.jpg`;
    const { error: previewErr } = await supabase.storage
      .from("videos")
      .upload(previewPath, previewBuffer, {
        contentType: "image/jpeg",
        upsert: true,
      });

    if (!previewErr) {
      const { data: previewSigned } = await supabase.storage
        .from("videos")
        .createSignedUrl(previewPath, 365 * 24 * 60 * 60);
      previewUrl = previewSigned?.signedUrl || null;

      if (!previewUrl) {
        const {
          data: { publicUrl: previewPublic },
        } = supabase.storage.from("videos").getPublicUrl(previewPath);
        previewUrl = previewPublic;
      }
    } else {
      logger.warn({ error: previewErr }, "Preview upload failed, skipping");
    }
  }

  const {
    data: { publicUrl },
  } = supabase.storage.from("videos").getPublicUrl(path);

  // Also create a signed URL (valid for 7 days) as fallback
  const { data: signedData } = await supabase.storage
    .from("videos")
    .createSignedUrl(path, 7 * 24 * 60 * 60);

  return { videoUrl: signedData?.signedUrl || publicUrl, thumbnailUrl, previewUrl };
}
