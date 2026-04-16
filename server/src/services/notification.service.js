import supabase from "../config/supabase.js";
import logger from "../lib/logger.js";

/**
 * Insert an in-app notification for a user.
 * Uses service_role client to bypass RLS.
 *
 * @param {string} userId
 * @param {object} opts
 * @param {string} opts.title
 * @param {string} opts.message
 * @param {string} [opts.type='info'] - 'info' | 'success' | 'warning' | 'error'
 * @param {string} [opts.link] - optional deep link (e.g. '/videos/uuid')
 */
export async function createNotification(userId, { title, message, type = "info", link }) {
  const { error } = await supabase.from("notifications").insert({
    user_id: userId,
    title,
    message,
    type,
    link,
  });

  if (error) {
    logger.error({ error, userId, title }, "Failed to insert notification");
  }
}
