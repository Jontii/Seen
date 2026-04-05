// Supabase Edge Function: rating-notification
// Trigger: Database webhook on watched insert
// Notifies friends who recommended this movie that the user watched and rated it

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const EXPO_PUSH_URL = 'https://exp.host/--/api/v2/push/send';

serve(async (req) => {
  try {
    const { record } = await req.json();

    if (!record) {
      return new Response('No record', { status: 400 });
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    );

    // Find recommendations for this movie that were sent to this user
    const { data: recs } = await supabase
      .from('recommendations')
      .select('from_user')
      .eq('to_user', record.user_id)
      .eq('tmdb_id', record.tmdb_id);

    if (!recs || recs.length === 0) {
      return new Response('No matching recommendations', { status: 200 });
    }

    // Get the rater's profile
    const { data: rater } = await supabase
      .from('profiles')
      .select('display_name')
      .eq('id', record.user_id)
      .single();

    const raterName = rater?.display_name || 'A friend';

    // For each recommender, send a push notification
    for (const rec of recs) {
      const { data: tokens } = await supabase
        .from('push_tokens')
        .select('expo_push_token')
        .eq('user_id', rec.from_user);

      if (!tokens || tokens.length === 0) continue;

      const messages = tokens.map((t: any) => ({
        to: t.expo_push_token,
        sound: 'default',
        title: 'They watched it!',
        body: `${raterName} watched "${record.title}" and rated it ${record.rating}/10!`,
        data: {
          tmdbId: record.tmdb_id,
          mediaType: record.media_type,
        },
      }));

      await fetch(EXPO_PUSH_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(messages),
      });
    }

    return new Response('OK', { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify({ error: (error as Error).message }), { status: 500 });
  }
});
