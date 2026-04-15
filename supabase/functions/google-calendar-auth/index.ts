const corsHeaders = { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type' }
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Verify admin
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Non autorisé' }), { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: authHeader } } }
    )

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return new Response(JSON.stringify({ error: 'Non autorisé' }), { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    }

    // Check admin role
    const { data: roleData } = await supabase.rpc('has_role', { _user_id: user.id, _role: 'admin' })
    if (!roleData) {
      return new Response(JSON.stringify({ error: 'Accès refusé' }), { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    }

    const clientId = Deno.env.get('GOOGLE_CALENDAR_CLIENT_ID')
    if (!clientId) {
      return new Response(JSON.stringify({ error: 'GOOGLE_CALENDAR_CLIENT_ID non configuré' }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    }

    const { origin } = await req.json()
    const redirectUri = `${Deno.env.get('SUPABASE_URL')}/functions/v1/google-calendar-callback`

    const scopes = [
      'https://www.googleapis.com/auth/calendar',
      'https://www.googleapis.com/auth/calendar.events',
    ].join(' ')

    const params = new URLSearchParams({
      client_id: clientId,
      redirect_uri: redirectUri,
      response_type: 'code',
      scope: scopes,
      access_type: 'offline',
      prompt: 'consent',
      state: origin,
    })

    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`

    return new Response(JSON.stringify({ url: authUrl }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (error) {
    console.error('Error:', error)
    return new Response(JSON.stringify({ error: 'Erreur serveur' }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
  }
})
