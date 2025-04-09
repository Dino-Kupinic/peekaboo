import { describe, expect, test } from "bun:test"
import SessionService from "../../src/services/sessionService.ts"
import { Client } from "ssh2"

describe("SessionService", () => {
  const sessionService = new SessionService()

  test("should create a session", () => {
    const client = new Client()
    const uuid = sessionService.createSession(client)
    expect(sessionService.sessions.has(uuid)).toBe(true)
  })

  test("should find a session by client", () => {
    const client = new Client()
    const uuid = sessionService.createSession(client)
    const id = sessionService.findSessionByClient(client)
    expect(id).toBe(uuid)
  })

  test("should not find a session by client if not present", () => {
    const client = new Client()
    const id = sessionService.findSessionByClient(client)
    expect(id).toBeUndefined()
  })

  test("should remove a session", () => {
    const client = new Client()
    const uuid = sessionService.createSession(client)
    sessionService.sessions.delete(uuid)
    expect(sessionService.sessions.has(uuid)).toBe(false)
  })
})
