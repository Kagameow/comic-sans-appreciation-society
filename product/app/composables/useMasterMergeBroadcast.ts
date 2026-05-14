import type { SuperEvent } from '#shared/types/game'

/**
 * docs/design-system.md §4 + docs/voice.md §7 — owns the 8-second
 * master-merge cinematic timeline. Components subscribe to `stage` and
 * render their slice; the canvas particle burst is fired imperatively at
 * t=4.8s. After the sequence ends the leaderboard underneath stays
 * dimmed-then-restored at 100% with the winner pinned.
 *
 * The plan §9 explicitly protects this moment — every other UI decision
 * trades off against making this 8 seconds hit the room hard.
 */

export type BroadcastStage
  = | 'idle'
    | 'flicker' //  0.0s — page-wide flicker
    | 'banner' //  0.5s — terminal log type-ins
    | 'headline' //  4.0s — MERGED TO PRODUCTION + name
    | 'particles' //  4.8s — particle burst
    | 'tag' //  5.5s — git tag v3.0.0 line
    | 'wellplayed' //  7.0s — "well played, $name" sub-line
    | 'settled' //  8.0s — leaderboard returns underneath

const STAGE_TIMELINE: { stage: BroadcastStage, at: number }[] = [
  { stage: 'flicker', at: 0 },
  { stage: 'banner', at: 500 },
  { stage: 'headline', at: 4000 },
  { stage: 'particles', at: 4800 },
  { stage: 'tag', at: 5500 },
  { stage: 'wellplayed', at: 7000 },
  { stage: 'settled', at: 8000 },
]

export function useMasterMergeBroadcast() {
  const stage = useState<BroadcastStage>('master-merge-stage', () => 'idle')
  const winner = useState<SuperEvent>('master-merge-winner', () => null)
  const fireParticles = ref(0)

  const timers: ReturnType<typeof useTimeoutFn>[] = []

  function clear() {
    for (const t of timers) t.stop()
    timers.length = 0
  }

  function play(next: SuperEvent) {
    if (!next)
      return
    clear()
    winner.value = next
    for (const { stage: s, at } of STAGE_TIMELINE) {
      timers.push(useTimeoutFn(() => {
        stage.value = s
        if (s === 'particles')
          fireParticles.value++
      }, at, { immediate: false }))
    }
    for (const t of timers) t.start()
  }

  function dismiss() {
    clear()
    stage.value = 'idle'
  }

  onScopeDispose(clear)

  return { stage, winner, fireParticles, play, dismiss }
}
