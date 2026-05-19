import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Award, Users, TrendingUp, Heart, ArrowRight } from "lucide-react";
import { useSiteSettings } from "@/hooks/useSiteSettings";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

/**
 * Section "preuve sociale" + accroche problème/solution + CTA fort.
 * Tous les textes sont éditables via site_settings depuis l'admin.
 */
const MarketingHighlights = () => {
  const { data: s } = useSiteSettings();
  const navigate = useNavigate();
  const [isLogged, setIsLogged] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setIsLogged(!!data.session?.user));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, ses) => setIsLogged(!!ses?.user));
    return () => subscription.unsubscribe();
  }, []);

  const accroche = s?.marketing_accroche || "Tu manques de motivation, de résultats, de cadre ? Emma t'accompagne pas à pas avec un programme 100% personnalisé.";
  const stat1Value = s?.marketing_stat1_value || "+150";
  const stat1Label = s?.marketing_stat1_label || "Clientes accompagnées";
  const stat2Value = s?.marketing_stat2_value || "5 ans";
  const stat2Label = s?.marketing_stat2_label || "D'expérience coaching";
  const stat3Value = s?.marketing_stat3_value || "98%";
  const stat3Label = s?.marketing_stat3_label || "De clientes satisfaites";
  const stat4Value = s?.marketing_stat4_value || "6 sem.";
  const stat4Label = s?.marketing_stat4_label || "Pour voir les premiers résultats";

  const result1 = s?.marketing_result1 || "« J'ai perdu 8 kg en 3 mois sans frustration. »";
  const result2 = s?.marketing_result2 || "« Mon corps a complètement changé, et surtout ma confiance. »";
  const result3 = s?.marketing_result3 || "« Le suivi quotidien fait toute la différence. »";

  const ctaText = s?.marketing_cta_text || "Prête à transformer ton corps et ton mindset ?";
  const ctaButton = s?.marketing_cta_button || "Rejoindre le coaching";

  const stats = [
    { icon: Users, value: stat1Value, label: stat1Label },
    { icon: Award, value: stat2Value, label: stat2Label },
    { icon: Heart, value: stat3Value, label: stat3Label },
    { icon: TrendingUp, value: stat4Value, label: stat4Label },
  ];

  return (
    <section className="relative py-24 overflow-hidden">
      <div className="blob blob-float bg-primary/10 w-[500px] h-[500px] top-10 -right-40" />
      <div className="container relative z-10">
        {/* Accroche problème/solution */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-3xl mx-auto text-center mb-14"
        >
          <p className="text-primary font-semibold tracking-widest uppercase text-xs mb-3">
            Pourquoi choisir Emma
          </p>
          <p className="font-display text-2xl sm:text-3xl text-foreground leading-tight">
            {accroche}
          </p>
        </motion.div>

        {/* Chiffres clés */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-5xl mx-auto mb-16">
          {stats.map((stat, i) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.08 }}
                className="group bg-card/70 backdrop-blur-sm border border-border rounded-2xl p-6 text-center transition-all duration-300 hover:-translate-y-1 hover:border-primary/40 hover:shadow-[0_15px_45px_-15px_hsl(var(--primary)/0.35)]"
              >
                <div className="w-14 h-14 mx-auto rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20 border border-primary/20 flex items-center justify-center mb-3 transition-transform duration-300 group-hover:scale-110">
                  <Icon className="text-primary" size={24} />
                </div>
                <p className="font-display text-3xl sm:text-4xl text-gradient-blue mb-1">{stat.value}</p>
                <p className="text-muted-foreground text-xs leading-tight">{stat.label}</p>
              </motion.div>
            );
          })}
        </div>

        {/* Résultats concrets */}
        <div className="grid md:grid-cols-3 gap-4 max-w-5xl mx-auto mb-12">
          {[result1, result2, result3].map((r, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.1 }}
              className="bg-card/70 backdrop-blur-sm border-l-4 border-primary rounded-r-xl p-5 shadow-sm hover:shadow-md transition-shadow"
            >
              <p className="text-foreground italic text-sm leading-relaxed">{r}</p>
            </motion.div>
          ))}
        </div>

        {/* CTA final */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <p className="font-display text-2xl sm:text-3xl text-foreground mb-5">{ctaText}</p>
          <Button
            variant="hero"
            size="lg"
            className="px-10 py-6 text-base"
            onClick={() => navigate(isLogged ? "/tarifs" : "/auth")}
          >
            {ctaButton} <ArrowRight className="ml-2" size={18} />
          </Button>
        </motion.div>
      </div>
    </section>
  );
};

export default MarketingHighlights;
