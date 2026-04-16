#!/usr/bin/env node
/**
 * Master import script — run all imports in dependency order.
 * Usage: node scripts/import_all.js
 *
 * Requires: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in environment.
 * Create a .env.scripts file (git-ignored) with those values, then run:
 *   node --env-file=.env.scripts scripts/import_all.js
 */

import { createClient } from '@supabase/supabase-js'
import { parse } from 'csv-parse/sync'
import { readFileSync } from 'fs'
import { fileURLToPath } from 'url'
import path from 'path'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const dataDir = path.join(__dirname, '..', 'data')

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { persistSession: false } }
)

function readCsv(filename) {
  return parse(readFileSync(path.join(dataDir, filename)), {
    columns: true,
    skip_empty_lines: true,
    trim: true,
  })
}

function slugify(str) {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

async function upsert(table, rows, conflictKey = 'slug') {
  const { data, error } = await supabase
    .from(table)
    .upsert(rows, { onConflict: conflictKey })
    .select()
  if (error) throw new Error(`[${table}] ${error.message}`)
  console.log(`✓ ${table}: ${data.length} rows upserted`)
  return data
}

// ── 1. Districts ──────────────────────────────────────────────────
async function importDistricts() {
  const rows = readCsv('districts.csv').map((r) => ({
    name: r.name,
    slug: r.slug || slugify(r.name),
  }))
  return upsert('districts', rows)
}

// ── 2. Constituencies ─────────────────────────────────────────────
async function importConstituencies(districts) {
  const districtMap = Object.fromEntries(districts.map((d) => [d.slug, d.id]))
  const rows = readCsv('constituencies.csv').map((r) => {
    const districtId = districtMap[r.district_slug]
    if (!districtId) throw new Error(`Unknown district slug: ${r.district_slug}`)
    return {
      name: r.name,
      slug: r.slug || slugify(r.name),
      constituency_no: Number(r.constituency_no),
      district_id: districtId,
      reserved_for: r.reserved_for || 'general',
    }
  })
  return upsert('constituencies', rows)
}

// ── 3. Parties ────────────────────────────────────────────────────
async function importParties() {
  const rows = readCsv('parties.csv').map((r) => ({
    name: r.name,
    abbreviation: r.abbreviation,
    slug: r.slug || slugify(r.abbreviation),
    alliance: r.alliance || null,
    color_hex: r.color_hex || null,
  }))
  return upsert('parties', rows)
}

// ── 4. Candidates + Election Contests ────────────────────────────
async function importCandidates(constituencies, parties) {
  const constituencyMap = Object.fromEntries(constituencies.map((c) => [c.slug, c.id]))
  const partyMap = Object.fromEntries(parties.map((p) => [p.abbreviation.toUpperCase(), p.id]))

  const csv = readCsv('candidates_2026.csv')

  // Upsert candidate (person-level)
  const candidateRows = csv.map((r) => ({
    full_name: r.full_name,
    slug: r.slug || slugify(r.full_name),
    date_of_birth: r.date_of_birth || null,
    gender: r.gender || null,
    education: r.education || null,
    profession: r.profession || null,
    photo_url: r.photo_url || null,
  }))
  const candidates = await upsert('candidates', candidateRows)

  // Upsert election_contests
  const candidateIdMap = Object.fromEntries(candidates.map((c) => [c.slug, c.id]))
  const contestRows = csv.map((r) => {
    const slug = r.slug || slugify(r.full_name)
    const candidateId = candidateIdMap[slug]
    const constituencyId = constituencyMap[r.constituency_slug]
    const partyId = partyMap[r.party_abbreviation?.toUpperCase()] ?? null

    if (!candidateId) throw new Error(`Candidate not found: ${slug}`)
    if (!constituencyId) throw new Error(`Constituency not found: ${r.constituency_slug}`)

    return {
      candidate_id: candidateId,
      constituency_id: constituencyId,
      party_id: partyId,
      election_year: 2026,
      is_current_election: true,
      assets_movable_lakh: r.assets_movable_lakh ? Number(r.assets_movable_lakh) : null,
      assets_immovable_lakh: r.assets_immovable_lakh ? Number(r.assets_immovable_lakh) : null,
      liabilities_lakh: r.liabilities_lakh ? Number(r.liabilities_lakh) : null,
      criminal_cases_pending: r.criminal_cases_pending ? Number(r.criminal_cases_pending) : 0,
      criminal_cases_detail: r.criminal_cases_detail || null,
      affidavit_url: r.affidavit_url || null,
    }
  })
  await upsert('election_contests', contestRows, 'candidate_id,constituency_id,election_year')
}

// ── 5. Refresh search index ───────────────────────────────────────
async function refreshSearchIndex() {
  const { error } = await supabase.rpc('refresh_search_index')
  if (error) {
    console.warn('⚠ Could not refresh search_index via RPC. Run manually:')
    console.warn('  REFRESH MATERIALIZED VIEW CONCURRENTLY search_index;')
  } else {
    console.log('✓ search_index refreshed')
  }
}

// ── Main ──────────────────────────────────────────────────────────
async function main() {
  console.log('Starting data import…\n')
  const districts = await importDistricts()
  const constituencies = await importConstituencies(districts)
  const parties = await importParties()
  await importCandidates(constituencies, parties)
  await refreshSearchIndex()
  console.log('\n✅ Import complete!')
}

main().catch((err) => {
  console.error('Import failed:', err.message)
  process.exit(1)
})
