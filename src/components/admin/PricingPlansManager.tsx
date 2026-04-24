import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Save, Trash2, Plus, Star, Edit2, Image as ImageIcon, Film } from "lucide-react";

const PlanMediaManager = ({ planId }: { planId: string }) => {
  const queryClient = useQueryClient();
  const [uploading, setUploading] = useState(false);

  const { data: media } = useQuery({
    queryKey: ["plan_media", planId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("pricing_plan_media")
        .select("*")
        .eq("pricing_plan_id", planId)
        .order("position");
      if (error) throw error;
      return data;
    },
  });

  const refresh = () => {
    queryClient.invalidateQueries({ queryKey: ["plan_media", planId] });
  };

  const handleUpload = async (file: File) => {
    if ((media?.length || 0) >= 4) {
      toast.error("Maximum 4 médias par formule");
      return;
    }
    setUploading(true);
    const ext = file.name.split(".").pop();
    const fileName = `media-${planId}-${Date.now()}.${ext}`;
    const { error: upErr } = await supabase.storage
      .from("pricing-backgrounds")
      .upload(fileName, file);
    if (upErr) {
      toast.error("Erreur upload : " + upErr.message);
      setUploading(false);
      return;
    }
    const { data: urlData } = supabase.storage
      .from("pricing-backgrounds")
      .getPublicUrl(fileName);
    const type = file.type.startsWith("video") ? "video" : "image";
    const { error: insErr } = await supabase.from("pricing_plan_media").insert({
      pricing_plan_id: planId,
      url: urlData.publicUrl,
      type,
      position: media?.length || 0,
    });
    if (insErr) toast.error(insErr.message);
    else {
      toast.success("Média ajouté");
      refresh();
    }
    setUploading(false);
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("pricing_plan_media").delete().eq("id", id);
    if (error) toast.error(error.message);
    else {
      toast.success("Média supprimé");
      refresh();
    }
  };

  const count = media?.length || 0;

  return (
    <div>
      <label className="text-xs text-muted-foreground">
        Galerie « En savoir plus » ({count}/4 photos ou vidéos)
      </label>
      <div className="flex flex-wrap items-center gap-2 mt-2">
        {media?.map((m: any) => (
          <div key={m.id} className="relative w-20 h-20 rounded border border-border overflow-hidden bg-muted">
            {m.type === "video" ? (
              <video src={m.url} className="w-full h-full object-cover" />
            ) : (
              <img src={m.url} alt="" className="w-full h-full object-cover" />
            )}
            <button
              type="button"
              onClick={() => handleDelete(m.id)}
              className="absolute top-0 right-0 bg-destructive text-destructive-foreground p-0.5 rounded-bl text-[10px]"
              aria-label="Supprimer"
            >
              <Trash2 size={12} />
            </button>
            <span className="absolute bottom-0 left-0 bg-background/80 text-foreground text-[10px] px-1">
              {m.type === "video" ? <Film size={10} /> : <ImageIcon size={10} />}
            </span>
          </div>
        ))}
        {count < 4 && (
          <label className="cursor-pointer">
            <input
              type="file"
              accept="image/*,video/*"
              className="hidden"
              onChange={(e) => e.target.files?.[0] && handleUpload(e.target.files[0])}
            />
            <span className="px-3 py-1.5 bg-primary/10 text-primary rounded text-sm hover:bg-primary/20 transition-colors inline-flex items-center gap-1">
              <Plus size={14} /> {uploading ? "Envoi..." : "Ajouter"}
            </span>
          </label>
        )}
      </div>
    </div>
  );
};

