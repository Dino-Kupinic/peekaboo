import { useEffect, useRef, useState } from "react"
import { Button } from "@/components/ui/button.tsx"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table.tsx"
import { useAuth } from "@/lib/auth/useAuth.tsx"

interface LogMessage {
  type: string
  stream?: string
  data?: string
  message?: string
}

export function LogStream({ path }: { path: string }) {
  const { token: session } = useAuth()

  const [logs, setLogs] = useState<string[]>([])
  const [isStreaming, setIsStreaming] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [stream, setStream] = useState<string | null>(null)
  const socketRef = useRef<WebSocket | null>(null)

  useEffect(() => {
    const connect = () => {
      const socket = new WebSocket("ws://localhost:3000/ws")
      socketRef.current = socket

      socket.onopen = () => {
        setError(null)
        console.log("connected")
      }

      socket.onmessage = (event) => {
        try {
          const message: LogMessage = JSON.parse(event.data)

          switch (message.type) {
            case "data":
              if (message.data) {
                const newLogs = message.data
                  .split("\n")
                  .filter((log) => log.trim() !== "")

                setLogs((prev) =>
                  [...prev, ...newLogs].filter((log) => log !== undefined),
                )
              }
              break
            case "started":
              setStream(message.stream || null)
              setIsStreaming(true)
              setError(null)
              break
            case "stopped":
              setIsStreaming(false)
              setStream(null)
              break
            case "error":
              setError(message.message || "Unknown error")
              setIsStreaming(false)
              break
            default:
              console.log("unknown message type:", message)
          }
        } catch (err) {
          console.error("error parsing message:", err)
        }
      }

      socket.onclose = () => {
        console.log("connection closed")
      }

      socket.onerror = (error) => {
        console.error(error)
        setError("connection error")
      }
    }

    connect()

    return () => {
      if (
        socketRef.current &&
        socketRef.current.readyState === WebSocket.OPEN
      ) {
        socketRef.current.close()
      }
    }
  }, [])

  const startLogStream = () => {
    if (!socketRef.current || socketRef.current.readyState !== WebSocket.OPEN) {
      setError("not connected")
      return
    }

    setLogs([])
    setError(null)

    socketRef.current.send(
      JSON.stringify({
        type: "start",
        session,
        path,
      }),
    )
  }

  const stopLogStream = () => {
    if (!socketRef.current || socketRef.current.readyState !== WebSocket.OPEN) {
      setError("not connected")
      return
    }

    if (stream) {
      socketRef.current.send(
        JSON.stringify({
          type: "stop",
          stream,
        }),
      )
    }
  }

  return (
    <div className="flex h-full w-full flex-col gap-4">
      <div className="flex items-center gap-2">
        <Button
          onClick={startLogStream}
          disabled={isStreaming}
          variant="default"
        >
          Start
        </Button>
        <Button
          onClick={stopLogStream}
          disabled={!isStreaming}
          variant="destructive"
        >
          Stop
        </Button>
      </div>

      {error && (
        <div className="text-destructive border-destructive rounded-md border p-3">
          {error}
        </div>
      )}

      <div className="bg-background text-foreground h-full overflow-auto border-t pb-8">
        {logs.length === 0 ? (
          <div className="text-gray-500">
            {isStreaming ? "Waiting for logs..." : "No logs to display"}
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Data</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {logs.map((log, index) => (
                <TableRow key={index} className="whitespace-pre-wrap">
                  <TableCell className="font-mono">{log}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  )
}
