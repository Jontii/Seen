-- ============================================================
-- Demo User Seed Data
-- ============================================================
-- Run this AFTER creating the 3 demo users in Supabase Dashboard:
--   Authentication → Users → Add User (email + password)
--   alice@demo.seen / demo1234
--   bob@demo.seen   / demo1234
--   charlie@demo.seen / demo1234
--
-- Then replace the UUIDs below with the actual UUIDs from the dashboard.
-- ============================================================

-- Step 1: Get the UUIDs
-- Run this query first to find them:
-- SELECT id, email FROM auth.users WHERE email LIKE '%@demo.seen';

-- Step 2: Insert profiles (replace UUIDs with actual values)
-- INSERT INTO profiles (id, display_name) VALUES
--   ('ALICE_UUID_HERE', 'Alice'),
--   ('BOB_UUID_HERE', 'Bob'),
--   ('CHARLIE_UUID_HERE', 'Charlie');

-- Step 3: Make them all friends with each other
-- (Remember: user_a must be the smaller UUID)
-- Sort the UUIDs alphabetically and use the smaller one as user_a:
--
-- INSERT INTO friendships (user_a, user_b) VALUES
--   ('SMALLER_UUID', 'LARGER_UUID'),  -- Alice <-> Bob
--   ('SMALLER_UUID', 'LARGER_UUID'),  -- Alice <-> Charlie
--   ('SMALLER_UUID', 'LARGER_UUID');  -- Bob <-> Charlie

-- ============================================================
-- QUICK VERSION: Replace the 3 UUIDs and run everything at once
-- ============================================================

DO $$
DECLARE
  alice_id uuid;
  bob_id uuid;
  charlie_id uuid;
  pair1_a uuid;
  pair1_b uuid;
  pair2_a uuid;
  pair2_b uuid;
  pair3_a uuid;
  pair3_b uuid;
BEGIN
  SELECT id INTO alice_id FROM auth.users WHERE email = 'alice@demo.seen';
  SELECT id INTO bob_id FROM auth.users WHERE email = 'bob@demo.seen';
  SELECT id INTO charlie_id FROM auth.users WHERE email = 'charlie@demo.seen';

  IF alice_id IS NULL OR bob_id IS NULL OR charlie_id IS NULL THEN
    RAISE EXCEPTION 'Demo users not found. Create them in Supabase Dashboard first.';
  END IF;

  -- Create profiles (ignore if already exist)
  INSERT INTO profiles (id, display_name) VALUES
    (alice_id, 'Alice'),
    (bob_id, 'Bob'),
    (charlie_id, 'Charlie')
  ON CONFLICT (id) DO NOTHING;

  -- Create friendships (with proper UUID ordering)
  pair1_a := LEAST(alice_id, bob_id);
  pair1_b := GREATEST(alice_id, bob_id);
  pair2_a := LEAST(alice_id, charlie_id);
  pair2_b := GREATEST(alice_id, charlie_id);
  pair3_a := LEAST(bob_id, charlie_id);
  pair3_b := GREATEST(bob_id, charlie_id);

  INSERT INTO friendships (user_a, user_b) VALUES
    (pair1_a, pair1_b),
    (pair2_a, pair2_b),
    (pair3_a, pair3_b)
  ON CONFLICT (user_a, user_b) DO NOTHING;

  RAISE NOTICE 'Demo users seeded: Alice (%), Bob (%), Charlie (%)', alice_id, bob_id, charlie_id;
END $$;
