/**
 * Server-side maintainer commands. Each one refreshes the store on success
 * so the UI reflects the new state immediately, then the polling loop
 * covers everyone else. Stateless — the codes registry is owned by
 * AdminCodesPanel.
 *
 * Also exposes a tiny undo stack + a pipeline-log feed so the admin
 * mission control can show every action as a terminal line (and undo it
 * within 5 seconds, per docs/refactor-plan.md §3.2/§3.3).
 */

import type { Player } from '#shared/types/game'

export interface PipelineLogLine {
  id: number
  text: string
  tone: 'vue' | 'amber' | 'red' | 'ink'
  at: number
}

export interface UndoableAction {
  /** Human label for the undo toast. */
  label: string
  undo: () => Promise<void>
  /** Wall-clock deadline for the undo toast to fade. */
  expiresAt: number
}

let logId = 1

export function useAdminActions() {
  const game = useGame()
  const log = useState<PipelineLogLine[]>('admin-pipeline-log', () => [])
  const undoStack = useState<UndoableAction[]>('admin-undo-stack', () => [])
  // docs/refactor-plan.md §3.6 — easter egg counter; the column reveals
  // after 10 reversible actions in a session.
  const actionCount = useState<number>('admin-action-count', () => 0)

  function pushLog(text: string, tone: PipelineLogLine['tone'] = 'vue') {
    log.value = [...log.value, { id: logId++, text, tone, at: Date.now() }].slice(-200)
  }

  function pushUndo(label: string, undo: () => Promise<void>) {
    actionCount.value++
    const action: UndoableAction = { label, undo, expiresAt: Date.now() + 5000 }
    undoStack.value = [action, ...undoStack.value]
    useTimeoutFn(() => {
      undoStack.value = undoStack.value.filter(a => a !== action)
    }, 5000)
  }

  async function undoLast() {
    const next = undoStack.value[0]
    if (!next) {
      pushLog('> nothing to undo. stack empty.', 'amber')
      return
    }
    undoStack.value = undoStack.value.slice(1)
    await next.undo()
    pushLog(`> undo: ${next.label}`, 'amber')
  }

  async function setMultiplier(multiplier: number, minutes: number) {
    const prev = { multiplier: game.config.multiplier, minutes: 0 }
    if (game.config.multiplierEndsAt) {
      prev.minutes = Math.max(0, Math.ceil((game.config.multiplierEndsAt - Date.now()) / 60_000))
    }
    await $fetch('/api/admin/multiplier', { method: 'POST', body: { multiplier, minutes } })
    await game.refresh()
    pushLog(`> defineEmits(['multiplier:toggle']) fired — ${multiplier}× for ${minutes}min`)
    pushUndo(`Engaged ${multiplier}× for ${minutes}min`, async () => {
      await $fetch('/api/admin/multiplier', { method: 'POST', body: { multiplier: prev.multiplier, minutes: prev.minutes } })
      await game.refresh()
    })
  }

  async function clearMultiplier() {
    const prev = { multiplier: game.config.multiplier, ends: game.config.multiplierEndsAt }
    await $fetch('/api/admin/multiplier', { method: 'POST', body: { multiplier: 1, minutes: 0 } })
    await game.refresh()
    pushLog('> HMR session ended. Defaulting to standard build.', 'amber')
    pushUndo('Stopped HMR', async () => {
      if (!prev.ends)
        return
      const minutes = Math.max(1, Math.ceil((prev.ends - Date.now()) / 60_000))
      await $fetch('/api/admin/multiplier', { method: 'POST', body: { multiplier: prev.multiplier, minutes } })
      await game.refresh()
    })
  }

  async function adjustPoints(playerId: string, delta: number) {
    const player = game.players.find((p: Player) => p.id === playerId)
    if (!player)
      return
    await $fetch('/api/admin/adjust', { method: 'POST', body: { playerId, delta } })
    await game.refresh()
    pushLog(`> defineProps({ contributor: '${player.name}', delta: ${delta >= 0 ? '+' : ''}${delta} }) applied`)
    pushUndo(`${player.name} ${delta >= 0 ? '+' : ''}${delta}`, async () => {
      await $fetch('/api/admin/adjust', { method: 'POST', body: { playerId, delta: -delta } })
      await game.refresh()
    })
  }

  async function pickSuper(code: string) {
    const prev = game.config.superCode
    await $fetch('/api/admin/super-code', { method: 'POST', body: { code } })
    await game.refresh()
    pushLog(`> active super code → ${code}. previous winner cleared.`)
    if (prev && prev !== code) {
      pushUndo(`Super → ${code}`, async () => {
        await $fetch('/api/admin/super-code', { method: 'POST', body: { code: prev } })
        await game.refresh()
      })
    }
  }

  return {
    setMultiplier,
    clearMultiplier,
    adjustPoints,
    pickSuper,
    undoLast,
    log,
    undoStack,
    actionCount,
    pushLog,
  }
}
