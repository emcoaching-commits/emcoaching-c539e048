import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { Plus, Trash2, Info, CheckCircle2, AlertTriangle, Sparkles } from "lucide-react";

const TYPES = [
  { value: "info", label: "Info", icon: Info },
  { value: "success", label: "Succès", icon: CheckCircle2 },
  { value: "warning", label: "Alerte", icon: AlertTriangle },
  { value: "new", label: "Nouveau", icon: Sparkles },
];

const InfoPopupsManager = () => {
  const qc = useQueryClient();
  const [form, setForm] = useState({
    title: "",
    content: "",
    type: "info",
    cta_label: "",
    cta_url: "",
    starts_at: "",
    ends_at: "",
  });

  const { data: popups, isLoading } = useQuery({
    queryKey: ["info_popups_admin"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("info_popups")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const create = async () => {
    if (!form.title.trim() || !form.content.trim()) {
      toast.error("Titre et contenu requis");
      return;
    }
    const payload: any = {
      title: form.title.trim(),
      content: form.content.trim(),
      type: form.type,
      cta_label: form.cta_label.trim() || null,
      cta_url: form.cta_url.trim() || null,
      starts_at: form.starts_at || null,
      ends_at: form.ends_at || null,
    };
    const { error } = await supabase.from("info_popups").insert(payload);
    if (error) return toast.error(error.message);
    toast.success("Popup créé");
    setForm({ title: "", content: "", type: "info", cta_label: "", cta_url: "", starts_at: "", ends_at: "" });
    qc.invalidateQueries({ queryKey: ["info_popups_admin"] });
  };

  const toggle = async (id: string, is_active: boolean) => {
    const { error } = await supabase.from("info_popups").update({ is_active }).eq("id", id);
    if (error) return toast.error(error.message);
    qc.invalidateQueries({ queryKey: ["info_popups_admin"] });
  };

  const remove = async (id: string) => {
    if (!confirm("Supprimer ce popup ?")) return;
    const { error } = await supabase.from("info_popups").delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Popup supprimé");
    qc.invalidateQueries({ queryKey: ["info_popups_admin"] });
  };

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-border bg-card p-5 space-y-4">
        <h3 className="font-display text-xl">Créer un popup d'information</h3>
        <p className="text-sm text-muted-foreground">
          Affiché en bas à droite du site (visible par tous les visiteurs jusqu'à ce qu'ils le ferment).
        </p>

        <div className="grid sm:grid-cols-2 gap-3">
          <div>
            <Label>Titre *</Label>
            <Input
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="Ex : Nouveaux créneaux dispo !"
              maxLength={120}
            />
          </div>
          <div>
            <Label>Type</Label>
            <div className="flex gap-2 flex-wrap mt-2">
              {TYPES.map((t) => {
                const Icon = t.icon;
                const isActive = form.type === t.value;
                return (
                  <button
                    type="button"
                    key={t.value}
                    onClick={() => setForm({ ...form, type: t.value })}
                    className={`px-3 py-1.5 rounded-lg border inline-flex items-center gap-1.5 text-sm transition-colors ${
                      isActive ? "bg-primary text-primary-foreground border-primary" : "bg-background border-border text-muted-foreground"
                    }`}
                  >
                    <Icon size={14} /> {t.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div>
          <Label>Contenu *</Label>
          <Textarea
            value={form.content}
            onChange={(e) => setForm({ ...form, content: e.target.value })}
            placeholder="Ex : 5 nouveaux créneaux ajoutés cette semaine, réservez vite !"
            maxLength={1000}
            rows={3}
          />
        </div>

        <div className="grid sm:grid-cols-2 gap-3">
          <div>
            <Label>Bouton (texte, optionnel)</Label>
            <Input
              value={form.cta_label}
              onChange={(e) => setForm({ ...form, cta_label: e.target.value })}
              placeholder="Ex : Réserver"
            />
          </div>
          <div>
            <Label>Bouton (lien, optionnel)</Label>
            <Input
              value={form.cta_url}
              onChange={(e) => setForm({ ...form, cta_url: e.target.value })}
              placeholder="Ex : /reservation"
            />
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-3">
          <div>
            <Label>Date de début (optionnel)</Label>
            <Input type="datetime-local" value={form.starts_at} onChange={(e) => setForm({ ...form, starts_at: e.target.value })} />
          </div>
          <div>
            <Label>Date de fin (optionnel)</Label>
            <Input type="datetime-local" value={form.ends_at} onChange={(e) => setForm({ ...form, ends_at: e.target.value })} />
          </div>
        </div>

        <Button onClick={create} className="w-full sm:w-auto">
          <Plus size={16} className="mr-1" /> Créer le popup
        </Button>
      </div>

      <div className="space-y-3">
        <h3 className="font-display text-xl">Popups existants ({popups?.length || 0})</h3>
        {isLoading && <p className="text-muted-foreground">Chargement…</p>}
        {popups?.map((p: any) => (
          <div key={p.id} className="rounded-xl border border-border bg-card p-4 flex items-start gap-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs px-2 py-0.5 rounded-full bg-primary/15 text-primary uppercase tracking-wider">
                  {p.type}
                </span>
                <h4 className="font-semibold truncate">{p.title}</h4>
              </div>
              <p className="text-sm text-muted-foreground whitespace-pre-line">{p.content}</p>
              {p.cta_label && (
                <p className="text-xs text-muted-foreground mt-1">
                  CTA : <span className="font-mono">{p.cta_label}</span> → {p.cta_url}
                </p>
              )}
              {(p.starts_at || p.ends_at) && (
                <p className="text-xs text-muted-foreground mt-1">
                  {p.starts_at && `Du ${new Date(p.starts_at).toLocaleString("fr-FR")} `}
                  {p.ends_at && `au ${new Date(p.ends_at).toLocaleString("fr-FR")}`}
                </p>
              )}
            </div>
            <div className="flex flex-col items-end gap-2">
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">{p.is_active ? "Actif" : "Inactif"}</span>
                <Switch checked={p.is_active} onCheckedChange={(v) => toggle(p.id, v)} />
              </div>
              <Button variant="ghost" size="sm" onClick={() => remove(p.id)} className="text-destructive">
                <Trash2 size={14} />
              </Button>
            </div>
          </div>
        ))}
        {popups?.length === 0 && <p className="text-muted-foreground text-sm">Aucun popup pour le moment.</p>}
      </div>
    </div>
  );
};

export default InfoPopupsManager;