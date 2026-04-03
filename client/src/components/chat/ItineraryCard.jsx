import React, { useState, useCallback, Suspense, lazy } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../../contexts/AuthContext";
import { useChatContext, buildPlaceMapUrl, buildDayRouteUrl, isActualPlace, isMealSlot, getVirtualTourUrl } from "../../contexts/ChatContext";
import { useChat } from "../../hooks/useChat";

const ItineraryMapView = lazy(() => import("./ItineraryMapView"));

/* ── Crowd Level Badge ─────────────────────────────────── */
function CrowdBadge({ level }) {
  const cfg = {
    low: { bg: "bg-emerald-200 dark:bg-emerald-900/40", text: "text-emerald-900 dark:text-emerald-200", label: "Low crowd" },
    medium: { bg: "bg-yellow-200 dark:bg-yellow-900/40", text: "text-yellow-900 dark:text-yellow-200", label: "Medium crowd" },
    high: { bg: "bg-orange-200 dark:bg-orange-900/40", text: "text-orange-900 dark:text-orange-200", label: "High crowd" },
    "very high": { bg: "bg-red-200 dark:bg-red-900/40", text: "text-red-900 dark:text-red-200", label: "Very high crowd" },
  };
  const c = cfg[level?.toLowerCase()] || cfg.medium;
  return (
    <span className={`text-[11px] px-2.5 py-1 rounded-full font-semibold ${c.bg} ${c.text}`}>
      👥 {c.label}
    </span>
  );
}

/* ── Single Slot Element ───────────────────────────────── */
function SlotElement({ slot, city, isEditing, onRemove }) {
  const meal = isMealSlot(slot);
  const place = isActualPlace(slot);
  const travel = !place && !meal;
  const mapUrl = place ? (slot.google_maps_url || buildPlaceMapUrl(slot.place, city)) : "";
  const vrTourUrl = place ? getVirtualTourUrl(slot.place) : null;

  return (
    <div className={`flex gap-4 py-4 px-4 rounded-xl border transition-all relative group
      ${meal ? "border-green-500/20 bg-green-50/80 dark:bg-green-900/15" :
        travel ? "border-transparent bg-transparent opacity-70" :
        "border-[var(--color-border)] bg-[var(--color-surface)] hover:border-amber-400/40 hover:shadow-sm"}`}
    >
      {/* Remove button (edit mode) */}
      {isEditing && place && (
        <button
          onClick={() => onRemove?.(slot)}
          className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-red-500 text-white text-xs flex items-center justify-center shadow-md hover:bg-red-600 transition-colors z-10"
          title="Remove this place"
        >✕</button>
      )}

      {/* Time Column */}
      <div className="shrink-0 w-24 text-right pt-0.5">
        <p className="text-sm font-extrabold text-[#7c3a0a] dark:text-amber-300 tracking-tight">{slot.time || ""}</p>
        <p className="text-[11px] text-[var(--color-text-secondary)] font-semibold capitalize">{slot.period || ""}</p>
      </div>

      {/* Divider dot */}
      <div className="flex flex-col items-center pt-1.5">
        <div className={`w-3 h-3 rounded-full border-2 ${meal ? "border-green-500 bg-green-200" : "border-amber-500 bg-amber-200"}`} />
        <div className="w-0.5 flex-1 bg-gradient-to-b from-amber-200 to-transparent dark:from-amber-800 mt-1" />
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          {mapUrl ? (
            <a href={mapUrl} target="_blank" rel="noopener noreferrer"
              className="text-base font-bold text-[#5b2c0e] dark:text-amber-300 hover:underline decoration-2 underline-offset-2">
              📍 {slot.place}
            </a>
          ) : (
            <span className="text-base font-semibold text-[var(--color-text-primary)]">
              {meal ? "" : travel ? "🚗 " : ""}{slot.place}
            </span>
          )}
          {vrTourUrl && (
            <a href={vrTourUrl} target="_blank" rel="noopener noreferrer"
              className="text-[11px] px-2.5 py-0.5 rounded-full bg-purple-200 dark:bg-purple-900/40 text-purple-900 dark:text-purple-200 font-semibold hover:bg-purple-300 transition-colors">
              🔮 360° Tour
            </a>
          )}
        </div>
        {slot.description && (
          <p className="text-sm text-[var(--color-text-secondary)] mt-1.5 leading-relaxed">{slot.description}</p>
        )}

        {/* Tags Row */}
        <div className="flex flex-wrap gap-2 mt-2.5">
          {slot.duration_mins && (
            <span className="text-[11px] px-2.5 py-1 rounded-full bg-blue-200 dark:bg-blue-900/40 text-blue-900 dark:text-blue-200 font-semibold">
              ⏱️ {slot.duration_mins} min
            </span>
          )}
          {place && (
            <span className="text-[11px] px-2.5 py-1 rounded-full bg-green-200 dark:bg-green-900/40 text-green-900 dark:text-green-200 font-semibold">
              🎫 {slot.entry_fee > 0 ? `₹${slot.entry_fee}` : "Free"}
            </span>
          )}
          {slot.travel_cost_from_previous > 0 && (
            <span className="text-[11px] px-2.5 py-1 rounded-full bg-purple-200 dark:bg-purple-900/40 text-purple-900 dark:text-purple-200 font-semibold">
              🚗 ~₹{slot.travel_cost_from_previous}
            </span>
          )}
        </div>

        {/* Crowd level */}
        {slot.tip && slot.tip.toLowerCase().includes("crowd") && (
          <div className="mt-2">
            <CrowdBadge level={slot.tip.replace(/crowd level:?\s*/i, "").trim()} />
          </div>
        )}
        {slot.tip && !slot.tip.toLowerCase().includes("crowd") && (
          <p className="text-[12px] text-[#5b2c0e] dark:text-amber-200 mt-2.5 bg-orange-100 dark:bg-amber-900/25 px-3 py-1.5 rounded-lg font-semibold">
            💡 {slot.tip}
          </p>
        )}
      </div>
    </div>
  );
}

