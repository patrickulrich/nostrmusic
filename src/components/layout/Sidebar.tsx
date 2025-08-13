import { Link, useLocation } from "react-router-dom";
import { Home, Trophy } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

interface SidebarProps {
  open: boolean;
  onClose: () => void;
  isPeachy?: boolean;
}

const baseMenuItems = [
  { icon: Home, label: "Home", path: "/" },
  { icon: Trophy, label: "Leaderboard", path: "/leaderboard" },
];

const peachyOnlyItems = [
  // Currently no Peachy-only items
];

export function Sidebar({ open, onClose, isPeachy = false }: SidebarProps) {
  const location = useLocation();
  const menuItems = [...baseMenuItems, ...(isPeachy ? peachyOnlyItems : [])];

  return (
    <>
      {/* Mobile Sidebar */}
      <Sheet open={open} onOpenChange={onClose}>
        <SheetContent side="left" className="w-80 p-0">
          <SheetHeader className="px-6 py-4 border-b">
            <SheetTitle className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              NostrMusic
            </SheetTitle>
          </SheetHeader>
          <nav className="flex flex-col p-4">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={onClose}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 rounded-lg transition-colors",
                    "hover:bg-accent hover:text-accent-foreground",
                    isActive && "bg-primary text-primary-foreground"
                  )}
                >
                  <Icon className="h-5 w-5" />
                  <span className="font-medium">{item.label}</span>
                </Link>
              );
            })}
          </nav>
          <div className="absolute bottom-4 left-4 right-4">
            <a
              href="https://soapbox.pub/mkstack"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-muted-foreground hover:text-foreground transition-colors text-center block"
            >
              Vibed with MKStack
            </a>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}