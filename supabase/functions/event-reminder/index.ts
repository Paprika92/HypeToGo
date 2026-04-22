import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

serve(async () => {
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  )

  const now = new Date()
  const in24h = new Date(now.getTime() + 24 * 60 * 60 * 1000)
  const in25h = new Date(now.getTime() + 25 * 60 * 60 * 1000)

  // Events qui commencent dans les prochaines 24-25h
  const { data: events } = await supabase
    .from('events')
    .select('id, title, organizer_id, date')
    .gte('date', in24h.toISOString())
    .lte('date', in25h.toISOString())

  if (!events) return new Response('No events', { status: 200 })

  for (const event of events) {
    // Notif à l'orga
    await supabase.from('notifications').insert({
      user_id: event.organizer_id,
      title: 'Ton event commence demain !',
      subtitle: event.title,
      type: 'event',
      emoji: '🔔',
      emoji_bg: '#3A2870',
      read: false,
      event_id: event.id,
    })

    // Notif aux users qui ont réservé
    const { data: reservations } = await supabase
      .from('reservations')
      .select('user_id')
      .eq('event_id', event.id)

    if (reservations) {
      for (const resa of reservations) {
        await supabase.from('notifications').insert({
          user_id: resa.user_id,
          title: 'Rappel — Ce soir !',
          subtitle: event.title,
          type: 'reminder',
          emoji: '🎟️',
          emoji_bg: '#3A2870',
          read: false,
          event_id: event.id,
        })
      }
    }
  }

  return new Response('Done', { status: 200 })
})
