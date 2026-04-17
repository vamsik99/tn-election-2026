#!/usr/bin/env node
/**
 * Import scraped TN 2026 candidate data from data/affidavits_scraped.csv
 * into Supabase (candidates + election_contests tables).
 *
 * The scraped CSV has these columns:
 *   constituency_no, constituency_name, candidate_name, gender, party_name, nomination_date
 *
 * Strategy:
 *  1. Load all existing constituencies from DB (matched by name, fuzzy)
 *  2. Load all existing parties from DB (matched by full name, fuzzy)
 *  3. For each candidate row: upsert candidate, upsert election_contest
 *
 * Usage:
 *   node --env-file=.env.scripts scripts/import_scraped_candidates.js
 *   node --env-file=.env.scripts scripts/import_scraped_candidates.js --dry-run
 */

import { createClient } from '@supabase/supabase-js'
import { parse } from 'csv-parse/sync'
import { readFileSync } from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const dataDir   = path.join(__dirname, '..', 'data')
const DRY_RUN   = process.argv.includes('--dry-run')

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { persistSession: false } }
)

// ── Helpers ────────────────────────────────────────────────────────────────

function slugify(str) {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .substring(0, 120)
}

/**
 * Normalise a name for comparison: lowercase, strip punctuation, collapse spaces
 */
function norm(s) {
  return (s || '').toLowerCase().replace(/[^a-z0-9\s]/g, ' ').replace(/\s+/g, ' ').trim()
}

/**
 * Score similarity between two normalised strings (0–1)
 * Uses token overlap — good enough for constituency/party name matching
 */
function similarity(a, b) {
  const tokA = new Set(norm(a).split(' '))
  const tokB = new Set(norm(b).split(' '))
  const intersection = [...tokA].filter(t => tokB.has(t) && t.length > 2).length
  const union = new Set([...tokA, ...tokB]).size
  return union === 0 ? 0 : intersection / union
}

/**
 * Extract bare constituency name from portal string like "13 - Kolathur" or "2 - Ponneri (SC)"
 * Strips leading "N - " and trailing reservation suffix "(SC)"/"(ST)"
 */
function extractACName(portalName) {
  return portalName
    .replace(/^\d+\s*-\s*/, '')   // strip "13 - "
    .replace(/\s*\(SC\)\s*$/i, '') // strip " (SC)"
    .replace(/\s*\(ST\)\s*$/i, '') // strip " (ST)"
    .trim()
}

// ── Load reference data from DB ────────────────────────────────────────────

async function loadConstituencies() {
  const { data, error } = await supabase
    .from('constituencies')
    .select('id, name, slug, constituency_no')
  if (error) throw new Error('Failed to load constituencies: ' + error.message)
  console.log(`Loaded ${data.length} constituencies from DB`)
  return data
}

async function loadParties() {
  const { data, error } = await supabase
    .from('parties')
    .select('id, name, abbreviation, slug')
  if (error) throw new Error('Failed to load parties: ' + error.message)
  console.log(`Loaded ${data.length} parties from DB`)
  return data
}

// ── Match portal strings to DB rows ───────────────────────────────────────

// Portal spelling (normalised) → DB name (normalised)
const AC_ALIASES = {
  'chepauk thiruvallikeni': 'chepauk triplicane',
  'virugampakkam': 'virugambakkam',
  'shozhinganallur': 'sholinganallur',
  'sholinghur': 'sholingur',
}

function matchConstituency(portalName, dbConstituencies) {
  const rawNorm = norm(extractACName(portalName))
  const lookupNorm = AC_ALIASES[rawNorm] ?? rawNorm

  // 1. Exact match at normalised level
  const exact = dbConstituencies.find(c => norm(c.name) === lookupNorm)
  if (exact) return exact

  // 2. Best fuzzy match (threshold 0.4)
  let best = null, bestScore = 0
  for (const c of dbConstituencies) {
    const score = similarity(lookupNorm, norm(c.name))
    if (score > bestScore) { bestScore = score; best = c }
  }
  if (bestScore >= 0.4) return best

  return null
}

