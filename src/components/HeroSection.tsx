import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight, LogIn, UserPlus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import heroImage from "@/assets/hero-fitness.jpg";

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
        <div className="flex flex-col md:flex-row items-center gap-8 md:gap-16">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="max-w-2xl flex-1"
          >
            <p className="text-primary font-semibold tracking-widest uppercase text-sm mb-4">Coach Sportive Certifiée</p>
            <h1 className="font-display text-6xl sm:text-8xl leading-[0.9] mb-6">
              TRANSFORME<br />
              <span className="text-gradient-blue">TON CORPS</span><br />
              TON MINDSET
            </h1>
            <p className="text-muted-foreground text-lg max-w-md mb-8 font-light leading-relaxed">
              Coaching personnalisé, suivi sur Google Sheets, bilans hebdomadaires. Emma est là, présente à chaque étape.
            </p>

            {user ? (
              <div className="flex flex-wrap gap-4">
                <Button variant="hero" size="lg" className="px-8 py-6 text-base" onClick={() => window.open("https://forms.gle/fjX1G24EuvHMu7W99", "_blank")}>
                  Remplir le questionnaire <ArrowRight className="ml-2" size={18} />
                </Button>
                <Button variant="heroOutline" size="lg" className="px-8 py-6 text-base" onClick={() => navigate("/mon-profil")}>
                  Mon profil
                </Button>
              </div>
            ) : (
              <div className="flex flex-wrap gap-4">
                <Button variant="hero" size="lg" className="px-8 py-6 text-base animate-pulse" onClick={() => navigate("/auth")}>
                  <UserPlus className="mr-2" size={18} /> S'inscrire gratuitement
                </Button>
                <Button variant="heroOutline" size="lg" className="px-8 py-6 text-base" onClick={() => navigate("/auth")}>
                  <LogIn className="mr-2" size={18} /> Se connecter
                </Button>
              </div>
            )}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }}
            className="flex-shrink-0"
          >
            <img src={heroImage} alt="Coach Emma Berlin" className="w-64 h-64 sm:w-80 sm:h-80 md:w-96 md:h-96 object-contain rounded-full" />
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
