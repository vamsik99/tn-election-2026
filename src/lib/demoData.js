/**
 * Demo data for offline development (no Supabase required).
 * This data is used when VITE_SUPABASE_URL is not configured.
 */

export const DEMO_DISTRICTS = [
  { id: 1, name: 'Chennai', slug: 'chennai' },
  { id: 2, name: 'Coimbatore', slug: 'coimbatore' },
  { id: 3, name: 'Madurai', slug: 'madurai' },
  { id: 4, name: 'Thiruvallur', slug: 'thiruvallur' },
  { id: 5, name: 'Kancheepuram', slug: 'kancheepuram' },
  { id: 6, name: 'Tirunelveli', slug: 'tirunelveli' },
  { id: 7, name: 'Kanniyakumari', slug: 'kanniyakumari' },
  { id: 8, name: 'Vellore', slug: 'vellore' },
  { id: 9, name: 'Salem', slug: 'salem' },
  { id: 10, name: 'Erode', slug: 'erode' },
  { id: 11, name: 'Chengalpattu', slug: 'chengalpattu' },
  { id: 12, name: 'Krishnagiri', slug: 'krishnagiri' },
]

export const DEMO_PARTIES = [
  { id: 1, name: 'Dravida Munnetra Kazhagam', abbreviation: 'DMK', slug: 'dmk', alliance: 'INDIA', color_hex: '#E63946', logo_url: null },
  { id: 2, name: 'All India Anna Dravida Munnetra Kazhagam', abbreviation: 'AIADMK', slug: 'aiadmk', alliance: null, color_hex: '#006400', logo_url: null },
  { id: 3, name: 'Bharatiya Janata Party', abbreviation: 'BJP', slug: 'bjp', alliance: 'NDA', color_hex: '#FF6600', logo_url: null },
  { id: 4, name: 'Indian National Congress', abbreviation: 'INC', slug: 'inc', alliance: 'INDIA', color_hex: '#138808', logo_url: null },
  { id: 5, name: 'Pattali Makkal Katchi', abbreviation: 'PMK', slug: 'pmk', alliance: 'NDA', color_hex: '#1a7a1a', logo_url: null },
  { id: 6, name: 'Viduthalai Chiruthaigal Katchi', abbreviation: 'VCK', slug: 'vck', alliance: 'INDIA', color_hex: '#1a3a8c', logo_url: null },
  { id: 7, name: 'Tamilaga Vettri Kazhagam', abbreviation: 'TVK', slug: 'tvk', alliance: null, color_hex: '#0d9488', logo_url: null },
  { id: 8, name: 'Naam Tamilar Katchi', abbreviation: 'NTK', slug: 'ntk', alliance: null, color_hex: '#FF6600', logo_url: null },
]

