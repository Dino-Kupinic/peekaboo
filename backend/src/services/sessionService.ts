import type { Client } from "ssh2"
import type { Session } from "../types/session.ts"
import type { AuthBody } from "../types/auth.ts"
import { signToken, verifyToken } from "../utils/jwt.ts"

/**
 * Service class to handle ssh sessions.
 */
export default class SessionService {
  readonly sessions = new Map<string, Session>()

  /**
   * Create a new session and store it in the sessions map, returning a JWT as the session key.
   * @param client ssh2 client
   * @param authBody authentication body for JWT payload
   */
  async createSession(client: Client, authBody: AuthBody): Promise<string> {
    const jwt = await signToken(authBody)
    this.sessions.set(jwt, { client, isConnected: true })
    return jwt
  }

  /**
   * Validate a JWT and retrieve the session if valid.
   * @param token JWT token
   */
  async getSessionByToken(token: string): Promise<Session | undefined> {
    try {
      await verifyToken(token)
      return this.sessions.get(token)
    } catch {
      return undefined
    }
  }

  /**
   * Find a session by its client.
   * @param client ssh2 client
   */
  findSessionByClient(client: Client): string | undefined {
    for (const [jwt, session] of this.sessions.entries()) {
      if (session.client === client) {
        return jwt
      }
    }
  }
}
