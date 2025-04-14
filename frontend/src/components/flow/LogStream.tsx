import { useEffect, useRef, useState } from "react"
import { Button } from "@/components/ui/button.tsx"

interface LogStreamProps {
  session: string
  path?: string
}

interface LogMessage {
  type: string
  stream?: string
  data?: string
  message?: string
}

export function LogStream({ session, path }: LogStreamProps) {
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
                setLogs((prev) =>
                  [...prev, message.data].filter((log) => log !== undefined),
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
    <div className="flex flex-col gap-4">
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
        <div className="bg-destructive text-destructive rounded-md p-3">
          {error}
        </div>
      )}

      <div className="bg-background text-foreground h-[400px] overflow-auto rounded-md border p-4 font-mono text-sm">
        {logs.length === 0 ? (
          <div className="text-gray-500">
            {isStreaming ? "Waiting for logs..." : "No logs to display"}
          </div>
        ) : (
          logs.map((log, index) => (
            <div key={index} className="whitespace-pre-wrap">
              {log}
            </div>
          ))
        )}
      </div>
    </div>
  )
}
