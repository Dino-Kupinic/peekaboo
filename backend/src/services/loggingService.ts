import pino from "pino"

const isDev = process.env.NODE_ENV !== "production"
const destination = process.env.DESTINATION || "./logs.log"
/**
 * Log level based on the environment. We use "info" in production and "debug" in
 * development.
 */
const level = isDev ? "debug" : "info"

/**
 * Logging service using pino for logging. (This has nothing to do with the nginx logs)
 */
const logger = pino({
  level,
  transport: {
    target: isDev ? "pino-pretty" : "pino/file",
    options: {
      colorize: isDev,
      destination: isDev ? undefined : destination,
    },
  },
})

export default logger