/* ── Budget Section ────────────────────────────────────── */
function BudgetSection({ budget }) {
  if (!budget || !budget.total) return null;

  const levelLabels = { low: "💰 Budget", medium: "💸 Moderate", high: "💎 Premium" };
  const parts = [
    { label: "Entry Fees", value: budget.entry_fees, color: "#e67e22", icon: "🎫" },
    { label: "Food & Prasadam", value: budget.food, color: "#27ae60", icon: "🍛" },
    { label: "Transport", value: budget.transport, color: "#3498db", icon: "🚗" },
    { label: "Accommodation", value: budget.accommodation, color: "#9b59b6", icon: "🏨" },
    { label: "Miscellaneous", value: budget.miscellaneous || 0, color: "#e74c3c", icon: "🛍️" },
  ].filter((p) => p.value > 0);

  return (
    <div className="mt-5 p-5 rounded-2xl border border-[var(--color-border)] bg-gradient-to-br from-[var(--color-surface)] to-amber-50/30 dark:to-amber-900/5">
      <h3 className="text-base font-bold text-[var(--color-text-primary)] mb-4 flex items-center gap-2">
        💰 Estimated Budget
        <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-amber-200 dark:bg-amber-900/40 text-amber-900 dark:text-amber-200 font-bold">
          {levelLabels[budget.budget_level] || "💸 Moderate"}
        </span>
      </h3>

      <div className="flex items-center gap-4 mb-4">
        <span className="text-[12px] text-[var(--color-text-secondary)] font-medium">
          👥 {budget.people || 2} people · 📅 {budget.days} day{budget.days > 1 ? "s" : ""}
        </span>
      </div>

      {/* Total prominently displayed */}
      <div className="text-center mb-5 py-4 rounded-xl bg-amber-50 dark:bg-amber-900/15 border border-amber-200 dark:border-amber-800/30">
        <p className="text-[11px] text-[var(--color-text-secondary)] uppercase tracking-wider font-semibold">Total Estimated Cost</p>
        <p className="text-3xl font-extrabold text-amber-600 dark:text-amber-400 mt-1">₹{budget.total.toLocaleString("en-IN")}</p>
        <p className="text-sm text-[var(--color-text-secondary)] mt-1">₹{(budget.per_person || 0).toLocaleString("en-IN")} per person</p>
      </div>

      {/* Progress bar */}
      <div className="flex h-3 rounded-full overflow-hidden mb-4 shadow-inner bg-gray-100 dark:bg-gray-800">
        {parts.map((p) => (
          <div key={p.label}
            style={{ width: `${(p.value / budget.total * 100).toFixed(1)}%`, background: p.color }}
            title={`${p.label}: ₹${p.value.toLocaleString("en-IN")}`}
            className="transition-all duration-500"
          />
        ))}
      </div>

      {/* Breakdown */}
      <div className="space-y-2">
        {parts.map((p) => (
          <div key={p.label} className="flex justify-between items-center text-sm py-1.5">
            <span className="text-[var(--color-text-secondary)] flex items-center gap-2">
              <span className="w-3 h-3 rounded-full inline-block" style={{ background: p.color }} />
              {p.icon} {p.label}
            </span>
            <span className="font-bold text-[var(--color-text-primary)]">₹{p.value.toLocaleString("en-IN")}</span>
          </div>
        ))}
      </div>

      {budget.breakdown_note && (
        <p className="text-[12px] text-[#3d1f00] dark:text-amber-200 mt-4 bg-orange-100 dark:bg-amber-900/25 px-3 py-2.5 rounded-lg font-semibold border border-orange-200 dark:border-amber-800/30">
          💡 {budget.breakdown_note}
        </p>
      )}
    </div>
  );
}

