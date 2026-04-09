import { motion } from "framer-motion";
import { CheckCircle2 } from "lucide-react";

const points = [
  "Spécialiste en transformation physique",
  "Approche bienveillante et motivante",
  "Suivi personnalisé et régulier",
];

const AboutSection = () => {
  return (
    <section id="propos" className="py-24">
      <div className="container">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <p className="text-primary font-semibold tracking-widest uppercase text-sm mb-3">À propos</p>
            <h2 className="font-display text-5xl sm:text-6xl mb-6 text-gradient-blue">QUI SUIS-JE ?</h2>
            <p className="text-muted-foreground leading-relaxed mb-6">
              Je suis Emma, coach sportive passionnée depuis plus de 8 ans. Mon objectif : t'aider à te dépasser, retrouver confiance en toi et atteindre tes objectifs fitness, que ce soit la perte de poids, la prise de muscle ou simplement te sentir mieux dans ton corps.
            </p>
            <div className="space-y-3 mb-8">
              {points.map((p) => (
                <div key={p} className="flex items-center gap-3">
                  <CheckCircle2 className="text-primary shrink-0" size={20} />
                  <span className="text-foreground text-sm">{p}</span>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="grid grid-cols-3 gap-4"
          >
            {stats.map((s) => (
              <div key={s.label} className="bg-card border border-border rounded-lg p-6 text-center glow-blue">
                <p className="font-display text-4xl text-gradient-blue mb-1">{s.value}</p>
                <p className="text-muted-foreground text-xs">{s.label}</p>
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
