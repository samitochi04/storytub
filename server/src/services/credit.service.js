import supabase from "../config/supabase.js";
import { Errors } from "../lib/errors.js";

const BASE_CREDITS = 1000;
const RATE_PER_SECOND = 35;

/**
 * Calculate credits required for a video.
 * @param {number} durationSeconds - Target duration (15–100)
 * @returns {number}
 */
export function calculateCredits(durationSeconds) {
  return BASE_CREDITS + durationSeconds * RATE_PER_SECOND;
}

/**
 * Atomically deduct credits for video generation.
 * Uses the DB function that locks the profile row to prevent race conditions.
 * @returns {boolean} true if deducted, false if insufficient
 */
export async function deductCredits(userId, credits, videoId) {
  const { data, error } = await supabase.rpc("deduct_video_credits", {
    p_user_id: userId,
    p_credits: credits,
    p_video_id: videoId,
  });

  if (error) throw error;
  return data === true;
}

/**
 * Add credits (refund, subscription renewal, bundle, coupon).
 * @returns {number} New balance
 */
export async function addCredits(userId, credits, type, refId, description) {
  const { data, error } = await supabase.rpc("add_credits", {
    p_user_id: userId,
    p_credits: credits,
    p_type: type,
    p_ref_id: refId ?? null,
    p_desc: description ?? null,
  });

  if (error) throw error;
  return data;
}

/**
 * Refund credits for a failed video.
 */
export async function refundCredits(userId, credits, videoId) {
  return addCredits(
    userId,
    credits,
    "refund",
    videoId,
    "Refund: video generation failed",
  );
}
