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
    <div className="min-h-screen bg-background flex flex-col">
      {/* Desktop Navbar */}
      <Navbar />
      
      {/* Mobile Header - simple branding */}
      <header className="fixed top-0 left-0 right-0 z-40 md:hidden safe-area-inset-top">
        <div className="flex items-center justify-center h-14 bg-background/80 backdrop-blur-xl border-b border-border/50">
          <span className="text-lg font-display font-bold text-gradient">
            RentBae
          </span>
        </div>
      </header>
      
      {/* Main Content - pt-14 for mobile header, md:pt-24 for desktop floating navbar */}
      <main className="flex-1 pt-14 md:pt-24 pb-24 md:pb-0">
        <ErrorBoundary>
          <Suspense fallback={<PageLoader />}>
            {children}
          </Suspense>
        </ErrorBoundary>
      </main>
      
      {/* Desktop Footer */}
      {showFooter && (
        <div className="hidden md:block mt-auto">
          <Footer />
        </div>
      )}
      
      {/* Mobile Bottom Nav */}
      <BottomNav />
    </div>
  );
}
