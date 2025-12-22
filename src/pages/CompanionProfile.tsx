import { motion } from "framer-motion";
import { useParams, Link } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { companions } from "@/data/companions";
import {
  Star,
  MapPin,
  Clock,
  MessageCircle,
  Heart,
  Calendar,
  ChevronLeft,
  Check,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

const CompanionProfile = () => {
  const { id } = useParams();
  const companion = companions.find((c) => c.id === id);

  if (!companion) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-display text-foreground mb-4">
            Companion not found
          </h1>
          <Button variant="gold" asChild>
            <Link to="/companions">Browse Companions</Link>
          </Button>
        </div>
      </div>
    );
  }

  const handleWhatsAppClick = () => {
    const message = encodeURIComponent(
      `Hi! I'm interested in booking a session with ${companion.name}. Can you provide more details?`
    );
    window.open(`https://wa.me/${companion.whatsapp.replace(/\+/g, "")}?text=${message}`, "_blank");
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="pt-24 pb-24">
        <div className="container mx-auto px-4">
          {/* Back Button */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="mb-8"
          >
            <Link
              to="/companions"
              className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <ChevronLeft size={20} />
              <span>Back to Companions</span>
            </Link>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Image Gallery */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              className="relative"
            >
              <div className="aspect-[3/4] rounded-2xl overflow-hidden">
                <img
                  src={companion.image}
                  alt={companion.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="absolute top-6 right-6 flex items-center gap-2 bg-background/90 backdrop-blur-sm px-4 py-2 rounded-full">
                <Star size={18} className="text-primary fill-primary" />
                <span className="font-semibold text-foreground">{companion.rating}</span>
              </div>
            </motion.div>

            {/* Details */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="flex flex-col"
            >
              {/* Header */}
              <div className="mb-8">
                <h1 className="text-4xl md:text-5xl font-display font-bold text-foreground mb-2">
                  {companion.name}
                </h1>
                <div className="flex flex-wrap items-center gap-4 text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <MapPin size={16} />
                    {companion.city}
                  </span>
                  <span>{companion.age} years old</span>
                  <span className="flex items-center gap-1">
                    <Clock size={16} />
                    {companion.availability}
                  </span>
                </div>
                <p className="text-2xl font-semibold text-primary mt-4">
                  ${companion.hourlyRate}/hour
                </p>
              </div>

              {/* Description */}
              <div className="mb-8">
                <h2 className="text-xl font-display font-semibold text-foreground mb-3">
                  About Me
                </h2>
                <p className="text-muted-foreground leading-relaxed">
                  {companion.description}
                </p>
              </div>

              {/* Personality */}
              <div className="mb-8">
                <h2 className="text-xl font-display font-semibold text-foreground mb-3">
                  Personality
                </h2>
                <div className="flex flex-wrap gap-2">
                  {companion.personality.map((trait) => (
                    <Badge
                      key={trait}
                      variant="outline"
                      className="border-primary/30 text-foreground px-4 py-2"
                    >
                      {trait}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Activities */}
              <div className="mb-8">
                <h2 className="text-xl font-display font-semibold text-foreground mb-3">
                  Available For
                </h2>
                <ul className="grid grid-cols-2 gap-3">
                  {companion.activities.map((activity) => (
                    <li key={activity} className="flex items-center gap-2 text-muted-foreground">
                      <Check size={16} className="text-primary" />
                      {activity}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Packages */}
              <div className="mb-8">
                <h2 className="text-xl font-display font-semibold text-foreground mb-3">
                  Packages
                </h2>
                <div className="grid gap-3">
                  {companion.packages.map((pkg) => (
                    <div
                      key={pkg.name}
                      className="flex items-center justify-between p-4 bg-card rounded-lg border border-border"
                    >
                      <div>
                        <p className="font-semibold text-foreground">{pkg.name}</p>
                        <p className="text-sm text-muted-foreground">{pkg.duration}</p>
                      </div>
                      <p className="text-xl font-semibold text-primary">${pkg.price}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 mt-auto">
                <Button variant="gold" size="lg" className="flex-1" onClick={handleWhatsAppClick}>
                  <MessageCircle size={18} />
                  Book via WhatsApp
                </Button>
                <Button variant="outline" size="lg" className="flex-1">
                  <Heart size={18} />
                  Add to Favorites
                </Button>
              </div>
            </motion.div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default CompanionProfile;
