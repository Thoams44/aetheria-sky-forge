import { useEffect, useState } from "react";

/** Compte à rebours temps réel (mise à jour chaque seconde) vers une date ISO. */
export function useCountdown(target: string | null | undefined) {
  const compute = () =>
    target ? Math.max(0, new Date(target).getTime() - Date.now()) : 0;
  const [remaining, setRemaining] = useState(compute);

  useEffect(() => {
    setRemaining(compute());
    if (!target) return;
    const id = window.setInterval(() => setRemaining(compute()), 1000);
    return () => window.clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [target]);

  return { remaining, expired: remaining <= 0 };
}

export function formatRemaining(ms: number): string {
  const total = Math.max(0, Math.floor(ms / 1000));
  const hours = Math.floor(total / 3600);
  const minutes = Math.floor((total % 3600) / 60);
  const seconds = total % 60;
  if (hours > 0) return `${hours}h ${String(minutes).padStart(2, "0")}m`;
  if (minutes > 0) return `${minutes}m ${String(seconds).padStart(2, "0")}s`;
  return `${seconds}s`;
}

export function Countdown({ target }: { target: string | null | undefined }) {
  const { remaining, expired } = useCountdown(target);
  if (!target || expired) return <>Disponible maintenant</>;
  return <>{formatRemaining(remaining)}</>;
}
