import { z } from 'zod'
import { authBodySchema } from '../schemas/auth.ts'

/**
 * The authentication body.
 */
export type AuthBody = z.infer<typeof authBodySchema>
