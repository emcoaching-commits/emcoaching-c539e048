const corsHeaders = { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type' }
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

async function getAccessToken(refreshToken: string): Promise<string> {
  const clientId = Deno.env.get('GOOGLE_CALENDAR_CLIENT_ID')!
  const clientSecret = Deno.env.get('GOOGLE_CALENDAR_CLIENT_SECRET')!

  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      refresh_token: refreshToken,
      grant_type: 'refresh_token',
    }),
  })

  const data = await res.json()
  if (!data.access_token) {
    console.error('Token refresh failed:', data)
    throw new Error('Failed to refresh access token: ' + JSON.stringify(data))
  }
  return data.access_token
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { booking_id } = await req.json()
    if (!booking_id) {
      return new Response(JSON.stringify({ error: 'booking_id requis' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    )

    // Get refresh token
    const { data: tokenSetting } = await supabase
      .from('site_settings')
      .select('value')
      .eq('key', 'google_calendar_refresh_token')
      .single()

    if (!tokenSetting?.value) {
      console.log('Google Calendar non connecté, skip')
      return new Response(JSON.stringify({ skipped: true, reason: 'not_connected' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Get booking + slot + client
    const { data: booking, error: bErr } = await supabase
      .from('bookings')
      .select('*, time_slots(date, start_time, end_time, appointment_types(name))')
      .eq('id', booking_id)
      .single()

    if (bErr || !booking) {
      console.error('Booking not found:', bErr)
      return new Response(JSON.stringify({ error: 'Réservation introuvable' }), { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('full_name, phone')
      .eq('user_id', booking.user_id)
      .maybeSingle()

    const ts = (booking as any).time_slots
    if (!ts) {
      return new Response(JSON.stringify({ error: 'Créneau introuvable' }), { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    }

    const clientName = profile?.full_name || 'Client'
    const phone = profile?.phone ? `\nTél : ${profile.phone}` : ''
    const typeName = ts.appointment_types?.name || 'Coaching'

    const accessToken = await getAccessToken(tokenSetting.value)

    const startDateTime = `${ts.date}T${ts.start_time}`
    const endDateTime = `${ts.date}T${ts.end_time}`

    const res = await fetch('https://www.googleapis.com/calendar/v3/calendars/primary/events', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        summary: `🔵 RDV ${typeName} - ${clientName}`,
        description: `Réservation confirmée avec ${clientName}.${phone}`,
        start: { dateTime: startDateTime, timeZone: 'Europe/Paris' },
        end: { dateTime: endDateTime, timeZone: 'Europe/Paris' },
      }),
    })

    if (!res.ok) {
      const err = await res.text()
      console.error('Google Calendar API error:', err)
      return new Response(JSON.stringify({ error: err }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    }

    const event = await res.json()
    console.log('Event created:', event.id)

    return new Response(JSON.stringify({ success: true, event_id: event.id }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (error) {
    console.error('Sync error:', error)
    return new Response(JSON.stringify({ error: (error as Error).message }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
  }
})
