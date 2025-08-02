import { beforeEach, describe, expect, mock, test } from 'bun:test'
import { EventEmitter } from 'events'
import { Client } from 'ssh2'
import CommandService from '../../src/services/commandService.ts'
import LoggingService from '../../src/services/loggingService.ts'

describe('CommandService', () => {
  let mockClient: any
  let mockLogger: any
  let mockStream: any
  let commandService: CommandService

  beforeEach(() => {
    mockStream = new EventEmitter()
    mockStream.stderr = new EventEmitter()

    mockClient = {
      exec: mock((_: string, callback: Function) => {
        callback(null, mockStream)
      }),
    }

    mockLogger = {
      info: mock(),
      error: mock(),
      warn: mock(),
    }

    commandService = new CommandService(
      mockClient as unknown as Client,
      mockLogger as unknown as LoggingService,
    )
  })
  const onStreamMock = mock((_err: Error | undefined, _stream: any) => {})

  test('should run a command successfully', async () => {
    const command = 'echo dino'
    const expectedOutput = 'dino'

    const commandPromise = commandService.runCommand(command)

    mockStream.emit('data', Buffer.from(expectedOutput))
    mockStream.emit('close', 0)

    const output = await commandPromise
    expect(output).toBe(expectedOutput)
    expect(mockClient.exec).toHaveBeenCalledWith(command, expect.any(Function))
    expect(mockLogger.info).toHaveBeenCalled()
  })

  test('should handle errors', async () => {
    const command = 'invalid command'
    const errorMessage = 'Command not found'

    const commandPromise = commandService.runCommand(command)

    mockStream.emit('error', new Error(errorMessage))

    expect(commandPromise).rejects.toThrow()
    expect(mockClient.exec).toHaveBeenCalledWith(command, expect.any(Function))
  })

  test('should handle stderr output', async () => {
    const command = 'grep dino /etc/passwd'
    const stderrOutput = 'grep: pattern not found'

    const commandPromise = commandService.runCommand(command)

    mockStream.stderr.emit('data', Buffer.from(stderrOutput))
    mockStream.emit('close', 1)

    expect(commandPromise).rejects.toThrow(stderrOutput)
    expect(mockLogger.warn).toHaveBeenCalled()
  })

  test('should handle exec errors', async () => {
    const command = 'some command'
    const execError = new Error()

    mockClient.exec = mock((_: string, callback: Function) => {
      callback(execError, null)
    })

    expect(commandService.runCommand(command)).rejects.toThrow(execError)
    expect(mockLogger.error).toHaveBeenCalled()
  })

  test('should run a stream command successfully', () => {
    const command = 'tail -f /var/log/nginx/access.log'

    commandService.runStreamCommand(command, onStreamMock)

    expect(mockClient.exec).toHaveBeenCalledWith(command, expect.any(Function))
    expect(onStreamMock).toHaveBeenCalledWith(null, mockStream)
  })

  test('should handle stream command errors', () => {
    const command = 'tail -f /dino'
    const execError = new Error('File not found')

    mockClient.exec = mock((_: string, callback: Function) => {
      callback(execError, null)
    })

    commandService.runStreamCommand(command, onStreamMock)

    expect(mockClient.exec).toHaveBeenCalledWith(command, expect.any(Function))
    expect(mockLogger.error).toHaveBeenCalled()
    expect(onStreamMock).toHaveBeenCalledWith(execError, null)
  })
})
