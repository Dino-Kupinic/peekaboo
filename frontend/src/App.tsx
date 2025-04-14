import { ThemeProvider } from "@/components/theme-provider.tsx"
import { ModeToggle } from "@/components/mode-toggle.tsx"
import { useState } from "react"
import { LogStream } from "@/components/flow/LogStream.tsx"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

function App() {
  const [host, setHost] = useState<string>("localhost")
  const [port, setPort] = useState<string>("2222")
  const [username, setUsername] = useState<string>("testuser")
  const [password, setPassword] = useState<string>("testpass")
  const [session, setSession] = useState<string>("")
  const [customLogPath, setCustomLogPath] = useState<string>(
    "/var/log/nginx/access.log",
  )

  async function connectSSH() {
    try {
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
    } catch (error) {
      console.error("Failed to connect:", error)
    }
  }

  async function logout() {
    try {
      await fetch(`http://localhost:3000/logout/${session}`, {
        method: "GET",
      })
      setSession("")
    } catch (error) {
      console.error("Failed to logout:", error)
    }
  }

  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      {!session ? (
        <div className="flex w-96 flex-col gap-4 p-3">
          <Input
            value={host}
            onChange={(e) => setHost(e.target.value)}
            placeholder="localhost"
            className="w-full"
          />

          <Input
            value={port}
            onChange={(e) => setPort(e.target.value)}
            placeholder="22"
            className="w-full"
          />

          <Input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="username"
            className="w-full"
          />
          <Input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="password"
            className="w-full"
          />

          <Button onClick={connectSSH} className="mt-2">
            Connect
          </Button>
        </div>
      ) : (
        <div className="space-y-4 p-3">
          <p className="text-sm font-medium">
            Session: <span className="font-mono">{session}</span>
          </p>

          <Button variant="destructive" onClick={logout}>
            Disconnect
          </Button>

          <Input
            value={customLogPath}
            onChange={(e) => setCustomLogPath(e.target.value)}
            className="w-full"
          />
        </div>
      )}
      {session && (
        <LogStream session={session} path={customLogPath || undefined} />
      )}

      <ModeToggle />
    </ThemeProvider>
  )
}

export default App
