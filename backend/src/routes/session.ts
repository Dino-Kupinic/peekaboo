import { authenticateJwt, getTokenFromHeader } from "../utils/jwt.ts"
import withCors from "../utils/withCors.ts"
import type AuthService from "../services/authService.ts"

export default function sessionRoute(auth: AuthService) {
  return async function handler(req: Request) {
    const authResult = await authenticateJwt(req)
    if (!authResult.valid) {
      return withCors("Unauthorized", 401)
    }
    const token = getTokenFromHeader(req)
    const sessionObj = await auth.sessionService.getSessionByToken(token)
    if (sessionObj) {
      return withCors({ isConnected: sessionObj.isConnected })
    }
    return withCors("session not found", 404)
  }
}
