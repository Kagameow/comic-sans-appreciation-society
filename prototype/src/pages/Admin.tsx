import { useState } from "react";
import AppShell from "@/components/AppShell";
import { useApp } from "@/lib/appState";
import { MOCK_PLAYERS } from "@/lib/mockData";
import { Search, Zap, StopCircle, Crown, Diamond } from "lucide-react";

const INITIAL_CODES = [
  { code: "V3-READY", type: "Point", value: "50", status: "Used" },
  { code: "COMPOSITION", type: "Point", value: "75", status: "Unused" },
  { code: "TELEPORT", type: "Point", value: "25", status: "Used" },
  { code: "REACTIVE", type: "Trivia", value: "100→10", status: "Unused" },
  { code: "SETUP", type: "Crossword", value: "75", status: "Unused" },
  { code: "CHALLENGE", type: "Challenge", value: "150", status: "Unused" },
  { code: "PINIA", type: "Point", value: "100", status: "Used" },
  { code: "MASTER-BRANCH", type: "Super Code", value: "1000", status: "Unused" },
];

type Row = { id: string; name: string; avatar: string; points: number; victories: number };

export default function Admin() {
  const { multiplier, multiplierEndsAt, activateMultiplier, stopMultiplier } = useApp();
  const [search, setSearch] = useState("");
  const [players, setPlayers] = useState<Row[]>(
    MOCK_PLAYERS.map((p, i) => ({ ...p, victories: Math.min(5, Math.max(0, 5 - Math.floor(i / 4))) }))
  );
  const [codes, setCodes] = useState(INITIAL_CODES);
  const [superCode, setSuperCode] = useState("MASTER-BRANCH");

  const adjust = (id: string, delta: number) =>
    setPlayers((p) => p.map((pl) => (pl.id === id ? { ...pl, points: pl.points + delta } : pl)));

  const filtered = players.filter((p) => p.name.toLowerCase().includes(search.toLowerCase()));
  const minutesLeft = multiplierEndsAt ? Math.max(0, Math.ceil((multiplierEndsAt - Date.now()) / 60000)) : 0;

  return (
    <AppShell>
      <div className="container py-8 space-y-6">
        <div>
          <div className="text-xs uppercase tracking-widest text-primary mb-1">Architect View</div>
          <h1 className="text-4xl font-bold">Admin Dashboard</h1>
        </div>

        {/* Multiplier */}
        <section className="rounded-2xl border border-border bg-card p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <Zap className="h-5 w-5 text-primary" /> Chaos Button
              </h2>
              <p className="text-sm text-muted-foreground">
                Current Multiplier: <span className="ticker-mono text-primary font-bold">{multiplier}x</span>
              </p>
            </div>
            {multiplier > 1 && (
              <button
                onClick={stopMultiplier}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-destructive/15 border border-destructive/40 text-destructive hover:bg-destructive/25"
              >
                <StopCircle className="h-4 w-4" /> Stop ({minutesLeft}m left)
              </button>
            )}
          </div>
          <div className="grid grid-cols-3 gap-3">
            {[
              { n: 1.5, label: "Set 1.5x", min: 10 },
              { n: 2, label: "Set 2x", min: 15 },
              { n: 3, label: "Set 3x · Composition Boost", min: 5 },
            ].map((b) => (
              <button
                key={b.n}
                onClick={() => activateMultiplier(b.n, b.min)}
                className="px-4 py-4 rounded-xl border border-border bg-muted/30 hover:border-primary hover:bg-primary/10 transition text-left"
              >
                <div className="ticker-mono text-2xl font-bold text-primary">{b.n}x</div>
                <div className="text-xs text-muted-foreground mt-1">{b.label} · {b.min}min</div>
              </button>
            ))}
          </div>
        </section>

        {/* Players */}
        <section className="rounded-2xl border border-border bg-card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Player Management</h2>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search players..."
                className="pl-9 pr-3 py-2 rounded-lg bg-background border border-border focus:border-primary focus:outline-none text-sm w-64"
              />
            </div>
          </div>
          <div className="overflow-hidden rounded-lg border border-border">
            <table className="w-full text-sm">
              <thead className="bg-muted/40 text-muted-foreground text-xs uppercase">
                <tr>
                  <th className="text-left px-4 py-2">Player</th>
                  <th className="text-center px-4 py-2">Victories</th>
                  <th className="text-right px-4 py-2">Points</th>
                  <th className="text-right px-4 py-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.slice(0, 10).map((p) => (
                  <tr key={p.id} className="border-t border-border">
                    <td className="px-4 py-2 flex items-center gap-2">
                      <span className="text-lg">{p.avatar}</span> {p.name}
                    </td>
                    <td className="px-4 py-2">
                      <div className="flex items-center justify-center gap-1">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Diamond
                            key={i}
                            className={`h-3.5 w-3.5 ${
                              i < p.victories
                                ? "text-primary fill-primary/40"
                                : "text-muted-foreground/30"
                            }`}
                            strokeWidth={1.5}
                          />
                        ))}
                        <span className="ml-1 text-xs ticker-mono text-muted-foreground">
                          {p.victories}/5
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-2 text-right ticker-mono font-semibold text-primary">
                      {p.points.toLocaleString()}
                    </td>
                    <td className="px-4 py-2 text-right space-x-1">
                      <button onClick={() => adjust(p.id, 10)} className="px-2 py-1 rounded bg-primary/15 text-primary text-xs ticker-mono hover:bg-primary/25">+10</button>
                      <button onClick={() => adjust(p.id, -10)} className="px-2 py-1 rounded bg-destructive/15 text-destructive text-xs ticker-mono hover:bg-destructive/25">-10</button>
                      <button className="px-2 py-1 rounded bg-muted text-xs hover:bg-muted/70">Edit</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Codes */}
        <section className="rounded-2xl border border-border bg-card p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl font-semibold">Code Registry</h2>
              <p className="text-xs text-muted-foreground mt-1">
                Active Super Code: <span className="ticker-mono text-primary">{superCode}</span>
              </p>
            </div>
            <button className="px-4 py-2 rounded-lg bg-primary text-primary-foreground font-semibold text-sm hover:brightness-110">
              Generate Batch
            </button>
          </div>
          <div className="overflow-hidden rounded-lg border border-border">
            <table className="w-full text-sm">
              <thead className="bg-muted/40 text-muted-foreground text-xs uppercase">
                <tr>
                  <th className="text-left px-4 py-2">Code</th>
                  <th className="text-left px-4 py-2">Type</th>
                  <th className="text-left px-4 py-2">Value</th>
                  <th className="text-left px-4 py-2">Status</th>
                  <th className="text-center px-4 py-2">Super</th>
                </tr>
              </thead>
              <tbody>
                {codes.map((c) => {
                  const isSuper = c.code === superCode;
                  return (
                    <tr
                      key={c.code}
                      className={`border-t border-border ${isSuper ? "bg-primary/5" : ""}`}
                    >
                      <td className="px-4 py-2 ticker-mono flex items-center gap-2">
                        {isSuper && <Crown className="h-3.5 w-3.5 text-primary" />}
                        {c.code}
                      </td>
                      <td className="px-4 py-2">
                        <span className={c.type === "Super Code" ? "text-primary font-semibold" : ""}>
                          {c.type}
                        </span>
                      </td>
                      <td className="px-4 py-2 ticker-mono">{c.value}</td>
                      <td className="px-4 py-2">
                        <span className={`px-2 py-0.5 rounded text-xs ${c.status === "Used" ? "bg-muted text-muted-foreground" : "bg-primary/15 text-primary"}`}>
                          {c.status}
                        </span>
                      </td>
                      <td className="px-4 py-2 text-center">
                        <button
                          onClick={() => setSuperCode(c.code)}
                          role="switch"
                          aria-checked={isSuper}
                          className={`relative inline-flex h-5 w-9 items-center rounded-full transition ${
                            isSuper ? "bg-primary" : "bg-muted"
                          }`}
                        >
                          <span
                            className={`inline-block h-4 w-4 transform rounded-full bg-background transition ${
                              isSuper ? "translate-x-4" : "translate-x-0.5"
                            }`}
                          />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </AppShell>
  );
}
