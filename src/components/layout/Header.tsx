import { Menu, Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LoginArea } from "@/components/auth/LoginArea";
import { TrackSuggestionNotifications } from "@/components/notifications/TrackSuggestionNotifications";
import { useTheme } from "@/hooks/useTheme";
import { cn } from "@/lib/utils";
import { Link } from "react-router-dom";

interface HeaderProps {
  onMenuClick: () => void;
  className?: string;
}

export function Header({ onMenuClick, className }: HeaderProps) {
  const { theme, setTheme } = useTheme();

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  return (
    <header
      className={cn(
        "sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60",
        className
      )}
    >
      <div className="container flex h-16 items-center px-4">
        {/* Left: Hamburger menu and Logo */}
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={onMenuClick}
            aria-label="Open menu"
          >
            <Menu className="h-5 w-5" />
          </Button>
          
          <Link
            to="/"
            className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent hover:opacity-80 transition-opacity"
          >
            NostrMusic
          </Link>
        </div>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Right: Notifications, Theme toggle and Login/Profile */}
        <div className="flex items-center gap-2">
          <TrackSuggestionNotifications />
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            aria-label="Toggle theme"
          >
            {theme === "dark" ? (
              <Sun className="h-5 w-5" />
            ) : (
              <Moon className="h-5 w-5" />
            )}
          </Button>
          <LoginArea className="max-w-60" />
        </div>
      </div>
    </header>
  );
}