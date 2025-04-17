import withCors from "../utils/withCors.ts"
import { authBodySchema } from "../schemas/auth.ts"
import type AuthService from "../services/authService.ts"
import type SessionService from "../services/sessionService.ts"

/**
 * Authentication route.
 * @param auth AuthService instance
 * @param session SessionService instance
 */
export default function authRoute(auth: AuthService, session: SessionService) {
  return async function handler(req: Request) {
    const body = await req.json()

    const parsed = authBodySchema.safeParse(body)
    if (!parsed.success) {
      return withCors(`Invalid request body: ${parsed.error.message}`, 400)
    }
    const data = parsed.data

    const client = await auth.authenticate(data)
    const token = await session.createSession(client, data)
    return withCors(token)
  }
}
