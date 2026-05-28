export default defineEventHandler(async (event) => {
  if (!(await isAdminRequest(event))) throw createError({ statusCode: 403, message: 'admin only' })
  const repo = useRepo(event)
  await repo.clearSuperWinner()
  return { ok: true }
})