/* ── PDF Generation ────────────────────────────────────── */
async function generatePDF(itinerary) {
  const { default: jsPDF } = await import("jspdf");
  const { default: autoTable } = await import("jspdf-autotable");

  const doc = new jsPDF("p", "mm", "a4");
  const W = doc.internal.pageSize.getWidth();
  let y = 15;

  const addPage = () => { doc.addPage(); y = 15; };
  const checkPage = (needed = 30) => { if (y + needed > 275) addPage(); };

  // Title
  doc.setFontSize(20);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(192, 98, 45);
  doc.text(itinerary.title || "Your Sacred Yatra", W / 2, y, { align: "center" });
  y += 8;

  // Summary
  if (itinerary.summary) {
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(100);
    const lines = doc.splitTextToSize(itinerary.summary, W - 30);
    doc.text(lines, W / 2, y, { align: "center" });
    y += lines.length * 5 + 5;
  }

  // Metadata line
  doc.setFontSize(9);
  doc.setTextColor(150);
  const meta = [];
  if (itinerary.days?.length) meta.push(`${itinerary.days.length} Days`);
  if (itinerary.best_season) meta.push(`Best: ${itinerary.best_season}`);
  if (itinerary.total_estimated_hours) meta.push(`~${Math.round(itinerary.total_estimated_hours)}h`);
  doc.text(meta.join("  •  "), W / 2, y, { align: "center" });
  y += 8;

  // Divider
  doc.setDrawColor(212, 160, 23);
  doc.setLineWidth(0.5);
  doc.line(15, y, W - 15, y);
  y += 8;

  // Days
  for (const day of (itinerary.days || [])) {
    checkPage(40);

    // Day header
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(192, 98, 45);
    doc.text(`Day ${day.day} — ${day.city || ""}`, 15, y);
    y += 5;

    if (day.theme) {
      doc.setFontSize(9);
      doc.setFont("helvetica", "italic");
      doc.setTextColor(120);
      doc.text(day.theme, 15, y);
      y += 4;
    }
    if (day.overview) {
      doc.setFontSize(9);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(100);
      const ovLines = doc.splitTextToSize(day.overview, W - 30);
      doc.text(ovLines, 15, y);
      y += ovLines.length * 4 + 3;
    }
    y += 2;

    // Slots table
    const tableData = (day.slots || []).map(slot => {
      const fee = slot.entry_fee > 0 ? `Rs.${slot.entry_fee}` : (slot.is_meal ? "-" : "Free");
      return [
        slot.time || "",
        slot.place || "",
        slot.description ? slot.description.substring(0, 80) + (slot.description.length > 80 ? "..." : "") : "",
        slot.duration_mins ? `${slot.duration_mins}m` : "",
        fee
      ];
    });

    if (tableData.length > 0) {
      autoTable(doc, {
        startY: y,
        head: [["Time", "Place", "Details", "Duration", "Fee"]],
        body: tableData,
        theme: "grid",
        styles: { fontSize: 8, cellPadding: 2, lineColor: [220, 220, 220] },
        headStyles: { fillColor: [192, 98, 45], textColor: 255, fontStyle: "bold", fontSize: 8 },
        columnStyles: {
          0: { cellWidth: 22, fontStyle: "bold" },
          1: { cellWidth: 35, fontStyle: "bold" },
          2: { cellWidth: 75 },
          3: { cellWidth: 18, halign: "center" },
          4: { cellWidth: 18, halign: "center" },
        },
        margin: { left: 15, right: 15 },
      });
      y = doc.lastAutoTable.finalY + 8;
    }
  }

  // Budget
  if (itinerary.budget) {
    checkPage(60);
    doc.setFontSize(13);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(192, 98, 45);
    doc.text("Estimated Budget", 15, y);
    y += 6;

    const b = itinerary.budget;
    const budgetData = [];
    if (b.entry_fees > 0) budgetData.push(["🎫 Entry Fees", `₹${b.entry_fees.toLocaleString("en-IN")}`]);
    if (b.food > 0) budgetData.push(["🍛 Food & Prasadam", `₹${b.food.toLocaleString("en-IN")}`]);
    if (b.transport > 0) budgetData.push(["🚗 Transport", `₹${b.transport.toLocaleString("en-IN")}`]);
    if (b.accommodation > 0) budgetData.push(["🏨 Accommodation", `₹${b.accommodation.toLocaleString("en-IN")}`]);
    if (b.miscellaneous > 0) budgetData.push(["🛍️ Miscellaneous", `₹${b.miscellaneous.toLocaleString("en-IN")}`]);
    budgetData.push(["TOTAL", `₹${b.total.toLocaleString("en-IN")}`]);
    budgetData.push(["Per Person", `₹${(b.per_person || 0).toLocaleString("en-IN")}`]);

    autoTable(doc, {
      startY: y,
      body: budgetData,
      theme: "plain",
      styles: { fontSize: 9, cellPadding: 3 },
      columnStyles: { 0: { cellWidth: 50 }, 1: { cellWidth: 40, halign: "right", fontStyle: "bold" } },
      margin: { left: 15, right: 15 },
      didParseCell: (data) => {
        if (data.row.index === budgetData.length - 2) {
          data.cell.styles.fillColor = [255, 243, 224];
          data.cell.styles.fontStyle = "bold";
          data.cell.styles.fontSize = 11;
        }
      },
    });
    y = doc.lastAutoTable.finalY + 8;
  }

  // Tips
  if (itinerary.tips?.length > 0) {
    checkPage(30);
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(192, 98, 45);
    doc.text("Yatra Tips", 15, y);
    y += 5;
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(80);
    for (const tip of itinerary.tips) {
      checkPage(8);
      const tipLines = doc.splitTextToSize(`• ${tip}`, W - 35);
      doc.text(tipLines, 18, y);
      y += tipLines.length * 4 + 2;
    }
  }

  // Footer
  checkPage(15);
  y += 5;
  doc.setDrawColor(212, 160, 23);
  doc.line(15, y, W - 15, y);
  y += 6;
  doc.setFontSize(8);
  doc.setTextColor(150);
  doc.text("Generated by BrajYatra.AI — Discover the spiritual heart of India", W / 2, y, { align: "center" });

  doc.save(`${(itinerary.title || "BrajYatra-Itinerary").replace(/[^a-zA-Z0-9 ]/g, "").replace(/\s+/g, "_")}.pdf`);
}

