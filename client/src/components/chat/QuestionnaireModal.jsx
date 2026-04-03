import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useChatContext, CITY_IMAGES } from "../../contexts/ChatContext";
import { useChat } from "../../hooks/useChat";

const YATRA_TYPES = [
  { value: "pilgrimage", label: "Tirth Yatra", desc: "Sacred pilgrimage & temple darshan", icon: "🙏" },
  { value: "cultural", label: "Cultural Tour", desc: "Culture, heritage & monuments", icon: "🏛️" },
  { value: "complete", label: "Complete Braj Yatra", desc: "Complete tour — temples, heritage & nature", icon: "🌅" },
  { value: "mixed", label: "Custom Mix", desc: "I'll pick my own interests", icon: "✨" },
];

const DAYS_OPTIONS = [1, 2, 3, 4, 5, 6, 7];

const INTERESTS = [
  { value: "temples", label: "🛕 Temple Darshan" },
  { value: "ghats", label: "🌊 Ghat & Holy Bath" },
  { value: "food", label: "🍛 Prasadam & Food" },
  { value: "heritage", label: "🏛️ Heritage & Monuments" },
  { value: "markets", label: "🛍️ Bazaar & Shopping" },
  { value: "nature", label: "🌿 Nature & Parikrama" },
  { value: "aarti", label: "🪔 Aarti & Kirtan" },
  { value: "festivals", label: "🎉 Festivals & Events" },
];

const PACE_OPTIONS = [
  { value: "relaxed", label: "🧘 Relaxed", desc: "Fewer places, more time at each" },
  { value: "moderate", label: "⚖️ Moderate", desc: "Balanced pace" },
  { value: "intensive", label: "🏃 Intensive", desc: "Cover maximum places" },
];

const GROUP_OPTIONS = [
  { value: "solo", label: "🧑 Solo" },
  { value: "couple", label: "💑 Couple" },
  { value: "family", label: "👨‍👩‍👧 Family" },
  { value: "group", label: "👥 Group" },
];

const TIME_OPTIONS = [
  { value: "morning", label: "🌅 Early Morning (5-7 AM)" },
  { value: "forenoon", label: "☀️ Forenoon (8-10 AM)" },
  { value: "afternoon", label: "🌤️ Afternoon (12-2 PM)" },
  { value: "evening", label: "🌇 Evening (4-6 PM)" },
];

const VISIT_ORDER_OPTIONS = [
  { value: "temples_first", label: "🛕 Temples First", desc: "Start with sacred temples & darshan, ghats in evening" },
  { value: "ghats_first", label: "🌊 Ghats First", desc: "Begin with holy bath & ghat visits, then temples" },
  { value: "monuments_first", label: "🏛️ Monuments First", desc: "Start with heritage sites & forts, temples later" },
  { value: "auto", label: "🔀 Auto (Weather-based)", desc: "Let AI decide the best order based on current weather" },
];

