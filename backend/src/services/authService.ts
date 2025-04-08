import { Client } from "ssh2"
import type { AuthBody, PasswordAuth, KeyAuth, AuthType } from "../types/auth"
import LoggingService from "./loggingService"

/**
 * Service class to handle ssh authentication.
 */
export default class AuthService {
  readonly client: Client
  readonly logger: LoggingService
  isConnected: boolean = false

  constructor(logger: LoggingService, client?: Client) {
    this.client = client ?? new Client()
    this.logger = logger
  }

  /**
   * Authenticate to the server using the provided authentication method.
   * @param auth The authentication method to use.
   * @param timeout The timeout for the connection attempt.
   */
  async authenticate(auth: AuthBody, timeout: number = 10000): Promise<void> {
    await this.connect(auth, timeout)
    this.logConnectionSuccess(auth.username, auth.type)
  }

  /**
   * Connect to the ssh server using the provided authentication method.
   * @param auth The authentication method to use.
   * @param timeout The timeout for the connection attempt.
   * @private
   */
  private async connect(
    auth: PasswordAuth | KeyAuth,
    timeout: number,
  ): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      const t = setTimeout(() => {
        const err = new Error("Connection timed out")
        this.logger.error(err.message)
        reject(err)
      }, timeout)

      this.client.connect({
        host: auth.host,
        port: auth.port,
        username: auth.username,
        ...(auth.type === "password"
          ? { password: auth.password }
          : { privateKey: auth.key, passphrase: auth.passphrase }),
      })

      this.client.once("ready", () => {
        clearTimeout(t)
        this.logger.info(`ssh connection established for ${auth.username}`)
        this.isConnected = true
        resolve()
      })

      this.client.once("error", (err) => {
        clearTimeout(t)
        this.logger.error(
          `ssh connection error for ${auth.username}: ${err.message}`,
        )
        reject(err)
      })

      this.client.once("close", () => {
        this.isConnected = false
        this.logger.info("ssh connection closed")

        if (!this.isConnected) {
          reject(
            new Error(
              `ssh connection closed for ${auth.username} before becoming ready`,
            ),
          )
        }
      })
    })
  }

  /**
   * Disconnect from the ssh server.
   */
  disconnect(): void {
    if (this.isConnected) {
      this.client.end()
      this.isConnected = false
      this.logger.info("Disconnected from ssh server")
    } else {
      this.logger.warn("Client isn't connected to any ssh server")
    }
  }

  /**
   * Log the success of a connection attempt
   * @param username The username used to authenticate
   * @param type The type of authentication used
   */
  private logConnectionSuccess(username: string, type: AuthType) {
    this.logger.info(`${type} authentication successful for ${username}`)
  }
}
