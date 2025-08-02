/**
 * Sends a JSON object to the client
 * @param ws The Bun WebSocket to use
 * @param data The object to send
 */
export default function wsSendJson(
  ws: Bun.ServerWebSocket<unknown>,
  data: object,
) {
  return ws.send(JSON.stringify(data))
}
