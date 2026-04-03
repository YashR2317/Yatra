import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

/**
 * ShareButton — Reusable social share component.
 * Uses Web Share API on supported devices, falls back to custom share sheet.
 *
 * @param {string} title — Title to share
 * @param {string} text — Description text
 * @param {string} url — URL to share (defaults to current page)
 * @param {string} size — "sm" | "md" | "lg"
 */
export default function ShareButton({ title, text, url, size = "md" }) {
  const [showSheet, setShowSheet] = useState(false);
  const [copied, setCopied] = useState(false);
  const sheetRef = useRef(null);
  const shareUrl = url || window.location.href;

  // Close on outside click
  useEffect(() => {
    const handler = (e) => {
      if (sheetRef.current && !sheetRef.current.contains(e.target)) {
        setShowSheet(false);
      }
    };
    if (showSheet) document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [showSheet]);

  const handleShare = async () => {
    // Try native Web Share API first
    if (navigator.share) {
      try {
        await navigator.share({ title, text, url: shareUrl });
        return;
      } catch (e) {
        if (e.name === "AbortError") return;
      }
    }
    // Fallback: show custom sheet
    setShowSheet(true);
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for older browsers
      const ta = document.createElement("textarea");
      ta.value = shareUrl;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const shareLinks = [
    {
      name: "WhatsApp",
      icon: "💬",
      url: `https://wa.me/?text=${encodeURIComponent(`${title}\n${shareUrl}`)}`,
      color: "#25D366",
    },
    {
      name: "Twitter / X",
      icon: "🐦",
      url: `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(shareUrl)}`,
      color: "#1DA1F2",
    },
    {
      name: "Facebook",
      icon: "📘",
      url: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`,
      color: "#1877F2",
    },
    {
      name: "Email",
      icon: "✉️",
      url: `mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(`${text}\n\n${shareUrl}`)}`,
      color: "#EA4335",
    },
  ];

  const sizeClasses = {
    sm: "w-7 h-7 text-xs",
    md: "w-9 h-9 text-sm",
    lg: "w-11 h-11 text-base",
  };

  return (
    <div className="relative inline-flex">
      <button
        onClick={handleShare}
        title="Share"
        aria-label="Share this"
        className={`${sizeClasses[size]} rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110`}
        style={{
          backgroundColor: "var(--color-surface-alt)",
          color: "var(--color-text-secondary)",
          border: "1px solid var(--color-border)",
        }}
      >
        <svg width={size === "sm" ? 14 : size === "lg" ? 20 : 16} height={size === "sm" ? 14 : size === "lg" ? 20 : 16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" />
          <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" /><line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
        </svg>
      </button>

      {/* Share Sheet Dropdown */}
      <AnimatePresence>
        {showSheet && (
          <motion.div
            ref={sheetRef}
            initial={{ opacity: 0, y: -5, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -5, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 top-full mt-2 w-56 rounded-xl shadow-2xl overflow-hidden z-50"
            style={{
              backgroundColor: "var(--color-surface)",
              border: "1px solid var(--color-border)",
              boxShadow: "0 20px 40px rgba(0,0,0,0.3)",
            }}
          >
            <div className="px-4 py-3 border-b" style={{ borderColor: "var(--color-border)" }}>
              <p className="text-xs font-bold tracking-widest uppercase" style={{ color: "var(--color-text-secondary)" }}>
                Share via
              </p>
            </div>

            {shareLinks.map((link) => (
              <a
                key={link.name}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 px-4 py-2.5 transition-colors hover:bg-[var(--color-surface-alt)]"
                onClick={() => setShowSheet(false)}
              >
                <span className="text-base">{link.icon}</span>
                <span className="text-sm" style={{ color: "var(--color-text-primary)" }}>{link.name}</span>
              </a>
            ))}

            {/* Copy link */}
            <button
              onClick={handleCopy}
              className="w-full flex items-center gap-3 px-4 py-2.5 border-t transition-colors hover:bg-[var(--color-surface-alt)]"
              style={{ borderColor: "var(--color-border)" }}
            >
              <span className="text-base">{copied ? "✅" : "🔗"}</span>
              <span className="text-sm" style={{ color: "var(--color-text-primary)" }}>
                {copied ? "Link copied!" : "Copy link"}
              </span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
