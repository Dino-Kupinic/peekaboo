import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog.tsx"
import { Button } from "@/components/ui/button.tsx"
import { Input } from "@/components/ui/input.tsx"
import { EthernetPort } from "lucide-react"
import { Label } from "@/components/ui/label.tsx"
import { useState } from "react"

export default function AuthModal({
  setSession,
}: {
  setSession: (session: string) => void
}) {
  const [formData, setFormData] = useState({
    host: "localhost",
    port: "2222",
    username: "testuser",
    password: "testpass",
  })

  async function connectSSH() {
    try {
      const response = await fetch("http://localhost:3000/auth", {
        method: "POST",
        body: JSON.stringify({
          host: formData.host,
          port: formData.port,
          username: formData.username,
          password: formData.password,
          type: "password",
        }),
      })
      const id = await response.text()
      setSession(id)
    } catch (error) {
      console.error("Failed to connect:", error)
    }
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button size="sm">
          <EthernetPort /> Connect via SSH
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[450px]">
        <DialogHeader>
          <DialogTitle>Connection</DialogTitle>
          <DialogDescription>
            Enter your SSH credentials to connect to the server.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-3">
          <div className="flex space-x-3">
            <div className="grow space-y-1">
              <Label htmlFor="host">Host</Label>
              <Input
                name="host"
                value={formData.host}
                onChange={(e) =>
                  setFormData({ ...formData, host: e.target.value })
                }
                placeholder="localhost"
                className="w-full font-mono"
              />
            </div>
            <div className="grow-0 space-y-1">
              <Label htmlFor="port">Port</Label>
              <Input
                name="port"
                value={formData.port}
                onChange={(e) =>
                  setFormData({ ...formData, port: e.target.value })
                }
                placeholder="22"
                className="w-20 font-mono"
              />
            </div>
          </div>

          <div className="space-y-1">
            <Label htmlFor="username">Username</Label>
            <Input
              name="username"
              value={formData.username}
              onChange={(e) =>
                setFormData({ ...formData, username: e.target.value })
              }
              placeholder="username"
              className="w-full font-mono"
            />
          </div>

          <div className="space-y-1">
            <Label htmlFor="password">Password</Label>
            <Input
              name="password"
              type="password"
              value={formData.password}
              onChange={(e) =>
                setFormData({ ...formData, password: e.target.value })
              }
              placeholder="password"
              className="w-full font-mono"
            />
          </div>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button type="submit" onClick={connectSSH} className="w-full">
              Connect
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
