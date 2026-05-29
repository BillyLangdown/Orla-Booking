import { createClient } from '@supabase/supabase-js'
import type { Resource } from '@/types'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
)

export const resourceService = {
  async getResources(tenantId: string): Promise<Resource[]> {
    const { data, error } = await supabase
      .from('resources')
      .select('*')
      .eq('tenant_id', tenantId)
      .order('name')
    if (error || !data) return []
    return (data as Record<string, unknown>[]).map((r) => ({
      id:       r.id as string,
      tenantId: r.tenant_id as string,
      name:     r.name as string,
      type:     r.type as 'instructor' | 'bike',
    }))
  },
}
