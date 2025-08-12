import { useState } from "react";
import { useLocation } from "react-router-dom";
import { Header } from "./Header";
import { Sidebar } from "./Sidebar";
import { useMusicPlayer } from "@/hooks/useMusicPlayer";
import { useIsMobile } from "@/hooks/useIsMobile";

interface MainLayoutProps {
  children: React.ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { isPlayerVisible } = useMusicPlayer();
  const isMobile = useIsMobile();

  // Don't add player padding on fullscreen pages
  const isFullscreenPage = location.pathname === '/radio' || location.pathname === '/party-view';
  const shouldShowPlayerPadding = isPlayerVisible && !isFullscreenPage;
  
  // Different padding for mobile (larger player) vs desktop
  const playerPaddingClass = shouldShowPlayerPadding 
    ? (isMobile ? 'pb-40' : 'pb-20') 
    : '';

  return (
    <div className="min-h-screen bg-background">
      <Header onMenuClick={() => setSidebarOpen(true)} />
      <div className="flex">
        <Sidebar 
          open={sidebarOpen} 
          onClose={() => setSidebarOpen(false)} 
        />
        <main className={`flex-1 w-full lg:pl-64 ${playerPaddingClass}`}>
          {children}
        </main>
      </div>
    </div>
  );
}