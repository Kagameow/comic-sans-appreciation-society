import { serverSupabaseClient } from '#supabase/server'

let fallbackCount = 42069

export default defineEventHandler(async (event) => {
  try {
    const client = await serverSupabaseClient(event)

    const { data, error } = await client.rpc('increment_visit_counter')

    if (error) throw error

    return { count: data as number }
  }
  catch {
    fallbackCount++
    return { count: fallbackCount, fallback: true }
  }
})
