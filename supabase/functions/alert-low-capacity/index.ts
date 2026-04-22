import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

serve(async () => {
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  )

  // Récupère les events avec capacity définie
  const { data: events } = await supabase
    .from('events')
    .select('id, title, capacity, organizer_id')
    .not('capacity', 'is', null)
    .gt('date', new Date().toISOString())

  if (!events) return new Response('No events', { status: 200 })

  for (const event of events) {
    // Compte les réservations
    const { count } = await supabase
      .from('reservations')
      .select('id', { count: 'exact' })
      .eq('event_id', event.id)

    const remaining = event.capacity - (count ?? 0)

    // Alerte si 5 places ou moins restantes
    if (remaining <= 5 && remaining > 0) {
      // Vérifie qu'on a pas déjà envoyé cette alerte aujourd'hui
      const today = new Date().toISOString().split('T')[0]
      const { data: existing } = await supabase
        .from('notifications')
        .select('id')
        .eq('user_id', event.organizer_id)
        .eq('event_id', event.id)
        .eq('type', 'alert')
        .gte('created_at', today)
        .limit(1)

      if (!existing || existing.length === 0) {
        await supabase.from('notifications').insert({
          user_id: event.organizer_id,
          title: `Plus que ${remaining} place${remaining > 1 ? 's' : ''} !`,
          subtitle: event.title,
          type: 'alert',
          emoji: '⚡',
          emoji_bg: '#5C1A1A',
          read: false,
          event_id: event.id,
        })
      }
    }
  }

  return new Response('Done', { status: 200 })
})
