#!/usr/bin/env node
/**
 * TN 2026 Candidate Scraper — electionapps.tn.gov.in
 * =====================================================
 * Uses Playwright (real Chromium) to interact with the official TN CEO
 * nomination portal. Selects BOTH constituency AND date dropdowns before
 * clicking Go — required for the server to return filtered data.
 *
 * Portal: https://electionapps.tn.gov.in/NOM2026/pu_nom/affidavit.aspx
 * Nomination dates scraped: 30-03-2026, 02-04-2026, 04-04-2026, 06-04-2026
 *
 * Usage:
 *   node scripts/scrape_eci_affidavits.js              # full run (all 234 ACs × 4 dates)
 *   node scripts/scrape_eci_affidavits.js --test       # first 5 ACs only
 *   node scripts/scrape_eci_affidavits.js --ac 13      # single AC (Kolathur)
 *   node scripts/scrape_eci_affidavits.js --resume     # skip already-done AC+date combos
 *
 * Output: data/affidavits_scraped.csv
 */

import { chromium } from 'playwright'
import { writeFileSync, appendFileSync, existsSync, readFileSync } from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const OUTPUT   = path.join(__dirname, '..', 'data', 'affidavits_scraped.csv')
const PROGRESS = path.join(__dirname, '..', 'data', '.scrape_progress.json')
const PORTAL   = 'https://electionapps.tn.gov.in/NOM2026/pu_nom/affidavit.aspx'

const CSV_HEADER = '"constituency_no","constituency_name","candidate_name","gender","party_name","nomination_date"'
const DELAY_MS   = 800  // between requests — respectful of the server

const sleep = (ms) => new Promise(r => setTimeout(r, ms))
const esc   = (s)  => `"${(s || '').toString().replace(/"/g, '""').trim()}"`

function loadProgress() {
  try { return new Set(JSON.parse(readFileSync(PROGRESS, 'utf8')).done || []) }
  catch { return new Set() }
}

function saveProgress(done) {
  writeFileSync(PROGRESS, JSON.stringify({ done: [...done], updated: new Date().toISOString() }))
}

/**
 * Scrape one AC+date combination.
 * Returns array of candidate objects (empty if no data for this date).
 */
async function scrapeACDate(page, acValue, acNo, acNameFromPortal, date) {
  // Fresh page load ensures clean ViewState — critical for correct filtering
  await page.goto(PORTAL, { waitUntil: 'domcontentloaded', timeout: 30000 })
  await page.waitForSelector('#DropDownList1', { timeout: 10000 })

  // Select constituency AND date
  await page.selectOption('#DropDownList1', String(acValue))
  await sleep(200)
  await page.selectOption('#DropDownList2', date)
  await sleep(200)

  // Click "Go" (full ASP.NET postback — no UpdatePanel)
  await page.click('#Button1')
  await page.waitForLoadState('networkidle', { timeout: 20000 })
  await sleep(400)

  // Check if GridView1 is present
  const gridExists = await page.$('#GridView1') !== null
  if (!gridExists) return []

  const rows = await page.$$eval('#GridView1 tr', rows =>
    rows.slice(1).map(row => {
      const cols = Array.from(row.querySelectorAll('td')).map(td => td.textContent.trim())
      return cols
    })
  )

  const candidates = []
  for (const cols of rows) {
    if (cols.length < 5) continue
    // cols: [AC_Name_Code, Candidate_Name, Gender, Party, Nomination_No, Date]
    const [acCol, candidateName, gender, partyName, , nominationDate] = cols
    if (!candidateName || candidateName.length < 2) continue
    candidates.push({
      acNo,
      acName: acNameFromPortal,
      candidateName,
      gender,
      partyName,
      nominationDate,
    })
  }

  return candidates
}

