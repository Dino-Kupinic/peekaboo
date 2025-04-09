import AuthService from "./services/authService"
import LoggingService from "./services/loggingService.ts"
import withCors from "./utils/withCors.ts"
import type { AuthBody } from "./types/auth.ts"
import CommandService from "./services/commandService.ts"
import SessionService from "./services/sessionService.ts"

const logger = new LoggingService()
const session = new SessionService()
const auth = new AuthService(logger, session)

const server = Bun.serve({
  fetch(req, server) {
    const success = server.upgrade(req)
    if (success) {
      return undefined
    }
    return new Response("Hello world!")
  },
  websocket: {
    open(ws) {
      console.log("hi")
    },
    message(ws, message) {
      ws.send(message)
    },
    close(ws) {},
  },
  routes: {
    "/": () => {
      return withCors(
        `Active sessions: ${[...session.sessions.entries()].map(([key]) => `${key}`)}`,
      )
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
    return new Response("Internal Server Error", { status: 500 })
  },
})

console.log(`Listening on http://localhost:${server.port} ...`)
