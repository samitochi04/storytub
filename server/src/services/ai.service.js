import openai from "../config/openai.js";
import env from "../config/env.js";
import logger from "../lib/logger.js";
import { Errors } from "../lib/errors.js";

/**
 * Build the system prompt for structured script generation.
 */
function buildSystemPrompt(language, templateId, targetDuration) {
  const lang = language === "fr" ? "French" : "English";
  const sceneCount = Math.max(2, Math.round(targetDuration / 5));
  const perScene = Math.round(targetDuration / sceneCount);
  return `You are a professional viral video scriptwriter.

Generate a structured video script for a short-form vertical video (TikTok/Reels/Shorts style).

RULES:
- Write in ${lang}
- Template style: "${templateId}"
- Target total duration: EXACTLY ${targetDuration} seconds. This is critical.
- Create exactly ${sceneCount} scenes, each approximately ${perScene} seconds of spoken narration.
- Each scene narration text MUST be short enough to be spoken in ${perScene} seconds (roughly ${Math.round(perScene * 2.5)} words per scene at normal speech pace).
- Each scene has narration text and an image search query (always in English, max 4-5 keywords for stock photo search)
- Image queries must be simple keyword phrases like "neural network abstract" or "person using smartphone" - NOT long descriptions
- The script should be engaging, punchy, and optimized for social media retention
- Start with a hook that grabs attention in the first 3 seconds
- End with a memorable conclusion or call-to-action
- The title must be a short, catchy, unique title. NOT the user prompt.

Respond ONLY with valid JSON in this exact format:
{
  "title": "Short catchy title",
  "language": "${language}",
  "scenes": [
    {
      "scene_number": 1,
      "text": "Narration text for this scene in ${lang}",
      "image_query": "descriptive image search query in English",
      "estimated_duration_seconds": ${perScene}
    }
  ],
  "total_estimated_duration_seconds": ${targetDuration}
}`;
}

/**
 * Generate a structured video script via OpenAI.
 * @param {string} topic
 * @param {'en'|'fr'} language
 * @param {string} templateId
 * @param {number} targetDuration - seconds (15-100)
 * @returns {object} Parsed script JSON
 */
export async function generateScript(
  topic,
  language,
  templateId,
  targetDuration,
) {
  const systemPrompt = buildSystemPrompt(language, templateId, targetDuration);

  logger.info(
    { topic, language, templateId, targetDuration },
    "Generating AI script",
  );

  const response = await openai.chat.completions.create({
    model: env.openaiModel,
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: topic },
    ],
    response_format: { type: "json_object" },
    temperature: 0.9,
    max_tokens: 4096,
  });

  const text = response.choices[0]?.message?.content;

  let script;
  try {
    script = JSON.parse(text);
  } catch {
    logger.error({ raw: text?.slice(0, 500) }, "OpenAI returned invalid JSON");
    throw Errors.badRequest("AI script generation failed - invalid output");
  }

  // Basic validation
  if (
    !script.scenes ||
    !Array.isArray(script.scenes) ||
    script.scenes.length === 0
  ) {
    logger.error({ script }, "OpenAI returned script with no scenes");
    throw Errors.badRequest("AI script generation failed - no scenes");
  }

  logger.info(
    { sceneCount: script.scenes.length, title: script.title },
    "AI script generated",
  );

  return script;
}
