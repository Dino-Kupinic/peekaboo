import AuthService from "./services/authService"
import LoggingService from "./services/loggingService.ts"
import withCors from "./utils/withCors.ts"
import type { AuthBody } from "./types/auth.ts"
import CommandService from "./services/commandService.ts"

const PORT = process.env.PORT || 3000
const server = Bun.serve({
  port: PORT,
  routes: {
    "/auth": async (req) => {
      const logger = new LoggingService()
      const body = await req.json()
      const auth = new AuthService(logger)
      // TODO: validate body with zod
      await auth.authenticate(body as AuthBody)
      const c = new CommandService(auth.sshClient, logger)
      c.runCommand("uptime")
      return withCors(JSON.stringify(body))
    },
  },
  async fetch(req) {
    return withCors("Bun!")
  },
})

// const accessLog = await Bun.file("./public/access.log").text()
// console.log(accessLog)
console.log(`Listening on http://localhost:${server.port} ...`)
