import { useParams, useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Check, ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const ServiceDetail = () => {
  const { slug } = useParams();
  const navigate = useNavigate();

  const { data: service, isLoading } = useQuery({
    queryKey: ["service", slug],
    queryFn: async () => {
      const { data, error } = await supabase.from("services").select("*").eq("slug", slug).single();
      if (error) throw error;
      return data;
    },
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="pt-32 text-center"><p className="text-muted-foreground">Chargement...</p></div>
      </div>
    );
  }

  if (!service) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="pt-32 text-center container">
          <h1 className="font-display text-4xl text-foreground mb-4">Service introuvable</h1>
          <Button variant="hero" onClick={() => navigate("/services")}>Retour aux formules</Button>
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
          <Button variant="ghost" className="mb-8 text-muted-foreground hover:text-foreground" onClick={() => navigate("/services")}>
            <ArrowLeft size={16} className="mr-2" /> Retour aux formules
          </Button>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            {service.image_url && (
              <img src={service.image_url} alt={service.title} className="w-full max-h-80 object-cover rounded-xl mb-8" />
            )}

            <p className="text-primary font-semibold tracking-widest uppercase text-sm mb-2">Formule</p>
            <h1 className="font-display text-5xl sm:text-6xl text-gradient-blue mb-2">{service.title}</h1>
            <p className="font-display text-3xl text-primary mb-4">{service.price}</p>
            <p className="text-muted-foreground text-lg mb-8">{service.subtitle}</p>

            {service.intro && (
              <div className="bg-card border border-border rounded-xl p-8 mb-8">
                <p className="text-foreground leading-relaxed text-base">{service.intro}</p>
              </div>
            )}

            {service.includes && service.includes.length > 0 && (
              <>
                <h2 className="font-display text-3xl text-foreground mb-4">Ce qui est inclus</h2>
                <ul className="space-y-3 mb-10">
                  {service.includes.map((item: string) => (
                    <li key={item} className="flex items-start gap-3 text-muted-foreground">
                      <Check className="text-primary shrink-0 mt-0.5" size={18} />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </>
            )}

            {service.details && service.details.length > 0 && (
              <>
                <h2 className="font-display text-3xl text-foreground mb-4">Comment ça fonctionne</h2>
                <div className="space-y-4 mb-10">
                  {service.details.map((detail: string, i: number) => (
                    <motion.div key={i} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.4, delay: i * 0.1 }} className="flex gap-4">
                      <span className="font-display text-2xl text-primary shrink-0 w-8">{i + 1}.</span>
                      <p className="text-muted-foreground leading-relaxed">{detail}</p>
                    </motion.div>
                  ))}
                </div>
              </>
            )}

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
