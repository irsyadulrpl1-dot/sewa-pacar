import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { CompanionCard } from "@/components/CompanionCard";
import { Testimonials } from "@/components/Testimonials";
import { companions } from "@/data/companions";
import { Heart, Users, Calendar, Shield, Star, ChevronRight } from "lucide-react";
import heroBg from "@/assets/hero-bg.jpg";

const services = [
  {
    icon: Users,
    title: "Teman Acara",
    description: "Butuh partner buat dateng ke pesta, nikahan, atau event kampus? Kita siapin yang paling cocok buat kamu!",
  },
  {
    icon: Heart,
    title: "Teman Makan",
    description: "Pengen makan di resto bagus tapi males sendirian? Cari temen makan yang asik di sini!",
  },
  {
    icon: Calendar,
    title: "Teman Traveling",
    description: "Liburan jadi lebih seru kalau ada temen! Explore tempat baru bareng partner yang asyik.",
  },
  {
    icon: Shield,
    title: "Teman Hangout",
    description: "Dari nongkrong di cafe, nonton bioskop, sampe karaoke. Semua jadi lebih fun!",
  },
];

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0">
          <img
            src={heroBg}
            alt="Background"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-background/60 via-background/80 to-background" />
        </div>

        {/* Content */}
        <div className="relative container mx-auto px-4 pt-20">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="max-w-3xl mx-auto text-center"
          >
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="inline-block px-4 py-2 rounded-full border border-primary/30 text-primary text-sm font-medium mb-6"
            >
              Layanan Teman Rental (18+)
            </motion.span>
            
            <h1 className="text-5xl md:text-7xl font-display font-bold text-foreground leading-tight mb-6">
              Cari <span className="text-gradient-gold">Teman</span> Seru Buat Hangout!
            </h1>
            
            <p className="text-xl text-muted-foreground mb-10 leading-relaxed">
              Butuh partner buat acara, makan bareng, atau sekadar ngobrol santai? 
              Di sini tempatnya! Aman, profesional, dan pastinya seru abis! ✨
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button variant="hero" size="xl" asChild>
                <Link to="/companions">
                  Lihat Semua Teman
                  <ChevronRight size={20} />
                </Link>
              </Button>
              <Button variant="heroOutline" size="xl" asChild>
                <Link to="/rules">
                  Gimana Caranya?
                </Link>
              </Button>
            </div>

            {/* Trust Badges */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1 }}
              className="mt-16 flex flex-wrap justify-center gap-8 text-muted-foreground"
            >
              <div className="flex items-center gap-2">
                <Shield size={20} className="text-primary" />
                <span className="text-sm">Profil Terverifikasi</span>
              </div>
              <div className="flex items-center gap-2">
                <Star size={20} className="text-primary" />
                <span className="text-sm">Rating Bintang 5</span>
              </div>
              <div className="flex items-center gap-2">
                <Heart size={20} className="text-primary" />
                <span className="text-sm">100% Aman</span>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-24 bg-card">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <span className="text-primary font-medium text-sm tracking-wider uppercase">
              Layanan Kami
            </span>
            <h2 className="text-4xl md:text-5xl font-display font-bold text-foreground mt-4">
              Mau Ngapain Hari Ini?
            </h2>
            <p className="text-muted-foreground mt-4 max-w-2xl mx-auto">
              Dari acara formal sampe hangout santai, kita punya teman yang pas buat setiap momen!
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {services.map((service, index) => (
              <motion.div
                key={service.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="group p-8 rounded-xl bg-background border border-border hover:border-primary/30 transition-all duration-300 hover:shadow-xl hover:shadow-primary/5"
              >
                <div className="w-14 h-14 rounded-lg bg-primary/10 flex items-center justify-center mb-6 group-hover:bg-primary/20 transition-colors">
                  <service.icon className="w-7 h-7 text-primary" />
                </div>
                <h3 className="text-xl font-display font-semibold text-foreground mb-3">
                  {service.title}
                </h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {service.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Companions */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12"
          >
            <div>
              <span className="text-primary font-medium text-sm tracking-wider uppercase">
                Pilihan Populer
              </span>
              <h2 className="text-4xl md:text-5xl font-display font-bold text-foreground mt-4">
                Teman Favorit
              </h2>
            </div>
            <Button variant="outline" className="mt-6 md:mt-0" asChild>
              <Link to="/companions">
                Lihat Semua
                <ChevronRight size={16} />
              </Link>
            </Button>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {companions.slice(0, 4).map((companion, index) => (
              <CompanionCard key={companion.id} companion={companion} index={index} />
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <Testimonials />

      {/* CTA Section */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-crimson/5 to-primary/10" />
        <div className="container mx-auto px-4 relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-3xl mx-auto text-center"
          >
            <h2 className="text-4xl md:text-5xl font-display font-bold text-foreground mb-6">
              Siap Cari <span className="text-gradient-gold">Teman Seru</span>?
            </h2>
            <p className="text-muted-foreground text-lg mb-10">
              Yuk langsung cek teman-teman keren yang udah siap nemenin kamu!
            </p>
            <Button variant="hero" size="xl" asChild>
              <Link to="/companions">
                Mulai Sekarang
                <ChevronRight size={20} />
              </Link>
            </Button>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Index;
