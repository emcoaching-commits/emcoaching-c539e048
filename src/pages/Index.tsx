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
import { useSiteSettings } from "@/hooks/useSiteSettings";
import WelcomePopup from "@/components/WelcomePopup";
import InfoPopupsBanner from "@/components/InfoPopupsBanner";
import FloatingIcons from "@/components/FloatingIcons";

const PillarsRow = () => {
  const { data: s } = useSiteSettings();
  const pillars = [
    { icon: Apple, label: s?.pillar1_label || "Nutrition", desc: s?.pillar1_desc || "Plans adaptés à tes objectifs" },
    { icon: Utensils, label: s?.pillar2_label || "Alimentation", desc: s?.pillar2_desc || "Habitudes durables, plaisir intact" },
    { icon: Dumbbell, label: s?.pillar3_label || "Sport", desc: s?.pillar3_desc || "Programmes progressifs & efficaces" },
  ];
  const kicker = s?.pillars_kicker || "Mes 3 piliers";
  const title = s?.pillars_title || "UNE APPROCHE COMPLÈTE";
  return (
    <section className="relative py-20 overflow-hidden">
      <div className="blob blob-float bg-primary/10 w-[420px] h-[420px] -top-32 -left-32" />
      <div className="blob blob-float-slow bg-accent/10 w-[380px] h-[380px] -bottom-32 -right-32" />
      <div className="container relative z-10">
        <div className="text-center mb-12">
          <p className="text-primary font-semibold tracking-[0.2em] uppercase text-xs mb-3">{kicker}</p>
          <h2 className="font-display text-3xl sm:text-4xl text-gradient-blue">{title}</h2>
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
                className="card-hover group relative flex flex-col items-center text-center gap-4 rounded-2xl border border-border bg-card/60 backdrop-blur-sm p-8"
              >
                <div className="icon-hover w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20 border border-primary/30 flex items-center justify-center float-y" style={{ animationDelay: `${i * 0.8}s` }}>
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
    <div className="min-h-screen bg-gradient-soft relative">
      <FloatingIcons />
      <div className="relative z-10">
        <WelcomePopup />
        <InfoPopupsBanner />
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
    </div>
  );
};

export default Index;
