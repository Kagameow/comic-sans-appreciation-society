import { createContext, useContext, useState, ReactNode, useCallback } from "react";

export const TOTAL_GEMS = 5;
export const SUPER_CODE = "MASTER-BRANCH";
export const SUPER_CLUE =
  "Where the build artifacts rest and the green checkmark hums — seek the kiosk that never sleeps.";

type SuperEvent = { player: string; at: number } | null;

type AppCtx = {
  multiplier: number;
  setMultiplier: (n: number) => void;
  multiplierEndsAt: number | null;
  activateMultiplier: (n: number, minutes: number) => void;
  stopMultiplier: () => void;
  userPoints: number;
  addPoints: (n: number) => void;
  gems: number;
  addGem: () => void;
  clueUnlocked: boolean;
  superCodeFound: SuperEvent;
  claimSuperCode: (player: string) => void;
  dismissSuperEvent: () => void;
};

const Ctx = createContext<AppCtx | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [multiplier, setMultiplier] = useState(1);
  const [multiplierEndsAt, setEndsAt] = useState<number | null>(null);
  const [userPoints, setUserPoints] = useState(2840);
  const [gems, setGems] = useState(3);
  const [clueUnlocked, setClueUnlocked] = useState(false);
  const [superCodeFound, setSuperCodeFound] = useState<SuperEvent>(null);

  const activateMultiplier = (n: number, minutes: number) => {
    setMultiplier(n);
    setEndsAt(Date.now() + minutes * 60_000);
  };
  const stopMultiplier = () => {
    setMultiplier(1);
    setEndsAt(null);
  };
  const addPoints = (n: number) => setUserPoints((p) => p + n);
  const addGem = useCallback(() => {
    setGems((g) => {
      const next = Math.min(TOTAL_GEMS, g + 1);
      if (next === TOTAL_GEMS) setClueUnlocked(true);
      return next;
    });
  }, []);
  const claimSuperCode = (player: string) => setSuperCodeFound({ player, at: Date.now() });
  const dismissSuperEvent = () => setSuperCodeFound(null);

  return (
    <Ctx.Provider
      value={{
        multiplier, setMultiplier, multiplierEndsAt, activateMultiplier, stopMultiplier,
        userPoints, addPoints,
        gems, addGem, clueUnlocked, superCodeFound, claimSuperCode, dismissSuperEvent,
      }}
    >
      {children}
    </Ctx.Provider>
  );
}

export const useApp = () => {
  const c = useContext(Ctx);
  if (!c) throw new Error("useApp outside provider");
  return c;
};
