type Mode = 'input' | 'trivia' | 'crossword' | 'challenge'
interface Flash { pts: number, mult: number }

interface RedeemResponse {
  kind: 'invalid' | 'point' | 'victory' | 'trivia' | 'crossword' | 'challenge' | 'super'
  awarded?: number
  multiplier?: number
  clueUnlocked?: boolean
  alreadyWonBy?: string
  codeRef?: string
  lines: string[]
}

interface AwardResponse {
  awarded: number
  multiplier: number
  clueUnlocked?: boolean
}

/**
 * Orchestrates the submit / minigame / award flow for the Contributor
 * Terminal. Owns mode state, the active minigame ref, and the transient
 * flash banner; pushes the server-authored terminal voice into the bus.
 */
export function useCodeRedeem() {
  const game = useGame()
  const lockout = useCodeLockout()
  const term = useTerminalBus()

  const mode = ref<Mode>('input')
  const activeMinigame = ref<{ codeRef: string } | null>(null)
  const flash = refAutoReset<Flash | null>(null, 2500)
  const showClueModal = ref(false)
  const showSuperWin = ref(false)

  function flashAward(pts: number, mult: number) {
    flash.value = { pts, mult }
    confettiBurst()
  }

  function maybeOpenClue(res: { clueUnlocked?: boolean }) {
    if (res.clueUnlocked)
      useTimeoutFn(() => { showClueModal.value = true }, 1200)
  }

  function pushLines(lines: string[] | undefined, tone?: 'vue' | 'amber' | 'red') {
    if (!lines)
      return
    for (const text of lines) term.line(text, tone)
  }

  async function submit(raw: string) {
    const code = raw.trim().toUpperCase()
    if (!code || lockout.locked.value)
      return

    const res = await $fetch<RedeemResponse>('/api/codes/redeem', {
      method: 'POST',
      body: { code },
    }).catch(() => ({ kind: 'invalid' as const, lines: [`> git commit -m "${code}"`, '> ⚠ Network failure.'] }))

    await game.refresh()

    switch (res.kind) {
      case 'invalid':
        pushLines(res.lines, 'red')
        lockout.recordFail()
        return
      case 'super':
        pushLines(res.lines, res.alreadyWonBy ? 'amber' : 'vue')
        if (res.alreadyWonBy) {
          flash.value = { pts: 0, mult: 1 }
          return
        }
        showSuperWin.value = true
        confettiSuperBurst()
        return
      case 'point':
      case 'victory':
        pushLines(res.lines, 'vue')
        flashAward(res.awarded ?? 0, res.multiplier ?? 1)
        maybeOpenClue(res)
        return
      case 'trivia':
      case 'crossword':
      case 'challenge':
        pushLines(res.lines, 'amber')
        activeMinigame.value = { codeRef: res.codeRef ?? 'minigame' }
        mode.value = res.kind
    }
  }

  async function resolveMinigame(points: number) {
    const codeRef = activeMinigame.value?.codeRef ?? 'minigame'
    const res = await $fetch<AwardResponse>('/api/codes/award', {
      method: 'POST',
      body: { codeRef, base: points },
    })
    await game.refresh()
    mode.value = 'input'
    activeMinigame.value = null
    if (res.awarded > 0) {
      term.line(`> RFC ${codeRef} merged. ref(credits).value += ${res.awarded}`, 'vue')
      flashAward(res.awarded, res.multiplier)
      maybeOpenClue(res)
    }
    else {
      term.line('> RFC closed without merge.', 'amber')
    }
  }

  return {
    mode,
    activeMinigame,
    flash,
    showClueModal,
    showSuperWin,
    lockout,
    submit,
    resolveMinigame,
  }
}
