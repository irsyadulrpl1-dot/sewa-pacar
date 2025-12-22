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
    title: "Age Verification (18+)",
    description:
      "All users and companions must be 18 years of age or older. Age verification is required for all accounts.",
  },
  {
    icon: Shield,
    title: "Professional Conduct",
    description:
      "All interactions must remain professional and respectful. Companions reserve the right to refuse any request that makes them uncomfortable.",
  },
  {
    icon: Heart,
    title: "Mutual Respect",
    description:
      "Treat all companions with dignity and respect. Harassment, aggressive behavior, or disrespectful language will not be tolerated.",
  },
  {
    icon: Lock,
    title: "Privacy & Discretion",
    description:
      "Personal information is confidential. Photos, contact details, and meeting locations must never be shared publicly.",
  },
];

const allowed = [
  "Event companionship (galas, weddings, parties)",
  "Dining and social outings",
  "Travel companionship",
  "Casual conversation and walks",
  "Business event attendance",
  "Photography shoots (with consent)",
];

const prohibited = [
  "Sexual services of any kind",
  "Illegal activities",
  "Harassment or aggressive behavior",
  "Sharing personal information publicly",
  "Recording without consent",
  "Intoxicated or inappropriate conduct",
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
              Important Information
            </span>
            <h1 className="text-4xl md:text-6xl font-display font-bold text-foreground mt-4">
              Rules & Guidelines
            </h1>
            <p className="text-muted-foreground mt-6 text-lg leading-relaxed">
              To ensure a safe and enjoyable experience for everyone, please 
              familiarize yourself with our terms and guidelines before booking.
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
                  Allowed Services
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
                  Strictly Prohibited
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
                  Important Disclaimer
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  Rendezvous is a professional companion service platform. We do not 
                  offer, promote, or facilitate any form of sexual services. All 
                  companions are independent contractors who provide strictly platonic 
                  companionship services. Any violation of our terms will result in 
                  immediate account termination and potential legal action. By using 
                  our platform, you agree to abide by these rules and understand that 
                  all interactions must remain lawful and respectful.
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
