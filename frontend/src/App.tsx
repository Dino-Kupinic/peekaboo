import { ThemeProvider } from "@/components/theme-provider.tsx"
import { ModeToggle } from "@/components/mode-toggle.tsx"
import { useState } from "react"
import { LogStream } from "@/components/flow/LogStream.tsx"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import NavigationBar from "@/components/layouts/NavigationBar.tsx"
import AuthModal from "@/components/connection/AuthModal.tsx"
import ToolBar from "@/components/layouts/ToolBar.tsx"
import Search from "@/components/toolbar/Search.tsx"
import { Radio, RefreshCw } from "lucide-react"

function App() {
  const [session, setSession] = useState<string>("")
  const [customLogPath, setCustomLogPath] = useState<string>(
    "/var/log/nginx/access.log",
  )

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
      <NavigationBar>
        <h1 className="text-xl font-semibold tracking-tight">peekaboo</h1>
        <div className="flex items-center gap-2">
          {session && (
            <Button variant="destructive" size="sm" onClick={logout}>
              Disconnect
            </Button>
          )}
          <AuthModal setSession={setSession} />
          <ModeToggle />
        </div>
      </NavigationBar>
      <ToolBar>
        <div className="flex gap-2">
          <Search />
          <Button variant="outline" size="sm">
            <Radio /> Live
          </Button>
          <Button variant="outline" size="icon">
            <RefreshCw />
          </Button>
        </div>
      </ToolBar>
      {!session ? (
        <p>hi</p>
      ) : (
        <div className="space-y-4 p-3">
          <p className="text-sm font-medium">
            Session: <span className="font-mono">{session}</span>
          </p>

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
    </ThemeProvider>
  )
}

export default App
