import { useState, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Save, Upload } from "lucide-react";
import { assetWithBase } from "@/lib/app-paths";

const KEYS = [
  "hero_kicker",
  "hero_title_line1",
  "hero_title_line2",
  "hero_title_line3",
  "hero_description",
  "site_logo_url",
  "hero_logo_url",
  "site_brand_name",
];

const HomeContentManager = () => {
  const queryClient = useQueryClient();
  const [values, setValues] = useState<Record<string, string>>({});
  const [uploadingLogo, setUploadingLogo] = useState<"site" | "hero" | null>(null);

  const { data: settings } = useQuery({
    queryKey: ["site_settings_home"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("site_settings")
        .select("*")
        .in("key", KEYS);
      if (error) throw error;
      return data;
    },
  });

  useEffect(() => {
    const init: Record<string, string> = {
      hero_kicker: "Coach Sportive Certifiée",
      hero_title_line1: "TRANSFORME",
      hero_title_line2: "TON CORPS",
      hero_title_line3: "TON MINDSET",
      hero_description: "Coaching personnalisé, suivi sur Google Sheets, bilans hebdomadaires. Emma est là, présente à chaque étape.",
      site_logo_url: assetWithBase("logo.png"),
      hero_logo_url: assetWithBase("hero-logo.png"),
      site_brand_name: "EM' COACHING",
    };
    for (const s of settings || []) {
      init[s.key] = s.value || "";
    }
    setValues(init);
  }, [settings]);

  const handleSave = async (key: string) => {
    const { error } = await supabase
      .from("site_settings")
      .upsert({ key, value: values[key] || "" }, { onConflict: "key" });
    if (error) {
      toast.error("Erreur");
    } else {
      toast.success("Enregistré !");
      queryClient.invalidateQueries({ queryKey: ["site_settings_home"] });
      queryClient.invalidateQueries({ queryKey: ["site_settings_public"] });
    }
  };

  const handleSaveAll = async () => {
    const rows = KEYS.map((k) => ({ key: k, value: values[k] || "" }));
    const { error } = await supabase.from("site_settings").upsert(rows, { onConflict: "key" });
    if (error) {
      toast.error("Erreur");
    } else {
      toast.success("Tout enregistré !");
      queryClient.invalidateQueries({ queryKey: ["site_settings_home"] });
      queryClient.invalidateQueries({ queryKey: ["site_settings_public"] });
    }
  };

  const handleLogoUpload = async (file: File, which: "site" | "hero") => {
    setUploadingLogo(which);
    try {
      const ext = file.name.split(".").pop();
      const path = `${which}-logo-${Date.now()}.${ext}`;
      const { error: upErr } = await supabase.storage.from("about-media").upload(path, file, { upsert: true });
      if (upErr) throw upErr;
      const { data: pub } = supabase.storage.from("about-media").getPublicUrl(path);
      const key = which === "site" ? "site_logo_url" : "hero_logo_url";
      setValues({ ...values, [key]: pub.publicUrl });
      await supabase.from("site_settings").upsert({ key, value: pub.publicUrl }, { onConflict: "key" });
      toast.success("Logo mis à jour !");
      queryClient.invalidateQueries({ queryKey: ["site_settings_home"] });
      queryClient.invalidateQueries({ queryKey: ["site_settings_public"] });
    } catch (e: any) {
      toast.error("Erreur upload : " + e.message);
    } finally {
      setUploadingLogo(null);
    }
  };

  return (
    <div className="space-y-8">
      {/* Logos */}
      <div className="border border-border rounded-lg p-4 bg-background/50 space-y-4">
        <h4 className="font-display text-lg text-foreground">Logos</h4>

        <div className="grid sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Logo navbar (petit, rond)</Label>
            {values.site_logo_url && (
              <img src={values.site_logo_url} alt="logo" className="w-16 h-16 rounded-full object-cover border border-border" />
            )}
            <Input
              type="file"
              accept="image/*"
              disabled={uploadingLogo === "site"}
              onChange={(e) => e.target.files?.[0] && handleLogoUpload(e.target.files[0], "site")}
            />
            <Input
              placeholder="ou colle une URL"
              value={values.site_logo_url || ""}
              onChange={(e) => setValues({ ...values, site_logo_url: e.target.value })}
            />
            <Button size="sm" onClick={() => handleSave("site_logo_url")}>
              <Save size={14} className="mr-1" /> Enregistrer URL
            </Button>
          </div>

          <div className="space-y-2">
            <Label>Logo Hero (grand, page d'accueil)</Label>
            {values.hero_logo_url && (
              <img src={values.hero_logo_url} alt="hero logo" className="w-24 h-24 rounded-full object-cover border border-border" />
            )}
            <Input
              type="file"
              accept="image/*"
              disabled={uploadingLogo === "hero"}
              onChange={(e) => e.target.files?.[0] && handleLogoUpload(e.target.files[0], "hero")}
            />
            <Input
              placeholder="ou colle une URL"
              value={values.hero_logo_url || ""}
              onChange={(e) => setValues({ ...values, hero_logo_url: e.target.value })}
            />
            <Button size="sm" onClick={() => handleSave("hero_logo_url")}>
              <Save size={14} className="mr-1" /> Enregistrer URL
            </Button>
          </div>
        </div>
      </div>

      {/* Marque */}
      <div className="border border-border rounded-lg p-4 bg-background/50 space-y-3">
        <h4 className="font-display text-lg text-foreground">Nom de la marque (navbar)</h4>
        <Input
          value={values.site_brand_name || ""}
          onChange={(e) => setValues({ ...values, site_brand_name: e.target.value })}
        />
      </div>

      {/* Hero textes */}
      <div className="border border-border rounded-lg p-4 bg-background/50 space-y-4">
        <h4 className="font-display text-lg text-foreground">Textes de la page d'accueil</h4>

        <div className="space-y-2">
          <Label>Petit texte au-dessus du titre</Label>
          <Input
            value={values.hero_kicker || ""}
            onChange={(e) => setValues({ ...values, hero_kicker: e.target.value })}
          />
        </div>

        <div className="grid sm:grid-cols-3 gap-3">
          <div className="space-y-2">
            <Label>Titre ligne 1</Label>
            <Input
              value={values.hero_title_line1 || ""}
              onChange={(e) => setValues({ ...values, hero_title_line1: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label>Titre ligne 2 (en bleu)</Label>
            <Input
              value={values.hero_title_line2 || ""}
              onChange={(e) => setValues({ ...values, hero_title_line2: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label>Titre ligne 3</Label>
            <Input
              value={values.hero_title_line3 || ""}
              onChange={(e) => setValues({ ...values, hero_title_line3: e.target.value })}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label>Description</Label>
          <Textarea
            rows={3}
            value={values.hero_description || ""}
            onChange={(e) => setValues({ ...values, hero_description: e.target.value })}
          />
        </div>
      </div>

      <Button onClick={handleSaveAll} size="lg" className="w-full">
        <Save size={16} className="mr-2" /> Tout enregistrer
      </Button>
    </div>
  );
};

export default HomeContentManager;
