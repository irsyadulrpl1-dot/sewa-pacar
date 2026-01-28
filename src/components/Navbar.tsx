import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, User, LogIn, Heart, MessageCircle, Settings, Edit2, LogOut, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { useAuth } from "@/contexts/AuthContext";
import { useProfile } from "@/hooks/useProfile";
import { NotificationBell } from "@/components/NotificationBell";
import { useState } from "react";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/info", label: "Info" },
  { href: "/rules", label: "Aturan" },
  { href: "/contact", label: "Kontak" },
];

export function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { profile } = useProfile();
  const role: "renter" | "companion" | null =
    profile?.role === "renter" || profile?.role === "companion" ? (profile.role as "renter" | "companion") : null;
  const [profileOpen, setProfileOpen] = useState(false);

  const handleLogout = async () => {
    await signOut();
    setProfileOpen(false);
    navigate("/");
  };

  return (
    <motion.header
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
      className="fixed top-4 left-4 right-4 z-50 hidden md:block"
    >
      <nav className="glass rounded-2xl border border-border/40 shadow-lg backdrop-blur-xl mx-auto max-w-5xl">
        <div className="px-5">
          <div className="flex items-center justify-between h-14">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2 group">
              <motion.div 
                whileHover={{ scale: 1.05, rotate: 5 }}
                whileTap={{ scale: 0.95 }}
                className="w-8 h-8 rounded-lg bg-gradient-to-br from-lavender to-pink flex items-center justify-center shadow-md"
              >
                <Heart size={16} className="text-primary-foreground fill-primary-foreground" />
              </motion.div>
              <span className="text-lg font-display font-bold text-gradient">
                RentBae
              </span>
            </Link>

            {/* Desktop Navigation */}
            <div className="flex items-center bg-muted/30 rounded-xl p-1">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  to={link.href}
                  className="relative px-4 py-1.5 rounded-lg text-sm font-medium"
                >
                  <motion.span 
                    className={`relative z-10 transition-colors duration-300 ${
                      location.pathname === link.href
                        ? "text-primary-foreground"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                    initial={false}
                    animate={{ 
                      color: location.pathname === link.href 
                        ? "hsl(var(--primary-foreground))" 
                        : "hsl(var(--muted-foreground))" 
                    }}
                    transition={{ duration: 0.2 }}
                  >
                    {link.label}
                  </motion.span>
                  {location.pathname === link.href && (
                    <motion.div
                      layoutId="navbar-active"
                      className="absolute inset-0 bg-gradient-to-r from-lavender to-pink rounded-lg shadow-sm"
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ 
                        type: "spring", 
                        stiffness: 350, 
                        damping: 25,
                        mass: 0.8
                      }}
                    />
                  )}
                </Link>
              ))}
            </div>

            {/* CTA Buttons */}
            <div className="flex items-center gap-2">
              <AnimatePresence mode="wait">
                {user ? (
                  <motion.div 
                    key="logged-in"
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    className="flex items-center gap-2"
                  >
                    <NotificationBell />
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      asChild 
                      className="rounded-lg h-8 px-3 text-sm hover:bg-muted/60"
                    >
                      <Link to="/messages" className="flex items-center gap-1.5">
                        <MessageCircle size={14} />
                        <span>Chat</span>
                      </Link>
                    </Button>
                    <div
                      className="relative"
                      onMouseEnter={() => setProfileOpen(true)}
                      onMouseLeave={() => setProfileOpen(false)}
                    >
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="rounded-lg h-8 px-3 text-sm hover:bg-muted/60"
                      >
                        <div className="flex items-center gap-1.5">
                          <Avatar className="h-6 w-6 ring-2 ring-primary/20">
                            <AvatarImage src={profile?.avatar_url || undefined} />
                            <AvatarFallback className="bg-gradient-to-br from-primary to-primary/60 text-primary-foreground text-xs font-semibold">
                              {profile?.full_name?.charAt(0) || "U"}
                            </AvatarFallback>
                          </Avatar>
                          <span>Profil</span>
                        </div>
                      </Button>
                      <AnimatePresence>
                        {profileOpen && (
                          <motion.div
                            initial={{ opacity: 0, y: -6 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -6 }}
                            transition={{ duration: 0.15 }}
                            className="absolute right-0 top-full mt-2 w-48 rounded-xl border border-border/50 bg-background/95 backdrop-blur-xl shadow-lg"
                          >
                            <div className="py-2">
                              <Link
                                to="/profile"
                                className="flex items-center gap-2 px-3 py-2 text-sm text-foreground hover:bg-muted/50"
                              >
                                <User className="h-4 w-4" />
                                <span>Profile</span>
                              </Link>
                              <Link
                                to="/profile"
                                className="flex items-center gap-2 px-3 py-2 text-sm text-foreground hover:bg-muted/50"
                              >
                                <Edit2 className="h-4 w-4" />
                                <span>Edit Profile</span>
                              </Link>
                              <Link
                                to="/settings"
                                className="flex items-center gap-2 px-3 py-2 text-sm text-foreground hover:bg-muted/50"
                              >
                                <Settings className="h-4 w-4" />
                                <span>Settings</span>
                              </Link>
                              <Link
                                to="/settings"
                                className="flex items-center gap-2 px-3 py-2 text-sm text-foreground hover:bg-muted/50"
                              >
                                <Shield className="h-4 w-4" />
                                <span>Privacy</span>
                              </Link>
                              <button
                                onClick={handleLogout}
                                className="flex w-full items-center gap-2 px-3 py-2 text-sm text-destructive hover:bg-destructive/10"
                              >
                                <LogOut className="h-4 w-4" />
                                <span>Logout</span>
                              </button>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                    <Button 
                      variant="gradient" 
                      size="sm" 
                      asChild 
                      className="h-8 px-4 text-sm shadow-md hover:shadow-lg transition-shadow"
                    >
                      {role === "companion" ? (
                        <Link to="/companion/booking" className="flex items-center gap-1.5">
                          <Sparkles size={12} />
                          <span>Booking</span>
                        </Link>
                      ) : (
                        <Link to="/find-friends" className="flex items-center gap-1.5">
                          <Sparkles size={12} />
                          <span>Explore</span>
                        </Link>
                      )}
                    </Button>
                    
                    <Button 
                      variant="gradient" 
                      size="sm" 
                      asChild 
                      className="h-8 px-4 text-sm shadow-md hover:shadow-lg transition-shadow"
                    >
                      {role === "companion" ? (
                        <Link to="/incoming-bookings" className="flex items-center gap-1.5">
                          <Sparkles size={12} />
                          <span>Booking Masuk</span>
                        </Link>
                      ) : (
                        <Link to="/bookings" className="flex items-center gap-1.5">
                          <Sparkles size={12} />
                          <span>Detail Booking</span>
                        </Link>
                      )}
                    </Button>
                  </motion.div>
                ) : (
                  <motion.div 
                    key="logged-out"
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    className="flex items-center gap-2"
                  >
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      asChild 
                      className="rounded-lg h-8 px-3 text-sm hover:bg-muted/60"
                    >
                      <Link to="/auth" className="flex items-center gap-1.5">
                        <LogIn size={14} />
                        <span>Masuk</span>
                      </Link>
                    </Button>
                    <Button 
                      variant="gradient" 
                      size="sm" 
                      asChild 
                      className="h-8 px-4 text-sm shadow-md hover:shadow-lg transition-shadow"
                    >
                      <Link to="/companions" className="flex items-center gap-1.5">
                        <Sparkles size={12} />
                        <span>Sewa</span>
                      </Link>
                    </Button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </nav>
    </motion.header>
  );
}
