import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { motion, AnimatePresence } from "framer-motion";
import { X, Info, CheckCircle2, AlertTriangle, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

const ICONS: Record<string, any> = {
  info: Info,
  success: CheckCircle2,
  warning: AlertTriangle,
  new: Sparkles,
};

const COLORS: Record<string, string> = {
  info: "from-primary/20 to-primary/5 border-primary/40 text-foreground",
  success: "from-green-500/20 to-green-500/5 border-green-500/40 text-foreground",
  warning: "from-amber-500/20 to-amber-500/5 border-amber-500/40 text-foreground",
  new: "from-accent/20 to-accent/5 border-accent/40 text-foreground",
};

const STORAGE_KEY = "dismissed_info_popups";

const getDismissed = (): string[] => {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
  } catch {
    return [];
  }
};

const InfoPopupsBanner = () => {
  const [dismissed, setDismissed] = useState<string[]>([]);

  useEffect(() => {
    setDismissed(getDismissed());
  }, []);

  const { data: popups } = useQuery({
    queryKey: ["info_popups_active"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("info_popups")
        .select("*")
        .eq("is_active", true)
        .order("position", { ascending: true });
      if (error) throw error;
      return (data || []).filter((p: any) => {
        const now = Date.now();
        if (p.starts_at && new Date(p.starts_at).getTime() > now) return false;
        if (p.ends_at && new Date(p.ends_at).getTime() < now) return false;
        return true;
      });
    },
  });

  const dismiss = (id: string) => {
    const next = [...dismissed, id];
    setDismissed(next);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  };

  const visible = (popups || []).filter((p: any) => !dismissed.includes(p.id));
  if (!visible.length) return null;

  return (
    <div className="fixed bottom-4 right-4 z-40 w-[min(380px,calc(100vw-2rem))] space-y-3">
      <AnimatePresence>
        {visible.slice(0, 3).map((p: any) => {
          const Icon = ICONS[p.type] || Info;
          const color = COLORS[p.type] || COLORS.info;
          return (
            <motion.div
              key={p.id}
              initial={{ opacity: 0, x: 80, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 80, scale: 0.9 }}
              transition={{ type: "spring", damping: 22, stiffness: 240 }}
              className={`relative rounded-2xl border bg-gradient-to-br ${color} backdrop-blur-xl p-4 pr-9 shadow-2xl`}
            >
              <button
                onClick={() => dismiss(p.id)}
                className="absolute top-2 right-2 p-1 rounded-md hover:bg-foreground/10 transition-colors"
                aria-label="Fermer"
              >
                <X size={14} />
              </button>
              <div className="flex gap-3">
                <div className="shrink-0 mt-0.5">
                  <Icon size={20} className="text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-display text-lg leading-tight mb-1">{p.title}</h4>
                  <p className="text-sm text-muted-foreground whitespace-pre-line">{p.content}</p>
                  {p.cta_label && p.cta_url && (
                    <Button
                      asChild
                      size="sm"
                      className="mt-3 h-8"
                    >
                      <a href={p.cta_url} target={p.cta_url.startsWith("http") ? "_blank" : undefined} rel="noreferrer">
                        {p.cta_label}
                      </a>
                    </Button>
                  )}
                </div>
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
};

export default InfoPopupsBanner;