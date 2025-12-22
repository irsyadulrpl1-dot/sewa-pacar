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
    title: "Event Companion",
    description: "Never attend an event alone. Our companions are perfect for galas, weddings, and corporate functions.",
  },
  {
    icon: Heart,
    title: "Dining Partner",
    description: "Enjoy fine dining with engaging conversation. Perfect for business dinners or romantic restaurants.",
  },
  {
    icon: Calendar,
    title: "Travel Companion",
    description: "Explore new destinations with a charming partner. Make your travels more memorable.",
  },
  {
    icon: Shield,
    title: "Social Events",
    description: "From art galleries to sports events, have confident company in any social setting.",
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
            alt="Elegant couple at upscale event"
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
              Premium Companion Service (18+)
            </motion.span>
            
            <h1 className="text-5xl md:text-7xl font-display font-bold text-foreground leading-tight mb-6">
              Experience <span className="text-gradient-gold">Genuine</span> Connection
            </h1>
            
            <p className="text-xl text-muted-foreground mb-10 leading-relaxed">
              Hire a sophisticated companion to accompany you to events, dinners, 
              or simply spend quality time together. Professional, discreet, unforgettable.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button variant="hero" size="xl" asChild>
                <Link to="/companions">
                  Browse Companions
                  <ChevronRight size={20} />
                </Link>
              </Button>
              <Button variant="heroOutline" size="xl" asChild>
                <Link to="/rules">
                  How It Works
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
                <span className="text-sm">Verified Profiles</span>
              </div>
              <div className="flex items-center gap-2">
                <Star size={20} className="text-primary" />
                <span className="text-sm">5-Star Rated</span>
              </div>
              <div className="flex items-center gap-2">
                <Heart size={20} className="text-primary" />
                <span className="text-sm">100% Discreet</span>
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
              Our Services
            </span>
            <h2 className="text-4xl md:text-5xl font-display font-bold text-foreground mt-4">
              Premium Companionship
            </h2>
            <p className="text-muted-foreground mt-4 max-w-2xl mx-auto">
              From elegant events to casual outings, find the perfect companion 
              for any occasion.
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
                Featured
              </span>
              <h2 className="text-4xl md:text-5xl font-display font-bold text-foreground mt-4">
                Our Companions
              </h2>
            </div>
            <Button variant="outline" className="mt-6 md:mt-0" asChild>
              <Link to="/companions">
                View All
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
              Ready for an <span className="text-gradient-gold">Unforgettable</span> Experience?
            </h2>
            <p className="text-muted-foreground text-lg mb-10">
              Browse our curated selection of companions and book your perfect match today.
            </p>
            <Button variant="hero" size="xl" asChild>
              <Link to="/companions">
                Find Your Companion
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
