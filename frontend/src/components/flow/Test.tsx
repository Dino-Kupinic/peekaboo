import { Input } from "@/components/ui/input.tsx"
import { Button } from "@/components/ui/button.tsx"
import { useState } from "react"

export default function Test() {
  const [host, setHost] = useState("localhost")
  const [port, setPort] = useState("2222")
  const [username, setUsername] = useState("testuser")
  const [password, setPassword] = useState("testpass")
  const [logs, setLogs] = useState("")
  const [session, setSession] = useState("")

  async function post() {
    const response = await fetch("http://localhost:3000/auth", {
      method: "POST",
      body: JSON.stringify({
        host,
        port,
        username,
        password,
        type: "password",
      }),
    })
    const id = await response.text()
    setSession(id)
  }

  async function fetchLogs() {
    const r = await fetch(`http://localhost:3000/command/${session}`)
    setLogs(await r.text())
  }

  async function logout() {
    await fetch(`http://localhost:3000/logout/${session}`, {
      method: "GET",
    })
    setSession("")
  }

  return (
    <>
      {!session && (
        <div className="flex w-96 flex-col gap-4 p-4">
          <Input
            type="text"
            value={host}
            onChange={(e) => setHost(e.target.value)}
            name="host"
            placeholder="Host"
          />
          <Input
            type="text"
            value={port}
            onChange={(e) => setPort(e.target.value)}
            name="port"
            placeholder="Port"
          />
          <Input
            type="text"
            name="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Username"
          />
          <Input
            type="password"
            name="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <Button onClick={post}>Submit</Button>
        </div>
      )}
      {session && (
        <div className="flex w-96 flex-col gap-4 p-4">
          <h1 className="text-xl">Session id: {session}</h1>
          <Button onClick={logout}>Logout</Button>
        </div>
      )}
      {session && <Button onClick={fetchLogs}>Fetch Logs</Button>}
      <pre>{logs}</pre>
    </>
  )
}
