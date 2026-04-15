import env from "../config/env.js";
import logger from "../lib/logger.js";

/**
 * Extract word-level timestamps from an audio buffer via faster-whisper-server.
 *
 * Uses the OpenAI-compatible /v1/audio/transcriptions endpoint.
 * Docker: fedirz/faster-whisper-server on port 8102
 *
 * @param {Buffer} audioBuffer - WAV audio
 * @returns {Array<{ word: string, start: number, end: number }>}
 */
export async function extractTimestamps(audioBuffer) {
  logger.info({ bytes: audioBuffer.length }, "Whisper: extracting timestamps");

  const form = new FormData();
  form.append(
    "file",
    new Blob([audioBuffer], { type: "audio/wav" }),
    "audio.wav",
  );
  form.append("model", "Systran/faster-whisper-small");
  form.append("response_format", "verbose_json");
  form.append("timestamp_granularities[]", "word");

  const res = await fetch(`${env.whisperUrl}/v1/audio/transcriptions`, {
    method: "POST",
    body: form,
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    logger.error(
      { status: res.status, body: body.slice(0, 300) },
      "Whisper request failed",
    );
    throw new Error(`Whisper failed with status ${res.status}`);
  }

  const data = await res.json();

  if (!data.words || !Array.isArray(data.words)) {
    logger.warn({ data }, "Whisper returned unexpected format");
    return [];
  }

  logger.info(
    { wordCount: data.words.length },
    "Whisper: timestamps extracted",
  );
  return data.words;
}

/**
 * Extract timestamps for all scenes.
 * @param {Array} scenes - Scenes with audio_buffer
 * @returns {Array} Scenes with word_timestamps added
 */
export async function extractAllTimestamps(scenes) {
  const results = [];
  for (const scene of scenes) {
    const timestamps = await extractTimestamps(scene.audio_buffer);
    results.push({ ...scene, word_timestamps: timestamps });
  }
  return results;
}
