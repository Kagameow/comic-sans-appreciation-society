import { useMemo, useState } from "react";

// Simple 5x5 with placed answers
const ANSWERS = [
  { word: "PINIA", row: 0, col: 0, dir: "across", clue: "Vue 3's official state library" },
  { word: "SETUP", row: 2, col: 0, dir: "across", clue: "<script ___> macro" },
  { word: "VITE", row: 4, col: 0, dir: "across", clue: "Lightning-fast dev server" },
];

const SIZE = 5;

export default function Crossword({ onSolve }: { onSolve: (points: number) => void }) {
  // Build mask of active cells
  const active = useMemo(() => {
    const m: boolean[][] = Array.from({ length: SIZE }, () => Array(SIZE).fill(false));
    ANSWERS.forEach((a) => {
      for (let i = 0; i < a.word.length; i++) {
        if (a.dir === "across") m[a.row][a.col + i] = true;
        else m[a.row + i][a.col] = true;
      }
    });
    return m;
  }, []);

  const [grid, setGrid] = useState<string[][]>(
    Array.from({ length: SIZE }, () => Array(SIZE).fill(""))
  );

  const filled = grid.every((row, r) => row.every((c, ci) => !active[r][ci] || c.length > 0));

  const update = (r: number, c: number, v: string) => {
    setGrid((g) => g.map((row, ri) => row.map((cell, ci) => (ri === r && ci === c ? v.toUpperCase().slice(-1) : cell))));
  };

  const submit = () => onSolve(75);

  return (
    <div className="rounded-2xl border border-border bg-card p-8 shadow-[var(--shadow-card)]">
      <div className="text-xs uppercase tracking-widest text-muted-foreground mb-4">Crossword · Vue 3</div>
      <div className="grid md:grid-cols-2 gap-8">
        <div className="grid gap-1.5" style={{ gridTemplateColumns: `repeat(${SIZE}, minmax(0,1fr))` }}>
          {grid.map((row, r) =>
            row.map((cell, c) =>
              active[r][c] ? (
                <input
                  key={`${r}-${c}`}
                  value={cell}
                  onChange={(e) => update(r, c, e.target.value)}
                  maxLength={1}
                  className="aspect-square w-full text-center font-bold text-lg uppercase rounded-md bg-background border border-border focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary ticker-mono"
                />
              ) : (
                <div key={`${r}-${c}`} className="aspect-square w-full rounded-md bg-muted/20" />
              )
            )
          )}
        </div>
        <div>
          <h3 className="font-semibold mb-2">Across</h3>
          <ul className="space-y-2 text-sm text-muted-foreground">
            {ANSWERS.map((a, i) => (
              <li key={i}>
                <span className="ticker-mono text-primary mr-2">{i + 1}.</span>
                {a.clue} <span className="opacity-50">({a.word.length})</span>
              </li>
            ))}
          </ul>
          <button
            disabled={!filled}
            onClick={submit}
            className="mt-6 w-full py-3 rounded-lg bg-primary text-primary-foreground font-semibold disabled:opacity-30 disabled:cursor-not-allowed hover:brightness-110 transition"
          >
            Submit Crossword
          </button>
        </div>
      </div>
    </div>
  );
}
