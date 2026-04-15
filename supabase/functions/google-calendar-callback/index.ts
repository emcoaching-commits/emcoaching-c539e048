import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

Deno.serve(async (req) => {
  try {
    const url = new URL(req.url)
    const code = url.searchParams.get('code')
    const origin = url.searchParams.get('state') || 'https://emcoaching.lovable.app'
    const error = url.searchParams.get('error')

    if (error) {
      return Response.redirect(`${origin}/admin?gcal=error&reason=${error}`, 302)
    }

    if (!code) {
      return Response.redirect(`${origin}/admin?gcal=error&reason=no_code`, 302)
    }

    const clientId = Deno.env.get('GOOGLE_CALENDAR_CLIENT_ID')!
    const clientSecret = Deno.env.get('GOOGLE_CALENDAR_CLIENT_SECRET')!
    const redirectUri = `${Deno.env.get('SUPABASE_URL')}/functions/v1/google-calendar-callback`

    // Exchange code for tokens
    const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: 'authorization_code',
      }),
    })

    const tokens = await tokenRes.json()

    if (!tokens.refresh_token) {
      console.error('No refresh token received:', tokens)
      return Response.redirect(`${origin}/admin?gcal=error&reason=no_refresh_token`, 302)
    }

    // Get user email from Google
    const userInfoRes = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: { Authorization: `Bearer ${tokens.access_token}` },
    })
    const userInfo = await userInfoRes.json()

    // Store refresh token and email in site_settings using service role
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    )

    // Upsert refresh token
    await supabase.from('site_settings').upsert(
      { key: 'google_calendar_refresh_token', value: tokens.refresh_token },
      { onConflict: 'key' }
    )

    // Upsert connected email
    await supabase.from('site_settings').upsert(
      { key: 'google_calendar_email', value: userInfo.email || '' },
      { onConflict: 'key' }
    )

    return Response.redirect(`${origin}/admin?gcal=success`, 302)
  } catch (error) {
    console.error('Callback error:', error)
    const origin = new URL(req.url).searchParams.get('state') || 'https://emcoaching.lovable.app'
    return Response.redirect(`${origin}/admin?gcal=error&reason=server_error`, 302)
  }
})
