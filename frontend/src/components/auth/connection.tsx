import { useAuth } from "@/lib/auth/context.tsx"
import { Button } from "@/components/ui/button.tsx"

export default function Connection() {
  const { token: session, logout, isAuthenticated } = useAuth()

  return (
    <>
      <p>is connected: {isAuthenticated}</p>
      {session && (
        <Button variant="destructive" size="sm" onClick={logout}>
          Disconnect
        </Button>
      )}
    </>
  )
}
