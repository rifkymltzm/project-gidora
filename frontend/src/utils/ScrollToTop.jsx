import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export default function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    const lenis = window.__lenis;

    if (lenis) {
      lenis.scrollTo(0, {
        immediate: true,
      });

      return;
    }

    // Fallback jika Lenis belum tersedia
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: 'instant',
    });
  }, [pathname]);

  return null;
}
