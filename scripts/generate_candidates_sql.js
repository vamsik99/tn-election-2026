#!/usr/bin/env node
/**
 * Generate SQL INSERT statements from affidavits_scraped.csv
 * Outputs: data/import_candidates.sql  (run in Supabase SQL editor)
 *
 * Usage: node scripts/generate_candidates_sql.js
 */

import { parse } from 'csv-parse/sync'
import { readFileSync, writeFileSync } from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const dataDir   = path.join(__dirname, '..', 'data')

function slugify(str) {
  return str.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').substring(0, 120)
}

function sq(s) {
  return s ? `'${s.replace(/'/g, "''").trim()}'` : 'NULL'
}

function norm(s) {
  return (s || '').toLowerCase().replace(/[^a-z0-9\s]/g, ' ').replace(/\s+/g, ' ').trim()
}

// Load CSVs
const scrapedRows = parse(readFileSync(path.join(dataDir, 'affidavits_scraped.csv')), {
  columns: true, skip_empty_lines: true, trim: true,
})

const constituenciesCsv = parse(readFileSync(path.join(dataDir, 'constituencies.csv')), {
  columns: true, skip_empty_lines: true, trim: true,
})

const partiesCsv = parse(readFileSync(path.join(dataDir, 'parties.csv')), {
  columns: true, skip_empty_lines: true, trim: true,
})

// Build lookup maps
// Portal AC name → constituency slug
// Portal uses "N - Name (SC)" format; our CSV has bare "Name"
const constituencyByName = new Map()
for (const c of constituenciesCsv) {
  constituencyByName.set(norm(c.name), c.slug)
}

// Party full name → abbreviation
const partyByName = new Map()
for (const p of partiesCsv) {
  partyByName.set(norm(p.name), p.abbreviation)
}

// Manual aliases: portal name (normalised) → our CSV name (normalised)
// Portal spelling (normalised) → our constituencies.csv name (normalised)
// Run scripts/compare_constituencies.js to audit mismatches
const AC_ALIASES = {
  // Chennai / northern TN
  'chepauk thiruvallikeni': 'chepauk triplicane',
  'virugampakkam': 'virugambakkam',
  'shozhinganallur': 'sholinganallur',
  // Thiruvallur / Vellore
  'sholinghur': 'sholingur',
  // Tiruvannamalai / Dharmapuri
  'gudiyattam': 'gudiyatham',
  // Villupuram district
  'viluppuram': 'villupuram',
  'tirukkoyilur': 'tirukoilur',
  'ulundurpettai': 'ulundurpet',
  // Trichy area
  'thiruverumbur': 'thiruverambur',
  // Nagapattinam / Thanjavur
  'thiruthuraipoondi': 'thalaignayiru',  // best guess — both in Nagapattinam
  'gandarvakkottai': 'gandharvakottai',
  // Ramanathapuram
  'mudhukulathur': 'mudukulathur',
  // Thoothukudi / Kanyakumari
  'thoothukkudi': 'thoothukudi',
  'colachal': 'colachel',
  'kanniyakumari': 'kanyakumari',
  // Dindigul
  'nilakkottai': 'nilakottai',
  // NOTE: These portal ACs have no clear match in constituencies.csv:
  // 62-Chengam(SC), 101-Dharapuram(SC), 102-Kangayam, 110-Coonoor,
  // 112-Avanashi(SC), 117-Kavundampalayam, 129-Athoor, 151-Tittakudi(SC),
  // 173-Thiruvaiyaru, 195-Thiruparankundram, 196-Thirumangalam,
  // 208-Tiruchuli, 220-Vasudevanallur(SC), 226-Palayamkottai
  // These constituencies' candidates won't be imported until CSV is corrected.
}

function extractACName(portalName) {
  return portalName
    .replace(/^\d+\s*-\s*/, '')
    .replace(/\s*\(SC\)\s*$/i, '')
    .replace(/\s*\(ST\)\s*$/i, '')
    .trim()
}

