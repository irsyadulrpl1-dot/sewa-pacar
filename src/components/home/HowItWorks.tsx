import { motion } from "framer-motion";
import { Search, Calendar, CreditCard, Users } from "lucide-react";

const steps = [
  {
    number: "01",
    icon: Search,
    title: "Pilih Partner",
    description: "Jelajahi berbagai partner yang tersedia dan pilih yang sesuai dengan kebutuhan Anda",
    gradient: "from-lavender to-pink",
  },
  {
    number: "02",
    icon: Calendar,
    title: "Tentukan Waktu",
    description: "Pilih tanggal dan jam yang fleksibel sesuai jadwal Anda",
    gradient: "from-pink to-coral",
  },
  {
    number: "03",
    icon: CreditCard,
    title: "Konfirmasi & Bayar",
    description: "Lakukan pembayaran dengan metode yang aman dan terjamin",
    gradient: "from-mint to-sky",
  },
  {
    number: "04",
    icon: Users,
    title: "Layanan Dimulai",
    description: "Nikmati pengalaman hangout yang menyenangkan bersama partner",
    gradient: "from-sky to-lavender",
  },
];

export function HowItWorks() {
  return (
    <section className="py-20 md:py-32 relative">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="inline-flex items-center gap-2 text-primary font-medium text-xs md:text-sm tracking-wider uppercase bg-lavender/10 px-4 py-2 rounded-full mb-4">
            Cara Kerja
          </span>
          <h2 className="text-3xl md:text-5xl font-display font-bold text-foreground mb-4">
            Proses yang <span className="text-gradient">Sederhana</span>
          </h2>
          <p className="text-muted-foreground text-base md:text-lg max-w-2xl mx-auto">
            Hanya dalam 4 langkah mudah, Anda bisa mulai menikmati layanan kami
          </p>
        </motion.div>

        {/* Steps */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
          {steps.map((step, index) => (
            <motion.div
              key={step.number}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="relative group"
            >
              {/* Step Number */}
              <div className="absolute -top-4 -left-4 text-6xl md:text-7xl font-display font-bold text-foreground/5 group-hover:text-foreground/10 transition-colors">
                {step.number}
              </div>

              {/* Card */}
              <div className="relative p-6 md:p-8 rounded-3xl bg-card border border-border/50 shadow-soft hover:shadow-card-hover transition-all duration-300 h-full">
                {/* Icon */}
                <div className={`w-14 h-14 md:w-16 md:h-16 rounded-2xl bg-gradient-to-br ${step.gradient} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                  <step.icon className="w-7 h-7 md:w-8 md:h-8 text-primary-foreground" />
                </div>

                {/* Content */}
                <h3 className="text-xl md:text-2xl font-display font-bold text-foreground mb-3">
                  {step.title}
                </h3>
                <p className="text-muted-foreground text-sm md:text-base leading-relaxed">
                  {step.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

