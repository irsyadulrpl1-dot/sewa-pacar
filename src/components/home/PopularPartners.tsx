import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { CompanionCard } from "@/components/CompanionCard";
import { Star, ArrowRight } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useCompanions } from "@/hooks/useCompanions";

export function PopularPartners() {
  const { user } = useAuth();
  const { companions, loading } = useCompanions({
    sort: "created_at",
    limit: 4,
  });
  
  const featuredCompanions = companions.slice(0, 4);

  return (
    <section className="py-20 md:py-32 bg-gradient-to-b from-background to-card/30">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12"
        >
          <div>
            <span className="inline-flex items-center gap-2 text-primary font-medium text-xs md:text-sm tracking-wider uppercase bg-pink/10 px-4 py-2 rounded-full mb-4">
              <Star size={14} />
              Partner Populer
            </span>
            <h2 className="text-3xl md:text-5xl font-display font-bold text-foreground">
              Partner <span className="text-gradient">Terpilih</span>
            </h2>
            <p className="text-muted-foreground mt-3 text-sm md:text-base max-w-xl">
              Partner yang sedang aktif dan banyak dipilih oleh pengguna
            </p>
          </div>
          <Button variant="outline" size="lg" asChild className="mt-6 md:mt-0">
            <Link to="/companions">
              Lihat Semua Partner
              <ArrowRight size={18} />
            </Link>
          </Button>
        </motion.div>

        {/* Partners Grid */}
        {loading ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="aspect-[3/4] bg-muted/50 rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : featuredCompanions.length > 0 ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
            {featuredCompanions.map((companion, index) => (
              <CompanionCard
                key={companion.id}
                companion={companion}
                index={index}
                badge={index === 0 ? "popular" : companion.is_verified ? "verified" : index === 3 ? "new" : undefined}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-muted-foreground">
            Belum ada partner yang tersedia
          </div>
        )}

        {/* CTA for non-logged users */}
        {!user && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center"
          >
            <Button variant="gradient" size="lg" asChild>
              <Link to="/auth">
                Daftar Sekarang untuk Melihat Semua Partner
                <ArrowRight size={18} />
              </Link>
            </Button>
          </motion.div>
        )}
      </div>
    </section>
  );
}

