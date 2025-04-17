import { describe, expect, test } from "bun:test"
import SessionService from "../../src/services/sessionService.ts"
import { Client } from "ssh2"
import type { AuthBody } from "../../src/types/auth.ts"

describe("SessionService", () => {
  const sessionService = new SessionService()
  const authBody = {
    type: "password",
    host: "example.com",
    port: 22,
    username: "test",
    password: "test",
  } as AuthBody

  test("should create a session", async () => {
    const client = new Client()
    const token = await sessionService.createSession(client, authBody)
    expect(sessionService.sessions.has(token)).toBe(true)
  })

  test("should find a session by client", async () => {
    const client = new Client()
    const token = await sessionService.createSession(client, authBody)
    const id = sessionService.findSessionByClient(client)
    expect(id).toBe(token)
  })

  test("should not find a session by client if not present", () => {
    const client = new Client()
    const id = sessionService.findSessionByClient(client)
    expect(id).toBeUndefined()
  })

  test("should remove a session", async () => {
    const client = new Client()
    const uuid = await sessionService.createSession(client, authBody)
    sessionService.sessions.delete(uuid)
    expect(sessionService.sessions.has(uuid)).toBe(false)
  })
})
