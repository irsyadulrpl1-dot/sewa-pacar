import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { MobileLayout } from "@/components/MobileLayout";
import { CompanionCard } from "@/components/CompanionCard";
import { Testimonials } from "@/components/Testimonials";
import { companions } from "@/data/companions";
import { Heart, Users, Shield, Star, ChevronRight, Sparkles, Zap, Coffee, MapPin, Plus, Compass } from "lucide-react";
import { PostFeed } from "@/components/posts/PostFeed";
import { CreatePostDialog } from "@/components/posts/CreatePostDialog";
import { ExploreFeed } from "@/components/explore/ExploreFeed";
import { CompanionExploreFeed } from "@/components/explore/CompanionExploreFeed";
import { useAuth } from "@/contexts/AuthContext";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const services = [
  {
    icon: Users,
    title: "Date Kondangan",
    description: "Butuh partner buat dateng ke nikahan atau pesta? Anti malu-maluin, dijamin charming! 💍",
    gradient: "from-lavender to-pink",
  },
  {
    icon: Coffee,
    title: "Cafe Buddy",
    description: "Pengen ngopi aesthetic atau makan enak tapi males sendirian? Siap jadi partner foto! ☕",
    gradient: "from-pink to-peach",
  },
  {
    icon: MapPin,
    title: "Travel Bestie",
    description: "Solo trip jadi couple trip! Explore tempat baru bareng yang asik & vibes matching~ ✈️",
    gradient: "from-mint to-sky",
  },
  {
    icon: Zap,
    title: "Hangout Partner",
    description: "Nonton, karaoke, mall date — semua lebih seru bareng! No more awkward solo 🎬",
    gradient: "from-sky to-lavender",
  },
];

