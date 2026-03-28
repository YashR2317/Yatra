import React from "react";

export default function InfoPanelSimple({ title, description }) {
  return (
    <div className="p-7 bg-[var(--color-cream)] h-1/2 overflow-y-auto">

      {/* Header */}
      <div className="pb-3">
        <h2
          className="text-2xl md:text-3xl font-semibold font-heading text-[var(--color-charcoal)]"
          style={{ lineHeight: 1.25, letterSpacing: "-0.01em" }}
        >
          {title}
        </h2>

        <p
          className="mt-3 leading-relaxed break-words font-body text-[var(--color-text-muted)]"
          style={{ fontSize: "0.94rem", lineHeight: 1.75 }}
        >
          {description}
        </p>

        {/* Decorative divider */}
        <div className="mt-8 h-px" style={{
          background: "linear-gradient(to right, var(--color-amber), var(--color-stone-border), transparent)"
        }} />

      </div>

    </div>
  );
}
