import { useParams, useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Check, ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";

const servicesData: Record<string, {
  title: string;
  price: string;
  subtitle: string;
  intro: string;
  includes: string[];
  details: string[];
}> = {
  coaching: {
    title: "Coaching Sportif",
    price: "75€/mois",
    subtitle: "Programme sportif 100% personnalisé et en ligne",
    intro: "Emma conçoit un programme d'entraînement adapté à ton niveau, tes objectifs et ton emploi du temps. Chaque exercice est pensé pour toi — pas de copier-coller, que du sur-mesure.",
    includes: [
      "Programme sportif sur mesure",
      "Suivi via Google Sheets partagé",
      "Bilan hebdomadaire avec Emma",
      "Questionnaire Google Forms",
      "RDV planifiés via Google Agenda",
      "Ajustements toutes les 6 semaines",
    ],
    details: [
      "Emma analyse ton questionnaire initial pour comprendre ton niveau, tes contraintes et tes objectifs.",
      "Un programme d'entraînement personnalisé est créé et partagé via Google Sheets — tu y retrouves tes exercices, séries, répétitions et notes.",
      "Chaque semaine, un bilan est fait ensemble pour ajuster le programme selon tes progrès et ton ressenti.",
      "Toutes les 6 semaines, le programme est entièrement renouvelé pour continuer à progresser et éviter la routine.",
    ],
  },
  nutrition: {
    title: "Plan Nutritionnel",
    price: "75€/mois",
    subtitle: "Plan alimentaire personnalisé pour des résultats durables",
    intro: "Emma crée un plan nutritionnel adapté à tes goûts, ton mode de vie et tes objectifs. Pas de régime restrictif, mais de vraies habitudes alimentaires saines et durables.",
    includes: [
      "Plan nutritionnel personnalisé",
      "Suivi via Google Sheets partagé",
      "Bilan hebdomadaire avec Emma",
      "Questionnaire Google Forms",
      "RDV planifiés via Google Agenda",
      "Ajustements toutes les 6 semaines",
    ],
    details: [
      "Après avoir rempli le questionnaire, Emma étudie tes habitudes alimentaires actuelles et tes préférences.",
      "Un plan nutritionnel est créé spécialement pour toi, avec des menus et des conseils pratiques adaptés à ton quotidien.",
      "Chaque semaine, un point est fait pour adapter le plan selon tes résultats et ton ressenti.",
      "Toutes les 6 semaines, le plan évolue pour accompagner ta progression et maintenir ta motivation.",
    ],
  },
  "coaching-nutrition": {
    title: "Coaching + Nutrition",
    price: "140€/mois",
    subtitle: "L'accompagnement complet pour une transformation totale",
    intro: "La formule complète ! Emma t'accompagne sur le sport ET la nutrition pour maximiser tes résultats. C'est la formule la plus populaire car elle offre un suivi global et cohérent.",
    includes: [
      "Programme sportif + nutrition",
      "Suivi complet via Google Sheets",
      "Bilans hebdomadaires",
      "Questionnaire Google Forms",
      "RDV planifiés via Google Agenda",
      "Ajustements toutes les 6 semaines",
      "Accompagnement prioritaire",
    ],
    details: [
      "Tu bénéficies à la fois d'un programme sportif et d'un plan nutritionnel, tous deux personnalisés et complémentaires.",
      "Emma coordonne les deux aspects pour que ton alimentation soutienne parfaitement ton entraînement.",
      "Le suivi hebdomadaire couvre le sport et la nutrition pour un accompagnement complet.",
      "Avec la formule complète, tu bénéficies d'un accompagnement prioritaire — Emma est encore plus présente pour toi.",
    ],
  },
};

const ServiceDetail = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const service = servicesData[slug || ""];

  if (!service) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="pt-32 text-center container">
          <h1 className="font-display text-4xl text-foreground mb-4">Service introuvable</h1>
          <Button variant="hero" onClick={() => navigate("/services")}>
            Retour aux services
          </Button>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-24 pb-16">
        <div className="container max-w-3xl">
          <Button
            variant="ghost"
            className="mb-8 text-muted-foreground hover:text-foreground"
            onClick={() => navigate("/services")}
          >
            <ArrowLeft size={16} className="mr-2" /> Retour aux services
          </Button>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <p className="text-primary font-semibold tracking-widest uppercase text-sm mb-2">Formule</p>
            <h1 className="font-display text-5xl sm:text-6xl text-gradient-blue mb-2">{service.title}</h1>
            <p className="font-display text-3xl text-primary mb-4">{service.price}</p>
            <p className="text-muted-foreground text-lg mb-8">{service.subtitle}</p>

            <div className="bg-card border border-border rounded-xl p-8 mb-8">
              <p className="text-foreground leading-relaxed text-base">{service.intro}</p>
            </div>

            <h2 className="font-display text-3xl text-foreground mb-4">Ce qui est inclus</h2>
            <ul className="space-y-3 mb-10">
              {service.includes.map((item) => (
                <li key={item} className="flex items-start gap-3 text-muted-foreground">
                  <Check className="text-primary shrink-0 mt-0.5" size={18} />
                  <span>{item}</span>
                </li>
              ))}
            </ul>

            <h2 className="font-display text-3xl text-foreground mb-4">Comment ça fonctionne</h2>
            <div className="space-y-4 mb-10">
              {service.details.map((detail, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, delay: i * 0.1 }}
                  className="flex gap-4"
                >
                  <span className="font-display text-2xl text-primary shrink-0 w-8">{i + 1}.</span>
                  <p className="text-muted-foreground leading-relaxed">{detail}</p>
                </motion.div>
              ))}
            </div>

            <div className="text-center">
              <Button variant="hero" size="lg" onClick={() => navigate("/auth")} className="text-lg px-10">
                Commencer maintenant
              </Button>
              <p className="text-muted-foreground text-sm mt-3">Programme renouvelé toutes les 6 semaines</p>
            </div>
          </motion.div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default ServiceDetail;
