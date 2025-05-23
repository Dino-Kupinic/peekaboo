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
   * Run a streaming command on the ssh server.
   * @param command The command to run.
   * @param onStream Callback that receives the stream for further handling
   */
  runStreamCommand(
    command: string,
    onStream: (err: Error | undefined, stream: any) => void,
  ): void {
    this.client.exec(command, (err, stream) => {
      if (err) {
        this.logger.error(`stream command failed: ${err.message}`)
      }
      onStream(err, stream)
    })
  }

  /**
   * Run a command on the ssh server.
   * @param command The command to run.
   */
  runCommand(command: string): Promise<string> {
    return new Promise<string>((resolve, reject) => {
      this.client.exec(command, (err, stream) => {
        if (err) {
          this.logger.error(`command failed: ${err.message}`)
          return reject(err)
        }

        let stdout: string = ""
        let stderr: string = ""
        let resolved: boolean = false

        stream.on("data", (data: Buffer) => {
          stdout += data.toString()
        })

        stream.stderr.on("data", (data: Buffer) => {
          stderr += data.toString()
        })

        stream.on("close", (code: number) => {
          this.logger.info(`command "${command}" exited with code ${code}`)

          if (stderr) {
            this.logger.warn(`stderr for ${command}: ${stderr}`)
            if (!resolved) {
              resolved = true
              return reject(new Error(stderr))
            }
          } else {
            if (!resolved) {
              resolved = true
              return resolve(stdout)
            }
          }
        })

        stream.on("error", (err: Error) => {
          this.logger.error(`command error: ${err.message}`)
          if (!resolved) {
            resolved = true
            return reject(err)
          }
        })
      })
    })
  }
}
