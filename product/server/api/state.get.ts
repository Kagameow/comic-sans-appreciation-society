export default defineEventHandler(async (event) => {
  const repo = useRepo()
  const me = await currentPlayer(event)
  return {
    config: repo.getConfig(),
    players: repo.listPlayers(),
    me,
    superWinner: repo.superWinner(),
  }
})
