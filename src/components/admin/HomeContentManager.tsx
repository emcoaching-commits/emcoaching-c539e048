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
  "favicon_url",
  // Marketing highlights (page d'accueil)
  "marketing_accroche",
  "marketing_stat1_value",
  "marketing_stat1_label",
  "marketing_stat2_value",
  "marketing_stat2_label",
  "marketing_stat3_value",
  "marketing_stat3_label",
  "marketing_stat4_value",
  "marketing_stat4_label",
  "marketing_result1",
  "marketing_result2",
  "marketing_result3",
  "marketing_cta_text",
  "marketing_cta_button",
  // Section 3 piliers
  "pillars_kicker",
  "pillars_title",
  "pillar1_label", "pillar1_desc",
  "pillar2_label", "pillar2_desc",
  "pillar3_label", "pillar3_desc",
  // Section questionnaire
  "quest_kicker", "quest_title", "quest_desc", "quest_button",
  // Footer
  "footer_brand", "footer_copyright", "footer_credit",
  // Contact (téléphone affiché + lien tel)
  "contact_phone", "contact_phone_intl", "contact_email",
  // Thème (HSL "H S% L%")
  "theme_primary", "theme_accent", "theme_background", "theme_foreground",
  // Popup de bienvenue
  "welcome_popup_enabled", "welcome_popup_title", "welcome_popup_content", "welcome_popup_version",
  // Section "Qui suis-je"
  "about_kicker", "about_title", "about_description",
  "about_point1", "about_point2", "about_point3",
  "about_journey_kicker", "about_journey_title",
  "about_block1_title", "about_block1_text",
  "about_block2_title", "about_block2_text",
  "about_block3_title", "about_block3_text",
  "about_block4_title", "about_block4_text",
  "about_block5_title", "about_block5_text",
  "about_block6_title", "about_block6_text",
  // Section "Qui suis-je" – Frise chronologique (parcours)
  "about_timeline_kicker", "about_timeline_title", "about_timeline_intro",
  "about_timeline1_year", "about_timeline1_title", "about_timeline1_text",
  "about_timeline2_year", "about_timeline2_title", "about_timeline2_text",
  "about_timeline3_year", "about_timeline3_title", "about_timeline3_text",
  "about_timeline4_year", "about_timeline4_title", "about_timeline4_text",
  "about_timeline5_year", "about_timeline5_title", "about_timeline5_text",
  "about_timeline6_year", "about_timeline6_title", "about_timeline6_text",
];

type Section = "logos" | "home" | "about" | "footer" | "theme" | "welcome";

