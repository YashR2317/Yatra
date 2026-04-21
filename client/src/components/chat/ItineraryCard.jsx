import React, { useState, useCallback, useMemo, Suspense, lazy, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../../contexts/AuthContext";
import { useChatContext, buildPlaceMapUrl, buildDayRouteUrl, isActualPlace, isMealSlot, getVirtualTourUrl, CITY_IMAGES } from "../../contexts/ChatContext";
import { useChat } from "../../hooks/useChat";
import { DndContext, closestCenter, PointerSensor, TouchSensor, useSensor, useSensors } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy, useSortable, arrayMove } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

const ItineraryMapView = lazy(() => import("./ItineraryMapView"));

/* ── Animated Counter ──────────────────────────────────── */
function AnimatedNumber({ value, prefix = "", suffix = "" }) {
  const [display, setDisplay] = useState(0);
  const ref = useRef(null);

  useEffect(() => {
    if (!value) return;
    const duration = 800;
    const start = performance.now();
    const from = 0;
    const to = value;

    const animate = (now) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
      setDisplay(Math.round(from + (to - from) * eased));
      if (progress < 1) requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
  }, [value]);

  return <span className="count-pop">{prefix}{display.toLocaleString("en-IN")}{suffix}</span>;
}

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

/* ── Trip Statistics Calculator ─────────────────────────── */
function computeTripStats(itinerary) {
  const days = itinerary?.days || [];
  let temples = 0, ghats = 0, monuments = 0, meals = 0, totalPlaces = 0;
  let totalMins = 0, totalEntryFee = 0, totalTravelCost = 0;

  days.forEach((day) => {
    (day.slots || []).forEach((slot) => {
      if (isMealSlot(slot)) { meals++; return; }
      if (!isActualPlace(slot)) return;
      totalPlaces++;
      totalMins += slot.duration_mins || 45;
      totalEntryFee += slot.entry_fee || 0;
      totalTravelCost += slot.travel_cost_from_previous || 0;
      const name = (slot.place || "").toLowerCase();
      const cat = (slot.category || "").toLowerCase();
      if (name.includes("temple") || name.includes("mandir") || cat.includes("temple") || cat.includes("religious")) temples++;
      else if (name.includes("ghat") || cat.includes("ghat")) ghats++;
      else if (name.includes("fort") || name.includes("tomb") || name.includes("mahal") || cat.includes("monument") || cat.includes("heritage")) monuments++;
    });
  });

  return { temples, ghats, monuments, meals, totalPlaces, totalMins, totalEntryFee, totalTravelCost, days: days.length };
}

/* ── Trip Stats Bar ────────────────────────────────────── */
function TripStatsBar({ stats }) {
  const items = [
    { icon: "🛕", label: "Temples", value: stats.temples, color: "text-amber-600 dark:text-amber-400" },
    { icon: "🌊", label: "Ghats", value: stats.ghats, color: "text-blue-600 dark:text-blue-400" },
    { icon: "🏛️", label: "Monuments", value: stats.monuments, color: "text-purple-600 dark:text-purple-400" },
    { icon: "🍛", label: "Meals", value: stats.meals, color: "text-green-600 dark:text-green-400" },
    { icon: "📍", label: "Places", value: stats.totalPlaces, color: "text-orange-600 dark:text-orange-400" },
  ].filter((item) => item.value > 0);

  return (
    <div className="flex items-center gap-3 overflow-x-auto scrollbar-hide py-2">
      {items.map((item, i) => (
        <motion.div
          key={item.label}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 + i * 0.1 }}
          className="flex items-center gap-1.5 shrink-0"
        >
          <span className="text-base">{item.icon}</span>
          <span className={`text-lg font-extrabold ${item.color}`}>
            <AnimatedNumber value={item.value} />
          </span>
          <span className="text-[9px] text-white/70 font-medium">{item.label}</span>
        </motion.div>
      ))}
    </div>
  );
}

