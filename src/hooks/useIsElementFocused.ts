import { useEffect, useState } from "react";

export const useIsElementFocused = (el: HTMLElement | HTMLElement[] | null) => {
  const [isFocused, setIsFocused] = useState(false);
  const [clickOutOccurence, setClickOutside] = useState<number>();

  useEffect(() => {
    const els: HTMLElement[] = [];
    if (Array.isArray(el)) {
      el.forEach((n) => n && els.push(n));
    } else if (el) {
      els.push(el);
    }
    const onClick = (e: MouseEvent) => {
      const isFocusedAux =
        !!e.target &&
        (els.some((n) => n === e.target) ||
          els.some(
            (n) =>
              n.contains(e.target as unknown as HTMLElement) ??
              false ??
              n.contains((e.target as unknown as HTMLElement)?.parentNode) ??
              false
          ));
      setIsFocused(isFocusedAux);
      setClickOutside(!isFocusedAux ? Date.now() : undefined);
    };
    window.addEventListener("click", onClick);
    return () => {
      window.removeEventListener("click", onClick);
    };
  }, [el, setIsFocused]);
  return { isFocused, clickOutOccurence };
};
