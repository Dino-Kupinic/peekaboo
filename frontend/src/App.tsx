import { Radio, RefreshCw } from 'lucide-react'
import { useState } from 'react'
import AuthModal from '@/components/auth/auth-modal.tsx'
import Connection from '@/components/auth/connection.tsx'
import { LogStream } from '@/components/flow/log-stream.tsx'
import NavigationBar from '@/components/layouts/navigation-bar.tsx'
import ToolBar from '@/components/layouts/tool-bar.tsx'
import { ModeToggle } from '@/components/mode-toggle.tsx'
import { ThemeProvider } from '@/components/theme-provider.tsx'
import Search from '@/components/toolbar/search.tsx'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select.tsx'

import { useAuth } from '@/lib/auth/useAuth.tsx'

function App() {
  const { isAuthenticated } = useAuth()
  const [customLogPath, setCustomLogPath] = useState<string>(
    '/var/log/nginx/access.log',
  )

  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <div className="h-dvh p-2">
        <div className="flex h-full w-full flex-col">
          <main className="relative h-full w-full grow overflow-hidden rounded-md border">
            <NavigationBar>
              <h1 className="text-xl font-semibold tracking-tight">peekaboo</h1>
              <div className="flex items-center gap-2">
                {isAuthenticated ? <Connection /> : <AuthModal />}
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
            <LogStream path={customLogPath} />
          </main>
        </div>
      </div>
    </ThemeProvider>
  )
}

export default App
