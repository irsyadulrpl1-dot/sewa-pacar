import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Sparkles, ArrowRight, Search } from "lucide-react";

export function HeroSection() {
  return (
    <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden pt-20 md:pt-32 pb-16">
      {/* Animated Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-background via-lavender-soft/20 to-background" />
      <div className="absolute top-20 left-10 w-72 h-72 bg-lavender/20 rounded-full blur-3xl animate-float" />
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-pink/15 rounded-full blur-3xl animate-float" style={{ animationDelay: "1s" }} />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-mint/10 rounded-full blur-3xl animate-float" style={{ animationDelay: "2s" }} />

      {/* Content */}
      <div className="relative container mx-auto px-4 max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-center"
        >
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-lavender/10 border border-lavender/30 text-primary text-sm font-medium mb-6"
          >
            <Sparkles size={14} className="text-pink" />
            <span>Platform Terpercaya untuk Teman Hangout</span>
          </motion.div>

          {/* Headline */}
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-display font-bold text-foreground leading-tight mb-6">
            Temukan Partner Hangout
            <br />
            <span className="text-gradient bg-clip-text text-transparent bg-gradient-to-r from-lavender via-pink to-lavender">
              yang Tepat untuk Anda
            </span>
          </h1>

          {/* Subheadline */}
          <p className="text-lg md:text-xl text-muted-foreground mb-10 max-w-2xl mx-auto leading-relaxed">
            Pilih partner yang sesuai, tentukan waktu fleksibel, dan nikmati pengalaman hangout yang menyenangkan. 
            <span className="text-foreground font-medium"> Proses mudah, aman, dan transparan.</span>
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
            <Button variant="hero" size="xl" asChild className="w-full sm:w-auto min-w-[200px]">
              <Link to="/auth">
                Pesan Sekarang
                <ArrowRight size={20} />
              </Link>
            </Button>
            <Button variant="heroOutline" size="xl" asChild className="w-full sm:w-auto min-w-[200px]">
              <Link to="/companions">
                <Search size={18} />
                Jelajahi Partner
              </Link>
            </Button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

