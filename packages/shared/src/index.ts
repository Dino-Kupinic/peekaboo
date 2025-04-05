export interface NginxLogEntry {
  timestamp: string
  ip: string
  method: string
  path: string
  status: number
  userAgent: string
}
