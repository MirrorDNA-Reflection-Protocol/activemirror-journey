-- Active Mirror Safety Proxy — Supabase Schema
-- Run in Supabase SQL Editor

-- Seeds table
CREATE TABLE IF NOT EXISTS seeds (
    id BIGSERIAL PRIMARY KEY,
    shortcode VARCHAR(6) UNIQUE NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    views INTEGER DEFAULT 0
);
CREATE INDEX IF NOT EXISTS idx_seeds_shortcode ON seeds(shortcode);

-- Seed counter (single row)
CREATE TABLE IF NOT EXISTS seed_counter (
    id INTEGER PRIMARY KEY DEFAULT 1 CHECK (id = 1),
    count INTEGER DEFAULT 0,
    shared INTEGER DEFAULT 0,
    last_updated TIMESTAMPTZ DEFAULT NOW()
);
INSERT INTO seed_counter (id, count, shared, last_updated)
VALUES (1, 50, 0, NOW())
ON CONFLICT (id) DO NOTHING;

-- Permanent record (append-only conviction log)
CREATE TABLE IF NOT EXISTS permanent_record (
    id BIGSERIAL PRIMARY KEY,
    entry TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Waitlist
CREATE TABLE IF NOT EXISTS waitlist (
    id BIGSERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    source VARCHAR(50) DEFAULT 'mirror',
    ip_hash VARCHAR(16),
    created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_waitlist_email ON waitlist(email);

-- Row Level Security (enable but allow service key full access)
ALTER TABLE seeds ENABLE ROW LEVEL SECURITY;
ALTER TABLE seed_counter ENABLE ROW LEVEL SECURITY;
ALTER TABLE permanent_record ENABLE ROW LEVEL SECURITY;
ALTER TABLE waitlist ENABLE ROW LEVEL SECURITY;

-- Service role policies (full access for backend)
CREATE POLICY "Service full access" ON seeds FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Service full access" ON seed_counter FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Service full access" ON permanent_record FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Service full access" ON waitlist FOR ALL USING (true) WITH CHECK (true);
