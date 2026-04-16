import { useQuery } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import { queryKeys } from '../lib/queryKeys'
import { IS_DEMO, DEMO_CONSTITUENCIES } from '../lib/demoData'

export function useConstituencies(filters = {}) {
  return useQuery({
    queryKey: queryKeys.constituencies(filters),
    queryFn: async () => {
      if (IS_DEMO) {
        let result = DEMO_CONSTITUENCIES
        if (filters.districtId) {
          result = result.filter((c) => c.district?.id === filters.districtId)
        }
        if (filters.reservedFor) {
          result = result.filter((c) => c.reserved_for === filters.reservedFor)
        }
        return result
      }
      let query = supabase
        .from('constituencies')
        .select('id, name, slug, constituency_no, reserved_for, district:districts(id, name, slug)')
        .order('constituency_no')

      if (filters.districtId) {
        query = query.eq('district_id', filters.districtId)
      }
      if (filters.reservedFor) {
        query = query.eq('reserved_for', filters.reservedFor)
      }

      const { data, error } = await query
      if (error) throw error
      return data
    },
    staleTime: 1000 * 60 * 60,
  })
}
