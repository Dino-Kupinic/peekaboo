import AuthService from "./services/authService"
import LoggingService from "./services/loggingService.ts"
import withCors from "./utils/withCors.ts"
import type { AuthBody } from "./types/auth.ts"

const server = Bun.serve({
  port: 3000,
  routes: {
    "/auth": async (req) => {
      const body = await req.json()
      const auth = new AuthService(new LoggingService())
      await auth.authenticate(body as AuthBody)
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
