import { authenticateJwt, getTokenFromHeader } from "../utils/jwt.ts"
import withCors from "../utils/withCors.ts"
import CommandService from "../services/commandService.ts"
import type LoggingService from "../services/loggingService.ts"
import type AuthService from "../services/authService.ts"

export default function commandRoute(
  auth: AuthService,
  logger: LoggingService,
) {
  return async function handler(req: Request) {
    const authResult = await authenticateJwt(req)
    if (!authResult.valid) {
      return withCors("Unauthorized", 401)
    }
    const token = getTokenFromHeader(req)
    const sessionObj = await auth.sessionService.getSessionByToken(token)
    if (sessionObj) {
      const c = new CommandService(sessionObj.client, logger)
      // TODO: command should be passed in the request body
      const response = await c.runCommand("cd && cat /var/log/nginx/access.log")
      return withCors(response)
    }
    return withCors("not connected")
  }
}
