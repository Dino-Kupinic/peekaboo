/**
 * Response with CORS headers
 * @param body The body of the response
 * @param status The status code of the response
 */
export default function withCors(body: Bun.BodyInit, status: number = 200) {
  return new Response(body, {
    status,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
      "Content-Type": "application/json",
    },
  })
}
