import { api } from "@/config/api";

const SESSION_KEY = "storytub_guest_token";

function getStoredToken() {
  try {
    return sessionStorage.getItem(SESSION_KEY);
  } catch {
    return null;
  }
}

function storeToken(token) {
  try {
    sessionStorage.setItem(SESSION_KEY, token);
  } catch {
    // sessionStorage unavailable
  }
}

/**
 * Create or retrieve a guest session.
 * Stores session_token in sessionStorage for the tab lifetime.
 */
export async function createGuestSession() {
  const existing = getStoredToken();
  if (existing) return existing;

  const data = await api.post("/guest/session", {});
  storeToken(data.session_token);
  return data.session_token;
}

/**
 * Generate a guest preview video.
 * Automatically creates a session if none exists.
 */
export async function generateGuestPreview({
  topic,
  language = "en",
  templateId = "story_mode",
  voiceId = "af_heart",
  targetDuration = 30,
}) {
  const sessionToken = await createGuestSession();

  return api.post("/guest/generate", {
    session_token: sessionToken,
    topic,
    language,
    template_id: templateId,
    voice_id: voiceId,
    target_duration: targetDuration,
  });
}
