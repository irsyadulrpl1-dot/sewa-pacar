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
  ChevronDown,
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
    question: "How do I book a companion?",
    answer:
      "Browse our companion profiles, select your preferred companion, and click the 'Book via WhatsApp' button. You'll be connected directly to arrange the details of your booking including date, time, and duration.",
  },
  {
    question: "What payment methods do you accept?",
    answer:
      "Payment is arranged directly between you and the companion. Most companions accept bank transfer, PayPal, or cash. Payment terms are discussed during the booking process.",
  },
  {
    question: "Can I cancel or reschedule a booking?",
    answer:
      "Yes, but please provide at least 24 hours notice. Cancellation policies may vary by companion, so please discuss this during booking. Late cancellations may incur a fee.",
  },
  {
    question: "Are the companions verified?",
    answer:
      "Yes, all companions undergo a thorough verification process including identity verification, background checks, and personal interviews. We prioritize safety for both clients and companions.",
  },
  {
    question: "Is the service confidential?",
    answer:
      "Absolutely. We take privacy very seriously. All personal information is kept strictly confidential and is never shared with third parties. Discretion is one of our core values.",
  },
  {
    question: "What areas do you cover?",
    answer:
      "Our companions are located in major cities across the United States including New York, Los Angeles, San Francisco, Miami, and more. Contact us for availability in your area.",
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
      title: "Message Sent",
      description: "We'll get back to you within 24 hours.",
    });
    setFormData({ name: "", email: "", subject: "", message: "" });
  };

  const handleWhatsAppClick = () => {
    const message = encodeURIComponent("Hi! I have a question about your companion services.");
    window.open(`https://wa.me/1234567890?text=${message}`, "_blank");
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
              Get in Touch
            </span>
            <h1 className="text-4xl md:text-6xl font-display font-bold text-foreground mt-4">
              Contact & Support
            </h1>
            <p className="text-muted-foreground mt-6 text-lg">
              Have questions? We're here to help. Reach out via WhatsApp for 
              the fastest response.
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
                Fastest way to reach us
              </p>
              <Button variant="whatsapp" onClick={handleWhatsAppClick}>
                Chat Now
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
                For detailed inquiries
              </p>
              <a
                href="mailto:support@rendezvous.com"
                className="text-primary hover:underline"
              >
                support@rendezvous.com
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
                Response Time
              </h3>
              <p className="text-muted-foreground text-sm mb-4">
                We aim to respond within
              </p>
              <p className="text-foreground font-semibold">2-4 hours</p>
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
                Send a Message
              </h2>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Name</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      placeholder="Your name"
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
                      placeholder="your@email.com"
                      required
                      className="mt-2 bg-card border-border"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="subject">Subject</Label>
                  <Input
                    id="subject"
                    value={formData.subject}
                    onChange={(e) =>
                      setFormData({ ...formData, subject: e.target.value })
                    }
                    placeholder="How can we help?"
                    required
                    className="mt-2 bg-card border-border"
                  />
                </div>
                <div>
                  <Label htmlFor="message">Message</Label>
                  <Textarea
                    id="message"
                    value={formData.message}
                    onChange={(e) =>
                      setFormData({ ...formData, message: e.target.value })
                    }
                    placeholder="Tell us more..."
                    rows={5}
                    required
                    className="mt-2 bg-card border-border resize-none"
                  />
                </div>
                <Button variant="gold" size="lg" type="submit">
                  Send Message
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
                Frequently Asked Questions
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
