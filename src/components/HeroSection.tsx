import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight, LogIn, UserPlus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useSiteSettings } from "@/hooks/useSiteSettings";
import { assetWithBase } from "@/lib/app-paths";

const HeroSection = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const { data: settings } = useSiteSettings();

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setUser(data.session?.user ?? null));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => setUser(session?.user ?? null));
    return () => subscription.unsubscribe();
  }, []);

  const kicker = settings?.hero_kicker || "Coach Sportive Certifiée";
  const line1 = settings?.hero_title_line1 || "TRANSFORME";
  const line2 = settings?.hero_title_line2 || "TON CORPS";
  const line3 = settings?.hero_title_line3 || "TON MINDSET";
  const description = settings?.hero_description || "Coaching personnalisé, suivi sur Google Sheets, bilans hebdomadaires. Emma est là, présente à chaque étape.";
  const heroLogo = settings?.hero_logo_url || assetWithBase("hero-logo.png");

  return (
    <section id="accueil" className="relative min-h-screen flex items-center overflow-hidden bg-background">
      <div className="container relative z-10 pt-24">
        <motion.div
          initial="hidden"
          animate="show"
          variants={{
            hidden: {},
            show: { transition: { staggerChildren: 0.15, delayChildren: 0.1 } },
          }}
          className="flex flex-col md:flex-row items-center justify-center gap-8 md:gap-12"
        >
          {/* Logo à côté du texte */}
          <motion.img
            src={heroLogo}
            alt="Em' Coaching"
            className="w-48 h-48 sm:w-64 sm:h-64 md:w-80 md:h-80 rounded-3xl object-cover shadow-2xl"
            variants={{
              hidden: { opacity: 0, scale: 0.85, rotate: -3 },
              show: { opacity: 1, scale: 1, rotate: 0, transition: { duration: 0.9, ease: "easeOut" } },
            }}
          />

          <motion.div
            className="text-center md:text-left max-w-xl"
            variants={{
              hidden: {},
              show: { transition: { staggerChildren: 0.12 } },
            }}
          >
            <motion.p
              variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { duration: 0.6 } } }}
              className="text-primary font-semibold tracking-widest uppercase text-sm mb-4"
            >{kicker}</motion.p>
            <motion.h1
              variants={{ hidden: { opacity: 0, y: 30 }, show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: "easeOut" } } }}
              className="font-display text-5xl sm:text-7xl md:text-8xl leading-[0.9] mb-6"
            >
              {line1}<br />
              <span className="text-gradient-blue">{line2}</span><br />
              {line3}
            </motion.h1>
            <motion.p
              variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { duration: 0.6 } } }}
              className="text-muted-foreground text-lg max-w-md mx-auto md:mx-0 mb-8 font-light leading-relaxed"
            >
              {description}
            </motion.p>

            <motion.div
              variants={{ hidden: { opacity: 0, y: 15 }, show: { opacity: 1, y: 0, transition: { duration: 0.5 } } }}
            >
            {user ? (
              <div className="flex flex-wrap justify-center md:justify-start gap-4">
                <Button variant="hero" size="lg" className="px-8 py-6 text-base" onClick={() => window.open("https://forms.gle/fjX1G24EuvHMu7W99", "_blank")}>
                  Remplir le questionnaire <ArrowRight className="ml-2" size={18} />
                </Button>
                <Button variant="heroOutline" size="lg" className="px-8 py-6 text-base" onClick={() => navigate("/mon-profil")}>
                  Mon profil
                </Button>
              </div>
            ) : (
              <div className="flex flex-wrap justify-center md:justify-start gap-4">
                <Button variant="hero" size="lg" className="px-8 py-6 text-base animate-pulse" onClick={() => navigate("/auth")}>
                  <UserPlus className="mr-2" size={18} /> S'inscrire gratuitement
                </Button>
                <Button variant="heroOutline" size="lg" className="px-8 py-6 text-base" onClick={() => navigate("/auth")}>
                  <LogIn className="mr-2" size={18} /> Se connecter
                </Button>
              </div>
            )}
            </motion.div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

export default HeroSection;
