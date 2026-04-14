import { motion } from "framer-motion";
import { Apple, Dumbbell, HeartPulse } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const iconMap: Record<string, any> = { Dumbbell, Apple, HeartPulse };

const ServicesSection = () => {
  const navigate = useNavigate();
  const { data: services } = useQuery({
    queryKey: ["services"],
    queryFn: async () => {
      const { data, error } = await supabase.from("services").select("*").order("position");
      if (error) throw error;
      return data;
    },
  });

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
          {services?.map((s, i) => {
            const Icon = iconMap[s.icon || "Dumbbell"] || Dumbbell;
            return (
              <motion.div
                key={s.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                onClick={() => navigate(`/services/${s.slug}`)}
                className={`relative cursor-pointer group bg-card border rounded-xl p-8 text-center hover:border-primary/60 transition-all duration-300 hover:glow-blue hover:scale-[1.03] ${
                  s.is_popular ? "border-primary glow-blue" : "border-border"
                }`}
              >
                {s.is_popular && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-xs font-semibold px-4 py-1 rounded-full">
                    POPULAIRE
                  </span>
                )}
                {s.image_url ? (
                  <img src={s.image_url} alt={s.title} className="w-20 h-20 rounded-full object-cover mx-auto mb-5" />
                ) : (
                  <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-5 group-hover:bg-primary/20 transition-colors">
                    <Icon className="text-primary" size={30} />
                  </div>
                )}
                <h3 className="font-display text-3xl text-foreground mb-2">{s.title}</h3>
                <p className="font-display text-2xl text-gradient-blue mb-3">{s.price}</p>
                <p className="text-muted-foreground text-sm leading-relaxed">{s.description}</p>
                <p className="mt-5 text-primary text-sm font-semibold group-hover:underline">
                  En savoir plus →
                </p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default ServicesSection;
