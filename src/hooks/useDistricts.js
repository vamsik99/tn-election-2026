import { useQuery } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import { queryKeys } from '../lib/queryKeys'
import { IS_DEMO, DEMO_DISTRICTS } from '../lib/demoData'

export function useDistricts() {
  return useQuery({
    queryKey: queryKeys.districts(),
    queryFn: async () => {
      if (IS_DEMO) return DEMO_DISTRICTS
      const { data, error } = await supabase
        .from('districts')
        .select('id, name, slug')
        .order('name')
      if (error) throw error
      return data
    },
    staleTime: 1000 * 60 * 60,
  })
}
