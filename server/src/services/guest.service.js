import supabase from "../config/supabase.js";
import env from "../config/env.js";
import logger from "../lib/logger.js";
import { Errors } from "../lib/errors.js";
import { randomBytes } from "node:crypto";

/**
 * Create a new guest session.
 * @param {string} ip - Client IP address
 * @param {string} [fingerprint] - Optional browser fingerprint
 * @returns {{ id: string, sessionToken: string }}
 */
export async function createSession(ip, fingerprint) {
  const sessionToken = randomBytes(32).toString("hex");

  const { data, error } = await supabase
    .from("guest_sessions")
    .upsert(
      {
        ip_address: ip,
        session_token: sessionToken,
        fingerprint: fingerprint ?? null,
      },
      { onConflict: "ip_address", ignoreDuplicates: true },
    )
    .select("id, session_token")
    .single();

  // If upsert returned nothing (IP already exists), fetch existing
  if (!data || error) {
    const { data: existing, error: fetchErr } = await supabase
      .from("guest_sessions")
      .select("id, session_token")
      .eq("ip_address", ip)
      .single();

    if (fetchErr || !existing) {
      logger.error(
        { error: fetchErr, ip },
        "Failed to create/fetch guest session",
      );
      throw Errors.badRequest("Could not create guest session");
    }

    return { id: existing.id, sessionToken: existing.session_token };
  }

  return { id: data.id, sessionToken: data.session_token };
}

/**
 * Check guest rate limit using the DB function.
 * Returns true if the guest is allowed to generate, false otherwise.
 */
export async function checkRateLimit(ip, sessionToken) {
  const { data, error } = await supabase.rpc("check_guest_rate_limit", {
    p_ip_address: ip,
    p_session_token: sessionToken,
    p_max_videos: env.guestMaxVideos,
  });

  if (error) {
    logger.error({ error, ip }, "Guest rate limit check failed");
    throw Errors.badRequest("Rate limit check failed");
  }

  return data === true;
}

/**
 * Fetch a guest session by token.
 */
export async function getSession(sessionToken) {
  const { data, error } = await supabase
    .from("guest_sessions")
    .select("*")
    .eq("session_token", sessionToken)
    .single();

  if (error || !data) return null;
  return data;
}
