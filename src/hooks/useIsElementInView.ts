import { useEffect, useState } from "react";

export const useIsElementInView = (el: HTMLElement | null) => {
  const [isInView, setIsInView] = useState(true);

  useEffect(() => {
    const scrollContainer = window.scrEl();
    const onScroll = (ev: Event) => {
      if (!el) return;

      const b = el.getBoundingClientRect();
      const isInViewport = !(
        b.bottom <= 0 || b.top > scrollContainer.clientHeight
      );
      setIsInView(isInViewport);
    };
    scrollContainer.addEventListener("scroll", onScroll);
    return () => {
      scrollContainer.removeEventListener("scroll", onScroll);
    };
  }, [el]);
  return isInView;
};
