import React, { useState, useEffect, useRef, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useChatContext } from "../../contexts/ChatContext";

const AGENT_META = {
  SupervisorAgent: { icon: "🧠", label: "Analyzing request", color: "from-violet-400 to-purple-500" },
  WeatherAgent: { icon: "🌤️", label: "Checking weather", color: "from-sky-400 to-blue-500" },
  ItineraryAgent: { icon: "🗺️", label: "Planning itinerary", color: "from-amber-400 to-orange-500" },
  RecommenderAgent: { icon: "📍", label: "Finding places", color: "from-emerald-400 to-green-500" },
  ChatAgent: { icon: "💬", label: "Composing response", color: "from-pink-400 to-rose-500" },
  BudgetAgent: { icon: "💰", label: "Estimating costs", color: "from-yellow-400 to-amber-500" },
  SearchAgent: { icon: "🔍", label: "Searching web", color: "from-cyan-400 to-teal-500" },
};

const FALLBACK_STAGES = [
  { icon: "🙏", text: "Understanding your query…" },
  { icon: "📜", text: "Consulting sacred texts…" },
  { icon: "🛕", text: "Exploring tirth sthals…" },
  { icon: "✨", text: "Crafting your response…" },
  { icon: "🪷", text: "Gathering divine wisdom…" },
];

function AgentPipelineStep({ agent, index, isActive, isComplete }) {
  const meta = AGENT_META[agent.name] || { icon: "⚙️", label: agent.name, color: "from-gray-400 to-gray-500" };

  return (
    <motion.div
      initial={{ opacity: 0, x: -12 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.15, duration: 0.3 }}
      className={`flex items-center gap-2.5 px-3 py-2 rounded-xl transition-all ${
        isActive
          ? "bg-amber-50 dark:bg-amber-900/15 border border-amber-200 dark:border-amber-800/40 shadow-sm"
          : isComplete
          ? "opacity-60"
          : "opacity-30"
      }`}
    >
      {/* Status indicator */}
      <div className="relative shrink-0">
        {isActive ? (
          <motion.div
            className={`w-7 h-7 rounded-full bg-gradient-to-br ${meta.color} flex items-center justify-center text-xs shadow-md`}
            animate={{ scale: [1, 1.15, 1] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
          >
            {meta.icon}
          </motion.div>
        ) : isComplete ? (
          <div className="w-7 h-7 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center text-xs">
            ✓
          </div>
        ) : (
          <div className="w-7 h-7 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-xs opacity-50">
            {meta.icon}
          </div>
        )}
        {/* Pulse ring for active */}
        {isActive && (
          <motion.div
            className={`absolute inset-0 rounded-full bg-gradient-to-br ${meta.color} opacity-30`}
            animate={{ scale: [1, 1.8], opacity: [0.3, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          />
        )}
      </div>

      {/* Label + elapsed */}
      <div className="flex-1 min-w-0">
        <p className={`text-[11px] font-semibold ${isActive ? "text-[var(--color-text-primary)]" : "text-[var(--color-text-secondary)]"}`}>
          {meta.label}
        </p>
        {agent.elapsed > 0 && (
          <p className="text-[9px] text-[var(--color-text-secondary)]">{agent.elapsed}s</p>
        )}
      </div>

      {/* Connecting line */}
      {isActive && (
        <motion.div
          className="w-10 h-0.5 bg-gradient-to-r from-amber-400 to-transparent rounded"
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 0.5 }}
        />
      )}
    </motion.div>
  );
}

export default function TypingIndicator() {
  const { state } = useChatContext();
  const [stageIdx, setStageIdx] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const startRef = useRef(Date.now());

  const agentTrace = state.agentTrace;
  const hasTrace = agentTrace && agentTrace.agents && agentTrace.agents.length > 0;

  // Rotate fallback stages
  useEffect(() => {
    if (hasTrace) return;
    const interval = setInterval(() => {
      setStageIdx((prev) => (prev + 1) % FALLBACK_STAGES.length);
    }, 2800);
    return () => clearInterval(interval);
  }, [hasTrace]);

  // Elapsed timer
  useEffect(() => {
    const timer = setInterval(() => {
      setElapsed(Math.floor((Date.now() - startRef.current) / 1000));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const stage = FALLBACK_STAGES[stageIdx];

  // Progress percentage (estimated)
  const progressPercent = useMemo(() => {
    if (!hasTrace) return Math.min(elapsed * 8, 90);
    const total = agentTrace.agents.length;
    const complete = agentTrace.agents.filter((a) => a.status === "done").length;
    return Math.min(Math.round((complete / total) * 100), 95);
  }, [hasTrace, agentTrace, elapsed]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="flex items-start gap-3 px-4 sm:px-6 max-w-3xl mx-auto w-full"
    >
      {/* Animated Om Avatar */}
      <div className="shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-orange-400 via-amber-500 to-red-500 flex items-center justify-center text-white text-sm font-bold shadow-lg om-pulse">
        ॐ
      </div>

      {/* Thinking Bubble */}
      <div className="glass rounded-2xl rounded-tl-sm px-5 py-4 shadow-md max-w-sm w-full relative overflow-hidden">
        {/* Shimmer overlay */}
        <div className="absolute inset-0 shimmer pointer-events-none" />

        {/* Progress bar */}
        <div className="relative z-10 w-full h-1 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden mb-3">
          <motion.div
            className="h-full bg-gradient-to-r from-amber-400 via-orange-500 to-red-500 rounded-full"
            initial={{ width: "0%" }}
            animate={{ width: `${progressPercent}%` }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          />
        </div>

        {hasTrace ? (
          /* Agent Pipeline View */
          <div className="relative z-10 space-y-1.5">
            <p className="text-[9px] text-[var(--color-text-secondary)] uppercase tracking-widest font-bold mb-2">
              🤖 Multi-Agent Pipeline
            </p>
            {agentTrace.agents.map((agent, i) => (
              <AgentPipelineStep
                key={agent.name}
                agent={agent}
                index={i}
                isActive={agent.status === "active"}
                isComplete={agent.status === "done"}
              />
            ))}
          </div>
        ) : (
          /* Fallback: Classic typing indicator */
          <>
            {/* Dots */}
            <div className="flex items-center gap-1.5 mb-2 relative z-10">
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  className="w-2.5 h-2.5 rounded-full bg-gradient-to-r from-amber-400 to-orange-500"
                  animate={{
                    scale: [1, 1.5, 1],
                    opacity: [0.35, 1, 0.35],
                  }}
                  transition={{
                    duration: 1.4,
                    repeat: Infinity,
                    delay: i * 0.2,
                    ease: "easeInOut",
                  }}
                />
              ))}
            </div>

            {/* Stage text with icon */}
            <div className="relative z-10 flex items-center gap-2">
              <AnimatePresence mode="wait">
                <motion.div
                  key={stageIdx}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 8 }}
                  transition={{ duration: 0.3 }}
                  className="flex items-center gap-1.5"
                >
                  <span className="text-sm">{stage.icon}</span>
                  <span className="text-[11px] text-[var(--color-text-secondary)] italic font-medium">
                    {stage.text}
                  </span>
                </motion.div>
              </AnimatePresence>
            </div>
          </>
        )}

        {/* Elapsed timer */}
        {elapsed > 2 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center justify-between mt-2.5 pt-2 border-t border-[var(--color-border)] relative z-10"
          >
            <p className="text-[9px] text-[var(--color-text-secondary)]">
              ⏱️ {elapsed}s elapsed
            </p>
            <p className="text-[9px] text-amber-600 dark:text-amber-400 font-semibold">
              {progressPercent}%
            </p>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}
