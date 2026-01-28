import { MobileLayout } from "@/components/MobileLayout";
import { motion } from "framer-motion";
import { Info as InfoIcon, Shield, HelpCircle, Compass, Flame, Calendar, CreditCard, MessageCircle, Bell, UserCog, CheckCircle2, XCircle } from "lucide-react";

export default function Info() {
  return (
    <MobileLayout>
      <div className="container mx-auto px-4 py-6 max-w-3xl">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center gap-2 mb-2">
            <InfoIcon className="w-5 h-5 text-primary" />
            <h1 className="text-lg font-semibold text-foreground">Informasi Aplikasi</h1>
          </div>
          <p className="text-sm text-muted-foreground">
            Pusat informasi resmi untuk memahami platform, fitur, dan kebijakan. Konten dikelola oleh Admin, pengguna hanya dapat membaca.
          </p>
        </motion.div>

        <div className="mt-6 space-y-6">
          <motion.section initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <h2 className="text-base font-semibold text-foreground flex items-center gap-2 mb-2">
              <InfoIcon className="w-4 h-4 text-primary" />
              Tentang Aplikasi
            </h2>
            <div className="space-y-2 text-sm text-muted-foreground">
              <p>Aplikasi ini membantu kamu menemukan partner hangout yang cocok untuk berbagai momen.</p>
              <p>Tujuan utama: memudahkan jelajahi profil, atur jadwal, dan berkomunikasi dengan aman.</p>
              <p>Dapat digunakan oleh pengguna 18+ yang ingin pengalaman sosial yang nyaman dan terukur.</p>
            </div>
          </motion.section>

          <motion.section initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <h2 className="text-base font-semibold text-foreground flex items-center gap-2 mb-2">
              <Compass className="w-4 h-4 text-primary" />
              Cara Kerja Aplikasi
            </h2>
            <ol className="space-y-2 text-sm text-muted-foreground list-decimal list-inside">
              <li>Daftar akun</li>
              <li>Jelajahi profil</li>
              <li>Booking</li>
              <li>Pembayaran</li>
              <li>Validasi admin</li>
            </ol>
          </motion.section>

          <motion.section initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <h2 className="text-base font-semibold text-foreground flex items-center gap-2 mb-3">
              <Flame className="w-4 h-4 text-primary" />
              Fitur Utama
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="flex items-center gap-2 rounded-xl border border-border/50 bg-card p-3">
                <Compass className="w-4 h-4 text-primary" />
                <div>
                  <p className="text-sm font-medium text-foreground">Jelajahi & Trending</p>
                  <p className="text-xs text-muted-foreground">Cari profil dan lihat yang sedang naik daun</p>
                </div>
              </div>
              <div className="flex items-center gap-2 rounded-xl border border-border/50 bg-card p-3">
                <Calendar className="w-4 h-4 text-primary" />
                <div>
                  <p className="text-sm font-medium text-foreground">Booking & Jadwal</p>
                  <p className="text-xs text-muted-foreground">Atur rencana hangout sesuai ketersediaan</p>
                </div>
              </div>
              <div className="flex items-center gap-2 rounded-xl border border-border/50 bg-card p-3">
                <CreditCard className="w-4 h-4 text-primary" />
                <div>
                  <p className="text-sm font-medium text-foreground">Pembayaran</p>
                  <p className="text-xs text-muted-foreground">COD, Transfer Bank, E-money</p>
                </div>
              </div>
              <div className="flex items-center gap-2 rounded-xl border border-border/50 bg-card p-3">
                <MessageCircle className="w-4 h-4 text-primary" />
                <div>
                  <p className="text-sm font-medium text-foreground">Chat & Notifikasi</p>
                  <p className="text-xs text-muted-foreground">Komunikasi cepat dan update status</p>
                </div>
              </div>
              <div className="flex items-center gap-2 rounded-xl border border-border/50 bg-card p-3">
                <UserCog className="w-4 h-4 text-primary" />
                <div>
                  <p className="text-sm font-medium text-foreground">Pengaturan Akun</p>
                  <p className="text-xs text-muted-foreground">Kelola profil, privasi, dan preferensi</p>
                </div>
              </div>
            </div>
          </motion.section>

          <motion.section initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <h2 className="text-base font-semibold text-foreground flex items-center gap-2 mb-2">
              <Shield className="w-4 h-4 text-primary" />
              Keamanan & Kenyamanan
            </h2>
            <ul className="space-y-2 text-sm text-muted-foreground list-disc list-inside">
              <li>Verifikasi akun</li>
              <li>Moderasi konten</li>
              <li>Validasi pembayaran oleh admin</li>
            </ul>
          </motion.section>

          <motion.section initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <h2 className="text-base font-semibold text-foreground flex items-center gap-2 mb-2">
              <CheckCircle2 className="w-4 h-4 text-primary" />
              Syarat & Ketentuan Singkat
            </h2>
            <ul className="space-y-2 text-sm text-muted-foreground list-disc list-inside">
              <li>Batas usia: 18+</li>
              <li>Aturan penggunaan yang wajar dan bertanggung jawab</li>
              <li>Larangan penyalahgunaan konten dan layanan</li>
            </ul>
          </motion.section>

          <motion.section initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <h2 className="text-base font-semibold text-foreground flex items-center gap-2 mb-2">
              <HelpCircle className="w-4 h-4 text-primary" />
              Bantuan & Kontak
            </h2>
            <div className="space-y-2 text-sm text-muted-foreground">
              <p>FAQ singkat tersedia untuk membantu memahami fitur.</p>
              <p>Hubungi Admin/Support melalui halaman Kontak.</p>
            </div>
          </motion.section>
        </div>
      </div>
    </MobileLayout>
  );
}
