import { AuthService } from "./services/authService"

const server = Bun.serve({
  port: 3000,
  async fetch(req) {
    const data = {
      type: "password" as const,
      host: "example.com",
      port: 22,
      username: "test",
      password: "test",
    }
    const auth = new AuthService()
    await auth.authenticate(data)
    return new Response("Bun!")
  },
})

// const accessLog = await Bun.file("./public/access.log").text()
// console.log(accessLog)
console.log(`Listening on http://localhost:${server.port} ...`)
