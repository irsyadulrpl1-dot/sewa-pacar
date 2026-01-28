import { motion } from "framer-motion";
import { Shield, Lock, CreditCard, CheckCircle2 } from "lucide-react";

const indicators = [
  {
    icon: Shield,
    title: "Partner Terverifikasi",
    description: "Semua partner telah melalui proses verifikasi identitas",
    color: "text-mint",
  },
  {
    icon: Lock,
    title: "Privasi & Data Aman",
    description: "Data Anda dilindungi dengan enkripsi tingkat tinggi",
    color: "text-lavender",
  },
  {
    icon: CreditCard,
    title: "Pembayaran Terjamin",
    description: "Sistem pembayaran aman dengan berbagai metode",
    color: "text-pink",
  },
  {
    icon: CheckCircle2,
    title: "Transaksi Transparan",
    description: "Semua transaksi tercatat dan dapat dilacak",
    color: "text-sky",
  },
];

export function TrustIndicators() {
  return (
    <section className="py-12 md:py-16 bg-card/50 border-y border-border/50">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
          {indicators.map((indicator, index) => (
            <motion.div
              key={indicator.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="flex flex-col items-center text-center group"
            >
              <div className={`w-12 h-12 md:w-16 md:h-16 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300 ${
                indicator.color === "text-mint" ? "bg-gradient-to-br from-mint/10 to-mint/5" :
                indicator.color === "text-lavender" ? "bg-gradient-to-br from-lavender/10 to-lavender/5" :
                indicator.color === "text-pink" ? "bg-gradient-to-br from-pink/10 to-pink/5" :
                "bg-gradient-to-br from-sky/10 to-sky/5"
              }`}>
                <indicator.icon className={`w-6 h-6 md:w-8 md:h-8 ${indicator.color}`} />
              </div>
              <h3 className="text-sm md:text-base font-semibold text-foreground mb-2">
                {indicator.title}
              </h3>
              <p className="text-xs md:text-sm text-muted-foreground leading-relaxed">
                {indicator.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

