"use client"

import { useTheme } from "@/components/theme-provider"
import { Button } from "@/components/ui/button"

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()

  const cycle = () => {
    if (theme === "light") setTheme("dark")
    else if (theme === "dark") setTheme("system")
    else setTheme("light")
  }

  const label = theme === "light" ? "Light" : theme === "dark" ? "Dark" : "System"

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={cycle}
      className="text-muted-foreground"
      title="Theme"
      aria-label={`Theme: ${label}. Click to switch.`}
    >
      {theme === "light" && "☀️"}
      {theme === "dark" && "🌙"}
      {theme === "system" && "💻"}
      <span className="sr-only">{label}</span>
    </Button>
  )
}