export default function QuestionnaireModal({ onSubmit }) {
  const { state, dispatch } = useChatContext();
  const { fetchCities, fetchPlaces } = useChat();

  const [step, setStep] = useState(1);
  const totalSteps = 6;

  const [prefs, setPrefs] = useState({
    yatraType: "",
    days: 3,
    cities: [],
    interests: [],
    selectedPlaces: [],
    pace: "moderate",
    group: "family",
    startLocation: "",
    firstCity: "",
    startTime: "forenoon",
    visitOrder: "auto",
  });

  const [cities, setCities] = useState([]);
  const [placesData, setPlacesData] = useState({});
  const [loadingPlaces, setLoadingPlaces] = useState(false);

  useEffect(() => {
    fetchCities().then((c) => {
      if (c.length > 0) {
        // Override server image paths with client-side CITY_IMAGES (which resolve on dev server)
        setCities(c.map(city => ({
          ...city,
          image: CITY_IMAGES[city.name] || city.image,
        })));
      } else {
        setCities(Object.entries(CITY_IMAGES).map(([name, image]) => ({ name, image, count: 20 })));
      }
    });
  }, [fetchCities]);

  // Load places when entering step 3b
  useEffect(() => {
    if (step === "3b") {
      const loadPlaces = async () => {
        setLoadingPlaces(true);
        const selectedCities = prefs.cities.length > 0 ? prefs.cities : Object.keys(CITY_IMAGES);
        const result = {};
        for (const city of selectedCities) {
          result[city] = await fetchPlaces(city);
        }
        setPlacesData(result);
        setLoadingPlaces(false);
      };
      loadPlaces();
    }
  }, [step, prefs.cities, fetchPlaces]);

  if (!state.questionnaireOpen) return null;

  const close = () => dispatch({ type: "CLOSE_QUESTIONNAIRE" });

  const next = () => {
    if (step === 3 && prefs.yatraType === "mixed") { setStep("3b"); return; }
    if (step === "3b") { setStep(5); return; }
    if (step === 3 && prefs.yatraType !== "mixed") { setStep(4); return; }
    if (step === 4) { setStep(5); return; }  // interests -> pace (visit order asked by agent after)
    if (step < totalSteps) setStep(step + 1);
  };

  const prev = () => {
    if (step === "3b") { setStep(3); return; }
    if (step === 5 && prefs.yatraType === "mixed") { setStep("3b"); return; }
    if (step === 5 && prefs.yatraType !== "mixed") { setStep(4); return; }
    if (step > 1) setStep(step - 1);
  };

  const handleSubmit = () => {
    close();
    const yatraNames = { pilgrimage: "Tirth Yatra (pilgrimage focused)", cultural: "Cultural Heritage Tour", complete: "Complete Braj Yatra (full tour)", mixed: "custom mix" };
    const paceNames = { relaxed: "relaxed", moderate: "moderate", intensive: "intensive (cover maximum)" };
    const timeNames = { morning: "early morning (5-7 AM)", forenoon: "forenoon (8-10 AM)", afternoon: "afternoon (12-2 PM)", evening: "evening (4-6 PM)" };

    const citiesStr = prefs.cities.length > 0 ? prefs.cities.join(", ") : "Mathura, Vrindavan";
    const interests = prefs.interests.length > 0 ? prefs.interests.join(", ") : "temples, heritage, food";
    const yatraType = yatraNames[prefs.yatraType] || "spiritual journey";
    const startTimeStr = timeNames[prefs.startTime] || "forenoon";
    const cityOrder = prefs.firstCity ? ` Start the itinerary from ${prefs.firstCity} first.` : "";
    const startInfo = prefs.startLocation ? ` I am travelling from ${prefs.startLocation}.` : "";
    const isCustomMix = prefs.yatraType === "mixed";
    const selectedPlacesStr = prefs.selectedPlaces.join(", ");

    let msg;
    if (isCustomMix && selectedPlacesStr) {
      msg = `Plan a ${prefs.days}-day ${yatraType} itinerary covering ${citiesStr}. I specifically want to visit these places: ${selectedPlacesStr}. Pace: ${paceNames[prefs.pace] || "moderate"}. Travelling as: ${prefs.group || "family"}.${startInfo}${cityOrder} I will arrive/start in the ${startTimeStr}. Generate separate Google Maps routes for each city. Include the best temples for darshan, local prasadam recommendations, and practical tips.`;
    } else {
      msg = `Plan a ${prefs.days}-day ${yatraType} itinerary covering ${citiesStr}. My interests include: ${interests}. Pace: ${paceNames[prefs.pace] || "moderate"}. Travelling as: ${prefs.group || "family"}.${startInfo}${cityOrder} I will arrive/start in the ${startTimeStr}. Generate separate Google Maps routes for each city. Include the best temples for darshan, local prasadam recommendations, and practical tips.`;
    }

    onSubmit(msg);
  };

  const toggle = (arr, val) => arr.includes(val) ? arr.filter((x) => x !== val) : [...arr, val];

  const numStep = step === "3b" ? 3.5 : step;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
        onClick={(e) => { if (e.target === e.currentTarget) close(); }}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="w-full max-w-lg max-h-[85vh] bg-[var(--color-surface)] rounded-2xl shadow-2xl border border-[var(--color-border)] overflow-hidden flex flex-col"
        >
          {/* Header */}
          <div className="px-5 py-4 border-b border-[var(--color-border)] flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-[var(--color-text-primary)]">🛕 Plan Your Sacred Yatra</h2>
              <p className="text-[11px] text-[var(--color-text-secondary)]">Tell us your preferences for a personalized itinerary</p>
            </div>
            <button onClick={close} className="w-8 h-8 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center justify-center text-[var(--color-text-secondary)] transition-colors">✕</button>
          </div>

          {/* Progress Dots */}
          <div className="flex items-center justify-center gap-2 py-3 border-b border-[var(--color-border)]">
            {[1, 2, 3, 4, 5].map((s) => (
              <div
                key={s}
                className={`w-2.5 h-2.5 rounded-full transition-all ${
                  s === Math.ceil(numStep) ? "bg-amber-500 scale-125" : s < numStep ? "bg-amber-400" : "bg-gray-200 dark:bg-gray-700"
                }`}
              />
            ))}
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto px-5 py-4">
            {/* Step 1: Yatra Type */}
            {step === 1 && (
              <div>
                <h3 className="text-sm font-bold text-[var(--color-text-primary)] mb-1">🙏 Yatra Type</h3>
                <p className="text-xs text-[var(--color-text-secondary)] mb-4">What kind of journey calls to your soul?</p>
                <div className="grid grid-cols-2 gap-2">
                  {YATRA_TYPES.map((yt) => (
                    <button
                      key={yt.value}
                      onClick={() => setPrefs((p) => ({ ...p, yatraType: yt.value }))}
                      className={`p-3 rounded-xl border text-left transition-all ${
                        prefs.yatraType === yt.value
                          ? "border-amber-500 bg-amber-50 dark:bg-amber-900/20 ring-2 ring-amber-500/30"
                          : "border-[var(--color-border)] hover:border-amber-500/30"
                      }`}
                    >
                      <span className="text-lg">{yt.icon}</span>
                      <p className="text-xs font-semibold text-[var(--color-text-primary)] mt-1">{yt.label}</p>
                      <p className="text-[10px] text-[var(--color-text-secondary)]">{yt.desc}</p>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Step 2: Duration */}
            {step === 2 && (
              <div>
                <h3 className="text-sm font-bold text-[var(--color-text-primary)] mb-1">📅 Yatra Duration</h3>
                <p className="text-xs text-[var(--color-text-secondary)] mb-4">How many days for your sacred journey?</p>
                <div className="flex flex-wrap gap-2">
                  {DAYS_OPTIONS.map((d) => (
                    <button
                      key={d}
                      onClick={() => setPrefs((p) => ({ ...p, days: d }))}
                      className={`w-12 h-12 rounded-xl text-sm font-bold transition-all ${
                        prefs.days === d
                          ? "bg-amber-500 text-white shadow-lg shadow-amber-500/30"
                          : "border border-[var(--color-border)] text-[var(--color-text-primary)] hover:border-amber-500/50"
                      }`}
                    >
                      {d}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Step 3: Cities */}
            {step === 3 && (
              <div>
                <h3 className="text-sm font-bold text-[var(--color-text-primary)] mb-1">📍 Sacred Destinations</h3>
                <p className="text-xs text-[var(--color-text-secondary)] mb-4">Select the holy cities you wish to visit</p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {cities.map((c) => (
                    <button
                      key={c.name}
                      onClick={() => setPrefs((p) => ({ ...p, cities: toggle(p.cities, c.name) }))}
                      className={`rounded-xl overflow-hidden border transition-all ${
                        prefs.cities.includes(c.name)
                          ? "border-amber-500 ring-2 ring-amber-500/30"
                          : "border-[var(--color-border)] hover:border-amber-500/30"
                      }`}
                    >
                      <img src={c.image} alt={c.name} className="w-full h-16 object-cover" loading="lazy" />
                      <div className="py-1.5 px-2">
                        <p className="text-[11px] font-semibold text-[var(--color-text-primary)]">{c.name}</p>
                        <p className="text-[9px] text-[var(--color-text-secondary)]">{c.count} places</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Step 3b: Place Picker */}
            {step === "3b" && (
              <div>
                <h3 className="text-sm font-bold text-[var(--color-text-primary)] mb-1">📍 Select Places</h3>
                <p className="text-xs text-[var(--color-text-secondary)] mb-4">Pick the specific places you want to visit</p>
                {loadingPlaces ? (
                  <p className="text-xs text-[var(--color-text-secondary)] text-center py-8">Loading places...</p>
                ) : (
                  <div className="space-y-4">
                    {Object.entries(placesData).map(([city, places]) => {
                      if (!places || places.length === 0) return null;
                      return (
                        <div key={city}>
                          <h4 className="text-xs font-bold text-[var(--color-text-primary)] mb-2">📍 {city}</h4>
                          <div className="space-y-1">
                            {places.map((p) => (
                              <button
                                key={p.name}
                                onClick={() => setPrefs((prev) => ({ ...prev, selectedPlaces: toggle(prev.selectedPlaces, p.name) }))}
                                className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-left text-xs transition-all ${
                                  prefs.selectedPlaces.includes(p.name)
                                    ? "bg-amber-50 dark:bg-amber-900/15 border border-amber-300 dark:border-amber-700"
                                    : "border border-[var(--color-border)] hover:border-amber-200"
                                }`}
                              >
                                <span className="w-4 text-center">{prefs.selectedPlaces.includes(p.name) ? "✓" : ""}</span>
                                <span className="flex-1 text-[var(--color-text-primary)]">{p.name}</span>
                                <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-amber-200 dark:bg-amber-900/40 text-amber-900 dark:text-amber-200 font-semibold">{p.category || ""}</span>
                              </button>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* Step 4: Interests */}
            {step === 4 && (
              <div>
                <h3 className="text-sm font-bold text-[var(--color-text-primary)] mb-1">🪷 Your Interests</h3>
                <p className="text-xs text-[var(--color-text-secondary)] mb-4">What experiences are you seeking? (Select multiple)</p>
                <div className="flex flex-wrap gap-2">
                  {INTERESTS.map((int) => (
                    <button
                      key={int.value}
                      onClick={() => setPrefs((p) => ({ ...p, interests: toggle(p.interests, int.value) }))}
                      className={`px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                        prefs.interests.includes(int.value)
                          ? "bg-amber-500 text-white shadow-md"
                          : "border border-[var(--color-border)] text-[var(--color-text-primary)] hover:border-amber-500/50"
                      }`}
                    >
                      {int.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Step 5: Pace & Group (visit order preference is asked by the agent after submission) */}
            {step === 5 && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-sm font-bold text-[var(--color-text-primary)] mb-1">🚶 Your preferred pace:</h3>
                  <div className="grid grid-cols-3 gap-2 mt-2">
                    {PACE_OPTIONS.map((po) => (
                      <button
                        key={po.value}
                        onClick={() => setPrefs((p) => ({ ...p, pace: po.value }))}
                        className={`p-3 rounded-xl border text-center transition-all ${
                          prefs.pace === po.value
                            ? "border-amber-500 bg-amber-50 dark:bg-amber-900/20 ring-2 ring-amber-500/30"
                            : "border-[var(--color-border)] hover:border-amber-500/30"
                        }`}
                      >
                        <p className="text-xs font-semibold text-[var(--color-text-primary)]">{po.label}</p>
                        <p className="text-[9px] text-[var(--color-text-secondary)] mt-0.5">{po.desc}</p>
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[var(--color-text-primary)] mb-2">Travelling as:</h3>
                  <div className="flex flex-wrap gap-2">
                    {GROUP_OPTIONS.map((go) => (
                      <button
                        key={go.value}
                        onClick={() => setPrefs((p) => ({ ...p, group: go.value }))}
                        className={`px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                          prefs.group === go.value
                            ? "bg-amber-500 text-white shadow-md"
                            : "border border-[var(--color-border)] text-[var(--color-text-primary)] hover:border-amber-500/50"
                        }`}
                      >
                        {go.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Step 6: Starting Point & Time */}
            {step === 6 && (
              <div className="space-y-5">
                <div>
                  <h3 className="text-sm font-bold text-[var(--color-text-primary)] mb-1">📍 Starting Point & Time</h3>
                  <p className="text-xs text-[var(--color-text-secondary)] mb-3">Where are you starting from and when do you arrive?</p>
                  <label className="text-xs font-medium text-[var(--color-text-primary)] block mb-1">Starting from:</label>
                  <input
                    type="text"
                    value={prefs.startLocation}
                    onChange={(e) => setPrefs((p) => ({ ...p, startLocation: e.target.value }))}
                    placeholder="e.g. Delhi, Agra Cantt Station"
                    className="w-full px-3 py-2 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] text-xs text-[var(--color-text-primary)] placeholder:text-[var(--color-text-secondary)] focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                  />
                </div>

                <div>
                  <label className="text-xs font-medium text-[var(--color-text-primary)] block mb-2">Which city first?</label>
                  <div className="flex flex-wrap gap-2">
                    {(prefs.cities.length > 0 ? prefs.cities : Object.keys(CITY_IMAGES)).map((c) => (
                      <button
                        key={c}
                        onClick={() => setPrefs((p) => ({ ...p, firstCity: c }))}
                        className={`px-3 py-1.5 rounded-full text-[11px] font-medium transition-all ${
                          prefs.firstCity === c
                            ? "bg-amber-500 text-white"
                            : "border border-[var(--color-border)] text-[var(--color-text-primary)] hover:border-amber-500/50"
                        }`}
                      >
                        {c}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-xs font-medium text-[var(--color-text-primary)] block mb-2">Arrival / Start time:</label>
                  <div className="grid grid-cols-2 gap-2">
                    {TIME_OPTIONS.map((to) => (
                      <button
                        key={to.value}
                        onClick={() => setPrefs((p) => ({ ...p, startTime: to.value }))}
                        className={`px-3 py-2 rounded-xl text-[11px] font-medium transition-all text-left ${
                          prefs.startTime === to.value
                            ? "bg-amber-500 text-white shadow-md"
                            : "border border-[var(--color-border)] text-[var(--color-text-primary)] hover:border-amber-500/50"
                        }`}
                      >
                        {to.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-5 py-3 border-t border-[var(--color-border)] flex items-center justify-between">
            {step !== 1 ? (
              <button onClick={prev} className="text-xs font-medium text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors">
                ← Back
              </button>
            ) : <div />}
            {step === totalSteps ? (
              <button
                onClick={handleSubmit}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 text-white text-xs font-bold shadow-lg shadow-amber-500/30 hover:shadow-amber-500/40 transition-all"
              >
                🙏 Plan My Yatra
              </button>
            ) : (
              <button
                onClick={next}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 text-white text-xs font-bold shadow-lg shadow-amber-500/30 hover:shadow-amber-500/40 transition-all"
              >
                Next →
              </button>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
