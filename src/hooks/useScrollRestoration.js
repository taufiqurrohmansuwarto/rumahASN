// hooks/useScrollRestoration.js
import { useEffect } from "react";
import { useRouter } from "next/router";

/**
 * Custom hook untuk mengelola scroll restoration
 * Menyimpan posisi scroll sebelum navigasi dan mengembalikannya setelah navigasi selesai
 *
 * @param {string} storageKey - Key untuk menyimpan posisi scroll di sessionStorage
 * @param {boolean} enabled - Apakah scroll restoration diaktifkan
 * @param {boolean} isLoading - Status loading content (untuk menunggu selesai)
 * @param {boolean} smoothRestore - Use smooth scroll behavior untuk prevent blinking
 */
const useScrollRestoration = (
  storageKey = "scrollPosition",
  enabled = true,
  isLoading = false,
  smoothRestore = true
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
          // Smooth scroll restoration to prevent blinking
          const attemptRestore = (attempts = 0) => {
            const maxAttempts = 15;
            const currentHeight = document.documentElement.scrollHeight;
            
            // Use smooth or instant behavior based on preference
            window.scrollTo({
              top: scrollY,
              behavior: smoothRestore ? "smooth" : "instant",
            });
            
            // Verifikasi apakah scroll berhasil
            setTimeout(() => {
              const actualScrollY = window.scrollY || window.pageYOffset || document.documentElement.scrollTop;
              const difference = Math.abs(actualScrollY - scrollY);
              
              // Jika masih belum tepat dan masih ada attempts, coba lagi
              if (difference > 50 && attempts < maxAttempts) {
                attemptRestore(attempts + 1);
              }
            }, 200); // Increase delay for smooth scroll
          };
          
          // Wait for content to load before restoring
          const delay = isLoading ? 500 : 300;
          setTimeout(() => {
            attemptRestore();
          }, delay);
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

    let restoreTimeout;

    // Event handlers
    const handleRouteChangeStart = () => saveScrollPosition();
    const handleRouteChangeComplete = () => {
      // Clear any existing timeout
      if (restoreTimeout) {
        clearTimeout(restoreTimeout);
      }
      
      // Delay restoration to allow for content loading
      restoreTimeout = setTimeout(() => {
        restoreScrollPosition();
      }, 100);
    };

    // Daftarkan event listeners
    router.events.on("routeChangeStart", handleRouteChangeStart);
    router.events.on("routeChangeComplete", handleRouteChangeComplete);

    // Cleanup function
    return () => {
      if (restoreTimeout) {
        clearTimeout(restoreTimeout);
      }
      router.events.off("routeChangeStart", handleRouteChangeStart);
      router.events.off("routeChangeComplete", handleRouteChangeComplete);
    };
  }, [router, storageKey, enabled]);

  // Additional effect untuk menunggu loading selesai
  useEffect(() => {
    if (!enabled || isLoading) return;
    
    // Ketika loading selesai, coba restore scroll jika ada
    const savedScrollY = window.sessionStorage.getItem(storageKey);
    if (savedScrollY !== null) {
      setTimeout(() => {
        restoreScrollPosition();
      }, 50);
    }
  }, [isLoading, enabled, storageKey]);

  // Return utility functions untuk manual control
  return {
    saveScrollPosition,
    restoreScrollPosition,
    clearScrollPosition,
  };
};

export default useScrollRestoration;
