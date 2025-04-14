import AuthService from "./services/authService"
import LoggingService from "./services/loggingService.ts"
import withCors from "./utils/withCors.ts"
import type { AuthBody } from "./types/auth.ts"
import CommandService from "./services/commandService.ts"
import SessionService from "./services/sessionService.ts"
import StreamService from "./services/streamService.ts"

const logger = new LoggingService()
const session = new SessionService()
const auth = new AuthService(logger, session)
const clients = new Set<WebSocket>()

type WebSocketData = {
  stream?: StreamService
  id?: string
}

const sockets = new Map<WebSocket, WebSocketData>()
const server = Bun.serve({
  websocket: {
    open(ws) {
      clients.add(ws)
      sockets.set(ws, {})
    },
    message(ws, message) {
      try {
        const data = JSON.parse(message.toString())
        logger.info("Received:", data)

        const wsData = sockets.get(ws) ?? {}

        if (data.type === "start" && data.session) {
          const id = data.session
          const session = auth.sessionService.sessions.get(id)

          if (session) {
            const path = data.path || "/var/log/nginx/access.log"
            const stream = `${id}-${Date.now()}`

            const streamService = new StreamService(session.client, logger)

            streamService
              .startStream(path, stream, (data) => {
                ws.send(
                  JSON.stringify({
                    type: "data",
                    stream,
                    data,
                  }),
                )
              })
              .catch((error) => {
                ws.send(
                  JSON.stringify({
                    type: "error",
                    message: error.message,
                  }),
                )
              })

            sockets.set(ws, { stream: streamService, id: stream })

            ws.send(
              JSON.stringify({
                type: "started",
                stream,
              }),
            )
          } else {
            ws.send(
              JSON.stringify({
                type: "error",
                message: "Session not found",
              }),
            )
          }
        } else if (data.type === "stop" && wsData.id) {
          if (wsData.stream) {
            wsData.stream.stopLogStream(wsData.id)
            ws.send(
              JSON.stringify({
                type: "stopped",
                stream: wsData.id,
              }),
            )
            sockets.set(ws, {})
          }
        }
      } catch (error) {
        console.error("Error processing message:", error)
        ws.send(
          JSON.stringify({
            type: "error",
            message: "Invalid message format",
          }),
        )
      }
    },
    close(ws) {
      const data = sockets.get(ws)
      if (data?.stream && data.id) {
        data.stream.stopLogStream(data.id)
      }
      sockets.delete(ws)
      clients.delete(ws)
    },
  },
  routes: {
    "/": () => {
      return withCors(
        `Active sessions: ${[...session.sessions.entries()].map(([key]) => `${key}`)}`,
      )
    },
    "/ws": (req, server) => {
      const success = server.upgrade(req)
      if (success) return undefined
      return withCors("WebSocket running")
    },
    "/auth": async (req) => {
      const body = await req.json()
      // TODO: validate body with zod
      const client = await auth.authenticate(body as AuthBody)
      const s = session.createSession(client)
      return withCors(s)
    },
    "/logout/:uuid": async (req) => {
      auth.disconnect(req.params.uuid)
      return withCors("disconnected")
    },
    "/command/:uuid": async (req) => {
      const uuid = req.params.uuid
      const session = auth.sessionService.sessions.get(uuid)
      if (session) {
        const c = new CommandService(session.client, logger)
        // TODO: command should be passed in the request body
        const response = await c.runCommand(
          "cd && cat /var/log/nginx/access.log",
        )
        return withCors(response)
      }
      return withCors("not connected")
    },
  },
  error(err) {
    logger.error(err.message)
    return withCors("Internal Server Error", 500)
  },
})

console.log(`Listening on http://localhost:${server.port} ...`)
