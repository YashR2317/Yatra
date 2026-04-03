import React from "react";

/**
 * SkipToContent — Accessibility: skip-to-main-content link.
 * Visible only on keyboard focus (Tab).
 */
export default function SkipToContent() {
  return (
    <a
      href="#main-content"
      className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[99999]
                 focus:px-4 focus:py-2 focus:rounded-lg focus:text-sm focus:font-bold focus:tracking-wide
                 focus:bg-amber-500 focus:text-white focus:shadow-lg focus:outline-none"
      style={{ textDecoration: "none" }}
    >
      Skip to main content
    </a>
  );
}