export const DEMO_CONSTITUENCIES = [
  { id: 199, name: 'Thiruvottiyur', slug: 'thiruvottiyur', constituency_no: 199, reserved_for: 'sc', district: { id: 1, name: 'Chennai', slug: 'chennai' } },
  { id: 200, name: 'Dr. Radhakrishnan Nagar', slug: 'dr-radhakrishnan-nagar', constituency_no: 200, reserved_for: 'general', district: { id: 1, name: 'Chennai', slug: 'chennai' } },
  { id: 201, name: 'Perambur', slug: 'perambur', constituency_no: 201, reserved_for: 'general', district: { id: 1, name: 'Chennai', slug: 'chennai' } },
  { id: 202, name: 'Kolathur', slug: 'kolathur', constituency_no: 202, reserved_for: 'general', district: { id: 1, name: 'Chennai', slug: 'chennai' } },
  { id: 203, name: 'Villivakkam', slug: 'villivakkam', constituency_no: 203, reserved_for: 'general', district: { id: 1, name: 'Chennai', slug: 'chennai' } },
  { id: 208, name: 'Chepauk-Triplicane', slug: 'chepauk-triplicane', constituency_no: 208, reserved_for: 'general', district: { id: 1, name: 'Chennai', slug: 'chennai' } },
  { id: 209, name: 'Thousand Lights', slug: 'thousand-lights', constituency_no: 209, reserved_for: 'general', district: { id: 1, name: 'Chennai', slug: 'chennai' } },
  { id: 214, name: 'Mylapore', slug: 'mylapore', constituency_no: 214, reserved_for: 'general', district: { id: 1, name: 'Chennai', slug: 'chennai' } },
  { id: 54, name: 'Coimbatore (South)', slug: 'coimbatore-south', constituency_no: 54, reserved_for: 'general', district: { id: 2, name: 'Coimbatore', slug: 'coimbatore' } },
  { id: 52, name: 'Coimbatore (North)', slug: 'coimbatore-north', constituency_no: 52, reserved_for: 'general', district: { id: 2, name: 'Coimbatore', slug: 'coimbatore' } },
  { id: 57, name: 'Pollachi', slug: 'pollachi', constituency_no: 57, reserved_for: 'general', district: { id: 2, name: 'Coimbatore', slug: 'coimbatore' } },
  { id: 165, name: 'Madurai (East)', slug: 'madurai-east', constituency_no: 165, reserved_for: 'general', district: { id: 3, name: 'Madurai', slug: 'madurai' } },
  { id: 166, name: 'Madurai (Central)', slug: 'madurai-central', constituency_no: 166, reserved_for: 'general', district: { id: 3, name: 'Madurai', slug: 'madurai' } },
  { id: 167, name: 'Madurai (West)', slug: 'madurai-west', constituency_no: 167, reserved_for: 'general', district: { id: 3, name: 'Madurai', slug: 'madurai' } },
  { id: 29, name: 'Edappadi', slug: 'edappadi', constituency_no: 29, reserved_for: 'general', district: { id: 9, name: 'Salem', slug: 'salem' } },
  { id: 176, name: 'Bodinayakanur', slug: 'bodinayakanur', constituency_no: 176, reserved_for: 'sc', district: { id: 3, name: 'Madurai', slug: 'madurai' } },
  { id: 88, name: 'Chidambaram', slug: 'chidambaram', constituency_no: 88, reserved_for: 'general', district: { id: 2, name: 'Coimbatore', slug: 'coimbatore' } },
  { id: 196, name: 'Vilavancode', slug: 'vilavancode', constituency_no: 196, reserved_for: 'general', district: { id: 7, name: 'Kanniyakumari', slug: 'kanniyakumari' } },
  { id: 207, name: 'Harbour', slug: 'harbour', constituency_no: 207, reserved_for: 'sc', district: { id: 1, name: 'Chennai', slug: 'chennai' } },
]

