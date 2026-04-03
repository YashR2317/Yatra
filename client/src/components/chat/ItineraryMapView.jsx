import React, { useState, useMemo, useCallback, useEffect, useRef } from "react";
import {
  APIProvider,
  Map,
  AdvancedMarker,
  InfoWindow,
  useMap,
} from "@vis.gl/react-google-maps";
import { isActualPlace } from "../../contexts/ChatContext";

const MAPS_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || "";

/* ── Day-based colour palette ──────────────────────────── */
const DAY_COLORS = [
  "#D97706", // amber-600
  "#2563EB", // blue-600
  "#059669", // emerald-600
  "#DC2626", // red-600
  "#7C3AED", // violet-600
  "#DB2777", // pink-600
  "#0891B2", // cyan-600
  "#CA8A04", // yellow-600
];

function getDayColor(dayIndex) {
  return DAY_COLORS[dayIndex % DAY_COLORS.length];
}

/* ── Numbered Marker Pin ──────────────────────────────── */
function MarkerPin({ number, color, isActive }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        width: isActive ? 40 : 32,
        height: isActive ? 40 : 32,
        borderRadius: "50%",
        background: color,
        color: "#fff",
        fontWeight: 800,
        fontSize: isActive ? 16 : 13,
        border: `3px solid ${isActive ? "#fff" : "rgba(255,255,255,0.7)"}`,
        boxShadow: isActive
          ? `0 0 0 3px ${color}, 0 4px 12px rgba(0,0,0,0.35)`
          : "0 2px 6px rgba(0,0,0,0.3)",
        cursor: "pointer",
        transition: "all 0.2s ease",
        transform: isActive ? "scale(1.15)" : "scale(1)",
        zIndex: isActive ? 10 : 1,
      }}
    >
      {number}
    </div>
  );
}

/* ── Route polyline drawn on the map ──────────────────── */
function RoutePolyline({ path, color }) {
  const map = useMap();
  const polyRef = useRef(null);

  useEffect(() => {
    if (!map || !window.google || path.length < 2) return;

    // Clean up previous polyline
    if (polyRef.current) {
      polyRef.current.setMap(null);
    }

    polyRef.current = new window.google.maps.Polyline({
      path: path.map((p) => ({ lat: p.lat, lng: p.lng })),
      geodesic: true,
      strokeColor: color,
      strokeOpacity: 0.7,
      strokeWeight: 3,
      map,
    });

    return () => {
      if (polyRef.current) {
        polyRef.current.setMap(null);
      }
    };
  }, [map, path, color]);

  return null;
}

/* ── Auto-fit bounds to markers ───────────────────────── */
function FitBounds({ markers }) {
  const map = useMap();

  useEffect(() => {
    if (!map || !window.google || markers.length === 0) return;

    const bounds = new window.google.maps.LatLngBounds();
    markers.forEach((m) => bounds.extend({ lat: m.lat, lng: m.lng }));
    map.fitBounds(bounds, { top: 50, right: 50, bottom: 50, left: 50 });
  }, [map, markers]);

  return null;
}