function matchParty(partyName, dbParties) {
  if (!partyName || partyName.trim() === '') return null

  // Handle "Independent" specially
  if (norm(partyName).includes('independent')) {
    return dbParties.find(p => p.abbreviation === 'IND') || null
  }

  // 1. Exact name match
  const exact = dbParties.find(p => norm(p.name) === norm(partyName))
  if (exact) return exact

  // 2. Name contains match (shorter wins)
  const contains = dbParties
    .filter(p => norm(partyName).includes(norm(p.name)) || norm(p.name).includes(norm(partyName)))
    .sort((a, b) => b.name.length - a.name.length)
  if (contains.length > 0) return contains[0]

  // 3. Fuzzy token overlap
  let best = null, bestScore = 0
  for (const p of dbParties) {
    const score = similarity(partyName, p.name)
    if (score > bestScore) { bestScore = score; best = p }
  }
  if (bestScore >= 0.35) return best

  // 4. Not found — will be inserted as unknown party or null
  return null
}

// ── Insert unknown parties on the fly ─────────────────────────────────────

const partyCache = new Map() // partyName → party row (from DB or newly inserted)

async function ensureParty(partyName, dbParties) {
  if (partyCache.has(partyName)) return partyCache.get(partyName)

  const match = matchParty(partyName, dbParties)
  if (match) { partyCache.set(partyName, match); return match }

  // Insert new party
  const row = {
    name: partyName.substring(0, 200),
    abbreviation: partyName.substring(0, 10).toUpperCase().replace(/\s+/g, ''),
    slug: slugify(partyName).substring(0, 80) + '-' + Math.floor(Math.random() * 1000),
    alliance: null,
    color_hex: '#94a3b8',
  }
  if (DRY_RUN) {
    console.log(`  [dry-run] Would insert party: ${partyName}`)
    const fakeRow = { ...row, id: -Math.floor(Math.random() * 10000) }
    partyCache.set(partyName, fakeRow)
    return fakeRow
  }
  const { data, error } = await supabase.from('parties').insert(row).select().single()
  if (error) {
    // If duplicate abbreviation, retry with a unique suffix
    const suffix = Date.now().toString().slice(-4)
    row.abbreviation = row.abbreviation.substring(0, 6) + suffix
    row.slug = row.slug + '-' + suffix
    const { data: d2, error: e2 } = await supabase.from('parties').insert(row).select().single()
    if (e2) { console.warn(`  ⚠ Could not insert party "${partyName}": ${e2.message}`); return null }
    dbParties.push(d2)
    partyCache.set(partyName, d2)
    return d2
  }
  dbParties.push(data)
  partyCache.set(partyName, data)
  return data
}

// ── Main import ────────────────────────────────────────────────────────────

