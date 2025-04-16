import type { WebSocketData } from "./types/websocket.ts"
import type { AuthBody } from "./types/auth.ts"
import AuthService from "./services/authService"
import LoggingService from "./services/loggingService.ts"
import CommandService from "./services/commandService.ts"
import SessionService from "./services/sessionService.ts"
import StreamService from "./services/streamService.ts"
import wsSendJson from "./utils/wsSendJson.ts"
import withCors from "./utils/withCors.ts"
import { signToken, verifyToken } from "./utils/jwt.ts"

const logger = new LoggingService()
const session = new SessionService()
const auth = new AuthService(logger, session)
const clients = new Set<WebSocket>()

const sockets = new Map<WebSocket, WebSocketData>()
const server = Bun.serve({
  // TODO: extract this into a service
  websocket: {
    open(ws) {
      clients.add(ws)
      sockets.set(ws, {})
    },
    message(ws, message) {
      try {
        const data = JSON.parse(message.toString())
        logger.info("WebSocket received:", data)

        const wsData = sockets.get(ws) ?? {}

        if (data.type === "start" && data.session) {
          const id = data.session
          const session = auth.sessionService.sessions.get(id)

          if (!session) {
            wsSendJson(ws, {
              type: "error",
              message: "Session not found",
            })
            return
          }

          const path = data.path || "/var/log/nginx/access.log"
          const stream = `${id}-${Date.now()}`

          const streamService = new StreamService(session.client, logger)

          streamService
            .startStream(path, stream, (data) => {
              wsSendJson(ws, {
                type: "data",
                stream,
                data,
              })
            })
            .catch((error) => {
              wsSendJson(ws, {
                type: "error",
                message: error.message,
              })
            })

          sockets.set(ws, { stream: streamService, id: stream })

          wsSendJson(ws, {
            type: "started",
            stream,
          })
        } else if (data.type === "stop" && wsData.id) {
          if (wsData.stream) {
            wsData.stream.stopStream(wsData.id)
            wsSendJson(ws, {
              type: "stopped",
              stream: wsData.id,
            })
            sockets.set(ws, {})
          }
        }
      } catch (error) {
        console.error("Error processing message:", error)
        wsSendJson(ws, {
          type: "error",
          message: "Invalid message format",
        })
      }
    },
    close(ws) {
      const data = sockets.get(ws)
      if (data?.stream && data.id) {
        data.stream.stopStream(data.id)
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
const t = await signToken({
  host: "localhost",
  port: 2222,
  username: "testuser",
  password: "testpass",
  type: "password",
})
console.log(t)
console.log(await verifyToken(t))
