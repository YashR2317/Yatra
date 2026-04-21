import { useEffect } from "react";
import { useLocation } from "react-router-dom";

/**
 * usePageTracking
 * ===============
 * Sends a page_view event to Google Analytics on every client-side route change.
 * This is necessary because GA's default snippet only fires on the initial page load,
 * but in a React SPA, subsequent navigations don't trigger a full page reload.
 *
 * Usage: Call this hook once in App.jsx or a layout component.
 */
export function usePageTracking() {
  const location = useLocation();

  useEffect(() => {
    // gtag is loaded globally from index.html
    if (typeof window.gtag !== "function") return;

    window.gtag("event", "page_view", {
      page_path: location.pathname + location.search,
      page_title: document.title,
      page_location: window.location.href,
    });
  }, [location]);
}
