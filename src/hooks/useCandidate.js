import { useQuery } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import { queryKeys } from '../lib/queryKeys'
import { IS_DEMO, getDemoCandidate } from '../lib/demoData'

export function useCandidate(slug) {
  return useQuery({
    queryKey: queryKeys.candidate(slug),
    queryFn: async () => {
      if (IS_DEMO) {
        const result = getDemoCandidate(slug)
        if (!result) throw new Error('Not found')
        return result
      }
      const { data, error } = await supabase
        .from('candidates')
        .select(`
          *,
          contests:election_contests(
            id, election_year, is_current_election,
            assets_movable_lakh, assets_immovable_lakh,
            liabilities_lakh, criminal_cases_pending, criminal_cases_detail,
            income_annual_lakh, affidavit_url,
            votes_received, result, vote_share_pct, margin,
            party:parties(id, name, abbreviation, color_hex, slug),
            constituency:constituencies(name, slug, district:districts(name))
          )
        `)
        .eq('slug', slug)
        .order('election_year', { referencedTable: 'contests', ascending: false })
        .single()

      if (error) throw error
      return data
    },
    staleTime: 1000 * 60 * 5,
    enabled: !!slug,
  })
}
