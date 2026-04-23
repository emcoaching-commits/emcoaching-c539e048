import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const sessionDetails: Record<string, string> = {
  "Nutrition": "Plan nutritionnel 100% en ligne",
  "Coaching": "Coaching sportif 100% en ligne",
  "Coaching + Nutrition": "L'accompagnement complet en ligne",
};

const PricingSection = () => {
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
          className="text-center mb-12"
        >
          <p className="text-primary font-semibold tracking-widest uppercase text-sm mb-3">Investis en toi</p>
          <h2 className="font-display text-5xl sm:text-6xl text-gradient-blue">MES FORMULES</h2>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {plans?.map((plan, i) => {
            const detail = sessionDetails[plan.name] || "";
            const bgUrl = (plan as any).background_image_url as string | null;
            return (
              <motion.div
                key={plan.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className={`relative overflow-hidden bg-card border rounded-lg p-8 flex flex-col ${
                  plan.is_popular ? "border-primary glow-blue scale-105" : "border-border"
                }`}
              >
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
                <div className="relative z-10 flex flex-col flex-1">
                {plan.is_popular && (
                  <span className="absolute -top-0 left-1/2 -translate-x-1/2 -mt-11 bg-primary text-primary-foreground text-xs font-semibold px-4 py-1 rounded-full z-20">
                    POPULAIRE
                  </span>
                )}
                {/* Spacer pour laisser apparaître l'image en haut quand elle est présente */}
                {bgUrl && <div className="h-32 sm:h-40" />}
                <h3 className="font-display text-3xl text-foreground mb-1 drop-shadow-sm">{plan.name}</h3>
                <p className="text-muted-foreground text-sm mb-4">{plan.description}</p>
                <p className="font-display text-5xl text-gradient-blue mb-0">
                  {plan.price}€
                </p>
                <p className="text-muted-foreground text-xs mb-1">
                  /mois • séances illimitées
                </p>
                {detail && (
                  <p className="text-primary text-xs font-medium mb-6">{detail}</p>
                )}
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
                  onClick={async () => {
                    if ((plan as any).paypal_url) {
                      window.open((plan as any).paypal_url, "_blank", "noopener,noreferrer");
                    } else {
                      toast.error("Lien de paiement indisponible. Contacte Emma.");
                    }
                  }}
                >
                  Prendre cette formule
                </Button>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default PricingSection;
