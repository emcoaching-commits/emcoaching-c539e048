import { motion } from "framer-motion";
import { Apple, Dumbbell, HeartPulse } from "lucide-react";
import { useNavigate } from "react-router-dom";

const formules = [
  {
    slug: "coaching",
    icon: Dumbbell,
    title: "Coaching",
    price: "75€/mois",
    description: "Programme sportif 100% personnalisé et en ligne, adapté à tes objectifs.",
  },
  {
    slug: "nutrition",
    icon: Apple,
    title: "Nutrition",
    price: "75€/mois",
    description: "Plan nutritionnel sur mesure pour optimiser tes résultats au quotidien.",
  },
  {
    slug: "coaching-nutrition",
    icon: HeartPulse,
    title: "Coaching + Nutrition",
    price: "140€/mois",
    tag: "POPULAIRE",
    description: "L'accompagnement complet : sport + alimentation pour une transformation totale.",
  },
];

const ServicesSection = () => {
  const navigate = useNavigate();

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
          <h2 className="font-display text-5xl sm:text-6xl text-gradient-blue">MES FORMULES</h2>
          <p className="text-muted-foreground mt-4 max-w-xl mx-auto">
            Choisis la formule qui te correspond — clique pour en savoir plus.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {formules.map((f, i) => (
            <motion.div
              key={f.slug}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              onClick={() => navigate(`/services/${f.slug}`)}
              className={`relative cursor-pointer group bg-card border rounded-xl p-8 text-center hover:border-primary/60 transition-all duration-300 hover:glow-blue hover:scale-[1.03] ${
                f.tag ? "border-primary glow-blue" : "border-border"
              }`}
            >
              {f.tag && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-xs font-semibold px-4 py-1 rounded-full">
                  {f.tag}
                </span>
              )}
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-5 group-hover:bg-primary/20 transition-colors">
                <f.icon className="text-primary" size={30} />
              </div>
              <h3 className="font-display text-3xl text-foreground mb-2">{f.title}</h3>
              <p className="font-display text-2xl text-gradient-blue mb-3">{f.price}</p>
              <p className="text-muted-foreground text-sm leading-relaxed">{f.description}</p>
              <p className="mt-5 text-primary text-sm font-semibold group-hover:underline">
                En savoir plus →
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ServicesSection;
