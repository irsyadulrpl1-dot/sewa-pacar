import { motion } from "framer-motion";
import { useState } from "react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  MessageCircle,
  Mail,
  Clock,
} from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useToast } from "@/hooks/use-toast";

const faqs = [
  {
    question: "Gimana cara booking teman?",
    answer:
      "Gampang banget! Cari teman yang kamu suka, klik profil mereka, terus klik tombol 'Booking via WhatsApp'. Nanti langsung terhubung buat atur jadwal dan detail lainnya.",
  },
  {
    question: "Pembayarannya gimana?",
    answer:
      "Pembayaran langsung ke teman yang kamu booking ya. Biasanya bisa transfer bank, e-wallet, atau cash. Detail pembayaran bisa didiskusikan pas booking.",
  },
  {
    question: "Bisa cancel atau reschedule nggak?",
    answer:
      "Bisa dong! Tapi kasih tau minimal 24 jam sebelumnya ya. Kebijakan cancel bisa beda-beda tiap teman, jadi pastiin diskusi waktu booking.",
  },
  {
    question: "Teman-temannya verified nggak?",
    answer:
      "Tentu! Semua teman udah melewati proses verifikasi termasuk cek identitas dan wawancara. Keamanan itu prioritas utama kami! 🔒",
  },
  {
    question: "Rahasianya aman nggak?",
    answer:
      "100% aman! Kami sangat menjaga privasi. Info pribadi nggak akan dibagi ke pihak ketiga. Diskresi itu nilai utama kami.",
  },
  {
    question: "Layanannya ada di kota mana aja?",
    answer:
      "Saat ini kami ada di Jakarta, Bandung, Surabaya, Yogyakarta, dan beberapa kota besar lainnya. Hubungi kami untuk cek ketersediaan di kotamu!",
  },
];

const Contact = () => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "Pesan Terkirim! 🎉",
      description: "Kami akan balas dalam 24 jam ya.",
    });
    setFormData({ name: "", email: "", subject: "", message: "" });
  };

  const handleWhatsAppClick = () => {
    const message = encodeURIComponent("Hai! Aku mau tanya-tanya tentang layanan TemanKu dong.");
    window.open(`https://wa.me/6281234567890?text=${message}`, "_blank");
  };

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
              Ada Pertanyaan?
            </span>
            <h1 className="text-4xl md:text-6xl font-display font-bold text-foreground mt-4">
              Hubungi Kami
            </h1>
            <p className="text-muted-foreground mt-6 text-lg">
              Ada pertanyaan atau butuh bantuan? Langsung chat aja lewat WhatsApp, 
              respon paling cepat! 💬
            </p>
          </motion.div>
        </div>
      </section>

      {/* Contact Options */}
      <section className="py-8">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="p-8 bg-card rounded-xl border border-border text-center hover:border-primary/30 transition-colors"
            >
              <div className="w-14 h-14 rounded-full bg-[hsl(142,70%,45%)]/10 flex items-center justify-center mx-auto mb-4">
                <MessageCircle className="w-7 h-7 text-[hsl(142,70%,45%)]" />
              </div>
              <h3 className="text-lg font-display font-semibold text-foreground mb-2">
                WhatsApp
              </h3>
              <p className="text-muted-foreground text-sm mb-4">
                Respon paling cepet!
              </p>
              <Button variant="whatsapp" onClick={handleWhatsAppClick}>
                Chat Sekarang
              </Button>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="p-8 bg-card rounded-xl border border-border text-center hover:border-primary/30 transition-colors"
            >
              <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <Mail className="w-7 h-7 text-primary" />
              </div>
              <h3 className="text-lg font-display font-semibold text-foreground mb-2">
                Email
              </h3>
              <p className="text-muted-foreground text-sm mb-4">
                Buat pertanyaan detail
              </p>
              <a
                href="mailto:halo@temanku.id"
                className="text-primary hover:underline"
              >
                halo@temanku.id
              </a>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="p-8 bg-card rounded-xl border border-border text-center hover:border-primary/30 transition-colors"
            >
              <div className="w-14 h-14 rounded-full bg-crimson/10 flex items-center justify-center mx-auto mb-4">
                <Clock className="w-7 h-7 text-crimson" />
              </div>
              <h3 className="text-lg font-display font-semibold text-foreground mb-2">
                Waktu Respon
              </h3>
              <p className="text-muted-foreground text-sm mb-4">
                Kami usahakan secepat mungkin
              </p>
              <p className="text-foreground font-semibold">2-4 jam</p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Contact Form & FAQ */}
      <section className="py-8 pb-24">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Contact Form */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl font-display font-bold text-foreground mb-6">
                Kirim Pesan
              </h2>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Nama</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      placeholder="Nama kamu"
                      required
                      className="mt-2 bg-card border-border"
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) =>
                        setFormData({ ...formData, email: e.target.value })
                      }
                      placeholder="email@kamu.com"
                      required
                      className="mt-2 bg-card border-border"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="subject">Subjek</Label>
                  <Input
                    id="subject"
                    value={formData.subject}
                    onChange={(e) =>
                      setFormData({ ...formData, subject: e.target.value })
                    }
                    placeholder="Mau tanya apa nih?"
                    required
                    className="mt-2 bg-card border-border"
                  />
                </div>
                <div>
                  <Label htmlFor="message">Pesan</Label>
                  <Textarea
                    id="message"
                    value={formData.message}
                    onChange={(e) =>
                      setFormData({ ...formData, message: e.target.value })
                    }
                    placeholder="Ceritain lebih detail..."
                    rows={5}
                    required
                    className="mt-2 bg-card border-border resize-none"
                  />
                </div>
                <Button variant="gold" size="lg" type="submit">
                  Kirim Pesan
                </Button>
              </form>
            </motion.div>

            {/* FAQ */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl font-display font-bold text-foreground mb-6">
                Pertanyaan Umum (FAQ)
              </h2>
              <Accordion type="single" collapsible className="space-y-4">
                {faqs.map((faq, index) => (
                  <AccordionItem
                    key={index}
                    value={`item-${index}`}
                    className="bg-card border border-border rounded-lg px-6"
                  >
                    <AccordionTrigger className="text-left font-medium text-foreground hover:no-underline">
                      {faq.question}
                    </AccordionTrigger>
                    <AccordionContent className="text-muted-foreground">
                      {faq.answer}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </motion.div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Contact;
