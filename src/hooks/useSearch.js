import { useQuery } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import { queryKeys } from '../lib/queryKeys'
import { IS_DEMO, demoSearch } from '../lib/demoData'

export function useSearch(query) {
  return useQuery({
    queryKey: queryKeys.search(query),
    queryFn: async () => {
      if (IS_DEMO) return demoSearch(query)
      const { data, error } = await supabase
        .from('search_index')
        .select('entity_type, entity_id, slug, label, label_ta, sub_label')
        .textSearch('tsv', query, { type: 'plain', config: 'simple' })
        .limit(20)

      if (error) throw error
      return data
    },
    enabled: (query?.trim().length ?? 0) >= 2,
    staleTime: 1000 * 30,
  })
}
