import type { Client } from "ssh2"
import LoggingService from "./loggingService"
import CommandService from "./commandService"

/**
 * Service class to handle streaming of log files via WebSockets.
 */
export default class StreamService {
  readonly client: Client
  readonly logger: LoggingService
  readonly commandService: CommandService
  private streams: Map<string, any> = new Map()

  constructor(
    client: Client,
    logger: LoggingService,
    commandService?: CommandService,
  ) {
    this.client = client
    this.logger = logger
    this.commandService = commandService ?? new CommandService(client, logger)
  }

  /**
   * Start streaming a file to WebSocket clients
   * @param path The path to the log file to stream
   * @param id A unique identifier for this stream
   * @param onData Callback function that receives new log data
   */
  startStream(
    path: string,
    id: string,
    onData: (data: string) => void,
  ): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      const command: string = `tail -f ${path}`

      this.commandService.runStreamCommand(command, (err, stream) => {
        if (err) {
          this.logger.error(`failed to start log stream: ${err.message}`)
          return reject(err)
        }

        this.streams.set(id, stream)

        stream.on("data", (data: Buffer) => {
          onData(data.toString())
        })

        stream.stderr.on("data", (data: Buffer) => {
          this.logger.warn(`log stream error: ${data.toString()}`)
        })

        stream.on("close", (code: number) => {
          this.logger.info(`log stream closed with code ${code}`)
          this.streams.delete(id)
        })

        stream.on("error", (err: Error) => {
          this.logger.error(`log stream error: ${err.message}`)
          this.streams.delete(id)
          reject(err)
        })

        this.logger.info(`started streaming logs for ${id} from ${path}`)
        resolve()
      })
    })
  }

  /**
   * Stop a specific log stream
   * @param id The ID of the stream to stop
   */
  stopStream(id: string): void {
    const stream = this.streams.get(id)
    if (stream) {
      stream.close()
      this.streams.delete(id)
      this.logger.info(`stopped log stream ${id}`)
    } else {
      this.logger.warn(`stream with id ${id} not found, can't stop`)
    }
  }
}
