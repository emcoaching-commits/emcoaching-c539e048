import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Send, Mail, Clock } from "lucide-react";

const DailySummaryManager = () => {
  const [enabled, setEnabled] = useState(true);
  const [hour, setHour] = useState<number>(20);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase
        .from("site_settings")
        .select("key, value")
        .in("key", ["daily_summary_enabled", "daily_summary_hour_paris"]);
      const map = Object.fromEntries((data ?? []).map((s: any) => [s.key, s.value]));
      setEnabled((map.daily_summary_enabled ?? "true") === "true");
      setHour(parseInt(map.daily_summary_hour_paris ?? "20", 10));
      setLoading(false);
    };
    load();
  }, []);

  const save = async (nextEnabled: boolean, nextHour: number) => {
    setSaving(true);
    const { error: e1 } = await supabase
      .from("site_settings")
      .upsert({ key: "daily_summary_enabled", value: nextEnabled ? "true" : "false" }, { onConflict: "key" });
    const { error: e2 } = await supabase
      .from("site_settings")
      .upsert({ key: "daily_summary_hour_paris", value: String(nextHour) }, { onConflict: "key" });
    setSaving(false);
    if (e1 || e2) {
      toast.error("Erreur lors de l'enregistrement");
      return;
    }
    toast.success("Réglages enregistrés");
  };

  const handleToggle = (val: boolean) => {
    setEnabled(val);
    save(val, hour);
  };

  const handleHourChange = (val: string) => {
    const h = Math.max(0, Math.min(23, parseInt(val || "0", 10)));
    setHour(h);
  };

  const handleHourBlur = () => save(enabled, hour);

  const sendNow = async () => {
    setSending(true);
    try {
      const { error } = await supabase.functions.invoke("daily-summary-email", {
        body: { test: true },
      });
      if (error) throw error;
      toast.success("Récap envoyé ! Vérifie ta boîte mail.");
    } catch (e: any) {
      toast.error("Erreur : " + (e?.message ?? "envoi impossible"));
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-card border border-border rounded-xl p-6">
        <p className="text-muted-foreground text-sm">Chargement…</p>
      </div>
    );
  }

  return (
    <div className="bg-card border border-border rounded-xl p-6 space-y-6">
      <div>
        <h3 className="text-lg font-bold text-foreground mb-2 flex items-center gap-2">
          <Mail size={20} /> Récap quotidien par mail
        </h3>
        <p className="text-muted-foreground text-sm">
          Envoyé à <span className="font-semibold text-foreground">em'coaching@emcoachingfr.com</span> à l'heure de Paris.
        </p>
      </div>

      <div className="flex items-center justify-between p-4 rounded-lg bg-muted/40 border border-border">
        <div>
          <Label htmlFor="enabled" className="text-base font-semibold">Envoi automatique</Label>
          <p className="text-sm text-muted-foreground mt-1">
            {enabled ? "Activé — le récap sera envoyé chaque jour." : "Désactivé — aucun envoi automatique."}
          </p>
        </div>
        <Switch id="enabled" checked={enabled} onCheckedChange={handleToggle} disabled={saving} />
      </div>

      <div className="p-4 rounded-lg bg-muted/40 border border-border">
        <Label htmlFor="hour" className="text-base font-semibold flex items-center gap-2">
          <Clock size={16} /> Heure d'envoi (Paris)
        </Label>
        <div className="flex items-center gap-3 mt-3">
          <Input
            id="hour"
            type="number"
            min={0}
            max={23}
            value={hour}
            onChange={(e) => handleHourChange(e.target.value)}
            onBlur={handleHourBlur}
            className="w-24"
            disabled={saving || !enabled}
          />
          <span className="text-muted-foreground text-sm">h 00 — heure française</span>
        </div>
      </div>

      <div className="pt-2 border-t border-border">
        <Button onClick={sendNow} disabled={sending} className="w-full sm:w-auto">
          <Send size={16} className="mr-2" />
          {sending ? "Envoi en cours…" : "Envoyer un récap maintenant"}
        </Button>
        <p className="text-xs text-muted-foreground mt-2">
          Envoie immédiatement un récap test (fonctionne même si l'envoi automatique est désactivé).
        </p>
      </div>
    </div>
  );
};

export default DailySummaryManager;