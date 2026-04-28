// Notification email à Emma quand un client réserve un RDV.
// Tant que le domaine email n'est pas configuré, la fonction log et retourne 200.
// Une fois le domaine + Lovable Emails configurés, brancher l'enqueue ici.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { booking_slot_id, user_id } = await req.json();
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { data: slot } = await supabase
      .from("time_slots")
      .select("date, start_time, end_time, appointment_types(name)")
      .eq("id", booking_slot_id)
      .maybeSingle();

    const { data: profile } = await supabase
      .from("profiles")
      .select("full_name, phone")
      .eq("user_id", user_id)
      .maybeSingle();

    console.log("[notify-booking] Nouvelle réservation", { slot, profile });

    // TODO: brancher l'envoi d'email via la queue Lovable Emails
    // (nécessite la configuration du domaine d'envoi).
    // await supabase.rpc("enqueue_email", {
    //   p_to: "emcoaching@emcoachingfr.com",
    //   p_subject: `Nouveau RDV — ${profile?.full_name ?? "Client"}`,
    //   p_html: `...`,
    //   p_purpose: "transactional",
    // });

    return new Response(JSON.stringify({ ok: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("[notify-booking] error", e);
    return new Response(JSON.stringify({ ok: false, error: String(e) }), {
      status: 200, // best-effort, on ne casse jamais la réservation
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});