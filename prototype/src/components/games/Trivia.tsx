import { useEffect, useState } from "react";

type Props = {
  question: string;
  answers: string[];
  correctIdx: number;
  onResolve: (points: number) => void;
};

const TOTAL = 20; // seconds

export default function Trivia({ question, answers, correctIdx, onResolve }: Props) {
  const [elapsed, setElapsed] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);

  useEffect(() => {
    if (picked !== null) return;
    const t = setInterval(() => setElapsed((e) => e + 0.1), 100);
    return () => clearInterval(t);
  }, [picked]);

  const remaining = Math.max(0, TOTAL - elapsed);
  const pct = (remaining / TOTAL) * 100;
  const points = remaining > 13 ? 100 : remaining > 6 ? 50 : 10;
  const color = remaining > 13 ? "bg-primary" : remaining > 6 ? "bg-accent" : "bg-destructive";
  const colorText = remaining > 13 ? "text-primary" : remaining > 6 ? "text-accent" : "text-destructive";

  const pick = (i: number) => {
    setPicked(i);
    const earned = i === correctIdx ? points : 0;
    setTimeout(() => onResolve(earned), 1200);
  };

  return (
    <div className="rounded-2xl border border-border bg-card p-8 shadow-[var(--shadow-card)]">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs uppercase tracking-widest text-muted-foreground">Trivia · Time Decay</span>
        <span className={`ticker-mono font-bold text-2xl ${colorText}`}>+{points}</span>
      </div>
      <div className="h-2 rounded-full bg-muted overflow-hidden mb-6">
        <div className={`h-full transition-all ${color}`} style={{ width: `${pct}%` }} />
      </div>

      <h2 className="text-2xl font-semibold mb-6">{question}</h2>

      <div className="grid sm:grid-cols-2 gap-3">
        {answers.map((a, i) => {
          const isPicked = picked === i;
          const isCorrect = picked !== null && i === correctIdx;
          return (
            <button
              key={i}
              disabled={picked !== null}
              onClick={() => pick(i)}
              className={`text-left px-4 py-3 rounded-lg border transition-all ${
                isCorrect
                  ? "bg-primary/20 border-primary text-primary"
                  : isPicked
                  ? "bg-destructive/15 border-destructive"
                  : "bg-muted/40 border-border hover:border-primary/60 hover:bg-muted"
              }`}
            >
              <span className="ticker-mono text-xs text-muted-foreground mr-2">{String.fromCharCode(65 + i)}</span>
              {a}
            </button>
          );
        })}
      </div>
    </div>
  );
}
