import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";

const PricingSection = () => {
  const navigate = useNavigate();
  const { data: plans } = useQuery({
    queryKey: ["pricing_plans"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("pricing_plans")
        .select("*")
        .order("price");
      if (error) throw error;
      return data;
    },
  });

  return (
    <section id="tarifs" className="py-24">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <p className="text-primary font-semibold tracking-widest uppercase text-sm mb-3">Investis en toi</p>
          <h2 className="font-display text-5xl sm:text-6xl text-gradient-blue">MES FORMULES</h2>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {plans?.map((plan, i) => (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className={`relative bg-card border rounded-lg p-8 flex flex-col ${
                plan.is_popular ? "border-primary glow-blue scale-105" : "border-border"
              }`}
            >
              {plan.is_popular && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-xs font-semibold px-4 py-1 rounded-full">
                  POPULAIRE
                </span>
              )}
              <h3 className="font-display text-3xl text-foreground mb-1">{plan.name}</h3>
              <p className="text-muted-foreground text-sm mb-4">{plan.description}</p>
              <p className="font-display text-5xl text-gradient-blue mb-1">
                {plan.price}€
              </p>
              <p className="text-muted-foreground text-xs mb-6">
                {plan.sessions_count} séance{plan.sessions_count > 1 ? "s" : ""}
              </p>
              <ul className="space-y-3 mb-8 flex-1">
                {plan.features?.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm text-muted-foreground">
                    <Check className="text-primary shrink-0 mt-0.5" size={16} />
                    {f}
                  </li>
                ))}
              </ul>
              <Button
                variant={plan.is_popular ? "hero" : "heroOutline"}
                size="lg"
                className="w-full"
                onClick={() => navigate("/auth")}
              >
                Choisir cette formule
              </Button>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PricingSection;
