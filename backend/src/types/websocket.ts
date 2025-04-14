import type StreamService from "../services/streamService.ts"

export type WebSocketData = {
  stream?: StreamService
  id?: string
}
