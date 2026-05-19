import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

/**
 * Aperçu compact des formules — affiché en haut de l'accueil, au-dessus
 * des 3 piliers. La section détaillée "MES FORMULES" reste plus bas.
 */
const PricingPreview = () => {
  const navigate = useNavigate();
  const { data: plans } = useQuery({
    queryKey: ["pricing_plans_preview"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("pricing_plans")
        .select("id,name,price,is_popular,paypal_url,description")
        .order("price");
      if (error) throw error;
      return data;
    },
  });

  if (!plans || plans.length === 0) return null;

  return (
    <section className="py-12 bg-background">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-8"
        >
          <p className="text-primary font-semibold tracking-widest uppercase text-xs mb-2">
            Choisis ta formule en 1 clic
          </p>
          <h2 className="font-display text-3xl sm:text-4xl text-gradient-blue">
            COMMENCE MAINTENANT
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-4xl mx-auto">
          {plans.map((plan: any, i: number) => (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.08 }}
              className={`card-hover group relative bg-card border rounded-xl p-5 flex flex-col items-center text-center ${
                plan.is_popular ? "border-primary glow-blue" : "border-border"
              }`}
            >
              {plan.is_popular && (
                <span className="absolute -top-2 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-[10px] font-bold px-3 py-0.5 rounded-full whitespace-nowrap">
                  ⭐ POPULAIRE
                </span>
              )}
              <h3 className="font-display text-xl text-foreground mb-1">{plan.name}</h3>
              <p className="font-display text-3xl text-gradient-blue mb-3">{plan.price}€</p>
              <div className="flex flex-col gap-2 w-full mt-auto">
                <Button
                  variant="heroOutline"
                  size="sm"
                  className="w-full"
                  onClick={() => navigate(`/formules/${plan.id}`)}
                >
                  En savoir plus
                </Button>
                <Button
                  variant={plan.is_popular ? "hero" : "default"}
                  size="sm"
                  className="w-full"
                  onClick={() => {
                    if (plan.paypal_url) {
                      window.open(plan.paypal_url, "_blank", "noopener,noreferrer");
                    } else {
                      toast.error("Lien de paiement indisponible. Contacte Emma.");
                    }
                  }}
                >
                  Choisir <ArrowRight size={14} />
                </Button>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="text-center mt-6">
          <button
            onClick={() => navigate("/tarifs")}
            className="text-primary text-sm font-medium hover:underline"
          >
            Voir le détail des formules
          </button>
        </div>
      </div>
    </section>
  );
};

export default PricingPreview;
