import type { Client } from "ssh2"
import LoggingService from "./loggingService"

/**
 * Service class to handle ssh commands.
 */
export default class CommandService {
  readonly client: Client
  readonly logger: LoggingService

  constructor(client: Client, logger: LoggingService) {
    this.client = client
    this.logger = logger
  }

  /**
   * Run a command on the ssh server.
   * @param command The command to run.
   */
  runCommand(command: string): void {
    this.client.exec(command, (err, stream) => {
      if (err) {
        this.logger.error(`Command failed: ${err.message}`)
        return
      }

      stream.on("data", (data: Buffer) => {
        this.logger.info(`Output: ${data.toString()}`)
      })

      stream.stderr.on("data", (data: Buffer) => {
        this.logger.warn(`Error: ${data.toString()}`)
      })

      stream.on("close", () => {
        this.logger.info(`command "${command}" finished`)
      })
    })
  }
}
