import { useRepo } from '~/server/utils/repo'

export default defineEventHandler(() => {
  useRepo().clearSuperWinner()
  return { ok: true }
})
