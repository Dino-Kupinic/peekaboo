import { Client } from "ssh2"
import type { AuthBody, PasswordAuth, KeyAuth, AuthType } from "../types/auth"
import logger from "./loggingService"

/**
 * AuthService class to handle ssh authentication.
 */
export class AuthService {
  private readonly client: Client

  constructor() {
    this.client = new Client()
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
        logger.error(err.message)
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
        logger.info(`ssh connection established for ${auth.username}`)
        resolve()
      })

      this.sshClient.on("error", (err) => {
        clearTimeout(timeout)
        logger.error(
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
      logger.info("Disconnected from ssh server")
    } else {
      logger.warn("Client isn't connected to any ssh server")
    }
  }

  /**
   * Log the success of a connection attempt
   * @param username The username used to authenticate
   * @param type The type of authentication used
   */
  private logConnectionSuccess(username: string, type: AuthType) {
    logger.info(`${type} authentication successful for ${username}`)
  }
}
