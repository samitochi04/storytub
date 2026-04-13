import { createSession, checkRateLimit } from "../services/guest.service.js";
import { calculateCredits } from "../services/credit.service.js";
import { videoQueue } from "../jobs/queues.js";
import supabase from "../config/supabase.js";
import { Errors } from "../lib/errors.js";

/** JSON schema for POST /guest/session */
const sessionSchema = {
  body: {
    type: "object",
    properties: {
      fingerprint: { type: "string", maxLength: 128 },
    },
  },
};

/** JSON schema for POST /guest/generate */
const generateSchema = {
  body: {
    type: "object",
    required: [
      "topic",
      "language",
      "template_id",
      "voice_id",
      "target_duration",
    ],
    properties: {
      session_token: { type: "string", minLength: 1 },
      topic: { type: "string", minLength: 3, maxLength: 500 },
      language: { type: "string", enum: ["en", "fr"] },
      template_id: { type: "string", minLength: 1 },
      voice_id: { type: "string", minLength: 1 },
      target_duration: { type: "integer", minimum: 15, maximum: 100 },
    },
  },
};

export default async function guestRoutes(app) {
  /**
   * POST /guest/session
   * Create or retrieve a guest session for the current IP.
   * Returns a session_token the client stores in a cookie.
   */
  app.post("/session", { schema: sessionSchema }, async (request) => {
    const ip = request.clientIp;
    const { fingerprint } = request.body || {};

    const session = await createSession(ip, fingerprint);

    return {
      session_token: session.sessionToken,
      guest_session_id: session.id,
    };
  });

  /**
   * POST /guest/generate
   * Generate a preview video for an anonymous user.
   * Rate limited by IP (default: 1 free video).
   * Guest videos have a watermark and shorter max duration.
   */
  app.post("/generate", { schema: generateSchema }, async (request, reply) => {
    const ip = request.clientIp;
    const {
      session_token: sessionToken,
      topic,
      language,
      template_id: templateId,
      voice_id: voiceId,
      target_duration: targetDuration,
    } = request.body;

    if (!sessionToken) {
      throw Errors.badRequest(
        "session_token is required. Call POST /guest/session first.",
      );
    }

    // Check rate limit (DB function: checks blocked flag + videos_generated)
    const allowed = await checkRateLimit(ip, sessionToken);
    if (!allowed) {
      throw Errors.tooMany(
        "Guest video limit reached. Sign up for more videos!",
      );
    }

    // Cap guest duration to 30s
    const guestDuration = Math.min(targetDuration, 30);

    // Create video record (guest — no user_id, no credits charged)
    // Look up guest_session_id from token
    const { data: guestSession } = await supabase
      .from("guest_sessions")
      .select("id")
      .eq("session_token", sessionToken)
      .single();

    const { data: video, error } = await supabase
      .from("videos")
      .insert({
        guest_session_id: guestSession?.id ?? null,
        title: topic.slice(0, 100),
        topic,
        prompt: topic,
        language,
        template_id: templateId,
        voice_id: voiceId,
        target_duration: guestDuration,
        credits_charged: 0,
        has_watermark: true,
        status: "pending",
      })
      .select("id, status, created_at")
      .single();

    if (error) {
      request.log.error({ error }, "Failed to create guest video record");
      throw Errors.badRequest("Could not start video generation");
    }

    // Enqueue video job
    await videoQueue.add(
      "generate",
      { videoId: video.id },
      {
        priority: 10, // lower priority than paid users
      },
    );

    return reply.status(202).send({
      video_id: video.id,
      status: "pending",
      message: "Video generation started. Poll GET /videos/:id for status.",
      estimated_credits: calculateCredits(guestDuration),
    });
  });
}