async function main() {
  console.log(`=== Import Scraped Candidates${DRY_RUN ? ' (DRY RUN)' : ''} ===\n`)

  // Load CSV
  const csv = parse(readFileSync(path.join(dataDir, 'affidavits_scraped.csv')), {
    columns: true,
    skip_empty_lines: true,
    trim: true,
  })
  console.log(`Loaded ${csv.length} rows from affidavits_scraped.csv\n`)

  // Load reference data
  const dbConstituencies = await loadConstituencies()
  const dbParties = await loadParties()

  let successCount = 0
  let skipCount    = 0
  let errorCount   = 0
  const unmatchedACs    = new Set()
  const unknownParties  = new Map()  // partyName → count

  // Group rows by candidate+constituency to avoid duplicates
  const seen = new Set() // key = name + constituency_no

  // Process in batches of 50 to avoid Supabase rate limits
  const BATCH = 50
  const contestRows = []

  for (const row of csv) {
    const { constituency_no, constituency_name, candidate_name, gender, party_name, nomination_date } = row

    // Skip blank candidate names
    if (!candidate_name || candidate_name.length < 2) { skipCount++; continue }

    // Dedup: same candidate in same AC
    const dedupKey = `${candidate_name.toUpperCase().replace(/\s/g,'')}|||${constituency_no}`
    if (seen.has(dedupKey)) { skipCount++; continue }
    seen.add(dedupKey)

    // Match constituency
    const constituency = matchConstituency(constituency_name, dbConstituencies)
    if (!constituency) {
      unmatchedACs.add(constituency_name)
      skipCount++
      continue
    }

    // Match / ensure party
    const party = await ensureParty(party_name, dbParties)
    if (!party && party_name && !norm(party_name).includes('independent')) {
      unknownParties.set(party_name, (unknownParties.get(party_name) || 0) + 1)
    }

    // Generate unique candidate slug: name + constituency slug
    const candidateSlug = slugify(candidate_name) + '-' + constituency.slug

    // Build candidate row
    const genderNorm = gender?.toLowerCase().includes('f') ? 'female'
                     : gender?.toLowerCase().includes('m') ? 'male' : 'other'

    const candidateRow = {
      full_name: candidate_name,
      slug: candidateSlug,
      gender: genderNorm,
    }

    const contestRow = {
      candidateSlug,            // stripped before DB insert
      constituency_id: constituency.id,
      party_id: party?.id ?? null,
      election_year: 2026,
      is_current_election: true,
      nomination_date: nomination_date || null,  // converted DD-MM-YYYY → YYYY-MM-DD at insert time
    }

    contestRows.push({ candidateRow, contestRow })
  }

  console.log(`\nRows to process: ${contestRows.length} (skipped: ${skipCount})`)
  if (unmatchedACs.size > 0) console.log(`Unmatched ACs (${unmatchedACs.size}):`, [...unmatchedACs].slice(0, 10))

  if (DRY_RUN) {
    console.log('\n[dry-run] Would insert candidates and contests. Sample:')
    console.log(contestRows.slice(0, 3))
    return
  }

  // ── Batch upsert candidates ─────────────────────────────────────────────
  console.log('\nUpserting candidates...')
  const candidateRows = contestRows.map(r => r.candidateRow)
  for (let i = 0; i < candidateRows.length; i += BATCH) {
    const batch = candidateRows.slice(i, i + BATCH)
    const { data, error } = await supabase
      .from('candidates')
      .upsert(batch, { onConflict: 'slug' })
      .select('id, slug')
    if (error) {
      console.error(`  Batch ${i}-${i + BATCH} candidates error:`, error.message)
      errorCount += batch.length
    } else {
      successCount += data.length
      // Update contestRows with real candidate IDs
      const idMap = Object.fromEntries(data.map(c => [c.slug, c.id]))
      contestRows.slice(i, i + BATCH).forEach(r => {
        r.contestRow.candidate_id = idMap[r.candidateRow.slug]
      })
    }
    if (i % 500 === 0 && i > 0) process.stdout.write(`  ${i}/${candidateRows.length}\n`)
  }
  console.log(`✓ Candidates upserted: ${successCount}`)

  // ── Batch upsert election_contests ──────────────────────────────────────
  console.log('\nUpserting election contests...')
  let contestSuccess = 0
  const finalContests = contestRows
    .filter(r => r.contestRow.candidate_id)
    .map(r => {
      const { candidateSlug, ...rest } = r.contestRow
      // Convert nomination_date string "DD-MM-YYYY" → "YYYY-MM-DD" for Postgres DATE
      if (rest.nomination_date) {
        const parts = rest.nomination_date.split('-')
        if (parts.length === 3 && parts[0].length === 2) {
          rest.nomination_date = `${parts[2]}-${parts[1]}-${parts[0]}`
        }
      }
      return rest
    })

  for (let i = 0; i < finalContests.length; i += BATCH) {
    const batch = finalContests.slice(i, i + BATCH)
    const { data, error } = await supabase
      .from('election_contests')
      .upsert(batch, { onConflict: 'candidate_id,constituency_id,election_year' })
      .select('id')
    if (error) {
      console.error(`  Batch ${i}-${i + BATCH} contests error:`, error.message)
    } else {
      contestSuccess += data.length
    }
    if (i % 500 === 0 && i > 0) process.stdout.write(`  ${i}/${finalContests.length}\n`)
  }
  console.log(`✓ Election contests upserted: ${contestSuccess}`)

  // ── Refresh search index ────────────────────────────────────────────────
  console.log('\nRefreshing search index...')
  const { error: rpcError } = await supabase.rpc('refresh_search_index')
  if (rpcError) console.warn('  ⚠ refresh_search_index RPC not found — run manually in Supabase SQL editor')
  else console.log('✓ search_index refreshed')

  console.log(`\n✅ Done! ${successCount} candidates, ${contestSuccess} contests, ${errorCount} errors`)
  if (unknownParties.size > 0) {
    console.log(`\nParties added to DB (${unknownParties.size + [...partyCache.values()].filter(p => p.id < 0 ? false : !dbParties.find(d => d.id === p.id)).length} new):`)
    for (const [name, count] of [...unknownParties.entries()].sort((a, b) => b[1] - a[1]).slice(0, 20)) {
      console.log(`  ${count}x ${name}`)
    }
  }
}

main().catch(err => {
  console.error('Fatal:', err.message)
  process.exit(1)
})
