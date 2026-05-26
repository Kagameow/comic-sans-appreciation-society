export default defineEventHandler(async (event) => {
  const repo = useRepo(event)
  const [me, config, players, superWinner] = await Promise.all([
    currentPlayer(event),
    repo.getConfig(),
    repo.listPlayers(),
    repo.superWinner(),
  ])
  return { config, players, me, superWinner }
})
