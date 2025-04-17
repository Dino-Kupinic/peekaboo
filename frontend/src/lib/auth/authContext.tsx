import { createContext } from "react"
import { AuthContextType } from "./auth-provider.tsx"

export const AuthContext = createContext<AuthContextType | undefined>(undefined)
