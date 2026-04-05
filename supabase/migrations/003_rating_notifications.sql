-- ============================================================
-- Rating Notification Trigger
-- ============================================================
-- When a user marks a movie as watched, check if any friend
-- recommended it to them. If so, call the rating-notification
-- edge function to send a push notification.
--
-- Only fires on INSERT (not UPDATE), so re-ratings won't
-- trigger duplicate notifications.
--
-- SETUP: Store service role key in Supabase Vault:
--   Dashboard → SQL Editor → Run:
--   SELECT vault.create_secret('your-service-role-key-here', 'service_role_key');
-- ============================================================

create extension if not exists pg_net with schema extensions;

create or replace function notify_recommender_on_watch()
returns trigger as $$
declare
  has_recommendation boolean;
  service_key text;
begin
  select exists(
    select 1 from recommendations
    where to_user = NEW.user_id
      and tmdb_id = NEW.tmdb_id
  ) into has_recommendation;

  if not has_recommendation then
    return NEW;
  end if;

  select decrypted_secret into service_key
    from vault.decrypted_secrets
    where name = 'service_role_key'
    limit 1;

  if service_key is null then
    return NEW;
  end if;

  perform net.http_post(
    url := 'https://tixvxuypimsvvqemhckh.supabase.co/functions/v1/rating-notification',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || service_key
    ),
    body := jsonb_build_object(
      'record', jsonb_build_object(
        'user_id', NEW.user_id,
        'tmdb_id', NEW.tmdb_id,
        'title', NEW.title,
        'rating', NEW.rating,
        'media_type', NEW.media_type
      )
    )
  );

  return NEW;
end;
$$ language plpgsql security definer;

create trigger on_watched_insert_notify
  after insert on watched
  for each row
  execute function notify_recommender_on_watch();
