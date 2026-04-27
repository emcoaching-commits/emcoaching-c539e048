import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import {
  Link2,
  Plus,
  Trash2,
  ExternalLink,
  GripVertical,
  FileSpreadsheet,
  FileText,
  CreditCard,
  Video,
  FormInput,
  Folder,
  Save,
  Edit2,
} from "lucide-react";

const CATEGORY_OPTIONS = [
  { value: "general", label: "Général", icon: Link2 },
  { value: "sheets", label: "Google Sheets", icon: FileSpreadsheet },
  { value: "forms", label: "Google Forms", icon: FormInput },
  { value: "docs", label: "Google Docs", icon: FileText },
  { value: "paypal", label: "PayPal", icon: CreditCard },
  { value: "loom", label: "Loom / Vidéo", icon: Video },
  { value: "drive", label: "Drive / Dossier", icon: Folder },
];

const getCategoryIcon = (category: string) => {
  const opt = CATEGORY_OPTIONS.find((c) => c.value === category);
  return opt?.icon || Link2;
};

const CustomLinksManager = () => {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({
    title: "",
    url: "",
    description: "",
    category: "general",
  });

  const { data: links } = useQuery({
    queryKey: ["custom_links_admin"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("custom_links")
        .select("*")
        .order("position")
        .order("created_at");
      if (error) throw error;
      return data;
    },
  });

  const resetForm = () => {
    setForm({ title: "", url: "", description: "", category: "general" });
    setEditingId(null);
    setShowForm(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim() || !form.url.trim()) {
      toast.error("Titre et URL obligatoires");
      return;
    }
    try {
      new URL(form.url);
    } catch {
      toast.error("URL invalide (https://...)");
      return;
    }

    if (editingId) {
      const { error } = await supabase
        .from("custom_links")
        .update({
          title: form.title.trim(),
          url: form.url.trim(),
          description: form.description.trim() || null,
          category: form.category,
        })
        .eq("id", editingId);
      if (error) {
        toast.error("Erreur lors de la mise à jour");
        return;
      }
      toast.success("Lien mis à jour");
    } else {
      const maxPos = (links || []).reduce((m, l: any) => Math.max(m, l.position || 0), 0);
      const { error } = await supabase.from("custom_links").insert({
        title: form.title.trim(),
        url: form.url.trim(),
        description: form.description.trim() || null,
        category: form.category,
        position: maxPos + 1,
      });
      if (error) {
        toast.error("Erreur lors de la création");
        return;
      }
      toast.success("Lien ajouté");
    }
    resetForm();
    queryClient.invalidateQueries({ queryKey: ["custom_links_admin"] });
  };

  const handleEdit = (link: any) => {
    setForm({
      title: link.title,
      url: link.url,
      description: link.description || "",
      category: link.category || "general",
    });
    setEditingId(link.id);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Supprimer ce lien ?")) return;
    const { error } = await supabase.from("custom_links").delete().eq("id", id);
    if (error) {
      toast.error("Erreur lors de la suppression");
      return;
    }
    toast.success("Lien supprimé");
    queryClient.invalidateQueries({ queryKey: ["custom_links_admin"] });
  };

  const movePosition = async (link: any, direction: "up" | "down") => {
    if (!links) return;
    const idx = links.findIndex((l: any) => l.id === link.id);
    const swapIdx = direction === "up" ? idx - 1 : idx + 1;
    if (swapIdx < 0 || swapIdx >= links.length) return;
    const other = links[swapIdx] as any;
    await supabase.from("custom_links").update({ position: other.position }).eq("id", link.id);
    await supabase.from("custom_links").update({ position: link.position }).eq("id", other.id);
    queryClient.invalidateQueries({ queryKey: ["custom_links_admin"] });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-muted-foreground text-sm">
          Centralise tes liens utiles : Google Sheets, Forms, PayPal, Docs, Loom, etc.
        </p>
        {!showForm && (
          <Button variant="hero" size="sm" onClick={() => setShowForm(true)}>
            <Plus size={14} className="mr-1" /> Nouveau lien
          </Button>
        )}
      </div>

      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="bg-background border border-primary/30 rounded-xl p-5 space-y-3"
        >
          <h4 className="font-display text-lg text-foreground">
            {editingId ? "Modifier le lien" : "Nouveau lien"}
          </h4>
          <div className="grid sm:grid-cols-2 gap-3">
            <div>
              <label className="text-muted-foreground text-xs">Titre *</label>
              <Input
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="ex: Suivi clients"
                required
                maxLength={100}
              />
            </div>
            <div>
              <label className="text-muted-foreground text-xs">Catégorie</label>
              <select
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm"
              >
                {CATEGORY_OPTIONS.map((c) => (
                  <option key={c.value} value={c.value}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label className="text-muted-foreground text-xs">URL *</label>
            <Input
              type="url"
              value={form.url}
              onChange={(e) => setForm({ ...form, url: e.target.value })}
              placeholder="https://..."
              required
            />
          </div>
          <div>
            <label className="text-muted-foreground text-xs">Description (optionnel)</label>
            <Textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="À quoi sert ce lien ?"
              rows={2}
              maxLength={300}
            />
          </div>
          <div className="flex gap-2">
            <Button type="submit" variant="hero" size="sm">
              <Save size={14} className="mr-1" /> {editingId ? "Mettre à jour" : "Ajouter"}
            </Button>
            <Button type="button" variant="heroOutline" size="sm" onClick={resetForm}>
              Annuler
            </Button>
          </div>
        </form>
      )}

      {(!links || links.length === 0) && !showForm && (
        <div className="text-center py-12 border border-dashed border-border rounded-xl">
          <Link2 className="mx-auto text-muted-foreground mb-2" size={32} />
          <p className="text-muted-foreground text-sm">Aucun lien pour l'instant</p>
          <p className="text-muted-foreground/70 text-xs mt-1">
            Clique sur « Nouveau lien » pour commencer
          </p>
        </div>
      )}

      <div className="grid sm:grid-cols-2 gap-3">
        {links?.map((link: any, idx: number) => {
          const Icon = getCategoryIcon(link.category);
          const categoryLabel =
            CATEGORY_OPTIONS.find((c) => c.value === link.category)?.label || "Général";
          return (
            <div
              key={link.id}
              className="group bg-card border border-border rounded-xl p-4 hover:border-primary/40 transition-all"
            >
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <Icon className="text-primary" size={18} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <h4 className="text-foreground font-semibold text-sm truncate">
                        {link.title}
                      </h4>
                      <p className="text-muted-foreground text-[10px] uppercase tracking-wider">
                        {categoryLabel}
                      </p>
                    </div>
                    <div className="flex flex-col gap-0.5">
                      <button
                        type="button"
                        onClick={() => movePosition(link, "up")}
                        disabled={idx === 0}
                        className="text-muted-foreground hover:text-foreground disabled:opacity-30 text-xs leading-none"
                        title="Monter"
                      >
                        ▲
                      </button>
                      <button
                        type="button"
                        onClick={() => movePosition(link, "down")}
                        disabled={idx === (links?.length || 0) - 1}
                        className="text-muted-foreground hover:text-foreground disabled:opacity-30 text-xs leading-none"
                        title="Descendre"
                      >
                        ▼
                      </button>
                    </div>
                  </div>
                  {link.description && (
                    <p className="text-muted-foreground text-xs mt-1 line-clamp-2">
                      {link.description}
                    </p>
                  )}
                  <div className="flex items-center gap-2 mt-3">
                    <a
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-primary hover:underline text-xs font-medium"
                    >
                      <ExternalLink size={12} /> Ouvrir
                    </a>
                    <button
                      type="button"
                      onClick={() => handleEdit(link)}
                      className="inline-flex items-center gap-1 text-muted-foreground hover:text-foreground text-xs"
                    >
                      <Edit2 size={12} /> Modifier
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(link.id)}
                      className="inline-flex items-center gap-1 text-destructive/80 hover:text-destructive text-xs ml-auto"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CustomLinksManager;