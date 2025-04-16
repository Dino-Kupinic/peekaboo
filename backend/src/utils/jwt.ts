import { jwtVerify, SignJWT } from "jose"
import type { AuthBody } from "../types/auth.ts"

/**
 * Secret key for signing the JWT.
 */
const secret = new TextEncoder().encode(process.env.JWT_SECRET)
if (!process.env.JWT_SECRET) {
  throw new Error("JWT_SECRET not defined in environment")
}

/**
 * Sign a token with the HS256 algorithm.
 * @returns The signed token.
 */
export async function signToken(body: AuthBody) {
  return await new SignJWT({ auth: body })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setSubject("ssh")
    .setIssuer("peekaboo-backend")
    .setAudience("peekaboo-frontend")
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
