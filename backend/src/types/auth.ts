/**
 * The type of authentication to use
 */
export type AuthType = "password" | "key"

/**
 * The base authentication type, which includes the common properties for
 * both password and key authentication
 */
type BaseAuth = {
  /**
   * The hostname or IP address of the server to authenticate against
   * @example "192.168.1.1"
   */
  host: string
  /**
   * The port to use for authentication
   * @example 22
   */
  port: number
  /**
   * The username to use for authentication
   * @example "dinokupinic"
   */
  username: string
}

export type PasswordAuth = BaseAuth & {
  type: "password"
  /**
   * The password to use for password authentication
   * @example "mySecretPassword"
   */
  password?: string
}

export type KeyAuth = BaseAuth & {
  type: "key"
  /**
   * The private key to use for authentication
   */
  key?: string
  /**
   * The passphrase for the private key
   */
  passphrase?: string
}

/**
 * The authentication type which can be either password or key based
 */
export type AuthBody = PasswordAuth | KeyAuth
