import env from "../config/env.js";
import logger from "../lib/logger.js";

/**
 * Generate speech audio for a single scene via Kokoro-FastAPI (OpenAI-compatible).
 *
 * Uses the OpenAI-compatible /v1/audio/speech endpoint exposed by Kokoro-FastAPI.
 * Docker: ghcr.io/remsky/kokoro-fastapi-cpu on port 8880
 *
 * @param {string} text - Scene narration text
 * @param {string} voiceId - Kokoro voice preset ID (e.g. "af_heart", "ff_siwis")
 * @param {'en'|'fr'} language
 * @returns {Buffer} WAV audio buffer
 */
export async function generateSpeech(text, voiceId, language) {
  logger.info(
    { voiceId, language, textLen: text.length },
    "TTS: generating speech",
  );

  const res = await fetch(`${env.kokoroTtsUrl}/v1/audio/speech`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer not-needed",
    },
    body: JSON.stringify({
      model: "kokoro",
      voice: voiceId,
      input: text,
      response_format: "wav",
    }),
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    logger.error(
      { status: res.status, body: body.slice(0, 300) },
      "TTS request failed",
    );
    throw new Error(`TTS failed with status ${res.status}`);
  }

  const buffer = Buffer.from(await res.arrayBuffer());
  logger.info({ bytes: buffer.length }, "TTS: audio generated");
  return buffer;
}

/**
 * Apply voice clone via self-hosted OpenVoice V2 (Premium feature).
 *
 * Expected API contract:
 *   POST /clone
 *   Body: multipart/form-data { audio (wav), reference_audio (wav) }
 *   Response: audio/wav binary
 *
 * @param {Buffer} audioBuffer - Source audio from Kokoro
 * @param {Buffer} referenceBuffer - User's reference voice sample
 * @returns {Buffer} Cloned audio buffer
 */
export async function cloneVoice(audioBuffer, referenceBuffer) {
  logger.info("TTS: applying voice clone via OpenVoice");

  const form = new FormData();
  form.append(
    "audio",
    new Blob([audioBuffer], { type: "audio/wav" }),
    "source.wav",
  );
  form.append(
    "reference",
    new Blob([referenceBuffer], { type: "audio/wav" }),
    "reference.wav",
  );

  const res = await fetch(`${env.openvoiceUrl}/clone`, {
    method: "POST",
    body: form,
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    logger.error(
      { status: res.status, body: body.slice(0, 300) },
      "Voice clone failed",
    );
    throw new Error(`Voice clone failed with status ${res.status}`);
  }

  return Buffer.from(await res.arrayBuffer());
}

/**
 * Generate audio for all scenes sequentially.
 * @param {Array} scenes - Scenes with text
 * @param {string} voiceId
 * @param {'en'|'fr'} language
 * @returns {Array} Scenes with audioBuffer added
 */
export async function generateAllSceneAudio(scenes, voiceId, language) {
  const results = [];
  for (const scene of scenes) {
    const audioBuffer = await generateSpeech(scene.text, voiceId, language);
    results.push({ ...scene, audio_buffer: audioBuffer });
  }
  return results;
}
