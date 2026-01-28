import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles } from "lucide-react";

export function FinalCTA() {
  return (
    <section className="py-20 md:py-32 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-r from-lavender/10 via-pink/10 to-mint/10" />
      <div className="absolute top-0 left-0 w-96 h-96 bg-lavender/20 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-pink/20 rounded-full blur-3xl" />

      {/* Content */}
      <div className="container mx-auto px-4 max-w-4xl relative">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <motion.div
            initial={{ scale: 0 }}
            whileInView={{ scale: 1 }}
            viewport={{ once: true }}
            className="w-20 h-20 mx-auto mb-8 rounded-3xl bg-gradient-to-br from-lavender to-pink flex items-center justify-center shadow-glow"
          >
            <Sparkles size={36} className="text-primary-foreground" />
          </motion.div>

          <h2 className="text-3xl md:text-5xl lg:text-6xl font-display font-bold text-foreground mb-6">
            Siap Memulai?
          </h2>
          <p className="text-muted-foreground text-lg md:text-xl mb-10 max-w-2xl mx-auto leading-relaxed">
            Bergabunglah dengan ribuan pengguna yang telah merasakan pengalaman hangout yang menyenangkan
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button variant="hero" size="xl" asChild className="w-full sm:w-auto min-w-[220px]">
              <Link to="/auth">
                <Sparkles size={20} />
                Mulai Sekarang
                <ArrowRight size={20} />
              </Link>
            </Button>
            <Button variant="heroOutline" size="xl" asChild className="w-full sm:w-auto min-w-[220px]">
              <Link to="/auth">
                Daftar Gratis
              </Link>
            </Button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

