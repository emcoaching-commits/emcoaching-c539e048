import { createClient } from 'npm:@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const TZ = 'Europe/Paris'
const RECIPIENT = 'emcoaching@emcoachingfr.com'

function parisDateParts(d = new Date()) {
  const f = new Intl.DateTimeFormat('fr-FR', {
    timeZone: TZ, year: 'numeric', month: '2-digit', day: '2-digit',
    weekday: 'long',
  })
  const parts = Object.fromEntries(f.formatToParts(d).map(p => [p.type, p.value]))
  const iso = `${parts.year}-${parts.month}-${parts.day}`
  const label = new Intl.DateTimeFormat('fr-FR', {
    timeZone: TZ, weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  }).format(d)
  return { iso, label }
}

function fmtTime(t: string) {
  return (t ?? '').slice(0, 5)
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders })

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    )

    const body = await req.json().catch(() => ({}))
    const isTest = !!body?.test

    const now = new Date()
    const { iso: today, label: dateLabel } = parisDateParts(now)
    const tomorrow = new Date(now.getTime() + 24 * 3600 * 1000)
    const { iso: tomorrowIso } = parisDateParts(tomorrow)

    // Bounds for "today" in Paris (approx UTC range)
    const startOfDay = new Date(`${today}T00:00:00+02:00`).toISOString()
    const endOfDay = new Date(`${today}T23:59:59+02:00`).toISOString()

    // 1) New bookings created today
    const { data: bookingsRaw } = await supabase
      .from('bookings')
      .select('id, status, created_at, user_id, time_slot_id, pricing_plan_id')
      .gte('created_at', startOfDay)
      .lte('created_at', endOfDay)

    const userIds = Array.from(new Set((bookingsRaw ?? []).map(b => b.user_id)))
    const slotIds = Array.from(new Set((bookingsRaw ?? []).map(b => b.time_slot_id)))

    const [{ data: bUsers }, { data: bSlots }] = await Promise.all([
      userIds.length
        ? supabase.from('profiles').select('user_id, full_name').in('user_id', userIds)
        : Promise.resolve({ data: [] as any[] }),
      slotIds.length
        ? supabase.from('time_slots').select('id, date, start_time').in('id', slotIds)
        : Promise.resolve({ data: [] as any[] }),
    ])
    const nameOf = (uid: string) => bUsers?.find(u => u.user_id === uid)?.full_name ?? 'Client'
    const slotOf = (sid: string) => bSlots?.find(s => s.id === sid)

    const newBookings = (bookingsRaw ?? [])
      .filter(b => b.status !== 'cancelled')
      .map(b => {
        const s = slotOf(b.time_slot_id)
        return { label: nameOf(b.user_id), detail: s ? `${s.date} à ${fmtTime(s.start_time)}` : '' }
      })

    const cancellations = (bookingsRaw ?? [])
      .filter(b => b.status === 'cancelled')
      .map(b => {
        const s = slotOf(b.time_slot_id)
        return { label: nameOf(b.user_id), detail: s ? `${s.date} à ${fmtTime(s.start_time)}` : '' }
      })

    // 2) Payments due tomorrow
    const { data: payProfiles } = await supabase
      .from('profiles')
      .select('full_name, next_payment_date, payment_reminder_active')
      .eq('next_payment_date', tomorrowIso)
    const paymentsTomorrow = (payProfiles ?? []).map(p => ({
      label: p.full_name ?? 'Client',
      detail: `Paiement prévu le ${tomorrowIso}`,
    }))

    // 3) Profile updates today (excluding creations same-day)
    const { data: updatedProfiles } = await supabase
      .from('profiles')
      .select('full_name, created_at, updated_at')
      .gte('updated_at', startOfDay)
      .lte('updated_at', endOfDay)
    const profileUpdates = (updatedProfiles ?? [])
      .filter(p => p.created_at < startOfDay)
      .map(p => ({ label: p.full_name ?? 'Client' }))

    // 4) New profiles today
    const { data: createdProfiles } = await supabase
      .from('profiles')
      .select('full_name, created_at')
      .gte('created_at', startOfDay)
      .lte('created_at', endOfDay)
    const newProfiles = (createdProfiles ?? []).map(p => ({ label: p.full_name ?? 'Nouveau client' }))

    // 5) Account deletions today
    const { data: dels } = await supabase
      .from('account_deletion_reasons')
      .select('full_name, email, reason, created_at')
      .gte('created_at', startOfDay)
      .lte('created_at', endOfDay)
    const deletions = (dels ?? []).map(d => ({
      label: d.full_name ?? d.email ?? 'Compte supprimé',
      detail: d.reason ? `Raison : ${d.reason}` : undefined,
    }))

    // 6) New reviews today
    const { data: reviews } = await supabase
      .from('reviews')
      .select('*')
      .gte('created_at', startOfDay)
      .lte('created_at', endOfDay)
    const newReviews = (reviews ?? []).map((r: any) => ({
      label: r.author_name ?? r.full_name ?? 'Client',
      detail: `${r.rating ?? '?'}★${r.comment ? ` — "${String(r.comment).slice(0, 60)}"` : ''}`,
    }))

    // 7) Questionnaires today
    const { data: questResp } = await supabase
      .from('questionnaire_responses')
      .select('*')
      .gte('created_at', startOfDay)
      .lte('created_at', endOfDay)
    const qUserIds = Array.from(new Set((questResp ?? []).map((q: any) => q.user_id).filter(Boolean)))
    const { data: qUsers } = qUserIds.length
      ? await supabase.from('profiles').select('user_id, full_name').in('user_id', qUserIds)
      : { data: [] as any[] }
    const questionnaires = (questResp ?? []).map((q: any) => ({
      label: qUsers?.find(u => u.user_id === q.user_id)?.full_name ?? q.full_name ?? 'Client',
    }))

    // 8) Active users today (approximation via profile updated_at)
    const activeCount = (updatedProfiles ?? []).length
    const activeUsers = activeCount > 0
      ? [{ label: `${activeCount} client${activeCount > 1 ? 's' : ''} actif${activeCount > 1 ? 's' : ''} aujourd'hui` }]
      : []

    const stats = [
      { label: 'rendez-vous pris', value: newBookings.length },
      { label: 'annulation(s)', value: cancellations.length },
      { label: 'nouveau(x) compte(s)', value: newProfiles.length },
      { label: 'paiement(s) à demander demain', value: paymentsTomorrow.length },
    ]

    const templateData = {
      dateLabel,
      isTest,
      stats,
      newBookings, cancellations, paymentsTomorrow,
      profileUpdates, newProfiles, deletions,
      newReviews, questionnaires, activeUsers,
    }

    const idempotencyKey = `daily-summary-${today}${isTest ? `-test-${Date.now()}` : ''}`

    const { error } = await supabase.functions.invoke('send-transactional-email', {
      body: {
        templateName: 'daily-summary',
        recipientEmail: RECIPIENT,
        idempotencyKey,
        templateData,
      },
      headers: {
        Authorization: `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`,
      },
    })

    if (error) {
      console.error('[daily-summary] send error', error)
      return new Response(JSON.stringify({ ok: false, error: String(error) }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    return new Response(JSON.stringify({ ok: true, date: today, isTest, stats }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (e) {
    console.error('[daily-summary] error', e)
    return new Response(JSON.stringify({ ok: false, error: String(e) }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})