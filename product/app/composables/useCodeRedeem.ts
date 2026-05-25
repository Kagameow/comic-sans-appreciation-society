type Mode = 'input' | 'quiz' | 'crossword' | 'challenge' | 'arcade'
type Flash = { pts: number; mult: number; note?: string }
type RedeemResponse =
  | { kind: 'invalid' }
  | { kind: 'point' | 'victory'; awarded: number; multiplier: number; clueUnlocked: boolean }
  | { kind: 'quiz' | 'crossword' | 'challenge' | 'arcade'; codeRef: string }
  | { kind: 'super'; alreadyWonBy?: string }

type AwardResponse = {
  awarded: number
  multiplier: number
  clueUnlocked?: boolean
  /** Server returns this for one-solve-per-player minigames (crossword, arcade). */
  alreadySolved?: boolean
}

/**
 * Orchestrates the submit / minigame / award flow for the Code Check page.
 * Owns mode state, the active minigame ref, and the transient flash banner.
 * Server is the source of truth — this composable only dispatches.
 */
export function useCodeRedeem() {
  const game = useGame()
  const lockout = useCodeLockout()

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
    if (res.clueUnlocked) useTimeoutFn(() => { showClueModal.value = true }, 1200)
  }

  async function submit(raw: string) {
    const code = raw.trim().toUpperCase()
    if (!code || lockout.locked.value) return

    const res = await $fetch<RedeemResponse>('/api/codes/redeem', {
      method: 'POST',
      body: { code },
    }).catch(() => ({ kind: 'invalid' as const }))

    await game.refresh()

    switch (res.kind) {
      case 'invalid':
        lockout.recordFail()
        return
      case 'super':
        if (res.alreadyWonBy) {
          flash.value = { pts: 0, mult: 1 }
          return
        }
        showSuperWin.value = true
        confettiSuperBurst()
        return
      case 'point':
      case 'victory':
        flashAward(res.awarded, res.multiplier)
        maybeOpenClue(res)
        return
      case 'quiz':
      case 'crossword':
      case 'challenge':
      case 'arcade':
        activeMinigame.value = { codeRef: res.codeRef }
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
      flashAward(res.awarded, res.multiplier)
      maybeOpenClue(res)
    } else if (res.alreadySolved) {
      flash.value = { pts: 0, mult: 1, note: 'You already solved this one — no double points.' }
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
