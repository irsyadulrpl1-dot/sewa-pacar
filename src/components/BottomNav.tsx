import { Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { Home, Users, MessageCircle, ScrollText, User } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const navItems = [
  { href: "/", label: "Home", icon: Home },
  { href: "/find-friends", label: "Explore", icon: Users, requiresAuth: true },
  { href: "/messages", label: "Chat", icon: MessageCircle, requiresAuth: true },
  { href: "/rules", label: "Aturan", icon: ScrollText },
  { href: "/profile", label: "Profil", icon: User, requiresAuth: true },
];

export function BottomNav() {
  const location = useLocation();
  const { user } = useAuth();

  return (
    <nav className="fixed bottom-4 left-4 right-4 z-[100] md:hidden">
      {/* Futuristic glass container */}
      <motion.div 
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="relative rounded-2xl overflow-hidden"
      >
        {/* Animated gradient border */}
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-lavender via-pink to-lavender bg-[length:200%_100%] animate-gradient p-[1px]">
          <div className="absolute inset-[1px] rounded-2xl bg-background/90 backdrop-blur-xl" />
        </div>
        
        {/* Glow effect */}
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-lavender/20 via-transparent to-pink/20 blur-xl opacity-50" />
        
        <div className="relative flex items-center justify-around px-2 py-3">
          {navItems.map((item, index) => {
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
                  whileTap={{ scale: 0.85 }}
                  whileHover={{ scale: 1.05 }}
                  className="relative"
                >
                  {/* Active background glow */}
                  {isActive && (
                    <motion.div
                      layoutId="nav-glow"
                      className="absolute inset-0 -m-2 rounded-2xl bg-gradient-to-br from-lavender/30 to-pink/30 blur-md"
                      transition={{ type: "spring", stiffness: 400, damping: 25 }}
                    />
                  )}
                  
                  {/* Icon container */}
                  <motion.div 
                    className={`relative z-10 flex flex-col items-center gap-1 px-4 py-2 rounded-xl transition-all duration-300 ${
                      isActive 
                        ? "text-foreground" 
                        : "text-muted-foreground hover:text-foreground/80"
                    }`}
                    animate={{
                      y: isActive ? -2 : 0,
                    }}
                    transition={{ type: "spring", stiffness: 400, damping: 25 }}
                  >
                    {/* Icon with gradient on active */}
                    <div className={`relative ${isActive ? "text-transparent bg-clip-text bg-gradient-to-br from-lavender to-pink" : ""}`}>
                      <item.icon 
                        size={22} 
                        strokeWidth={isActive ? 2.5 : 1.8}
                        className={isActive ? "stroke-[url(#icon-gradient)]" : ""}
                        style={isActive ? { stroke: "url(#icon-gradient)" } : {}}
                      />
                      {/* Active dot indicator */}
                      {isActive && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-gradient-to-r from-lavender to-pink"
                        />
                      )}
                    </div>
                    
                    {/* Label */}
                    <span className={`text-[10px] font-medium tracking-wide ${
                      isActive 
                        ? "text-transparent bg-clip-text bg-gradient-to-r from-lavender to-pink font-semibold" 
                        : ""
                    }`}>
                      {item.label}
                    </span>
                  </motion.div>
                </motion.div>
              </Link>
            );
          })}
        </div>
        
        {/* SVG gradient definition for icons */}
        <svg width="0" height="0" className="absolute">
          <defs>
            <linearGradient id="icon-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="hsl(var(--lavender))" />
              <stop offset="100%" stopColor="hsl(var(--pink))" />
            </linearGradient>
          </defs>
        </svg>
      </motion.div>
    </nav>
  );
}
