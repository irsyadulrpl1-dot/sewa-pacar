import { Link } from "react-router-dom";
import { Heart, Instagram, Twitter, Sparkles, Send } from "lucide-react";
import { Button } from "./ui/button";

export function Footer() {
  return (
    <footer className="bg-card border-t border-border/50">
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          {/* Brand */}
          <div className="md:col-span-1">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-lavender to-pink flex items-center justify-center">
                <Sparkles size={20} className="text-primary-foreground" />
              </div>
              <span className="text-2xl font-display font-bold text-gradient">
                RentBae
              </span>
            </Link>
            <p className="text-muted-foreground text-sm leading-relaxed mb-6">
              Platform rental pacar terpercaya untuk Gen Z. Aman, asik, dan siap jadi plus one kamu! 💕
            </p>
            <div className="flex gap-3">
              <a
                href="#"
                className="w-10 h-10 rounded-xl bg-gradient-to-br from-lavender/20 to-pink/20 flex items-center justify-center text-primary hover:from-lavender hover:to-pink hover:text-primary-foreground transition-all duration-300"
              >
                <Instagram size={18} />
              </a>
              <a
                href="#"
                className="w-10 h-10 rounded-xl bg-gradient-to-br from-sky/20 to-mint/20 flex items-center justify-center text-sky hover:from-sky hover:to-mint hover:text-foreground transition-all duration-300"
              >
                <Twitter size={18} />
              </a>
              <a
                href="#"
                className="w-10 h-10 rounded-xl bg-gradient-to-br from-mint/20 to-sky/20 flex items-center justify-center text-mint hover:from-mint hover:to-sky hover:text-foreground transition-all duration-300"
              >
                <Send size={18} />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-display font-bold text-foreground mb-5 text-lg">Menu</h4>
            <ul className="space-y-3">
              <li>
                <Link to="/companions" className="text-muted-foreground hover:text-primary transition-colors text-sm flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-lavender" />
                  Katalog Pacar
                </Link>
              </li>
              <li>
                <Link to="/rules" className="text-muted-foreground hover:text-primary transition-colors text-sm flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-pink" />
                  Aturan Main
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-muted-foreground hover:text-primary transition-colors text-sm flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-mint" />
                  Hubungi Kami
                </Link>
              </li>
            </ul>
          </div>

          {/* Services */}
          <div>
            <h4 className="font-display font-bold text-foreground mb-5 text-lg">Layanan</h4>
            <ul className="space-y-3">
              <li className="text-muted-foreground text-sm flex items-center gap-2">
                <span>💍</span> Date Kondangan
              </li>
              <li className="text-muted-foreground text-sm flex items-center gap-2">
                <span>☕</span> Cafe Buddy
              </li>
              <li className="text-muted-foreground text-sm flex items-center gap-2">
                <span>✈️</span> Travel Bestie
              </li>
              <li className="text-muted-foreground text-sm flex items-center gap-2">
                <span>🎬</span> Hangout Partner
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-display font-bold text-foreground mb-5 text-lg">Kontak</h4>
            <ul className="space-y-3">
              <li className="text-muted-foreground text-sm">📧 halo@rentbae.id</li>
              <li className="text-muted-foreground text-sm">📱 WA: +62 812 3456 7890</li>
              <li className="text-muted-foreground text-sm">⏰ Online 24/7</li>
            </ul>
            <Button variant="whatsapp" size="sm" className="mt-4 w-full">
              Chat Sekarang
            </Button>
          </div>
        </div>

        <div className="border-t border-border/50 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-muted-foreground text-sm">
            © 2024 RentBae. All rights reserved. Khusus 18+ ya bestie! 🔞
          </p>
          <p className="text-muted-foreground text-sm flex items-center gap-2">
            Made with <Heart size={14} className="text-pink fill-pink" /> by Gen Z, for Gen Z
          </p>
        </div>
      </div>
    </footer>
  );
}
