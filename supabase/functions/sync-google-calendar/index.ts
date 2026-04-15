import { corsHeaders } from '@supabase/supabase-js/cors'
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
  if (!data.access_token) throw new Error('Failed to refresh access token')
  return data.access_token
}

async function createCalendarEvent(accessToken: string, event: {
  summary: string
  description?: string
  start: string
  end: string
  date: string
}) {
  const startDateTime = `${event.date}T${event.start}:00`
  const endDateTime = `${event.date}T${event.end}:00`

  const res = await fetch('https://www.googleapis.com/calendar/v3/calendars/primary/events', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      summary: event.summary,
      description: event.description || '',
      start: { dateTime: startDateTime, timeZone: 'Europe/Paris' },
      end: { dateTime: endDateTime, timeZone: 'Europe/Paris' },
    }),
  })

  if (!res.ok) {
    const err = await res.text()
    throw new Error(`Google Calendar API error: ${err}`)
  }

  return await res.json()
}

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

    const { data: isAdmin } = await supabase.rpc('has_role', { _user_id: user.id, _role: 'admin' })
    if (!isAdmin) {
      return new Response(JSON.stringify({ error: 'Accès refusé' }), { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    }

    // Get refresh token
    const serviceSupabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    )

    const { data: tokenSetting } = await serviceSupabase
      .from('site_settings')
      .select('value')
      .eq('key', 'google_calendar_refresh_token')
      .single()

    if (!tokenSetting?.value) {
      return new Response(JSON.stringify({ error: 'Google Calendar non connecté' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    }

    const accessToken = await getAccessToken(tokenSetting.value)

    const { action } = await req.json()

    if (action === 'sync_all') {
      // Sync all future time slots
      const today = new Date().toISOString().split('T')[0]

      const { data: timeSlots } = await serviceSupabase
        .from('time_slots')
        .select('*, appointment_types(name)')
        .gte('date', today)
        .order('date')

      const { data: bookings } = await serviceSupabase
        .from('bookings')
        .select('*, time_slots(date, start_time, end_time, appointment_types(name)), profiles:user_id(full_name)')
        .eq('status', 'confirmed')

      let created = 0

      // Sync time slots as available slots
      for (const slot of (timeSlots || [])) {
        if (slot.is_available) {
          await createCalendarEvent(accessToken, {
            summary: `🟢 Créneau dispo - ${(slot as any).appointment_types?.name || 'Coaching'}`,
            description: 'Créneau disponible pour réservation',
            start: slot.start_time,
            end: slot.end_time,
            date: slot.date,
          })
          created++
        }
      }

      // Sync bookings
      for (const booking of (bookings || [])) {
        const ts = (booking as any).time_slots
        const clientName = (booking as any).profiles?.full_name || 'Client'
        if (ts) {
          await createCalendarEvent(accessToken, {
            summary: `🔵 RDV - ${clientName} - ${ts.appointment_types?.name || 'Coaching'}`,
            description: `Réservation confirmée avec ${clientName}`,
            start: ts.start_time,
            end: ts.end_time,
            date: ts.date,
          })
          created++
        }
      }

      return new Response(JSON.stringify({ success: true, created }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    return new Response(JSON.stringify({ error: 'Action inconnue' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
  } catch (error) {
    console.error('Sync error:', error)
    return new Response(JSON.stringify({ error: (error as Error).message }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
  }
})