/* ── Main Component ───────────────────────────────────── */
export default function ItineraryMapView({ days, activeDay }) {
  const [selectedMarker, setSelectedMarker] = useState(null);
  const [viewAll, setViewAll] = useState(false);

  // Build markers from itinerary data
  const markers = useMemo(() => {
    const result = [];
    const daysToShow = viewAll ? days : [days[activeDay]];

    daysToShow.forEach((day, dayOffset) => {
      const dayIndex = viewAll ? dayOffset : activeDay;
      const color = getDayColor(dayIndex);
      let placeNumber = 0;

      (day?.slots || []).forEach((slot) => {
        if (!isActualPlace(slot)) return;

        const lat = parseFloat(slot.lat);
        const lng = parseFloat(slot.lng);

        // Skip slots without coordinates
        if (!lat || !lng || isNaN(lat) || isNaN(lng)) return;

        placeNumber++;
        result.push({
          id: `${dayIndex}-${placeNumber}`,
          lat,
          lng,
          number: placeNumber,
          dayIndex,
          dayNumber: day.day || dayIndex + 1,
          color,
          slot,
          city: day.city || slot.city || "",
        });
      });
    });

    return result;
  }, [days, activeDay, viewAll]);

  // Group markers by day for polylines
  const polylines = useMemo(() => {
    const groups = {};
    markers.forEach((m) => {
      if (!groups[m.dayIndex]) groups[m.dayIndex] = { color: m.color, path: [] };
      groups[m.dayIndex].path.push({ lat: m.lat, lng: m.lng });
    });
    return Object.values(groups);
  }, [markers]);

  // Default center (Mathura)
  const defaultCenter = { lat: 27.4924, lng: 77.6737 };
  const center = markers.length > 0
    ? { lat: markers[0].lat, lng: markers[0].lng }
    : defaultCenter;

  const handleMarkerClick = useCallback((marker) => {
    setSelectedMarker((prev) => (prev?.id === marker.id ? null : marker));
  }, []);

  if (!MAPS_KEY) {
    return (
      <div className="flex items-center justify-center h-64 bg-gray-50 dark:bg-gray-900/30 rounded-xl border border-dashed border-gray-300 dark:border-gray-700">
        <p className="text-sm text-gray-400">
          Google Maps API key not configured. Add <code>VITE_GOOGLE_MAPS_API_KEY</code> to your <code>.env</code>.
        </p>
      </div>
    );
  }

  if (markers.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 bg-gray-50 dark:bg-gray-900/30 rounded-xl border border-dashed border-gray-300 dark:border-gray-700">
        <span className="text-3xl mb-2">📍</span>
        <p className="text-sm text-gray-400">
          No location coordinates available for this day's stops.
        </p>
        <p className="text-xs text-gray-400 mt-1">
          Places need lat/lng data to appear on the map.
        </p>
      </div>
    );
  }

  return (
    <div className="relative">
      {/* View toggle */}
      {days.length > 1 && (
        <div className="absolute top-3 left-3 z-10 flex bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
          <button
            onClick={() => setViewAll(false)}
            className={`px-3 py-1.5 text-xs font-bold transition-all ${
              !viewAll
                ? "bg-amber-500 text-white"
                : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
            }`}
          >
            Day {days[activeDay]?.day || activeDay + 1}
          </button>
          <button
            onClick={() => setViewAll(true)}
            className={`px-3 py-1.5 text-xs font-bold transition-all ${
              viewAll
                ? "bg-amber-500 text-white"
                : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
            }`}
          >
            All Days
          </button>
        </div>
      )}

      {/* Legend */}
      {viewAll && days.length > 1 && (
        <div className="absolute top-3 right-3 z-10 bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-2">
          {days.map((day, i) => (
            <div key={i} className="flex items-center gap-2 px-1 py-0.5">
              <span
                className="w-3 h-3 rounded-full flex-shrink-0"
                style={{ background: getDayColor(i) }}
              />
              <span className="text-[10px] font-semibold text-gray-600 dark:text-gray-300 whitespace-nowrap">
                Day {day.day || i + 1} — {day.city || ""}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Map */}
      <div className="rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700" style={{ height: 420 }}>
        <APIProvider apiKey={MAPS_KEY}>
          <Map
            defaultCenter={center}
            defaultZoom={13}
            mapId="brajyatra-itinerary-map"
            gestureHandling="cooperative"
            disableDefaultUI={false}
            zoomControl={true}
            mapTypeControl={false}
            streetViewControl={false}
            fullscreenControl={true}
            style={{ width: "100%", height: "100%" }}
          >
            <FitBounds markers={markers} />

            {/* Route polylines */}
            {polylines.map((pl, i) => (
              <RoutePolyline key={i} path={pl.path} color={pl.color} />
            ))}

            {/* Markers */}
            {markers.map((marker) => (
              <AdvancedMarker
                key={marker.id}
                position={{ lat: marker.lat, lng: marker.lng }}
                onClick={() => handleMarkerClick(marker)}
                zIndex={selectedMarker?.id === marker.id ? 100 : marker.number}
              >
                <MarkerPin
                  number={marker.number}
                  color={marker.color}
                  isActive={selectedMarker?.id === marker.id}
                />
              </AdvancedMarker>
            ))}

            {/* Info Window */}
            {selectedMarker && (
              <InfoWindow
                position={{ lat: selectedMarker.lat, lng: selectedMarker.lng }}
                onCloseClick={() => setSelectedMarker(null)}
                pixelOffset={[0, -40]}
              >
                <div style={{ maxWidth: 260, fontFamily: "system-ui, sans-serif" }}>
                  <h3 style={{ margin: "0 0 6px", fontSize: 14, fontWeight: 700, color: "#1a1a1a" }}>
                    📍 {selectedMarker.slot.place}
                  </h3>
                  {selectedMarker.city && (
                    <p style={{ margin: "0 0 4px", fontSize: 11, color: "#888" }}>
                      {selectedMarker.city} · Day {selectedMarker.dayNumber}
                    </p>
                  )}
                  {selectedMarker.slot.time && (
                    <p style={{ margin: "0 0 4px", fontSize: 12, color: "#555" }}>
                      🕐 {selectedMarker.slot.time}
                      {selectedMarker.slot.duration_mins && ` · ${selectedMarker.slot.duration_mins} min`}
                    </p>
                  )}
                  {selectedMarker.slot.description && (
                    <p style={{ margin: "4px 0 0", fontSize: 11, color: "#666", lineHeight: 1.4 }}>
                      {selectedMarker.slot.description.length > 120
                        ? selectedMarker.slot.description.substring(0, 120) + "..."
                        : selectedMarker.slot.description}
                    </p>
                  )}
                  <div style={{ display: "flex", gap: 6, marginTop: 8, flexWrap: "wrap" }}>
                    {selectedMarker.slot.entry_fee !== undefined && (
                      <span style={{
                        fontSize: 10, padding: "2px 8px", borderRadius: 12,
                        background: "#ecfdf5", color: "#065f46", fontWeight: 600,
                      }}>
                        🎫 {selectedMarker.slot.entry_fee > 0 ? `₹${selectedMarker.slot.entry_fee}` : "Free"}
                      </span>
                    )}
                    {selectedMarker.slot.crowd_level && (
                      <span style={{
                        fontSize: 10, padding: "2px 8px", borderRadius: 12,
                        background: "#fef9c3", color: "#713f12", fontWeight: 600,
                      }}>
                        👥 {selectedMarker.slot.crowd_level}
                      </span>
                    )}
                  </div>
                  {selectedMarker.slot.google_maps_url && (
                    <a
                      href={selectedMarker.slot.google_maps_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        display: "inline-block", marginTop: 8, fontSize: 11,
                        color: "#2563eb", textDecoration: "none", fontWeight: 600,
                      }}
                    >
                      Open in Google Maps →
                    </a>
                  )}
                </div>
              </InfoWindow>
            )}
          </Map>
        </APIProvider>
      </div>

      {/* Stop list below map */}
      <div className="mt-3 flex flex-wrap gap-1.5">
        {markers.map((m) => (
          <button
            key={m.id}
            onClick={() => setSelectedMarker(m)}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold transition-all border ${
              selectedMarker?.id === m.id
                ? "border-amber-500 bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-300 shadow-sm"
                : "border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-amber-400/50"
            }`}
          >
            <span
              className="w-5 h-5 rounded-full flex items-center justify-center text-white text-[10px] font-bold"
              style={{ background: m.color }}
            >
              {m.number}
            </span>
            {m.slot.place?.length > 22 ? m.slot.place.substring(0, 22) + "…" : m.slot.place}
          </button>
        ))}
      </div>
    </div>
  );
}
