import { jwtVerify, SignJWT } from "jose"
import type { AuthBody } from "../types/auth.ts"

if (!process.env.JWT_SECRET) {
  throw new Error("JWT_SECRET not defined in environment")
}
/**
 * Secret key for signing the JWT.
 */
const secret = new TextEncoder().encode(process.env.JWT_SECRET)

/**
 * Sign a token with the HS256 algorithm.
 * @returns The signed token.
 */
export async function signToken(body: AuthBody) {
  return await new SignJWT({ auth: body })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setSubject("ssh")
    .setExpirationTime("15min")
    .sign(secret)
}

/**
 * Verify the token and return the payload.
 * @param token The token to verify.
 */
export async function verifyToken(token: string) {
  const { payload } = await jwtVerify(token, secret)
  return payload
}

/**
 * Get the token from the request header.
 * @param req The request containing the JWT token in the Authorization header.
 */
export function getTokenFromHeader(req: Request) {
  const header = req.headers.get("Authorization")
  if (!header) {
    throw new Error("No authorization header provided")
  }
  const token = header.split(" ")[1]
  if (!token) {
    throw new Error("No token provided")
  }
  return token
}

/**
 * Authenticate the JWT token from the request.
 * @param req The request containing the JWT token in the Authorization header.
 */
export async function authenticateJwt(req: Request) {
  const token = getTokenFromHeader(req)
  if (!token) {
    throw new Error("No token provided")
  }
  const payload = await verifyToken(token)
  if (payload === undefined) {
    return { valid: false }
  }
  return { valid: true, payload }
}
