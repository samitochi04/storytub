import pino from "pino";
import env from "../config/env.js";

const logger = pino({
  level: env.logLevel,
  ...(env.isDev && {
    transport: {
      target: "pino-pretty",
      options: { colorize: true, translateTime: "HH:MM:ss" },
    },
  }),
});

export default logger;
