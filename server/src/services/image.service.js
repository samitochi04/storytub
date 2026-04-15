import env from "../config/env.js";
import logger from "../lib/logger.js";

const PIXABAY_BASE = "https://pixabay.com/api/";
const UNSPLASH_BASE = "https://api.unsplash.com";

/**
 * Sanitize AI-generated image queries for stock photo APIs.
 * APIs expect short keyword-based queries, not long descriptions.
 */
function sanitizeQuery(query) {
  return query
    .replace(/['"]/g, "") // remove quotes
    .replace(/[^a-zA-Z0-9\s]/g, " ") // strip special chars
    .replace(/\s+/g, " ") // collapse whitespace
    .trim()
    .split(" ")
    .slice(0, 6) // max 6 words
    .join(" ");
}

/**
 * Search Pixabay for an image.
 * @returns {string|null} Image URL or null
 */
async function searchPixabay(query, lang = "en") {
  if (!env.pixabayApiKey) return null;

  const cleanQuery = sanitizeQuery(query);
  const params = new URLSearchParams({
    key: env.pixabayApiKey,
    q: cleanQuery,
    lang: lang === "fr" ? "fr" : "en",
    image_type: "photo",
    orientation: "vertical",
    safesearch: "true",
    per_page: "5",
  });

  const res = await fetch(`${PIXABAY_BASE}?${params}`);
  if (!res.ok) {
    logger.warn({ status: res.status, query }, "Pixabay request failed");
    return null;
  }

  const data = await res.json();
  if (!data.hits?.length) return null;

  // Pick a random hit from top 5 for variety
  const hit = data.hits[Math.floor(Math.random() * data.hits.length)];
  return hit.largeImageURL || hit.webformatURL;
}

/**
 * Search Unsplash for an image (fallback).
 * @returns {string|null} Image URL or null
 */
async function searchUnsplash(query) {
  if (!env.unsplashAccessKey) return null;

  const cleanQuery = sanitizeQuery(query);
  const params = new URLSearchParams({
    query: cleanQuery,
    orientation: "portrait",
    per_page: "5",
  });

  const res = await fetch(`${UNSPLASH_BASE}/search/photos?${params}`, {
    headers: { Authorization: `Client-ID ${env.unsplashAccessKey}` },
  });

  if (!res.ok) {
    logger.warn({ status: res.status, query }, "Unsplash request failed");
    return null;
  }

  const data = await res.json();
  if (!data.results?.length) return null;

  const result = data.results[Math.floor(Math.random() * data.results.length)];
  return result.urls?.regular || result.urls?.small;
}

/**
 * Fetch one image per scene.
 * Strategy: Pixabay first, Unsplash fallback, placeholder last.
 * @param {Array} scenes - Script scenes with image_query
 * @param {'en'|'fr'} language
 * @returns {Array} Scenes with imageUrl added
 */
export async function fetchSceneImages(scenes, language) {
  const results = await Promise.allSettled(
    scenes.map(async (scene) => {
      const query = scene.image_query;

      let url = await searchPixabay(query, language);
      if (!url) url = await searchUnsplash(query);
      if (!url) {
        logger.warn({ query }, "No image found for scene, using placeholder");
        url = `https://placehold.co/1080x1920/1a1a2e/ffffff?text=${encodeURIComponent(query.slice(0, 30))}`;
      }

      return { ...scene, image_url: url };
    }),
  );

  return results.map((r, i) =>
    r.status === "fulfilled" ? r.value : { ...scenes[i], image_url: null },
  );
}
