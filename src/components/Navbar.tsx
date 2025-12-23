import { Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { Menu, X, Sparkles, User, LogIn } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/companions", label: "Katalog Pacar" },
  { href: "/rules", label: "Aturan" },
  { href: "/contact", label: "Kontak" },
];

export function Navbar() {
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const { user } = useAuth();

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="fixed top-4 left-4 right-4 z-50 hidden md:block"
    >
      <nav className="glass rounded-2xl border border-border/50 shadow-soft mx-auto max-w-5xl">
        <div className="px-6">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-lavender to-pink flex items-center justify-center">
                <Sparkles size={18} className="text-primary-foreground" />
              </div>
              <span className="text-xl font-display font-bold text-gradient">
                RentBae
              </span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-2">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  to={link.href}
                  className={`relative px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 ${
                    location.pathname === link.href
                      ? "bg-lavender/10 text-primary"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                  }`}
                >
                  {link.label}
                  {location.pathname === link.href && (
                    <motion.div
                      layoutId="navbar-pill"
                      className="absolute inset-0 bg-lavender/10 rounded-xl -z-10"
                      transition={{ duration: 0.3 }}
                    />
                  )}
                </Link>
              ))}
            </div>

            {/* CTA Buttons */}
            <div className="hidden md:flex items-center gap-2">
              {user ? (
                <>
                  <Button variant="ghost" size="sm" asChild className="rounded-xl">
                    <Link to="/profile">
                      <User size={16} />
                      Profil
                    </Link>
                  </Button>
                  <Button variant="gradient" size="sm" asChild>
                    <Link to="/find-friends">
                      <Sparkles size={14} />
                      Explore
                    </Link>
                  </Button>
                </>
              ) : (
                <>
                  <Button variant="ghost" size="sm" asChild className="rounded-xl">
                    <Link to="/auth">
                      <LogIn size={16} />
                      Masuk
                    </Link>
                  </Button>
                  <Button variant="gradient" size="sm" asChild>
                    <Link to="/companions">
                      <Sparkles size={14} />
                      Sewa Pacar
                    </Link>
                  </Button>
                </>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              className="md:hidden w-10 h-10 rounded-xl bg-muted/50 flex items-center justify-center text-foreground"
              onClick={() => setIsOpen(!isOpen)}
            >
              {isOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>

          {/* Mobile Navigation */}
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden py-4 border-t border-border/50"
            >
              <div className="flex flex-col gap-2">
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    to={link.href}
                    onClick={() => setIsOpen(false)}
                    className={`px-4 py-3 rounded-xl text-base font-medium transition-all duration-300 ${
                      location.pathname === link.href
                        ? "bg-lavender/10 text-primary"
                        : "text-muted-foreground hover:bg-muted/50"
                    }`}
                  >
                    {link.label}
                  </Link>
                ))}
                <Button variant="gradient" className="mt-2" asChild>
                  <Link to="/companions" onClick={() => setIsOpen(false)}>
                    <Sparkles size={16} />
                    Sewa Pacar
                  </Link>
                </Button>
              </div>
            </motion.div>
          )}
        </div>
      </nav>
    </motion.header>
  );
}
