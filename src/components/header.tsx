import { Clapperboard, Sun, Moon } from "lucide-react"
import { Button } from "@/components/ui/button"

interface HeaderProps {
  theme: "light" | "dark"
  onToggleTheme: () => void
}

export function Header({ theme, onToggleTheme }: HeaderProps) {
  return (
    <header className="flex items-center gap-4">
      <div className="rounded-xl bg-primary/10 p-2.5 text-primary">
        <Clapperboard className="h-8 w-8" />
      </div>
      <div className="flex-1">
        <h1 className="text-3xl font-bold tracking-tight font-serif">Video Converter</h1>
        <p className="text-sm text-muted-foreground">
          Convert and compress videos entirely in your browser
        </p>
      </div>
      <Button variant="ghost" size="icon" onClick={onToggleTheme} className="shrink-0">
        {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
      </Button>
    </header>
  )
}
