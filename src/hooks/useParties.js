import { useQuery } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import { queryKeys } from '../lib/queryKeys'
import { IS_DEMO, DEMO_PARTIES } from '../lib/demoData'

export function useParties(filters = {}) {
  return useQuery({
    queryKey: queryKeys.parties(filters),
    queryFn: async () => {
      if (IS_DEMO) {
        if (filters.alliance) {
          return DEMO_PARTIES.filter((p) => p.alliance === filters.alliance)
        }
        return DEMO_PARTIES
      }
      let query = supabase
        .from('parties')
        .select('id, name, abbreviation, slug, alliance, color_hex, logo_url')
        .order('name')

      if (filters.alliance) {
        query = query.eq('alliance', filters.alliance)
      }

      const { data, error } = await query
      if (error) throw error
      return data
    },
    staleTime: 1000 * 60 * 60,
  })
}
