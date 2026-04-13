import fp from "fastify-plugin";
import { createHmac } from "node:crypto";
import env from "../config/env.js";
import supabase from "../config/supabase.js";
import { Errors } from "../lib/errors.js";

/**
 * Decodes a Supabase JWT from the Authorization header.
 * On success, decorates request with:
 *   request.user = { id, email, role, aud, ... }
 */
async function authPlugin(fastify) {
  fastify.decorateRequest("user", null);

  fastify.decorate("verifyUser", async (request, reply) => {
    const header = request.headers.authorization;
    if (!header?.startsWith("Bearer ")) {
      throw Errors.unauthorized("Missing or malformed Authorization header");
    }

    const token = header.slice(7);

    // Verify JWT using Supabase — returns the user object
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser(token);

    if (error || !user) {
      throw Errors.unauthorized("Invalid or expired token");
    }

    request.user = {
      id: user.id,
      email: user.email,
      role: user.role, // 'authenticated' for normal users
      aud: user.aud,
    };
  });
}

export default fp(authPlugin, { name: "auth" });
