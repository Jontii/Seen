-- Create avatars storage bucket
insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true);

-- Allow authenticated users to upload their own avatar
create policy "Users can upload own avatar"
  on storage.objects for insert
  with check (
    bucket_id = 'avatars'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

-- Allow users to update (overwrite) their own avatar
create policy "Users can update own avatar"
  on storage.objects for update
  using (
    bucket_id = 'avatars'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

-- Allow anyone to read avatars (they're public)
create policy "Anyone can read avatars"
  on storage.objects for select
  using (bucket_id = 'avatars');
