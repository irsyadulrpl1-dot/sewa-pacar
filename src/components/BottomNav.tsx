import { Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { Home, Users, MessageCircle, User } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const navItems = [
  { href: "/", label: "Home", icon: Home },
  { href: "/find-friends", label: "Cari", icon: Users, requiresAuth: true },
  { href: "/messages", label: "Pesan", icon: MessageCircle, requiresAuth: true },
  { href: "/profile", label: "Profil", icon: User, requiresAuth: true },
];

export function BottomNav() {
  const location = useLocation();
  const { user } = useAuth();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden">
      {/* Blur background */}
      <div className="absolute inset-0 bg-background/80 backdrop-blur-xl border-t border-border/50" />
      
      <div className="relative flex items-center justify-around px-2 py-2 safe-area-bottom">
        {navItems.map((item) => {
          // If requires auth and not logged in, redirect to auth
          const href = item.requiresAuth && !user ? "/auth" : item.href;
          const isActive = location.pathname === item.href || 
            (item.href === "/find-friends" && location.pathname === "/friends");
          
          return (
            <Link
              key={item.href}
              to={href}
              className="relative flex flex-col items-center justify-center py-2 px-4 min-w-[64px]"
            >
              {isActive && (
                <motion.div
                  layoutId="bottomnav-indicator"
                  className="absolute -top-1 w-12 h-1 bg-gradient-to-r from-lavender to-pink rounded-full"
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                />
              )}
              
              <motion.div
                whileTap={{ scale: 0.9 }}
                className={`flex flex-col items-center gap-1 transition-colors duration-200 ${
                  isActive 
                    ? "text-primary" 
                    : "text-muted-foreground"
                }`}
              >
                <div className={`p-2 rounded-xl transition-all duration-300 ${
                  isActive 
                    ? "bg-lavender/15 shadow-glow" 
                    : "hover:bg-muted/50"
                }`}>
                  <item.icon 
                    size={22} 
                    strokeWidth={isActive ? 2.5 : 2}
                    className={isActive ? "text-primary" : ""}
                  />
                </div>
                <span className={`text-[10px] font-medium ${
                  isActive ? "text-primary" : "text-muted-foreground"
                }`}>
                  {item.label}
                </span>
              </motion.div>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
