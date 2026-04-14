import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight, LogIn, UserPlus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

const HeroSection = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setUser(data.session?.user ?? null));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => setUser(session?.user ?? null));
    return () => subscription.unsubscribe();
  }, []);

  return (
    <section id="accueil" className="relative min-h-screen flex items-center overflow-hidden bg-background">
      <div className="container relative z-10 pt-24">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="flex flex-col md:flex-row items-center justify-center gap-8 md:gap-12"
        >
          {/* Logo à côté du texte */}
          <motion.img
            src="/hero-logo.png"
            alt="Berlin Emma Coaché"
            className="w-48 h-48 sm:w-64 sm:h-64 md:w-80 md:h-80 rounded-full object-cover shadow-2xl"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          />

          <div className="text-center md:text-left max-w-xl">
            <p className="text-primary font-semibold tracking-widest uppercase text-sm mb-4">Coach Sportive Certifiée</p>
            <h1 className="font-display text-5xl sm:text-7xl md:text-8xl leading-[0.9] mb-6">
              TRANSFORME<br />
              <span className="text-gradient-blue">TON CORPS</span><br />
              TON MINDSET
            </h1>
            <p className="text-muted-foreground text-lg max-w-md mx-auto md:mx-0 mb-8 font-light leading-relaxed">
              Coaching personnalisé, suivi sur Google Sheets, bilans hebdomadaires. Emma est là, présente à chaque étape.
            </p>

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
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default HeroSection;
