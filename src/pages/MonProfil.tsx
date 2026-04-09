import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { ClipboardList } from "lucide-react";

const MonProfil = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState<any>(null);
  const [form, setForm] = useState({
    full_name: "",
    phone: "",
    age: "",
    city: "",
    weight: "",
    height: "",
    gender: "",
  });

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { navigate("/auth"); return; }
      const { data } = await supabase.from("profiles").select("*").eq("user_id", user.id).single();
      if (data) {
        setProfile(data);
        setForm({
          full_name: data.full_name || "",
          phone: data.phone || "",
          age: data.age?.toString() || "",
          city: data.city || "",
          weight: data.weight?.toString() || "",
          height: data.height?.toString() || "",
          gender: data.gender || "",
        });
      }
      setLoading(false);
    };
    load();
  }, [navigate]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { error } = await supabase.from("profiles").update({
      full_name: form.full_name || null,
      phone: form.phone || null,
      age: form.age ? parseInt(form.age) : null,
      city: form.city || null,
      weight: form.weight ? parseFloat(form.weight) : null,
      height: form.height ? parseFloat(form.height) : null,
      gender: form.gender || null,
    }).eq("user_id", user.id);
    if (error) toast.error("Erreur lors de la sauvegarde");
    else toast.success("Profil mis à jour !");
    setSaving(false);
  };

  if (loading) return <div className="min-h-screen bg-background flex items-center justify-center text-foreground">Chargement...</div>;

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg">
        <a href="/" className="font-display text-4xl text-gradient-blue block text-center mb-4">EM' COACHING</a>
        <p className="text-muted-foreground text-center mb-8">Complete ton profil pour qu'Emma puisse te connaître</p>

        <div className="bg-card border border-border rounded-lg p-8">
          <h2 className="font-display text-3xl text-center mb-6 text-foreground">MON PROFIL</h2>

          <form onSubmit={handleSave} className="space-y-4">
            <Input placeholder="Nom complet" value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} className="bg-background border-border" />
            <Input type="tel" placeholder="Téléphone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="bg-background border-border" />
            <div className="grid grid-cols-2 gap-3">
              <Input type="number" placeholder="Âge" value={form.age} onChange={(e) => setForm({ ...form, age: e.target.value })} className="bg-background border-border" />
              <Input placeholder="Ville" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} className="bg-background border-border" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Input type="number" placeholder="Poids (kg)" step="0.1" value={form.weight} onChange={(e) => setForm({ ...form, weight: e.target.value })} className="bg-background border-border" />
              <Input type="number" placeholder="Taille (cm)" value={form.height} onChange={(e) => setForm({ ...form, height: e.target.value })} className="bg-background border-border" />
            </div>
            <div>
              <label className="text-foreground text-sm font-medium mb-2 block">Sexe</label>
              <div className="flex gap-2">
                {["Homme", "Femme", "Autre"].map((g) => (
                  <button
                    key={g}
                    type="button"
                    onClick={() => setForm({ ...form, gender: g })}
                    className={`px-4 py-2 rounded-lg border text-sm transition-all ${
                      form.gender === g
                        ? "bg-primary text-primary-foreground border-primary"
                        : "bg-background text-muted-foreground border-border hover:border-primary/40"
                    }`}
                  >
                    {g}
                  </button>
                ))}
              </div>
            </div>

            <Button variant="hero" size="lg" className="w-full" disabled={saving}>
              {saving ? "Sauvegarde..." : "Enregistrer"}
            </Button>
          </form>

          {/* Questionnaire link - only if subscription active */}
          {profile?.has_active_subscription && (
            <div className="mt-6 p-4 rounded-lg bg-primary/10 border border-primary/30 text-center">
              <p className="text-foreground text-sm font-medium mb-2">📋 Remplis le questionnaire pour personnaliser ton programme !</p>
              <Button variant="hero" size="lg" onClick={() => window.open("https://forms.gle/fjX1G24EuvHMu7W99", "_blank")}>
                <ClipboardList size={18} className="mr-2" /> Remplir le questionnaire
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MonProfil;
