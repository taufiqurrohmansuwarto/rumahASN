// hooks/useScrollRestoration.js
import { useEffect } from "react";
import { useRouter } from "next/router";

/**
 * Custom hook untuk mengelola scroll restoration
 * Menyimpan posisi scroll sebelum navigasi dan mengembalikannya setelah navigasi selesai
 *
 * @param {string} storageKey - Key untuk menyimpan posisi scroll di sessionStorage
 * @param {boolean} enabled - Apakah scroll restoration diaktifkan
 */
const useScrollRestoration = (
  storageKey = "scrollPosition",
  enabled = true
) => {
  const router = useRouter();

  const saveScrollPosition = () => {
    if (!enabled) return;

    try {
      const scrollY =
        window.scrollY ||
        window.pageYOffset ||
        document.documentElement.scrollTop;
      window.sessionStorage.setItem(storageKey, scrollY.toString());
    } catch (error) {
      console.warn("Failed to save scroll position:", error);
    }
  };

  const restoreScrollPosition = () => {
    if (!enabled) return;

    try {
      const savedScrollY = window.sessionStorage.getItem(storageKey);
      if (savedScrollY !== null) {
        const scrollY = parseInt(savedScrollY, 10);
        if (!isNaN(scrollY)) {
          // Gunakan requestAnimationFrame untuk memastikan DOM sudah ter-render
          requestAnimationFrame(() => {
            window.scrollTo({
              top: scrollY,
              behavior: "instant",
            });
          });
        }
      }
    } catch (error) {
      console.warn("Failed to restore scroll position:", error);
    }
  };

  const clearScrollPosition = () => {
    try {
      window.sessionStorage.removeItem(storageKey);
    } catch (error) {
      console.warn("Failed to clear scroll position:", error);
    }
  };

  useEffect(() => {
    if (!enabled || !router) return;

    // Event handlers
    const handleRouteChangeStart = () => saveScrollPosition();
    const handleRouteChangeComplete = () => restoreScrollPosition();

    // Daftarkan event listeners
    router.events.on("routeChangeStart", handleRouteChangeStart);
    router.events.on("routeChangeComplete", handleRouteChangeComplete);

    // Cleanup function
    return () => {
      router.events.off("routeChangeStart", handleRouteChangeStart);
      router.events.off("routeChangeComplete", handleRouteChangeComplete);
    };
  }, [router, storageKey, enabled]);

  // Return utility functions untuk manual control
  return {
    saveScrollPosition,
    restoreScrollPosition,
    clearScrollPosition,
  };
};

export default useScrollRestoration;
