import pino from "pino"

/**
 * Destination for the log file. This is used in production mode.
 */
const destination = process.env.LOGS_DESTINATION || "./logs.log"
/**
 * Log level based on the environment. We use "info" in production and "debug" in
 * development for more information.
 */
const isDev = process.env.NODE_ENV !== "production"
const level = isDev ? "debug" : "info"
const transportOptions = isDev
  ? {
      target: "pino-pretty",
      options: { colorize: true },
    }
  : {
      target: "pino/file",
      options: { destination },
    }

/**
 * config for pino logger.
 * We use "pino-pretty" for console in development and "pino/file"
 * in production.
 */
const loggerConfig: pino.LoggerOptions = {
  level,
  transport: transportOptions,
}

/**
 * Service class using pino for logging. (This has nothing to do with the nginx logs)
 */
export default class LoggingService {
  private readonly logger: pino.BaseLogger

  constructor(customLogger?: pino.BaseLogger) {
    this.logger = customLogger ?? pino(loggerConfig)
  }

  /**
   * Log an info message.
   * @param message The message to log.
   * @param data Additional data to log.
   */
  info(message: string, data?: Record<string, unknown>) {
    this.logger.info({ ...data }, message)
  }

  /**
   * Log a warn message.
   * @param message The message to log.
   * @param data Additional data to log.
   */
  warn(message: string, data?: Record<string, unknown>) {
    this.logger.warn({ ...data }, message)
  }

  /**
   * Log an error message.
   * @param message The message to log.
   * @param data Additional data to log.
   */
  error(message: string, data?: Record<string, unknown>) {
    this.logger.error({ ...data }, message)
  }

  /**
   * Generic log method for other levels
   * @param level The log level to use.
   * @param message The message to log.
   * @param data Additional data to log.
   */
  log(level: pino.Level, message: string, data?: Record<string, unknown>) {
    this.logger[level]({ ...data }, message)
  }
}
