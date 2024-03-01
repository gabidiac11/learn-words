import { useEffect, useState } from "react";

export const useIsElementFocused = (el: HTMLElement | null) => {
  const [isFocused, setIsFocused] = useState(false);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      setIsFocused(
        !!e.target &&
          (el === e.target ||
            (el?.contains(e.target as unknown as HTMLElement) ?? false))
      );
    };
    window.addEventListener("click", onClick);
    return () => {
      window.removeEventListener("click", onClick);
    };
  }, [el, setIsFocused]);
  return isFocused;
};