const HomeContentManager = ({ section }: { section?: Section } = {}) => {
  const queryClient = useQueryClient();
  const [values, setValues] = useState<Record<string, string>>({});
  const [uploadingLogo, setUploadingLogo] = useState<"site" | "hero" | "favicon" | null>(null);

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
      marketing_accroche: "Tu manques de motivation, de résultats, de cadre ? Emma t'accompagne pas à pas avec un programme 100% personnalisé.",
      marketing_stat1_value: "+150",
      marketing_stat1_label: "Clientes accompagnées",
      marketing_stat2_value: "5 ans",
      marketing_stat2_label: "D'expérience coaching",
      marketing_stat3_value: "98%",
      marketing_stat3_label: "De clientes satisfaites",
      marketing_stat4_value: "6 sem.",
      marketing_stat4_label: "Pour voir les premiers résultats",
      marketing_result1: "« J'ai perdu 8 kg en 3 mois sans frustration. »",
      marketing_result2: "« Mon corps a complètement changé, et surtout ma confiance. »",
      marketing_result3: "« Le suivi quotidien fait toute la différence. »",
      marketing_cta_text: "Prête à transformer ton corps et ton mindset ?",
      marketing_cta_button: "Rejoindre le coaching",
      pillars_kicker: "Mes 3 piliers",
      pillars_title: "UNE APPROCHE COMPLÈTE",
      pillar1_label: "Nutrition", pillar1_desc: "Plans adaptés à tes objectifs",
      pillar2_label: "Alimentation", pillar2_desc: "Habitudes durables, plaisir intact",
      pillar3_label: "Sport", pillar3_desc: "Programmes progressifs & efficaces",
      quest_kicker: "Questionnaire de découverte",
      quest_title: "APPRENDS-MOI À TE CONNAÎTRE",
      quest_desc: "Grâce à ce questionnaire, je vais apprendre à te connaître pour mieux t'aider et adapter au mieux ton suivi personnalisé.",
      quest_button: "Remplir le questionnaire",
      footer_brand: "EM' COACHING",
      footer_copyright: "© 2026 EM' Coaching. Tous droits réservés.",
      footer_credit: "Site créé par DRODE Tom en collaboration avec BERLIN Emma",
      contact_phone: "06 70 61 96 28",
      contact_phone_intl: "+33670619628",
      contact_email: "",
      theme_primary: "217 91% 50%",
      theme_accent: "200 100% 42%",
      theme_background: "40 30% 97%",
      theme_foreground: "220 40% 12%",
      welcome_popup_enabled: "true",
      welcome_popup_title: "Bienvenue sur EM' Coaching !",
      welcome_popup_content: "Merci de visiter le site !",
      welcome_popup_version: "1",
      about_kicker: "À propos",
      about_title: "QUI SUIS-JE ?",
      about_description: "",
      about_point1: "Spécialiste en transformation physique",
      about_point2: "Approche bienveillante et motivante",
      about_point3: "Suivi personnalisé et régulier",
      about_journey_kicker: "Mon histoire & ma vision",
      about_journey_title: "POURQUOI ME CHOISIR",
      about_block1_title: "Ma passion devenue métier",
      about_block1_text: "Le sport a changé ma vie. Après des années à m'entraîner et à expérimenter sur moi-même, j'ai décidé d'en faire mon métier pour transmettre cette énergie et accompagner d'autres femmes et hommes vers leur meilleure version.",
      about_block2_title: "Formée et certifiée",
      about_block2_text: "Coach sportive diplômée et formée en nutrition, je me forme en continu pour t'offrir un accompagnement à jour, basé sur la science du sport, du mouvement et de l'alimentation — sans régime restrictif ni méthode miracle.",
      about_block3_title: "Une approche bienveillante",
      about_block3_text: "Je crois qu'on progresse mieux dans la bienveillance que dans la culpabilité. Mon rôle, c'est de te pousser sans te casser, de t'aider à aimer le processus autant que le résultat, et de construire avec toi des habitudes qui durent.",
      about_block4_title: "Du sur-mesure, vraiment",
      about_block4_text: "Chaque programme est construit pour toi : ton objectif, ton niveau, ton emploi du temps, ton matériel. Pas de copier-coller. Le programme évolue toutes les 6 semaines pour rester stimulant et efficace.",
      about_block5_title: "Disponible et à l'écoute",
      about_block5_text: "Tu n'es jamais seul·e. Je suis joignable pour répondre à tes questions, ajuster le programme, te remotiver quand c'est dur. On avance ensemble, à ton rythme, avec un cap clair.",
      about_block6_title: "Ma promesse",
      about_block6_text: "Te faire (re)tomber amoureux·se du sport, te montrer que manger sainement peut être simple et bon, et te prouver que tu es capable de bien plus que ce que tu imagines.",
      about_timeline_kicker: "Mon parcours",
      about_timeline_title: "MON HISTOIRE & MES EXPÉRIENCES",
      about_timeline_intro: "Du déclic personnel à l'accompagnement de centaines de clientes, voici les étapes clés qui ont fait de moi la coach que je suis aujourd'hui.",
      about_timeline1_year: "2015",
      about_timeline1_title: "Le déclic",
      about_timeline1_text: "Je découvre la musculation et la nutrition. Ce qui commence comme un défi personnel devient rapidement une vraie passion qui transforme mon corps, mon mental et ma vie quotidienne.",
      about_timeline2_year: "2017",
      about_timeline2_title: "Premiers résultats & transmission",
      about_timeline2_text: "Après plusieurs années d'entraînement et d'expérimentation, mes proches me demandent conseil. J'accompagne mes premières amies bénévolement et je découvre que j'adore transmettre.",
      about_timeline3_year: "2019",
      about_timeline3_title: "Certification de coach sportive",
      about_timeline3_text: "Je décide d'en faire mon métier et j'obtiens ma certification de coach sportive. En parallèle, je me forme à la nutrition pour proposer un accompagnement vraiment complet.",
      about_timeline4_year: "2021",
      about_timeline4_text: "Je lance officiellement EM' Coaching et accompagne mes premières clientes en présentiel et à distance, avec un suivi sur-mesure et bienveillant.",
      about_timeline4_title: "Lancement d'EM' Coaching",
      about_timeline5_year: "2023",
      about_timeline5_title: "Spécialisation & méthode",
      about_timeline5_text: "Forte de l'expérience accumulée, je structure ma méthode : programmes évolutifs toutes les 6 semaines, suivi Google Sheets, bilans hebdomadaires et coaching mental intégré.",
      about_timeline6_year: "Aujourd'hui",
      about_timeline6_title: "+150 clientes accompagnées",
      about_timeline6_text: "Aujourd'hui, j'ai la chance d'accompagner des dizaines de femmes et d'hommes dans leur transformation, avec une approche humaine, durable et toujours personnalisée.",
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

  const handleLogoUpload = async (file: File, which: "site" | "hero" | "favicon") => {
    setUploadingLogo(which);
    try {
      const ext = file.name.split(".").pop();
      const path = `${which}-logo-${Date.now()}.${ext}`;
      const { error: upErr } = await supabase.storage.from("about-media").upload(path, file, { upsert: true });
      if (upErr) throw upErr;
      const { data: pub } = supabase.storage.from("about-media").getPublicUrl(path);
      const key =
        which === "site" ? "site_logo_url" : which === "hero" ? "hero_logo_url" : "favicon_url";
      setValues({ ...values, [key]: pub.publicUrl });
      await supabase.from("site_settings").upsert({ key, value: pub.publicUrl }, { onConflict: "key" });
      toast.success(which === "favicon" ? "Favicon mis à jour !" : "Logo mis à jour !");
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
      {(!section || section === "logos") && (
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

        {/* Favicon */}
        <div className="space-y-2 pt-4 border-t border-border/50">
          <Label>Favicon (icône onglet navigateur)</Label>
          <p className="text-xs text-muted-foreground">
            Image carrée recommandée (.png, .ico). 32×32 ou 64×64 pixels suffisent.
          </p>
          {values.favicon_url && (
            <img
              src={values.favicon_url}
              alt="favicon"
              className="w-12 h-12 rounded border border-border bg-background object-contain p-1"
            />
          )}
          <Input
            type="file"
            accept="image/*,.ico"
            disabled={uploadingLogo === "favicon"}
            onChange={(e) => e.target.files?.[0] && handleLogoUpload(e.target.files[0], "favicon")}
          />
        </div>
      </div>
      )}

      {/* Marque */}
      {(!section || section === "logos") && (
      <div className="border border-border rounded-lg p-4 bg-background/50 space-y-3">
        <h4 className="font-display text-lg text-foreground">Nom de la marque (navbar)</h4>
        <Input
          value={values.site_brand_name || ""}
          onChange={(e) => setValues({ ...values, site_brand_name: e.target.value })}
        />
      </div>
      )}

      {/* Hero textes */}
      {(!section || section === "home") && (
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
      )}

      {/* Section marketing : accroche, chiffres, résultats, CTA */}
      {(!section || section === "home") && (
      <div className="border border-border rounded-lg p-4 bg-background/50 space-y-4">
        <h4 className="font-display text-lg text-foreground">Section marketing (chiffres & résultats)</h4>

        <div className="space-y-2">
          <Label>Phrase d'accroche</Label>
          <Textarea
            rows={2}
            value={values.marketing_accroche || ""}
            onChange={(e) => setValues({ ...values, marketing_accroche: e.target.value })}
          />
        </div>

        <div className="grid sm:grid-cols-2 gap-3">
          {[1, 2, 3, 4].map((n) => (
            <div key={n} className="border border-border/50 rounded p-3 space-y-2">
              <Label className="text-xs">Chiffre #{n}</Label>
              <Input
                placeholder="Valeur (ex: +150)"
                value={values[`marketing_stat${n}_value`] || ""}
                onChange={(e) => setValues({ ...values, [`marketing_stat${n}_value`]: e.target.value })}
              />
              <Input
                placeholder="Label (ex: Clientes accompagnées)"
                value={values[`marketing_stat${n}_label`] || ""}
                onChange={(e) => setValues({ ...values, [`marketing_stat${n}_label`]: e.target.value })}
              />
            </div>
          ))}
        </div>

        <div className="space-y-2">
          <Label>Témoignage / résultat 1</Label>
          <Input
            value={values.marketing_result1 || ""}
            onChange={(e) => setValues({ ...values, marketing_result1: e.target.value })}
          />
        </div>
        <div className="space-y-2">
          <Label>Témoignage / résultat 2</Label>
          <Input
            value={values.marketing_result2 || ""}
            onChange={(e) => setValues({ ...values, marketing_result2: e.target.value })}
          />
        </div>
        <div className="space-y-2">
          <Label>Témoignage / résultat 3</Label>
          <Input
            value={values.marketing_result3 || ""}
            onChange={(e) => setValues({ ...values, marketing_result3: e.target.value })}
          />
        </div>

        <div className="grid sm:grid-cols-2 gap-3">
          <div className="space-y-2">
            <Label>Phrase CTA finale</Label>
            <Input
              value={values.marketing_cta_text || ""}
              onChange={(e) => setValues({ ...values, marketing_cta_text: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label>Texte du bouton CTA</Label>
            <Input
              value={values.marketing_cta_button || ""}
              onChange={(e) => setValues({ ...values, marketing_cta_button: e.target.value })}
            />
          </div>
        </div>
      </div>

      {/* Section 3 piliers */}
      <div className="border border-border rounded-lg p-4 bg-background/50 space-y-3">
        <h4 className="font-display text-lg text-foreground">Section "3 piliers"</h4>
        <div className="grid sm:grid-cols-2 gap-3">
          <div className="space-y-2">
            <Label>Petit titre (kicker)</Label>
            <Input value={values.pillars_kicker || ""} onChange={(e) => setValues({ ...values, pillars_kicker: e.target.value })} />
          </div>
          <div className="space-y-2">
            <Label>Titre principal</Label>
            <Input value={values.pillars_title || ""} onChange={(e) => setValues({ ...values, pillars_title: e.target.value })} />
          </div>
        </div>
        <div className="grid sm:grid-cols-3 gap-3">
          {[1, 2, 3].map((n) => (
            <div key={n} className="border border-border/50 rounded p-3 space-y-2">
              <Label className="text-xs">Pilier #{n}</Label>
              <Input placeholder="Titre" value={values[`pillar${n}_label`] || ""} onChange={(e) => setValues({ ...values, [`pillar${n}_label`]: e.target.value })} />
              <Input placeholder="Description" value={values[`pillar${n}_desc`] || ""} onChange={(e) => setValues({ ...values, [`pillar${n}_desc`]: e.target.value })} />
            </div>
          ))}
        </div>
      </div>

      {/* Section questionnaire */}
      <div className="border border-border rounded-lg p-4 bg-background/50 space-y-3">
        <h4 className="font-display text-lg text-foreground">Section Questionnaire</h4>
        <div className="grid sm:grid-cols-2 gap-3">
          <div className="space-y-2">
            <Label>Petit titre</Label>
            <Input value={values.quest_kicker || ""} onChange={(e) => setValues({ ...values, quest_kicker: e.target.value })} />
          </div>
          <div className="space-y-2">
            <Label>Titre</Label>
            <Input value={values.quest_title || ""} onChange={(e) => setValues({ ...values, quest_title: e.target.value })} />
          </div>
        </div>
        <div className="space-y-2">
          <Label>Description</Label>
          <Textarea rows={3} value={values.quest_desc || ""} onChange={(e) => setValues({ ...values, quest_desc: e.target.value })} />
        </div>
        <div className="space-y-2">
          <Label>Texte du bouton</Label>
          <Input value={values.quest_button || ""} onChange={(e) => setValues({ ...values, quest_button: e.target.value })} />
        </div>
      </div>

      {/* Footer & Contact */}
      <div className="border border-border rounded-lg p-4 bg-background/50 space-y-3">
        <h4 className="font-display text-lg text-foreground">Footer & coordonnées</h4>
        <div className="grid sm:grid-cols-2 gap-3">
          <div className="space-y-2">
            <Label>Marque (footer)</Label>
            <Input value={values.footer_brand || ""} onChange={(e) => setValues({ ...values, footer_brand: e.target.value })} />
          </div>
          <div className="space-y-2">
            <Label>Copyright</Label>
            <Input value={values.footer_copyright || ""} onChange={(e) => setValues({ ...values, footer_copyright: e.target.value })} />
          </div>
        </div>
        <div className="space-y-2">
          <Label>Crédit (petit texte)</Label>
          <Input value={values.footer_credit || ""} onChange={(e) => setValues({ ...values, footer_credit: e.target.value })} />
        </div>
        <div className="grid sm:grid-cols-3 gap-3 pt-3 border-t border-border/50">
          <div className="space-y-2">
            <Label>Téléphone (affiché)</Label>
            <Input value={values.contact_phone || ""} onChange={(e) => setValues({ ...values, contact_phone: e.target.value })} />
          </div>
          <div className="space-y-2">
            <Label>Téléphone (format intl, ex: +33670619628)</Label>
            <Input value={values.contact_phone_intl || ""} onChange={(e) => setValues({ ...values, contact_phone_intl: e.target.value })} />
          </div>
          <div className="space-y-2">
            <Label>Email contact</Label>
            <Input value={values.contact_email || ""} onChange={(e) => setValues({ ...values, contact_email: e.target.value })} />
          </div>
        </div>
      </div>

      {/* Couleurs du thème */}
      <div className="border border-border rounded-lg p-4 bg-background/50 space-y-3">
        <h4 className="font-display text-lg text-foreground">Couleurs du thème</h4>
        <p className="text-xs text-muted-foreground">Format HSL : <code>"H S% L%"</code> — ex: <code>217 91% 50%</code>. Astuce : utilise un convertisseur HEX→HSL.</p>
        <div className="grid sm:grid-cols-2 gap-3">
          {[
            { k: "theme_primary", l: "Primaire (bleu boutons/liens)" },
            { k: "theme_accent", l: "Accent" },
            { k: "theme_background", l: "Fond" },
            { k: "theme_foreground", l: "Texte principal" },
          ].map((c) => (
            <div key={c.k} className="space-y-2">
              <Label>{c.l}</Label>
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded border border-border" style={{ background: `hsl(${values[c.k] || "0 0% 50%"})` }} />
                <Input value={values[c.k] || ""} onChange={(e) => setValues({ ...values, [c.k]: e.target.value })} placeholder="217 91% 50%" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Popup de bienvenue */}
      <div className="border border-border rounded-lg p-4 bg-background/50 space-y-3">
        <h4 className="font-display text-lg text-foreground">Message de bienvenue (popup)</h4>
        <p className="text-xs text-muted-foreground">
          S'affiche une seule fois par visiteur sur la page d'accueil. Augmente la "version" pour le ré-afficher à tout le monde après modification.
        </p>
        <div className="flex items-center gap-3">
          <input
            type="checkbox"
            id="welcome_popup_enabled"
            checked={values.welcome_popup_enabled === "true"}
            onChange={(e) =>
              setValues({ ...values, welcome_popup_enabled: e.target.checked ? "true" : "false" })
            }
            className="w-4 h-4 accent-primary"
          />
          <Label htmlFor="welcome_popup_enabled" className="cursor-pointer">
            Afficher le message de bienvenue
          </Label>
        </div>
        <div className="space-y-2">
          <Label>Titre du popup</Label>
          <Input
            value={values.welcome_popup_title || ""}
            onChange={(e) => setValues({ ...values, welcome_popup_title: e.target.value })}
          />
        </div>
        <div className="space-y-2">
          <Label>Contenu du message</Label>
          <Textarea
            rows={8}
            value={values.welcome_popup_content || ""}
            onChange={(e) => setValues({ ...values, welcome_popup_content: e.target.value })}
          />
        </div>
        <div className="space-y-2">
          <Label>Version (incrémente pour ré-afficher à tous)</Label>
          <Input
            value={values.welcome_popup_version || "1"}
            onChange={(e) => setValues({ ...values, welcome_popup_version: e.target.value })}
            placeholder="1"
          />
        </div>
        <Button size="sm" onClick={async () => {
          await Promise.all([
            handleSave("welcome_popup_enabled"),
            handleSave("welcome_popup_title"),
            handleSave("welcome_popup_content"),
            handleSave("welcome_popup_version"),
          ]);
        }}>
          <Save size={14} className="mr-1" /> Enregistrer le popup
        </Button>
      </div>

      {/* Section Qui suis-je */}
      <div className="border border-border rounded-lg p-4 bg-background/50 space-y-4">
        <h4 className="font-display text-lg text-foreground">Section "Qui suis-je"</h4>
        <div className="grid sm:grid-cols-2 gap-3">
          <div className="space-y-2">
            <Label>Petit titre (kicker)</Label>
            <Input value={values.about_kicker || ""} onChange={(e) => setValues({ ...values, about_kicker: e.target.value })} />
          </div>
          <div className="space-y-2">
            <Label>Titre principal</Label>
            <Input value={values.about_title || ""} onChange={(e) => setValues({ ...values, about_title: e.target.value })} />
          </div>
        </div>
        <div className="space-y-2">
          <Label>Description (paragraphe principal)</Label>
          <Textarea rows={5} value={values.about_description || ""} onChange={(e) => setValues({ ...values, about_description: e.target.value })} />
        </div>
        <div className="grid sm:grid-cols-3 gap-3">
          {[1, 2, 3].map((n) => (
            <div key={n} className="space-y-2">
              <Label className="text-xs">Point fort #{n}</Label>
              <Input
                value={values[`about_point${n}`] || ""}
                onChange={(e) => setValues({ ...values, [`about_point${n}`]: e.target.value })}
              />
            </div>
          ))}
        </div>

        <div className="pt-4 border-t border-border/50 space-y-3">
          <h5 className="font-display text-foreground">Sous-section "Pourquoi me choisir"</h5>
          <div className="grid sm:grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Petit titre</Label>
              <Input value={values.about_journey_kicker || ""} onChange={(e) => setValues({ ...values, about_journey_kicker: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Titre</Label>
              <Input value={values.about_journey_title || ""} onChange={(e) => setValues({ ...values, about_journey_title: e.target.value })} />
            </div>
          </div>
          <div className="grid sm:grid-cols-2 gap-3">
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <div key={n} className="border border-border/50 rounded p-3 space-y-2">
                <Label className="text-xs">Bloc #{n}</Label>
                <Input
                  placeholder="Titre du bloc"
                  value={values[`about_block${n}_title`] || ""}
                  onChange={(e) => setValues({ ...values, [`about_block${n}_title`]: e.target.value })}
                />
                <Textarea
                  rows={4}
                  placeholder="Texte du bloc"
                  value={values[`about_block${n}_text`] || ""}
                  onChange={(e) => setValues({ ...values, [`about_block${n}_text`]: e.target.value })}
                />
              </div>
            ))}
          </div>
        </div>

        <div className="pt-4 border-t border-border/50 space-y-3">
          <h5 className="font-display text-foreground">Frise "Mon parcours" (histoire & expériences)</h5>
          <p className="text-xs text-muted-foreground">
            Une frise chronologique pour raconter ton histoire. Laisse un bloc vide pour le masquer.
          </p>
          <div className="grid sm:grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Petit titre (kicker)</Label>
              <Input value={values.about_timeline_kicker || ""} onChange={(e) => setValues({ ...values, about_timeline_kicker: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Titre</Label>
              <Input value={values.about_timeline_title || ""} onChange={(e) => setValues({ ...values, about_timeline_title: e.target.value })} />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Phrase d'introduction (optionnel)</Label>
            <Textarea rows={2} value={values.about_timeline_intro || ""} onChange={(e) => setValues({ ...values, about_timeline_intro: e.target.value })} />
          </div>
          <div className="grid sm:grid-cols-2 gap-3">
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <div key={n} className="border border-border/50 rounded p-3 space-y-2">
                <Label className="text-xs">Étape #{n}</Label>
                <Input
                  placeholder="Année / période (ex: 2019)"
                  value={values[`about_timeline${n}_year`] || ""}
                  onChange={(e) => setValues({ ...values, [`about_timeline${n}_year`]: e.target.value })}
                />
                <Input
                  placeholder="Titre de l'étape"
                  value={values[`about_timeline${n}_title`] || ""}
                  onChange={(e) => setValues({ ...values, [`about_timeline${n}_title`]: e.target.value })}
                />
                <Textarea
                  rows={4}
                  placeholder="Description de l'étape"
                  value={values[`about_timeline${n}_text`] || ""}
                  onChange={(e) => setValues({ ...values, [`about_timeline${n}_text`]: e.target.value })}
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      <Button onClick={handleSaveAll} size="lg" className="w-full">
        <Save size={16} className="mr-2" /> Tout enregistrer
      </Button>
    </div>
  );
};

export default HomeContentManager;
