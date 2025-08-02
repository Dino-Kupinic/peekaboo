/**
 * Response with CORS headers
 * @param body The body of the response
 * @param status The status code of the response
 */
export default function withCors(
  body: Bun.BodyInit | object,
  status: number = 200,
) {
  const response = typeof body === 'object' ? JSON.stringify(body) : body
  return new Response(response, {
    status,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Content-Type': 'application/json',
    },
  })
}
