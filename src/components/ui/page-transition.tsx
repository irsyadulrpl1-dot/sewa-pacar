import { ReactNode, useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

interface PageTransitionProps {
  children: ReactNode;
  className?: string;
}

/**
 * Page transition wrapper that fades in content smoothly
 */
export function PageTransition({ children, className }: PageTransitionProps) {
  return (
    <motion.div
      initial={{ opacity: 0, filter: "blur(10px)" }}
      animate={{ opacity: 1, filter: "blur(0px)" }}
      exit={{ opacity: 0, filter: "blur(10px)" }}
      transition={{ 
        duration: 0.4, 
        ease: [0.25, 0.46, 0.45, 0.94],
        filter: { duration: 0.5 }
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

interface BlurLoaderProps {
  isLoading?: boolean;
  children: ReactNode;
  className?: string;
  blur?: number;
}

/**
 * Blur loader that shows content with blur while loading
 */
export function BlurLoader({ 
  isLoading = false, 
  children, 
  className,
  blur = 8 
}: BlurLoaderProps) {
  return (
    <div className={cn("relative", className)}>
      <motion.div
        animate={{
          filter: isLoading ? `blur(${blur}px)` : "blur(0px)",
          opacity: isLoading ? 0.7 : 1,
        }}
        transition={{ 
          duration: 0.4, 
          ease: "easeOut" 
        }}
      >
        {children}
      </motion.div>
      
      {/* Loading overlay */}
      <AnimatePresence>
        {isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 flex items-center justify-center pointer-events-none"
          >
            <div className="w-8 h-8 border-3 border-primary/30 border-t-primary rounded-full animate-spin" />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

interface LazyPageWrapperProps {
  children: ReactNode;
}

/**
 * Wrapper for lazy loaded pages with smooth blur transition
 */
export function LazyPageWrapper({ children }: LazyPageWrapperProps) {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // Small delay to ensure content is painted before removing blur
    const timer = requestAnimationFrame(() => {
      setIsReady(true);
    });
    return () => cancelAnimationFrame(timer);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0.5, filter: "blur(12px)", scale: 0.98 }}
      animate={{ 
        opacity: isReady ? 1 : 0.5, 
        filter: isReady ? "blur(0px)" : "blur(12px)",
        scale: isReady ? 1 : 0.98
      }}
      transition={{ 
        duration: 0.5, 
        ease: [0.25, 0.46, 0.45, 0.94]
      }}
    >
      {children}
    </motion.div>
  );
}
