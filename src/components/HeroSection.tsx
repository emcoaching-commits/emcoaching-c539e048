import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import heroImage from "@/assets/hero-fitness.jpg";

const HeroSection = () => {
  return (
    <section id="accueil" className="relative min-h-screen flex items-center overflow-hidden">
      {/* Background image */}
      <div className="absolute inset-0">
        <img src={heroImage} alt="Coaching sportif" width={1920} height={1080} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-r from-background via-background/90 to-background/40" />
      </div>

      <div className="container relative z-10 pt-24">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="max-w-2xl"
        >
          <p className="text-primary font-semibold tracking-widest uppercase text-sm mb-4">Coach Sportive Certifiée</p>
          <h1 className="font-display text-6xl sm:text-8xl leading-[0.9] mb-6">
            TRANSFORME<br />
            <span className="text-gradient-blue">TON CORPS</span><br />
            TON MINDSET
          </h1>
          <p className="text-muted-foreground text-lg max-w-md mb-8 font-light leading-relaxed">
            Coaching personnalisé pour atteindre tes objectifs. Programmes sur mesure, suivi continu et motivation sans faille.
          </p>
          <div className="flex flex-wrap gap-4">
            <Button variant="hero" size="lg" className="px-8 py-6 text-base">
              Commencer maintenant <ArrowRight className="ml-2" size={18} />
            </Button>
            <Button variant="heroOutline" size="lg" className="px-8 py-6 text-base">
              Découvrir mes services
            </Button>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default HeroSection;
