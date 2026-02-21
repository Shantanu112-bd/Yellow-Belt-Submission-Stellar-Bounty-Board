import { Moon, Sun } from "lucide-react"
import { useTheme } from "./theme-provider"
import { BountyButton } from "./bounty-button"
import { cn } from "./ui/utils"

export function ThemeToggle({ className, title = "Toggle Theme" }: { className?: string, title?: string }) {
    const { setTheme, theme } = useTheme()

    return (
        <BountyButton
            variant="ghost"
            size="sm"
            className={cn("w-9 h-9 px-0", className)}
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            title={title}
        >
            <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            <span className="sr-only">Toggle theme</span>
        </BountyButton>
    )
}
