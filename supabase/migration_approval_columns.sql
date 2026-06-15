-- ════════════════════════════════════════════════════════════════════════════
-- OVM Clients — Approval + Scheduling migration
-- Run this in your Supabase SQL editor (or push via supabase db push)
-- ════════════════════════════════════════════════════════════════════════════

-- 1. New post status values (if using a CHECK constraint, extend it here)
--    If your 'status' column is just TEXT with no CHECK, nothing needed.
--    If it has a CHECK constraint like: CHECK (status IN (...)), alter it:
--
-- ALTER TABLE posts DROP CONSTRAINT IF EXISTS posts_status_check;
-- ALTER TABLE posts ADD CONSTRAINT posts_status_check CHECK (status IN (
--   'draft','pending_review','pending_client_approval',
--   'client_approved','changes_requested',
--   'approved','scheduled','posted','failed'
-- ));

-- 2. New columns on posts table
ALTER TABLE posts
  ADD COLUMN IF NOT EXISTS approval_token       TEXT,
  ADD COLUMN IF NOT EXISTS client_approval_note TEXT,
  ADD COLUMN IF NOT EXISTS reminder_sent        BOOLEAN NOT NULL DEFAULT FALSE;

-- 3. Index so scheduled-reminders.js query is fast
CREATE INDEX IF NOT EXISTS idx_posts_reminder
  ON posts (status, reminder_sent, scheduled_at)
  WHERE status = 'client_approved' AND reminder_sent = FALSE;

-- 4. app_state table (key-value store for approval sessions)
--    Skip if it already exists.
CREATE TABLE IF NOT EXISTS app_state (
  key        TEXT PRIMARY KEY,
  value      JSONB NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. RLS: approval-get and approval-respond use the service role key,
--    so no additional RLS policy is needed beyond what's already on app_state.
--    If you want extra safety, restrict reads to rows matching 'approval:%':
-- CREATE POLICY "public_read_approvals" ON app_state
--   FOR SELECT USING (key LIKE 'approval:%');

SELECT 'Migration complete ✓' AS result;
