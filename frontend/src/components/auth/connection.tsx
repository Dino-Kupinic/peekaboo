import { Button } from "@/components/ui/button.tsx"
import { useAuth } from "@/lib/auth/useAuth.tsx"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover.tsx"

export default function Connection() {
  const { token: session, logout } = useAuth()

  return (
    <>
      <Popover>
        <PopoverTrigger asChild>
          <Button size="sm" variant="outline">
            <span className="relative flex size-3">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex size-3 rounded-full bg-green-500"></span>
            </span>
            Connected
          </Button>
        </PopoverTrigger>
        <PopoverContent>
          <Button variant="destructive" size="sm" onClick={logout}>
            Disconnect
          </Button>
        </PopoverContent>
      </Popover>
    </>
  )
}
