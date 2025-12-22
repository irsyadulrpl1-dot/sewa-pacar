import { motion } from "framer-motion";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import {
  Shield,
  AlertTriangle,
  UserCheck,
  Heart,
  Lock,
  CheckCircle,
  XCircle,
} from "lucide-react";

const rules = [
  {
    icon: UserCheck,
    title: "Wajib 18+ Ya!",
    description:
      "Semua pengguna dan teman wajib berusia 18 tahun ke atas. Nggak ada pengecualian, ini penting banget!",
  },
  {
    icon: Shield,
    title: "Jaga Sikap",
    description:
      "Semua interaksi harus tetap profesional dan sopan. Teman berhak menolak permintaan yang bikin nggak nyaman.",
  },
  {
    icon: Heart,
    title: "Saling Respect",
    description:
      "Perlakukan semua teman dengan hormat. Pelecehan, perilaku agresif, atau bahasa kasar nggak akan ditoleransi.",
  },
  {
    icon: Lock,
    title: "Privasi Terjaga",
    description:
      "Info pribadi itu rahasia. Foto, kontak, dan lokasi pertemuan nggak boleh disebarin ke publik.",
  },
];

const allowed = [
  "Teman acara (pesta, nikahan, gathering)",
  "Teman makan dan hangout",
  "Teman traveling",
  "Ngobrol santai dan jalan-jalan",
  "Teman event bisnis",
  "Partner foto (dengan persetujuan)",
];

const prohibited = [
  "Layanan seksual dalam bentuk apapun",
  "Aktivitas ilegal",
  "Pelecehan atau perilaku agresif",
  "Sebar info pribadi ke publik",
  "Rekam tanpa izin",
  "Mabuk atau perilaku nggak pantas",
];

const Rules = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Header */}
      <section className="pt-32 pb-12">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center max-w-3xl mx-auto"
          >
            <span className="text-primary font-medium text-sm tracking-wider uppercase">
              Info Penting
            </span>
            <h1 className="text-4xl md:text-6xl font-display font-bold text-foreground mt-4">
              Aturan Main
            </h1>
            <p className="text-muted-foreground mt-6 text-lg leading-relaxed">
              Biar semua senang dan aman, baca dulu ya aturan mainnya sebelum booking. 
              Ini penting banget lho! 👇
            </p>
          </motion.div>
        </div>
      </section>

      {/* Main Rules */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {rules.map((rule, index) => (
              <motion.div
                key={rule.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="p-8 bg-card rounded-xl border border-border"
              >
                <div className="w-14 h-14 rounded-lg bg-primary/10 flex items-center justify-center mb-6">
                  <rule.icon className="w-7 h-7 text-primary" />
                </div>
                <h3 className="text-xl font-display font-semibold text-foreground mb-3">
                  {rule.title}
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  {rule.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Allowed vs Prohibited */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Allowed */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="p-8 bg-card rounded-xl border border-border"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-lg bg-[hsl(142,70%,45%)]/10 flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-[hsl(142,70%,45%)]" />
                </div>
                <h3 className="text-2xl font-display font-semibold text-foreground">
                  Yang Boleh ✅
                </h3>
              </div>
              <ul className="space-y-4">
                {allowed.map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <CheckCircle
                      size={20}
                      className="text-[hsl(142,70%,45%)] mt-0.5 shrink-0"
                    />
                    <span className="text-muted-foreground">{item}</span>
                  </li>
                ))}
              </ul>
            </motion.div>

            {/* Prohibited */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="p-8 bg-card rounded-xl border border-border"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-lg bg-destructive/10 flex items-center justify-center">
                  <XCircle className="w-6 h-6 text-destructive" />
                </div>
                <h3 className="text-2xl font-display font-semibold text-foreground">
                  Yang Nggak Boleh ❌
                </h3>
              </div>
              <ul className="space-y-4">
                {prohibited.map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <XCircle
                      size={20}
                      className="text-destructive mt-0.5 shrink-0"
                    />
                    <span className="text-muted-foreground">{item}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Disclaimer */}
      <section className="py-12 pb-24">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="p-8 bg-crimson/10 border border-crimson/30 rounded-xl"
          >
            <div className="flex items-start gap-4">
              <AlertTriangle className="w-8 h-8 text-crimson shrink-0" />
              <div>
                <h3 className="text-xl font-display font-semibold text-foreground mb-3">
                  Disclaimer Penting! ⚠️
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  TemanKu adalah platform layanan teman profesional. Kami TIDAK menyediakan, 
                  mempromosikan, atau memfasilitasi layanan seksual dalam bentuk apapun. 
                  Semua teman adalah kontraktor independen yang menyediakan layanan pertemanan 
                  platonis. Pelanggaran akan mengakibatkan penutupan akun permanen dan 
                  kemungkinan tindakan hukum. Dengan menggunakan platform kami, kamu setuju 
                  untuk mematuhi aturan ini dan memahami bahwa semua interaksi harus tetap 
                  sah dan penuh hormat.
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Rules;
