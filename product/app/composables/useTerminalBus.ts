/**
 * Shared terminal output buffer for the Contributor Terminal (/check).
 * The redeem flow pushes lines via `term.line(...)`; the RedeemTerminal
 * component renders the buffer with a 30 cps type-in animation.
 *
 * Lifetime is page-scoped: created on first call inside `<script setup>`,
 * shared across siblings via Nuxt's request payload + a state key.
 */

export interface TerminalLine {
  id: number
  text: string
  /** Optional inline decoration; lets callers tag a line as success/fail/info. */
  tone?: 'vue' | 'amber' | 'red' | 'ink'
  /** When set, line skips the type-in animation (used for replayed history). */
  instant?: boolean
}

const BUFFER_ROWS = 8
let nextId = 1

export function useTerminalBus() {
  const lines = useState<TerminalLine[]>('terminal-buffer', () => [])

  function push(text: string, tone?: TerminalLine['tone']) {
    lines.value = [...lines.value, { id: nextId++, text, tone }].slice(-BUFFER_ROWS)
  }

  function clear() {
    lines.value = []
  }

  return {
    lines: readonly(lines),
    line: push,
    clear,
    bufferRows: BUFFER_ROWS,
  }
}
