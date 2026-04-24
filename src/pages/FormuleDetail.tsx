import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { ArrowLeft, Check } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const FormuleDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const { data: plan, isLoading } = useQuery({
    queryKey: ["pricing_plan", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("pricing_plans")
        .select("*")
        .eq("id", id!)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });

  const { data: media } = useQuery({
    queryKey: ["pricing_plan_media", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("pricing_plan_media")
        .select("*")
        .eq("pricing_plan_id", id!)
        .order("position");
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="pt-32 text-center">
          <p className="text-muted-foreground">Chargement...</p>
        </div>
      </div>
    );
  }

  if (!plan) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="pt-32 text-center container">
          <h1 className="font-display text-4xl text-foreground mb-4">Formule introuvable</h1>
          <Button variant="hero" onClick={() => navigate("/services")}>Retour aux formules</Button>
        </div>
        <Footer />
      </div>
    );
  }

  const handleChoose = () => {
    if (plan.paypal_url) {
      window.open(plan.paypal_url, "_blank", "noopener,noreferrer");
    } else {
      toast.error("Lien de paiement indisponible. Contacte Emma.");
    }
  };

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
            <ArrowLeft size={16} className="mr-2" /> Retour aux formules
          </Button>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            {plan.background_image_url && (
              <img
                src={plan.background_image_url}
                alt={plan.name}
                className="w-full max-h-80 object-cover rounded-xl mb-8"
              />
            )}

            <p className="text-primary font-semibold tracking-widest uppercase text-sm mb-2">Formule</p>
            <h1 className="font-display text-5xl sm:text-6xl text-gradient-blue mb-4">{plan.name}</h1>
            <p className="font-display text-4xl text-primary mb-6">{plan.price}€</p>

            {plan.description && (
              <div className="bg-card border border-border rounded-xl p-8 mb-8">
                <p className="text-foreground leading-relaxed text-base">{plan.description}</p>
              </div>
            )}

            {(plan as any).long_description && (
              <div className="bg-card border border-border rounded-xl p-8 mb-8">
                <p className="text-foreground leading-relaxed text-base whitespace-pre-line">
                  {(plan as any).long_description}
                </p>
              </div>
            )}

            {((plan as any).includes?.length > 0 || (plan.features && plan.features.length > 0)) && (
              <>
                <h2 className="font-display text-3xl text-foreground mb-4">Ce qui est inclus</h2>
                <ul className="space-y-3 mb-10">
                  {(((plan as any).includes?.length > 0 ? (plan as any).includes : plan.features) as string[]).map((item: string) => (
                    <li key={item} className="flex items-start gap-3 text-muted-foreground">
                      <Check className="text-primary shrink-0 mt-0.5" size={18} />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </>
            )}

            {(plan as any).details?.length > 0 && (
              <>
                <h2 className="font-display text-3xl text-foreground mb-4">Comment ça fonctionne</h2>
                <div className="space-y-4 mb-10">
                  {((plan as any).details as string[]).map((step: string, i: number) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.4, delay: i * 0.1 }}
                      className="flex gap-4"
                    >
                      <span className="font-display text-2xl text-primary shrink-0 w-8">{i + 1}.</span>
                      <p className="text-muted-foreground leading-relaxed">{step}</p>
                    </motion.div>
                  ))}
                </div>
              </>
            )}

            {media && media.length > 0 && (
              <>
                <h2 className="font-display text-3xl text-foreground mb-4">En images</h2>
                <div className="grid grid-cols-2 gap-4 mb-10">
                  {media.map((m: any) => (
                    <div key={m.id} className="rounded-xl overflow-hidden border border-border aspect-square bg-muted">
                      {m.type === "video" ? (
                        <video src={m.url} controls className="w-full h-full object-cover" />
                      ) : (
                        <img src={m.url} alt="" className="w-full h-full object-cover" />
                      )}
                    </div>
                  ))}
                </div>
              </>
            )}

            <div className="text-center">
              <Button
                variant={plan.is_popular ? "hero" : "heroOutline"}
                size="lg"
                onClick={handleChoose}
                className="text-lg px-10"
              >
                Choisir cette formule
              </Button>
            </div>
          </motion.div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default FormuleDetail;
