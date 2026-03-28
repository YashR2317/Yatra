import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

import tourData from "../../data/virtual-tours/mariam-tomb.json";
import Viewer from "../../components/virtual-tours/Viewer";
import CompassPanel from "../../components/virtual-tours/CompassPanel";
import PrevSpotButton from "../../components/virtual-tours/PrevSpotButton";
import MapOverlay from "../../components/virtual-tours/MapOverlay";

let historyStack = [];

export default function MariamTomb() {
  const navigate = useNavigate();
  const { place, spots } = tourData;

  const firstSpotId = Object.keys(spots)[0];
  const [spotId, setSpotId] = useState(firstSpotId);
  const spot = spots[spotId];

  const [direction, setDirection] = useState(spot.available[0]);
  const [slideKey, setSlideKey] = useState(0);

  /* 🔴 CRITICAL GUARD */
  useEffect(() => {
    if (!spot.available.includes(direction)) {
      setDirection(spot.available[0]);
    }
  }, [spot, direction]);

  /* History */
  useEffect(() => {
    const entry = `mariam-tomb:${spotId}`;
    if (historyStack[historyStack.length - 1] !== entry) {
      historyStack.push(entry);
    }
    setSlideKey((k) => k + 1);
  }, [spotId]);

  const goToSpot = (target) => {
    if (spots[target]) setSpotId(target);
  };

  const goBack = () => {
    historyStack.pop();
    const prev = historyStack.pop();
    if (!prev) return;

    const [tour, prevSpot] = prev.split(":");
    if (tour !== "mariam-tomb") navigate(`/virtual-tours/${tour}`);
    else setSpotId(prevSpot);
  };

  const image = useMemo(
    () => spot.images[direction],
    [spot, direction]
  );

  const hotspots = useMemo(
    () => spot.hotspots?.[direction] || [],
    [spot, direction]
  );

  return (
    <div className="w-screen h-screen flex flex-col overflow-hidden bg-[var(--color-midnight)]">

      {/* ── PREMIUM HEADER ── */}
      <div
        className="
          h-[56px] min-h-[56px] flex items-center justify-between px-6
          gradient-header
          border-b border-white/[0.06]
        "
      >
        <div className="flex items-center gap-3">
          {/* Decorative accent */}
          <div className="w-1 h-6 rounded-full gradient-amber" />
          <h1
            className="text-white text-base md:text-lg font-heading font-semibold tracking-wide"
            style={{ letterSpacing: "0.02em" }}
          >
            Virtual Tour — <span className="text-gradient-gold">Tomb of Mariam-uz-Zamani</span>
          </h1>
        </div>
        {/* Spot indicator */}
        <div className="hidden md:flex items-center gap-2">
          <span className="text-white/40 text-xs font-body uppercase tracking-widest">
            Spot
          </span>
          <span
            className="text-white/80 text-sm font-semibold font-body bg-white/[0.08] px-2.5 py-0.5 rounded-lg"
          >
            {spot.heading || spotId}
          </span>
        </div>
      </div>

      {/* ── MAIN CONTENT ── */}
      <div className="flex flex-1 overflow-hidden flex-col md:flex-row">

        {/* LEFT — IMAGE VIEWER */}
        <div className="w-full md:w-[55%] h-[50vh] md:h-full relative">
          <AnimatePresence mode="wait">
            <motion.div
              key={`${spotId}-${slideKey}`}
              className="w-full h-full"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Viewer
                image={image}
                heading={spot.heading}
                hotspots={hotspots}
                directionKey={direction}
                onHotspotClick={goToSpot}
              />
            </motion.div>
          </AnimatePresence>
        </div>

        {/* DIVIDER LINE (desktop only) */}
        <div className="hidden md:block w-px bg-gradient-to-b from-transparent via-[var(--color-stone-border)] to-transparent" />

        {/* RIGHT — MAP + COMPASS */}
        <div className="flex-1 h-[50vh] md:h-full flex flex-col bg-[var(--color-cream)]">

          {/* MAP SECTION */}
          <div className="h-[60%] md:h-[65%] w-full flex flex-col items-center justify-center p-4 bg-[var(--color-warm-stone)]">
            <p className="text-xs font-semibold uppercase tracking-[0.15em] text-[var(--color-text-muted)] mb-3 font-body">
              Floor Plan
            </p>
            <div
              className="w-full max-w-[520px] aspect-[7/4] relative rounded-xl overflow-hidden"
              style={{ boxShadow: "var(--shadow-medium)" }}
            >
              <MapOverlay
                key={spotId}
                mapImage={place.map.image}
                x={spot.map.x}
                y={spot.map.y}
                direction={direction}
                angleOffset={spot.map.angleOffset}
              />
            </div>
          </div>

          {/* COMPASS SECTION */}
          <div className="flex-1 flex items-center justify-center">
            <CompassPanel
              available={spot.available}
              value={direction}
              onChange={setDirection}
            />
          </div>

          {/* PREVIOUS SPOT */}
          <PrevSpotButton
            disabled={historyStack.length <= 1}
            onBack={goBack}
          />
        </div>
      </div>
    </div>
  );
}