function findConstituencySlug(portalName) {
  let bare = norm(extractACName(portalName))
  // Apply manual alias if exists
  if (AC_ALIASES[bare]) bare = AC_ALIASES[bare]
  if (constituencyByName.has(bare)) return constituencyByName.get(bare)

  // Fuzzy: find best token overlap
  let best = null, bestScore = 0
  for (const [key, slug] of constituencyByName) {
    const tokA = new Set(bare.split(' ').filter(t => t.length > 2))
    const tokB = new Set(key.split(' ').filter(t => t.length > 2))
    const inter = [...tokA].filter(t => tokB.has(t)).length
    const union = new Set([...tokA, ...tokB]).size
    const score = union === 0 ? 0 : inter / union
    if (score > bestScore) { bestScore = score; best = slug }
  }
  return bestScore >= 0.4 ? best : null
}

// Manual aliases: portal party name (normalised) → abbreviation in parties.csv
const PARTY_ALIASES = {
  // TVK spelled differently on portal vs our CSV
  'tamizhaga vaazhvurimai katchi': 'TVAK',
  // AMMK
  'amma makkal munnettra kazagam': 'AMMK',
  'amma makkal munnetra kazhagam': 'AMMK',
  // Puthiya Tamilagam
  'puthiya tamilagam': 'PT',
  // AIPTMK variants
  'all india puratchi thalaivar makkal munnettra kazhagam': 'AIPTMK',
  // NTK alternate spellings
  'naam tamilar': 'NTK',
  // MDMK variants
  'marumalarchi dravida munnetra kazhagam': 'MDMK',
}

function findPartyAbbrev(partyName) {
  if (!partyName?.trim()) return 'IND'
  if (norm(partyName).includes('independent')) return 'IND'
  const n = norm(partyName)
  // Check manual alias first
  if (PARTY_ALIASES[n]) return PARTY_ALIASES[n]
  if (partyByName.has(n)) return partyByName.get(n)

  // Fuzzy
  let best = null, bestScore = 0
  for (const [key, abbr] of partyByName) {
    const tokA = new Set(n.split(' ').filter(t => t.length > 2))
    const tokB = new Set(key.split(' ').filter(t => t.length > 2))
    const inter = [...tokA].filter(t => tokB.has(t)).length
    const union = new Set([...tokA, ...tokB]).size
    const score = union === 0 ? 0 : inter / union
    if (score > bestScore) { bestScore = score; best = abbr }
  }
  return bestScore >= 0.35 ? best : null
}

function convertDate(dmy) {
  // "30-03-2026" → "2026-03-30"
  if (!dmy) return null
  const parts = dmy.split('-')
  if (parts.length === 3 && parts[0].length === 2) return `${parts[2]}-${parts[1]}-${parts[0]}`
  return dmy
}

// Deduplicate
const seen = new Set()
const records = []
const unmatchedACs = new Set()
const unmatchedParties = new Map()
const newParties = new Map() // partyName → slug

for (const row of scrapedRows) {
  const { constituency_name, candidate_name, gender, party_name, nomination_date } = row
  if (!candidate_name || candidate_name.length < 2) continue

  const constituencySlug = findConstituencySlug(constituency_name)
  if (!constituencySlug) { unmatchedACs.add(constituency_name); continue }

  const key = `${candidate_name.toUpperCase().replace(/\s/g,'')}|||${constituencySlug}`
  if (seen.has(key)) continue
  seen.add(key)

  const partyAbbrev = findPartyAbbrev(party_name)
  if (!partyAbbrev && party_name && !norm(party_name).includes('independent')) {
    unmatchedParties.set(party_name, (unmatchedParties.get(party_name) || 0) + 1)
    // Register as new party — generate safeAbbrev once and store it
    if (!newParties.has(party_name)) {
      const slug = slugify(party_name)
      const rawAbbrev = party_name.replace(/[^A-Z]/g, '').substring(0, 8) || slugify(party_name).substring(0, 8).toUpperCase()
      // Add random suffix to guarantee uniqueness in the abbreviation UNIQUE constraint
      const safeAbbrev = rawAbbrev + '_' + Math.random().toString(36).slice(2, 5).toUpperCase()
      newParties.set(party_name, { slug, abbrev: rawAbbrev, safeAbbrev })
    }
  }

  const genderNorm = gender?.toLowerCase().includes('f') ? 'female'
                   : gender?.toLowerCase().includes('m') ? 'male' : 'other'

  const candidateSlug = slugify(candidate_name) + '-' + constituencySlug

  records.push({
    candidateSlug,
    fullName: candidate_name,
    genderNorm,
    constituencySlug,
    // For known parties use the CSV abbreviation; for new parties use the safeAbbrev
    // so the LEFT JOIN in the contests INSERT finds the right row
    partyAbbrev: partyAbbrev || (newParties.has(party_name) ? newParties.get(party_name).safeAbbrev : null),
    partyNameRaw: party_name,
    nominationDate: convertDate(nomination_date),
  })
}

