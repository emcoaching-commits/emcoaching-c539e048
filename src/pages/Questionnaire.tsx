import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

const options = {
  niveau: ["Débutant(e)", "Intermédiaire", "Avancé(e)"],
  frequence: ["1-2 fois/semaine", "3-4 fois/semaine", "5+ fois/semaine"],
};

const Questionnaire = () => {
  const navigate = useNavigate();
  const [objectifs, setObjectifs] = useState("");
  const [niveau, setNiveau] = useState("");
  const [frequence, setFrequence] = useState("");
  const [blessures, setBlessures] = useState("");
  const [commentaire, setCommentaire] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const check = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { navigate("/auth"); return; }
      const { data: profile } = await supabase.from("profiles").select("has_active_subscription").eq("user_id", user.id).single();
      if (!profile?.has_active_subscription) {
        navigate("/mon-profil");
        toast.error("Tu dois avoir un abonnement actif pour accéder au questionnaire.");
      }
    };
    check();
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    setLoading(true);
    const { error } = await supabase.from("questionnaire_responses").insert({
      user_id: user.id,
      objectifs,
      niveau,
      frequence,
      blessures,
      commentaire,
    });
    if (error) toast.error("Erreur lors de l'envoi");
    else {
      toast.success("Merci ! Emma va analyser tes réponses 💪");
      navigate("/");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg">
        <a href="/" className="font-display text-4xl text-gradient-blue block text-center mb-4">EMMA FIT</a>
        <p className="text-muted-foreground text-center mb-8">Aide Emma à mieux te connaître pour personnaliser ton programme !</p>

        <div className="bg-card border border-border rounded-lg p-8">
          <h2 className="font-display text-3xl text-center mb-6 text-foreground">QUESTIONNAIRE</h2>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="text-foreground text-sm font-medium mb-2 block">Quels sont tes objectifs ? *</label>
              <Textarea
                placeholder="Perte de poids, prise de muscle, bien-être, remise en forme..."
                value={objectifs}
                onChange={(e) => setObjectifs(e.target.value)}
                className="bg-background border-border"
                required
              />
            </div>

            <div>
              <label className="text-foreground text-sm font-medium mb-2 block">Ton niveau sportif ? *</label>
              <div className="flex gap-2 flex-wrap">
                {options.niveau.map((n) => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => setNiveau(n)}
                    className={`px-4 py-2 rounded-lg border text-sm transition-all ${
                      niveau === n
                        ? "bg-primary text-primary-foreground border-primary"
                        : "bg-background text-muted-foreground border-border hover:border-primary/40"
                    }`}
                  >
                    {n}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-foreground text-sm font-medium mb-2 block">Fréquence d'entraînement souhaitée ? *</label>
              <div className="flex gap-2 flex-wrap">
                {options.frequence.map((f) => (
                  <button
                    key={f}
                    type="button"
                    onClick={() => setFrequence(f)}
                    className={`px-4 py-2 rounded-lg border text-sm transition-all ${
                      frequence === f
                        ? "bg-primary text-primary-foreground border-primary"
                        : "bg-background text-muted-foreground border-border hover:border-primary/40"
                    }`}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-foreground text-sm font-medium mb-2 block">Blessures ou problèmes de santé ?</label>
              <Textarea
                placeholder="Décris tes éventuelles blessures ou limitations..."
                value={blessures}
                onChange={(e) => setBlessures(e.target.value)}
                className="bg-background border-border"
              />
            </div>

            <div>
              <label className="text-foreground text-sm font-medium mb-2 block">Autre chose à partager ?</label>
              <Textarea
                placeholder="Disponibilités, préférences, motivations..."
                value={commentaire}
                onChange={(e) => setCommentaire(e.target.value)}
                className="bg-background border-border"
              />
            </div>

            <Button variant="hero" size="lg" className="w-full" disabled={loading || !objectifs || !niveau || !frequence}>
              {loading ? "Envoi..." : "Envoyer mes réponses"}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Questionnaire;
