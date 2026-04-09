import { useState, useEffect, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { ClipboardList, User, MapPin, Phone, Ruler, Weight, Calendar, ArrowLeft, Sparkles, Save, ChevronRight, Send, MessageCircle } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { ScrollArea } from "@/components/ui/scroll-area";

const MonProfil = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(false);
  const [profile, setProfile] = useState<any>(null);
  const [userEmail, setUserEmail] = useState("");
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
      setUserEmail(user.email || "");
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
        // Auto open edit if profile is incomplete
        if (!data.full_name || !data.age || !data.city) setEditing(true);
      } else {
        setEditing(true);
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
    const updateData = {
      full_name: form.full_name || null,
      phone: form.phone || null,
      age: form.age ? parseInt(form.age) : null,
      city: form.city || null,
      weight: form.weight ? parseFloat(form.weight) : null,
      height: form.height ? parseFloat(form.height) : null,
      gender: form.gender || null,
    };
    const { error } = await supabase.from("profiles").update(updateData).eq("user_id", user.id);
    if (error) toast.error("Erreur lors de la sauvegarde");
    else {
      toast.success("Profil mis à jour ! 💪");
      setProfile({ ...profile, ...updateData });
      setEditing(false);
    }
    setSaving(false);
  };

  const firstName = form.full_name?.split(" ")[0] || "Coach";
  const initials = form.full_name
    ? form.full_name.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2)
    : "?";

  const completionPercent = [form.full_name, form.phone, form.age, form.city, form.weight, form.height, form.gender]
    .filter(Boolean).length / 7 * 100;

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1 }} className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-background to-accent/10" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,hsl(var(--primary)/0.15),transparent_60%)]" />
        <div className="container relative z-10 pt-8 pb-16">
          <Link to="/" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-8">
            <ArrowLeft size={16} /> Retour
          </Link>

          <div className="flex flex-col sm:flex-row items-center sm:items-end gap-6">
            {/* Avatar */}
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="relative"
            >
              <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg shadow-primary/25">
                <span className="font-display text-3xl text-primary-foreground">{initials}</span>
              </div>
              {profile?.has_active_subscription && (
                <div className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-green-500 border-2 border-background flex items-center justify-center">
                  <Sparkles size={14} className="text-white" />
                </div>
              )}
            </motion.div>

            <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.1 }} className="text-center sm:text-left">
              <h1 className="font-display text-4xl sm:text-5xl text-foreground">
                Salut {firstName} 👋
              </h1>
              <p className="text-muted-foreground mt-1">{userEmail}</p>
              {profile?.created_at && (
                <p className="text-muted-foreground text-xs mt-1">Membre depuis {format(new Date(profile.created_at), "MMMM yyyy")}</p>
              )}
            </motion.div>
          </div>
        </div>
      </div>

      <div className="container -mt-6 pb-16">
        <div className="grid md:grid-cols-3 gap-6">

          {/* Left column - Status cards */}
          <div className="space-y-4">
            {/* Subscription status */}
            <motion.div
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className={`rounded-xl p-5 border ${
                profile?.has_active_subscription
                  ? "bg-green-500/10 border-green-500/30"
                  : "bg-card border-border"
              }`}
            >
              <div className="flex items-center gap-3 mb-2">
                <div className={`w-3 h-3 rounded-full ${profile?.has_active_subscription ? "bg-green-500 animate-pulse" : "bg-muted-foreground"}`} />
                <span className="text-foreground font-medium text-sm">
                  {profile?.has_active_subscription ? "Abonnement actif" : "Pas d'abonnement"}
                </span>
              </div>
              {!profile?.has_active_subscription && (
                <p className="text-muted-foreground text-xs">Contacte Emma pour souscrire à une formule.</p>
              )}
            </motion.div>

            {/* Profile completion */}
            <motion.div
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="bg-card border border-border rounded-xl p-5"
            >
              <p className="text-foreground text-sm font-medium mb-3">Profil complété</p>
              <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-primary to-accent rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${completionPercent}%` }}
                  transition={{ duration: 1, delay: 0.5 }}
                />
              </div>
              <p className="text-muted-foreground text-xs mt-2">{Math.round(completionPercent)}% — {completionPercent < 100 ? "Continue à remplir tes infos !" : "Parfait ! 🎉"}</p>
            </motion.div>

            {/* Quick stats */}
            {(form.weight || form.height) && (
              <motion.div
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="bg-card border border-border rounded-xl p-5 grid grid-cols-2 gap-4"
              >
                {form.weight && (
                  <div>
                    <p className="text-muted-foreground text-xs mb-1">Poids</p>
                    <p className="text-foreground font-display text-2xl">{form.weight}<span className="text-muted-foreground text-sm ml-1">kg</span></p>
                  </div>
                )}
                {form.height && (
                  <div>
                    <p className="text-muted-foreground text-xs mb-1">Taille</p>
                    <p className="text-foreground font-display text-2xl">{form.height}<span className="text-muted-foreground text-sm ml-1">cm</span></p>
                  </div>
                )}
              </motion.div>
            )}
          </div>

          {/* Right column - Profile form + questionnaire */}
          <div className="md:col-span-2 space-y-6">

            {/* Questionnaire CTA - only if subscription active */}
            {profile?.has_active_subscription && (
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="relative overflow-hidden rounded-xl border border-primary/30 bg-gradient-to-r from-primary/10 via-primary/5 to-accent/10 p-6"
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
                <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center shrink-0">
                    <ClipboardList size={24} className="text-primary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-foreground font-display text-xl mb-1">QUESTIONNAIRE PERSONNALISÉ</h3>
                    <p className="text-muted-foreground text-sm">Remplis le questionnaire pour qu'Emma puisse créer ton programme sur-mesure !</p>
                  </div>
                  <Button
                    variant="hero"
                    size="lg"
                    className="shrink-0"
                    onClick={() => window.open("https://forms.gle/fjX1G24EuvHMu7W99", "_blank")}
                  >
                    Remplir <ChevronRight size={16} className="ml-1" />
                  </Button>
                </div>
              </motion.div>
            )}

            {/* Profile card */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="bg-card border border-border rounded-xl overflow-hidden"
            >
              <div className="flex items-center justify-between p-5 border-b border-border">
                <h2 className="font-display text-2xl text-foreground">MES INFORMATIONS</h2>
                {!editing && (
                  <Button variant="heroOutline" size="sm" onClick={() => setEditing(true)}>
                    Modifier
                  </Button>
                )}
              </div>

              {editing ? (
                <form onSubmit={handleSave} className="p-5 space-y-4">
                  <div>
                    <label className="text-muted-foreground text-xs mb-1.5 block flex items-center gap-1.5"><User size={12} /> Nom complet</label>
                    <Input placeholder="Ton nom complet" value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} className="bg-background border-border" />
                  </div>
                  <div>
                    <label className="text-muted-foreground text-xs mb-1.5 block flex items-center gap-1.5"><Phone size={12} /> Téléphone</label>
                    <Input type="tel" placeholder="06 XX XX XX XX" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="bg-background border-border" />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-muted-foreground text-xs mb-1.5 block flex items-center gap-1.5"><Calendar size={12} /> Âge</label>
                      <Input type="number" placeholder="25" value={form.age} onChange={(e) => setForm({ ...form, age: e.target.value })} className="bg-background border-border" />
                    </div>
                    <div>
                      <label className="text-muted-foreground text-xs mb-1.5 block flex items-center gap-1.5"><MapPin size={12} /> Ville</label>
                      <Input placeholder="Paris" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} className="bg-background border-border" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-muted-foreground text-xs mb-1.5 block flex items-center gap-1.5"><Weight size={12} /> Poids (kg)</label>
                      <Input type="number" placeholder="70" step="0.1" value={form.weight} onChange={(e) => setForm({ ...form, weight: e.target.value })} className="bg-background border-border" />
                    </div>
                    <div>
                      <label className="text-muted-foreground text-xs mb-1.5 block flex items-center gap-1.5"><Ruler size={12} /> Taille (cm)</label>
                      <Input type="number" placeholder="175" value={form.height} onChange={(e) => setForm({ ...form, height: e.target.value })} className="bg-background border-border" />
                    </div>
                  </div>
                  <div>
                    <label className="text-muted-foreground text-xs mb-2 block">Sexe</label>
                    <div className="flex gap-2">
                      {["Homme", "Femme", "Autre"].map((g) => (
                        <button
                          key={g}
                          type="button"
                          onClick={() => setForm({ ...form, gender: g })}
                          className={`flex-1 px-4 py-2.5 rounded-lg border text-sm font-medium transition-all ${
                            form.gender === g
                              ? "bg-primary text-primary-foreground border-primary shadow-lg shadow-primary/25"
                              : "bg-background text-muted-foreground border-border hover:border-primary/40"
                          }`}
                        >
                          {g}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex gap-3 pt-2">
                    <Button variant="hero" size="lg" className="flex-1" disabled={saving}>
                      <Save size={16} className="mr-2" />
                      {saving ? "Sauvegarde..." : "Enregistrer"}
                    </Button>
                    {profile?.full_name && (
                      <Button variant="heroOutline" size="lg" type="button" onClick={() => setEditing(false)}>
                        Annuler
                      </Button>
                    )}
                  </div>
                </form>
              ) : (
                <div className="p-5 space-y-4">
                  {[
                    { icon: User, label: "Nom", value: form.full_name },
                    { icon: Phone, label: "Téléphone", value: form.phone },
                    { icon: Calendar, label: "Âge", value: form.age ? `${form.age} ans` : "" },
                    { icon: MapPin, label: "Ville", value: form.city },
                    { icon: Weight, label: "Poids", value: form.weight ? `${form.weight} kg` : "" },
                    { icon: Ruler, label: "Taille", value: form.height ? `${form.height} cm` : "" },
                  ].map(({ icon: Icon, label, value }) => (
                    <div key={label} className="flex items-center gap-3 py-2 border-b border-border/50 last:border-0">
                      <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center shrink-0">
                        <Icon size={14} className="text-muted-foreground" />
                      </div>
                      <div className="flex-1">
                        <p className="text-muted-foreground text-xs">{label}</p>
                        <p className="text-foreground text-sm font-medium">{value || <span className="text-muted-foreground italic">Non renseigné</span>}</p>
                      </div>
                    </div>
                  ))}
                  {form.gender && (
                    <div className="flex items-center gap-3 py-2">
                      <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center shrink-0">
                        <User size={14} className="text-muted-foreground" />
                      </div>
                      <div className="flex-1">
                        <p className="text-muted-foreground text-xs">Sexe</p>
                        <p className="text-foreground text-sm font-medium">{form.gender}</p>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MonProfil;