/* ── Category Distribution Donut (CSS-only) ────────────── */
function CategoryDonut({ stats }) {
  const total = stats.temples + stats.ghats + stats.monuments + Math.max(stats.totalPlaces - stats.temples - stats.ghats - stats.monuments, 0);
  if (total === 0) return null;
  const segments = [
    { label: "Temples", value: stats.temples, color: "#f59e0b" },
    { label: "Ghats", value: stats.ghats, color: "#3b82f6" },
    { label: "Monuments", value: stats.monuments, color: "#8b5cf6" },
    { label: "Other", value: Math.max(stats.totalPlaces - stats.temples - stats.ghats - stats.monuments, 0), color: "#10b981" },
  ].filter((s) => s.value > 0);

  let cumPercent = 0;
  const gradientStops = segments.map((seg) => {
    const start = cumPercent;
    cumPercent += (seg.value / total) * 100;
    return `${seg.color} ${start}% ${cumPercent}%`;
  }).join(", ");

  return (
    <div className="flex items-center gap-4">
      <div
        className="w-16 h-16 rounded-full shrink-0"
        style={{ background: `conic-gradient(${gradientStops})` }}
      >
        <div className="w-10 h-10 rounded-full bg-[var(--color-surface)] m-3" />
      </div>
      <div className="space-y-1">
        {segments.map((seg) => (
          <div key={seg.label} className="flex items-center gap-2 text-[11px]">
            <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ background: seg.color }} />
            <span className="text-[var(--color-text-secondary)]">{seg.label}</span>
            <span className="font-bold text-[var(--color-text-primary)]">{seg.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Sortable Slot Wrapper ─────────────────────────────── */
function SortableSlot({ id, slot, city, isEditing, onRemove }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : undefined,
    opacity: isDragging ? 0.8 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} className="relative">
      {isEditing && (
        <button
          {...attributes}
          {...listeners}
          className="absolute -left-2 top-1/2 -translate-y-1/2 w-6 h-8 flex items-center justify-center text-[var(--color-text-secondary)] hover:text-amber-600 cursor-grab active:cursor-grabbing z-10 opacity-60 hover:opacity-100 transition-opacity"
          title="Drag to reorder"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
            <circle cx="9" cy="5" r="1.5" /><circle cx="15" cy="5" r="1.5" />
            <circle cx="9" cy="12" r="1.5" /><circle cx="15" cy="12" r="1.5" />
            <circle cx="9" cy="19" r="1.5" /><circle cx="15" cy="19" r="1.5" />
          </svg>
        </button>
      )}
      <SlotElement slot={slot} city={city} isEditing={isEditing} onRemove={onRemove} />
    </div>
  );
}

/* ── Single Slot Element ───────────────────────────────── */
function SlotElement({ slot, city, isEditing, onRemove }) {
  const [expanded, setExpanded] = useState(false);
  const meal = isMealSlot(slot);
  const place = isActualPlace(slot);
  const travel = !place && !meal;
  const mapUrl = place ? (slot.google_maps_url || buildPlaceMapUrl(slot.place, city)) : "";
  const vrTourUrl = place ? getVirtualTourUrl(slot.place) : null;
  const hasDetails = slot.description || slot.tip;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      className={`flex gap-4 py-4 px-4 rounded-xl border transition-all relative group cursor-pointer
      ${meal ? "border-green-500/20 bg-green-50/80 dark:bg-green-900/15" :
        travel ? "border-transparent bg-transparent opacity-70" :
        "border-[var(--color-border)] bg-[var(--color-surface)] hover:border-amber-400/40 hover:shadow-md"}`}
      onClick={() => hasDetails && setExpanded(!expanded)}
    >
      {/* Remove button (edit mode) */}
      {isEditing && place && (
        <button
          onClick={(e) => { e.stopPropagation(); onRemove?.(slot); }}
          className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-red-500 text-white text-xs flex items-center justify-center shadow-md hover:bg-red-600 transition-colors z-10"
          title="Remove this place"
        >✕</button>
      )}

      {/* Time Column */}
      <div className="shrink-0 w-24 text-right pt-0.5">
        <p className="text-sm font-extrabold text-[#7c3a0a] dark:text-amber-300 tracking-tight">{slot.time || ""}</p>
        <p className="text-[11px] text-[var(--color-text-secondary)] font-semibold capitalize">{slot.period || ""}</p>
      </div>

      {/* Timeline dot */}
      <div className="flex flex-col items-center pt-1.5">
        <div className={`w-3.5 h-3.5 rounded-full border-2 transition-all ${
          meal ? "border-green-500 bg-green-200" :
          place ? "border-amber-500 bg-amber-200 group-hover:scale-125 group-hover:shadow-amber-500/30 group-hover:shadow-md" :
          "border-gray-300 bg-gray-100"
        }`} />
        <div className="w-0.5 flex-1 bg-gradient-to-b from-amber-200 to-transparent dark:from-amber-800 mt-1" />
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          {mapUrl ? (
            <a href={mapUrl} target="_blank" rel="noopener noreferrer"
              className="text-base font-bold text-[#5b2c0e] dark:text-amber-300 hover:underline decoration-2 underline-offset-2"
              onClick={(e) => e.stopPropagation()}>
              📍 {slot.place}
            </a>
          ) : (
            <span className="text-base font-semibold text-[var(--color-text-primary)]">
              {meal ? "🍛 " : travel ? "🚗 " : ""}{slot.place}
            </span>
          )}
          {vrTourUrl && (
            <a href={vrTourUrl} target="_blank" rel="noopener noreferrer"
              className="text-[11px] px-2.5 py-0.5 rounded-full bg-purple-200 dark:bg-purple-900/40 text-purple-900 dark:text-purple-200 font-semibold hover:bg-purple-300 transition-colors"
              onClick={(e) => e.stopPropagation()}>
              🔮 360° Tour
            </a>
          )}
          {/* Expand indicator */}
          {hasDetails && (
            <motion.svg
              animate={{ rotate: expanded ? 180 : 0 }}
              width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
              className="text-[var(--color-text-secondary)] opacity-40 ml-auto"
            >
              <polyline points="6 9 12 15 18 9" />
            </motion.svg>
          )}
        </div>

        {/* Tags Row — always visible */}
        <div className="flex flex-wrap gap-2 mt-2">
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

        {/* Expandable content */}
        <AnimatePresence>
          {expanded && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              {slot.description && (
                <p className="text-sm text-[var(--color-text-secondary)] mt-2 leading-relaxed">{slot.description}</p>
              )}
              {slot.tip && slot.tip.toLowerCase().includes("crowd") && (
                <div className="mt-2">
                  <CrowdBadge level={slot.tip.replace(/crowd level:?\s*/i, "").trim()} />
                </div>
              )}
              {slot.tip && !slot.tip.toLowerCase().includes("crowd") && (
                <p className="text-[12px] text-[#5b2c0e] dark:text-amber-200 mt-2 bg-orange-100 dark:bg-amber-900/25 px-3 py-1.5 rounded-lg font-semibold">
                  💡 {slot.tip}
                </p>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
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

      {/* Total — animated count up */}
      <div className="text-center mb-5 py-4 rounded-xl glass border border-amber-200 dark:border-amber-800/30">
        <p className="text-[11px] text-[var(--color-text-secondary)] uppercase tracking-wider font-semibold">Total Estimated Cost</p>
        <p className="text-3xl font-extrabold text-amber-600 dark:text-amber-400 mt-1">
          <AnimatedNumber value={budget.total} prefix="₹" />
        </p>
        <p className="text-sm text-[var(--color-text-secondary)] mt-1">
          <AnimatedNumber value={budget.per_person || 0} prefix="₹" /> per person
        </p>
      </div>

      {/* Progress bar */}
      <div className="flex h-3 rounded-full overflow-hidden mb-4 shadow-inner bg-gray-100 dark:bg-gray-800">
        {parts.map((p) => (
          <motion.div
            key={p.label}
            initial={{ width: 0 }}
            animate={{ width: `${(p.value / budget.total * 100).toFixed(1)}%` }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            style={{ background: p.color }}
            title={`${p.label}: ₹${p.value.toLocaleString("en-IN")}`}
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

  doc.setFontSize(20);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(192, 98, 45);
  doc.text(itinerary.title || "Your Sacred Yatra", W / 2, y, { align: "center" });
  y += 8;

  if (itinerary.summary) {
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(100);
    const lines = doc.splitTextToSize(itinerary.summary, W - 30);
    doc.text(lines, W / 2, y, { align: "center" });
    y += lines.length * 5 + 5;
  }

  doc.setFontSize(9);
  doc.setTextColor(150);
  const meta = [];
  if (itinerary.days?.length) meta.push(`${itinerary.days.length} Days`);
  if (itinerary.best_season) meta.push(`Best: ${itinerary.best_season}`);
  if (itinerary.total_estimated_hours) meta.push(`~${Math.round(itinerary.total_estimated_hours)}h`);
  doc.text(meta.join("  •  "), W / 2, y, { align: "center" });
  y += 8;

  doc.setDrawColor(212, 160, 23);
  doc.setLineWidth(0.5);
  doc.line(15, y, W - 15, y);
  y += 8;

  for (const day of (itinerary.days || [])) {
    checkPage(40);
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(192, 98, 45);
    doc.text(`Day ${day.day} — ${day.city || ""}`, 15, y);
    y += 5;
    if (day.theme) { doc.setFontSize(9); doc.setFont("helvetica", "italic"); doc.setTextColor(120); doc.text(day.theme, 15, y); y += 4; }
    if (day.overview) { doc.setFontSize(9); doc.setFont("helvetica", "normal"); doc.setTextColor(100); const ovLines = doc.splitTextToSize(day.overview, W - 30); doc.text(ovLines, 15, y); y += ovLines.length * 4 + 3; }
    y += 2;

    const tableData = (day.slots || []).map(slot => {
      const fee = slot.entry_fee > 0 ? `Rs.${slot.entry_fee}` : (slot.is_meal ? "-" : "Free");
      return [slot.time || "", slot.place || "", slot.description ? slot.description.substring(0, 80) + (slot.description.length > 80 ? "..." : "") : "", slot.duration_mins ? `${slot.duration_mins}m` : "", fee];
    });

    if (tableData.length > 0) {
      autoTable(doc, {
        startY: y, head: [["Time", "Place", "Details", "Duration", "Fee"]], body: tableData, theme: "grid",
        styles: { fontSize: 8, cellPadding: 2, lineColor: [220, 220, 220] },
        headStyles: { fillColor: [192, 98, 45], textColor: 255, fontStyle: "bold", fontSize: 8 },
        columnStyles: { 0: { cellWidth: 22, fontStyle: "bold" }, 1: { cellWidth: 35, fontStyle: "bold" }, 2: { cellWidth: 75 }, 3: { cellWidth: 18, halign: "center" }, 4: { cellWidth: 18, halign: "center" } },
        margin: { left: 15, right: 15 },
      });
      y = doc.lastAutoTable.finalY + 8;
    }
  }

  if (itinerary.budget) {
    checkPage(60);
    doc.setFontSize(13); doc.setFont("helvetica", "bold"); doc.setTextColor(192, 98, 45);
    doc.text("Estimated Budget", 15, y); y += 6;
    const b = itinerary.budget;
    const budgetData = [];
    if (b.entry_fees > 0) budgetData.push(["Entry Fees", `₹${b.entry_fees.toLocaleString("en-IN")}`]);
    if (b.food > 0) budgetData.push(["Food & Prasadam", `₹${b.food.toLocaleString("en-IN")}`]);
    if (b.transport > 0) budgetData.push(["Transport", `₹${b.transport.toLocaleString("en-IN")}`]);
    if (b.accommodation > 0) budgetData.push(["Accommodation", `₹${b.accommodation.toLocaleString("en-IN")}`]);
    if (b.miscellaneous > 0) budgetData.push(["Miscellaneous", `₹${b.miscellaneous.toLocaleString("en-IN")}`]);
    budgetData.push(["TOTAL", `₹${b.total.toLocaleString("en-IN")}`]);
    budgetData.push(["Per Person", `₹${(b.per_person || 0).toLocaleString("en-IN")}`]);

    autoTable(doc, {
      startY: y, body: budgetData, theme: "plain", styles: { fontSize: 9, cellPadding: 3 },
      columnStyles: { 0: { cellWidth: 50 }, 1: { cellWidth: 40, halign: "right", fontStyle: "bold" } },
      margin: { left: 15, right: 15 },
      didParseCell: (data) => { if (data.row.index === budgetData.length - 2) { data.cell.styles.fillColor = [255, 243, 224]; data.cell.styles.fontStyle = "bold"; data.cell.styles.fontSize = 11; } },
    });
    y = doc.lastAutoTable.finalY + 8;
  }

  if (itinerary.tips?.length > 0) {
    checkPage(30);
    doc.setFontSize(12); doc.setFont("helvetica", "bold"); doc.setTextColor(192, 98, 45);
    doc.text("Yatra Tips", 15, y); y += 5;
    doc.setFontSize(9); doc.setFont("helvetica", "normal"); doc.setTextColor(80);
    for (const tip of itinerary.tips) { checkPage(8); const tipLines = doc.splitTextToSize(`• ${tip}`, W - 35); doc.text(tipLines, 18, y); y += tipLines.length * 4 + 2; }
  }

  checkPage(15); y += 5;
  doc.setDrawColor(212, 160, 23); doc.line(15, y, W - 15, y); y += 6;
  doc.setFontSize(8); doc.setTextColor(150);
  doc.text("Generated by BrajYatra.AI — Discover the spiritual heart of India", W / 2, y, { align: "center" });
  doc.save(`${(itinerary.title || "BrajYatra-Itinerary").replace(/[^a-zA-Z0-9 ]/g, "").replace(/\s+/g, "_")}.pdf`);
}

/* ── WhatsApp Share ────────────────────────────────────── */
function shareToWhatsApp(itinerary) {
  const days = itinerary.days || [];
  let text = `🛕 *${itinerary.title || "My Sacred Yatra"}*\n\n`;
  if (itinerary.summary) text += `${itinerary.summary}\n\n`;
  days.forEach((day) => {
    text += `📅 *Day ${day.day} — ${day.city || ""}*\n`;
    (day.slots || []).filter(isActualPlace).forEach((s) => {
      text += `  ⏰ ${s.time || ""} — ${s.place}\n`;
    });
    text += "\n";
  });
  if (itinerary.budget?.total) {
    text += `💰 *Estimated Budget:* ₹${itinerary.budget.total.toLocaleString("en-IN")}\n`;
  }
  text += "\n_Generated by BrajYatra.AI_ 🪷";
  window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank");
}

/* ── Share as text ─────────────────────────────────────── */
async function shareAsText(itinerary) {
  const days = itinerary.days || [];
  let text = `🛕 ${itinerary.title || "My Sacred Yatra"}\n\n`;
  days.forEach((day) => {
    text += `Day ${day.day} — ${day.city || ""}\n`;
    (day.slots || []).filter(isActualPlace).forEach((s) => {
      text += `  ${s.time || ""} — ${s.place}\n`;
    });
    text += "\n";
  });
  if (itinerary.budget?.total) text += `Budget: ₹${itinerary.budget.total.toLocaleString("en-IN")}\n`;

  if (navigator.share) {
    try { await navigator.share({ title: itinerary.title || "My Yatra", text }); } catch {}
  } else {
    await navigator.clipboard.writeText(text);
  }
}

/* ── Main ItineraryCard Component ──────────────────────── */
export default function ItineraryCard({ itinerary, onEditItinerary }) {
  const [activeDay, setActiveDay] = useState(0);
  const [saving, setSaving] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [pdfGenerating, setPdfGenerating] = useState(false);
  const [showRecommend, setShowRecommend] = useState(null);
  const [viewMode, setViewMode] = useState("list");
  const [tipsExpanded, setTipsExpanded] = useState(false);
  const [insightsExpanded, setInsightsExpanded] = useState(false);
  const [undoAction, setUndoAction] = useState(null); // { timer, label }
  const { token } = useAuth();
  const { saveItinerary, fetchSuggestions } = useChat();
  const { dispatch } = useChatContext();
  const [suggestions, setSuggestions] = useState([]);
  const [loadingSugg, setLoadingSugg] = useState(false);
  const tabIndicatorRef = useRef(null);

  // DnD sensors
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 5 } }),
  );

  // Confetti on first render (itinerary just generated)
  const confettiRef = useRef(false);
  useEffect(() => {
    if (itinerary && !confettiRef.current) {
      confettiRef.current = true;
      import("canvas-confetti").then(({ default: confetti }) => {
        confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 }, colors: ["#f59e0b", "#ea580c", "#ef4444", "#f97316"] });
      }).catch(() => {});
    }
  }, [itinerary]);

  if (!itinerary) return null;
  const days = itinerary.days || [];
  const weather = itinerary.live_weather;

  // Trip statistics
  const tripStats = useMemo(() => computeTripStats(itinerary), [itinerary]);

  // Get header image from first city
  const headerCity = days[0]?.city || "";
  const headerImage = CITY_IMAGES[headerCity] || "/images/places/krishna_janmabhoomi.avif";

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
    const remainingPlaces = days[dayIndex].slots.filter(s => isActualPlace(s) && s.place !== removedPlace).map(s => s.place);
    if (onEditItinerary) {
      onEditItinerary({ action: "remove", dayIndex, place: removedPlace, city, remainingPlaces, itinerary });
    }
  }, [days, onEditItinerary, itinerary]);

  const handleAddPlace = useCallback(async (dayIndex) => {
    const city = days[dayIndex]?.city || "";
    const existingIds = days[dayIndex].slots.filter(s => s.place_id).map(s => s.place_id);
    setShowRecommend({ dayIndex, city });
    setLoadingSugg(true);
    try { const sugg = await fetchSuggestions(city, existingIds); setSuggestions(sugg); } catch { setSuggestions([]); }
    setLoadingSugg(false);
  }, [days, fetchSuggestions]);

  const handleSelectSuggestion = useCallback((place) => {
    if (!showRecommend || !onEditItinerary) return;
    const city = showRecommend.city;
    const existingPlaces = days[showRecommend.dayIndex].slots.filter(s => isActualPlace(s)).map(s => s.place);
    onEditItinerary({ action: "add", dayIndex: showRecommend.dayIndex, place: place.name, city, existingPlaces: [...existingPlaces, place.name], itinerary });
    setShowRecommend(null);
    setSuggestions([]);
  }, [showRecommend, onEditItinerary, days, itinerary]);

  // City route groups
  const cityGroups = {};
  days.forEach((d) => { const c = d.city || "Unknown"; if (!cityGroups[c]) cityGroups[c] = []; cityGroups[c].push(d); });

  // Place count for progress
  const activeDayPlaces = days[activeDay]?.slots?.filter(isActualPlace) || [];

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-3xl mx-auto rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] shadow-xl overflow-hidden"
      id="itinerary-card"
    >
      {/* Hero Header with parallax image */}
      <div className="relative h-36 sm:h-44 overflow-hidden">
        <img
          src={headerImage}
          alt={headerCity}
          className="w-full h-full object-cover"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-5">
          <div className="flex items-end justify-between">
            <div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-white drop-shadow-lg flex items-center gap-2">
                🛕 {itinerary.title || "Your Sacred Yatra"}
              </h2>
              {itinerary.summary && (
                <p className="text-xs text-white/80 mt-1 max-w-md leading-relaxed line-clamp-2">{itinerary.summary}</p>
              )}
            </div>
            <div className="flex items-center gap-2 shrink-0">
              {/* View toggle */}
              <div className="flex glass rounded-lg overflow-hidden">
                <button
                  onClick={() => setViewMode("list")}
                  className={`px-2.5 py-1.5 text-xs font-bold transition-all ${viewMode === "list" ? "bg-amber-500 text-white" : "text-white/70 hover:text-white"}`}
                >📋</button>
                <button
                  onClick={() => setViewMode("map")}
                  className={`px-2.5 py-1.5 text-xs font-bold transition-all ${viewMode === "map" ? "bg-amber-500 text-white" : "text-white/70 hover:text-white"}`}
                >🗺️</button>
              </div>
              {/* Edit toggle */}
              <button
                onClick={() => { setIsEditing(!isEditing); setShowRecommend(null); }}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  isEditing ? "bg-amber-500 text-white" : "glass text-white/80 hover:text-white"
                }`}
              >{isEditing ? "✓ Done" : "✏️ Edit"}</button>
            </div>
          </div>
          {/* Meta badges */}
          <div className="flex flex-wrap gap-2 mt-2">
            {days.length > 0 && <span className="text-[10px] px-2.5 py-0.5 rounded-full glass text-white font-bold">📅 {days.length} Day{days.length > 1 ? "s" : ""}</span>}
            {itinerary.best_season && <span className="text-[10px] px-2.5 py-0.5 rounded-full glass text-white font-bold">🌸 {itinerary.best_season}</span>}
            {itinerary.total_estimated_hours && <span className="text-[10px] px-2.5 py-0.5 rounded-full glass text-white font-bold">⏱️ ~{Math.round(itinerary.total_estimated_hours)}h</span>}
          </div>
          {/* Animated stat counters */}
          <TripStatsBar stats={tripStats} />
        </div>
      </div>

      {/* Weather Banner */}
      {weather && (
        <div className="px-6 py-3 bg-gradient-to-r from-sky-50 to-blue-50 dark:from-sky-900/10 dark:to-blue-900/10 border-b border-[var(--color-border)] flex items-center gap-3">
          <span className="text-2xl" style={weather.is_rainy ? { animation: "rain-drop 1s ease-in-out infinite" } : weather.is_hot ? { animation: "sun-ray 4s linear infinite" } : {}}>
            {weather.is_rainy ? "🌧️" : weather.is_hot ? "☀️" : weather.is_cold ? "🥶" : "🌤️"}
          </span>
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
            const stops = cityDays.flatMap((d) => (d.slots || []).filter(isActualPlace).map((s) => `${s.place}, ${city}, India`));
            if (stops.length < 1) return null;
            let url;
            if (stops.length === 1) url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(stops[0])}`;
            else {
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

      {/* Day Tabs — pill style with sliding indicator */}
      {days.length > 0 && (
        <div className="relative flex overflow-x-auto border-b border-[var(--color-border)] scrollbar-hide px-2">
          {days.map((day, i) => (
            <button
              key={i}
              onClick={() => setActiveDay(i)}
              className={`shrink-0 px-5 py-3 text-sm font-bold transition-all rounded-t-lg mx-0.5 ${
                i === activeDay
                  ? "text-amber-600 dark:text-amber-400 bg-amber-50/80 dark:bg-amber-900/10"
                  : "text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-gray-50 dark:hover:bg-gray-900/20"
              }`}
            >
              Day {day.day || i + 1}
              {day.city && <span className="text-[9px] ml-1 opacity-60">· {day.city}</span>}
            </button>
          ))}
        </div>
      )}

      {/* Day Content */}
      {viewMode === "map" ? (
        <div className="px-6 py-5">
          <Suspense fallback={<div className="flex items-center justify-center h-64"><p className="text-sm text-[var(--color-text-secondary)]">Loading map...</p></div>}>
            <ItineraryMapView days={days} activeDay={activeDay} />
          </Suspense>
        </div>
      ) : (
        days.map((day, i) => {
          if (i !== activeDay) return null;
          const dayRouteUrl = day.google_maps_url || buildDayRouteUrl(day);
          return (
            <div key={i} className="px-6 py-5">
              {/* Day overview + progress */}
              <div className="flex items-center justify-between mb-4">
                {day.overview && <p className="text-sm text-[var(--color-text-secondary)] italic leading-relaxed flex-1">{day.overview}</p>}
                <span className="text-[10px] text-[var(--color-text-secondary)] font-bold bg-amber-50 dark:bg-amber-900/10 px-2.5 py-1 rounded-full shrink-0 ml-3">
                  📍 {activeDayPlaces.length} places
                </span>
              </div>

              {dayRouteUrl && (
                <a href={dayRouteUrl} target="_blank" rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-[12px] px-4 py-2 mb-4 rounded-full bg-blue-200 dark:bg-blue-900/40 text-blue-900 dark:text-blue-200 font-bold hover:bg-blue-300 transition-colors">
                  📍 View Day Route on Maps
                </a>
              )}

              <DndContext sensors={sensors} collisionDetection={closestCenter}
                onDragEnd={(event) => {
                  const { active, over } = event;
                  if (!over || active.id === over.id) return;
                  const slots = [...(day.slots || [])];
                  const oldIdx = slots.findIndex((_, idx) => `slot-${i}-${idx}` === active.id);
                  const newIdx = slots.findIndex((_, idx) => `slot-${i}-${idx}` === over.id);
                  if (oldIdx !== -1 && newIdx !== -1) {
                    const newSlots = arrayMove(slots, oldIdx, newIdx);
                    dispatch({ type: "UPDATE_ITINERARY_SLOT", payload: { dayIdx: i, slots: newSlots } });
                  }
                }}
              >
                <SortableContext items={(day.slots || []).map((_, si) => `slot-${i}-${si}`)} strategy={verticalListSortingStrategy}>
                  <div className="space-y-2">
                    {(day.slots || []).map((slot, si) => (
                      <SortableSlot
                        key={`slot-${i}-${si}`}
                        id={`slot-${i}-${si}`}
                        slot={slot}
                        city={day.city}
                        isEditing={isEditing}
                        onRemove={() => handleRemoveSlot(i, slot)}
                      />
                    ))}
                  </div>
                </SortableContext>
              </DndContext>

              {/* Add Place Button (edit mode) */}
              {isEditing && (
                <motion.button
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }}
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
                    initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
                    className="mt-4 border border-amber-200 dark:border-amber-800 rounded-xl overflow-hidden bg-amber-50/50 dark:bg-amber-900/10"
                  >
                    <div className="px-4 py-3 border-b border-amber-200 dark:border-amber-800 flex items-center justify-between">
                      <h4 className="text-sm font-bold text-amber-700 dark:text-amber-400">🏛️ Recommended Places in {showRecommend.city}</h4>
                      <button onClick={() => { setShowRecommend(null); setSuggestions([]); }}
                        className="text-xs text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]">✕</button>
                    </div>
                    <div className="p-3 space-y-2">
                      {loadingSugg ? (
                        <p className="text-xs text-center py-4 text-[var(--color-text-secondary)]">Loading…</p>
                      ) : suggestions.length === 0 ? (
                        <p className="text-xs text-center py-4 text-[var(--color-text-secondary)]">No more places to suggest.</p>
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
                            <span className="text-amber-500 text-lg font-bold">+</span>
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

      {/* Trip Insights — Collapsible */}
      <div className="px-6 py-4 border-t border-[var(--color-border)]">
        <button
          onClick={() => setInsightsExpanded(!insightsExpanded)}
          className="w-full flex items-center justify-between text-base font-bold text-[var(--color-text-primary)]"
        >
          <span>📊 Trip Insights</span>
          <motion.svg
            animate={{ rotate: insightsExpanded ? 180 : 0 }}
            width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
          >
            <polyline points="6 9 12 15 18 9" />
          </motion.svg>
        </button>
        <AnimatePresence>
          {insightsExpanded && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden mt-4 space-y-4"
            >
              <div className="grid grid-cols-2 gap-4">
                <CategoryDonut stats={tripStats} />
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-[var(--color-text-secondary)]">⏱️ Total visit time</span>
                    <span className="font-bold text-[var(--color-text-primary)]">{Math.round(tripStats.totalMins / 60)}h {tripStats.totalMins % 60}m</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-[var(--color-text-secondary)]">🎫 Entry fees</span>
                    <span className="font-bold text-[var(--color-text-primary)]">₹{tripStats.totalEntryFee.toLocaleString("en-IN")}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-[var(--color-text-secondary)]">🚗 Travel costs</span>
                    <span className="font-bold text-[var(--color-text-primary)]">₹{tripStats.totalTravelCost.toLocaleString("en-IN")}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-[var(--color-text-secondary)]">📅 Days</span>
                    <span className="font-bold text-[var(--color-text-primary)]">{tripStats.days}</span>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Tips — Accordion */}
      {itinerary.tips?.length > 0 && (
        <div className="px-6 py-4 border-t border-[var(--color-border)]">
          <button
            onClick={() => setTipsExpanded(!tipsExpanded)}
            className="w-full flex items-center justify-between text-base font-bold text-[var(--color-text-primary)]"
          >
            <span>🪔 Yatra Tips ({itinerary.tips.length})</span>
            <motion.svg
              animate={{ rotate: tipsExpanded ? 180 : 0 }}
              width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
            >
              <polyline points="6 9 12 15 18 9" />
            </motion.svg>
          </button>
          <AnimatePresence>
            {tipsExpanded && (
              <motion.ul
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-1.5 mt-3 overflow-hidden"
              >
                {itinerary.tips.map((tip, i) => (
                  <li key={i} className="text-sm text-[var(--color-text-secondary)] flex gap-2 leading-relaxed">
                    <span className="text-amber-500 shrink-0">•</span> {tip}
                  </li>
                ))}
              </motion.ul>
            )}
          </AnimatePresence>
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
                : "bg-gradient-to-r from-amber-500 to-orange-600 text-white hover:shadow-lg hover:shadow-amber-500/25 disabled:opacity-50"
            }`}
          >
            {saving === "saving" ? "⏳ Saving..." : saving === "saved" ? "✅ Saved!" : saving === "error" ? "❌ Failed" : "💾 Save"}
          </button>
        )}

        {/* PDF Download */}
        <button
          onClick={handlePDF}
          disabled={pdfGenerating}
          className="px-5 py-2.5 rounded-xl text-sm font-bold bg-white dark:bg-gray-800 border border-[var(--color-border)] text-[var(--color-text-primary)] hover:border-amber-500/50 hover:shadow-sm transition-all disabled:opacity-50"
        >
          {pdfGenerating ? "⏳ Generating..." : "📄 PDF"}
        </button>

        {/* WhatsApp Share */}
        <button
          onClick={() => shareToWhatsApp(itinerary)}
          className="px-5 py-2.5 rounded-xl text-sm font-bold text-white transition-all hover:shadow-md"
          style={{ background: "#25D366" }}
        >
          💬 WhatsApp
        </button>

        {/* Share / Copy */}
        <button
          onClick={() => shareAsText(itinerary)}
          className="px-5 py-2.5 rounded-xl text-sm font-bold bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 hover:bg-blue-200 transition-all"
        >
          🔗 Share
        </button>

        {saving === "saved" && <span className="text-[11px] text-green-600 dark:text-green-400">Saved to your profile</span>}
      </div>
    </motion.div>
  );
}
