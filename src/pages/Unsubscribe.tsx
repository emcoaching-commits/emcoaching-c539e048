import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string;
const SUPABASE_ANON = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string;

export default function Unsubscribe() {
  const params = new URLSearchParams(window.location.search);
  const token = params.get("token") ?? "";
  const [state, setState] = useState<"loading" | "valid" | "already" | "invalid" | "done" | "error">("loading");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!token) { setState("invalid"); return; }
    (async () => {
      try {
        const res = await fetch(
          `${SUPABASE_URL}/functions/v1/handle-email-unsubscribe?token=${encodeURIComponent(token)}`,
          { headers: { apikey: SUPABASE_ANON } }
        );
        const json = await res.json();
        if (!res.ok) { setState("invalid"); return; }
        if (json.valid === false && json.reason === "already_unsubscribed") setState("already");
        else if (json.valid) setState("valid");
        else setState("invalid");
      } catch {
        setState("error");
      }
    })();
  }, [token]);

  const confirm = async () => {
    setSubmitting(true);
    try {
      const res = await fetch(`${SUPABASE_URL}/functions/v1/handle-email-unsubscribe`, {
        method: "POST",
        headers: { "Content-Type": "application/json", apikey: SUPABASE_ANON },
        body: JSON.stringify({ token }),
      });
      if (res.ok) setState("done"); else setState("error");
    } catch {
      setState("error");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="max-w-md w-full bg-card border rounded-2xl p-8 text-center shadow-sm">
        <h1 className="text-2xl font-bold mb-4">Désabonnement</h1>
        {state === "loading" && <p className="text-muted-foreground">Vérification du lien…</p>}
        {state === "valid" && (
          <>
            <p className="text-muted-foreground mb-6">Confirme ton désabonnement pour ne plus recevoir d'emails.</p>
            <Button onClick={confirm} disabled={submitting}>
              {submitting ? "En cours…" : "Confirmer le désabonnement"}
            </Button>
          </>
        )}
        {state === "already" && <p className="text-muted-foreground">Tu es déjà désabonné(e).</p>}
        {state === "done" && <p className="text-foreground">✓ Désabonnement confirmé.</p>}
        {state === "invalid" && <p className="text-destructive">Lien invalide ou expiré.</p>}
        {state === "error" && <p className="text-destructive">Une erreur est survenue. Réessaie plus tard.</p>}
      </div>
    </main>
  );
}