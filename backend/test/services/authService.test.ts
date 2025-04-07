import { test, describe, expect, mock, beforeEach, afterEach } from "bun:test"
import { AuthService } from "../../src/services/authService.ts"
import logger from "../../src/services/loggingService.ts"

mock.module("ssh2", () => ({
  Client: mock(() => ({
    end: mock(),
  })),
}))

mock.module("../../src/services/loggingService.ts", () => ({
  default: {
    info: mock(),
    warn: mock(),
  },
}))

describe("AuthService", () => {
  let service: AuthService

  beforeEach(() => {
    mock.restore()
    service = new AuthService()
  })

  afterEach(() => {
    service.disconnect()
  })

  test("should initialize with a new SSH client", () => {
    expect(service.client).toBeDefined()
  })

  test("should authenticate with password", async () => {
    const data = {
      type: "password" as const,
      host: "example.com",
      port: 22,
      username: "test",
      password: "test",
    }

    await service.authenticate(data)

    expect(logger.info).toHaveBeenCalledWith("auth with password")
  })

  test("should authenticate with key", async () => {
    const data = {
      type: "key" as const,
      host: "example.com",
      port: 22,
      username: "test",
      key: "test",
      passphrase: "test",
    }

    await service.authenticate(data)

    expect(logger.info).toHaveBeenCalledWith("auth with key")
  })

  test("should throw error for invalid authentication type", async () => {
    const authData = {
      type: "invalid",
      host: "example.com",
      port: 22,
      username: "test",
    }

    // @ts-ignore invalid auth type on purpose here
    expect(service.authenticate(authData)).rejects.toThrow(
      "Invalid authentication type",
    )
  })

  test("should disconnect the client", () => {
    service.disconnect()

    expect(service.client.end).toHaveBeenCalled()
    expect(logger.info).toHaveBeenCalledWith("Disconnected from ssh server")
  })

  test("should handle disconnect when client is not connected", () => {
    // @ts-ignore
    service.client = undefined

    service.disconnect()

    expect(logger.warn).toHaveBeenCalledWith(
      "Client isn't connected to any ssh server",
    )
  })
})
