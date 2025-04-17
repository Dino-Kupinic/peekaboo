import { Client } from "ssh2"
import type { AuthBody } from "../types/auth"
import type SessionService from "./sessionService.ts"
import LoggingService from "./loggingService"

/**
 * Service class to handle ssh authentication.
 */
export default class AuthService {
  readonly loggingService: LoggingService
  readonly sessionService: SessionService

  constructor(loggingService: LoggingService, sessionService: SessionService) {
    this.loggingService = loggingService
    this.sessionService = sessionService
  }

  /**
   * Authenticate to the server using the provided authentication method.
   * @param auth The authentication method to use.
   * @param timeout The timeout for the connection attempt.
   */
  async authenticate(auth: AuthBody, timeout: number = 10000): Promise<Client> {
    const client = await this.connect(auth, timeout)
    this.logConnectionSuccess(auth.username)
    return client
  }

  /**
   * Connect to the ssh server
   * @param auth The authentication body containing the connection details.
   * @param timeout The timeout for the connection attempt.
   * @returns Promise resolving to an ssh client on successful connection.
   * @private
   */
  private async connect(auth: AuthBody, timeout: number): Promise<Client> {
    const client = new Client()
    let done = false

    return new Promise<Client>((resolve, reject) => {
      const t = setTimeout(() => {
        if (done) return
        done = true
        const err = new Error("Connection timed out")
        this.loggingService.error(err.message)
        client.end()
        reject(err)
      }, timeout)

      client.connect({
        host: auth.host,
        port: auth.port,
        username: auth.username,
        password: auth.password,
      })

      client.once("ready", () => {
        if (done) return
        done = true
        clearTimeout(t)
        this.loggingService.info(
          `ssh connection established for ${auth.username}`,
        )
        resolve(client)
      })

      client.once("error", (err) => {
        if (done) return
        done = true
        clearTimeout(t)
        this.loggingService.error(
          `ssh connection error for ${auth.username}: ${err.message}`,
        )
        reject(err)
      })

      client.once("close", () => {
        clearTimeout(t)

        const token = this.sessionService.findSessionByClient(client)
        if (token) {
          this.sessionService.sessions.delete(token)
          this.loggingService.info(`session ${token} removed from sessions`)
        }

        if (!done) {
          done = true
          const msg = `ssh connection unexpectedly closed for ${auth.username} before becoming ready`
          reject(new Error(msg))
        } else {
          this.loggingService.info(`ssh connection closed for ${auth.username}`)
        }
      })
    })
  }

  /**
   * Disconnect from the ssh server.
   * @param token The JWT token
   */
  disconnect(token: string): void {
    const session = this.sessionService.sessions.get(token)
    if (session) {
      session.client.end()
      this.sessionService.sessions.delete(token)
      this.loggingService.info("disconnected from ssh server")
    } else {
      this.loggingService.warn(`session ${token} not found, cannot disconnect`)
    }
  }

  /**
   * Log the success of a connection attempt
   * @param username The username used to authenticate
   */
  private logConnectionSuccess(username: string) {
    this.loggingService.info(`authentication successful for ${username}`)
  }
}
