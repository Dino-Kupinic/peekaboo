import type { Client } from "ssh2"

export type Session = {
  client: Client
  isConnected: boolean
}
