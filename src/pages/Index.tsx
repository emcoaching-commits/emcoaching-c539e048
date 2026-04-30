import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import QuestionnaireSection from "@/components/QuestionnaireSection";
import ReviewsSection from "@/components/ReviewsSection";
import Footer from "@/components/Footer";
import { Apple, Utensils, Dumbbell } from "lucide-react";
import { motion } from "framer-motion";
import PricingPreview from "@/components/PricingPreview";
import ServicesSection from "@/components/ServicesSection";
import MarketingHighlights from "@/components/MarketingHighlights";
import { useIsActiveSubscriber } from "@/hooks/useIsActiveSubscriber";

const PillarsRow = () => {
  const pillars = [
    { icon: Apple, label: "Nutrition", desc: "Plans adaptés à tes objectifs" },
    { icon: Utensils, label: "Alimentation", desc: "Habitudes durables, plaisir intact" },
    { icon: Dumbbell, label: "Sport", desc: "Programmes progressifs & efficaces" },
  ];
  return (
    <section className="py-16 border-y border-border bg-card/30">
      <div className="container">
        <div className="grid sm:grid-cols-3 gap-6 max-w-4xl mx-auto">
          {pillars.map((p, i) => {
            const Icon = p.icon;
            return (
              <motion.div
                key={p.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.1 }}
                className="flex flex-col items-center text-center gap-3"
              >
                <div className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                  <Icon className="text-primary" size={28} />
                </div>
                <h3 className="font-display text-2xl text-foreground">{p.label}</h3>
                <p className="text-muted-foreground text-sm">{p.desc}</p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

const Index = () => {
  const { isActive } = useIsActiveSubscriber();
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <HeroSection />
      {/* Aperçu compact des formules — masqué si client déjà abonné */}
      {!isActive && <PricingPreview />}
      <PillarsRow />
      <MarketingHighlights />
      {/* Section formules détaillée — masquée si client déjà abonné */}
      {!isActive && <ServicesSection />}
      <QuestionnaireSection />
      <ReviewsSection />
      <Footer />
    </div>
  );
};

export default Index;
