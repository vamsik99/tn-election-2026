import { useQuery } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import { queryKeys } from '../lib/queryKeys'
import { IS_DEMO, getDemoParty } from '../lib/demoData'

const PAGE_SIZE = 50

export function useParty(slug) {
  return useQuery({
    queryKey: queryKeys.party(slug),
    queryFn: async () => {
      if (IS_DEMO) {
        const result = getDemoParty(slug)
        if (!result) throw new Error('Not found')
        return result
      }
      // Fetch party info without contests (avoids huge payloads)
      const { data: party, error: partyError } = await supabase
        .from('parties')
        .select('id, name, abbreviation, slug, alliance, color_hex, logo_url')
        .eq('slug', slug)
        .single()

      if (partyError) throw partyError

      // Fetch first page of contests
      const { data: contests, error: contestError } = await supabase
        .from('election_contests')
        .select(`
          id, assets_movable_lakh, assets_immovable_lakh,
          liabilities_lakh, criminal_cases_pending,
          candidate:candidates(id, full_name, slug, photo_url),
          constituency:constituencies(name, slug, district:districts(name))
        `)
        .eq('party_id', party.id)
        .eq('is_current_election', true)
        .order('constituency_id')
        .limit(PAGE_SIZE)

      if (contestError) throw contestError

      // Get total count
      const { count } = await supabase
        .from('election_contests')
        .select('id', { count: 'exact', head: true })
        .eq('party_id', party.id)
        .eq('is_current_election', true)

      return { ...party, contests: contests ?? [], total: count ?? 0 }
    },
    staleTime: 1000 * 60 * 5,
    enabled: !!slug,
  })
}

/**
 * Load more contests for a party (pagination)
 */
export function usePartyContests(partyId, page = 0) {
  return useQuery({
    queryKey: ['party-contests', partyId, page],
    queryFn: async () => {
      if (!partyId) return []
      const { data, error } = await supabase
        .from('election_contests')
        .select(`
          id, assets_movable_lakh, assets_immovable_lakh,
          liabilities_lakh, criminal_cases_pending,
          candidate:candidates(id, full_name, slug, photo_url),
          constituency:constituencies(name, slug, district:districts(name))
        `)
        .eq('party_id', partyId)
        .eq('is_current_election', true)
        .order('constituency_id')
        .range(page * PAGE_SIZE, (page + 1) * PAGE_SIZE - 1)

      if (error) throw error
      return data ?? []
    },
    staleTime: 1000 * 60 * 5,
    enabled: !!partyId && page > 0,
  })
}
