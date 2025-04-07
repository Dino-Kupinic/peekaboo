import { describe, expect, mock, test } from "bun:test"
import LoggingService from "../../src/services/loggingService.ts"
import pino from "pino"

describe("loggingService", () => {
  const mockLogger = {
    info: mock(),
    warn: mock(),
    error: mock(),
  } as unknown as pino.BaseLogger

  const logger = new LoggingService(mockLogger)

  test("should log info messages", () => {
    logger.info("test info message")
    expect(mockLogger.info).toHaveBeenCalledWith({}, "test info message")
  })

  test("should log warn messages", () => {
    logger.warn("test warn message", { data: "test" })
    expect(mockLogger.warn).toHaveBeenCalledWith(
      { data: "test" },
      "test warn message",
    )
  })

  test("should log error messages", () => {
    logger.error("test error message", { error: 500 })
    expect(mockLogger.error).toHaveBeenCalledWith(
      { error: 500 },
      "test error message",
    )
  })

  test("should log messages with different levels", () => {
    logger.log("info", "test log message", { data: "test" })
    expect(mockLogger.info).toHaveBeenCalledWith(
      { data: "test" },
      "test log message",
    )
  })

  test("should use default logger if no custom logger is provided", () => {
    const defaultLogger = new LoggingService()
    expect(defaultLogger).toBeInstanceOf(LoggingService)
  })
})
