import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) return json({ error: "Missing Authorization header" }, 401);

    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY") ?? Deno.env.get("SUPABASE_PUBLISHABLE_KEY")!;

    const supabaseUser = createClient(SUPABASE_URL, ANON_KEY, {
      global: { headers: { Authorization: authHeader } },
    });
    const supabaseAdmin = createClient(SUPABASE_URL, SERVICE_ROLE);

    const { data: userData, error: userErr } = await supabaseUser.auth.getUser();
    if (userErr || !userData?.user) return json({ error: "Not authenticated" }, 401);
    const user = userData.user;

    let body: any = {};
    try { body = await req.json(); } catch (_e) {}
    const { email, password, reason } = body ?? {};
    if (!email || !password) return json({ error: "Email et mot de passe requis" }, 400);
    const reasonStr = typeof reason === "string" ? reason.trim() : "";
    if (reasonStr.length < 3) return json({ error: "Merci d'indiquer une raison (min. 3 caractères)" }, 400);
    if (reasonStr.length > 2000) return json({ error: "Raison trop longue (max 2000 caractères)" }, 400);

    if (typeof user.email !== "string" || user.email.toLowerCase() !== String(email).toLowerCase()) {
      return json({ error: "L'email ne correspond pas à ton compte" }, 400);
    }

    // Re-authenticate by attempting a fresh sign-in (does not affect current session)
    const verifyClient = createClient(SUPABASE_URL, ANON_KEY);
    const { error: signInErr } = await verifyClient.auth.signInWithPassword({ email, password });
    if (signInErr) return json({ error: "Mot de passe incorrect" }, 401);

    // Block admins from self-deleting (avoid losing the sole admin)
    const { data: roles } = await supabaseAdmin
      .from("user_roles").select("role").eq("user_id", user.id).eq("role", "admin");
    if (roles && roles.length > 0) {
      return json({ error: "Un compte admin ne peut pas être supprimé depuis cette page." }, 403);
    }

    const uid = user.id;

    // Récupère le nom complet pour archive (avant suppression du profil)
    const { data: profileRow } = await supabaseAdmin
      .from("profiles").select("full_name").eq("user_id", uid).maybeSingle();

    const { error: reasonErr } = await supabaseAdmin
      .from("account_deletion_reasons")
      .insert({
        deleted_user_id: uid,
        email: user.email ?? email,
        full_name: profileRow?.full_name ?? null,
        reason: reasonStr,
      });
    if (reasonErr) {
      console.error("[delete-own-account] reason insert", reasonErr);
      return json({ error: "Impossible d'enregistrer la raison, suppression annulée." }, 500);
    }

    const safe = async (label: string, fn: () => Promise<{ error: any }>) => {
      const { error } = await fn();
      if (error) console.error(`[delete-own-account] ${label}`, error);
    };

    await safe("messages-sent", () => supabaseAdmin.from("messages").delete().eq("sender_id", uid));
    await safe("messages-received", () => supabaseAdmin.from("messages").delete().eq("receiver_id", uid));
    await safe("bookings", () => supabaseAdmin.from("bookings").delete().eq("user_id", uid));
    await safe("questionnaire_responses", () => supabaseAdmin.from("questionnaire_responses").delete().eq("user_id", uid));
    await safe("reviews", () => supabaseAdmin.from("reviews").delete().eq("user_id", uid));
    await safe("notifications", () => supabaseAdmin.from("notifications").delete().eq("client_id", uid));
    await safe("user_roles", () => supabaseAdmin.from("user_roles").delete().eq("user_id", uid));
    await safe("profiles", () => supabaseAdmin.from("profiles").delete().eq("user_id", uid));

    const { error: delErr } = await supabaseAdmin.auth.admin.deleteUser(uid);
    if (delErr) {
      console.error("[delete-own-account] auth delete", delErr);
      return json({ error: "Échec de la suppression du compte", details: delErr.message }, 500);
    }

    return json({ success: true });
  } catch (err: any) {
    console.error("[delete-own-account] unexpected", err);
    return json({ error: "Erreur interne", details: err?.message ?? String(err) }, 500);
  }
});
