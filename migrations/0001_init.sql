-- Guestbook and counters. Run once against the D1 database:
--   npx wrangler d1 execute christattooer --remote --file=migrations/0001_init.sql
-- Add --local instead of --remote to set up the copy used by `npx wrangler dev`.

CREATE TABLE IF NOT EXISTS guestbook (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  name       TEXT    NOT NULL,
  message    TEXT    NOT NULL,
  created_at INTEGER NOT NULL,
  approved   INTEGER NOT NULL DEFAULT 0,
  -- a salted hash, never the address itself: enough to rate-limit, useless afterwards
  ip_hash    TEXT
);

CREATE INDEX IF NOT EXISTS gb_public ON guestbook (approved, created_at DESC);
CREATE INDEX IF NOT EXISTS gb_recent ON guestbook (ip_hash, created_at DESC);

CREATE TABLE IF NOT EXISTS counters (
  name TEXT    PRIMARY KEY,
  n    INTEGER NOT NULL DEFAULT 0
);

INSERT OR IGNORE INTO counters (name, n) VALUES ('hits', 0);
