import { test, describe, expect, mock } from "bun:test"
import { EventEmitter } from "events"
import AuthService from "../../src/services/authService.ts"
import LoggingService from "../../src/services/loggingService.ts"
import SessionService from "../../src/services/sessionService.ts"

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

describe("AuthService", () => {
  const mockLoggingService = {
    info: mock(),
    warn: mock(),
    error: mock(),
  } as unknown as LoggingService

  const sessionService: SessionService = new SessionService()
  const authService: AuthService = new AuthService(
    mockLoggingService,
    sessionService,
  )

  test("should authenticate with password", async () => {
    const data = {
      type: "password" as const,
      host: "example.com",
      port: 22,
      username: "test",
      password: "test",
    }

    await authService.authenticate(data)

    expect(mockLoggingService.info).toHaveBeenCalledWith(
      "authentication successful for test",
    )
  })

  test("should disconnect the client", () => {
    const mockClient = new MockClient()
    // @ts-ignore mock client doesn't implement all methods but it's ok
    sessionService.sessions.set("test", { client: mockClient })
    authService.disconnect("test")

    expect(mockLoggingService.info).toHaveBeenCalledWith(
      "disconnected from ssh server",
    )
    expect(mockClient.end).toHaveBeenCalled()
    expect(sessionService.sessions.has("test")).toBeFalse()
  })
})
