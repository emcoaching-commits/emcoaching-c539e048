import { motion } from "framer-motion";
import { Dumbbell, Users, Apple, Video } from "lucide-react";

import { motion } from "framer-motion";
import { Dumbbell, Apple, Video, Heart } from "lucide-react";

const services = [
  {
    icon: Dumbbell,
    title: "Coaching Individuel",
    description: "Séances personnalisées adaptées à tes objectifs et ton niveau. Suivi complet de ta progression.",
  },
  {
    icon: Apple,
    title: "Plan Nutritionnel",
    description: "Conseils alimentaires sur mesure pour optimiser tes résultats et adopter de bonnes habitudes.",
  },
  {
    icon: Video,
    title: "Coaching en Ligne",
    description: "Programmes d'entraînement à distance avec suivi vidéo et ajustements en temps réel.",
  },
  {
    icon: Heart,
    title: "Suivi & Motivation",
    description: "Accompagnement continu pour rester motivée et progresser à ton rythme. Bilan régulier.",
  },
];

const ServicesSection = () => {
  return (
    <section id="services" className="py-24 bg-gradient-dark">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <p className="text-primary font-semibold tracking-widest uppercase text-sm mb-3">Ce que je propose</p>
          <h2 className="font-display text-5xl sm:text-6xl text-gradient-blue">MES SERVICES</h2>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {services.map((s, i) => (
            <motion.div
              key={s.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="group bg-card border border-border rounded-lg p-6 hover:border-primary/40 transition-all duration-300 hover:glow-blue"
            >
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                <s.icon className="text-primary" size={24} />
              </div>
              <h3 className="font-display text-2xl mb-2 text-foreground">{s.title}</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">{s.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ServicesSection;
