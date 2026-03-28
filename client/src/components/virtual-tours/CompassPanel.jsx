import React from "react";

export default function CompassPanel({ available = [], onChange }) {
  const disabled = (d) => !available.includes(d);

  const btn = (dir, label, arrowPath) => (
    <button
      onClick={() => onChange(dir)}
      disabled={disabled(dir)}
      className={`
        w-12 h-12 rounded-xl flex items-center justify-center
        text-sm font-semibold tracking-wide font-body
        transition-all duration-300 ease-out
        border
        ${disabled(dir)
          ? "opacity-25 bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed"
          : `bg-white border-[var(--color-stone-border)]
             text-[var(--color-charcoal)]
             hover:bg-[var(--color-amber)] hover:text-white hover:border-[var(--color-amber)]
             hover:shadow-lg hover:-translate-y-0.5
             active:scale-95`}
      `}
    >
      {label}
    </button>
  );

  return (
    <div className="w-full h-full flex flex-col items-center justify-center bg-[var(--color-cream)]">
      {/* Section label */}
      <p
        className="text-xs font-semibold uppercase tracking-[0.15em] text-[var(--color-text-muted)] mb-4 font-body"
      >
        Navigate
      </p>

      {/* Compass container */}
      <div
        className="rounded-full p-8 flex flex-col items-center gap-4 bg-white/80"
        style={{
          boxShadow: "0 4px 32px rgba(0,0,0,0.06), inset 0 0 0 1px rgba(0,0,0,0.04)",
          border: "2px solid var(--color-stone-border)",
        }}
      >
        {btn("north", "N")}
        <div className="flex items-center gap-6">
          {btn("west", "W")}
          <img
            src="/tours/mariam-tomb/compass.png"
            className="w-20 opacity-70 drop-shadow-md"
            style={{ filter: "saturate(0.8)" }}
            alt="Compass"
          />
          {btn("east", "E")}
        </div>
        {btn("south", "S")}
      </div>
    </div>
  );
}
