import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import QuestionnaireSection from "@/components/QuestionnaireSection";
import ReviewsSection from "@/components/ReviewsSection";
import Footer from "@/components/Footer";
import { Apple, Utensils, Dumbbell } from "lucide-react";
import { motion } from "framer-motion";
import PricingPreview from "@/components/PricingPreview";
import MarketingHighlights from "@/components/MarketingHighlights";
import { useIsActiveSubscriber } from "@/hooks/useIsActiveSubscriber";

const PillarsRow = () => {
  const pillars = [
    { icon: Apple, label: "Nutrition", desc: "Plans adaptés à tes objectifs" },
    { icon: Utensils, label: "Alimentation", desc: "Habitudes durables, plaisir intact" },
    { icon: Dumbbell, label: "Sport", desc: "Programmes progressifs & efficaces" },
  ];
  return (
    <section className="relative py-20 overflow-hidden">
      <div className="blob bg-primary/10 w-[420px] h-[420px] -top-32 -left-32" />
      <div className="blob bg-accent/10 w-[380px] h-[380px] -bottom-32 -right-32" />
      <div className="container relative z-10">
        <div className="text-center mb-12">
          <p className="text-primary font-semibold tracking-[0.2em] uppercase text-xs mb-3">Mes 3 piliers</p>
          <h2 className="font-display text-3xl sm:text-4xl text-gradient-blue">UNE APPROCHE COMPLÈTE</h2>
        </div>
        <div className="grid sm:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {pillars.map((p, i) => {
            const Icon = p.icon;
            return (
              <motion.div
                key={p.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.1 }}
                className="group relative flex flex-col items-center text-center gap-4 rounded-2xl border border-border bg-card/60 backdrop-blur-sm p-8 transition-all duration-300 hover:-translate-y-1 hover:border-primary/40 hover:shadow-[0_20px_60px_-20px_hsl(var(--primary)/0.35)]"
              >
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20 border border-primary/30 flex items-center justify-center transition-transform duration-300 group-hover:scale-110">
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
    <div className="min-h-screen bg-gradient-soft">
      <Navbar />
      <HeroSection />
      <div className="section-divider" />
      {/* Aperçu compact des formules — masqué si client déjà abonné */}
      {!isActive && <PricingPreview />}
      {!isActive && <div className="section-divider" />}
      <PillarsRow />
      <div className="section-divider" />
      <MarketingHighlights />
      <div className="section-divider" />
      <QuestionnaireSection />
      <div className="section-divider" />
      <ReviewsSection />
      <Footer />
    </div>
  );
};

export default Index;
