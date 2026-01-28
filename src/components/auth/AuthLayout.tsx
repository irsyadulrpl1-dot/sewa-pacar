import { ReactNode } from "react";
import { motion } from "framer-motion";

interface AuthLayoutProps {
  children: ReactNode;
  branding: ReactNode;
}

export function AuthLayout({ children, branding }: AuthLayoutProps) {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-background p-4 md:p-8">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="w-full max-w-6xl bg-card rounded-[2rem] shadow-2xl overflow-hidden flex flex-col md:flex-row min-h-[600px] md:min-h-[700px]"
      >
        {/* Left Side - Branding (60% width on desktop) */}
        <div className="w-full md:w-[60%] relative overflow-hidden order-last md:order-first">
          {branding}
        </div>

        {/* Right Side - Form (40% width on desktop) */}
        <div className="w-full md:w-[40%] bg-background p-6 md:p-12 flex flex-col justify-center relative z-10">
          {children}
        </div>
      </motion.div>
    </div>
  );
}
