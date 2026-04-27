import { motion } from "framer-motion";
import { Apple, Dumbbell, HeartPulse } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

const iconMap: Record<string, any> = { Dumbbell, Apple, HeartPulse };

const ServicesSection = () => {
  const navigate = useNavigate();
  // On affiche directement les FORMULES (pricing_plans) avec leurs liens PayPal,
  // pour que "Choisir cette formule" redirige vers le bon lien PayPal en bas.
  const { data: plans } = useQuery({
    queryKey: ["pricing_plans_section"],
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
            Choisis la formule qui te correspond.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto pt-6">
          {plans?.map((plan: any, i: number) => {
            const Icon = iconMap["Dumbbell"];
            const bgUrl = plan.background_image_url as string | null;
            return (
              <motion.div
                key={plan.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className={`relative group bg-card border rounded-xl p-8 text-center transition-all duration-300 ${
                  plan.is_popular ? "border-primary glow-blue" : "border-border"
                }`}
              >
                {plan.is_popular && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-xs font-bold px-4 py-1 rounded-full z-30 shadow-lg shadow-primary/40 whitespace-nowrap">
                    ⭐ POPULAIRE
                  </span>
                )}
                <div className="absolute inset-0 overflow-hidden rounded-xl">
                {bgUrl && (
                  <>
                    <div
                      aria-hidden
                      className="pointer-events-none absolute inset-0 z-0 bg-cover bg-center"
                      style={{ backgroundImage: `url(${bgUrl})` }}
                    />
                    <div
                      aria-hidden
                      className="pointer-events-none absolute inset-0 z-0"
                      style={{
                        background:
                          "linear-gradient(to bottom, transparent 0%, transparent 35%, hsl(var(--card) / 0.85) 70%, hsl(var(--card)) 100%)",
                      }}
                    />
                  </>
                )}
                </div>
                <div className="relative z-10 flex flex-col h-full">
                  {bgUrl && <div className="h-32 sm:h-40" />}
                  {!bgUrl && (
                    <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-5">
                      <Icon className="text-primary" size={30} />
                    </div>
                  )}
                  <h3 className="font-display text-3xl text-foreground mb-2">{plan.name}</h3>
                  <p className="font-display text-2xl text-gradient-blue mb-3">{plan.price}€</p>
                  <p className="text-muted-foreground text-sm leading-relaxed mb-6 flex-1">{plan.description}</p>
                  <div className="flex flex-col gap-2 mt-auto">
                    <Button
                      variant="heroOutline"
                      size="lg"
                      className="w-full"
                      onClick={() => navigate(`/formules/${plan.id}`)}
                    >
                      En savoir plus
                    </Button>
                    <Button
                      variant={plan.is_popular ? "hero" : "default"}
                      size="lg"
                      className="w-full"
                      onClick={() => {
                        if (plan.paypal_url) {
                          window.open(plan.paypal_url, "_blank", "noopener,noreferrer");
                        } else {
                          toast.error("Lien de paiement indisponible. Contacte Emma.");
                        }
                      }}
                    >
                      Choisir cette formule
                    </Button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default ServicesSection;
