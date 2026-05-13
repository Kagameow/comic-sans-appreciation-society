import confetti from 'canvas-confetti'

export function useConfetti() {
  const burst = (overrides: confetti.Options = {}) => {
    if (typeof window === 'undefined') return
    confetti({
      particleCount: 120,
      spread: 80,
      origin: { y: 0.4 },
      colors: ['#42b883', '#FEFA7C', '#CCB5FF', '#35495e'],
      ...overrides,
    })
  }
  const superBurst = () => {
    if (typeof window === 'undefined') return
    const opts = {
      particleCount: 220, spread: 140, origin: { y: 0.3 },
      colors: ['#42b883', '#FFD700', '#FEFA7C', '#ffffff'],
    }
    confetti(opts)
    setTimeout(() => confetti(opts), 400)
    setTimeout(() => confetti(opts), 800)
  }
  return { burst, superBurst }
}
