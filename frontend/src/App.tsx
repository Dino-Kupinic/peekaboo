import { ThemeProvider } from "@/components/theme-provider.tsx"
import { ModeToggle } from "@/components/mode-toggle.tsx"
import { useState } from "react"
import { LogStream } from "@/components/flow/LogStream.tsx"
import { Button } from "@/components/ui/button"
import NavigationBar from "@/components/layouts/NavigationBar.tsx"
import AuthModal from "@/components/connection/AuthModal.tsx"
import ToolBar from "@/components/layouts/ToolBar.tsx"
import Search from "@/components/toolbar/Search.tsx"
import { Radio, RefreshCw } from "lucide-react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select.tsx"

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
      <div className="h-dvh p-2">
        <div className="flex h-full w-full flex-col">
          <main className="relative h-full w-full grow overflow-hidden rounded-md border">
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
              <Select
                value={customLogPath}
                onValueChange={(value) => setCustomLogPath(value)}
              >
                <SelectTrigger className="w-96 font-mono" size="sm">
                  <SelectValue placeholder="Select log file" />
                </SelectTrigger>
                <SelectContent className="font-mono">
                  <SelectItem value="/var/log/nginx/access.log">
                    /var/log/nginx/access.log
                  </SelectItem>
                  <SelectItem value="/var/log/nginx/error.log">
                    /var/log/nginx/error.log
                  </SelectItem>
                </SelectContent>
              </Select>
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
            <LogStream session={session} path={customLogPath || undefined} />
          </main>
        </div>
      </div>
    </ThemeProvider>
  )
}

export default App
