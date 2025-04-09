import { Client } from "ssh2"
import type { AuthBody, AuthType } from "../types/auth"
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
    this.logConnectionSuccess(auth.username, auth.type)
    return client
  }

  /**
   * Connect to the ssh server using the provided authentication method.
   * @param auth The authentication method to use.
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
        ...(auth.type === "password"
          ? { password: auth.password }
          : { privateKey: auth.key, passphrase: auth.passphrase }),
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

        const id = this.sessionService.findSessionByClient(client)
        if (id) {
          this.sessionService.sessions.delete(id)
          this.loggingService.info(
            `session with id ${id} removed from sessions`,
          )
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
   * @param uuid The uuid of the session to disconnect from.
   */
  disconnect(uuid: string): void {
    const session = this.sessionService.sessions.get(uuid)
    if (session) {
      session.client.end()
      this.sessionService.sessions.delete(uuid)
      this.loggingService.info("disconnected from ssh server")
    } else {
      this.loggingService.warn(
        `session with id ${uuid} not found, cannot disconnect`,
      )
    }
  }

  /**
   * Log the success of a connection attempt
   * @param username The username used to authenticate
   * @param type The type of authentication used
   */
  private logConnectionSuccess(username: string, type: AuthType) {
    this.loggingService.info(
      `${type} authentication successful for ${username}`,
    )
  }
}
