import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
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
    if (!authHeader) {
      console.error("[delete-user] Missing Authorization header");
      return json({ error: "Missing Authorization header" }, 401);
    }

    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    const ANON_KEY =
      Deno.env.get("SUPABASE_ANON_KEY") ?? Deno.env.get("SUPABASE_PUBLISHABLE_KEY");

    if (!SUPABASE_URL || !SERVICE_ROLE || !ANON_KEY) {
      console.error("[delete-user] Missing env vars", {
        hasUrl: !!SUPABASE_URL,
        hasService: !!SERVICE_ROLE,
        hasAnon: !!ANON_KEY,
      });
      return json({ error: "Server configuration error" }, 500);
    }

    const supabaseAdmin = createClient(SUPABASE_URL, SERVICE_ROLE);
    const supabaseUser = createClient(SUPABASE_URL, ANON_KEY, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: userData, error: userErr } = await supabaseUser.auth.getUser();
    if (userErr || !userData?.user) {
      console.error("[delete-user] Auth failed", userErr);
      return json({ error: "Not authenticated" }, 401);
    }
    const caller = userData.user;

    const { data: roleData, error: roleErr } = await supabaseAdmin
      .from("user_roles")
      .select("role")
      .eq("user_id", caller.id)
      .eq("role", "admin");
    if (roleErr) {
      console.error("[delete-user] Role check error", roleErr);
      return json({ error: "Role check failed", details: roleErr.message }, 500);
    }
    if (!roleData || roleData.length === 0) {
      console.warn("[delete-user] Caller is not admin", caller.id);
      return json({ error: "Forbidden: admin only" }, 403);
    }

    let body: any = null;
    try {
      body = await req.json();
    } catch (_e) {
      return json({ error: "Invalid JSON body" }, 400);
    }
    const user_id = body?.user_id;
    if (!user_id || typeof user_id !== "string") {
      return json({ error: "Missing or invalid user_id" }, 400);
    }
    if (user_id === caller.id) {
      return json({ error: "Cannot delete yourself" }, 400);
    }

    console.log("[delete-user] Deleting user", user_id);

    // Delete related data — log every error but continue (some tables may be empty)
    const safeDelete = async (table: string, fn: () => Promise<{ error: any }>) => {
      const { error } = await fn();
      if (error) console.error(`[delete-user] ${table} delete error`, error);
    };

    await safeDelete("messages-sent", () =>
      supabaseAdmin.from("messages").delete().eq("sender_id", user_id),
    );
    await safeDelete("messages-received", () =>
      supabaseAdmin.from("messages").delete().eq("receiver_id", user_id),
    );
    await safeDelete("bookings", () =>
      supabaseAdmin.from("bookings").delete().eq("user_id", user_id),
    );
    await safeDelete("questionnaire_responses", () =>
      supabaseAdmin.from("questionnaire_responses").delete().eq("user_id", user_id),
    );
    await safeDelete("reviews", () =>
      supabaseAdmin.from("reviews").delete().eq("user_id", user_id),
    );
    await safeDelete("notifications", () =>
      supabaseAdmin.from("notifications").delete().eq("client_id", user_id),
    );
    await safeDelete("user_roles", () =>
      supabaseAdmin.from("user_roles").delete().eq("user_id", user_id),
    );
    await safeDelete("profiles", () =>
      supabaseAdmin.from("profiles").delete().eq("user_id", user_id),
    );

    const { error: authDeleteError } = await supabaseAdmin.auth.admin.deleteUser(user_id);
    if (authDeleteError) {
      console.error("[delete-user] Auth delete error", authDeleteError);
      return json(
        { error: "Failed to delete auth user", details: authDeleteError.message },
        500,
      );
    }

    console.log("[delete-user] Success", user_id);
    return json({ success: true, message: "User deleted" }, 200);
  } catch (err: any) {
    console.error("[delete-user] Unexpected error", err);
    return json(
      { error: "Internal server error", details: err?.message ?? String(err) },
      500,
    );
  }
});
