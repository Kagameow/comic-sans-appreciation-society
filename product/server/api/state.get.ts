export default defineEventHandler(async (event) => {
  const repo = useRepo(event)
  const [me, config, players] = await Promise.all([
    currentPlayer(event).catch(() => null),
    repo.getConfig().catch(() => ({ multiplier: 1, multiplierEndsAt: null, superCode: null, superWinner: null, superWonAt: null })),
    repo.listPlayers().catch(() => []),
  ])
  const superWinner = await repo.superWinner().catch(() => null)
  return { config, players, me, superWinner }
})