// Build SQL
const lines = []

lines.push('-- ================================================================')
lines.push('-- TN 2026 Candidate Import — generated by generate_candidates_sql.js')
lines.push(`-- Generated: ${new Date().toISOString()}`)
lines.push(`-- Total candidates: ${records.length}`)
lines.push('-- Run this in Supabase SQL Editor')
lines.push('-- ================================================================')
lines.push('')

// Clean up old 2026 seed data to avoid duplicates with scraped candidates
lines.push('-- ── Remove old manually-seeded 2026 contests (will be replaced by scraped data) ──')
lines.push('DELETE FROM election_contests WHERE election_year = 2026;')
lines.push('')

// Insert any constituencies from our CSV that may not yet be in the DB
// (the 14 added for unmatched portal ACs: Chengam, Dharapuram, Coonoor, etc.)
lines.push('-- ── Ensure all constituencies exist (new rows for previously-missing ACs) ──')
for (const c of constituenciesCsv) {
  if (!c.name || !c.slug || !c.district_slug) continue
  const reserved = c.reserved_for && c.reserved_for !== 'general' ? sq(c.reserved_for) : "'general'"
  lines.push(`INSERT INTO constituencies (constituency_no, name, slug, district_id, reserved_for)`)
  lines.push(`SELECT ${sq(String(c.constituency_no))}, ${sq(c.name)}, ${sq(c.slug)},`)
  lines.push(`  d.id, ${reserved}`)
  lines.push(`FROM districts d WHERE d.slug = ${sq(c.district_slug)}`)
  lines.push(`ON CONFLICT (slug) DO NOTHING;`)
}
lines.push('')

// Insert new parties first
if (newParties.size > 0) {
  lines.push('-- ── New parties not in parties.csv ───────────────────────────')
  for (const [name, { slug, safeAbbrev }] of newParties) {
    lines.push(`INSERT INTO parties (name, abbreviation, slug, color_hex)`)
    lines.push(`  VALUES (${sq(name)}, ${sq(safeAbbrev)}, ${sq(slug + '-party')}, '#94a3b8')`)
    lines.push(`  ON CONFLICT (slug) DO NOTHING;`)
  }
  lines.push('')
}

// Insert candidates
lines.push('-- ── Candidates ───────────────────────────────────────────────')
lines.push(`INSERT INTO candidates (full_name, slug, gender)`)
lines.push(`VALUES`)
const candValues = records.map((r, i) =>
  `  (${sq(r.fullName)}, ${sq(r.candidateSlug)}, ${sq(r.genderNorm)})${i < records.length - 1 ? ',' : ''}`
)
lines.push(...candValues)
lines.push(`ON CONFLICT (slug) DO UPDATE SET`)
lines.push(`  full_name = EXCLUDED.full_name,`)
lines.push(`  gender = EXCLUDED.gender;`)
lines.push('')

