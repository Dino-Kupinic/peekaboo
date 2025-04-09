import type { Client } from "ssh2"
import { randomUUIDv7 } from "bun"
import type { Session } from "../types/session.ts"

/**
 * Service class to handle ssh sessions.
 */
// TODO: consider JWT for future
export default class SessionService {
  readonly sessions = new Map<string, Session>()

  /**
   * Create a new session and store it in the sessions map.
   * @param client ssh2 client
   */
  createSession(client: Client): string {
    const uuid = randomUUIDv7()
    this.sessions.set(uuid, { client, isConnected: true })
    return uuid
  }

  /**
   * Find a session by its client.
   * @param client ssh2 client
   */
  findSessionByClient(client: Client): string | undefined {
    for (const [uuid, session] of this.sessions.entries()) {
      if (session.client === client) {
        return uuid
      }
    }
  }
}
