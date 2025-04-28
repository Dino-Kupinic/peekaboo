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
      const command: string = `tail -n +1 -f ${path}`

      this.commandService.runStreamCommand(command, (err, stream) => {
        if (err) {
          this.logger.error(`failed to start log stream: ${err.message}`)
          return reject(err)
        }

        this.streams.set(id, stream)

        stream.on("data", (data: Buffer) => {
          const lines = data.toString().split("\n")
          for (const line of lines) {
            if (line.trim().length === 0) continue
            const parsed = this.parseLine(line)
            onData(JSON.stringify(parsed))
          }
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

  /**
   * Regex that matches default access log format in NGINX.
   * @private
   */
  // TODO: For now, we only parse the default NGINX log format
  //  The default error log format (+ custom formats) is not supported yet.
  private readonly regex =
    /^(\S+) - (\S+) \[(.+?)] "(.+?)" (\d{3}) (\d+) "(.*?)" "(.*?)"$/

  /**
   * Parses a line from an NGINX log file.
   * @param line The line to parse.
   * @private
   */
  private parseLine(line: string): Record<string, any> {
    const match = line.match(this.regex)
    if (!match) {
      return { raw: line }
    }
    return {
      remote_addr: match[1],
      remote_user: match[2],
      time_local: match[3],
      request: match[4],
      status: parseInt(<string>match[5], 10),
      body_bytes_sent: parseInt(<string>match[6], 10),
      http_referer: match[7],
      http_user_agent: match[8],
    }
  }
}
