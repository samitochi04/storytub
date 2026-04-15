import { api } from "@/config/api";
import { supabase } from "@/config/supabase";

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
 * List all videos for the current user (via Supabase RLS).
 */
export async function listVideos() {
  const { data, error } = await supabase
    .from("videos")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data;
}

/**
 * Get a single video by ID (via Supabase RLS).
 */
export async function getVideo(id) {
  const { data, error } = await supabase
    .from("videos")
    .select("*")
    .eq("id", id)
    .single();
  if (error) throw error;
  return data;
}

/**
 * Get a fresh signed URL for a video_url stored in the DB.
 */
export async function getSignedVideoUrl(videoUrl) {
  if (!videoUrl) return null;
  const match = videoUrl.match(/\/videos\/(.+\.mp4)/);
  if (!match) return null;
  const storagePath = match[1].split("?")[0];
  const { data, error } = await supabase.storage
    .from("videos")
    .createSignedUrl(storagePath, 3600);
  if (error || !data?.signedUrl) return null;
  return data.signedUrl;
}

/**
 * Get a fresh signed download URL for a video.
 */
export async function getDownloadUrl(id) {
  const video = await getVideo(id);
  if (!video?.video_url) throw new Error("Video not ready for download");

  // Extract the storage path from the URL
  // URL format: .../storage/v1/object/public/videos/userId/videoId.mp4 or signed variant
  const match = video.video_url.match(/\/videos\/(.+\.mp4)/);
  if (match) {
    const storagePath = match[1].split("?")[0];
    const { data, error } = await supabase.storage
      .from("videos")
      .createSignedUrl(storagePath, 3600);
    if (!error && data?.signedUrl) {
      return { url: data.signedUrl };
    }
  }

  return { url: video.video_url };
}

/**
 * Delete a video (via Supabase RLS).
 */
export async function deleteVideo(id) {
  const { error } = await supabase.from("videos").delete().eq("id", id);
  if (error) throw error;
}

/**
 * Retry a failed video generation.
 */
export function retryVideo(id) {
  return api.post(`/videos/${id}/retry`);
}

/**
 * List available templates (via Supabase).
 */
export async function listTemplates() {
  const { data, error } = await supabase
    .from("templates")
    .select("*")
    .eq("is_active", true)
    .order("sort_order", { ascending: true });
  if (error) throw error;
  return data;
}

/**
 * List available voices for the current user.
 * Falls back to built-in default voices if the API is unavailable.
 */
export async function listVoices() {
  try {
    const data = await api.get("/voices");
    const list = Array.isArray(data) ? data : data.voices || [];
    if (list.length > 0) return list;
  } catch {
    // API not available, fall back to defaults
  }
  const { DEFAULT_VOICES } = await import("@/config/constants");
  return DEFAULT_VOICES;
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
