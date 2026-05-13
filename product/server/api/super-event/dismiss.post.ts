
export default defineEventHandler(() => {
  useRepo().clearSuperWinner()
  return { ok: true }
})
