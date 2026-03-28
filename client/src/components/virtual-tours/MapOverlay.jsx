import React from "react";

const ROTATION = {
  north: 90,
  east: 180,
  south: 270,
  west: 0
};

export default function MapOverlay({
  mapImage,
  x,
  y,
  direction = "north",
  angleOffset = 0
}) {
  if (!mapImage || typeof x !== "number" || typeof y !== "number") {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center text-[var(--color-text-light)] gap-2">
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="opacity-50">
          <path d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l5.447 2.724A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
        </svg>
        <span className="text-sm font-body">Map not available</span>
      </div>
    );
  }

  const rotation = (ROTATION[direction] || 0) + angleOffset;

  return (
    <div
      className="w-full h-full relative overflow-hidden bg-white"
      style={{
        borderRadius: "var(--radius-lg)",
        boxShadow: "inset 0 0 0 1px rgba(0,0,0,0.05)",
      }}
    >

      {/* MAP IMAGE */}
      <img
        src={mapImage}
        alt="Map"
        className="absolute inset-0 w-full h-full object-contain"
        draggable={false}
      />

      {/* POINTER */}
      <div
        className="absolute transition-all duration-500 ease-out z-10"
        style={{
          left: `${x}%`,
          top: `${y}%`,
          transform: `translate(-50%, -50%) rotate(${rotation}deg)`
        }}
      >
        {/* Pulse ring */}
        <div
          className="absolute rounded-full"
          style={{
            width: "24px",
            height: "24px",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            background: "rgba(196, 146, 58, 0.2)",
            animation: "pointer-ping 2s ease-out infinite",
          }}
        />
        {/* Dot */}
        <div
          className="relative w-3.5 h-3.5 rounded-full"
          style={{
            background: "linear-gradient(135deg, var(--color-amber) 0%, var(--color-amber-light) 100%)",
            boxShadow: "0 0 8px var(--color-amber-glow), 0 2px 6px rgba(0,0,0,0.2)",
          }}
        >
          {/* Direction arrow */}
          <div
            className="
              absolute -top-3 left-1/2 -translate-x-1/2
              w-0 h-0
              border-l-[5px] border-r-[5px] border-b-[10px]
              border-l-transparent border-r-transparent
            "
            style={{ borderBottomColor: "var(--color-amber)" }}
          />
        </div>
      </div>
    </div>
  );
}
