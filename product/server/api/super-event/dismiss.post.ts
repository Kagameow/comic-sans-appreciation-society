export default defineEventHandler(async (event) => {
  if (!(await isAdminRequest(event))) {
    throw createError({ statusCode: 403, message: 'admin only' })
  }
  await useRepo(event).clearSuperWinner()
  return { ok: true }
})