const DEMO_CANDIDATES_RAW = [
  {
    id: 'c1', full_name: 'M K Stalin', full_name_ta: 'மு.க. ஸ்டாலின்', slug: 'mk-stalin',
    date_of_birth: '1953-03-01', gender: 'male', education: 'Graduate', profession: 'Politician',
    photo_url: null,
    contest: { constituency_slug: 'kolathur', party_slug: 'dmk', assets_movable: 245.5, assets_immovable: 1820.3, liabilities: 0, cases: 0 },
  },
  {
    id: 'c2', full_name: 'Edappadi K Palaniswami', full_name_ta: 'எடப்பாடி கே பழனிசாமி', slug: 'edappadi-k-palaniswami',
    date_of_birth: '1953-03-25', gender: 'male', education: 'Graduate', profession: 'Politician',
    photo_url: null,
    contest: { constituency_slug: 'edappadi', party_slug: 'aiadmk', assets_movable: 180.2, assets_immovable: 950.0, liabilities: 0, cases: 0 },
  },
  {
    id: 'c3', full_name: 'Annamalai K', full_name_ta: 'அண்ணாமலை கே', slug: 'annamalai-k',
    date_of_birth: '1984-07-30', gender: 'male', education: 'MBA', profession: 'Former IPS Officer',
    photo_url: null,
    contest: { constituency_slug: 'coimbatore-south', party_slug: 'bjp', assets_movable: 35.8, assets_immovable: 120.5, liabilities: 0, cases: 3 },
  },
  {
    id: 'c4', full_name: 'Vijay (Thalapathy)', full_name_ta: 'விஜய்', slug: 'vijay-thalapathy',
    date_of_birth: '1974-06-22', gender: 'male', education: 'B.Sc', profession: 'Actor / Politician',
    photo_url: null,
    contest: { constituency_slug: 'vilavancode', party_slug: 'tvk', assets_movable: 425.0, assets_immovable: 2800.0, liabilities: 0, cases: 0 },
  },
  {
    id: 'c5', full_name: 'Thol Thirumavalavan', full_name_ta: 'தொல். திருமாவளவன்', slug: 'thol-thirumavalavan',
    date_of_birth: '1965-05-17', gender: 'male', education: 'Graduate', profession: 'Politician',
    photo_url: null,
    contest: { constituency_slug: 'chidambaram', party_slug: 'vck', assets_movable: 8.5, assets_immovable: 32.1, liabilities: 0, cases: 1 },
  },
  {
    id: 'c6', full_name: 'Seeman', full_name_ta: 'சீமான்', slug: 'seeman',
    date_of_birth: '1974-02-14', gender: 'male', education: 'B.Com', profession: 'Director / Politician',
    photo_url: null,
    contest: { constituency_slug: 'harbour', party_slug: 'ntk', assets_movable: 12.3, assets_immovable: 45.0, liabilities: 0, cases: 2 },
  },
  {
    id: 'c7', full_name: 'O Panneerselvam', full_name_ta: 'ஓ. பன்னீர்செல்வம்', slug: 'o-panneerselvam',
    date_of_birth: '1952-11-18', gender: 'male', education: 'Class X', profession: 'Politician',
    photo_url: null,
    contest: { constituency_slug: 'bodinayakanur', party_slug: 'aiadmk', assets_movable: 320.1, assets_immovable: 2100.5, liabilities: 0, cases: 0 },
  },
  {
    id: 'c8', full_name: 'Kanimozhi Karunanidhi', full_name_ta: 'கனிமொழி கருணாநிதி', slug: 'kanimozhi-karunanidhi',
    date_of_birth: '1968-01-15', gender: 'female', education: 'M.Phil', profession: 'Politician / Poet',
    photo_url: null,
    contest: { constituency_slug: 'thousand-lights', party_slug: 'dmk', assets_movable: 150.0, assets_immovable: 780.0, liabilities: 42.5, cases: 0 },
  },
  {
    id: 'c9', full_name: 'Udhayanidhi Stalin', full_name_ta: 'உதயநிதி ஸ்டாலின்', slug: 'udhayanidhi-stalin',
    date_of_birth: '1977-11-27', gender: 'male', education: 'B.Com', profession: 'Actor / Politician',
    photo_url: null,
    contest: { constituency_slug: 'chepauk-triplicane', party_slug: 'dmk', assets_movable: 68.0, assets_immovable: 450.0, liabilities: 0, cases: 0 },
  },
  {
    id: 'c10', full_name: 'S Ve Shekher', full_name_ta: 'எஸ் வே சேகர்', slug: 's-ve-shekher',
    date_of_birth: '1953-10-17', gender: 'male', education: 'Graduate', profession: 'Actor / Politician',
    photo_url: null,
    contest: { constituency_slug: 'mylapore', party_slug: 'bjp', assets_movable: 45.2, assets_immovable: 310.0, liabilities: 0, cases: 1 },
  },
  {
    id: 'c11', full_name: 'Anbumani Ramadoss', full_name_ta: 'அன்புமணி ராமதாஸ்', slug: 'anbumani-ramadoss',
    date_of_birth: '1968-10-01', gender: 'male', education: 'MBBS MD', profession: 'Doctor / Politician',
    photo_url: null,
    contest: { constituency_slug: 'pollachi', party_slug: 'pmk', assets_movable: 52.0, assets_immovable: 220.0, liabilities: 0, cases: 0 },
  },
  {
    id: 'c12', full_name: 'Vaiko', full_name_ta: 'வைகோ', slug: 'vaiko',
    date_of_birth: '1944-06-24', gender: 'male', education: 'M.A., B.L.', profession: 'Politician / Advocate',
    photo_url: null,
    contest: { constituency_slug: 'madurai-east', party_slug: 'dmk', assets_movable: 18.0, assets_immovable: 180.0, liabilities: 0, cases: 0 },
  },
]

