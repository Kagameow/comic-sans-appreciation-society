import { useState } from "react";

const TARGETS = ["Marieke de Vries", "Joris van Dijk", "Sanne Bakker", "Bram Janssen"];
const ACTIVITIES = ["Darts", "Foosball", "Pool", "a Pull-Up Contest", "Rock Paper Scissors"];

export default function Challenge({ onResolve }: { onResolve: (points: number) => void }) {
  const [target] = useState(() => TARGETS[Math.floor(Math.random() * TARGETS.length)]);
  const [activity] = useState(() => ACTIVITIES[Math.floor(Math.random() * ACTIVITIES.length)]);
  const [code, setCode] = useState("");

  return (
    <div className="rounded-2xl border border-primary/30 bg-card p-8 shadow-[var(--shadow-card)] glow-green">
      <div className="text-xs uppercase tracking-widest text-primary mb-3">⚔ IRL Challenge</div>
      <h2 className="text-3xl font-bold leading-tight mb-2">
        Find <span className="text-primary">{target}</span>
      </h2>
      <p className="text-xl text-muted-foreground mb-8">…and beat them at {activity}!</p>

      <label className="text-xs uppercase tracking-wider text-muted-foreground">Referee Confirmation Code</label>
      <div className="flex gap-2 mt-2">
        <input
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
          placeholder="ADMIN-XXXX"
          className="flex-1 px-4 py-3 rounded-lg bg-background border border-border focus:border-primary focus:outline-none ticker-mono"
        />
        <button
          disabled={code.length < 4}
          onClick={() => onResolve(150)}
          className="px-6 py-3 rounded-lg bg-primary text-primary-foreground font-semibold disabled:opacity-30 hover:brightness-110"
        >
          Confirm Win
        </button>
      </div>
    </div>
  );
}