// Insert election contests
lines.push('-- ── Election Contests ────────────────────────────────────────')
lines.push(`INSERT INTO election_contests`)
lines.push(`  (candidate_id, constituency_id, party_id, election_year, is_current_election, nomination_date)`)
lines.push(`SELECT`)
lines.push(`  c.id AS candidate_id,`)
lines.push(`  co.id AS constituency_id,`)
lines.push(`  p.id AS party_id,`)
lines.push(`  2026 AS election_year,`)
lines.push(`  TRUE AS is_current_election,`)
lines.push(`  v.nomination_date::DATE`)
lines.push(`FROM (VALUES`)

const contestValues = records.map((r, i) => {
  const partyExpr = r.partyAbbrev ? sq(r.partyAbbrev) : 'NULL'
  const dateExpr  = r.nominationDate ? sq(r.nominationDate) : 'NULL'
  const comma = i < records.length - 1 ? ',' : ''
  return `  (${sq(r.candidateSlug)}, ${sq(r.constituencySlug)}, ${partyExpr}, ${dateExpr})${comma}`
})
lines.push(...contestValues)
lines.push(`) AS v(candidate_slug, constituency_slug, party_abbrev, nomination_date)`)
lines.push(`JOIN candidates    c ON c.slug = v.candidate_slug`)
lines.push(`JOIN constituencies co ON co.slug = v.constituency_slug`)
lines.push(`LEFT JOIN parties  p ON p.abbreviation = v.party_abbrev`)
lines.push(`ON CONFLICT (candidate_id, constituency_id, election_year)`)
lines.push(`  DO UPDATE SET`)
lines.push(`    party_id = EXCLUDED.party_id,`)
lines.push(`    is_current_election = TRUE,`)
lines.push(`    nomination_date = EXCLUDED.nomination_date;`)
lines.push('')

// Update search_index to include constituency name as sub_label for candidates
lines.push('-- ── Update search_index: candidates now include constituency sub_label ──')
lines.push(`DROP MATERIALIZED VIEW IF EXISTS search_index;`)
lines.push(`CREATE MATERIALIZED VIEW search_index AS`)
lines.push(`SELECT`)
lines.push(`  'candidate' AS entity_type,`)
lines.push(`  c.id::TEXT AS entity_id,`)
lines.push(`  c.slug,`)
lines.push(`  c.full_name AS label,`)
lines.push(`  c.full_name_ta AS label_ta,`)
lines.push(`  co.name AS sub_label,`)
lines.push(`  to_tsvector('simple', c.full_name) AS tsv`)
lines.push(`FROM candidates c`)
lines.push(`LEFT JOIN election_contests ec ON ec.candidate_id = c.id AND ec.is_current_election = true`)
lines.push(`LEFT JOIN constituencies co ON co.id = ec.constituency_id`)
lines.push(`UNION ALL`)
lines.push(`SELECT`)
lines.push(`  'constituency',`)
lines.push(`  co.id::TEXT,`)
lines.push(`  co.slug,`)
lines.push(`  co.name,`)
lines.push(`  co.name_ta,`)
lines.push(`  d.name,`)
lines.push(`  to_tsvector('simple', co.name || ' ' || d.name)`)
lines.push(`FROM constituencies co`)
lines.push(`JOIN districts d ON d.id = co.district_id;`)
lines.push(`CREATE INDEX idx_search_tsv ON search_index USING gin(tsv);`)
lines.push('')

const sql = lines.join('\n')
const outPath = path.join(dataDir, 'import_candidates.sql')
writeFileSync(outPath, sql, 'utf8')

console.log(`✅ Generated ${outPath}`)
console.log(`   ${records.length} candidates across ${seen.size} unique slots`)
if (unmatchedACs.size > 0) {
  console.log(`\n⚠ Unmatched ACs (${unmatchedACs.size}):`)
  for (const ac of [...unmatchedACs].slice(0, 20)) console.log(`   ${ac}`)
}
if (unmatchedParties.size > 0) {
  console.log(`\n⚠ New parties added (${unmatchedParties.size}):`)
  for (const [name, count] of [...unmatchedParties.entries()].sort((a,b) => b[1]-a[1]).slice(0, 20))
    console.log(`   ${count}x ${name}`)
}
