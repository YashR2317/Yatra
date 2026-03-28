import React from "react";

export default function PrevSpotButton({ disabled, onBack }) {
  return (
    <div className="p-4 bg-[var(--color-cream)] border-t border-[var(--color-stone-border)]">
      <button
        onClick={onBack}
        disabled={disabled}
        className={`
          w-full py-3 rounded-xl font-medium font-body
          transition-all duration-300 ease-out
          flex items-center justify-center gap-2
          ${disabled
            ? "opacity-30 bg-gray-200 text-gray-400 cursor-not-allowed"
            : `bg-[var(--color-charcoal)] text-white
               hover:bg-[var(--color-deep-navy)]
               hover:-translate-y-0.5 hover:shadow-lg
               active:scale-[0.98]`}
        `}
        style={{ letterSpacing: "0.03em" }}
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M19 12H5M12 19l-7-7 7-7" />
        </svg>
        Previous Spot
      </button>
    </div>
  );
}
