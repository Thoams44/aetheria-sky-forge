import { useCallback, useEffect, useRef, useState } from "react";
import { siteConfig } from "@/config/site";

/** Copie l'IP du serveur et expose un état "copié" temporaire. */
export function useCopyIp(ip: string = siteConfig.serverIp) {
  const [copied, setCopied] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => { if (timer.current) clearTimeout(timer.current); }, []);

  const copy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(ip);
    } catch {
      const el = document.createElement("textarea");
      el.value = ip;
      document.body.appendChild(el);
      el.select();
      document.execCommand("copy");
      el.remove();
    }
    setCopied(true);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setCopied(false), 2200);
  }, [ip]);

  return { copied, copy, ip };
}