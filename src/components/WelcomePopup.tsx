import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useSiteSettings } from "@/hooks/useSiteSettings";
import { Sparkles } from "lucide-react";

const STORAGE_KEY = "emcoaching_welcome_popup_seen_version";

const WelcomePopup = () => {
  const { data: s } = useSiteSettings();
  const [open, setOpen] = useState(false);

  const enabled = s?.welcome_popup_enabled === "true";
  const version = s?.welcome_popup_version || "1";
  const title = s?.welcome_popup_title || "Bienvenue !";
  const content = s?.welcome_popup_content || "";

  useEffect(() => {
    if (!s) return;
    if (!enabled) return;
    try {
      const seen = localStorage.getItem(STORAGE_KEY);
      if (seen !== version) setOpen(true);
    } catch {
      setOpen(true);
    }
  }, [s, enabled, version]);

  const handleClose = () => {
    try {
      localStorage.setItem(STORAGE_KEY, version);
    } catch {}
    setOpen(false);
  };

  if (!enabled) return null;

  return (
    <Dialog open={open} onOpenChange={(o) => !o && handleClose()}>
      <DialogContent className="max-w-lg border-primary/30 bg-background/95 backdrop-blur-xl">
        <DialogHeader>
          <div className="mx-auto w-12 h-12 rounded-2xl bg-gradient-to-br from-primary/30 to-accent/30 border border-primary/40 flex items-center justify-center mb-2">
            <Sparkles className="text-primary" size={24} />
          </div>
          <DialogTitle className="font-display text-2xl text-center text-gradient-blue">
            {title}
          </DialogTitle>
          <DialogDescription className="text-foreground/80 text-base leading-relaxed whitespace-pre-line text-left pt-2">
            {content}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button onClick={handleClose} className="w-full" size="lg">
            J'ai compris, on y va !
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default WelcomePopup;