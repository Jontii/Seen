-- ============================================================
-- Have You Seen — Phase 2 Database Schema
-- ============================================================

-- Function to generate random 6-char alphanumeric invite codes
create or replace function generate_invite_code()
returns text as $$
declare
  chars text := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; -- no 0/O/1/I for readability
  code text := '';
  i int;
begin
  loop
    code := '';
    for i in 1..6 loop
      code := code || substr(chars, floor(random() * length(chars) + 1)::int, 1);
    end loop;
    -- Check for collision
    if not exists (select 1 from profiles where invite_code = code) then
      return code;
    end if;
  end loop;
end;
$$ language plpgsql;

-- ============================================================
-- Tables
-- ============================================================

-- User profiles (extends Supabase auth.users)
create table profiles (
  id uuid references auth.users on delete cascade primary key,
  display_name text not null,
  avatar_url text,
  invite_code text unique not null default generate_invite_code(),
  created_at timestamptz default now()
);

-- Friendships (bidirectional, smaller UUID always in user_a)
create table friendships (
  id uuid default gen_random_uuid() primary key,
  user_a uuid references profiles(id) on delete cascade not null,
  user_b uuid references profiles(id) on delete cascade not null,
  created_at timestamptz default now(),
  unique(user_a, user_b),
  check (user_a < user_b)
);

-- Watchlist items
create table watchlist (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references profiles(id) on delete cascade not null,
  tmdb_id integer not null,
  imdb_id text,
  media_type text not null check (media_type in ('movie', 'tv')),
  title text not null,
  poster_path text,
  year text,
  added_at timestamptz default now(),
  unique(user_id, tmdb_id)
);

-- Watched items with ratings
create table watched (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references profiles(id) on delete cascade not null,
  tmdb_id integer not null,
  imdb_id text,
  media_type text not null check (media_type in ('movie', 'tv')),
  title text not null,
  poster_path text,
  year text,
  watched_at timestamptz default now(),
  rating integer not null check (rating between 1 and 10),
  note text,
  unique(user_id, tmdb_id)
);

-- Recommendations between friends
create table recommendations (
  id uuid default gen_random_uuid() primary key,
  from_user uuid references profiles(id) on delete cascade not null,
  to_user uuid references profiles(id) on delete cascade not null,
  tmdb_id integer not null,
  imdb_id text,
  media_type text not null check (media_type in ('movie', 'tv')),
  title text not null,
  poster_path text,
  year text,
  message text,
  created_at timestamptz default now(),
  seen_at timestamptz,
  unique(from_user, to_user, tmdb_id)
);

-- Push notification tokens
create table push_tokens (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references profiles(id) on delete cascade not null,
  expo_push_token text not null,
  created_at timestamptz default now(),
  unique(user_id, expo_push_token)
);

-- ============================================================
-- Indexes
-- ============================================================

create index idx_profiles_invite_code on profiles(invite_code);
create index idx_friendships_user_a on friendships(user_a);
create index idx_friendships_user_b on friendships(user_b);
create index idx_watchlist_user_id on watchlist(user_id);
create index idx_watched_user_id on watched(user_id);
create index idx_watched_tmdb_id on watched(tmdb_id);
create index idx_recommendations_to_user on recommendations(to_user, seen_at);
create index idx_recommendations_from_user on recommendations(from_user);

-- ============================================================
-- Helper function: get friend IDs for a user
-- ============================================================

create or replace function get_friend_ids(uid uuid)
returns setof uuid as $$
  select user_b from friendships where user_a = uid
  union
  select user_a from friendships where user_b = uid;
$$ language sql stable security definer;

-- ============================================================
-- Helper function: delete own account (for client-side use)
-- ============================================================

create or replace function delete_own_account()
returns void as $$
begin
  delete from auth.users where id = auth.uid();
end;
$$ language plpgsql security definer;

-- ============================================================
-- Row Level Security
-- ============================================================

-- Profiles
alter table profiles enable row level security;

create policy "Anyone can read profiles"
  on profiles for select using (true);

create policy "Users can insert own profile"
  on profiles for insert with check (auth.uid() = id);

create policy "Users can update own profile"
  on profiles for update using (auth.uid() = id);

-- Friendships
alter table friendships enable row level security;

create policy "Users can read own friendships"
  on friendships for select using (
    auth.uid() = user_a or auth.uid() = user_b
  );

create policy "Users can create friendships they are part of"
  on friendships for insert with check (
    auth.uid() = user_a or auth.uid() = user_b
  );

create policy "Users can delete own friendships"
  on friendships for delete using (
    auth.uid() = user_a or auth.uid() = user_b
  );

-- Watchlist
alter table watchlist enable row level security;

create policy "Users can manage own watchlist"
  on watchlist for all using (auth.uid() = user_id);

create policy "Friends can view watchlist"
  on watchlist for select using (
    user_id in (select get_friend_ids(auth.uid()))
  );

-- Watched
alter table watched enable row level security;

create policy "Users can manage own watched"
  on watched for all using (auth.uid() = user_id);

create policy "Friends can view watched"
  on watched for select using (
    user_id in (select get_friend_ids(auth.uid()))
  );

-- Recommendations
alter table recommendations enable row level security;

create policy "Users can read own recommendations"
  on recommendations for select using (
    auth.uid() = from_user or auth.uid() = to_user
  );

create policy "Users can send recommendations"
  on recommendations for insert with check (
    auth.uid() = from_user
  );

create policy "Recipients can update recommendations (mark seen)"
  on recommendations for update using (
    auth.uid() = to_user
  );

create policy "Senders can delete recommendations"
  on recommendations for delete using (
    auth.uid() = from_user
  );

-- Push tokens
alter table push_tokens enable row level security;

create policy "Users can manage own push tokens"
  on push_tokens for all using (auth.uid() = user_id);
