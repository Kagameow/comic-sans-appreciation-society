
export default defineEventHandler((event) => {
  const repo = useRepo()
  const { player: playerName } = getQuery(event) as { player?: string }
  const players = repo.listPlayers()
  const me = playerName ? players.find(p => p.name === playerName) ?? null : null
  return {
    config: repo.getConfig(),
    players,
    me,
    superWinner: repo.superWinner(),
  }
})