/* ── Main ItineraryCard Component ──────────────────────── */
export default function ItineraryCard({ itinerary, onEditItinerary }) {
  const [activeDay, setActiveDay] = useState(0);
  const [saving, setSaving] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [pdfGenerating, setPdfGenerating] = useState(false);
  const [showRecommend, setShowRecommend] = useState(null); // { dayIndex, city }
  const [viewMode, setViewMode] = useState("list"); // "list" | "map"
  const { token } = useAuth();
  const { saveItinerary, fetchSuggestions } = useChat();
  const { dispatch } = useChatContext();
  const [suggestions, setSuggestions] = useState([]);
  const [loadingSugg, setLoadingSugg] = useState(false);

  if (!itinerary) return null;
  const days = itinerary.days || [];
  const weather = itinerary.live_weather;

  const handleSave = async () => {
    setSaving("saving");
    try {
      const res = await saveItinerary(itinerary);
      if (res.success) setSaving("saved");
      else throw new Error(res.error);
    } catch {
      setSaving("error");
      setTimeout(() => setSaving(null), 2500);
    }
  };

  const handlePDF = async () => {
    setPdfGenerating(true);
    try { await generatePDF(itinerary); } catch (e) { console.error("PDF error:", e); }
    setPdfGenerating(false);
  };

  const handleRemoveSlot = useCallback((dayIndex, slot) => {
    const removedPlace = slot.place;
    const city = days[dayIndex]?.city || "";
    const remainingPlaces = days[dayIndex].slots
      .filter(s => isActualPlace(s) && s.place !== removedPlace)
      .map(s => s.place);

    if (onEditItinerary) {
      onEditItinerary({
        action: "remove",
        dayIndex,
        place: removedPlace,
        city,
        remainingPlaces,
        itinerary,
      });
    }
  }, [days, onEditItinerary, itinerary]);

  const handleAddPlace = useCallback(async (dayIndex) => {
    const city = days[dayIndex]?.city || "";
    const existingIds = days[dayIndex].slots
      .filter(s => s.place_id)
      .map(s => s.place_id);

    setShowRecommend({ dayIndex, city });
    setLoadingSugg(true);
    try {
      const sugg = await fetchSuggestions(city, existingIds);
      setSuggestions(sugg);
    } catch { setSuggestions([]); }
    setLoadingSugg(false);
  }, [days, fetchSuggestions]);

  const handleSelectSuggestion = useCallback((place) => {
    if (!showRecommend || !onEditItinerary) return;
    const city = showRecommend.city;
    const existingPlaces = days[showRecommend.dayIndex].slots
      .filter(s => isActualPlace(s))
      .map(s => s.place);

    onEditItinerary({
      action: "add",
      dayIndex: showRecommend.dayIndex,
      place: place.name,
      city,
      existingPlaces: [...existingPlaces, place.name],
      itinerary,
    });
    setShowRecommend(null);
    setSuggestions([]);
  }, [showRecommend, onEditItinerary, days, itinerary]);

  // City route groups
  const cityGroups = {};
  days.forEach((d) => {
    const c = d.city || "Unknown";
    if (!cityGroups[c]) cityGroups[c] = [];
    cityGroups[c].push(d);
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-3xl mx-auto rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] shadow-xl overflow-hidden"
      id="itinerary-card"
    >
      {/* Header */}
      <div className="px-6 py-5 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 border-b border-[var(--color-border)]">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h2 className="text-xl font-extrabold text-[var(--color-text-primary)] flex items-center gap-2">
              🛕 {itinerary.title || "Your Sacred Yatra"}
            </h2>
            {itinerary.summary && (
              <p className="text-sm text-[var(--color-text-secondary)] mt-2 leading-relaxed">{itinerary.summary}</p>
            )}
          </div>
          <div className="flex items-center gap-2 shrink-0 ml-3">
            {/* Map/List toggle */}
            <div className="flex bg-white/50 dark:bg-gray-800/50 border border-[var(--color-border)] rounded-lg overflow-hidden">
              <button
                onClick={() => setViewMode("list")}
                className={`px-2.5 py-1.5 text-xs font-bold transition-all ${
                  viewMode === "list"
                    ? "bg-amber-500 text-white"
                    : "text-[var(--color-text-secondary)] hover:bg-gray-100 dark:hover:bg-gray-700"
                }`}
              >
                📋
              </button>
              <button
                onClick={() => setViewMode("map")}
                className={`px-2.5 py-1.5 text-xs font-bold transition-all ${
                  viewMode === "map"
                    ? "bg-amber-500 text-white"
                    : "text-[var(--color-text-secondary)] hover:bg-gray-100 dark:hover:bg-gray-700"
                }`}
              >
                🗺️
              </button>
            </div>
            {/* Edit toggle */}
            <button
              onClick={() => { setIsEditing(!isEditing); setShowRecommend(null); }}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                isEditing
                  ? "bg-amber-500 text-white shadow-md"
                  : "bg-white/50 dark:bg-gray-800/50 text-[var(--color-text-secondary)] border border-[var(--color-border)] hover:border-amber-500/50"
              }`}
            >
              {isEditing ? "✓ Done" : "✏️ Edit"}
            </button>
          </div>
        </div>
        <div className="flex flex-wrap gap-2 mt-3">
          {days.length > 0 && <span className="text-[11px] px-3 py-1 rounded-full bg-amber-200 dark:bg-amber-900/40 text-amber-900 dark:text-amber-200 font-bold">📅 {days.length} Day{days.length > 1 ? "s" : ""}</span>}
          {itinerary.best_season && <span className="text-[11px] px-3 py-1 rounded-full bg-pink-200 dark:bg-pink-900/40 text-pink-900 dark:text-pink-200 font-bold">🌸 {itinerary.best_season}</span>}
          {itinerary.total_estimated_hours && <span className="text-[11px] px-3 py-1 rounded-full bg-blue-200 dark:bg-blue-900/40 text-blue-900 dark:text-blue-200 font-bold">⏱️ ~{Math.round(itinerary.total_estimated_hours)}h total</span>}
        </div>
      </div>

      {/* Weather Banner */}
      {weather && (
        <div className="px-6 py-3.5 bg-gradient-to-r from-sky-50 to-blue-50 dark:from-sky-900/10 dark:to-blue-900/10 border-b border-[var(--color-border)] flex items-center gap-3">
          <span className="text-2xl">{weather.is_rainy ? "🌧️" : weather.is_hot ? "☀️" : weather.is_cold ? "🥶" : "🌤️"}</span>
          <div>
            <p className="text-sm font-bold text-[var(--color-text-primary)]">{weather.temp}°C · {weather.description} in {weather.city}</p>
            <p className="text-[11px] text-[var(--color-text-secondary)]">💧 {weather.humidity}% · 💨 {weather.wind_speed} m/s · 🌡️ Feels {weather.feels_like}°C</p>
          </div>
        </div>
      )}

      {/* City Route Buttons */}
      {Object.keys(cityGroups).length > 1 && (
        <div className="px-6 py-3 flex flex-wrap gap-2 border-b border-[var(--color-border)]">
          {Object.entries(cityGroups).map(([city, cityDays]) => {
            const stops = cityDays.flatMap((d) =>
              (d.slots || []).filter(isActualPlace).map((s) => `${s.place}, ${city}, India`)
            );
            if (stops.length < 1) return null;
            let url;
            if (stops.length === 1) {
              url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(stops[0])}`;
            } else {
              const origin = encodeURIComponent(stops[0]);
              const dest = encodeURIComponent(stops[stops.length - 1]);
              const wp = stops.slice(1, -1).map(encodeURIComponent).join("|");
              url = `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${dest}&travelmode=driving${wp ? `&waypoints=${wp}` : ""}`;
            }
            return (
              <a key={city} href={url} target="_blank" rel="noopener noreferrer"
                className="text-[12px] px-3.5 py-1.5 rounded-full bg-emerald-200 dark:bg-emerald-900/40 text-emerald-900 dark:text-emerald-200 font-bold hover:bg-emerald-300 dark:hover:bg-emerald-900/50 transition-colors">
                📍 {city} Route
              </a>
            );
          })}
        </div>
      )}

      {/* Day Tabs */}
      {days.length > 0 && (
        <div className="flex overflow-x-auto border-b border-[var(--color-border)] scrollbar-hide">
          {days.map((day, i) => (
            <button
              key={i}
              onClick={() => setActiveDay(i)}
              className={`shrink-0 px-6 py-3 text-sm font-bold transition-all border-b-3 ${
                i === activeDay
                  ? "border-amber-500 text-amber-600 dark:text-amber-400 bg-amber-50/50 dark:bg-amber-900/10"
                  : "border-transparent text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-gray-50 dark:hover:bg-gray-900/20"
              }`}
            >
              Day {day.day || i + 1}
            </button>
          ))}
        </div>
      )}

      {/* Day Content */}
      {viewMode === "map" ? (
        <div className="px-6 py-5">
          <Suspense fallback={
            <div className="flex items-center justify-center h-64">
              <p className="text-sm text-[var(--color-text-secondary)]">Loading map...</p>
            </div>
          }>
            <ItineraryMapView days={days} activeDay={activeDay} />
          </Suspense>
        </div>
      ) : (
        days.map((day, i) => {
          if (i !== activeDay) return null;
          const dayRouteUrl = day.google_maps_url || buildDayRouteUrl(day);
          return (
            <div key={i} className="px-6 py-5">
              {day.overview && <p className="text-sm text-[var(--color-text-secondary)] mb-4 italic leading-relaxed">{day.overview}</p>}
              {dayRouteUrl && (
                <a href={dayRouteUrl} target="_blank" rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-[12px] px-4 py-2 mb-4 rounded-full bg-blue-200 dark:bg-blue-900/40 text-blue-900 dark:text-blue-200 font-bold hover:bg-blue-300 transition-colors">
                  📍 View Day Route on Maps
                </a>
              )}
              <div className="space-y-3">
                {(day.slots || []).map((slot, si) => (
                  <SlotElement key={si} slot={slot} city={day.city} isEditing={isEditing}
                    onRemove={() => handleRemoveSlot(i, slot)} />
                ))}
              </div>

              {/* Add Place Button (edit mode) */}
              {isEditing && (
                <motion.button
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  onClick={() => handleAddPlace(i)}
                  className="w-full mt-4 py-3 rounded-xl border-2 border-dashed border-amber-400/40 text-amber-600 dark:text-amber-400 text-sm font-bold hover:bg-amber-50 dark:hover:bg-amber-900/10 transition-colors"
                >
                  ➕ Add Place to Day {day.day || i + 1}
                </motion.button>
              )}

              {/* Recommendation Panel */}
              <AnimatePresence>
                {showRecommend?.dayIndex === i && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-4 border border-amber-200 dark:border-amber-800 rounded-xl overflow-hidden bg-amber-50/50 dark:bg-amber-900/10"
                  >
                    <div className="px-4 py-3 border-b border-amber-200 dark:border-amber-800 flex items-center justify-between">
                      <h4 className="text-sm font-bold text-amber-700 dark:text-amber-400">🏛️ Recommended Places in {showRecommend.city}</h4>
                      <button onClick={() => { setShowRecommend(null); setSuggestions([]); }}
                        className="text-xs text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]">✕ Close</button>
                    </div>
                    <div className="p-3 space-y-2">
                      {loadingSugg ? (
                        <p className="text-xs text-center py-4 text-[var(--color-text-secondary)]">Loading recommendations...</p>
                      ) : suggestions.length === 0 ? (
                        <p className="text-xs text-center py-4 text-[var(--color-text-secondary)]">No more places to suggest for this day.</p>
                      ) : (
                        suggestions.map((s) => (
                          <button key={s.id || s.name}
                            onClick={() => handleSelectSuggestion(s)}
                            className="w-full flex items-center gap-3 p-3 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] hover:border-amber-500/50 hover:shadow-sm transition-all text-left"
                          >
                            <div className="flex-1">
                              <p className="text-sm font-bold text-[var(--color-text-primary)]">📍 {s.name}</p>
                              <p className="text-[11px] text-[var(--color-text-secondary)] mt-0.5">{s.category} · {s.estimated_visit_duration || 45} min · {s.crowd_level || "moderate"} crowd</p>
                            </div>
                            <span className="text-amber-500 text-lg">+</span>
                          </button>
                        ))
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })
      )}

      {/* Tips */}
      {itinerary.tips?.length > 0 && (
        <div className="px-6 py-5 border-t border-[var(--color-border)]">
          <h3 className="text-base font-bold text-[var(--color-text-primary)] mb-3">🪔 Yatra Tips</h3>
          <ul className="space-y-1.5">
            {itinerary.tips.map((tip, i) => (
              <li key={i} className="text-sm text-[var(--color-text-secondary)] flex gap-2 leading-relaxed">
                <span className="text-amber-500 shrink-0">•</span> {tip}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Budget */}
      {itinerary.budget && (
        <div className="px-6 pb-5">
          <BudgetSection budget={itinerary.budget} />
        </div>
      )}

      {/* Indoor Alternatives */}
      {itinerary.alternate_indoor?.length > 0 && (
        <div className="px-6 py-5 border-t border-[var(--color-border)]">
          <h3 className="text-base font-bold text-[var(--color-text-primary)] mb-3">🌧️ Indoor Alternatives</h3>
          <ul className="space-y-1.5">
            {itinerary.alternate_indoor.map((alt, i) => (
              <li key={i} className="text-sm text-[var(--color-text-secondary)]">• {alt}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Action Buttons */}
      <div className="px-6 py-5 border-t border-[var(--color-border)] flex flex-wrap items-center gap-3">
        {/* Save */}
        {token && (
          <button
            onClick={handleSave}
            disabled={saving === "saving" || saving === "saved"}
            className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${
              saving === "saved"
                ? "bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-300"
                : "bg-gradient-to-r from-amber-500 to-orange-600 text-white hover:shadow-amber-500/30 hover:shadow-md disabled:opacity-50"
            }`}
          >
            {saving === "saving" ? "⏳ Saving..." : saving === "saved" ? "✅ Saved!" : saving === "error" ? "❌ Failed" : "💾 Save Itinerary"}
          </button>
        )}

        {/* PDF Download */}
        <button
          onClick={handlePDF}
          disabled={pdfGenerating}
          className="px-5 py-2.5 rounded-xl text-sm font-bold bg-white dark:bg-gray-800 border border-[var(--color-border)] text-[var(--color-text-primary)] hover:border-amber-500/50 hover:shadow-sm transition-all disabled:opacity-50"
        >
          {pdfGenerating ? "⏳ Generating..." : "📄 Download PDF"}
        </button>

        {saving === "saved" && <span className="text-[11px] text-green-600 dark:text-green-400">Saved to your profile</span>}
      </div>
    </motion.div>
  );
}
