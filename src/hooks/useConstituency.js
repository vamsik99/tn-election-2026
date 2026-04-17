import { useQuery } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import { queryKeys } from '../lib/queryKeys'
import { IS_DEMO, getDemoConstituency } from '../lib/demoData'

export function useConstituency(slug) {
  return useQuery({
    queryKey: queryKeys.constituency(slug),
    queryFn: async () => {
      if (IS_DEMO) {
        const result = getDemoConstituency(slug)
        if (!result) throw new Error('Not found')
        return result
      }
      const { data, error } = await supabase
        .from('constituencies')
        .select(`
          *,
          district:districts(name, slug),
          past_results:constituency_results(
            election_year, winning_margin, voter_turnout_pct,
            winning_candidate:candidates(full_name, slug),
            winning_party:parties(abbreviation, color_hex, slug)
          ),
          contests:election_contests(
            id, assets_movable_lakh, assets_immovable_lakh,
            liabilities_lakh, criminal_cases_pending, affidavit_url, nomination_date,
            candidate:candidates(id, full_name, full_name_ta, slug, photo_url, education, profession, date_of_birth),
            party:parties(id, abbreviation, name, color_hex, slug, alliance)
          )
        `)
        .eq('slug', slug)
        .eq('contests.is_current_election', true)
        .order('election_year', { referencedTable: 'past_results', ascending: false })
        .single()

      if (error) throw error
      return data
    },
    staleTime: 1000 * 60 * 5,
    enabled: !!slug,
  })
}
