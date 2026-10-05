import { useEffect } from 'react';
import Lenis from 'lenis';

export default function SmoothScroll() {
  useEffect(() => {
    const lenis = new Lenis({
      lerp: 0.08,
      wheelMultiplier: 0.7,
      smoothWheel: true,
      syncTouch: false,
    });

    window.__lenis = lenis;
    window.dispatchEvent(new Event('lenis-ready'));

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
