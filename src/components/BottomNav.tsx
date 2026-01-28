import { Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { Home, Users, MessageCircle, ScrollText, User, CalendarCheck } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useProfile } from "@/hooks/useProfile";

export function BottomNav() {
  const location = useLocation();
  const { user } = useAuth();
  const { profile } = useProfile();
  const role: "renter" | "companion" | null =
    profile?.role === "renter" || profile?.role === "companion" ? (profile.role as "renter" | "companion") : null;

  const navItems = [
    { href: "/", label: "Home", icon: Home },
    ...(role === "companion"
      ? [{ href: "/companion/bookings", label: "Booking", icon: CalendarCheck, requiresAuth: true }]
      : [{ href: "/find-friends", label: "Explore", icon: Users, requiresAuth: true }]),
    { href: "/messages", label: "Chat", icon: MessageCircle, requiresAuth: true },
    { href: "/rules", label: "Aturan", icon: ScrollText },
    { href: "/profile", label: "Profil", icon: User, requiresAuth: true },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-[100] md:hidden safe-area-bottom">
      {/* Modern glass container - fixed to bottom */}
      <motion.div 
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="relative overflow-hidden"
      >
        {/* Top gradient border line */}
        <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-lavender/50 to-transparent" />
        
        {/* Glass background */}
        <div className="absolute inset-0 bg-background/95 backdrop-blur-xl" />
        
        {/* Subtle glow effect at top */}
        <div className="absolute top-0 left-1/4 right-1/4 h-8 bg-gradient-to-b from-lavender/10 to-transparent blur-xl" />
        
        <div className="relative flex items-center justify-around px-2 py-2">
          {navItems.map((item) => {
            const href = item.requiresAuth && !user ? "/auth" : item.href;
            const isActive = location.pathname === item.href || 
              (item.href === "/find-friends" && location.pathname === "/friends");
            
            return (
              <Link
                key={item.href}
                to={href}
                className="relative flex flex-col items-center justify-center group"
              >
                <motion.div
                  whileTap={{ scale: 0.9 }}
                  className="relative"
                >
                  {/* Active background pill */}
                  {isActive && (
                    <motion.div
                      layoutId="nav-active-bg"
                      className="absolute inset-0 -m-1 rounded-xl bg-gradient-to-br from-lavender/20 to-pink/20"
                      transition={{ type: "spring", stiffness: 400, damping: 25 }}
                    />
                  )}
                  
                  {/* Icon container */}
                  <div 
                    className={`relative z-10 flex flex-col items-center gap-0.5 px-4 py-2 rounded-xl transition-all duration-200 ${
                      isActive 
                        ? "text-foreground" 
                        : "text-muted-foreground"
                    }`}
                  >
                    {/* Icon */}
                    <div className="relative">
                      <item.icon 
                        size={22} 
                        strokeWidth={isActive ? 2.5 : 1.8}
                        className={isActive ? "text-primary" : ""}
                      />
                      {/* Active indicator dot */}
                      {isActive && (
                        <motion.div
                          initial={{ scale: 0, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          className="absolute -top-1 -right-1 w-1.5 h-1.5 rounded-full bg-gradient-to-r from-lavender to-pink"
                        />
                      )}
                    </div>
                    
                    {/* Label */}
                    <span className={`text-[10px] font-medium ${
                      isActive 
                        ? "text-transparent bg-clip-text bg-gradient-to-r from-lavender to-pink font-semibold" 
                        : ""
                    }`}>
                      {item.label}
                    </span>
                  </div>
                </motion.div>
              </Link>
            );
          })}
        </div>
      </motion.div>
    </nav>
  );
}
