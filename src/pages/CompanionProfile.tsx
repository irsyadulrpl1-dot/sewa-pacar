import { motion } from "framer-motion";
import { useParams, Link } from "react-router-dom";
import { MobileLayout } from "@/components/MobileLayout";
import { Button } from "@/components/ui/button";
import { companions } from "@/data/companions";
import {
  Star,
  MapPin,
  Clock,
  MessageCircle,
  Heart,
  ChevronLeft,
  Check,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

const CompanionProfile = () => {
  const { id } = useParams();
  const companion = companions.find((c) => c.id === id);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  if (!companion) {
    return (
      <MobileLayout showFooter={false}>
        <div className="min-h-[60vh] flex items-center justify-center">
          <div className="text-center px-4">
            <h1 className="text-xl md:text-2xl font-display text-foreground mb-4">
              Pacar sewaan nggak ketemu nih 😢
            </h1>
            <Button variant="gradient" asChild>
              <Link to="/companions">Lihat Yang Lain</Link>
            </Button>
          </div>
        </div>
      </MobileLayout>
    );
  }

  const handleWhatsAppClick = () => {
    const message = encodeURIComponent(
      `Hai! Aku tertarik buat booking ${companion.name}. Bisa kasih info lebih lanjut dong?`
    );
    window.open(`https://wa.me/${companion.whatsapp.replace(/\+/g, "")}?text=${message}`, "_blank");
  };

  return (
    <MobileLayout showFooter={false}>
      <main className="pt-4 md:pt-24 pb-40 md:pb-0">
        <div className="container mx-auto px-4">
          {/* Back Button */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="mb-4 md:mb-8"
          >
            <Link
              to="/companions"
              className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors text-sm md:text-base"
            >
              <ChevronLeft size={18} />
              <span>Kembali</span>
            </Link>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-12">
            {/* Image */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              className="relative"
            >
              <div className="aspect-[4/5] md:aspect-[3/4] rounded-2xl md:rounded-3xl overflow-hidden">
                <img
                  src={companion.image}
                  alt={companion.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="absolute top-4 md:top-6 right-4 md:right-6 flex items-center gap-2 bg-background/90 backdrop-blur-sm px-3 md:px-4 py-2 rounded-full">
                <Star size={16} className="text-primary fill-primary" />
                <span className="font-semibold text-foreground text-sm md:text-base">{companion.rating}</span>
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
              <div className="mb-6 md:mb-8">
                <h1 className="text-2xl md:text-4xl lg:text-5xl font-display font-bold text-foreground mb-2">
                  {companion.name}
                </h1>
                <div className="flex flex-wrap items-center gap-3 md:gap-4 text-muted-foreground text-sm">
                  <span className="flex items-center gap-1">
                    <MapPin size={14} />
                    {companion.city}
                  </span>
                  <span>{companion.age} tahun</span>
                  <span className="flex items-center gap-1">
                    <Clock size={14} />
                    {companion.availability}
                  </span>
                </div>
                <p className="text-xl md:text-2xl font-semibold text-primary mt-3 md:mt-4">
                  {formatPrice(companion.hourlyRate)}/jam
                </p>
              </div>

              {/* Description */}
              <div className="mb-6 md:mb-8">
                <h2 className="text-lg md:text-xl font-display font-semibold text-foreground mb-2 md:mb-3">
                  Tentang Aku
                </h2>
                <p className="text-muted-foreground leading-relaxed text-sm md:text-base">
                  {companion.description}
                </p>
              </div>

              {/* Personality */}
              <div className="mb-6 md:mb-8">
                <h2 className="text-lg md:text-xl font-display font-semibold text-foreground mb-2 md:mb-3">
                  Kepribadian
                </h2>
                <div className="flex flex-wrap gap-2">
                  {companion.personality.map((trait) => (
                    <Badge
                      key={trait}
                      variant="outline"
                      className="border-primary/30 text-foreground px-3 md:px-4 py-1.5 md:py-2 text-xs md:text-sm"
                    >
                      {trait}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Activities */}
              <div className="mb-6 md:mb-8">
                <h2 className="text-lg md:text-xl font-display font-semibold text-foreground mb-2 md:mb-3">
                  Bisa Nemenin Untuk
                </h2>
                <ul className="grid grid-cols-2 gap-2 md:gap-3">
                  {companion.activities.map((activity) => (
                    <li key={activity} className="flex items-center gap-2 text-muted-foreground text-sm md:text-base">
                      <Check size={14} className="text-primary shrink-0" />
                      {activity}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Packages */}
              <div className="mb-6 md:mb-8">
                <h2 className="text-lg md:text-xl font-display font-semibold text-foreground mb-2 md:mb-3">
                  Paket Tersedia
                </h2>
                <div className="grid gap-2 md:gap-3">
                  {companion.packages.map((pkg) => (
                    <div
                      key={pkg.name}
                      className="flex items-center justify-between p-3 md:p-4 bg-card rounded-xl border border-border"
                    >
                      <div>
                        <p className="font-semibold text-foreground text-sm md:text-base">{pkg.name}</p>
                        <p className="text-xs md:text-sm text-muted-foreground">{pkg.duration}</p>
                      </div>
                      <p className="text-lg md:text-xl font-semibold text-primary">{formatPrice(pkg.price)}</p>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Fixed CTA for mobile */}
        <div className="fixed bottom-20 left-0 right-0 p-4 bg-background/95 backdrop-blur-xl border-t border-border md:hidden z-40">
          <div className="flex gap-3">
            <Button variant="gradient" className="flex-1" onClick={handleWhatsAppClick}>
              <MessageCircle size={18} />
              Booking via WhatsApp
            </Button>
            <Button variant="outline" size="icon" className="h-12 w-12 shrink-0">
              <Heart size={18} />
            </Button>
          </div>
        </div>

        {/* Desktop CTA */}
        <div className="hidden md:block container mx-auto px-4 py-8">
          <div className="flex flex-col sm:flex-row gap-4 max-w-md">
            <Button variant="gradient" size="lg" className="flex-1" onClick={handleWhatsAppClick}>
              <MessageCircle size={18} />
              Booking via WhatsApp
            </Button>
            <Button variant="outline" size="lg" className="flex-1">
              <Heart size={18} />
              Simpan ke Favorit
            </Button>
          </div>
        </div>
      </main>
    </MobileLayout>
  );
};

export default CompanionProfile;
