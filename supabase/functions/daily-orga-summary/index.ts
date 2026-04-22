import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

serve(async () => {
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  )

  // Récupère tous les organisateurs
  const { data: organizers } = await supabase
    .from('profiles')
    .select('id')
    .eq('role', 'organizer')

  if (!organizers) return new Response('No organizers', { status: 200 })

  const now = new Date()
  const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000)

  for (const orga of organizers) {
    // Compte les réservations des dernières 24h sur ses events
    const { count } = await supabase
      .from('reservations')
      .select('id', { count: 'exact' })
      .gte('created_at', yesterday.toISOString())
      .in('event_id', 
        (await supabase
          .from('events')
          .select('id')
          .eq('organizer_id', orga.id)
        ).data?.map(e => e.id) ?? []
      )

    if (count && count > 0) {
      await supabase.from('notifications').insert({
        user_id: orga.id,
        title: `${count} nouvelle${count > 1 ? 's' : ''} réservation${count > 1 ? 's' : ''} aujourd'hui`,
        subtitle: 'Consulte tes events pour voir le détail',
        type: 'reservation',
        emoji: '🎟️',
        emoji_bg: '#0F3D2A',
        read: false,
      })
    }
  }

  return new Response('Done', { status: 200 })
})
