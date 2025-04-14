import { describe, expect, test, mock, beforeEach } from "bun:test"
import StreamService from "../../src/services/streamService.ts"
import LoggingService from "../../src/services/loggingService.ts"
import CommandService from "../../src/services/commandService.ts"
import { Client } from "ssh2"
import { EventEmitter } from "events"

describe("StreamService", () => {
  let mockClient: any
  let mockLogger: any
  let mockCommandService: any
  let mockStream: any
  let streamService: StreamService

  beforeEach(() => {
    mockStream = new EventEmitter()
    mockStream.stderr = new EventEmitter()
    mockStream.close = mock()

    mockClient = {} as unknown as Client

    mockLogger = {
      info: mock(),
      error: mock(),
      warn: mock(),
    }

    mockCommandService = {
      runStreamCommand: mock((_command: string, callback: Function) => {
        callback(null, mockStream)
      }),
    }

    streamService = new StreamService(
      mockClient,
      mockLogger as unknown as LoggingService,
      mockCommandService as unknown as CommandService,
    )
  })

  const id = "test"
  const path = "/var/log/nginx/access.log"

  test("should start streaming logs successfully", async () => {
    const onDataMock = mock((_data: string) => {})
    const streamPromise = streamService.startStream(path, id, onDataMock)

    const data = "test"
    mockStream.emit("data", Buffer.from(data))

    await streamPromise

    expect(mockCommandService.runStreamCommand).toHaveBeenCalledWith(
      `tail -f ${path}`,
      expect.any(Function),
    )
    expect(mockLogger.info).toHaveBeenCalled()
    expect(onDataMock).toHaveBeenCalledWith(data)
  })

  test("should handle stream command errors", async () => {
    const onDataMock = mock()
    const execError = new Error("File not found")

    mockCommandService.runStreamCommand = mock(
      (_command: string, callback: Function) => {
        callback(execError, null)
      },
    )

    expect(streamService.startStream(path, id, onDataMock)).rejects.toThrow(
      execError,
    )
    expect(mockLogger.error).toHaveBeenCalled()
  })

  test("should handle stream errors", async () => {
    const onDataMock = mock()
    const streamError = new Error()

    await streamService.startStream(path, id, onDataMock)

    mockStream.emit("error", streamError)

    expect(mockLogger.error).toHaveBeenCalled()
  })

  test("should handle stream close event", async () => {
    const onDataMock = mock()

    await streamService.startStream(path, id, onDataMock)

    mockStream.emit("close", 0)

    expect(mockLogger.info).toHaveBeenCalled()
  })

  test("should stop log stream successfully", async () => {
    const onDataMock = mock()

    await streamService.startStream(path, id, onDataMock)

    streamService.stopLogStream(id)

    expect(mockStream.close).toHaveBeenCalled()
    expect(mockLogger.info).toHaveBeenCalledWith(`stopped log stream ${id}`)
  })

  test("should handle stopping non-existent stream", () => {
    streamService.stopLogStream(id)

    expect(mockLogger.warn).toHaveBeenCalledWith(
      `stream with id ${id} not found, can't stop`,
    )
  })
})
