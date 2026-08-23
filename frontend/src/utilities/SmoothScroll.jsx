import { useEffect } from "react";
import Lenis from "lenis";

export default function SmoothScroll() {
  useEffect(() => {
    const lenis = new Lenis({
      lerp: 0.07,
      wheelMultiplier: 0.7,
      smoothWheel: true,
      syncTouch: true,
    });

    window.__lenis = lenis;

    let animationFrame;

    const raf = (time) => {
      lenis.raf(time);
      animationFrame = requestAnimationFrame(raf);
    };

    animationFrame = requestAnimationFrame(raf);

    return () => {
      cancelAnimationFrame(animationFrame);

      lenis.destroy();

      delete window.__lenis;
    };
  }, []);

  return null;
}
