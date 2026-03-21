"use client"

import { useTheme } from "@/components/theme-provider"
import { Button } from "@/components/ui/button"

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()

  const cycle = () => {
    // Only toggle between light + dark (no "system" option in the UI).
    setTheme(theme === "dark" ? "light" : "dark")
  }

  const label = theme === "dark" ? "Dark" : "Light"
  const nextLabel = theme === "dark" ? "Light" : "Dark"

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={cycle}
      className="text-muted-foreground"
      title="Theme"
      aria-label={`Theme: ${label}. Click to switch to ${nextLabel}.`}
    >
      {label === "Light" && "☀️"}
      {label === "Dark" && "🌙"}
      <span className="sr-only">{label}</span>
    </Button>
  )
}
