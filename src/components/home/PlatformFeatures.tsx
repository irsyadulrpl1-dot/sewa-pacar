import { motion } from "framer-motion";
import { DollarSign, Clock, Users, Shield } from "lucide-react";

const features = [
  {
    icon: DollarSign,
    title: "Harga Transparan",
    description: "Semua harga ditampilkan dengan jelas, tidak ada biaya tersembunyi",
    gradient: "from-mint to-sky",
  },
  {
    icon: Clock,
    title: "Fleksibel Pilih Waktu",
    description: "Pilih waktu yang sesuai dengan jadwal Anda, kapan saja",
    gradient: "from-lavender to-pink",
  },
  {
    icon: Users,
    title: "Banyak Pilihan Partner",
    description: "Ribuan partner tersedia dengan berbagai karakter dan keahlian",
    gradient: "from-pink to-coral",
  },
  {
    icon: Shield,
    title: "Sistem Terpercaya",
    description: "Platform aman dengan sistem verifikasi dan perlindungan data",
    gradient: "from-sky to-lavender",
  },
];

export function PlatformFeatures() {
  return (
    <section className="py-20 md:py-32">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="inline-flex items-center gap-2 text-primary font-medium text-xs md:text-sm tracking-wider uppercase bg-lavender/10 px-4 py-2 rounded-full mb-4">
            Keunggulan
          </span>
          <h2 className="text-3xl md:text-5xl font-display font-bold text-foreground mb-4">
            Mengapa Pilih <span className="text-gradient">Kami</span>
          </h2>
          <p className="text-muted-foreground text-base md:text-lg max-w-2xl mx-auto">
            Platform yang dirancang untuk memberikan pengalaman terbaik
          </p>
        </motion.div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              whileHover={{ y: -5, scale: 1.02 }}
              className="p-6 md:p-8 rounded-3xl bg-card border border-border/50 shadow-soft hover:shadow-card-hover transition-all duration-300"
            >
              <div className={`w-14 h-14 md:w-16 md:h-16 rounded-2xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                <feature.icon className="w-7 h-7 md:w-8 md:h-8 text-primary-foreground" />
              </div>
              <h3 className="text-xl md:text-2xl font-display font-bold text-foreground mb-3">
                {feature.title}
              </h3>
              <p className="text-muted-foreground text-sm md:text-base leading-relaxed">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

