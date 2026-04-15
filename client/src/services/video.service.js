import { api } from "@/config/api";

/**
 * Start video generation for the authenticated user.
 */
export function generateVideo({
  topic,
  language,
  templateId,
  voiceId,
  targetDuration,
}) {
  return api.post("/videos/generate", {
    topic,
    language,
    template_id: templateId,
    voice_id: voiceId,
    target_duration: targetDuration,
  });
}

/**
 * List all videos for the current user.
 */
export function listVideos() {
  return api.get("/videos");
}

/**
 * Get a single video by ID.
 */
export function getVideo(id) {
  return api.get(`/videos/${id}`);
}

/**
 * Get a signed download URL for a video.
 */
export function getDownloadUrl(id) {
  return api.get(`/videos/${id}/download`);
}

/**
 * Delete a video.
 */
export function deleteVideo(id) {
  return api.delete(`/videos/${id}`);
}

/**
 * Retry a failed video generation.
 */
export function retryVideo(id) {
  return api.post(`/videos/${id}/retry`);
}

/**
 * List available templates (from Supabase templates table).
 */
export function listTemplates() {
  return api.get("/templates");
}

/**
 * List available voices for the current user.
 */
export function listVoices() {
  return api.get("/voices");
}

/**
 * Upload a voice sample for cloning (Premium only).
 * Uses FormData for the audio file upload.
 */
export async function cloneVoice(name, audioFile) {
  const formData = new FormData();
  formData.append("name", name);
  formData.append("audio", audioFile);

  const API_BASE_URL =
    import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";
  const { supabase } = await import("@/config/supabase");
  const { data } = await supabase.auth.getSession();
  const token = data?.session?.access_token;

  const res = await fetch(`${API_BASE_URL}/voices/clone`, {
    method: "POST",
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    body: formData,
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    const error = new Error(body.message || `Request failed: ${res.status}`);
    error.status = res.status;
    error.body = body;
    throw error;
  }

  return res.json();
}

/**
 * Delete a cloned voice.
 */
export function deleteVoice(id) {
  return api.delete(`/voices/${id}`);
}
