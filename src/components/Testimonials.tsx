import { motion } from "framer-motion";
import { Star, Quote } from "lucide-react";

interface Testimonial {
  id: string;
  name: string;
  rating: number;
  message: string;
  date: string;
}

const testimonials: Testimonial[] = [
  {
    id: "1",
    name: "Michael R.",
    rating: 5,
    message: "An absolutely wonderful experience. My companion was charming, witty, and made my business dinner so much more enjoyable. Highly professional service.",
    date: "December 2024",
  },
  {
    id: "2",
    name: "Sarah L.",
    rating: 5,
    message: "I was nervous attending my friend's wedding alone. My companion was the perfect plus-one – graceful, engaging, and made me feel completely at ease.",
    date: "November 2024",
  },
  {
    id: "3",
    name: "David K.",
    rating: 5,
    message: "The travel companion service exceeded my expectations. Exploring the city with someone knowledgeable and pleasant made my trip unforgettable.",
    date: "November 2024",
  },
];

export function Testimonials() {
  return (
    <section className="py-24 bg-gradient-to-b from-background to-card">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="text-primary font-medium text-sm tracking-wider uppercase">
            Testimonials
          </span>
          <h2 className="text-4xl md:text-5xl font-display font-bold text-foreground mt-4">
            What Our Clients Say
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={testimonial.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.15 }}
              className="relative bg-card border border-border rounded-xl p-8 hover:border-primary/30 transition-all duration-300"
            >
              <Quote className="absolute top-6 right-6 w-10 h-10 text-primary/20" />
              
              {/* Rating */}
              <div className="flex gap-1 mb-4">
                {Array.from({ length: testimonial.rating }).map((_, i) => (
                  <Star key={i} size={16} className="text-primary fill-primary" />
                ))}
              </div>

              {/* Message */}
              <p className="text-muted-foreground leading-relaxed mb-6">
                "{testimonial.message}"
              </p>

              {/* Author */}
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-foreground">{testimonial.name}</p>
                  <p className="text-sm text-muted-foreground">{testimonial.date}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
