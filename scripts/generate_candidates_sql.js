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
const AC_ALIASES = {
  'chepauk thiruvallikeni': 'chepauk triplicane',
  'virugampakkam': 'virugambakkam',
  'shozhinganallur': 'sholinganallur',
  'sholinghur': 'sholingur',
  'gudiyattam': 'gudiyatham',
  // Villupuram district spellings
  'viluppuram': 'villupuram',
  'tirukkoyilur': 'tirukoilur',
  'ulundurpettai': 'ulundurpet',
  // NOTE: "Chengam (SC)" from portal has no match in constituencies.csv
  // It needs to be added to constituencies.csv manually after verification
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

function findPartyAbbrev(partyName) {
  if (!partyName?.trim()) return 'IND'
  if (norm(partyName).includes('independent')) return 'IND'
  const n = norm(partyName)
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
    // Register as new party
    if (!newParties.has(party_name)) {
      const slug = slugify(party_name)
      const abbrev = party_name.replace(/[^A-Z]/g, '').substring(0, 8) || slugify(party_name).substring(0, 8).toUpperCase()
      newParties.set(party_name, { slug, abbrev })
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
    partyAbbrev: partyAbbrev || (newParties.has(party_name) ? newParties.get(party_name).abbrev : null),
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

// Insert new parties first
if (newParties.size > 0) {
  lines.push('-- ── New parties not in parties.csv ───────────────────────────')
  for (const [name, { slug, abbrev }] of newParties) {
    const safeAbbrev = abbrev + '_' + Math.random().toString(36).slice(2,5).toUpperCase()
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

// Refresh search index
lines.push('-- Refresh full-text search index')
lines.push('REFRESH MATERIALIZED VIEW search_index;')
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
