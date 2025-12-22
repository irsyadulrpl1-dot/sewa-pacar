import { Link } from "react-router-dom";
import { Heart, Instagram, Twitter } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-card border-t border-border">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-1">
            <Link to="/" className="text-2xl font-display font-bold text-gradient-gold">
              Rendezvous
            </Link>
            <p className="mt-4 text-muted-foreground text-sm leading-relaxed">
              Premium companion services for sophisticated individuals. 
              Experience genuine connection and memorable moments.
            </p>
            <div className="flex gap-4 mt-6">
              <a
                href="#"
                className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
              >
                <Instagram size={18} />
              </a>
              <a
                href="#"
                className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
              >
                <Twitter size={18} />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-display font-semibold text-foreground mb-4">Quick Links</h4>
            <ul className="space-y-3">
              <li>
                <Link to="/companions" className="text-muted-foreground hover:text-primary transition-colors text-sm">
                  Browse Companions
                </Link>
              </li>
              <li>
                <Link to="/rules" className="text-muted-foreground hover:text-primary transition-colors text-sm">
                  Rules & Guidelines
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-muted-foreground hover:text-primary transition-colors text-sm">
                  Contact Us
                </Link>
              </li>
            </ul>
          </div>

          {/* Services */}
          <div>
            <h4 className="font-display font-semibold text-foreground mb-4">Services</h4>
            <ul className="space-y-3">
              <li className="text-muted-foreground text-sm">Event Companion</li>
              <li className="text-muted-foreground text-sm">Dining Partner</li>
              <li className="text-muted-foreground text-sm">Travel Companion</li>
              <li className="text-muted-foreground text-sm">Social Events</li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-display font-semibold text-foreground mb-4">Contact</h4>
            <ul className="space-y-3">
              <li className="text-muted-foreground text-sm">support@rendezvous.com</li>
              <li className="text-muted-foreground text-sm">WhatsApp: +1 234 567 890</li>
              <li className="text-muted-foreground text-sm">Available 24/7</li>
            </ul>
          </div>
        </div>

        <div className="border-t border-border mt-12 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-muted-foreground text-sm">
            © 2024 Rendezvous. All rights reserved. Adults (18+) only.
          </p>
          <p className="text-muted-foreground text-sm flex items-center gap-1">
            Made with <Heart size={14} className="text-crimson" /> for genuine connections
          </p>
        </div>
      </div>
    </footer>
  );
}
