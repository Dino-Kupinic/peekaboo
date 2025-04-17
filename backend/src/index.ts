import type { WebSocketData } from "./types/websocket.ts"
import AuthService from "./services/authService"
import LoggingService from "./services/loggingService.ts"
import SessionService from "./services/sessionService.ts"
import StreamService from "./services/streamService.ts"
import wsSendJson from "./utils/wsSendJson.ts"
import withCors from "./utils/withCors.ts"
import authRoute from "./routes/auth.ts"
import logoutRoute from "./routes/logout.ts"
import commandRoute from "./routes/command.ts"
import sessionRoute from "./routes/session.ts"

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
      return withCors("ok", 200)
    },
    "/ws": (req, server) => {
      const success = server.upgrade(req)
      if (success) return undefined
      return withCors("WebSocket running")
    },
    "/auth": authRoute(auth, session),
    "/logout": logoutRoute(auth),
    "/session/:token": sessionRoute(auth),
    "/command/:token": commandRoute(auth, logger),
  },
  error(err) {
    logger.error(err.message)
    return withCors("Internal Server Error", 500)
  },
})

console.log(`Listening on http://localhost:${server.port} ...`)