const Index = () => {
  const { user } = useAuth();

  return (
    <MobileLayout>
      {/* Tabs for Feed vs Explore */}
      <div className="sticky top-14 md:top-24 z-30 bg-background/95 backdrop-blur-md border-b border-border/50">
        <Tabs defaultValue="feed" className="w-full">
          <TabsList className="w-full max-w-md mx-auto justify-center bg-transparent h-14 gap-0 p-0 rounded-none">
            <TabsTrigger 
              value="feed" 
              className="relative flex-1 gap-2 h-full bg-transparent border-0 rounded-none text-muted-foreground data-[state=active]:text-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none font-medium transition-colors hover:text-foreground after:absolute after:bottom-0 after:left-1/2 after:-translate-x-1/2 after:w-20 after:h-0.5 after:bg-primary after:rounded-full after:scale-x-0 data-[state=active]:after:scale-x-100 after:transition-transform after:duration-300"
            >
              <Heart className="h-4 w-4" />
              Feed
            </TabsTrigger>
            <TabsTrigger 
              value="explore" 
              className="relative flex-1 gap-2 h-full bg-transparent border-0 rounded-none text-muted-foreground data-[state=active]:text-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none font-medium transition-colors hover:text-foreground after:absolute after:bottom-0 after:left-1/2 after:-translate-x-1/2 after:w-20 after:h-0.5 after:bg-primary after:rounded-full after:scale-x-0 data-[state=active]:after:scale-x-100 after:transition-transform after:duration-300"
            >
              <Compass className="h-4 w-4" />
              Jelajahi
            </TabsTrigger>
          </TabsList>

          {/* Feed Content */}
          <TabsContent value="feed" className="mt-0">
            <div className="container mx-auto px-4 py-6 max-w-6xl">
              {/* Create Post Button */}
              {user && (
                <div className="max-w-lg mx-auto md:max-w-none md:mx-0 mb-6">
                  <CreatePostDialog>
                    <Button variant="outline" className="w-full md:w-auto rounded-xl justify-start gap-3 h-14 px-4">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-lavender to-pink flex items-center justify-center">
                        <Plus className="w-5 h-5 text-primary-foreground" />
                      </div>
                      <span className="text-muted-foreground">Buat postingan baru...</span>
                    </Button>
                  </CreatePostDialog>
                </div>
              )}

              {/* Post Feed - Grid for desktop */}
              <PostFeed />
            </div>
          </TabsContent>

          {/* Explore Content - Posts with Companion Profiles */}
          <TabsContent value="explore" className="mt-0">
            {user ? (
              <div className="container mx-auto px-4 py-6 max-w-6xl">
                <ExploreFeed />
              </div>
            ) : (
              <>
                {/* Hero Section for non-logged in users */}
                <section className="relative min-h-[85vh] md:min-h-screen flex items-center justify-center overflow-hidden pt-8 md:pt-24">
                  {/* Animated Background */}
                  <div className="absolute inset-0 bg-gradient-genz" />
                  <div className="absolute top-20 left-10 w-48 md:w-72 h-48 md:h-72 bg-lavender/30 rounded-full blur-3xl animate-float" />
                  <div className="absolute bottom-20 right-10 w-64 md:w-96 h-64 md:h-96 bg-pink/20 rounded-full blur-3xl animate-float" style={{ animationDelay: "1s" }} />
                  <div className="absolute top-1/2 left-1/2 w-48 md:w-64 h-48 md:h-64 bg-mint/20 rounded-full blur-3xl animate-float" style={{ animationDelay: "2s" }} />

                  {/* Content */}
                  <div className="relative container mx-auto px-4">
                    <motion.div
                      initial={{ opacity: 0, y: 40 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.8, delay: 0.2 }}
                      className="max-w-3xl mx-auto text-center"
                    >
                      <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.3 }}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-lavender/10 border border-lavender/30 text-primary text-xs md:text-sm font-medium mb-6 md:mb-8"
                      >
                        <Sparkles size={14} className="text-pink" />
                        <span>Rental Pacar Premium (18+)</span>
                        <Sparkles size={14} className="text-lavender" />
                      </motion.div>
                      
                      <h1 className="text-3xl md:text-5xl lg:text-7xl font-display font-bold text-foreground leading-tight mb-4 md:mb-6">
                        Jomblo? <span className="text-gradient">Sewa Aja!</span> 💕
                      </h1>
                      
                      <p className="text-base md:text-xl text-muted-foreground mb-8 md:mb-10 leading-relaxed px-2">
                        Butuh gebetan dadakan buat kondangan, makan romantis, atau flexing ke mantan? 
                        Di sini tempatnya! <span className="text-primary font-medium">No strings attached</span>, cuma vibes! ✨
                      </p>

                      <div className="flex flex-col sm:flex-row gap-3 md:gap-4 justify-center px-4">
                        <Button variant="hero" size="lg" asChild className="w-full sm:w-auto">
                          <Link to="/auth">
                            <Sparkles size={18} />
                            Gabung Sekarang
                            <ChevronRight size={18} />
                          </Link>
                        </Button>
                        <Button variant="heroOutline" size="lg" asChild className="w-full sm:w-auto">
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
                        className="mt-10 md:mt-16 flex flex-wrap justify-center gap-3 md:gap-4"
                      >
                        {[
                          { icon: Shield, label: "100% Aman", color: "mint" },
                          { icon: Star, label: "Rating 5.0", color: "pink" },
                          { icon: Heart, label: "Verified Talent", color: "lavender" },
                        ].map((item) => (
                          <div
                            key={item.label}
                            className="flex items-center gap-2 px-3 md:px-4 py-2 rounded-full bg-card border border-border/50 shadow-soft"
                          >
                            <item.icon size={16} className={`text-${item.color}`} />
                            <span className="text-xs md:text-sm font-medium text-foreground">{item.label}</span>
                          </div>
                        ))}
                      </motion.div>
                    </motion.div>
                  </div>
                </section>

                {/* Services Section */}
                <section className="py-16 md:py-24 relative">
                  <div className="absolute inset-0 bg-gradient-to-b from-background via-lavender-soft/30 to-background" />
                  <div className="container mx-auto px-4 relative">
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      className="text-center mb-10 md:mb-16"
                    >
                      <span className="inline-flex items-center gap-2 text-primary font-medium text-xs md:text-sm tracking-wider uppercase bg-lavender/10 px-4 py-2 rounded-full">
                        <Zap size={14} />
                        Layanan Kami
                      </span>
                      <h2 className="text-2xl md:text-4xl lg:text-5xl font-display font-bold text-foreground mt-4 md:mt-6">
                        Mau <span className="text-gradient">Date</span> Kemana?
                      </h2>
                      <p className="text-muted-foreground mt-3 md:mt-4 max-w-2xl mx-auto text-sm md:text-base">
                        Dari kondangan sampe healing, kita punya pacar sewaan yang pas buat setiap momen!
                      </p>
                    </motion.div>

                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6">
                      {services.map((service, index) => (
                        <motion.div
                          key={service.title}
                          initial={{ opacity: 0, y: 30 }}
                          whileInView={{ opacity: 1, y: 0 }}
                          viewport={{ once: true }}
                          transition={{ duration: 0.5, delay: index * 0.1 }}
                          whileHover={{ y: -5, scale: 1.02 }}
                          className="group p-4 md:p-6 rounded-2xl md:rounded-3xl bg-card border border-border/50 shadow-soft hover:shadow-card-hover transition-all duration-300"
                        >
                          <div className={`w-10 md:w-14 h-10 md:h-14 rounded-xl md:rounded-2xl bg-gradient-to-br ${service.gradient} flex items-center justify-center mb-3 md:mb-5 group-hover:scale-110 transition-transform duration-300`}>
                            <service.icon className="w-5 md:w-7 h-5 md:h-7 text-primary-foreground" />
                          </div>
                          <h3 className="text-sm md:text-xl font-display font-bold text-foreground mb-2 md:mb-3">
                            {service.title}
                          </h3>
                          <p className="text-muted-foreground text-xs md:text-sm leading-relaxed line-clamp-3 md:line-clamp-none">
                            {service.description}
                          </p>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </section>

                {/* Featured Companions */}
                <section className="py-16 md:py-24">
                  <div className="container mx-auto px-4">
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 md:mb-12"
                    >
                      <div>
                        <span className="inline-flex items-center gap-2 text-primary font-medium text-xs md:text-sm tracking-wider uppercase bg-pink/10 px-4 py-2 rounded-full">
                          <Star size={14} />
                          Hot Picks 🔥
                        </span>
                        <h2 className="text-2xl md:text-4xl lg:text-5xl font-display font-bold text-foreground mt-4 md:mt-6">
                          Pacar <span className="text-gradient">Favorit</span>
                        </h2>
                      </div>
                      <Button variant="outline" className="mt-4 md:mt-0 hidden md:flex" asChild>
                        <Link to="/companions">
                          Lihat Semua
                          <ChevronRight size={16} />
                        </Link>
                      </Button>
                    </motion.div>

                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6">
                      {companions.slice(0, 4).map((companion, index) => (
                        <CompanionCard 
                          key={companion.id} 
                          companion={companion} 
                          index={index}
                          badge={index === 0 ? "popular" : index === 1 ? "verified" : index === 3 ? "new" : undefined}
                        />
                      ))}
                    </div>
                    
                    {/* Mobile see all button */}
                    <div className="flex justify-center mt-6 md:hidden">
                      <Button variant="gradient" size="lg" asChild className="w-full max-w-xs">
                        <Link to="/auth">
                          Gabung Sekarang
                          <ChevronRight size={16} />
                        </Link>
                      </Button>
                    </div>
                  </div>
                </section>

                {/* Testimonials */}
                <Testimonials />

                {/* CTA Section */}
                <section className="py-16 md:py-24 relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-r from-lavender/10 via-pink/10 to-mint/10" />
                  <div className="absolute top-0 left-0 w-64 md:w-96 h-64 md:h-96 bg-lavender/20 rounded-full blur-3xl" />
                  <div className="absolute bottom-0 right-0 w-64 md:w-96 h-64 md:h-96 bg-pink/20 rounded-full blur-3xl" />
                  
                  <div className="container mx-auto px-4 relative">
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      className="max-w-3xl mx-auto text-center"
                    >
                      <motion.div
                        initial={{ scale: 0 }}
                        whileInView={{ scale: 1 }}
                        viewport={{ once: true }}
                        className="w-16 md:w-20 h-16 md:h-20 mx-auto mb-6 md:mb-8 rounded-2xl md:rounded-3xl bg-gradient-to-br from-lavender to-pink flex items-center justify-center shadow-glow"
                      >
                        <Heart size={28} className="text-primary-foreground md:w-9 md:h-9" />
                      </motion.div>
                      
                      <h2 className="text-2xl md:text-4xl lg:text-5xl font-display font-bold text-foreground mb-4 md:mb-6">
                        Siap <span className="text-gradient">Flexing</span> ke Mantan?
                      </h2>
                      <p className="text-muted-foreground text-base md:text-lg mb-8 md:mb-10 px-4">
                        Yuk langsung pilih pacar sewaan yang cocok sama vibe kamu! Anti galau, anti sendirian 🚀
                      </p>
                      <Button variant="hero" size="lg" asChild className="w-full sm:w-auto max-w-xs">
                        <Link to="/auth">
                          <Sparkles size={18} />
                          Gabung Sekarang
                          <ChevronRight size={18} />
                        </Link>
                      </Button>
                    </motion.div>
                  </div>
                </section>
              </>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </MobileLayout>
  );
};

export default Index;
