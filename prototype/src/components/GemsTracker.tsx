import { Diamond } from "lucide-react";
import { TOTAL_GEMS } from "@/lib/appState";

export default function GemsTracker({ filled }: { filled: number }) {
  return (
    <div className="rounded-2xl border border-border bg-card/60 p-5 mb-6">
      <div className="flex items-center justify-between mb-3">
        <div className="text-xs uppercase tracking-widest text-muted-foreground">Migration Progress</div>
        <div className="ticker-mono text-xs text-primary">
          {filled}/{TOTAL_GEMS} Vue 3 Gems
        </div>
      </div>
      <div className="flex items-center justify-between gap-2">
        {Array.from({ length: TOTAL_GEMS }).map((_, i) => {
          const on = i < filled;
          return (
            <div key={i} className="flex-1 flex items-center justify-center">
              <Diamond
                className={`h-10 w-10 transition-all ${
                  on
                    ? "text-primary fill-primary/40 drop-shadow-[0_0_12px_hsl(var(--primary)/0.8)] animate-pulse"
                    : "text-muted-foreground/30"
                }`}
                strokeWidth={1.5}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}
