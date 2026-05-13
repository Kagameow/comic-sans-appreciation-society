import { useRepo } from '~/server/utils/repo'
import { isAdminRequest } from '~/server/utils/supabase'

export default defineEventHandler(async (event) => {
  if (!isAdminRequest(event)) throw createError({ statusCode: 403, message: 'admin only' })
  const body = await readBody<{ multiplier?: number; minutes?: number }>(event)
  const multiplier = Number(body?.multiplier ?? 1)
  const minutes = Number(body?.minutes ?? 0)
  if (!Number.isFinite(multiplier) || multiplier < 1 || multiplier > 10) {
    throw createError({ statusCode: 400, message: 'multiplier out of range' })
  }

  const repo = useRepo()
  if (multiplier <= 1) return { ok: true, config: repo.clearMultiplier() }
  return { ok: true, config: repo.setMultiplier(multiplier, Math.max(0, Math.min(240, minutes))) }
})