// Resolve references to build the nested structure that hooks expect
function buildContests() {
  return DEMO_CANDIDATES_RAW.map((c) => {
    const constituency = DEMO_CONSTITUENCIES.find((co) => co.slug === c.contest.constituency_slug)
    const party = DEMO_PARTIES.find((p) => p.slug === c.contest.party_slug)
    return {
      id: `ec-${c.id}`,
      candidate: {
        id: c.id,
        full_name: c.full_name,
        full_name_ta: c.full_name_ta,
        slug: c.slug,
        photo_url: c.photo_url,
        education: c.education,
        profession: c.profession,
        date_of_birth: c.date_of_birth,
      },
      party: party || null,
      constituency: constituency || null,
      election_year: 2026,
      is_current_election: true,
      assets_movable_lakh: c.contest.assets_movable,
      assets_immovable_lakh: c.contest.assets_immovable,
      liabilities_lakh: c.contest.liabilities,
      criminal_cases_pending: c.contest.cases,
      criminal_cases_detail: null,
      income_annual_lakh: null,
      affidavit_url: null,
      votes_received: null,
      result: null,
      vote_share_pct: null,
      margin: null,
    }
  })
}

export const DEMO_CONTESTS = buildContests()

// Build a full candidate object (as useCandidate returns)
export function getDemoCandidate(slug) {
  const raw = DEMO_CANDIDATES_RAW.find((c) => c.slug === slug)
  if (!raw) return null
  const contest = DEMO_CONTESTS.find((ec) => ec.candidate.slug === slug)
  return {
    id: raw.id,
    full_name: raw.full_name,
    full_name_ta: raw.full_name_ta,
    slug: raw.slug,
    date_of_birth: raw.date_of_birth,
    gender: raw.gender,
    education: raw.education,
    profession: raw.profession,
    photo_url: raw.photo_url,
    contests: contest ? [contest] : [],
  }
}

// Build a full constituency object (as useConstituency returns)
export function getDemoConstituency(slug) {
  const c = DEMO_CONSTITUENCIES.find((co) => co.slug === slug)
  if (!c) return null
  const contests = DEMO_CONTESTS.filter((ec) => ec.constituency?.slug === slug)
  return {
    ...c,
    contests,
    past_results: [],
  }
}

// Build a full party object (as useParty returns)
export function getDemoParty(slug) {
  const p = DEMO_PARTIES.find((pr) => pr.slug === slug)
  if (!p) return null
  const contests = DEMO_CONTESTS.filter((ec) => ec.party?.slug === slug)
  return { ...p, contests }
}

// Simple text search across candidates and constituencies
export function demoSearch(query) {
  if (!query || query.length < 2) return []
  const q = query.toLowerCase()
  const results = []

  DEMO_CANDIDATES_RAW.forEach((c) => {
    if (c.full_name.toLowerCase().includes(q)) {
      results.push({
        entity_type: 'candidate',
        entity_id: c.id,
        slug: c.slug,
        label: c.full_name,
        label_ta: c.full_name_ta,
        sub_label: null,
      })
    }
  })

  DEMO_CONSTITUENCIES.forEach((c) => {
    if (c.name.toLowerCase().includes(q) || c.district?.name?.toLowerCase().includes(q)) {
      results.push({
        entity_type: 'constituency',
        entity_id: String(c.id),
        slug: c.slug,
        label: c.name,
        label_ta: null,
        sub_label: c.district?.name,
      })
    }
  })

  return results.slice(0, 20)
}

export const IS_DEMO = !import.meta.env.VITE_SUPABASE_URL || import.meta.env.VITE_SUPABASE_URL === 'https://placeholder.supabase.co'
