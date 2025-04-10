import { ThemeProvider } from "@/components/theme-provider.tsx"
import Test from "@/components/flow/Test.tsx"
import { ModeToggle } from "@/components/mode-toggle.tsx"

function App() {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <Test />
      <ModeToggle />
    </ThemeProvider>
  )
}

export default App
