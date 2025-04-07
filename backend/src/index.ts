import AuthService from "./services/authService"
import LoggingService from "./services/loggingService.ts"

const server = Bun.serve({
  port: 3000,
  async fetch(req) {
    const data = {
      type: "password" as const,
      host: "test.rebex.net",
      port: 22,
      username: "demo",
      password: "password",
    }
    const auth = new AuthService(new LoggingService())
    await auth.authenticate(data)
    return new Response("Bun!")
  },
})

// const accessLog = await Bun.file("./public/access.log").text()
// console.log(accessLog)
console.log(`Listening on http://localhost:${server.port} ...`)
