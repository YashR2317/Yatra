import React, { useRef, useState } from "react";

/**
 * Independent Map Coordinate Picker
 * ---------------------------------
 * Click on the map image to get x/y (%)
 * Image is imported INSIDE this file
 */

// 🔴 CHANGE THIS PATH TO YOUR MAP IMAGE
import mapImage from "/tours/sikandra/map.png";
// If using Vite / CRA public folder, use:
// const mapImage = "/tours/aram/map.jpeg";

export default function MapCoordinatePicker() {
  const containerRef = useRef(null);
  const [point, setPoint] = useState(null);

  const handleClick = (e) => {
    const rect = containerRef.current.getBoundingClientRect();

    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    const rounded = {
      x: Number(x.toFixed(2)),
      y: Number(y.toFixed(2))
    };

    setPoint(rounded);

    // ✅ JSON READY OUTPUT
    console.log(
      `"map": { "x": ${rounded.x}, "y": ${rounded.y}, "angleOffset": 0 }`
    );
  };

  return (
    <div className="w-full h-screen flex flex-col items-center justify-center bg-gray-100 gap-4">

      <h1 className="text-lg font-semibold">
        Map Coordinate Picker
      </h1>

      <p className="text-sm text-gray-600">
        Click anywhere on the map to get x / y coordinates
      </p>

      <div
        ref={containerRef}
        onClick={handleClick}
        className="relative w-full max-w-[600px] aspect-[4/3] border border-gray-400 cursor-crosshair bg-white"
      >
        <img
          src={mapImage}
          alt="Map"
          className="absolute inset-0 w-full h-full object-contain"
          draggable={false}
        />

        {point && (
          <div
            className="absolute w-3 h-3 bg-red-600 rounded-full"
            style={{
              left: `${point.x}%`,
              top: `${point.y}%`,
              transform: "translate(-50%, -50%)"
            }}
          />
        )}
      </div>

      {point && (
        <div className="bg-white p-3 rounded shadow text-sm">
          <div><b>x:</b> {point.x}%</div>
          <div><b>y:</b> {point.y}%</div>
        </div>
      )}

      <div className="text-xs text-gray-500">
        Check console for JSON-ready output
      </div>
    </div>
  );
}