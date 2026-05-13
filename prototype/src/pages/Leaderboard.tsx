import { useEffect, useState } from "react";
import confetti from "canvas-confetti";
import { MOCK_PLAYERS, CURRENT_USER } from "@/lib/mockData";
import AppShell from "@/components/AppShell";
import { useApp } from "@/lib/appState";
import { GitMerge } from "lucide-react";

const medals = ["🥇", "🥈", "🥉"];

export default function Leaderboard() {
  const { superCodeFound, dismissSuperEvent } = useApp();
  const [players, setPlayers] = useState(MOCK_PLAYERS);
  const [bumpedId, setBumped] = useState<string | null>(null);

  useEffect(() => {
    if (!superCodeFound) return;
    const burst = () =>
      confetti({
        particleCount: 220,
        spread: 140,
        origin: { y: 0.3 },
        colors: ["#42b883", "#FFD700", "#FEFA7C", "#ffffff"],
      });
    burst();
    const i = setInterval(burst, 600);
    return () => clearInterval(i);
  }, [superCodeFound]);

  // Simulate rank jump
  useEffect(() => {
    const t = setInterval(() => {
      setPlayers((prev) => {
        const i = Math.floor(Math.random() * (prev.length - 1)) + 1;
        const copy = [...prev];
        const swap = copy[i].points + Math.floor(Math.random() * 200) + 50;
        copy[i] = { ...copy[i], points: swap, latest: "Just scored!" };
        copy.sort((a, b) => b.points - a.points);
        setBumped(copy[Math.max(0, i - 1)].id);
        return copy;
      });
    }, 4500);
    return () => clearInterval(t);
  }, []);

  return (
    <AppShell>
      <div className="container py-8">
        <div className="flex items-baseline justify-between mb-6">
          <div>
            <h1 className="text-4xl font-bold tracking-tight">Leaderboard</h1>
            <p className="text-muted-foreground">Live rankings · TV Mode</p>
          </div>
          <div className="ticker-mono text-sm text-primary animate-pulse">● LIVE</div>
        </div>

        <div className="space-y-2">
          {players.map((p, idx) => {
            const top = idx < 3;
            const isMe = p.name === CURRENT_USER.name;
            return (
              <div
                key={p.id}
                className={`relative flex items-center gap-4 rounded-xl border transition-all ${
                  top
                    ? "py-5 px-6 bg-card border-primary/30"
                    : "py-3 px-4 bg-card/50 border-border/50"
                } ${isMe ? "ring-1 ring-primary/60" : ""} ${bumpedId === p.id ? "animate-rank-up" : ""}`}
              >
                <div
                  className={`ticker-mono font-bold ${
                    top ? "text-3xl w-12" : "text-lg w-10 text-muted-foreground"
                  }`}
                >
                  {top ? medals[idx] : `#${idx + 1}`}
                </div>
                <div
                  className={`rounded-full bg-muted flex items-center justify-center ${
                    top ? "h-14 w-14 text-3xl" : "h-10 w-10 text-xl"
                  }`}
                >
                  {p.avatar}
                </div>
                <div className="flex-1 min-w-0">
                  <div className={`font-semibold truncate ${top ? "text-xl" : "text-base"}`}>
                    {p.name}{" "}
                    {isMe && <span className="text-xs text-primary font-normal">(you)</span>}
                  </div>
                  <div className="text-xs text-muted-foreground truncate">{p.latest}</div>
                </div>
                <div
                  className={`ticker-mono font-bold text-primary ${top ? "text-3xl" : "text-xl"}`}
                >
                  {p.points.toLocaleString()}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {superCodeFound && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-8 animate-fade-in"
          style={{
            background:
              "radial-gradient(circle at center, hsl(var(--primary)/0.55), hsl(var(--background)/0.95))",
          }}
          onClick={dismissSuperEvent}
        >
          <div className="text-center max-w-4xl">
            <GitMerge className="h-24 w-24 mx-auto text-primary mb-6 animate-pulse drop-shadow-[0_0_30px_hsl(var(--primary))]" />
            <div className="ticker-mono text-sm text-primary mb-4">
              ▲ INCOMING TRANSMISSION ▲
            </div>
            <h1 className="text-7xl font-black mb-6 leading-tight bg-gradient-to-r from-primary via-yellow-300 to-primary bg-clip-text text-transparent">
              THE MASTER BRANCH<br />HAS BEEN MERGED!
            </h1>
            <p className="text-3xl text-foreground mb-2">
              <span className="font-bold text-primary">{superCodeFound.player}</span>
            </p>
            <p className="text-2xl text-muted-foreground">found the Super Code.</p>
            <p className="text-xs text-muted-foreground mt-8 ticker-mono opacity-60">
              click anywhere to dismiss
            </p>
          </div>
        </div>
      )}
    </AppShell>
  );
}

