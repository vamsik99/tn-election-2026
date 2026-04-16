import { useQuery } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import { queryKeys } from '../lib/queryKeys'
import { IS_DEMO, getDemoParty } from '../lib/demoData'

export function useParty(slug) {
  return useQuery({
    queryKey: queryKeys.party(slug),
    queryFn: async () => {
      if (IS_DEMO) {
        const result = getDemoParty(slug)
        if (!result) throw new Error('Not found')
        return result
      }
      const { data, error } = await supabase
        .from('parties')
        .select(`
          *,
          contests:election_contests(
            id, assets_movable_lakh, assets_immovable_lakh,
            liabilities_lakh, criminal_cases_pending,
            candidate:candidates(id, full_name, slug, photo_url),
            constituency:constituencies(name, slug, district:districts(name))
          )
        `)
        .eq('slug', slug)
        .eq('contests.is_current_election', true)
        .single()

      if (error) throw error
      return data
    },
    staleTime: 1000 * 60 * 5,
    enabled: !!slug,
  })
}
