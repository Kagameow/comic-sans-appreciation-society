import { Link, useLocation } from "react-router-dom";
import { useApp } from "@/lib/appState";
import { CURRENT_USER } from "@/lib/mockData";
import { useEffect, useState } from "react";
import { Trophy, Terminal, Shield, Zap } from "lucide-react";

const navItems = [
  { to: "/", label: "Code Check", icon: Terminal },
  { to: "/leaderboard", label: "Leaderboard", icon: Trophy },
  { to: "/admin", label: "Admin", icon: Shield },
];

export default function AppShell({ children }: { children: React.ReactNode }) {
  const { multiplier, multiplierEndsAt, userPoints } = useApp();
  const loc = useLocation();
  const [remaining, setRemaining] = useState("");

  useEffect(() => {
    if (!multiplierEndsAt) return;
    const t = setInterval(() => {
      const ms = Math.max(0, multiplierEndsAt - Date.now());
      const m = Math.floor(ms / 60000);
      const s = Math.floor((ms % 60000) / 1000);
      setRemaining(`${m}:${s.toString().padStart(2, "0")}`);
    }, 500);
    return () => clearInterval(t);
  }, [multiplierEndsAt]);

  const active = multiplier > 1;

  return (
    <div className={`min-h-screen ${active ? "multiplier-glow" : ""}`}>
      <header className="border-b border-border/60 bg-card/50 backdrop-blur sticky top-0 z-40">
        <div className="container flex h-16 items-center justify-between gap-6">
          <Link to="/" className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-md gradient-hero flex items-center justify-center font-bold text-primary-foreground">
              V3
            </div>
            <span className="font-semibold tracking-tight">The Great Migration</span>
          </Link>

          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((n) => {
              const Icon = n.icon;
              const isActive = loc.pathname === n.to;
              return (
                <Link
                  key={n.to}
                  to={n.to}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm transition-colors ${
                    isActive ? "bg-primary/15 text-primary" : "text-muted-foreground hover:text-foreground hover:bg-muted"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {n.label}
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-3">
            {active && (
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-primary/20 border border-primary/40 text-primary text-xs font-bold ticker-mono">
                <Zap className="h-3.5 w-3.5" /> {multiplier}x · {remaining}
              </div>
            )}
            <div className="flex items-center gap-2 pl-3 border-l border-border">
              <span className="ticker-mono text-sm font-semibold text-primary">
                {userPoints.toLocaleString()} pts
              </span>
              <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center text-lg">
                {CURRENT_USER.avatar}
              </div>
            </div>
          </div>
        </div>
      </header>

      <main>{children}</main>
    </div>
  );
}
