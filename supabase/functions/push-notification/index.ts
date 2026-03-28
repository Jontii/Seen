// Supabase Edge Function: push-notification
// Trigger: Database webhook on recommendations insert
// Sends push notification via Expo Push API

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

    // Get sender profile
    const { data: sender } = await supabase
      .from('profiles')
      .select('display_name')
      .eq('id', record.from_user)
      .single();

    // Get recipient's push tokens
    const { data: tokens } = await supabase
      .from('push_tokens')
      .select('expo_push_token')
      .eq('user_id', record.to_user);

    if (!tokens || tokens.length === 0) {
      return new Response('No push tokens', { status: 200 });
    }

    const messages = tokens.map((t: any) => ({
      to: t.expo_push_token,
      sound: 'default',
      title: 'New Recommendation',
      body: `${sender?.display_name || 'A friend'} recommends "${record.title}"`,
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

    return new Response('OK', { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify({ error: (error as Error).message }), { status: 500 });
  }
});
