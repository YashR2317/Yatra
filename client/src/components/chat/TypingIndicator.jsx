import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";

const THINKING_MESSAGES = [
  "Consulting the tirth sthals…",
  "Planning your sacred journey…",
  "Seeking divine guidance…",
  "Exploring Braj Dham…",
  "Gathering wisdom from the mandirs…",
];

export default function TypingIndicator() {
  const [msgIndex, setMsgIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setMsgIndex((prev) => (prev + 1) % THINKING_MESSAGES.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="flex items-start gap-3 px-4 sm:px-6 max-w-3xl mx-auto w-full"
    >
      {/* Avatar */}
      <div className="shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-orange-400 to-amber-500 flex items-center justify-center text-white text-xs font-bold shadow-md">
        ॐ
      </div>

      {/* Bubble */}
      <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm max-w-xs">
        {/* Dots */}
        <div className="flex items-center gap-1.5 mb-1.5">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="w-2 h-2 rounded-full bg-gradient-to-r from-amber-400 to-orange-500"
              animate={{
                scale: [1, 1.4, 1],
                opacity: [0.4, 1, 0.4],
              }}
              transition={{
                duration: 1.2,
                repeat: Infinity,
                delay: i * 0.2,
                ease: "easeInOut",
              }}
            />
          ))}
        </div>

        {/* Rotating message */}
        <motion.p
          key={msgIndex}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="text-[11px] text-[var(--color-text-secondary)] italic"
        >
          {THINKING_MESSAGES[msgIndex]}
        </motion.p>
      </div>
    </motion.div>
  );
}
