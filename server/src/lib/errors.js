/** Structured application error. Fastify error handler maps this to HTTP response. */
export class AppError extends Error {
  /**
   * @param {string}  message  Human-readable error description
   * @param {number}  status   HTTP status code (default 500)
   * @param {string}  [code]   Machine-readable error code
   * @param {object}  [meta]   Extra context (never leaked in production)
   */
  constructor(message, status = 500, code = "INTERNAL_ERROR", meta) {
    super(message);
    this.name = "AppError";
    this.statusCode = status;
    this.code = code;
    this.meta = meta;
  }
}

export const Errors = {
  unauthorized: (msg = "Authentication required") =>
    new AppError(msg, 401, "UNAUTHORIZED"),

  forbidden: (msg = "Insufficient permissions") =>
    new AppError(msg, 403, "FORBIDDEN"),

  notFound: (msg = "Resource not found") => new AppError(msg, 404, "NOT_FOUND"),

  badRequest: (msg = "Invalid request") =>
    new AppError(msg, 400, "BAD_REQUEST"),

  conflict: (msg = "Resource already exists") =>
    new AppError(msg, 409, "CONFLICT"),

  tooMany: (msg = "Rate limit exceeded") =>
    new AppError(msg, 429, "RATE_LIMITED"),

  insufficientCredits: (msg = "Not enough credits") =>
    new AppError(msg, 402, "INSUFFICIENT_CREDITS"),
};
