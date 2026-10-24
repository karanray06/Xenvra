"use client";

import { useEffect, useState, createContext, useContext } from "react";
import { usePathname, useSearchParams } from "next/navigation";

interface NavigationContextType {
  isNavigating: boolean;
  startNavigation: () => void;
}

const NavigationContext = createContext<NavigationContextType>({
  isNavigating: false,
  startNavigation: () => {},
});

export const useNavigation = () => useContext(NavigationContext);

export function NavigationProgressBar() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [progress, setProgress] = useState(0);
  const [visible, setVisible] = useState(false);

  // Complete and reset progress when route changes
  useEffect(() => {
    let t1: NodeJS.Timeout | undefined;
    let t2: NodeJS.Timeout | undefined;

    if (visible) {
      t1 = setTimeout(() => {
        setProgress(100);
        t2 = setTimeout(() => {
          setVisible(false);
          setProgress(0);
        }, 250);
      }, 10);
    }

    return () => {
      if (t1) clearTimeout(t1);
      if (t2) clearTimeout(t2);
    };
  }, [pathname, searchParams, visible]);

  // Global click interceptor for internal links
  useEffect(() => {
    function handleAnchorClick(e: MouseEvent) {
      const target = (e.target as HTMLElement).closest("a");
      if (!target || !target.href) return;
      if (target.target === "_blank") return;
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;

      const url = new URL(target.href, window.location.href);
      if (url.origin === window.location.origin) {
        if (url.pathname !== window.location.pathname || url.search !== window.location.search) {
          setVisible(true);
          setProgress(25);
          // Animate slowly towards 80% while waiting
          const t1 = setTimeout(() => setProgress((p) => Math.max(p, 50)), 150);
          const t2 = setTimeout(() => setProgress((p) => Math.max(p, 80)), 400);
          return () => {
            clearTimeout(t1);
            clearTimeout(t2);
          };
        }
      }
    }

    document.addEventListener("click", handleAnchorClick, { capture: true });
    return () => document.removeEventListener("click", handleAnchorClick, { capture: true });
  }, []);

  if (!visible) return null;

  return (
    <div
      role="progressbar"
      aria-label="Page navigation progress"
      aria-valuenow={progress}
      aria-valuemin={0}
      aria-valuemax={100}
      className="fixed top-0 left-0 right-0 z-[9999] h-[2.5px] bg-[#5A4032]/20 pointer-events-none"
    >
      <div
        className="h-full bg-gradient-to-r from-[#DCD3F2] to-[#E6EEF4] shadow-[0_0_8px_rgba(220,211,242,0.6)] transition-all duration-300 ease-out"
        style={{ width: `${progress}%` }}
      />
    </div>
  );
}
