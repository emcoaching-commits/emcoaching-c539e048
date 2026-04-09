import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("Missing auth");

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Verify caller is admin
    const supabaseUser = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_PUBLISHABLE_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );
    const { data: { user: caller } } = await supabaseUser.auth.getUser();
    if (!caller) throw new Error("Not authenticated");

    const { data: roleData } = await supabaseAdmin.from("user_roles").select("role").eq("user_id", caller.id).eq("role", "admin");
    if (!roleData || roleData.length === 0) throw new Error("Not admin");

    const { user_id } = await req.json();
    if (!user_id) throw new Error("Missing user_id");
    if (user_id === caller.id) throw new Error("Cannot delete yourself");

    // Delete related data first
    await supabaseAdmin.from("messages").delete().or(`sender_id.eq.${user_id},receiver_id.eq.${user_id}`);
    await supabaseAdmin.from("bookings").delete().eq("user_id", user_id);
    await supabaseAdmin.from("questionnaire_responses").delete().eq("user_id", user_id);
    await supabaseAdmin.from("reviews").delete().eq("user_id", user_id);
    await supabaseAdmin.from("notifications").delete().eq("client_id", user_id);
    await supabaseAdmin.from("user_roles").delete().eq("user_id", user_id);
    await supabaseAdmin.from("profiles").delete().eq("user_id", user_id);

    // Delete auth user
    const { error } = await supabaseAdmin.auth.admin.deleteUser(user_id);
    if (error) throw error;

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
