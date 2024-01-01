// hooks/useScrollRestoration.js
import { useEffect } from "react";
import { useRouter } from "next/router";

const useScrollRestoration = () => {
  const router = useRouter();

  useEffect(() => {
    const handleRouteChangeStart = () => {
      sessionStorage.setItem("scrollPos", window.scrollY.toString());
    };

    const handleRouteChangeComplete = () => {
      const savedScrollPos = sessionStorage.getItem("scrollPos");
      if (savedScrollPos) {
        window.scrollTo(0, parseInt(savedScrollPos, 10));
        sessionStorage.removeItem("scrollPos");
      }
    };

    router.events.on("routeChangeStart", handleRouteChangeStart);
    router.events.on("routeChangeComplete", handleRouteChangeComplete);

    return () => {
      router.events.off("routeChangeStart", handleRouteChangeStart);
      router.events.off("routeChangeComplete", handleRouteChangeComplete);
    };
  }, [router.events]);
};

export default useScrollRestoration;
