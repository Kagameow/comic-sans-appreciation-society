import { useRepo } from '~/server/utils/repo'
import { isAdminRequest } from '~/server/utils/supabase'

export default defineEventHandler((event) => {
  if (!isAdminRequest(event)) throw createError({ statusCode: 403, message: 'admin only' })
  return { codes: useRepo().listCodes() }
})
