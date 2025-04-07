import { Client } from "ssh2"
import type { AuthBody, PasswordAuth, KeyAuth } from "../types/auth"
import logger from "./loggingService"

/**
 * AuthService class to handle ssh authentication.
 */
export class AuthService {
  client: Client

  constructor() {
    this.client = new Client()
  }

  /**
   * Authenticate to the server using the provided authentication method.
   * @param auth The authentication method to use.
   */
  async authenticate(auth: AuthBody): Promise<void> {
    switch (auth.type) {
      case "password":
        await this.authenticateWithPassword(auth)
        break
      case "key":
        await this.authenticateWithKey(auth)
        break
      default:
        logger.error("Invalid authentication type")
        throw new Error("Invalid authentication type")
    }
  }

  private async authenticateWithPassword(auth: PasswordAuth) {
    logger.info("auth with password")
  }

  private async authenticateWithKey(auth: KeyAuth) {
    logger.info("auth with key")
  }

  /**
   * Disconnect from the ssh server.
   */
  disconnect(): void {
    if (this.client) {
      this.client.end()
      logger.info("Disconnected from ssh server")
    } else {
      logger.warn("Client isn't connected to any ssh server")
    }
  }
}
