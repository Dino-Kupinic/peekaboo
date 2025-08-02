import type AuthService from '../services/authService.ts'
import { authenticateJwt, getTokenFromHeader } from '../utils/jwt.ts'
import withCors from '../utils/withCors.ts'

/**
 * Logout route.
 * @param auth AuthService instance
 */
export default function logoutRoute(auth: AuthService) {
  return async function handler(req: Request) {
    if (req.method === 'OPTIONS') {
      return withCors('', 200)
    }

    const authResult = await authenticateJwt(req)
    if (!authResult.valid) {
      return withCors('Unauthorized', 401)
    }

    const token = getTokenFromHeader(req)
    if (!auth.sessionService.sessions.has(token)) {
      return withCors('session not found', 404)
    }

    auth.disconnect(token)
    return withCors('disconnected')
  }
}