const PricingPlansManager = () => {
  const queryClient = useQueryClient();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState<any>({});
  const [uploading, setUploading] = useState(false);

  const { data: plans } = useQuery({
    queryKey: ["admin_pricing_plans_full"],
    queryFn: async () => {
      const { data, error } = await supabase.from("pricing_plans").select("*").order("price");
      if (error) throw error;
      return data;
    },
  });

  const refresh = () => {
    queryClient.invalidateQueries({ queryKey: ["admin_pricing_plans_full"] });
    queryClient.invalidateQueries({ queryKey: ["admin_pricing_plans"] });
    queryClient.invalidateQueries({ queryKey: ["pricing_plans"] });
  };

  const startEdit = (plan: any) => {
    setEditingId(plan.id);
    setDraft({ ...plan, features: plan.features || [] });
  };

  const saveEdit = async () => {
    const { error } = await supabase
      .from("pricing_plans")
      .update({
        name: draft.name,
        price: parseFloat(draft.price) || 0,
        description: draft.description,
        features: (draft.features || []).filter((f: string) => f.trim()),
        long_description: draft.long_description || null,
        includes: (draft.includes || []).filter((f: string) => f.trim()),
        details: (draft.details || []).filter((f: string) => f.trim()),
        is_popular: !!draft.is_popular,
        background_image_url: draft.background_image_url || null,
        paypal_url: draft.paypal_url || null,
      })
      .eq("id", draft.id);
    if (error) {
      toast.error("Erreur : " + error.message);
    } else {
      toast.success("Formule mise à jour !");
      setEditingId(null);
      refresh();
    }
  };

  const togglePopular = async (plan: any) => {
    // Désactive toutes les autres avant
    if (!plan.is_popular) {
      await supabase.from("pricing_plans").update({ is_popular: false }).neq("id", plan.id);
    }
    await supabase.from("pricing_plans").update({ is_popular: !plan.is_popular }).eq("id", plan.id);
    toast.success(!plan.is_popular ? "Formule mise en avant" : "Plus mise en avant");
    refresh();
  };

  const deletePlan = async (id: string) => {
    if (!confirm("Supprimer cette formule ?")) return;
    const { error } = await supabase.from("pricing_plans").delete().eq("id", id);
    if (error) toast.error(error.message);
    else { toast.success("Formule supprimée"); refresh(); }
  };

  const createPlan = async () => {
    const { error } = await supabase.from("pricing_plans").insert({
      name: "Nouvelle formule",
      price: 0,
      description: "",
      features: [],
    });
    if (error) toast.error(error.message);
    else { toast.success("Formule créée"); refresh(); }
  };

  const uploadBackground = async (file: File) => {
    setUploading(true);
    const ext = file.name.split(".").pop();
    const fileName = `${draft.id || "plan"}-${Date.now()}.${ext}`;
    const { error: upErr } = await supabase.storage.from("pricing-backgrounds").upload(fileName, file);
    if (upErr) {
      toast.error("Erreur upload : " + upErr.message);
      setUploading(false);
      return;
    }
    const { data: urlData } = supabase.storage.from("pricing-backgrounds").getPublicUrl(fileName);
    setDraft({ ...draft, background_image_url: urlData.publicUrl });
    setUploading(false);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={createPlan} size="sm" variant="hero">
          <Plus size={14} className="mr-1" /> Nouvelle formule
        </Button>
      </div>

      {plans?.map((plan: any) => (
        <div key={plan.id} className="border border-border rounded-lg p-4 bg-background/50">
          {editingId === plan.id ? (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-muted-foreground">Nom</label>
                  <Input value={draft.name || ""} onChange={(e) => setDraft({ ...draft, name: e.target.value })} />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground">Prix (€)</label>
                  <Input type="number" step="0.01" value={draft.price ?? ""} onChange={(e) => setDraft({ ...draft, price: e.target.value })} />
                </div>
              </div>
              <div>
                <label className="text-xs text-muted-foreground">Description</label>
                <Input value={draft.description || ""} onChange={(e) => setDraft({ ...draft, description: e.target.value })} />
              </div>
              <div>
                <label className="text-xs text-muted-foreground">Fonctionnalités (une par ligne)</label>
                <Textarea
                  rows={5}
                  value={(draft.features || []).join("\n")}
                  onChange={(e) => setDraft({ ...draft, features: e.target.value.split("\n") })}
                />
              </div>
              <div className="border-t border-border pt-3 mt-3">
                <p className="text-xs uppercase tracking-wider text-primary font-semibold mb-2">Page « En savoir plus »</p>
              </div>
              <div>
                <label className="text-xs text-muted-foreground">Description longue (texte d'introduction de la page détail)</label>
                <Textarea
                  rows={4}
                  value={draft.long_description || ""}
                  onChange={(e) => setDraft({ ...draft, long_description: e.target.value })}
                  placeholder="Présente la formule en détail..."
                />
              </div>
              <div>
                <label className="text-xs text-muted-foreground">Ce qui est inclus (un par ligne)</label>
                <Textarea
                  rows={5}
                  value={(draft.includes || []).join("\n")}
                  onChange={(e) => setDraft({ ...draft, includes: e.target.value.split("\n") })}
                  placeholder="Ex: Suivi nutritionnel personnalisé"
                />
              </div>
              <div>
                <label className="text-xs text-muted-foreground">Comment ça fonctionne — étapes (une par ligne)</label>
                <Textarea
                  rows={5}
                  value={(draft.details || []).join("\n")}
                  onChange={(e) => setDraft({ ...draft, details: e.target.value.split("\n") })}
                  placeholder="Ex: Premier échange pour cerner tes objectifs"
                />
              </div>
              <PlanMediaManager planId={draft.id} />
              <div>
                <label className="text-xs text-muted-foreground">Lien PayPal</label>
                <Input type="url" value={draft.paypal_url || ""} onChange={(e) => setDraft({ ...draft, paypal_url: e.target.value })} placeholder="https://www.paypal.com/..." />
              </div>
              <div>
                <label className="text-xs text-muted-foreground">Image de fond</label>
                <div className="flex items-center gap-3 mt-1">
                  {draft.background_image_url && (
                    <img src={draft.background_image_url} alt="" className="w-20 h-20 rounded object-cover border border-border" />
                  )}
                  <label className="cursor-pointer">
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => e.target.files?.[0] && uploadBackground(e.target.files[0])}
                    />
                    <span className="px-3 py-1.5 bg-primary/10 text-primary rounded text-sm hover:bg-primary/20 transition-colors inline-flex items-center gap-1">
                      <ImageIcon size={14} /> {uploading ? "Envoi..." : "Choisir une image"}
                    </span>
                  </label>
                  {draft.background_image_url && (
                    <Button variant="ghost" size="sm" onClick={() => setDraft({ ...draft, background_image_url: null })}>
                      <Trash2 size={14} />
                    </Button>
                  )}
                </div>
              </div>
              <label className="flex items-center gap-2 text-sm text-foreground">
                <input type="checkbox" checked={!!draft.is_popular} onChange={(e) => setDraft({ ...draft, is_popular: e.target.checked })} />
                Formule la plus populaire
              </label>
              <div className="flex gap-2">
                <Button onClick={saveEdit} size="sm" variant="hero">
                  <Save size={14} className="mr-1" /> Enregistrer
                </Button>
                <Button onClick={() => setEditingId(null)} size="sm" variant="heroOutline">Annuler</Button>
              </div>
            </div>
          ) : (
            <div className="flex items-start gap-4">
              {plan.background_image_url && (
                <img src={plan.background_image_url} alt="" className="w-20 h-20 rounded object-cover shrink-0" />
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h4 className="font-display text-lg text-foreground">{plan.name}</h4>
                  {plan.is_popular && <span className="text-xs bg-primary/20 text-primary px-2 py-0.5 rounded-full">Populaire</span>}
                </div>
                <p className="text-sm text-primary font-semibold">{plan.price}€ / mois</p>
                <p className="text-xs text-muted-foreground mt-1">{plan.description}</p>
              </div>
              <div className="flex gap-1 shrink-0">
                <Button size="sm" variant="ghost" onClick={() => togglePopular(plan)} title={plan.is_popular ? "Retirer mise en avant" : "Mettre en avant"}>
                  <Star size={14} className={plan.is_popular ? "fill-primary text-primary" : "text-muted-foreground"} />
                </Button>
                <Button size="sm" variant="heroOutline" onClick={() => startEdit(plan)}>
                  <Edit2 size={14} />
                </Button>
                <Button size="sm" variant="ghost" onClick={() => deletePlan(plan.id)}>
                  <Trash2 size={14} className="text-destructive" />
                </Button>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default PricingPlansManager;