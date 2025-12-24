import { ReactNode, Suspense } from "react";
import { Navbar } from "./Navbar";
import { BottomNav } from "./BottomNav";
import { Footer } from "./Footer";
import { ErrorBoundary } from "@/components/ui/error-boundary";
import { PageLoader } from "@/components/ui/loading-states";

interface MobileLayoutProps {
  children: ReactNode;
  showFooter?: boolean;
}

export function MobileLayout({ children, showFooter = true }: MobileLayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      {/* Desktop Navbar - Fixed */}
      <Navbar />
      
      {/* Mobile Header - Fixed, always visible */}
      <header className="fixed top-0 left-0 right-0 z-[100] md:hidden">
        <div className="flex items-center justify-center h-14 bg-background border-b border-border">
          <span className="text-lg font-display font-bold text-gradient">
            RentBae
          </span>
        </div>
      </header>
      
      {/* Main Content Area - Scrollable between fixed header and bottom nav */}
      <main className="min-h-screen pt-14 pb-20 md:pt-24 md:pb-0">
        <ErrorBoundary>
          <Suspense fallback={<PageLoader />}>
            {children}
          </Suspense>
        </ErrorBoundary>
        
        {/* Desktop Footer */}
        {showFooter && (
          <div className="hidden md:block">
            <Footer />
          </div>
        )}
      </main>
      
      {/* Mobile Bottom Nav - Fixed, always visible */}
      <BottomNav />
    </div>
  );
}
