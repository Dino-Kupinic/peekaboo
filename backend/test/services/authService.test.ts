import { test, describe, expect, mock, beforeEach, afterEach } from "bun:test"
import { EventEmitter } from "events"
import { AuthService } from "../../src/services/authService.ts"
import logger from "../../src/services/loggingService.ts"

class MockClient extends EventEmitter {
  end = mock()
  connect = mock(() => {
    setTimeout(() => {
      this.emit("ready")
    }, 100)
  })
}

mock.module("ssh2", () => {
  return {
    Client: mock(() => new MockClient()),
  }
})

mock.module("../../src/services/loggingService.ts", () => ({
  default: {
    info: mock(),
    warn: mock(),
    error: mock(),
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

  test("should initialize with a new ssh client", () => {
    expect(service.sshClient).toBeDefined()
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

    expect(logger.info).toHaveBeenCalledWith(
      "Password authentication successful for test",
    )
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

    expect(logger.info).toHaveBeenCalledWith(
      "Key authentication successful for test",
    )
  })

  test("should disconnect the client", () => {
    service.disconnect()

    expect(service.sshClient.end).toHaveBeenCalled()
    expect(logger.info).toHaveBeenCalledWith("Disconnected from ssh server")
  })
})
