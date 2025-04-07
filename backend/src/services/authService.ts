import { Client } from "ssh2"
import type { AuthBody, PasswordAuth, KeyAuth, AuthType } from "../types/auth"
import LoggingService from "./loggingService"

/**
 * AuthService class to handle ssh authentication.
 */
export class AuthService {
  private readonly client: Client
  private readonly logger: LoggingService

  constructor(logger: LoggingService, client?: Client) {
    this.client = client ?? new Client()
    this.logger = logger
  }

  get sshClient(): Client {
    return this.client
  }

  /**
   * Authenticate to the server using the provided authentication method.
   * @param auth The authentication method to use.
   */
  async authenticate(auth: AuthBody): Promise<void> {
    await this.connect(auth)
    this.logConnectionSuccess(auth.username, auth.type)
  }

  /**
   * Connect to the ssh server using the provided authentication method.
   * @param auth The authentication method to use.
   * @private
   */
  private async connect(auth: PasswordAuth | KeyAuth): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      const timeout = setTimeout(() => {
        const err = new Error("Connection timed out")
        this.logger.error(err.message)
        reject(err)
      }, 10000)

      this.sshClient.connect({
        host: auth.host,
        port: auth.port,
        username: auth.username,
        ...(auth.type === "password"
          ? { password: auth.password }
          : { privateKey: auth.key, passphrase: auth.passphrase }),
      })

      this.sshClient.on("ready", () => {
        clearTimeout(timeout)
        this.logger.info(`ssh connection established for ${auth.username}`)
        resolve()
      })

      this.sshClient.on("error", (err) => {
        clearTimeout(timeout)
        this.logger.error(
          `ssh connection error for ${auth.username}: ${err.message}`,
        )
        reject(err)
      })
    })
  }

  /**
   * Disconnect from the ssh server.
   */
  disconnect(): void {
    if (this.sshClient) {
      this.sshClient.end()
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

export default AuthService
