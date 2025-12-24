import { ReactNode, Suspense, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Navbar } from "./Navbar";
import { BottomNav } from "./BottomNav";
import { Footer } from "./Footer";
import { ErrorBoundary } from "@/components/ui/error-boundary";
import { PageLoader } from "@/components/ui/loading-states";

interface MobileLayoutProps {
  children: ReactNode;
  showFooter?: boolean;
}

/**
 * Layout that guarantees header/footer nav stay visible while the page scrolls.
 * We render the fixed chrome via a portal to avoid any parent transform/filter
 * breaking `position: fixed` behavior.
 */
export function MobileLayout({ children, showFooter = true }: MobileLayoutProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const chrome = (
    <>
      {/* Desktop Navbar - Fixed */}
      <Navbar />

      {/* Mobile Header - Fixed, always visible */}
      <header className="fixed top-0 left-0 right-0 z-[100] md:hidden">
        <div className="flex items-center justify-center h-14 bg-background border-b border-border">
          <span className="text-lg font-display font-bold text-gradient">RentBae</span>
        </div>
      </header>

      {/* Mobile Bottom Nav - Fixed, always visible */}
      <BottomNav />
    </>
  );

  return (
    <div className="min-h-screen bg-background">
      {mounted ? createPortal(chrome, document.body) : chrome}

      {/* Main content area (scrolls under fixed chrome) */}
      <main className="min-h-screen pt-14 pb-20 md:pt-24 md:pb-0">
        <ErrorBoundary>
          <Suspense fallback={<PageLoader />}>
            {children}
          </Suspense>
        </ErrorBoundary>

        {showFooter && (
          <div className="hidden md:block">
            <Footer />
          </div>
        )}
      </main>
    </div>
  );
}
