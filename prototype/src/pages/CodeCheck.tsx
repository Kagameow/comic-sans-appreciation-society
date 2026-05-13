import { useEffect, useRef, useState } from "react";
import confetti from "canvas-confetti";
import AppShell from "@/components/AppShell";
import GemsTracker from "@/components/GemsTracker";
import Trivia from "@/components/games/Trivia";
import Crossword from "@/components/games/Crossword";
import Challenge from "@/components/games/Challenge";
import { useApp, SUPER_CODE, SUPER_CLUE, TOTAL_GEMS } from "@/lib/appState";
import { CURRENT_USER } from "@/lib/mockData";
import { Lock, Sparkles, GitMerge, X } from "lucide-react";

type Mode = "input" | "trivia" | "crossword" | "challenge";

const CODES: Record<string, { type: "point" | "trivia" | "crossword" | "challenge"; value?: number }> = {
  "V3-READY": { type: "point", value: 50 },
  COMPOSITION: { type: "point", value: 75 },
  TELEPORT: { type: "point", value: 25 },
  PINIA: { type: "point", value: 100 },
  REACTIVE: { type: "trivia" },
  SETUP: { type: "crossword" },
  CHALLENGE: { type: "challenge" },
};

export default function CodeCheck() {
  const [mode, setMode] = useState<Mode>("input");
  const [code, setCode] = useState("");
  const [fails, setFails] = useState(0);
  const [lockUntil, setLockUntil] = useState<number | null>(null);
  const [lockRemain, setLockRemain] = useState(0);
  const [flash, setFlash] = useState<{ pts: number; mult: number } | null>(null);
  const [showClueModal, setShowClueModal] = useState(false);
  const [showSuperWin, setShowSuperWin] = useState(false);
  const {
    multiplier, addPoints,
    gems, addGem, clueUnlocked,
    claimSuperCode, superCodeFound,
  } = useApp();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!lockUntil) return;
    const t = setInterval(() => {
      const ms = lockUntil - Date.now();
      if (ms <= 0) {
        setLockUntil(null);
        setLockRemain(0);
        setFails(0);
      } else setLockRemain(Math.ceil(ms / 1000));
    }, 250);
    return () => clearInterval(t);
  }, [lockUntil]);

  const award = (base: number, opts?: { gem?: boolean }) => {
    const total = base * multiplier;
    addPoints(total);
    setFlash({ pts: total, mult: multiplier });
    confetti({
      particleCount: 120,
      spread: 80,
      origin: { y: 0.4 },
      colors: ["#42b883", "#FEFA7C", "#CCB5FF", "#35495e"],
    });
    if (opts?.gem) {
      const wasFinal = gems + 1 >= TOTAL_GEMS;
      addGem();
      if (wasFinal) {
        setTimeout(() => setShowClueModal(true), 1200);
      }
    }
    setTimeout(() => setFlash(null), 2500);
  };

  const fireSuperCode = () => {
    claimSuperCode(CURRENT_USER.name);
    setShowSuperWin(true);
    addPoints(1000);
    const burst = () =>
      confetti({
        particleCount: 200,
        spread: 120,
        origin: { y: 0.3 },
        colors: ["#42b883", "#FFD700", "#FEFA7C", "#ffffff"],
      });
    burst();
    setTimeout(burst, 400);
    setTimeout(burst, 800);
  };

  const submit = () => {
    const c = code.trim().toUpperCase();
    if (!c) return;
    setCode("");
    if (c === SUPER_CODE) {
      fireSuperCode();
      return;
    }
    const hit = CODES[c];
    if (!hit) {
      const next = fails + 1;
      setFails(next);
      if (next >= 3) setLockUntil(Date.now() + 60_000);
      return;
    }
    if (hit.type === "point") award(hit.value!, { gem: true });
    else if (hit.type === "trivia") setMode("trivia");
    else if (hit.type === "crossword") setMode("crossword");
    else setMode("challenge");
  };

  const back = (earned: number) => {
    if (earned > 0) award(earned, { gem: true });
    setMode("input");
    setTimeout(() => inputRef.current?.focus(), 50);
  };

  const locked = lockUntil !== null;

  return (
    <AppShell>
      <div className="container py-12 max-w-3xl">
        {mode === "input" && (
          <>
            <div className="text-center mb-8">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/30 text-primary text-xs ticker-mono mb-4">
                <Sparkles className="h-3 w-3" /> v3.migration.live
              </div>
              <h1 className="text-5xl font-bold tracking-tight mb-3">
                Enter <span className="text-primary">Migration Code</span>
              </h1>
              <p className="text-muted-foreground">
                Drop your code below. Hidden gems unlock trivia, crosswords, or IRL challenges.
              </p>
            </div>

            <GemsTracker filled={gems} />

            {clueUnlocked && !superCodeFound && (
              <button
                onClick={() => setShowClueModal(true)}
                className="w-full mb-4 px-4 py-2 rounded-lg border border-primary/40 bg-primary/10 text-primary text-sm ticker-mono hover:bg-primary/20"
              >
                ⬡ Master Branch clue unlocked — review
              </button>
            )}

            <div className="rounded-2xl border border-border bg-card p-6 shadow-[var(--shadow-card)] relative overflow-hidden">
              {locked && <div className="absolute inset-0 animate-shimmer pointer-events-none" />}
              <div className="flex gap-3">
                <input
                  ref={inputRef}
                  autoFocus
                  disabled={locked}
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  onKeyDown={(e) => e.key === "Enter" && submit()}
                  placeholder={locked ? "LOCKED" : "V3-READY"}
                  className="flex-1 bg-background/50 border border-border rounded-xl px-5 py-5 text-2xl ticker-mono tracking-wider focus:outline-none focus:border-primary disabled:opacity-40"
                />
                <button
                  disabled={locked || !code}
                  onClick={submit}
                  className="px-8 rounded-xl bg-primary text-primary-foreground font-bold hover:brightness-110 disabled:opacity-30 transition"
                >
                  Submit
                </button>
              </div>

              <div className="mt-4 flex items-center justify-between text-sm">
                <div className="text-muted-foreground">
                  {!locked && fails > 0 && (
                    <span className="text-destructive">
                      ✕ Invalid code · {3 - fails} {3 - fails === 1 ? "try" : "tries"} left
                    </span>
                  )}
                  {locked && (
                    <span className="flex items-center gap-2 text-destructive font-semibold ticker-mono">
                      <Lock className="h-4 w-4" /> LOCKED: {lockRemain}s
                    </span>
                  )}
                  {!fails && !locked && <span className="opacity-60">Try: V3-READY · REACTIVE · SETUP · CHALLENGE</span>}
                </div>
                {multiplier > 1 && (
                  <span className="ticker-mono text-primary font-bold">⚡ {multiplier}x ACTIVE</span>
                )}
              </div>
            </div>

            {flash && (
              <div className="mt-6 text-center animate-rank-up">
                <div className="text-5xl font-bold text-primary ticker-mono">+{flash.pts}</div>
                <div className="text-sm text-muted-foreground mt-1">
                  Base {flash.pts / flash.mult} {flash.mult > 1 && `× ${flash.mult}x Multiplier`}
                </div>
              </div>
            )}
          </>
        )}

        {mode === "trivia" && (
          <Trivia
            question="Which Vue 3 feature lets you render content into a different DOM node?"
            answers={["Suspense", "Teleport", "Fragments", "Composition API"]}
            correctIdx={1}
            onResolve={back}
          />
        )}
        {mode === "crossword" && <Crossword onSolve={back} />}
        {mode === "challenge" && <Challenge onResolve={back} />}
      </div>

      {/* Clue Reveal Modal */}
      {showClueModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/85 backdrop-blur-sm p-6 animate-fade-in">
          <div className="relative max-w-xl w-full rounded-2xl border-2 border-primary bg-card p-8 shadow-[0_0_60px_hsl(var(--primary)/0.5)]">
            <button
              onClick={() => setShowClueModal(false)}
              className="absolute top-3 right-3 p-1 text-muted-foreground hover:text-foreground"
            >
              <X className="h-5 w-5" />
            </button>
            <div className="ticker-mono text-xs text-primary mb-2">// MAJOR_UPGRADE.exe</div>
            <h2 className="text-3xl font-bold mb-1">LEGACY MIGRATION COMPLETE</h2>
            <p className="text-muted-foreground text-sm mb-6">
              All 5 Vue 3 Gems collected. The Master Branch awaits.
            </p>
            <div className="rounded-xl border border-primary/40 bg-primary/5 p-5">
              <div className="text-xs uppercase tracking-widest text-primary mb-2">
                ⬡ Cryptic clue
              </div>
              <p className="text-lg leading-relaxed">{SUPER_CLUE}</p>
            </div>
            <p className="text-xs text-muted-foreground mt-4 ticker-mono">
              Find the Master Code in the wild. Submit it on this page to merge the branch.
            </p>
          </div>
        </div>
      )}

      {/* Super Code Win */}
      {showSuperWin && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-6 animate-fade-in"
          style={{
            background:
              "radial-gradient(circle at center, hsl(var(--primary)/0.4), hsl(var(--background)/0.95))",
          }}
        >
          <div className="text-center max-w-2xl">
            <GitMerge className="h-20 w-20 mx-auto text-primary mb-4 animate-pulse" />
            <div className="ticker-mono text-xs text-primary mb-2">git merge --master</div>
            <h1 className="text-6xl font-black mb-4 bg-gradient-to-r from-primary via-yellow-300 to-primary bg-clip-text text-transparent">
              MASTER BRANCH MERGED
            </h1>
            <div className="text-7xl font-bold text-primary ticker-mono mb-6">+1,000</div>
            <p className="text-xl text-muted-foreground mb-8">
              You found the Super Code. The Great Migration is complete.
            </p>
            <button
              onClick={() => setShowSuperWin(false)}
              className="px-8 py-3 rounded-xl bg-primary text-primary-foreground font-bold hover:brightness-110"
            >
              Continue
            </button>
          </div>
        </div>
      )}
    </AppShell>
  );
}
