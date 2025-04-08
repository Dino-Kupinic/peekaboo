import AuthService from "./services/authService"
import LoggingService from "./services/loggingService.ts"
import withCors from "./utils/withCors.ts"
import type { AuthBody } from "./types/auth.ts"
import CommandService from "./services/commandService.ts"

const logger = new LoggingService()
const auth = new AuthService(logger)

const PORT = process.env.PORT || 3000
const server = Bun.serve({
  port: PORT,
  routes: {
    "/auth": async (req) => {
      const body = await req.json()
      // TODO: validate body with zod
      await auth.authenticate(body as AuthBody)
      return withCors(JSON.stringify(body))
    },
    "/command": async (req) => {
      if (auth.isConnected) {
        const c = new CommandService(auth.client, logger)
        c.runCommand("cd && cat /var/log/nginx/access.log")
        return withCors("command executed")
      }
      return withCors("not connected")
    },
  },
})

console.log(`Listening on http://localhost:${server.port} ...`)
