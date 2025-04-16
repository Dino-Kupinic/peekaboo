import { z } from "zod"

export const baseAuthSchema = z.object({
  /**
   * The hostname or IP address of the server to authenticate against
   * @example "192.168.1.1"
   */
  host: z.string().min(1, "host is required"),
  /**
   * The port to use for authentication
   * @example 22
   */
  port: z
    .number()
    .min(1, "port is required")
    .max(65535, "port must be between 1 and 65535"),
  /**
   * The username to use for authentication
   * @example "dinokupinic"
   */
  username: z.string().trim().min(1, "username is required"),
})

export const passwordAuthSchema = baseAuthSchema.extend({
  type: z.literal("password"),
  /**
   * The password to use for password authentication
   */
  password: z.string().optional(),
})

export const authBodySchema = passwordAuthSchema