async function main() {
  const args     = process.argv.slice(2)
  const isTest   = args.includes('--test')
  const doResume = args.includes('--resume')
  const singleAC = args.includes('--ac') ? parseInt(args[args.indexOf('--ac') + 1]) : null

  console.log('=== TN 2026 Candidate Scraper (Playwright) ===\n')

  const browser = await chromium.launch({ headless: true, args: ['--no-sandbox'] })
  const context = await browser.newContext({
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36',
    viewport: { width: 1280, height: 900 },
  })
  const page = await context.newPage()

  try {
    // ── 1. Discover available AC options and nomination dates ─────────────────
    console.log('Loading portal to discover options...')
    await page.goto(PORTAL, { waitUntil: 'networkidle', timeout: 30000 })
    await page.waitForSelector('#DropDownList1', { timeout: 10000 })

    const acOptions = await page.$$eval('#DropDownList1 option', opts =>
      opts
        .filter(o => o.value && o.value !== '0')
        .map(o => ({ value: o.value, name: o.textContent.trim() }))
    )

    const dateOptions = await page.$$eval('#DropDownList2 option', opts =>
      opts
        .filter(o => o.value && o.value !== '0')
        .map(o => o.value)
    )

    console.log(`Found ${acOptions.length} constituencies, ${dateOptions.length} nomination dates`)
    console.log(`Dates: ${dateOptions.join(', ')}\n`)

    // Extract AC number from portal name like "13 - Kolathur"
    const constituencies = acOptions.map(ac => ({
      ...ac,
      no: parseInt(ac.name.split('-')[0].trim()),
    }))

    // ── 2. Apply filters ──────────────────────────────────────────────────────
    let toScrape = constituencies
    if (singleAC)    toScrape = constituencies.filter(c => c.no === singleAC)
    else if (isTest) toScrape = constituencies.slice(0, 5)

    const done = doResume ? loadProgress() : new Set()

    // Init CSV if fresh run
    if (!doResume || !existsSync(OUTPUT)) {
      writeFileSync(OUTPUT, CSV_HEADER + '\n', 'utf8')
    }

    const totalCombos = toScrape.length * dateOptions.length
    let combosDone    = 0
    let totalCandidates = 0
    let totalErrors     = 0

    // ── 3. Main loop: AC × date ───────────────────────────────────────────────
    for (let i = 0; i < toScrape.length; i++) {
      const { value, name, no } = toScrape[i]
      const acKey = String(no)

      if (done.has(acKey)) {
        combosDone += dateOptions.length
        console.log(`[${i + 1}/${toScrape.length}] ${name} — skipped (already done)`)
        continue
      }

      const acCandidates = new Map() // key = candidateName+partyName, value = candidate

      for (const date of dateOptions) {
        combosDone++
        process.stdout.write(`[${i + 1}/${toScrape.length}] ${name} / ${date}... `)

        try {
          const candidates = await scrapeACDate(page, value, no, name, date)

          let newCount = 0
          for (const c of candidates) {
            const key = `${c.candidateName}|||${c.partyName}`
            if (!acCandidates.has(key)) {
              acCandidates.set(key, c)
              newCount++
            }
          }

          console.log(`${newCount} new candidates (${candidates.length} on this date)`)

        } catch (err) {
          console.log(`ERROR: ${err.message}`)
          totalErrors++
        }

        if (combosDone < totalCombos) await sleep(DELAY_MS)
      }

      // Write this AC's deduplicated candidates to CSV
      const lines = [...acCandidates.values()].map(c =>
        [esc(String(c.acNo)), esc(c.acName), esc(c.candidateName), esc(c.gender), esc(c.partyName), esc(c.nominationDate)].join(',')
      )
      if (lines.length) appendFileSync(OUTPUT, lines.join('\n') + '\n', 'utf8')
      totalCandidates += acCandidates.size

      console.log(`  → ${name}: ${acCandidates.size} total unique candidates\n`)
      done.add(acKey)

      // Save progress every 10 ACs
      if ((i + 1) % 10 === 0) {
        saveProgress(done)
        console.log(`  ↳ Progress saved (${totalCandidates} candidates total, ${totalErrors} errors)\n`)
      }
    }

    saveProgress(done)
    console.log(`\n✅ Done! ${totalCandidates} unique candidates, ${totalErrors} errors`)
    console.log(`   Output: ${OUTPUT}`)

  } finally {
    await browser.close()
  }
}

main().catch(err => {
  console.error('Fatal error:', err)
  process.exit(1)
})
