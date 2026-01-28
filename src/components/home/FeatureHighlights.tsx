import { motion } from "framer-motion";
import { Calendar, CreditCard, BarChart3, History } from "lucide-react";

const highlights = [
  {
    icon: Calendar,
    title: "Booking Real-time",
    description: "Sistem booking yang cepat dan real-time, langsung terkonfirmasi",
  },
  {
    icon: CreditCard,
    title: "Pembayaran Multi-step",
    description: "Proses pembayaran yang aman dengan berbagai metode pembayaran",
  },
  {
    icon: BarChart3,
    title: "Dashboard User & Partner",
    description: "Kelola semua aktivitas dengan mudah melalui dashboard yang intuitif",
  },
  {
    icon: History,
    title: "Riwayat Pesanan",
    description: "Akses riwayat pesanan lengkap dengan detail transaksi",
  },
];

export function FeatureHighlights() {
  return (
    <section className="py-20 md:py-32 bg-gradient-to-b from-card/30 to-background">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="inline-flex items-center gap-2 text-primary font-medium text-xs md:text-sm tracking-wider uppercase bg-lavender/10 px-4 py-2 rounded-full mb-4">
            Fitur Utama
          </span>
          <h2 className="text-3xl md:text-5xl font-display font-bold text-foreground mb-4">
            Fitur <span className="text-gradient">Lengkap</span> untuk Pengalaman Terbaik
          </h2>
          <p className="text-muted-foreground text-base md:text-lg max-w-2xl mx-auto">
            Semua yang Anda butuhkan dalam satu platform
          </p>
        </motion.div>

        {/* Highlights Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
          {highlights.map((highlight, index) => (
            <motion.div
              key={highlight.title}
              initial={{ opacity: 0, x: index % 2 === 0 ? -30 : 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="flex gap-6 p-6 md:p-8 rounded-3xl bg-card border border-border/50 shadow-soft hover:shadow-card-hover transition-all duration-300"
            >
              <div className="flex-shrink-0 w-14 h-14 md:w-16 md:h-16 rounded-2xl bg-gradient-to-br from-lavender to-pink flex items-center justify-center">
                <highlight.icon className="w-7 h-7 md:w-8 md:h-8 text-primary-foreground" />
              </div>
              <div>  
                <h3 className="text-xl md:text-2xl font-display font-bold text-foreground mb-2">
                  {highlight.title}
                </h3>
                <p className="text-muted-foreground text-sm md:text-base leading-relaxed">
                  {highlight.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

