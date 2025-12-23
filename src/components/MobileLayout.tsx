import { ReactNode } from "react";
import { Navbar } from "./Navbar";
import { BottomNav } from "./BottomNav";
import { Footer } from "./Footer";

interface MobileLayoutProps {
  children: ReactNode;
  showFooter?: boolean;
}

export function MobileLayout({ children, showFooter = true }: MobileLayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      {/* Desktop Navbar */}
      <Navbar />
      
      {/* Mobile Header - simple branding */}
      <header className="fixed top-0 left-0 right-0 z-40 md:hidden">
        <div className="flex items-center justify-center h-14 bg-background/80 backdrop-blur-xl border-b border-border/50">
          <span className="text-lg font-display font-bold text-gradient">
            Temani
          </span>
        </div>
      </header>
      
      {/* Main Content */}
      <main className="pt-14 md:pt-0 pb-24 md:pb-0">
        {children}
      </main>
      
      {/* Desktop Footer */}
      {showFooter && (
        <div className="hidden md:block">
          <Footer />
        </div>
      )}
      
      {/* Mobile Bottom Nav */}
      <BottomNav />
    </div>
  );
}
