import { authBodySchema } from "../schemas/auth.ts"
import { z } from "zod"

/**
 * The authentication body.
 */
export type AuthBody = z.infer<typeof authBodySchema>
