import React from "react";
import { motion } from "framer-motion";

/**
 * Reusable loading skeleton components.
 * Matches the Braj design system with theme-aware colors.
 *
 * Usage:
 *   <Skeleton width="200px" height="20px" />
 *   <SkeletonCard />
 *   <SkeletonGrid count={6} />
 *   <SkeletonPage />
 */

/* ── Base Skeleton Block ──────────────────────────────── */

export function Skeleton({
  width = "100%",
  height = "16px",
  borderRadius = "8px",
  className = "",
  style = {},
}) {
  return (
    <motion.div
      animate={{ opacity: [0.4, 0.7, 0.4] }}
      transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
      className={className}
      style={{
        width,
        height,
        borderRadius,
        backgroundColor: "var(--color-surface-alt)",
        ...style,
      }}
    />
  );
}

/* ── Skeleton Card (place/destination card) ───────────── */

export function SkeletonCard() {
  return (
    <div
      style={{
        borderRadius: "16px",
        overflow: "hidden",
        border: "1px solid var(--color-border)",
        backgroundColor: "var(--color-surface)",
      }}
    >
      {/* Image placeholder */}
      <Skeleton height="180px" borderRadius="0" />

      {/* Content */}
      <div style={{ padding: "16px", display: "flex", flexDirection: "column", gap: "10px" }}>
        <Skeleton width="70%" height="18px" />
        <Skeleton width="40%" height="14px" />
        <div style={{ display: "flex", gap: "8px", marginTop: "4px" }}>
          <Skeleton width="60px" height="24px" borderRadius="12px" />
          <Skeleton width="80px" height="24px" borderRadius="12px" />
        </div>
      </div>
    </div>
  );
}

/* ── Skeleton Grid (for card grid pages) ──────────────── */

export function SkeletonGrid({ count = 6, columns = 3 }) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: `repeat(${columns}, 1fr)`,
        gap: "1.5rem",
        width: "100%",
      }}
    >
      {Array.from({ length: count }, (_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  );
}

/* ── Skeleton Text Block (for article/detail pages) ───── */

export function SkeletonText({ lines = 4 }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
      {Array.from({ length: lines }, (_, i) => (
        <Skeleton
          key={i}
          width={i === lines - 1 ? "60%" : "100%"}
          height="14px"
        />
      ))}
    </div>
  );
}

/* ── Full Page Skeleton ───────────────────────────────── */

export function SkeletonPage() {
  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "var(--color-bg)",
        padding: "6rem 2rem 2rem",
        maxWidth: "1200px",
        margin: "0 auto",
      }}
    >
      {/* Page header */}
      <div style={{ marginBottom: "2rem" }}>
        <Skeleton width="300px" height="32px" style={{ marginBottom: "12px" }} />
        <Skeleton width="500px" height="16px" />
      </div>

      {/* Hero image */}
      <Skeleton
        width="100%"
        height="320px"
        borderRadius="16px"
        style={{ marginBottom: "2rem" }}
      />

      {/* Content grid */}
      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "2rem" }}>
        <div>
          <SkeletonText lines={6} />
          <div style={{ height: "2rem" }} />
          <SkeletonText lines={4} />
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          <SkeletonCard />
          <Skeleton height="120px" borderRadius="12px" />
        </div>
      </div>
    </div>
  );
}

export default Skeleton;
