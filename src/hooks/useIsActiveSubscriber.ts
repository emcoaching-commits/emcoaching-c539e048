import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

/**
 * Renvoie true si l'utilisateur connecté a un abonnement validé
 * par l'admin (profiles.has_active_subscription = true).
 * Renvoie false sinon (visiteur non connecté ou client sans abonnement).
 */
export const useIsActiveSubscriber = () => {
  const [isActive, setIsActive] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const check = async (userId: string | null) => {
      if (!userId) {
        if (mounted) { setIsActive(false); setLoading(false); }
        return;
      }
      const { data } = await supabase
        .from("profiles")
        .select("has_active_subscription")
        .eq("user_id", userId)
        .maybeSingle();
      if (mounted) {
        setIsActive(!!data?.has_active_subscription);
        setLoading(false);
      }
    };

    supabase.auth.getSession().then(({ data }) => check(data.session?.user?.id ?? null));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      setLoading(true);
      check(session?.user?.id ?? null);
    });
    return () => { mounted = false; subscription.unsubscribe(); };
  }, []);

  return { isActive, loading };
};
