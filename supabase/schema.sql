-- ================================================================
-- Tamil Nadu Elections 2026 — Supabase Schema
-- Run this in the Supabase SQL editor (Dashboard > SQL Editor)
-- ================================================================

-- ── Districts ────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS districts (
  id      SMALLINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  name    TEXT NOT NULL UNIQUE,
  name_ta TEXT,
  slug    TEXT NOT NULL UNIQUE
);

-- ── Constituencies ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS constituencies (
  id               SMALLINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  district_id      SMALLINT NOT NULL REFERENCES districts(id),
  name             TEXT NOT NULL,
  name_ta          TEXT,
  slug             TEXT NOT NULL UNIQUE,
  constituency_no  SMALLINT NOT NULL UNIQUE,
  reserved_for     TEXT CHECK (reserved_for IN ('general','sc','st')) DEFAULT 'general'
);
CREATE INDEX IF NOT EXISTS idx_constituencies_district ON constituencies(district_id);
CREATE INDEX IF NOT EXISTS idx_constituencies_slug     ON constituencies(slug);

-- ── Parties ──────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS parties (
  id           SMALLINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  name         TEXT NOT NULL UNIQUE,
  abbreviation TEXT NOT NULL UNIQUE,
  slug         TEXT NOT NULL UNIQUE,
  alliance     TEXT,
  color_hex    TEXT,
  logo_url     TEXT
);
CREATE INDEX IF NOT EXISTS idx_parties_slug     ON parties(slug);
CREATE INDEX IF NOT EXISTS idx_parties_alliance ON parties(alliance);

-- ── Candidates (person-level) ────────────────────────────────────
CREATE TABLE IF NOT EXISTS candidates (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name     TEXT NOT NULL,
  full_name_ta  TEXT,
  slug          TEXT NOT NULL UNIQUE,
  date_of_birth DATE,
  gender        TEXT CHECK (gender IN ('male','female','other')),
  photo_url     TEXT,
  education     TEXT,
  profession    TEXT,
  created_at    TIMESTAMPTZ DEFAULT now(),
  updated_at    TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_candidates_slug    ON candidates(slug);
CREATE INDEX IF NOT EXISTS idx_candidates_name_fts
  ON candidates USING gin(to_tsvector('simple', full_name));

-- ── Election Contests (per candidate per seat per year) ──────────
CREATE TABLE IF NOT EXISTS election_contests (
  id                     UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  candidate_id           UUID NOT NULL REFERENCES candidates(id) ON DELETE CASCADE,
  constituency_id        SMALLINT NOT NULL REFERENCES constituencies(id),
  party_id               SMALLINT REFERENCES parties(id),
  election_year          SMALLINT NOT NULL,
  is_current_election    BOOLEAN NOT NULL DEFAULT false,
  -- Affidavit disclosures
  assets_movable_lakh    NUMERIC(12,2),
  assets_immovable_lakh  NUMERIC(12,2),
  liabilities_lakh       NUMERIC(12,2),
  criminal_cases_pending SMALLINT DEFAULT 0,
  criminal_cases_detail  TEXT,
  income_annual_lakh     NUMERIC(10,2),
  affidavit_url          TEXT,
  -- Results (NULL until declared)
  votes_received         INTEGER,
  result                 TEXT CHECK (result IN ('won','lost','nota','absent',null)),
  vote_share_pct         NUMERIC(5,2),
  margin                 INTEGER,
  nomination_date        DATE,
  created_at             TIMESTAMPTZ DEFAULT now(),
  updated_at             TIMESTAMPTZ DEFAULT now(),
  UNIQUE (candidate_id, constituency_id, election_year)
);
CREATE INDEX IF NOT EXISTS idx_ec_constituency ON election_contests(constituency_id);
CREATE INDEX IF NOT EXISTS idx_ec_party        ON election_contests(party_id);
CREATE INDEX IF NOT EXISTS idx_ec_candidate    ON election_contests(candidate_id);
CREATE INDEX IF NOT EXISTS idx_ec_year         ON election_contests(election_year);
CREATE INDEX IF NOT EXISTS idx_ec_current      ON election_contests(is_current_election)
  WHERE is_current_election = true;

-- ── Constituency Results (aggregate per constituency per year) ───
CREATE TABLE IF NOT EXISTS constituency_results (
  id                    SMALLINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  constituency_id       SMALLINT NOT NULL REFERENCES constituencies(id),
  election_year         SMALLINT NOT NULL,
  winning_candidate_id  UUID REFERENCES candidates(id),
  winning_party_id      SMALLINT REFERENCES parties(id),
  winning_margin        INTEGER,
  voter_turnout_pct     NUMERIC(5,2),
  UNIQUE (constituency_id, election_year)
);
CREATE INDEX IF NOT EXISTS idx_cr_constituency ON constituency_results(constituency_id);

-- ── Search Index (materialized view) ────────────────────────────
CREATE MATERIALIZED VIEW IF NOT EXISTS search_index AS
SELECT
  'candidate'    AS entity_type,
  c.id::TEXT     AS entity_id,
  c.slug,
  c.full_name    AS label,
  c.full_name_ta AS label_ta,
  NULL           AS sub_label,
  to_tsvector('simple', c.full_name) AS tsv
FROM candidates c
UNION ALL
SELECT
  'constituency' AS entity_type,
  co.id::TEXT,
  co.slug,
  co.name,
  co.name_ta,
  d.name AS sub_label,
  to_tsvector('simple', co.name || ' ' || d.name) AS tsv
FROM constituencies co
JOIN districts d ON d.id = co.district_id;

CREATE UNIQUE INDEX IF NOT EXISTS idx_search_id  ON search_index(entity_type, entity_id);
CREATE        INDEX IF NOT EXISTS idx_search_tsv ON search_index USING gin(tsv);

-- ── Row Level Security ───────────────────────────────────────────
ALTER TABLE districts            ENABLE ROW LEVEL SECURITY;
ALTER TABLE constituencies       ENABLE ROW LEVEL SECURITY;
ALTER TABLE parties              ENABLE ROW LEVEL SECURITY;
ALTER TABLE candidates           ENABLE ROW LEVEL SECURITY;
ALTER TABLE election_contests    ENABLE ROW LEVEL SECURITY;
ALTER TABLE constituency_results ENABLE ROW LEVEL SECURITY;

-- Public can SELECT all tables (anon key, no writes)
CREATE POLICY "public read districts"
  ON districts FOR SELECT TO anon USING (true);
CREATE POLICY "public read constituencies"
  ON constituencies FOR SELECT TO anon USING (true);
CREATE POLICY "public read parties"
  ON parties FOR SELECT TO anon USING (true);
CREATE POLICY "public read candidates"
  ON candidates FOR SELECT TO anon USING (true);
CREATE POLICY "public read election_contests"
  ON election_contests FOR SELECT TO anon USING (true);
CREATE POLICY "public read constituency_results"
  ON constituency_results FOR SELECT TO anon USING (true);

-- ── Refresh helper ───────────────────────────────────────────────
-- Run after every data import:
-- REFRESH MATERIALIZED VIEW CONCURRENTLY search_index;
