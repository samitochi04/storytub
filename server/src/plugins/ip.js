import fp from "fastify-plugin";

/**
 * Extracts the real client IP from proxy headers (Cloudflare, nginx, etc.).
 * Priority: cf-connecting-ip > x-real-ip > x-forwarded-for (first) > socket
 *
 * Decorates: request.clientIp
 */
async function ipPlugin(fastify) {
  fastify.decorateRequest("clientIp", null);

  fastify.addHook("onRequest", async (request) => {
    request.clientIp =
      request.headers["cf-connecting-ip"] ||
      request.headers["x-real-ip"] ||
      request.headers["x-forwarded-for"]?.split(",")[0].trim() ||
      request.ip;
  });
}

export default fp(ipPlugin, { name: "ip" });
