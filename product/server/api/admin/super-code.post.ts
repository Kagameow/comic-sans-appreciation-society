export default defineEventHandler(async (event) => {
  if (!(await isAdminRequest(event)))
    throw createError({ statusCode: 403, message: 'admin only' })
  const body = await readBody<{ code?: string }>(event)
  const code = String(body?.code ?? '').trim().toUpperCase()
  if (!code)
    throw createError({ statusCode: 400, message: 'code required' })
  const repo = useRepo()
  if (!repo.getCode(code))
    throw createError({ statusCode: 404, message: 'unknown code' })
  return { ok: true, config: repo.setSuperCode(code) }
})
